const cons = require('./constant');
const buffMdl = require('./buff');
const JSON = require('circular-json');
const item = require('./items');

var printName = {};
printName.weapon = '무기';
printName.armor = '갑옷';
printName.subarmor = '보조방어구';
printName.trinket = '장신구';
printName.skillArtifact = '스킬 아티팩트';
printName.maxHp = '생명력';
printName.hpRegen = '생명력 재생';
printName.spRegen = 'SP 재생';
printName.spCharge = 'SP 충전';
printName.phyAtk = '물리공격력';
printName.magAtk = '마법공격력';
printName.crit = '치명';
printName.critDmg = '치명피해';
printName.phyReduce = '물리저항';
printName.magReduce = '마법저항';
printName.hit = '명중';
printName.evasion = '회피';
printName.dmgReduce = '피해감소';
printName.pierce = '관통';


module.exports.bmodule = Battlemodule;

// ---- 전투 상태 직렬화/복원 (DB 저장용) ----
// 역참조(effect.buff / effect.item / charLeft / charRight)는 제외하고 저장, 복원 시 다시 연결한다.
function serializeReplacer(k, v) {
  return (k === 'buff' || k === 'item' || k === 'charLeft' || k === 'charRight' || k === 'left' || k === 'right') ? undefined : v;
}
module.exports.serialize = function(bm, L, R, extra) {
  return JSON.stringify(Object.assign({ bm, L, R }, extra || {}), serializeReplacer);
};
// 직렬화에서 빠진 역참조(effect.buff / effect.item)를 다시 잇는다 — 안 하면 중첩 수를 못 읽어 1중첩으로 계산된다
function relinkRefs(L, R) {
  for (const c of [L, R]) {
    if (!c) continue;
    for (const b of (c.buffs || [])) for (const e of (b.effect || [])) e.buff = b;
    for (const k in (c.items || {})) { const it = c.items[k]; if (it && it.effect) for (const e of it.effect) e.item = it; }
  }
}
module.exports.relinkRefs = relinkRefs;
module.exports.restore = function(json) {
  const snap = JSON.parse(json);
  // modFunc(함수 배열)는 직렬화되지 않으므로 빈 인스턴스에서 한 번 만들어 둔 뒤 상태만 덮어쓴다
  const proto = new Battlemodule();
  const bm = Object.assign(proto, snap.bm);
  bm.modFunc = makeModFuncs();
  bm.charLeft = snap.L; bm.charRight = snap.R;
  relinkRefs(snap.L, snap.R);
  // 쿨다운 목록 재구성: 저장된 turnCooldown > 0 인 효과들을 다시 모은다
  const cds = [];
  for (const c of [snap.L, snap.R]) {
    for (const k in (c.items || {})) { const it = c.items[k]; if (it && it.effect) for (const e of it.effect) if (e.turnCooldown > 0) cds.push(e); }
    for (const b of (c.buffs || [])) for (const e of (b.effect || [])) if (e.turnCooldown > 0) cds.push(e);
    const sk = c.skillOri || c.skill;
    if (sk) { for (const b of (sk.base || [])) for (const e of ((b && b.effect) || [])) if (e.turnCooldown > 0) cds.push(e); for (const key of ['special', 'drive']) if (sk[key]) for (const e of (sk[key].effect || [])) if (e.turnCooldown > 0) cds.push(e); }
    for (const e of (c.startEffects || [])) if (e.turnCooldown > 0) cds.push(e);
  }
  bm.cooldowns = cds;
  return { bm, L: snap.L, R: snap.R, extra: snap };
};
  
function Battlemodule() {
  this.charLeft = {};
  this.charRight = {};
  this.result = '';
  this.turnCount = 0;  
  this.bpLeft; 
  this.bpRight;
  this.bpTurn;
  this.leftWin = 0;
  this.rightWin = 0;  
}

Battlemodule.prototype.doBattle = function (left, right, flag) {
  this.charLeft = left;
  this.charRight = right;
  this._doBattleStart(flag);

  while (!this._isBattleFinished()) {
    this._doBattleTurn();
  }

  return this._doBattleEnd(flag);
}

Battlemodule.prototype.procBattleStart = function (left, right, flag) {
  this.charLeft = left;
  this.charRight = right;
  this._doBattleStart(flag);

  return this.result;
}

Battlemodule.prototype.procBattleTurn = function (left, right, flag) {
  this._doBattleTurnManual(left, right);
  if (this.redecide) {
    return {redecide: true, result: this.result};
  }
  this._checkRevive();
  if (this._isBattleFinished()) {
    return this._doBattleEnd(flag);
  }
  return {result: this.result};
}

Battlemodule.prototype._doBattleStart = function (flag) {
  this.result = '';
  this.turnCount = 0;
  this.leftWin = 0;
  this.rightWin = 0;
  this.timeCrash = 0;
  this.cooldowns = [];

  this.modFunc = makeModFuncs();

  _initChar(this.charLeft, flag);
  _initChar(this.charRight, flag);

  calcStats(this.charLeft, this.charRight);
  calcStats(this.charRight, this.charLeft);

  if (flag === undefined) {
    this.charLeft.curHp = this.charLeft.stat.maxHp;
  } else {
    this.charLeft.curHp = this.charLeft.curHp ? this.charLeft.curHp : this.charLeft.stat.maxHp;
  }  
  if (flag === undefined) {
    this.charRight.curHp = this.charRight.stat.maxHp;
  } else {
    this.charRight.curHp = this.charRight.curHp ? this.charRight.curHp : this.charRight.stat.maxHp;
  }  
  this.charLeft.startHp = this.charLeft.curHp;
  this.charRight.startHp = this.charRight.curHp;

  this.printCharInfo(0);
  this.result += '<div class="turnWrap">';
  if (this.charLeft.startEffects) {
    this.resolveEffects(this.charLeft, this.charRight, this.charLeft.startEffects, null);
  }
  if (this.charRight.startEffects) {
    this.resolveEffects(this.charRight, this.charLeft, this.charRight.startEffects, null);
  }
  this.resolveEffects(this.charLeft, this.charRight, getItemEffects(this.charLeft, cons.ACTIVE_TYPE_BATTLE_START), null);
  this.resolveEffects(this.charRight, this.charLeft, getItemEffects(this.charRight, cons.ACTIVE_TYPE_BATTLE_START), null);
  calcStats(this.charLeft, this.charRight);
  calcStats(this.charRight, this.charLeft);
  this.result += '</div>';
}

function _applySetBonus(char) {
  var setBonusList = [];
  for (val in char.items) {
    if (val.setBonus) {
      setBonusList.push(val.setBonus.code);
    }
  }
}

// 무작위 장비의 능력치를 버프로 덧입힌다 (올림푸스 제어봉 / AI 센트럴 접근장치)
Battlemodule.prototype._borrowGear = function(winner, loser, rank, name) {
  const itemMdl = require('./items');
  const pool = itemMdl.list.filter(x => x && x.rank === rank && x.type <= 3 && x.stat && Object.keys(x.stat).length && !x.runEffect && !x.timeMult);
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const bo = buffMdl.getBuffData({ buffCode : 10611 }); bo.dur = null; bo.name = '빌려온 설계 - ' + pick.name;
  bo.effect = Object.entries(pick.stat).map(([k2, v]) => ({ active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_ADD, key : k2, value : v, name : bo.name }));
  bo.id = 10611 + Math.random();   // 중첩 누적을 위해 별개 버프로
  this.giveBuff(winner, winner, bo, false, name);
  this.result += '[ ' + name + ' ] 설계도가 펼쳐진다 — ' + pick.name + '의 능력치를 덧입었다!<br>';
};
// [네크로멘시](10534): 사망 시 최대 생명력 4%로 부활하고 그만큼 상대에게 마법 피해. 부활하면 소거
Battlemodule.prototype._checkRevive = function() {
  for (const [me, opp] of [[this.charLeft, this.charRight], [this.charRight, this.charLeft]]) {
    if (me.curHp > 0) continue;
    const hasShard = (me.items || {}) && Object.values(me.items || {}).some(it => it && it.shardRevive);   // 텍터스의 조각
    if (hasShard) {
      const cur = (me.buffs || []).find(x => x.id === 10713);
      const used = cur ? (cur.stack || 1) : 0;
      if (used < 3) {
        const bo = buffMdl.getBuffData({ buffCode : 10713 }); bo.dur = null; bo.stack = 1;
        this.giveBuff(me, me, bo, false, '텍터스의 조각');
        calcStats(me, opp); me.curHp = me.stat.maxHp;
        this.result += '<span class="skillDamage">[ 텍터스의 조각 ] 조각조각나도 다시 살아 움직인다! (' + me.name + ' 생명력 ' + me.stat.maxHp + ')</span><br>';
        continue;
      }
    }
    const guard = (me.buffs || []).find(x => x.id === 10550);   // [단장의 규약]: 생명력 1로 버팀
    if (guard) { me.curHp = 1; removeBuff(guard); this.result += '<span class="skillDamage">[ 단장의 규약 ] 효과로 ' + me.name + '이(가) 생명력 1로 버텼다!</span><br>'; continue; }
    const b = (me.buffs || []).find(x => x.id === 10534);
    if (!b) continue;
    const v = Math.max(1, Math.round(me.stat.maxHp * 0.04));
    me.curHp = v; removeBuff(b);
    const dmg = Math.max(1, Math.round(v * (1 - (opp.stat.magReduce || 0))));
    opp.curHp -= dmg;
    this.result += '<span class="skillDamage">[ 네크로멘시 ] 효과로 ' + me.name + '이(가) 생명력 ' + v + '로 되살아나 ' + opp.name + '에게 ' + dmg + ' 마법 피해!</span><br>';
  }
};
Battlemodule.prototype._doBattleEnd = function(flag) {
  var retObj = {};
  retObj.winnerLeft = (this.charLeft.curHp > 0);
  retObj.winnerRight = (this.charRight.curHp > 0);
  retObj.turnCount = this.turnCount;
  if (retObj.winnerLeft) {
    if (this.charLeft.rank < this.charRight.rank) {
      retObj.resultLeft = 25;
    } else if (this.charLeft.rank == this.charRight.rank) {
      retObj.resultLeft = 50;
    } else {
      retObj.resultLeft = 75;
    }
  } else {
    if (this.charLeft.rank < this.charRight.rank) {
      retObj.resultLeft = 20;
    } else if (this.charLeft.rank == this.charRight.rank) {
      retObj.resultLeft = 35;
    } else {
      retObj.resultLeft = 50;
    }
  }
  if (retObj.winnerRight) {
    if (this.charLeft.rank < this.charRight.rank) {
      retObj.resultRight = 50;
    } else if (this.charLeft.rank == this.charRight.rank) {
      retObj.resultRight = 30;
    } else {
      retObj.resultRight = 10;
    }
  } else {
    if (this.charLeft.rank < this.charRight.rank) {
      retObj.resultRight = 35;
    } else if (this.charLeft.rank == this.charRight.rank) {
      retObj.resultRight = 20;
    } else {
      retObj.resultRight = 5;
    }
  }
  this.result += '<div class="resultWrap"><div class="resultCharInfo">';
  this.resolveEffects(this.charLeft, this.charRight, getBuffEffects(this.charLeft, cons.ACTIVE_TYPE_BATTLE_END), retObj, true);
  this.resolveEffects(this.charRight, this.charLeft, getBuffEffects(this.charRight, cons.ACTIVE_TYPE_BATTLE_END), retObj, false);
  if (retObj.resultLeft < 0) {
    retObj.resultLeft = 0;
  }
  if (retObj.resultRight < 0) {
    retObj.resultRight = 0;
  }

  var expTurn = this.turnCount < 200 ? (this.turnCount > 20 ? this.turnCount : 20) : 200;
  var expRate = this.charLeft.rank > this.charRight.rank ? 1.2 : (this.charLeft.rank < this.charRight.rank ? 0.9 : 1);
  if (this.charLeft.expBoost && this.charLeft.expBoost > 0) {
    expRate += 0.3;
  }
  if (retObj.winnerLeft) {    
    retObj.expLeft = Math.round((30 + 0.35 * expTurn * expRate) * 0.75);
    this.result += '<span class="colorLeft">Victory!</span><br>' + this.charLeft.name + '의 승리입니다!<br>';
  } else {
    retObj.expLeft = Math.round((0.7 * (30 + 0.35 * expTurn * expRate)) * 0.75);
    this.result += '<span class="colorRight">Defeat...</span><br>' + this.charLeft.name + '의 패배입니다..<br>';    
  }
  if (flag === undefined) {
    this.result += '경험치를 ' + retObj.expLeft + ' 획득했습니다.<br>리설트 카드 게이지 ' + retObj.resultLeft + '%를 획득했습니다.';
  }
  this.result += '</div><div class="resultCharInfo">';
  var expRate = this.charRight.rank > this.charLeft.rank ? 1.2 : (this.charRight.rank < this.charLeft.rank ? 0.9 : 1);
  if (retObj.winnerRight) {
    retObj.expRight = Math.round((30 + 0.35 * expTurn * expRate) * 0.25);
    this.result += '<span class="colorLeft">Victory!</span><br>' + this.charRight.name + '의 승리입니다!<br>';
  } else {
    retObj.expRight = Math.round((0.7 * (30 + 0.35 * expTurn * expRate)) * 0.25);
    this.result += '<span class="colorRight">Defeat...</span><br>' + this.charRight.name + '의 패배입니다..<br>';    
  }
  if (flag === undefined) {
    this.result += '경험치를 ' + retObj.expRight + ' 획득했습니다.<br>리설트 카드 게이지 ' + retObj.resultRight + '%를 획득했습니다.';
  }
  this.result += '</div><br><div class="resultCharInfo">';
  this.result += '공격 성공 횟수 - ' + this.leftWin + ' : ' + this.rightWin;
  this.result += '</div></div>';
  retObj.result = this.result;
  retObj.leftInfo = this.charLeft;
  retObj.rightInfo = this.charRight;
  retObj.leftWin = this.leftWin;
  retObj.rightWin = this.rightWin;
  return retObj;
  
}

Battlemodule.prototype._doBattleTurnManual = function(left, right) {
  if (!this.redecide) {
    this.turnCount++;
    this.result += '<br><div class="turnWrap"><span class="turnCount">' + this.turnCount + '턴</span><br>';
  }
  this.redecide = false;
    if (left == right && !(findBuffByCode(this.charLeft, 10004).length > 0 || findBuffByCode(this.charLeft, 10005).length > 0)
        && !(findBuffByCode(this.charRight, 10004).length > 0 || findBuffByCode(this.charRight, 10005).length > 0)) {
      this.result += this.charLeft.name + '의 [ ' + this.charLeft.skill.base[left].name + ' ] vs ' + this.charRight.name + '의 [ ' + this.charRight.skill.base[right].name + ' ]</span><br>';
      this.result += '비겼습니다!<br>';
      this.resolveEffects(this.charLeft, this.charRight, getBuffEffects(this.charLeft, cons.ACTIVE_TYPE_TIE), null, this.charLeft.skill.base[left]);
      this.resolveEffects(this.charRight, this.charLeft, getBuffEffects(this.charRight, cons.ACTIVE_TYPE_TIE), null, this.charRight.skill.base[right]);
      this.resolveEffects(this.charLeft, this.charRight, getItemEffects(this.charLeft, cons.ACTIVE_TYPE_TIE), null, this.charLeft.skill.base[left]);
      this.resolveEffects(this.charRight, this.charLeft, getItemEffects(this.charRight, cons.ACTIVE_TYPE_TIE), null, this.charRight.skill.base[right]);
      if (this.checkDrive(this.charLeft, cons.ACTIVE_TYPE_TIE)) this.resolveDrive(this.charLeft, this.charRight, null);   // 무승부 드라이브 (한 몸이 된 쌍검)
      if (this.checkDrive(this.charRight, cons.ACTIVE_TYPE_TIE)) this.resolveDrive(this.charRight, this.charLeft, null);
      this.charLeft.lastSkillCode = this.charLeft.skill.base[left].code;
      this.charRight.lastSkillCode = this.charRight.skill.base[right].code;
      this.redecide = true;
      return;
    }
    // decide winner
    var winner;
    var loser;
    // decide skill
    var skillUsed = undefined;
    var skillFailed = undefined;
    var skillNum = 0;
    
    if (left == 0) {
      if (right == 1) {
        winner = this.charRight;
        loser = this.charLeft;
        skillUsed = winner.skill.base[1];
        skillFailed = loser.skill.base[0];
        skillNum = 1;
      } else {
        winner = this.charLeft;
        loser = this.charRight;
        skillUsed = winner.skill.base[0];
        skillFailed = loser.skill.base[2];
        skillNum = 0;        
      }
    } else if (left == 1) {
      if (right == 2) {
        winner = this.charRight;
        loser = this.charLeft;
        skillUsed = winner.skill.base[2];
        skillFailed = loser.skill.base[1];
        skillNum = 2;
      } else {
        winner = this.charLeft;
        loser = this.charRight;
        skillUsed = winner.skill.base[1];
        skillFailed = loser.skill.base[0];
        skillNum = 1; 
      }      
    } else if (left == 2) {
      if (right == 0) {
        winner = this.charRight;
        loser = this.charLeft;
        skillUsed = winner.skill.base[0];
        skillFailed = loser.skill.base[2];
        skillNum = 0;
      } else {
        winner = this.charLeft;
        loser = this.charRight;
        skillUsed = winner.skill.base[2];
        skillFailed = loser.skill.base[1];
        skillNum = 2; 
      }      
    }

    this.result += '<div class="skillResolutionWrap"><span class="skillUse">';
    if (findBuffByCode(winner, 10004).length > 0 || findBuffByCode(winner, 10005).length > 0) {
      if (findBuffByCode(loser, 10004).length > 0 || findBuffByCode(loser, 10005).length > 0) {
        this.resolveTurnBegin(winner, loser);
        this.result += '아무도 공격할 수 없다!</span><br>';
        this.resolveTurnEnd(winner, loser);
        this.result += '</div></div>';
        this.printCharInfo(1);
        return;
      } else {
        var tmp = loser;
        loser = winner;
        winner = tmp;
        tmp = skillFailed;
        skillFailed = skillUsed;
        skillUsed = tmp;
        this.result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';      
      }
    } else if (findBuffByCode(loser, 10004).length > 0 || findBuffByCode(loser, 10005).length > 0) {
      this.result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';     
    } else if (winner == this.charLeft) {
      this.result += '<span class="skillUseWinner">' + this.charLeft.name + '의 [ ' + skillUsed.name + ' ]</span> vs ' + this.charRight.name + '의 [ ' + skillFailed.name + ' ]</span><br>';
    } else {
      this.result += this.charLeft.name + '의 [ ' + skillFailed.name + ' ] vs <span class="skillUseWinner">' + this.charRight.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';
    }

    if (findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
      if (!this.redecide && skillFailed.effect[0] && skillFailed.effect[0].code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(skillFailed.effect[0].chance)) {
        this.result += '[ ' + skillFailed.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
        this.redecide = true;
        return;
      } 
      for (val of getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          this.result += '[ ' + val.buff.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
          this.redecide = true;
          this.resolveEffects(loser, winner, [val], null);
          return;
        }
      }
      for (val of getItemEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          this.result += '[ ' + val.item.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
          this.redecide = true;
          this.resolveEffects(loser, winner, [val], null);
          return;
        }
      }
    }
    
  for (val of findBuffByCode(winner, 10006)) {
    if (!val.type || val.type === skillUsed.type) {
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CANNOT_ATTACK), skillUsed);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CANNOT_ATTACK), skillUsed);
      this.resolveTurnBegin(winner, loser);
      this.result += '공격할 수 없다!</span><br>';
      this.resolveTurnEnd(winner, loser);
      this.result += '</div></div>';
      this.printCharInfo(1);
      return;
    }
  } 
  skillUsed.skillNum = skillNum;
  winner.curSkillCode = skillUsed ? skillUsed.code : undefined; loser.curSkillCode = skillFailed ? skillFailed.code : undefined;   // 이번 턴 사용 스킬
  if (winner.hpBeforeTurn === undefined) winner.hpBeforeTurn = winner.curHp; if (loser.hpBeforeTurn === undefined) loser.hpBeforeTurn = loser.curHp;
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillUsed);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillUsed);
  this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_LOSE), skillUsed);
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_SKILL_LOSE), skillUsed);

  if (this.checkDrive(winner, cons.ACTIVE_TYPE_SKILL_WIN, skillNum)) {
    this.resolveDrive(winner, loser, null);
  }
  if (this.checkDrive(loser, cons.ACTIVE_TYPE_SKILL_LOSE)) {
    this.resolveDrive(loser, winner, null);
  }
  
  winner.lastSkill = skillNum;
  loser.lastSkill = null;
  
  if (winner == this.charLeft) {
    this.leftWin++;
  } else {
    this.rightWin++;
  }

  // calc damage
  var damage = this.calcDamage(winner, loser, skillUsed);
  this.resolveTurnBegin(winner, loser);

  if (findBuffByCode(winner, 10011).length > 0 && getRandom(0.35)) {
    this.result += winner.name + getUnnun(winner.nameType) + ' 혼란에 빠졌다!<br>';
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CONFUSION), skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CONFUSION), skillUsed);
    var confused = loser;
    loser = winner;
  }
  
  if (damage.hit) {
    this.result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + skillUsed.name + ' ] ' + getUro(skillUsed.nameType) + ' ';
    this.result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + damage.value + '대미지를 입혔습니다!';
    if (damage.crit) {
      this.result += ' (치명타)';
    }
    this.result += '</span><br>';
    if (damage.crit) {
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
    }

    if (this.checkDrive(loser, cons.ACTIVE_TYPE_TAKE_HIT)) {
      this.resolveDrive(loser, winner, damage);
    }

    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    if (!(winner.buffs || []).some(b => b.id === 10665)) this.resolveEffects(winner, loser, skillUsed.effect, damage);   // [당연] 이면 부가 효과 없음
    if (skillFailed.loseEffect) {
      this.resolveEffects(loser, winner, skillFailed.loseEffect, damage);
    }
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_AFTER_SKILL), damage, skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_AFTER_SKILL), damage, skillUsed);
    if (this.checkDrive(winner, cons.ACTIVE_TYPE_ATTACK)) {
      this.resolveDrive(winner, loser, damage);
    }
    
    this.dealDamage(winner, loser, damage);
    winner.curSp += winner.stat.spCharge;
  } else { // evaded
    this.result += loser.name + getUnnun(loser.nameType) + ' 공격을 회피했습니다!<br>'; 
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_MISS), damage); 
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_MISS), damage); 
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_EVADE), damage); 
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_EVADE), damage); 
  }
  if (winner == loser) {
    loser = confused;
  }

  if (winner.skill.special && winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
      this.result += '<div class="specialSkill">[ ' + winner.name + ' ] Special Skill - [ ' + winner.skill.special.name + ' ] 발동!</div>';
      this.resolveEffects(winner, loser, winner.skill.special.effect);
      winner.curSp = 0;
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
      this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
    }
  }
  if (loser.skill.special && loser.skill.special.cost <= loser.curSp && findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (loser.skill.special.cost <= loser.curSp && findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
      this.result += '<div class="specialSkill">[ ' + loser.name + ' ] Special Skill - [ ' + loser.skill.special.name + ' ] 발동!</div>';
      this.resolveEffects(loser, winner, loser.skill.special.effect);
      loser.curSp = 0;
      this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
    }
  }

  this.resolveTurnEnd(winner, loser);
  for (const c of [winner, loser]) { if (!isFinite(c.curHp)) { console.log('[NaN curHp]', c.name, 'restore', c.hpBeforeTurn); c.curHp = isFinite(c.hpBeforeTurn) ? c.hpBeforeTurn : c.stat.maxHp; } if (!isFinite(c.curSp)) c.curSp = 0; c.hpBeforeTurn = c.curHp; }
  for (const [c, sk] of [[winner, skillUsed], [loser, skillFailed]]) {
    if (!sk) continue;
    c.sameSkillStreak = (c.lastSkillCode === sk.code) ? (c.sameSkillStreak || 1) + 1 : 1;
    if (c.firstSkillCode === undefined) c.firstSkillCode = sk.code;
  }
  if (skillUsed) winner.lastSkillCode = skillUsed.code;   // 직전 턴 스킬 기록 (선서의 장검 등)
  if (skillFailed) loser.lastSkillCode = skillFailed.code;

  this.result += '</div></div>';

  this.printCharInfo(1);
}

Battlemodule.prototype._doBattleTurn = function() {
  this.turnCount++;
  this.result += '<br><div class="turnWrap"><span class="turnCount">' + this.turnCount + '턴</span><br>';

  while (1) {
    // decide winner
    var winner = getRandom(0.5) ? this.charLeft : this.charRight;
    var loser = (winner === this.charLeft) ? this.charRight : this.charLeft;

    // decide skill
    var skillUsed = undefined;
    var skillFailed = undefined;
    var skillNum = 0;
    while (!skillUsed) {
      var rand = Math.random();
      if (rand < 0.33) {
        skillUsed = winner.skill.base[0];
        skillFailed = loser.skill.base[2];
      } else if (rand < 0.66) {
        skillUsed = winner.skill.base[1];
        skillFailed = loser.skill.base[0];
        skillNum = 1;
      } else if (rand < 0.99) {
        skillUsed = winner.skill.base[2];
        skillFailed = loser.skill.base[1];
        skillNum = 2;
      }
    }
    this.result += '<div class="skillResolutionWrap"><span class="skillUse">';
    if (findBuffByCode(winner, 10004).length > 0 || findBuffByCode(winner, 10005).length > 0) {
      if (findBuffByCode(loser, 10004).length > 0 || findBuffByCode(loser, 10005).length > 0) {
        this.resolveTurnBegin(winner, loser);
        this.result += '아무도 공격할 수 없다!</span><br>';
        this.resolveTurnEnd(winner, loser);
        this.result += '</div></div>';
        this.printCharInfo(1);
        return;
      } else {
        var tmp = loser;
        loser = winner;
        winner = tmp;
        tmp = skillFailed;
        skillFailed = skillUsed;
        skillUsed = tmp;
        this.result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';      
      }
    } else if (findBuffByCode(loser, 10004).length > 0 || findBuffByCode(loser, 10005).length > 0) {
      this.result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';     
    } else if (winner == this.charLeft) {
      this.result += '<span class="skillUseWinner">' + this.charLeft.name + '의 [ ' + skillUsed.name + ' ]</span> vs ' + this.charRight.name + '의 [ ' + skillFailed.name + ' ]</span><br>';
    } else {
      this.result += this.charLeft.name + '의 [ ' + skillFailed.name + ' ] vs <span class="skillUseWinner">' + this.charRight.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';
    }

    var redecide = false;
    if (findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
      if (!redecide && skillFailed.effect[0] && skillFailed.effect[0].code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(skillFailed.effect[0].chance)) {
        this.result += '[ ' + skillFailed.name + ' ] 효과로 스킬이 재선택됩니다!<br></div>';
        continue;
      } 
      for (val of getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          this.result += '[ ' + val.buff.name + ' ] 효과로 스킬이 재선택됩니다!<br></div>';
          redecide = true;
          this.resolveEffects(loser, winner, [val], null);
          break;
        }
      }
      for (val of getItemEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          this.result += '[ ' + val.item.name + ' ] 효과로 스킬이 재선택됩니다!<br></div>';
          redecide = true;
          this.resolveEffects(loser, winner, [val], null);
          break;
        }
      }
    }
    if (!redecide) {
      break;
    }
  }
  for (val of findBuffByCode(winner, 10006)) {
    if (!val.type || val.type === skillUsed.type) {
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CANNOT_ATTACK), skillUsed);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CANNOT_ATTACK), skillUsed);
      this.resolveTurnBegin(winner, loser);
      this.result += '공격할 수 없다!</span><br>';
      this.resolveTurnEnd(winner, loser);
      this.result += '</div></div>';
      this.printCharInfo(1);
      if (winner == this.charLeft) {
        this.leftWin++;
      } else {
        this.rightWin++;
      }
      return;
    }
  } 
  skillUsed.skillNum = skillNum;
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillUsed);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillUsed);
  this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_LOSE), skillUsed);
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_SKILL_LOSE), skillUsed);

  if (this.checkDrive(winner, cons.ACTIVE_TYPE_SKILL_WIN, skillNum)) {
    this.resolveDrive(winner, loser, null);
  }
  if (this.checkDrive(loser, cons.ACTIVE_TYPE_SKILL_LOSE)) {
    this.resolveDrive(loser, winner, null);
  }
  
  winner.lastSkill = skillNum;
  loser.lastSkill = null;
  if (winner == this.charLeft) {
    this.leftWin++;
  } else {
    this.rightWin++;
  }

  // calc damage
  var damage = this.calcDamage(winner, loser, skillUsed);
  this.resolveTurnBegin(winner, loser);

  if (findBuffByCode(winner, 10011).length > 0 && getRandom(0.35)) {
    this.result += winner.name + getUnnun(winner.nameType) + ' 혼란에 빠졌다!<br>';
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CONFUSION), skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CONFUSION), skillUsed);
    var confused = loser;
    loser = winner;
  }
  
  if (damage.hit) {
    this.result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + skillUsed.name + ' ] ' + getUro(skillUsed.nameType) + ' ';
    this.result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + damage.value + '대미지를 입혔습니다!';
    if (damage.crit) {
      this.result += ' (치명타)';
    }
    this.result += '</span><br>';
    if (damage.crit) {
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
    }

    if (this.checkDrive(loser, cons.ACTIVE_TYPE_TAKE_HIT)) {
      this.resolveDrive(loser, winner, damage);
    }

    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    if (!(winner.buffs || []).some(b => b.id === 10665)) this.resolveEffects(winner, loser, skillUsed.effect, damage);   // [당연] 이면 부가 효과 없음
    if (skillFailed.loseEffect) {
      this.resolveEffects(loser, winner, skillFailed.loseEffect, damage);
    }
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_AFTER_SKILL), damage, skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_AFTER_SKILL), damage, skillUsed);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_AFTER_SKILL_LOSE), damage, skillUsed);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_AFTER_SKILL_LOSE), damage, skillUsed);
    if (this.checkDrive(winner, cons.ACTIVE_TYPE_ATTACK)) {
      this.resolveDrive(winner, loser, damage);
    }
    
    this.dealDamage(winner, loser, damage);
    winner.curSp += winner.stat.spCharge;
  } else { // evaded
    this.result += loser.name + getUnnun(loser.nameType) + ' 공격을 회피했습니다!<br>'; 
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_MISS), damage); 
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_MISS), damage); 
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_EVADE), damage); 
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_EVADE), damage); 
  }
  if (winner == loser) {
    loser = confused;
  }

  if (winner.skill.special && winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0 && findBuffByCode(winner, 100102).length == 0) {
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
      this.result += '<div class="specialSkill">[ ' + winner.name + ' ] Special Skill - [ ' + winner.skill.special.name + ' ] 발동!</div>';
      this.resolveEffects(winner, loser, winner.skill.special.effect);
      winner.curSp = 0;
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
      this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
    }
  }
  if (loser.skill.special && loser.skill.special.cost <= loser.curSp && findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0 && findBuffByCode(loser, 100102).length == 0) {
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (loser.skill.special.cost <= loser.curSp && findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
      this.result += '<div class="specialSkill">[ ' + loser.name + ' ] Special Skill - [ ' + loser.skill.special.name + ' ] 발동!</div>';
      this.resolveEffects(loser, winner, loser.skill.special.effect);
      loser.curSp = 0;
      this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
    }
  }

  this.resolveTurnEnd(winner, loser);

  this.result += '</div></div>';

  this.printCharInfo(1);
}

Battlemodule.prototype.doHeal = function (winner, loser, amount) {
  var retObj = {};
  retObj.amount = amount;
  
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_DO_HEAL), retObj);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_DO_HEAL), retObj);
  this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_DO_HEAL_RECEIVE), retObj);
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_DO_HEAL_RECEIVE), retObj);

  retObj.amount = Math.round(retObj.amount);
  winner.curHp += retObj.amount;

  return retObj;
}

Battlemodule.prototype.calcDamage = function(winner, loser, skill) {
  var retObj = {};
  var isPhysical = (skill.type === cons.DAMAGE_TYPE_PHYSICAL);
  retObj.atkRat = isPhysical ? winner.stat.phyAtk : winner.stat.magAtk;
  retObj.reduce = (skill.type % 2 == 1) ? loser.stat.phyReduce : loser.stat.magReduce;
  retObj.randDmg = Math.random() * 0.1 + 1.0;
  retObj.skillRat = skill.damage;
  retObj.atkMin = isPhysical ? winner.stat.phyAtkMin : winner.stat.magAtkMin;
  retObj.atkMax = isPhysical ? winner.stat.phyAtkMax : winner.stat.magAtkMax;
  
  var diff = retObj.atkMax - retObj.atkMin;
  retObj.diffDmg = Math.floor(Math.random() * diff) + retObj.atkMin;
  var hitUsed = winner.stat.hit;
  if (skill.hitMod) {
    hitUsed *= skill.hitMod;
  }
  retObj.hit = getRandom(hitUsed - loser.stat.evasion);
  if (retObj.hit && loser.stat.forceEvade && Math.random() < loser.stat.forceEvade) { retObj.hit = false; retObj.forced = 'evade'; }   // 아니아니마
  else if (!retObj.hit && winner.stat.forceHit && Math.random() < winner.stat.forceHit) { retObj.hit = true; retObj.forced = 'hit'; }   // 맞아맞아마
  var critMod = loser.stat.evasion < 0 ? -loser.stat.evasion : 0;
  retObj.crit = getRandom(winner.stat.crit + critMod);
  retObj.type = skill.type;
  retObj.value = (retObj.skillRat * retObj.atkRat) * (1 - retObj.reduce);
  retObj.critDmg = winner.stat.critDmg;

  if (skill.calcEffect) {
    this.resolveEffects(winner, loser, skill.calcEffect, retObj, skill);
  }
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CALC_DAMAGE), retObj, skill);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CALC_DAMAGE), retObj, skill);
  if (this.checkDrive(winner, cons.ACTIVE_TYPE_CALC_DAMAGE, loser) && skill.type != cons.DAMAGE_TYPE_ABSOLUTE) {
    this.resolveDrive(winner, loser, retObj);
  }
  this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE), retObj, skill);
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE), retObj, skill);

  if (skill.type !== cons.DAMAGE_TYPE_ABSOLUTE && skill.code) {
    for (val of findBuffByCode(loser, 10005)) {
      this.result += '[ ' + val.buff.name + ' ] 효과로 치명타가 적용됩니다!<br>';
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SLEEP), retObj, skill);
      this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SLEEP), retObj, skill);
      this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_SLEEP), retObj, skill);
      this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_SLEEP), retObj, skill);
      retObj.crit = true;
      break;
    }
  }

  retObj.atkRat += retObj.diffDmg;
  if (retObj.type === cons.DAMAGE_TYPE_ABSOLUTE) {
    retObj.atkRat = 1;
    retObj.reduce = 0;
    retObj.crit = false;
  } else if (retObj.type === cons.DAMAGE_TYPE_PHYSICAL_FIXED || retObj.type === cons.DAMAGE_TYPE_MAGICAL_FIXED) {
    retObj.atkRat = 1;
    retObj.type -= 2;
  }
  
  if (retObj.reduce > 0) {
    retObj.reduce = winner.stat.pierce < retObj.reduce ? (retObj.reduce - winner.stat.pierce) : 0;
  }
  var damage = (retObj.skillRat * retObj.atkRat) * (1 - retObj.reduce);
  if (retObj.crit) {
    damage *= retObj.critDmg;
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_DEAL_DAMAGE_CRIT));
  }
  if (skill.type !== cons.DAMAGE_TYPE_ABSOLUTE) {
    damage -= loser.stat.dmgReduce;
    damage *= retObj.randDmg;
  }
  retObj.value = damage > 0 ? Math.round(damage) : 0;
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_AFTER_CALC_DAMAGE), retObj, skill);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_AFTER_CALC_DAMAGE), retObj, skill);

  return retObj;
}

Battlemodule.prototype.dealDamage = function(src, dst, damage) {
  if (damage && damage.value > 0) dst.hitThisTurn = true;
  if (damage && dst.stat && dst.stat.hitCapPct && damage.value > dst.stat.maxHp * dst.stat.hitCapPct) {   // 정상화의 신: 과한 한 방의 초과분 절반
    const cap = dst.stat.maxHp * dst.stat.hitCapPct; const before = damage.value;
    damage.value = Math.round(cap + (damage.value - cap) / 2);
    this.result += '[ 정상화의 신 ] 불합리한 피해를 정상화했다! (' + before + ' → ' + damage.value + ')<br>';
  }
  if (!isFinite(damage.value)) { console.log('[NaN damage]', JSON.stringify({ src: src && src.name, dst: dst && dst.name, type: damage.type, atkRat: damage.atkRat, reduce: damage.reduce, skillRat: damage.skillRat })); damage.value = 0; }
  var damageShield = Math.round(damage.value / (1- damage.reduce));
  var shielded = false;
  for (val of getBuffEffects(dst, cons.ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE)) {
    if (val.code === cons.EFFECT_TYPE_REDUCE_SHIELD_DAMAGE) {
      damageShield *= (1 - val.value * dst.stat[val.key]);
    }
  }
  damageShield = Math.round(damageShield);
  
  for (val of getBuffEffects(dst, cons.ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE)) {
    if (val.code === cons.EFFECT_TYPE_SHIELD) {
      if (val.value > damageShield) {
        val.value -= damageShield;
        return;
      } else {
        damageShield -= val.value;
        val.value = 0;
        removeBuff(val.buff);
        shielded = true;
      } 
    }
  }
  if (src !== dst && !damage.noProc) {
    this.resolveEffects(src, dst, getBuffEffects(src, cons.ACTIVE_TYPE_DEAL_DAMAGE), damage);
    this.resolveEffects(src, dst, getItemEffects(src, cons.ACTIVE_TYPE_DEAL_DAMAGE), damage);   // 아이템의 '피해를 줄 때' 효과 (누락돼 있던 훅)
    this.resolveEffects(dst, src, getItemEffects(dst, cons.ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE), damage);
  }
  var damageDealt = shielded ? damageShield : damage.value;
  dst.lastDamage = damageDealt;
  src.maxDamageDone = src.maxDamageDone < damageDealt ? damageDealt : src.maxDamageDone;
  src.damageDone += damageDealt;
  dst.maxDamageTaken = dst.maxDamageTaken < damageDealt ? damageDealt : dst.maxDamageTaken;
  dst.damageTaken += damageDealt;
  
  var ruiDamage = damageDealt;
  var ruiBuff = findBuffByIds(dst, [201789]);
  if (ruiBuff.length > 0) {
    if (ruiBuff[0].stack * 3 >= ruiDamage) {
      ruiBuff[0].stack -= Math.floor(ruiDamage / 3);
      ruiDamage = 0;
    } else {
      ruiDamage -= ruiBuff[0].stack * 3;
      removeBuff(ruiBuff[0]);
    }
  }
  ruiBuff = findBuffByIds(dst, [201788]);
  if (ruiBuff.length > 0) {
    if (ruiBuff[0].stack * 2 >= ruiDamage) {
      ruiBuff[0].stack -= Math.floor(ruiDamage / 2);
      ruiDamage = 0;
    } else {
      ruiDamage -= ruiBuff[0].stack * 2;
      removeBuff(ruiBuff[0]);
    }
  }
  ruiBuff = findBuffByIds(dst, [201791]);
  if (ruiBuff.length > 0) {
    if (ruiBuff[0].stack >= ruiDamage) {
      ruiBuff[0].stack -= ruiDamage;
      ruiDamage = 0;
    } else {
      ruiDamage -= ruiBuff[0].stack;
      removeBuff(ruiBuff[0]);
    }
  }
  if (!isNaN(damageDealt)) { 
    dst.curHp -= damageDealt;
  }
}

Battlemodule.prototype.resolveEffects = function(winner, loser, effects, damage, skill) {
  for (var eff of effects) {
    var stackMpl = eff.noStack ? 1 : (eff.buff ? (eff.buff.stack ? eff.buff.stack : 1) : 1);
    if (stackMpl > eff.maxApply) {
      stackMpl = eff.maxApply;
    }
    var chance = eff.chance ? eff.chance : 1;
    if (eff.chance) {
      if (loser && loser.stat && loser.stat.ruleBreaker && [cons.EFFECT_TYPE_OPP_BUFF, cons.EFFECT_TYPE_OPP_SP, cons.EFFECT_TYPE_OPP_HP, cons.EFFECT_TYPE_ADD_HIT].includes(eff.code)) chance *= (1 - loser.stat.ruleBreaker);
      if (winner && winner.stat && winner.stat.ruleBreaker) chance *= (1 - winner.stat.ruleBreaker);
    }
    chance *= (1 + winner.stat.chanceEnh);
    var moonBuff = eff.isItem ? (winner.buffs || []).find(x => x.id === 10590) : null;   // [태초의 흔들리는 달빛]
    if (moonBuff) chance *= 3;
    if (eff.chanceAddKey) {
      var factor = eff.chanceAddKeyFactor ? eff.chanceAddKeyFactor : 1;
      if (eff.chanceAddKey == 'hit') {
        chance += winner.stat.hit > 1 ? (winner.stat.hit - 1) : 0;
      } else {
        chance += (winner.stat[eff.chanceAddKey] || 0) * factor;   // 키에 곱셈을 하던 오타 — chance가 NaN이 되어 확률 효과가 전혀 발동하지 않았다
      }
    }
    if (eff.chanceSubKeyOpp) {
      chance -= loser.stat[eff.chanceSubKeyOpp];
    }
    if (eff.chanceStack) {
      chance *= stackMpl;
    }
    if (eff.cooldown && eff.cooldown > 0) {
      eff.cooldown--;
      continue;
    }
    if (eff.turnCooldown && eff.turnCooldown > 0) {
      continue;
    }
    if (!getRandom(chance)) {
      continue;
    }
    if (eff.onCrit && !damage.crit) {
      continue;
    }
    if (eff.critNot && damage.crit) {
      continue;
    }
    if (eff.chkNot && findBuffByIds(winner, eff.chkNot).length > 0) {
      continue;
    }
    if (eff.chk && findBuffByIds(winner, eff.chk).length === 0) {
      continue;
    }
    if (eff.chkAll && findBuffByIds(winner, eff.chkAll).length < eff.chkAll.length) {
      continue;
    }
    if (eff.chkOppNot && findBuffByIds(loser, eff.chkOppNot).length > 0) {
      continue;
    }
    if (eff.chkOpp && findBuffByIds(loser, eff.chkOpp).length === 0) {
      continue;
    }
    if (eff.chkBuffStack && (findBuffByIds(winner, eff.chkBuffStack.id).length != 0 && findBuffByIds(winner, eff.chkBuffStack.id)[0].stack > eff.chkBuffStack.stack)) {
      continue;
    }
    if (eff.chkHp && winner.curHp > (winner.stat.maxHp * eff.chkHp)) {
      continue;
    }
    if (eff.chkHpOver && winner.curHp < (winner.stat.maxHp * eff.chkHpOver)) {
      continue;
    }
    if (eff.chkOppHp && loser.curHp > (loser.stat.maxHp * eff.chkOppHp)) {
      continue;
    }
    if (eff.chkSp && winner.curSp < eff.chkSp) {
      continue;
    }
    if (eff.chkTurn && this.turnCount < eff.chkTurn) {
      continue;
    }
    if (eff.chkTurnUnder && this.turnCount > eff.chkTurnUnder) {   // N턴 이내에만
      continue;
    }
    if (eff.chkSameSkill && (!skill || winner.lastSkillCode !== skill.code)) {   // 직전 턴과 같은 스킬
      continue;
    }
    if (eff.chkOppHpHigher && (loser.curHp / loser.stat.maxHp) <= (winner.curHp / winner.stat.maxHp)) {   // 상대 체력 비율이 더 높을 때
      continue;
    }
    if (eff.chkStreak && (winner.streak || 0) < eff.chkStreak) {   // 자신 N연승 이상
      continue;
    }
    if (eff.chkOppStreak && (loser.streak || 0) < eff.chkOppStreak) {   // 상대 N연승 이상
      continue;
    }
    if (eff.maxUses && (eff.uses || 0) >= eff.maxUses) {   // 전투당 사용 상한 (아이템은 전투마다 복사되므로 자동 초기화)
      continue;
    }
    if (eff.chkOppHpUnder && (loser.curHp / loser.stat.maxHp) > eff.chkOppHpUnder) {   // 상대 체력 비율이 N 이하일 때만
      continue;
    }
    if (eff.chkOppHpOver && (loser.curHp / loser.stat.maxHp) <= eff.chkOppHpOver) {   // 상대 체력 비율이 N 초과일 때만
      continue;
    }
    if (eff.chkNotFresh && eff.buff && eff.buff.gainTurn === this.turnCount) {   // 이번 턴에 얻은 버프면 발동하지 않음
      continue;
    }
    if (eff.chkDmgType !== undefined && !(damage && damage.type === eff.chkDmgType)) {   // 받은/준 피해의 타입
      continue;
    }
    if (eff.chkDmgPct && !(damage && damage.value >= winner.stat.maxHp * eff.chkDmgPct)) {   // 받은 피해가 최대 생명력의 N 이상
      continue;
    }
    if (eff.chkOppHasSlot && !(loser.items && loser.items[eff.chkOppHasSlot] && loser.items[eff.chkOppHasSlot].name)) {
      continue;
    }
    if (eff.chkOppNoSlot && (loser.items && loser.items[eff.chkOppNoSlot] && loser.items[eff.chkOppNoSlot].name)) {
      continue;
    }
    if (eff.chkSameSkillStreak && !(skill && winner.lastSkillCode === skill.code && (winner.sameSkillStreak || 0) >= eff.chkSameSkillStreak)) {
      continue;
    }
    if (eff.chkFirstSkill && !(skill && winner.firstSkillCode !== undefined && winner.firstSkillCode === skill.code)) {
      continue;
    }
    if (eff.chkOppIsMonster && !loser.isMonster) {
      continue;
    }
    if (eff.chkOppIsFallen && !loser.isFallen) {
      continue;
    }
    if (eff.chkMySkillIdx !== undefined && !(winner.skill && winner.skill.base[eff.chkMySkillIdx] && winner.skill.base[eff.chkMySkillIdx].code === winner.curSkillCode)) {   // 이번 턴 자신이 낸 스킬 슬롯
      continue;
    }
    if (eff.needStack) {   // 자신의 특정 버프 중첩이 N 이상
      const b = (winner.buffs || []).find(x => x.id === eff.needStack.buffCode);
      if (!b || (b.stack || 1) < eff.needStack.stack) continue;
    }
    if (eff.needOppStack) {   // 상대의 특정 버프 중첩이 N 이상
      const b = (loser.buffs || []).find(x => x.id === eff.needOppStack.buffCode);
      if (!b || (b.stack || 1) < eff.needOppStack.stack) continue;
    }
    if (eff.chkDmgType && eff.chkDmgType !== damage.type) {
      continue;
    }
    if (eff.chkDmgMultiple && (damage.value % eff.chkDmgMultiple !== 0 || damage.value == 0)) {
      continue;
    }
    if (eff.chkStack && eff.chkStack > eff.buff.stack) {
      continue;
    }
    if (eff.chkStackUnder && eff.chkStackUnder <= eff.buff.stack) {
      continue;
    }
    const checkInv = function(n, e) {
      return e.id == n;
    }
    if (eff.chkInventory && !winner.inventory.some(checkInv.bind(this, eff.chkInventory))) {
      continue;
    }
    if (eff.chkInventories) {
      var checkVal = true;
      for (itmChk of eff.chkInventories) {
        checkVal = checkVal && winner.inventory.some(checkInv.bind(this, itmChk));
      }
      if (!checkVal) {
        continue;
      }
    }
    if (eff.chkEquip && !Object.values(winner.items).some(checkInv.bind(this, eff.chkEquip))) {
      continue;
    }
    if (eff.chkPercentDamage && damage.value < winner.stat.maxHp * eff.chkPercentDamage) {
      continue;
    }
    if (eff.chkTitle && loser.title !== eff.chkTitle) {
      continue;
    }
    if (eff.chkName && loser.name !== eff.chkName) {
      continue;
    }
    if (eff.chkSkillCode && skill.code !== eff.chkSkillCode) {
      continue;
    }
    if (eff.chkBuffCode && damage.id !== eff.chkBuffCode) {
      continue;
    }
    const isLeft = (winner == this.charLeft);
    if (eff.chkLessAttack && ((isLeft && this.leftWin >= this.rightWin) || (!isLeft && this.leftWin <= this.rightWin))) {
      continue;
    }
    if (eff.chkMoreAttack && ((isLeft && this.leftWin <= this.rightWin) || (!isLeft && this.leftWin >= this.rightWin))) {
      continue;
    }
    if (eff.chkEqualAttack && this.leftWin != this.rightWin) {
      continue;
    }
    if (eff.chkWinLast && !winner.winLast) {
      continue;
    }
    if (eff.chkLoseLast && winner.winLast) {
      continue;
    }
    if (eff.chkSkillNum !== undefined && skill.skillNum !== eff.chkSkillNum) {
      continue;
    }
    if (eff.chkStartHpOdd !== undefined && winner.startHp % 2 != eff.chkStartHpOdd) {
      continue;
    }
    if (eff.code === cons.EFFECT_TYPE_SELF_BUFF || eff.code === cons.EFFECT_TYPE_OPP_BUFF) {
      if (eff.direct) {
        // 되비침: 무효화한 상태이상을 절반 턴(올림)으로 상대에게. 반사된 것은 다시 반사되지 않고, 자기 자신에게는 돌려주지 않는다
        if (damage && !damage.reflected && loser && loser !== winner) {
          const refl = JSON.parse(JSON.stringify(damage));
          refl.dur = Math.max(1, Math.ceil((damage.dur || 1) * eff.durMod));
          refl.reflected = true;
          this.giveBuff(winner, loser, refl, true);
        }
        continue;
      }
      var buffObj = buffMdl.getBuffData(eff);
      buffObj.dur = eff.buffDurDiv ? Math.max(1, Math.round(((winner.skill.special && winner.skill.special.cost) || 0) / eff.buffDurDiv)) : eff.buffDur;
      if (eff.stack && buffObj.stackType === 2) buffObj.stack = eff.stack;   // 여러 중첩을 한 번에 부여
      if (eff.addEffect) {
        buffObj.effect = buffObj.effect.concat(eff.addEffect);
      }
      
      if (buffObj.id === 201713) {
        buffObj.effect[0].value = Math.round((winner.stat.maxHp - winner.curHp) * 0.05);
        buffObj.effect[1].value = Math.round(winner.base.phyAtk * (0.5 + winner.stat.evasion));
        buffObj.effect[2].value = Math.round(winner.base.magAtk * (0.5 + winner.stat.evasion));
      } else if (buffObj.id === 201714) {
        this.bpLeft = JSON.stringify(this.charLeft);
        this.bpRight = JSON.stringify(this.charRight);
        this.bpTurn = this.turnCount;
        buffObj.name += this.turnCount + '턴';
      } else if (buffObj.id === 201715 && !eff.noStack) {
        this.timeCrash++;
        buffObj.stack = this.timeCrash; 
      } else if (buffObj.id === 201719) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * winner.stat.maxHp);
      } else if (buffObj.id === 201727) {
        buffObj.effect[0].value *= findBuffByIds(winner, eff.buffTarget).length;
      } else if (buffObj.id === 201757) {
        buffObj.effect[0].value *= winner.lastDamage;
      } else if (buffObj.id === 201781) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * winner.stat.maxHp * stackMpl);
        this.result += winner.name + getUnnun(winner.nameType) + ' 보호막을 ' + buffObj.effect[0].value + ' 획득했다!<br>';
      } else if (buffObj.id === 2017105) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * (winner.stat.maxHp - winner.curHp) * stackMpl);
        this.result += winner.name + getUnnun(winner.nameType) + ' 보호막을 ' + buffObj.effect[0].value + ' 획득했다!<br>';
      } else if (buffObj.id === 2017106) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * (winner.stat.phyAtk + winner.stat.magAtk + winner.stat.phyAtkMin + winner.stat.magAtkMin + Math.floor(Math.random() * (winner.stat.magAtkMax - winner.stat.magAtkMin)) + Math.floor(Math.random() * (winner.stat.phyAtkMax - winner.stat.phyAtkMin))) * stackMpl);
        this.result += winner.name + getUnnun(winner.nameType) + ' 보호막을 ' + buffObj.effect[0].value + ' 획득했다!<br>';
      } else if (buffObj.id === 10107) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * (winner.stat.maxHp) * stackMpl);
      }

      if (eff.setStack) {        
        var valueUsed = eff.setStack * stackMpl;
        if (eff.isPercentRawDamage) {   // 저항 적용 전 피해량 기준 (뤼순 창 훈련)
          const red = (damage.reduce && damage.reduce < 1) ? damage.reduce : 0;
          valueUsed *= Math.round(damage.value / (1 - red));
        } else if (eff.isPercentDamage) {
          valueUsed *= damage.value;
        } else if (eff.addDamage) {
          for (const neff of eff.addDamage) {
            var tempObj = {};
            tempObj.damage = neff.value * stackMpl;
            tempObj.type = neff.type;
            var damageAdd = this.calcDamage(winner, loser, tempObj);
            valueUsed += damageAdd.value;
          }
        } else if (eff.isHpPercentage) {
          valueUsed *= (winner.curHp / winner.stat.maxHp);
        } else if (eff.isTurnCount) {
          valueUsed *= winner.turnCount;
        }
        if (eff.stackBase) {
          valueUsed += eff.stackBase;
        }
        buffObj.stack = Math.round(valueUsed);
      }
      var recv = (eff.code === cons.EFFECT_TYPE_SELF_BUFF) ? winner : loser;
      this.giveBuff(winner, recv, buffObj, true, eff.name);

    } else if (eff.code === cons.EFFECT_TYPE_SELF_SP || eff.code === cons.EFFECT_TYPE_SELF_HP || eff.code === cons.EFFECT_TYPE_OPP_SP || eff.code === cons.EFFECT_TYPE_OPP_HP) {
      var valueUsed;
      var dst = eff.code === cons.EFFECT_TYPE_OPP_SP || eff.code === cons.EFFECT_TYPE_OPP_HP ? loser : winner;
      
      function _setupValue(eff, valueUsed) {
        if (eff.buffTarget) {
          valueUsed *= findBuffByIds(winner, eff.buffTarget).length;
        }
        if (eff.isPercentChar) {
          valueUsed *= winner[eff.percentKey];
        } else if (eff.isPercentStat) {
          valueUsed *= winner.stat[eff.percentKey];
        } else if (eff.isPercentBase) {
          valueUsed *= winner.base[eff.percentKey];
        } else if (eff.isPercentDamage) {
          valueUsed *= damage.value;
        } else if (eff.isPercentOpp) {
          valueUsed *= loser[eff.percentKey];
        } else if (eff.isPercentOppStat) {
          valueUsed *= loser.stat[eff.percentKey];
        } else if (eff.isPercentSkillUsed) {
          valueUsed *= ((skill && skill[eff.percentKey]) || 0);
        } else if (eff.isPercentHpLost) {
          valueUsed *= (winner.stat.maxHp - winner.curHp);
        } else if (eff.isPercentOppHpLost) {
          valueUsed *= (loser.stat.maxHp - loser.curHp);
        } else if (eff.isPercentBuffValue) {
          valueUsed *= damage.effect[0].value;
        } else if (eff.isPercentSkill) {
          valueUsed *= winner.skill[eff.skillKey][eff.percentKey];
        }
        
        if ((eff.percentKey == 'maxHp' || eff.percentKey == 'curHp') && dst.boss) {
          valueUsed *= (1 - dst.boss);
        }
        
        return valueUsed;
      }
      
      if (eff.value !== undefined && eff.value !== null) {   // 0도 유효한 값 (0으로 두면 NaN이 되던 문제)
        valueUsed = _setupValue(eff, eff.value);
        
        if (eff.addAttackCount) {
          const atkCnt = (isLeft ? this.leftWin : this.rightWin);
          valueUsed *= (atkCnt - (this.atkCntBefore ? this.atkCntBefore : 0));
          this.atkCntBefore = atkCnt;
        }
      } else if (eff.factors) {
        valueUsed = 0;
        for (fact of eff.factors) {
          valueUsed += _setupValue(fact, fact.value);
        }
      }
      valueUsed = Math.round(valueUsed * stackMpl);
      if (!isFinite(valueUsed)) {   // NaN 방어: 원인 추적용 로그 남기고 무시
        console.log('[NaN effect]', JSON.stringify({ name: eff.name, code: eff.code, value: eff.value, flags: Object.keys(eff).filter(k => k.startsWith('isPercent')), dmg: damage && damage.value, who: winner && winner.name }));
        continue;
      }
      if (valueUsed > eff.maxApply) {
        valueUsed = eff.maxApply;
      }
      if (valueUsed < eff.minApply) {
        valueUsed = eff.minApply;
      }
      var target = 'SP';
      if (eff.code === cons.EFFECT_TYPE_SELF_SP) {
        winner.curSp += valueUsed;
      } else if (eff.code === cons.EFFECT_TYPE_OPP_SP) {
        loser.curSp += valueUsed;
        if (loser.curSp < 0) {
          loser.curSp = 0;
        }
      } else if (eff.code === cons.EFFECT_TYPE_OPP_HP) {
        var ret = this.doHeal(loser, winner, valueUsed);
        valueUsed = ret.amount;
        target = 'HP';      
      } else {
        var ret = this.doHeal(winner, loser, valueUsed);
        valueUsed = ret.amount;
        target = 'HP';      
      }
      var source = eff.name ? ' [ ' + eff.name + ' ] 효과로 ' : ' ';
      var act = (valueUsed > 0) ? '회복했다' : '잃었다';
      this.result += dst.name + getUnnun(dst.nameType) + source + target + '를 ' + Math.abs(valueUsed) + ' ' + act + '!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_ADD_HIT || eff.code === cons.EFFECT_TYPE_SELF_HIT || eff.code === cons.EFFECT_TYPE_OPP_HIT || eff.code === cons.EFFECT_TYPE_OPP_SELF_HIT) {
      var tempObj = {};
      tempObj.damage = eff.value * stackMpl;
      tempObj.type = eff.type;
      tempObj.hitMod = eff.hitMod;
      var source = eff.code === cons.EFFECT_TYPE_OPP_HIT || eff.code === cons.EFFECT_TYPE_OPP_SELF_HIT ? loser : winner;
      var target = eff.code === cons.EFFECT_TYPE_ADD_HIT || eff.code === cons.EFFECT_TYPE_OPP_SELF_HIT ? loser : winner;
      
      if (eff.isPercentChar) {
        tempObj.damage *= source[eff.percentKey];
      } else if (eff.isPercentStat) {
        tempObj.damage *= source.stat[eff.percentKey];
      } else if (eff.isPercentBase) {
        tempObj.damage *= source.base[eff.percentKey];
      } else if (eff.isPercentDamage) {
        tempObj.damage *= damage.value;
      } else if (eff.isPercentOpp) {
        tempObj.damage *= target[eff.percentKey];
      } else if (eff.isPercentOppStat) {
        tempObj.damage *= target.stat[eff.percentKey];
      } else if (eff.isPercentShield) {
        tempObj.damage *= getShieldValue(source);
      } else if (eff.overPercentShield) {
        tempObj.damage = getShieldValue(source) - tempObj.damage * source.curHp;
      } else if (eff.overPercentShield2) {
        tempObj.damage *= (getShieldValue(source) - 0.2 * source.curHp);
      }
      
      if (eff.doRandomize) {
        tempObj.damage *= eff.doRandomize[0] + (eff.doRandomize[1] - eff.doRandomize[0]) * Math.random();
      }
      
      if ((eff.percentKey == 'maxHp' || eff.percentKey == 'curHp') && target.boss) {
        tempObj.damage *= (1 - target.boss);
      }
      
      if (eff.buffTarget) {
        if (eff.separate) {
          for (val of findBuffByIds(source, eff.buffTarget)) {
            var damageAdd = this.calcDamage(source, target, tempObj); damageAdd.noProc = true;   // 추가타는 '피해를 줄 때' 효과를 다시 부르지 않음

            this.result += '<span class="skillDamage">' + target.name + getUnnun(target.nameType) + ' 추가로 ' + damageAdd.value + '대미지를 입었습니다!';
            if (damageAdd.crit) {
              this.result += ' (치명타)';
            }
            this.result += '</span><br>';
            this.dealDamage(source, target, damageAdd);            
          }
          continue;
        } else {
          tempObj.damage *= findBuffByIds(source, eff.buffTarget).length;
        }
      }
      var damageAdd = this.calcDamage(source, target, tempObj); damageAdd.noProc = true;   // 추가타는 '피해를 줄 때' 효과를 다시 부르지 않음

      if (!eff.hitMod || damageAdd.hit) {
        var sourceTxt = eff.name ? ' [ ' + eff.name + ' ] 효과로 ' : ' 추가로 ';
        this.result += '<span class="skillDamage">' + target.name + getUnnun(target.nameType) + sourceTxt + damageAdd.value + '대미지를 입었습니다!';
        if (damageAdd.crit) {
          this.result += ' (치명타)';
        }
        this.result += '</span><br>';
        this.dealDamage(source, target, damageAdd);
      } else {
        this.result += '공격이 빗나갔습니다!<br>';
      }
    } else if (eff.code === cons.EFFECT_TYPE_SHIELD_FROM_DAMAGE) {
      var buffObj = buffMdl.getBuffData(eff);
      buffObj.dur = eff.buffDurDiv ? Math.max(1, Math.round(((winner.skill.special && winner.skill.special.cost) || 0) / eff.buffDurDiv)) : eff.buffDur;
      
      for (val of findBuffByCode(winner, cons.EFFECT_TYPE_CHANGE_VALUE)) {
        buffObj.effect[0].value += val.value;
      }
      
      buffObj.effect[0].value = Math.round(buffObj.effect[0].value * damage.value);

      this.result += winner.name + getUnnun(winner.nameType) + ' ' + buffObj.effect[0].value + '만큼 보호막을 얻었습니다!<br>';
      this.giveBuff(winner, winner, buffObj, false);
    } else if (eff.code === cons.EFFECT_TYPE_CANCEL_DAMAGE) {
      var dmgCancelled = Math.round(damage.value * eff.value);
      winner.curHp += dmgCancelled;

      this.result += dmgCancelled + '의 대미지를 무효화했다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_SELF_CONVERT_BUFF || eff.code === cons.EFFECT_TYPE_OPP_CONVERT_BUFF) {
      var buffObj = buffMdl.getBuffData(eff);
      buffObj.dur = eff.buffDurDiv ? Math.max(1, Math.round(((winner.skill.special && winner.skill.special.cost) || 0) / eff.buffDurDiv)) : eff.buffDur;

      var recv = (eff.code === cons.EFFECT_TYPE_SELF_CONVERT_BUFF) ? winner : loser;
      var tgt = findBuffByIds(recv, eff.buffTarget);
      if (tgt.length > 0) {
        removeBuff(tgt[0]);
        this.giveBuff(winner, recv, buffObj, true);
      } 

    } else if (eff.code === cons.EFFECT_TYPE_SELF_BUFF_REFRESH || eff.code === cons.EFFECT_TYPE_OPP_BUFF_REFRESH) {
      var recv = (eff.code === cons.EFFECT_TYPE_SELF_BUFF_REFRESH) ? winner : loser;
      if (eff.buffTarget) { 
        for (val of findBuffByIds(recv, eff.buffTarget)) {
          if (eff.buffDur) {
            this.result += '[ ' + val.name + ' ]의 효과가 갱신되었다!<br>';
            val.dur = eff.buffDur;
          }
          if (eff.stack) {
            val.stack += eff.stack;
            if (val.stack == 0) {
              removeBuff(val);
            }
          }
          if (eff.stackMultiply) {
            val.stack = Math.round(val.stack * eff.value);
            if (val.stack <= 0) {
              removeBuff(val);
            }
          }
        }
      } else if (eff.buffTargetCode) { 
        for (val of findBuffByCode(recv, eff.buffTargetCode)) {
          if (eff.buffDur) {
            this.result += '[ ' + val.buff.name + ' ]의 효과가 갱신되었다!<br>';
            val.buff.dur = eff.buffDur;
          }
          if (eff.stack) {
            val.buff.stack += eff.stack;
            if (val.buff.stack == 0) {
              removeBuff(val);
            }
          }
        }
      }

    } else if (eff.code === cons.EFFECT_TYPE_RETURN) {
      var oriWinnerLeft = (winner == this.charLeft);
      if (eff.debug || findBuffByIds(winner, [201715]).length > 0) {
        this.result += this.bpTurn + '턴으로 자신만 되돌아간다!<br>';
        if (oriWinnerLeft) {
          this.charLeft = JSON.parse(this.bpLeft);
          winner = this.charLeft;
        } else {
          this.charRight = JSON.parse(this.bpRight);
          winner = this.charRight;          
        }
      } else {
        this.result += this.bpTurn + '턴으로 되돌아간다!<br>';
        this.turnCount = this.bpTurn;
        this.charLeft = JSON.parse(this.bpLeft);
        this.charRight = JSON.parse(this.bpRight);

        if (oriWinnerLeft) {
          winner = this.charLeft;
          loser = this.charRight;          
        } else {
          winner = this.charRight;          
          loser = this.charLeft;
        }
        this.resolveEffects(winner, loser, eff.winEffect);
      }
      
      break;

    } else if (eff.code === cons.EFFECT_TYPE_SELECTION) {
      for (var j = 0; j < eff.selectChances.length; j++) {
        if (getRandom(eff.selectChances[j])) {
          this.resolveEffects(winner, loser, [eff.options[j]], damage);
          break;
        }
      }

    } else if (eff.code === cons.EFFECT_TYPE_RESOLVE_DRIVE) {
      this.resolveDrive(winner, loser, damage);
    } else if (eff.code === cons.EFFECT_TYPE_OPP_RESOLVE_DRIVE) {
      this.resolveDrive(loser, winner, damage);
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLE) {
      eff.target.forEach(x => x.name = eff.name);
      this.resolveEffects(winner, loser, eff.target, damage, skill);
    } else if (eff.code === cons.EFFECT_TYPE_ADD_RESOLUTION) {
      this.resolveEffects(winner, loser, skill.effect, damage);
    } else if (eff.code === cons.EFFECT_TYPE_CONVERT_ITEM) {
      if (eff.randomItem) {
        var tgtList = item.list.filter(x => x && x.rank === eff.randomItem && x.type < 4 && !x.runEffect && !x.driveOverride && !/^무형의/.test(x.name)
          && !(x.effect || []).some(e => e.code === 'marsRobe' || e.code === 'itemBreak'));   // 로그라이크 전용·슬롯 고정·자기 계열 제외
        var picked = JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));
      } else {
        var picked = JSON.parse(JSON.stringify(tgtList[eff.value]));
      }
      for (efft of picked.effect) {
        efft.item = picked;
      }
      this.result += '[ ' + winner.items[eff.key].name + ' ] 아이템이 [ ' + picked.name + ' ] 아이템으로 바뀌었다!<br>';
      this.result += '<br>' + getItemText(null, picked);
      picked.socket = eff.item.socket;
      winner.items[eff.key] = picked;
    } else if (eff.code === cons.EFFECT_TYPE_ADD_DAMAGE) {
      if (eff.skillCode && eff.skillCode === skill.code) {
        var namt = eff.buffTarget ? eff.value * findBuffByIds(loser, eff.buffTarget).length : eff.value;
        damage.skillRat += namt;
        this.result += '[ ' + eff.name + ' ] 효과로 공격 계수가 ' + namt + ' 올랐습니다!<br>';
      } else if (eff.anySkill && skill.code) {
        damage.skillRat += eff.value * stackMpl;
        this.result += '[ ' + eff.name + ' ] 효과로 공격력이 ' + (Math.round(eff.value * stackMpl * 100) / 100) + ' 올랐습니다!<br>';      
      } else {
        continue;
      }
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLY_DAMAGE) {
      if (eff.buffCode && findBuffByIds(loser, [eff.buffCode]).length > 0) {
        damage.skillRat *= eff.value;
        this.result += '공격력이 ' + Math.round((eff.value - 1) * 100) + '\% 올랐습니다!<br>';
      } else if (eff.anySkill && skill.code) {
        var valueUsed = eff.value;
        if (eff.stackable) {
          valueUsed = (1 + (eff.value * stackMpl));          
        }
        damage.skillRat *= valueUsed;
        this.result += '[ ' + eff.name + ' ] 효과로 공격력이 ' + Math.round((valueUsed - 1) * 100) + '\% 올랐습니다!<br>';
      } else if (eff.noSkill && skill.code === undefined) {
        damage.skillRat *= eff.value;
        this.result += '[ ' + eff.name + ' ] 효과로 공격력이 ' + Math.round((eff.value - 1) * 100) + '\% 올랐습니다!<br>';    
      } else if (eff.all) {
        damage.skillRat *= eff.value;
        damage.value *= eff.value;
      } else {
        continue;
      }
    } else if (eff.code === cons.EFFECT_TYPE_RESOLVE_MAX_DAMAGE) {
      if (damage.type !== cons.DAMAGE_TYPE_PHYSICAL && damage.type !== cons.DAMAGE_TYPE_MAGICAL) {
        continue;
      }
      damage.diffDmg = damage.atkMax;
      this.result += '[ ' + eff.name + ' ] 효과로 최대 공격력이 발휘됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_CHANGE_ATTACK_TYPE) {
      if (eff.anySkill && !skill && !skill.code) {
        continue;
      }
      this.result += '[ ' + eff.name + ' ] 효과로 ' + (eff.type === cons.DAMAGE_TYPE_PHYSICAL ? '물리' : '마법') + ' 공격력이 적용됩니다!<br>';
      damage.type = eff.type;
      damage.atkRat = eff.type === cons.DAMAGE_TYPE_PHYSICAL ? winner.stat.phyAtk : winner.stat.magAtk;
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLY_HEAL) {
      if (damage.amount > 0) {
        damage.amount *= eff.value;
      }
    } else if (eff.code === cons.EFFECT_TYPE_REDUCE_BUFF_DURATION) {
      if (eff.buffCode && eff.buffCode !== damage.id) {
        continue;
      } else if (eff.anyDebuff && (!damage.isDebuff || !damage.dispellable || !damage.durOff)) {
        continue;
      } else if (eff.buffCodes && !eff.buffCodes.includes(damage.id)) {
        continue;
      }
      this.result += '[ ' + damage.name + ' ] 효과의 지속시간이 ' + eff.value + ' 감소합니다!<br>';
      damage.dur -= eff.value;
    } else if (eff.code === cons.EFFECT_TYPE_SET_BUFF_VALUE) {
      if (eff.buffCode && eff.buffCode !== damage.id) {
        continue;
      } else if (eff.anyDebuff && (!damage.isDebuff || !damage.dispellable || !damage.durOff)) {
        continue;
      }
      if (eff.isEffect) {
        if (eff.multiply) {
          damage.effect[eff.effNum][eff.effKey] *= eff.value;
        }
      }
    } else if (eff.code === cons.EFFECT_TYPE_REMOVE_BUFF || eff.code === cons.EFFECT_TYPE_OPP_REMOVE_BUFF) {
      var buffTarget = eff.standard ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : eff.buffTarget;
      const recv = (eff.code === cons.EFFECT_TYPE_REMOVE_BUFF) ? winner : loser;
      var limit = eff.limit;
      for (buff of recv.buffs) {
        if (limit == 0) {
          break;
        }
        if (limit) {
          limit--;
        }
        if (eff.all || (eff.anyDebuff && (buff.isDebuff && buff.dispellable && buff.durOff)) || (buffTarget && buffTarget.includes(buff.id))) {
          removeBuff(buff);
          this.result += '[ ' + buff.name + ' ] 효과가 제거됩니다!<br>';
        }
      }
    } else if (eff.code === cons.EFFECT_TYPE_SET_ITEM_VALUE) {
      var valueUsed = eff.value;
      if (eff.isPercentDamage) {
        valueUsed *= damage.value;
      }
      valueUsed += eff.item.itemValue;
      if (valueUsed > eff.maxValue) {
        valueUsed = eff.maxValue;
      }
      this.result += '[ ' + eff.item.name + ' ] 아이템에 에너지가 ' + valueUsed + ' 쌓였습니다!<br>';
      
      eff.item.itemValue = valueUsed;
    } else if (eff.code === cons.EFFECT_TYPE_DUPLICATE_ITEM) {
      winner.items[eff.dupKey] = winner.items[eff.key];
      this.result += '[ ' + winner.items[eff.key].name + ' ] 아이템이 복제됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_SWAP_SP) {
      var swap = winner.curSp;
      winner.curSp = loser.curSp;
      loser.curSp = swap;
      this.result += 'SP가 서로 바뀝니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_CHANGE_SKILL) {
      var newSkill = winner.skill.base[eff.value];
      for (key in damage) {
        damage[key] = newSkill[key];
      }
      this.result += '[ ' + damage.name + ' ] 스킬이 사용됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_RESOLVE_SKILL) {
      var keyUsed = eff.randomSkill ? Math.floor(Math.random() * 3) : eff.value;
      var skill = winner.skill.base[keyUsed];
      if (eff.reduceDmg) {
        skill.damage -= eff.reduceDmg;
      }
      var resolvedDamage = this.calcDamage(winner, loser, winner.skill.base[keyUsed]);
      if (resolvedDamage.hit) {
        this.dealDamage(winner, loser, resolvedDamage);
        this.result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + winner.skill.base[keyUsed].name + ' ] ' + getUro(winner.skill.base[keyUsed].nameType) + ' ';
        this.result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + resolvedDamage.value + '대미지를 입혔습니다!';
        if (resolvedDamage.crit) {
          this.result += ' (치명타)';
        }
        this.result += '<br>';
        if (!eff.noEffect) {
          this.resolveEffects(winner, loser, winner.skill.base[keyUsed].effect, damage);
        }
      } else {
        this.result += '공격이 빗나갔습니다!<br>';
      }
    } else if (eff.code === cons.EFFECT_TYPE_ADD_RESULT_CARD) {
      // 5th arg = isLeft
      if (skill) {
        damage.resultLeft += eff.value;
      } else {
        damage.resultRight += eff.value;
      }
      this.result += winner.name + '의 리설트 카드 갯수가 ' + eff.value + ' 되었습니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_SPLIT_SP) {
      var swap = winner.curSp + loser.curSp;
      winner.curSp = Math.round(swap * eff.value);
      loser.curSp = swap - winner.curSp;
      this.result += 'SP가 재분배됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_FORCE_CRIT) {
      if ((eff.skillCode && eff.skillCode === skill.code) || eff.anySkill) {
        damage.crit = true;
        this.result += '[ ' + eff.name + ' ] 효과로 치명타가 적용됩니다!<br>';
      } else {
        continue;
      }
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLY_DAMAGE_OBJECT || eff.code === cons.EFFECT_TYPE_ADD_DAMAGE_OBJECT) {
      if ((eff.skillCode && eff.skillCode === skill.code) || eff.anySkill) {
        if (eff.code === cons.EFFECT_TYPE_MULTIPLY_DAMAGE_OBJECT) {
          damage[eff.key] *= (eff.value * stackMpl);
          this.result += '[ ' + eff.name + ' ] 효과로 ' + printName[eff.key] + ' ' + (eff.value * stackMpl) + '배 증가합니다!<br>';
        } else {
          damage[eff.key] += (eff.value * stackMpl);
          this.result += '[ ' + eff.name + ' ] 효과로 ' + printName[eff.key] + ' ' + (eff.value * stackMpl) + ' 증가합니다!<br>';
        }
      } else {
        continue;
      }
    } else if (eff.code === 'noop') {
      // 후속 처리(stackReduce 등)만 수행
    } else if (eff.code === 'dragon') {   // 캐버나이크: 고위 드래곤으로 변신
      if (winner.isDragon) continue;
      winner.isDragon = true;
      winner.base = Object.assign({}, winner.base, { maxHp : 1799, phyAtk : winner.base.phyAtk, magAtk : winner.base.magAtk });
      winner.skillOri = JSON.parse(JSON.stringify(eff.dragonSkill));
      winner.skill = JSON.parse(JSON.stringify(eff.dragonSkill));
      winner.nameOri = winner.name = '고위 드래곤 ' + winner.nameOri;
      calcStats(winner, loser);
      winner.curHp = 179;
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 맹약이 발동한다 — ' + winner.name + '으로 변모했다! (179 / 1799)</span><br>';
    } else if (eff.code === 'shuffleDeck') {   // 프레나 [환기]: 자기 덱을 다시 섞는다
      winner.pendingShuffle = true;
      this.result += '[ ' + (eff.name || '환기') + ' ] ' + winner.name + getIga(winner.nameType) + ' 패를 흐트러뜨렸다.<br>';
    } else if (eff.code === 'castHand') {   // 프레나 [마법 폭풍]: 손에 든 카드 수만큼 기술을 연달아 시전
      const hand = winner.handTypes || [0, 1, 2];
      for (const idx of hand) {
        const sk = winner.skill.base[idx]; if (!sk) continue;
        const rd = this.calcDamage(winner, loser, sk); rd.noProc = true;
        if (rd.hit) { this.dealDamage(winner, loser, rd); this.result += '<span class="skillDamage">[ ' + sk.name + ' ] ' + rd.value + '대미지!</span><br>';
          this.resolveEffects(winner, loser, sk.effect || [], rd, sk); }
        else this.result += '[ ' + sk.name + ' ] 빗나갔다!<br>';
      }
    } else if (eff.code === 'councilMark') {   // 달빛 의회: 피격 기술에 따라 스택을 쌓고, 임계치를 넘으면 상대 카드를 지운다
      if (!damage || !damage.value) continue;
      const idx = (loser.skill && loser.skill.base) ? loser.skill.base.findIndex(sk => sk && sk.code === loser.curSkillCode) : -1;
      if (idx < 0) continue;
      const MARK = [{ id : 10720, cut : 2 }, { id : 10721, cut : 0 }, { id : 10722, cut : 1 }][idx];
      const bo = buffMdl.getBuffData({ buffCode : MARK.id }); bo.dur = null; bo.stack = Math.round(damage.value);
      this.giveBuff(winner, winner, bo, false, eff.name);
      const cur = (winner.buffs || []).find(x => x.id === MARK.id);
      if (cur && cur.stack >= winner.stat.maxHp * 0.35) {
        removeBuff(cur);
        winner.pendingCardCut = (winner.pendingCardCut || []).concat([MARK.cut]);   // 의회 자신의 덱에서 빠진다
        this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 의석 하나가 무너진다 — ' + winner.name + '의 [ ' + ['가위', '바위', '보'][MARK.cut] + ' ] 카드 한 장이 사라진다!</span><br>';
      }
    } else if (eff.code === 'drain') {   // 착취의 무리: 이 버프를 가진 쪽(winner)에서 상대(loser)로 생명력 이동
      const v = Math.max(1, Math.round((winner.curHp || 0) * eff.value));
      winner.curHp -= v; loser.curHp = Math.min(loser.stat.maxHp, loser.curHp + v);
      this.result += '[ 착취의 무리 ] ' + loser.name + getIga(loser.nameType) + ' ' + v + '만큼 빨아들였다!<br>';
    } else if (eff.code === 'lichGuard') {   // 켈투자드: 얼음왕관의 수호자 N기
      for (let k = 0; k < (eff.count || 4); k++) {
        const bo = buffMdl.getBuffData({ buffCode : 10689 }); bo.dur = null;
        for (const be of bo.effect) if (be.code === cons.EFFECT_TYPE_SHIELD) be.value = Math.round(winner.stat.maxHp * (eff.value || 0.05));
        this.giveBuff(winner, winner, bo, false, eff.name);
      }
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 얼음왕관의 수호자 ' + (eff.count || 4) + '기가 깨어났다. 얼음 속에 갇힌다!</span><br>';
    } else if (eff.code === 'valanyr') {   // 발아니르: 보호 중첩 + 누적 보호막 (최대 4중첩)
      const st = (winner.buffs || []).find(x => x.id === 10690);
      if (st && (st.stack || 1) >= 4) continue;
      const bo = buffMdl.getBuffData({ buffCode : 10690 }); bo.dur = null; bo.stack = 1; this.giveBuff(winner, winner, bo, false, eff.name);
      const add = Math.round(winner.stat.maxHp * eff.value);
      const sh = (winner.buffs || []).find(x => x.id === 10691);
      if (sh) { for (const be of sh.effect) if (be.code === cons.EFFECT_TYPE_SHIELD) be.value += add; }
      else { const b2 = buffMdl.getBuffData({ buffCode : 10691 }); b2.dur = null; for (const be of b2.effect) if (be.code === cons.EFFECT_TYPE_SHIELD) be.value = add; this.giveBuff(winner, winner, b2, false, eff.name); }
      this.result += '[ ' + eff.name + ' ] 고대 왕의 빛이 막아선다. 보호막 +' + add + '<br>';
    } else if (eff.code === 'castSlot') {   // 누더기골렘: 지정 슬롯 스킬 즉시 시전
      const sk = winner.skill.base[eff.slot]; if (!sk) continue;
      const rd = this.calcDamage(winner, loser, sk);
      if (rd.hit) { this.dealDamage(winner, loser, rd); this.result += '<span class="skillDamage">[ ' + eff.name + ' ] ' + winner.name + getIga(winner.nameType) + ' [ ' + sk.name + ' ] ' + getUro(sk.nameType) + ' 한 번 더! ' + rd.value + '대미지</span><br>'; }
      if (eff.removeSelfBuff) for (const b of (winner.buffs || []).filter(x => eff.removeSelfBuff.includes(x.id))) removeBuff(b);
    } else if (eff.code === 'soulGain') {   // 어둠한: 준 피해만큼 영혼 조각
      if (!damage || !damage.value) continue;
      const bo = buffMdl.getBuffData({ buffCode : 10694 }); bo.dur = null; bo.stack = Math.round(damage.value); this.giveBuff(winner, winner, bo, false, eff.name);
    } else if (eff.code === 'soulBurst') {
      const b = (winner.buffs || []).find(x => x.id === 10694); if (!b) continue;
      if ((b.stack || 0) < loser.stat.maxHp * eff.threshold) continue;
      removeBuff(b);
      const v = Math.round(winner.stat.phyAtk * eff.value); loser.curHp -= v;
      const bl = buffMdl.getBuffData({ buffCode : 8 }); bl.dur = 1; this.giveBuff(winner, loser, bl, true, eff.name);
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 영혼 조각이 터져 나온다! ' + loser.name + '에게 ' + v + ' 절대 피해!</span><br>';
    } else if (eff.code === 'yogg') {   // 요그사론: 사용한 스킬 대신 무작위 자기 스킬 (다른 게 나오면 계수 +20%)
      if (!skill || !winner.skillOri) continue;
      const r = Math.floor(Math.random() * 3); const src = winner.skillOri.base[r]; if (!src) continue;
      const same = src.code === skill.code;
      const orig = skill.name;
      Object.assign(skill, JSON.parse(JSON.stringify(src)));
      if (!same && skill.damage) skill.damage = Math.round(skill.damage * 1.2 * 100) / 100;
      if (!same) this.result += '[ ' + eff.name + ' ] 속삭임이 손을 비튼다 — [ ' + orig + ' ] 대신 [ ' + skill.name + ' ]!<br>';
    } else if (eff.code === 'counterRandom') {   // 요그사론 (패배 시): 무작위 스킬로 반격
      const sk = winner.skill.base[Math.floor(Math.random() * 3)]; if (!sk) continue;
      const rd = this.calcDamage(winner, loser, sk);
      if (rd.hit) { this.dealDamage(winner, loser, rd); this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 촉수가 대신 [ ' + sk.name + ' ] 으로 반격! ' + rd.value + '대미지</span><br>'; }
    } else if (eff.code === 'randDebuff') {   // 느조스: 무작위 표준 상태이상
      const ids = [1, 2, 3, 4, 6, 7, 8, 11]; const bd = buffMdl.getBuffData({ buffCode : ids[Math.floor(Math.random() * ids.length)] }); bd.dur = eff.dur || 2;
      this.giveBuff(winner, loser, bd, true, eff.name);
    } else if (eff.code === 'cthunBlast') {   // 크툰: 강화 중첩 비례 마법 즉발
      const b = (winner.buffs || []).find(x => x.id === 10696); const st = b ? (b.stack || 1) : 0;
      if (!st) { this.result += '[ ' + eff.name + ' ] 크툰 강화가 없다.<br>'; continue; }
      removeBuff(b);
      const rd = { value : Math.max(1, Math.round(winner.stat.magAtk * eff.value * st * (1 - (loser.stat.magReduce || 0)))), type : cons.DAMAGE_TYPE_MAGICAL, reduce : 0 };
      this.dealDamage(winner, loser, rd);
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 크툰! 크툰! 크툰! (' + st + '중첩) ' + loser.name + '에게 ' + rd.value + ' 마법 피해!</span><br>';
    } else if (eff.code === 'freeStrike') {   // 반드시 맞는 즉발 공격 (반복·부가 효과·낙인 배수 지원)
      const sk = { name : eff.skillName, type : eff.type || cons.DAMAGE_TYPE_MAGICAL, damage : eff.value, nameType : cons.NAME_KOR_NO_END_CONS, effect : [] };
      const marked = eff.doubleIfOpp && (loser.buffs || []).some(b => b.id === eff.doubleIfOpp);
      for (let k = 0; k < (eff.count || 1); k++) {
        const rd = this.calcDamage(winner, loser, sk); rd.hit = true; rd.noProc = true;
        if (marked) rd.value = Math.round(rd.value * 2);
        this.dealDamage(winner, loser, rd);
        this.result += '<span class="skillDamage">[ ' + eff.name + ' ] ' + winner.name + getIga(winner.nameType) + ' [ ' + sk.name + ' ] ' + getUro(sk.nameType) + ' ' + loser.name + getUlrul(loser.nameType) + ' 쳤다! ' + rd.value + '대미지' + (marked ? ' (낙인 2배!)' : '') + (rd.crit ? ' (치명타)' : '') + '</span><br>';
      }
      if (eff.oppBuff) { const bd = buffMdl.getBuffData({ buffCode : eff.oppBuff.buffCode }); bd.dur = eff.oppBuff.dur; this.giveBuff(winner, loser, bd, true, eff.name); }
    } else if (eff.code === 'spBurn') {   // 설퍼라스: 현재 SP 비례 마법 피해 후 SP 0
      const sp = Math.round(winner.curSp || 0); if (sp <= 0) { this.result += '[ ' + eff.name + ' ] 남은 힘이 없다.<br>'; continue; }
      if (!eff.keepSp) winner.curSp = 0;
      const rd = { value : Math.max(1, Math.round(sp * eff.value * (1 - (loser.stat.magReduce || 0)))), type : cons.DAMAGE_TYPE_MAGICAL, reduce : 0, noProc : true };
      this.dealDamage(winner, loser, rd);
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 꺼진 불을 한 번에 태웠다! ' + loser.name + '에게 ' + rd.value + ' 마법 피해 (SP ' + sp + ')</span><br>';
    } else if (eff.code === 'regenHeal') {   // 넵튤론: 생명력 회복 비례 즉시 회복
      const v = Math.max(1, Math.round((winner.stat.hpRegen || 0) * eff.value));
      winner.curHp = Math.min(winner.stat.maxHp, winner.curHp + v);
      this.result += '[ ' + eff.name + ' ] 효과로 HP를 ' + v + ' 회복했다!<br>';
    } else if (eff.code === 'setHpPct') {   // 생명의 어머니의 루비: 현재 생명력을 최대치의 N%로
      const t0 = Math.round(winner.stat.maxHp * eff.value); const before = Math.round(winner.curHp);
      winner.curHp = t0;
      this.result += '[ ' + eff.name + ' ] 생명은 공평하다. ' + before + ' → ' + t0 + '<br>';
    } else if (eff.code === 'spHit') {   // 별을 부수는 자: 현재 SP 비례 절대 피해 (SP 유지)
      const v = Math.max(1, Math.round((winner.curSp || 0) * eff.value)); loser.curHp -= v;
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 별이 부서진다! ' + loser.name + '에게 ' + v + ' 절대 피해</span><br>';
    } else if (eff.code === 'capacitorGain') {   // 영혼 축전기
      if (!damage || !damage.value) continue;
      const bo = buffMdl.getBuffData({ buffCode : 10714 }); bo.dur = null; bo.stack = Math.max(1, Math.round(damage.value * eff.value));
      this.giveBuff(winner, winner, bo, false, eff.name);
    } else if (eff.code === 'capacitorBurst') {
      const b = (winner.buffs || []).find(x => x.id === 10714); if (!b || !b.stack) { this.result += '[ ' + eff.name + ' ] 모인 영혼이 없다.<br>'; continue; }
      const v = b.stack; removeBuff(b); loser.curHp -= v;
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 모아 둔 영혼이 터져 나온다! ' + loser.name + '에게 ' + v + ' 절대 피해</span><br>';
    } else if (eff.code === 'timeSkip') {   // 청동의 모래시계: N턴을 판정 없이 흘려보낸다
      this.result += '<div class="note-box">모래가 쏟아진다. ' + eff.value + '턴이 그대로 지나갔다.</div>';
      for (let k = 0; k < eff.value; k++) {
        this.resolveTurnEnd(winner, loser);
        this.turnCount++;
        this.resolveTurnBegin(winner, loser);
        if (winner.curHp <= 0 || loser.curHp <= 0) break;
      }
    } else if (eff.code === 'randomOf') {   // 프레이야: 효과 중 하나 무작위
      const pick = eff.options[Math.floor(Math.random() * eff.options.length)];
      this.resolveEffects(winner, loser, [Object.assign({ name : eff.name }, pick)], damage, skill);
    } else if (eff.code === 'transform') {   // 자락서스: N턴 변신 (스킬 전체 교체), 종료 시 원래대로
      if (winner.formBackup) continue;
      winner.formBackup = { skillOri : JSON.parse(JSON.stringify(winner.skillOri)), name : winner.nameOri };
      const sk = JSON.parse(JSON.stringify(eff.skill));
      winner.skillOri.base = [0, 1, 2].map(k => Object.assign({}, sk, { code : sk.code + k }));
      winner.nameOri = eff.formName;
      const bo = buffMdl.getBuffData({ buffCode : eff.buffCode }); bo.dur = eff.dur; this.giveBuff(winner, winner, bo, false, eff.name);
      calcStats(winner, loser);
      if (winner.curHp > 0) winner.curHp = Math.min(winner.stat.maxHp, winner.curHp);
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 「내가 바로 자락서스, 불타는 군단의 군주다!」</span><br>';
    } else if (eff.code === 'restoreForm') {
      if (!winner.formBackup) continue;
      winner.skillOri = winner.formBackup.skillOri; winner.nameOri = winner.formBackup.name; delete winner.formBackup;
      calcStats(winner, loser);
      this.result += '[ ' + winner.name + ' ] 원래 모습으로 돌아왔다.<br>';
    } else if (eff.code === 'gloryGain') {   // 글로리 맥스: 안 맞은 턴이면 2배
      const n = winner.hitThisTurn ? 1 : 2;
      const bo = buffMdl.getBuffData({ buffCode : 10666 }); bo.dur = null; bo.stack = n; this.giveBuff(winner, winner, bo, false, eff.name);
      const cur = (winner.buffs || []).find(x => x.id === 10666);
      this.result += '[ ' + eff.name + ' ] [ MAX 100% ] +' + n + ' (총 ' + (cur ? cur.stack : n) + ')<br>';
      if (cur && cur.stack >= 5) { removeBuff(cur); const g = buffMdl.getBuffData({ buffCode : 10667 }); g.dur = 3; this.giveBuff(winner, winner, g, true, eff.name); this.result += '<span class="skillDamage">GLORY MAX!</span><br>'; }
    } else if (eff.code === 'gloryHalve') {
      const cur = (winner.buffs || []).find(x => x.id === 10666);
      if (cur) { cur.stack = Math.floor((cur.stack || 1) / 2); if (cur.stack <= 0) removeBuff(cur); }
    } else if (eff.code === 'spFill') {   // 기회는 그립감이 좋다: SP를 스페셜 비용까지
      const need = (winner.skill.special && winner.skill.special.cost) || 100;
      if ((winner.curSp || 0) < need) winner.curSp = need;
      this.result += '[ ' + eff.name + ' ] 기회를 움켜쥐었다! SP ' + Math.round(winner.curSp) + '<br>';
    } else if (eff.code === 'stock') {   // 꽉 잡아!: 50% −2중첩 / 50% +1중첩
      const cur = (winner.buffs || []).find(x => x.id === 10668); if (!cur) continue;
      if (Math.random() < 0.5) { cur.stack = Math.max(0, (cur.stack || 1) - 2); this.result += '[ ' + eff.name + ' ] 내려간다! (' + cur.stack + ')<br>'; if (cur.stack <= 0) removeBuff(cur); }
      else { cur.stack = Math.min(cur.maxStack || 20, (cur.stack || 1) + 1); this.result += '[ ' + eff.name + ' ] 반등! (' + cur.stack + ')<br>'; }
    } else if (eff.code === 'borrowGear') {   // AI 센트럴 접근장치: 무작위 장비 능력치 덧입기
      this._borrowGear(winner, loser, eff.gearRank || 4, eff.name);
    } else if (eff.code === 'tagGive') {   // 범용 태그 부여: eff.tag = 버프 코드, 아이템의 onTag 훅 실행, tagMul로 증폭
      if (eff.spCost && (winner.curSp || 0) < eff.spCost) continue;
      if (eff.spCost) winner.curSp -= eff.spCost;
      let n = eff.value || 1;
      for (const k in (winner.items || {})) { const it = winner.items[k]; if (it && it.tagMul && it.tagMul.tag === eff.tag) n += it.tagMul.value; }
      const tg = buffMdl.getBuffData({ buffCode : eff.tag }); tg.dur = null; tg.stack = n;
      this.giveBuff(winner, winner, tg, false, eff.name);
      const cur = (winner.buffs || []).find(x => x.id === eff.tag);
      this.result += '[ ' + eff.name + ' ] 효과로 [ ' + tg.name + ' ] +' + n + ' (총 ' + (cur ? cur.stack : n) + '중첩)<br>';
      if (eff.heal) { const v = Math.round(winner.stat.maxHp * eff.heal); winner.curHp = Math.min(winner.stat.maxHp, winner.curHp + v); this.result += '[ ' + eff.name + ' ] 효과로 HP를 ' + v + ' 회복했다!<br>'; }
      for (let k2 = 0; k2 < n; k2++) for (const key in (winner.items || {})) {
        const it = winner.items[key]; if (!it || !it.onTag || it.onTag.tag !== eff.tag) continue;
        const h = it.onTag;   // 한 아이템당 훅 하나
        if (h.stackBuff) { const bo = buffMdl.getBuffData({ buffCode : h.stackBuff }); bo.dur = null; bo.stack = 1; this.giveBuff(winner, winner, bo, false, it.name); const c2 = (winner.buffs || []).find(x => x.id === h.stackBuff); this.result += '[ ' + it.name + ' ] 효과로 [ ' + bo.name + ' ] ' + (c2 ? c2.stack : 1) + '중첩!<br>'; }
        if (h.shieldPct) { const add = Math.round(winner.stat.maxHp * h.shieldPct); const ex = (winner.buffs || []).find(x => x.id === h.shieldBuff); if (ex) { for (const be of ex.effect) if (be.code === cons.EFFECT_TYPE_SHIELD) be.value += add; } else { const bo = buffMdl.getBuffData({ buffCode : h.shieldBuff }); bo.dur = null; for (const be of bo.effect) if (be.code === cons.EFFECT_TYPE_SHIELD) be.value = add; this.giveBuff(winner, winner, bo, false, it.name); } this.result += '[ ' + it.name + ' ] 보호막 +' + add + '<br>'; }
        if (h.randomDebuff) { const ids = [1, 2, 3, 4, 6, 7, 8, 11]; const bd = buffMdl.getBuffData({ buffCode : ids[Math.floor(Math.random() * ids.length)] }); bd.dur = h.randomDebuff; this.giveBuff(winner, loser, bd, true, it.name); }
        if (h.healPct) { const v = Math.round(winner.stat.maxHp * h.healPct); winner.curHp = Math.min(winner.stat.maxHp, winner.curHp + v); this.result += '[ ' + it.name + ' ] 효과로 HP를 ' + v + ' 회복했다!<br>'; }
        if (h.oppBuff && Math.random() < (h.oppBuff.chance || 1)) { const bd = buffMdl.getBuffData({ buffCode : h.oppBuff.buffCode }); bd.dur = h.oppBuff.dur; this.giveBuff(winner, loser, bd, true, it.name); }
      }
    } else if (eff.code === 'tagHit') {   // 태그 중첩당 절대 피해
      const tb = (winner.buffs || []).find(x => x.id === eff.tag); const st = tb ? (tb.stack || 1) : 0;
      if (st > 0) { const v = st * eff.value; loser.curHp -= v; this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 효과로 ' + loser.name + '에게 ' + v + ' 절대 피해! (' + st + '중첩)</span><br>'; }
    } else if (eff.code === 'predator') {   // 포식동물 제어장치: 동물 스택 → [포식]
      let total = 0;
      for (const b of (winner.buffs || [])) if (b.id >= 10620 && b.id <= 10624) { total += (b.stack || 1); removeBuff(b); }
      if (total > 0) { const bo = buffMdl.getBuffData({ buffCode : 10626 }); bo.dur = null; bo.stack = total; this.giveBuff(winner, winner, bo, false, eff.name); const c2 = (winner.buffs || []).find(x => x.id === 10626); this.result += '[ ' + eff.name + ' ] 동물 ' + total + '중첩을 [ 포식 ] 으로 전환 (총 ' + (c2 ? c2.stack : total) + ')<br>'; }
    } else if (eff.code === 'sciTag') {   // 테라포밍 세트: [과학 태그] 획득 + 부가 효과
      if (eff.spCost && (winner.curSp || 0) < eff.spCost) continue;
      if (eff.spCost) winner.curSp -= eff.spCost;
      if (eff.heal) { const v = Math.round(winner.stat.maxHp * eff.heal); winner.curHp = Math.min(winner.stat.maxHp, winner.curHp + v); this.result += '[ ' + eff.name + ' ] 효과로 HP를 ' + v + ' 회복했다!<br>'; }
      const n = eff.value || 1;
      const tag = buffMdl.getBuffData({ buffCode : 10610 }); tag.dur = null; tag.stack = n;
      this.giveBuff(winner, winner, tag, false, eff.name);
      const cur = (winner.buffs || []).find(x => x.id === 10610);
      this.result += '[ ' + eff.name + ' ] 효과로 [ 과학 태그 ] ' + (cur ? cur.stack : n) + '중첩!<br>';
      for (let k = 0; k < n; k++) {
        if (eff.borrowGear) this._borrowGear(winner, loser, eff.gearRank || 3, eff.name);   // 올림푸스 제어봉
        for (const key in (winner.items || {})) {   // 과학 태그 획득 훅 (성층권 동물 망토 등)
          const it = winner.items[key]; if (!it || !it.onTag || it.onTag.tag !== 10610 || !it.onTag.stackBuff) continue;
          const bo = buffMdl.getBuffData({ buffCode : it.onTag.stackBuff }); bo.dur = null; bo.stack = 1; this.giveBuff(winner, winner, bo, false, it.name);
          const c2 = (winner.buffs || []).find(x => x.id === it.onTag.stackBuff); this.result += '[ ' + it.name + ' ] 효과로 [ ' + bo.name + ' ] ' + (c2 ? c2.stack : 1) + '중첩!<br>';
        }
        if (eff.randomDebuff) {   // 학사모: 무작위 상태이상
          const ids = [1, 2, 3, 4, 6, 7, 8, 11];
          const bd = buffMdl.getBuffData({ buffCode : ids[Math.floor(Math.random() * ids.length)] }); bd.dur = eff.randomDebuff;
          this.giveBuff(winner, loser, bd, true, eff.name);
        }
      }
    } else if (eff.code === 'marsRobe') {   // 화성 연구자의 의복: 무작위 같은 급수 방어구로 변경
      const itemMdl = require('./items');
      const pool = itemMdl.list.filter(x => x && x.rank === (eff.gearRank || 3) && x.type === cons.ITEM_TYPE_ARMOR && x.name !== '화성 연구자의 의복' && !x.runEffect && !x.timeMult);
      if (pool.length) {
        const pick = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
        for (const ef of (pick.effect || [])) ef.name = pick.name;
        winner.items.armor = pick; calcStats(winner, loser);
        this.result += '[ ' + eff.name + ' ] 의복이 형태를 바꾼다 — ' + pick.name + '이(가) 되었다!<br>';
      }
    } else if (eff.code === 'weakenOppSkill') {   // 상대 스킬 하나 무작위 계수 감소 (전투 내내)
      const r = Math.floor(Math.random() * 3); const sk = loser.skillOri && loser.skillOri.base[r];
      if (sk && sk.damage) { sk.damage = Math.round(sk.damage * eff.value * 100) / 100; this.result += '[ ' + eff.name + ' ] 효과로 ' + loser.name + '의 [ ' + sk.name + ' ] 계수가 줄었다!<br>'; }
    } else if (eff.code === 'mirror') {   // 상대가 쓴 스킬 계수로 되돌려주기
      if (!skill || !skill.damage) skill = (damage && damage.damage && damage.name) ? damage : null;   // SKILL_LOSE 훅은 상대 스킬을 damage 자리로 넘김
      if (!skill || !skill.damage) continue;
      const usePhy = (winner.stat.phyAtk || 0) >= (winner.stat.magAtk || 0);
      const atk = usePhy ? winner.stat.phyAtk : winner.stat.magAtk;
      const red = usePhy ? (loser.stat.phyReduce || 0) : (loser.stat.magReduce || 0);
      const v = Math.max(1, Math.round(atk * skill.damage * (1 - red)));
      loser.curHp -= v;
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] ' + skill.name + '을(를) 그대로 되돌려 ' + loser.name + '에게 ' + v + ' 피해!</span><br>';
    } else if (eff.code === 'repeatSkill') {   // 방금 쓴 스킬 한 번 더
      if (!skill) continue;
      const idx = winner.skill.base.findIndex(x => x && x.code === skill.code); if (idx < 0) continue;
      const rd = this.calcDamage(winner, loser, winner.skill.base[idx]);
      if (rd.hit) { this.dealDamage(winner, loser, rd); this.result += '<span class="skillDamage">[ ' + eff.name + ' ] ' + winner.name + getIga(winner.nameType) + ' [ ' + skill.name + ' ] ' + getUro(skill.nameType) + ' 다시 ' + loser.name + getUlrul(loser.nameType) + ' 공격해 ' + rd.value + '대미지!</span><br>'; }
    } else if (eff.code === 'stealSkill') {   // 상대 스킬 하나를 스페셜로 복사
      const r = Math.floor(Math.random() * 3); const sk = loser.skillOri && loser.skillOri.base[r]; if (!sk) continue;
      const sp = JSON.parse(JSON.stringify(sk)); sp.type = cons.SKILL_TYPE_SPECIAL; sp.damageType = sk.type; sp.cost = eff.value; sp.name = '훔친 ' + sk.name;
      winner.skillOri.special = sp; winner.skill.special = JSON.parse(JSON.stringify(sp));
      this.result += '[ ' + eff.name + ' ] 효과로 ' + loser.name + '의 [ ' + sk.name + ' ] 을(를) 훔쳤다! (스페셜, SP ' + eff.value + ')<br>';
    } else if (eff.code === 'removeOppShield') {   // 상대 보호막 제거
      const sh = (loser.buffs || []).filter(b => (b.effect || []).some(e => e.code === cons.EFFECT_TYPE_SHIELD));
      for (const b of sh) removeBuff(b);
      if (sh.length) this.result += '[ ' + eff.name + ' ] 효과로 ' + loser.name + '의 보호막이 부서졌다!<br>';
    } else if (eff.code === 'spZero') {
      winner.curSp = 0;
      this.result += '[ ' + eff.name + ' ] 효과로 SP가 0이 됐다.<br>';
    } else if (eff.code === 'stackToBuff') {   // 스택 버프를 소모해 지속 버프로 (리벨리온)
      const b = (winner.buffs || []).find(x => x.id === eff.from);
      if (!b || !b.stack) continue;
      const dur = Math.max(1, Math.floor(b.stack / eff.per));
      removeBuff(b);
      const bo = buffMdl.getBuffData({ buffCode : eff.buffCode }); bo.dur = dur;
      this.giveBuff(winner, winner, bo, true, eff.name);
    } else if (eff.code === 'junkJet') {   // 정크 젯: 골드 또는 커먼 아이템을 소모해 피해
      const inv = winner.inventory || [];
      const ci = inv.findIndex(x => x && x.type <= 3 && x.rarity === cons.ITEM_RARITY_COMMON);
      let mul = 1, used = null;
      if (Math.random() < 0.3 && ci >= 0) { used = inv.splice(ci, 1)[0]; winner.junkUsed = (winner.junkUsed || []).concat([used.name]); mul = 3; }
      else if ((winner.gold || 0) >= 20) { winner.gold -= 20; used = { name : '20골드' }; }
      if (used) {
        const v = Math.max(1, Math.round((winner.stat.phyAtk * 0.5 * (1 - (loser.stat.phyReduce || 0)) + winner.stat.magAtk * 0.7 * (1 - (loser.stat.magReduce || 0))) * mul));
        loser.curHp -= v;
        this.result += '<span class="skillDamage">[ 잡동사니 발사 ] ' + used.name + '을(를) 쏘아 ' + loser.name + '에게 ' + v + ' 피해!</span><br>';
      } else {
        const v = Math.max(1, Math.round((winner.stat.phyAtk * 0.5 + winner.stat.magAtk * 0.7) / 2));
        winner.curHp -= v;
        this.result += '[ 잡동사니 발사 ] 쏠 것이 없어 폭발했다! 자신에게 ' + v + ' 피해.<br>';
      }
    } else if (eff.code === 'hpDiffMul') {   // 데키메이트 윌: 상대 최대 생명력 초과분 10%당 +6% (최대 +60%)
      const diff = (loser.stat.maxHp - winner.stat.maxHp) / winner.stat.maxHp;
      const bonus = Math.min(0.6, Math.max(0, Math.floor(diff * 10) * 0.06));
      if (bonus > 0 && damage) { damage.skillRat *= (1 + bonus); this.result += '[ ' + eff.name + ' ] 효과로 피해 +' + Math.round(bonus * 100) + '%!<br>'; }
    } else if (eff.code === 'itemBreak') {   // 건틀릿 오브 오거 파워: 이 슬롯의 % 스탯 상실
      const it = winner.items && winner.items[eff.slot];
      const pcts = it ? (it.effect || []).filter(e => e.fromAtkPct && e.code !== -1) : [];
      if (it && (it.pctStat || pcts.length)) { delete it.pctStat; for (const e of pcts) e.code = -1; calcStats(winner, loser); this.result += '[ ' + eff.name + ' ] 기능이 멈췄다!<br>'; }
    } else if (eff.code === 'shieldPct') {   // 최대 생명력 비율 보호막 버프
      const bo = buffMdl.getBuffData({ buffCode : eff.buffCode }); bo.dur = null;
      for (const be of bo.effect) if (be.code === cons.EFFECT_TYPE_SHIELD) be.value = Math.round(winner.stat.maxHp * eff.value);
      this.giveBuff(winner, winner, bo, true, eff.name);
    } else if (eff.code === 'asura') {   // 아수라파천무: SP 전부 소모 × 배율 절대 피해
      const sp = Math.round(winner.curSp || 0); if (sp <= 0) continue;
      winner.curSp = 0; const v = sp * eff.value; loser.curHp -= v;
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 아수라파천무! SP ' + sp + '를 모두 태워 ' + loser.name + '에게 ' + v + ' 절대 피해!</span><br>';
    } else if (eff.code === 'counterHigh') {   // 물리/마법 중 높은 쪽 × 배율로 즉시 피해
      const usePhy = (winner.stat.phyAtk || 0) >= (winner.stat.magAtk || 0);
      const atk = usePhy ? winner.stat.phyAtk : winner.stat.magAtk;
      const red = usePhy ? (loser.stat.phyReduce || 0) : (loser.stat.magReduce || 0);
      const v = Math.max(1, Math.round(atk * eff.value * (1 - red)));
      loser.curHp -= v;
      this.result += '<span class="skillDamage">[ ' + eff.name + ' ] 효과로 ' + loser.name + '에게 ' + v + ' ' + (usePhy ? '물리' : '마법') + ' 피해!</span><br>';
    } else if (eff.code === 'spMark') {
      winner.spMark = winner.curSp || 0;
    } else if (eff.code === 'spStack') {
      const gained = Math.max(0, Math.round((winner.curSp || 0) - (winner.spMark || 0)));
      winner.spMark = winner.curSp || 0;
      if (gained > 0) {
        const bo = buffMdl.getBuffData({ buffCode : eff.buffCode }); bo.dur = null; bo.stack = gained;
        this.giveBuff(winner, winner, bo, false, eff.name);
        const cur = (winner.buffs || []).find(x => x.id === eff.buffCode);
        this.result += '[ ' + eff.name + ' ] 효과로 [ ' + bo.name + ' ] +' + gained + ' (총 ' + (cur ? cur.stack : gained) + '중첩)<br>';
      }
    } else if (eff.code === cons.EFFECT_TYPE_SET_ALL_BUFF_DURATION || eff.code === cons.EFFECT_TYPE_OPP_SET_ALL_BUFF_DURATION) {
      const recv = (eff.code === cons.EFFECT_TYPE_SET_ALL_BUFF_DURATION) ? winner : loser;
      var valueUsed = eff.value;
      if (eff.isPercentChar) {
        valueUsed *= winner[eff.percentKey];
      } 
      const eText = valueUsed > 0 ? '증가' : '감소';
      for (buf of recv.buffs) {
        if (eff.buffCode && eff.buffCode !== buf.id) {
          continue;
        } else if (eff.anyDebuff && (!buf.isDebuff || !buf.dispellable || !buf.durOff)) {
          continue;
        }
        this.result += '[ ' + buf.name + ' ] 효과의 지속시간이 ' + (valueUsed > 0 ? valueUsed : 0-valueUsed) + ' ' + eText + '합니다!<br>';
        buf.dur += valueUsed;
      }
    }
    
    
    if (eff.setCooldown) {
      eff.cooldown = eff.setCooldown;
    }
    if (eff.setTurnCooldown) {
      eff.turnCooldown = eff.setTurnCooldown;
      this.cooldowns.push(eff);
    }
    if (eff.maxUses) {
      eff.uses = (eff.uses || 0) + 1;
    }
    if (eff.isItem) {   // 달빛 스택 소거
      const mb = (winner.buffs || []).find(x => x.id === 10590);
      if (mb) { mb.stack = (mb.stack || 1) - 1; if (mb.stack <= 0) { removeBuff(mb); this.result += '[ 태초의 흔들리는 달빛 ] 달빛이 모두 흔들려 사라졌다.<br>'; } }
    }
    // ---- 후속 처리 (5급 아이템용) ----
    if (eff.removeSelfBuff) {
      for (const b of (winner.buffs || []).filter(x => eff.removeSelfBuff.includes(x.id))) removeBuff(b);
    }
    if (eff.removeOppBuff) {
      for (const b of (loser.buffs || []).filter(x => eff.removeOppBuff.includes(x.id))) removeBuff(b);
    }
    if (eff.thenSelfBuff) {
      const bo = buffMdl.getBuffData({ buffCode : eff.thenSelfBuff.buffCode }); bo.dur = eff.thenSelfBuff.buffDur;
      this.giveBuff(winner, winner, bo, true, eff.name);
    }
    if (eff.chainBuff) {
      const bo = buffMdl.getBuffData({ buffCode : eff.chainBuff }); bo.dur = 1;
      this.giveBuff(winner, winner, bo, true, eff.name);
    }
    if (eff.chainHit) {
      const v = Math.max(1, Math.round(loser.curHp * eff.chainHit.value));
      loser.curHp -= v;
      this.result += '[ ' + eff.name + ' ] 효과로 ' + loser.name + '에게 ' + v + ' 피해!<br>';
    }
    if (eff.turnReduce) {
      eff.buff.dur -= eff.turnReduce;
    }
    if (eff.stackReduce) {
      eff.buff.stack -= eff.stackReduce;
      if (eff.buff.stack <= 0) {
        removeBuff(eff.buff);
      }
    }
    if (eff.chanceReduce) {
      eff.chance -= eff.chanceReduce;
    }
    if (eff.removeEffect) {
      eff.code = -1;
    }
    if (eff.removeBuff) {
      removeBuff(eff.buff);
    }
    if (eff.printText) {
      this.result += eff.printText + '<br>';
    }

    if (eff.loop) {
      this.resolveEffects(winner, loser, [eff], damage, skill);
    }
    if (eff.breakResolution) {
      break;
    }
  }
}

Battlemodule.prototype.resolveTurnBegin = function(winner, loser) {
  winner.hitThisTurn = false; loser.hitThisTurn = false;   // 글로리 맥스·채찍-PT용
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_TURN_START), null);
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TURN_START), null);
  if (this.checkDrive(winner, cons.ACTIVE_TYPE_TURN_START, loser)) {
    this.resolveDrive(winner, loser);
  }
  if (this.checkDrive(loser, cons.ACTIVE_TYPE_TURN_START, winner)) {
    this.resolveDrive(loser, winner);
  }
  this.resolveTurnBeginChar(winner, loser);
  this.resolveTurnBeginChar(loser, winner);
  calcStats(winner, loser);
  calcStats(loser, winner);
  for (eff of this.cooldowns) {
    eff.turnCooldown--;
  }
  this.cooldowns = this.cooldowns.filter(x => (x.turnCooldown > 0));
}

Battlemodule.prototype.resolveTurnBeginChar = function(chara, opp) {

  this.resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_TURN_START), null);
  for (buff of chara.buffs) {
    if (buff.durOff === cons.DURATION_TYPE_TURN_START) {
      buff.dur--;
    }
    if (buff.dur <= 0) {
      this.resolveEffects(chara, opp, buff.effect.filter(x => (x.active === cons.ACTIVE_TYPE_DURATION_END)));
    }
  }
  chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
}

Battlemodule.prototype.resolveTurnEnd = function(winner, loser) {
  if (this.checkDrive(winner, cons.ACTIVE_TYPE_TURN_END, loser)) {
    this.resolveDrive(winner, loser);
  }
  if (this.checkDrive(loser, cons.ACTIVE_TYPE_TURN_END, winner)) {
    this.resolveDrive(loser, winner);
  }
  calcStats(winner, loser);
  calcStats(loser, winner);
  this.resolveTurnEndChar(winner, loser, 0);
  this.resolveTurnEndChar(loser, winner, 1);
  winner.winLast = true;
  loser.winLast = false;
  winner.streak = (winner.streak || 0) + 1;
  loser.streak = 0;
  if (winner.curHp > winner.stat.maxHp) {
    winner.curHp = winner.stat.maxHp;
  }
  if (loser.curHp > loser.stat.maxHp) {
    loser.curHp = loser.stat.maxHp;
  }
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_AFTER_TURN_END));
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_AFTER_TURN_END));
  this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_AFTER_TURN_END));
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_AFTER_TURN_END));
}

Battlemodule.prototype.resolveTurnEndChar = function(chara, opp, flag) {
  chara.curHp += chara.stat.hpRegen;
  chara.curSp += chara.stat.spRegen;
  chara.curHp = Math.round(10 * chara.curHp) / 10;
  chara.curSp = Math.round(10 * chara.curSp) / 10;
  if (chara.skillOri.drive && chara.skillOri.drive.cooldown > 0) {
    chara.skillOri.drive.cooldown--;
  }

  this.resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_TURN_END));
  this.resolveEffects(chara, opp, getItemEffects(chara, cons.ACTIVE_TYPE_TURN_END));
  this.resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_TURN_END_WIN + flag));
  for (buff of chara.buffs) {
    if (buff.durOff === cons.DURATION_TYPE_TURN_END) {
      buff.dur--;
    }
    if (buff.dur <= 0) {
      this.resolveEffects(chara, opp, buff.effect.filter(x => (x.active === cons.ACTIVE_TYPE_DURATION_END)));
    }
  }
  chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
}

function findBuffByCode(chara, code) {
  if (!chara.buffs || chara.buffs.length === 0) {
    return [];
  }
  return chara.buffs.map(x => x.effect).reduce((acc, val) => acc.concat(val)).filter(x => (x.code == code));
}

function findBuffByIds(chara, ids) {
  if (!chara.buffs || chara.buffs.length === 0) {
    return [];
  }
  return chara.buffs.filter(x => ids.includes(x.id));
}

Battlemodule.prototype.giveBuff = function(src, recv, buffObj, printFlag, name) {
  const srcText = name ? '[ ' + name + ' ] 효과로 ' : '';
  // 소명의 길 : 블루플레임 — 자신이 부여하는 [화상]을 [청화]로
  if (buffObj.id === 1 && src !== recv && src.stat && src.stat.blueFlame) {
    const dur = buffObj.dur; buffObj = buffMdl.getBuffData({ buffCode : 10535 }); buffObj.dur = dur;
  }
  // 상태이상 지속 단축 (엘바스의 유산 - 어스퀘이드): 표준 상태이상의 지속턴 감소 (최소 1)
  if (buffObj.isDebuff && src !== recv && recv.stat && recv.stat.debuffDurReduce && buffObj.dur && buffObj.id <= 12) {
    buffObj.dur = Math.max(1, buffObj.dur - recv.stat.debuffDurReduce);
  }
  // 땅에 닿지 않는 밑창: 자신은 상대에게 상태이상을 걸 수 없다
  if (buffObj.isDebuff && src !== recv && src.items && Object.values(src.items).some(it => it && it.noGiveDebuff)) return;
  // 통아저씨 룰렛: 부여하는/받는 [기절] +1턴
  if (buffObj.id === 4 && src !== recv && buffObj.dur) {
    buffObj.dur += ((src.stat && src.stat.stunGive) || 0) + ((recv.stat && recv.stat.stunRecv) || 0);
  }
  // 상태이상 저항: stat.resistAll + stat['resist_<id>'] 확률로 무효 (디버프에만)
  if (buffObj.isDebuff && src !== recv && recv.stat && !buffObj.unresistable) {
    const res = (recv.stat.resistAll || 0) + (recv.stat['resist_' + buffObj.id] || 0);
    if (res > 0 && Math.random() < res) {
      this.result += srcText + '[ ' + buffObj.name + ' ] 효과를 ' + recv.name + '이(가) 저항했다!<br>';
      return;
    }
  }
  if (recv.bossStatus && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(buffObj.id)) {
    if (Math.random < recv.bossStatus) {
      this.result += '보스 상태이상 저항으로 [ ' + buffObj.name + ' ] 효과가 무효화되었다!<br>';
      return;
    }
  }
  for (eff of (src === recv ? [] : findBuffByCode(recv, cons.EFFECT_TYPE_PREVENT_DEBUFF))) {   // 자기 부작용은 막지 않음 (되비침이 자신에게 무한 반사되던 문제)
    if (eff.turnCooldown && eff.turnCooldown > 0) {
      continue;
    }
    if (eff.standard && ![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(buffObj.id)) {
      continue;
    }
    if (buffObj.isDebuff && buffObj.dispellable) {
      this.result += srcText + '[ ' + buffObj.name + ' ] 효과가 무효화되었다!<br>';
      this.resolveEffects(recv, src, getBuffEffects(recv, cons.ACTIVE_TYPE_PREVENT_DEBUFF), buffObj);
      this.resolveEffects(recv, src, getItemEffects(recv, cons.ACTIVE_TYPE_PREVENT_DEBUFF), buffObj);
      this.resolveEffects(recv, src, [eff], buffObj);
      return;
    }
  }
  this.resolveEffects(src, recv, getBuffEffects(src, cons.ACTIVE_TYPE_GIVE_BUFF), buffObj);
  this.resolveEffects(src, recv, getItemEffects(src, cons.ACTIVE_TYPE_GIVE_BUFF), buffObj);
  this.resolveEffects(recv, src, getBuffEffects(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF), buffObj);
  this.resolveEffects(recv, src, getItemEffects(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF), buffObj);
  
  if (printFlag) {
    const curB = (recv.buffs || []).find(x => x.id === buffObj.id);
    this.result += srcText + recv.name + getUnnun(recv.nameType) + ' [ ' + buffObj.name + ' ] 효과를 받았습니다!' + (curB && curB.stack > 1 ? ' (' + curB.stack + '중첩)' : '') + '<br>';
  }
  
  for (var eff of buffObj.effect) {
    eff.buff = buffObj;
    eff.name = buffObj.name;
  }

  var buffChk = recv.buffs.find(e => (e.id === buffObj.id));
  if (buffChk) {
    if (buffObj.stackType === 1) {
      buffChk.dur = buffObj.dur;
      if (buffObj.value) {
        buffChk.value = buffObj.value;
      }
      if (buffObj.effect[0].value) {
        buffChk.effect[0].value = buffObj.effect[0].value;
      }
      if (buffChk.stack) {
        buffChk.stack = buffObj.stack;
      }
    } else if (buffObj.stackType === 2) {
      if (buffChk.maxStack && buffChk.maxStack <= buffChk.stack) {
        return;
      }
      if (buffChk.dur) {
        buffChk.dur = buffObj.dur;        
      }
      const add = buffObj.stack && buffObj.stack > 1 ? buffObj.stack : 1;   // 여러 중첩을 한 번에 주는 경우 반영
      buffChk.stack = (buffChk.stack || 1) + add;
      if (buffChk.maxStack && buffChk.stack > buffChk.maxStack) {
        buffChk.stack = buffChk.maxStack;
      }
    } else if (buffObj.stackType === 3) {
      recv.buffs.push(buffObj);
    } else if (buffObj.stackType === 4) {
      buffChk.stack += buffObj.stack;
      if (buffChk.maxStack && buffChk.maxStack <= buffChk.stack) {
        buffChk.stack = buffChk.maxStack;
      }
    }
  } else {
    if (buffObj.stackType === 2 && !buffObj.stack) buffObj.stack = 1;   // 스택형은 첫 부여도 1중첩으로 표기
    buffObj.gainTurn = this.turnCount;
    if (buffObj.maxStack && buffObj.stack > buffObj.maxStack) buffObj.stack = buffObj.maxStack;
    recv.buffs.push(buffObj);
  }       
  
  if (this.checkDrive(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF)) {
    this.resolveDrive(recv, src, buffObj);
  }
}

function removeBuff(buff) {
  buff.id = -1;
  buff.dur = 0;
  buff.effect = [];
}

Battlemodule.prototype.checkDrive = function(chara, active, arg) {
  if (!chara.skill.drive) {
    return false;
  }
  if (chara.skill.drive.active !== active) {
    return false;
  }
  if (chara.skill.drive.chk && findBuffByIds(chara, chara.skill.drive.chk).length == 0) {
    return false;
  }
  if (chara.skill.drive.chkOpp && findBuffByIds(arg, chara.skill.drive.chkOpp).length == 0) {
    return false;
  }
  if (chara.skill.drive.chkNot && findBuffByIds(chara, chara.skill.drive.chkNot).length > 0) {
    return false;
  }
  if (chara.skill.drive.chkHp && chara.curHp > (chara.stat.maxHp * chara.skill.drive.chkHp)) {
    return false;
  }
  if (chara.skill.drive.chkSameAttack && chara.lastSkill !== arg) {
    return false;
  }
  if (chara.skill.drive.chkWinLast && !chara.winLast) {
    return false;
  }
  if (chara.skillOri.drive.cooldown && chara.skillOri.drive.cooldown > 0) {
    return false;
  }
  if (chara.skill.drive.checkFunc) {
    if (!this.modFunc[chara.skill.drive.checkFunc](chara, arg, this)) {
      return false;
    }
  }
  if (chara.skill.drive.fireOnce) {
    chara.skillOri.drive.active = null;
  }
  var chanceUsed = chara.skill.drive.chance;
  if (chara.skill.drive.chanceModFunc) {
    chanceUsed = this.modFunc[chara.skill.drive.chanceModFunc](chara, arg, chanceUsed);
  }
  return getRandom(chanceUsed) && chara.curSp >= chara.skill.drive.cost && findBuffByCode(chara, 10010).length == 0;
}

Battlemodule.prototype.resolveDrive = function(chara, opp, damage) {
  chara.skillOri.drive.cooldown = chara.skill.drive.setCooldown;
  chara.curSp -= chara.skill.drive.cost;
  this.result += '<div class="driveSkill">[ ' + chara.name + ' ] Drive Skill - [ ' + chara.skill.drive.name + ' ] 발동!</div>';
  this.resolveEffects(chara, opp, chara.skill.drive.effect, damage);
  this.resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_USE_DRIVE), damage, chara.skill.drive);
  this.resolveEffects(chara, opp, getItemEffects(chara, cons.ACTIVE_TYPE_USE_DRIVE), damage, chara.skill.drive);
  this.resolveEffects(opp, chara, getBuffEffects(opp, cons.ACTIVE_TYPE_OPP_USE_DRIVE), damage, chara.skill.drive);
  this.resolveEffects(opp, chara, getItemEffects(opp, cons.ACTIVE_TYPE_OPP_USE_DRIVE), damage, chara.skill.drive);
}

function getItemEffects(chara, active) {
  if (!active) {
    active.k;
  }
  var rval = [];
  var sockets = [];
  const weaponSealed = (chara.buffs || []).some(b => b.id === 10514);   // [무기 시공간 추락]
  for (val in chara.items) {
    if (weaponSealed && val === 'weapon') continue;
    rval = rval.concat(chara.items[val].effect.filter(x => (x.active === active)).map(x => { x.isItem = true; return x; }));
    if (chara.items[val].socket) {
      for (sock of chara.items[val].socket) {
        sockets = sockets.concat(sock.effect.filter(x => (x.active === active)));
      }
    }
  }
  if (active == cons.ACTIVE_TYPE_CALC_STATS) {
    var sval = [];
    for (sock of sockets) {
      if (sval.findIndex(x => x.key == sock.key) == -1) {
        var nv = JSON.parse(JSON.stringify(sock));
        nv.value = 0;
        for (ns of sockets.filter(x => x.key == sock.key)) {
          nv.value += ns.value;
        }
        sval.push(nv);
      }
    }
    rval = rval.concat(sval);
  } else {
    rval = rval.concat(sockets);
  }
  return rval;
}

function getBuffEffects(chara, active) {
  if (!active) {
    active.k;
  }
  if (!chara.buffs || chara.buffs.length === 0) {
    return [];
  }
  return chara.buffs.map(x => x.effect).reduce((acc, val) => acc.concat(val)).filter(x => (x.active == active));
}

// 버프 툴팁: 효과 목록에서 설명 생성
const ACTIVE_KO = { 0 : '공격 시', 1 : '턴 시작 시', 2 : '턴 종료 시', 3 : '피격 시', 4 : '전투 시작 시', 6 : '공격 시', 10 : '', 12 : '', 13 : '', 14 : '상태이상 받을 때', 18 : '상성 패배 시', 19 : '치명타 시', 26 : '드라이브 발동 시', 29 : '', 30 : '피격 시', 32 : '무승부 시', 40 : '턴 종료 후' };
function describeBuff(b) {
  const lines = [];
  for (const e of (b.effect || [])) {
    const when = ACTIVE_KO[e.active] !== undefined ? ACTIVE_KO[e.active] : '';
    const pre = when ? when + ' ' : '';
    const kname = printName[e.key] || e.key;
    const pct = (v) => (v > 0 ? '+' : '') + (Math.round(v * 1000) / 10) + '%';
    if (e.code === cons.EFFECT_TYPE_STAT_ADD) lines.push(kname + ' ' + (Math.abs(e.value) < 1 && ['crit', 'critDmg', 'hit', 'evasion', 'phyReduce', 'magReduce', 'pierce', 'resistAll', 'chanceEnh', 'ruleBreaker'].includes(e.key) || String(e.key).startsWith('resist_') ? pct(e.value) + 'p' : (e.value > 0 ? '+' : '') + e.value) + (b.stack ? ' ×' + b.stack : ''));
    else if (e.code === cons.EFFECT_TYPE_STAT_PERCENTAGE) lines.push(kname + ' ' + pct(e.value) + (b.stack ? ' ×' + b.stack : ''));
    else if (e.code === cons.EFFECT_TYPE_STAT_MULTIPLY) lines.push(kname + ' ×' + e.value);
    else if (e.code === cons.EFFECT_TYPE_SHIELD) lines.push('보호막 ' + e.value);
    else if (e.code === cons.EFFECT_TYPE_SELF_HIT) {
      const amt = e.isPercentStat ? '최대 ' + (printName[e.percentKey] || e.percentKey) + '의 ' + Math.round(e.value * 100) + '%' : e.isPercentChar && e.percentKey === 'curHp' ? '현재 생명력의 ' + Math.round(e.value * 100) + '%' : e.isPercentOppStat ? '상대 ' + (printName[e.percentKey] || e.percentKey) + '의 ' + Math.round(e.value * 100) + '%' : e.value;
      lines.push(pre + amt + ' 피해');
    }
    else if (e.code === cons.EFFECT_TYPE_SELF_HP) lines.push(pre + '생명력 ' + (e.isPercentStat ? Math.round(e.value * 100) + '%' : (e.value > 0 ? '+' : '') + e.value));
    else if (e.code === cons.EFFECT_TYPE_SELF_SP) lines.push(pre + 'SP ' + (e.value > 0 ? '+' : '') + e.value);
    else if (e.code === cons.EFFECT_TYPE_OPP_SP) lines.push(pre + '상대 SP ' + e.value);
    else if (e.code === cons.EFFECT_TYPE_MULTIPLY_DAMAGE) lines.push(pre + (e.active === 13 ? '받는 ' : '') + '피해 ' + (e.stackable ? pct(e.value) + '/중첩' : pct(e.value - 1)));
    else if (e.code === cons.EFFECT_TYPE_ADD_DAMAGE) lines.push(pre + '공격 계수 +' + e.value);
    else if (e.code === cons.EFFECT_TYPE_ADD_HIT) lines.push(pre + '추가 타격');
    else if (e.code === cons.EFFECT_TYPE_OPP_BUFF) lines.push(pre + '상대에게 버프 부여');
    else if (e.code === cons.EFFECT_TYPE_SELF_BUFF) lines.push(pre + '자신에게 버프 부여');
    else if (e.code === cons.EFFECT_TYPE_SET_SKILL) lines.push('스킬 교체');
    else if (e.code === 10004) lines.push('행동 불가');
    else if (e.code === 10006) lines.push('행동 불가 (빙결)');
    else if (e.turnReduce) lines.push('버프 지속 -' + e.turnReduce + '턴');
    else if (e.code === 10005) lines.push('스페셜 사용 불가');
    else if (e.code === 10011) lines.push('무작위 행동');
    else if (e.code === 10010) lines.push('스킬 봉인');
    else if (e.code === cons.EFFECT_TYPE_REMOVE_BUFF) lines.push(pre + '버프 제거');
  }
  if (b.tooltip && b.id >= 1 && b.id <= 12) return b.tooltip;   // 표준 상태이상은 설명문만
  if (b.tooltip) lines.unshift(b.tooltip);
  return lines.length ? [...new Set(lines)].join('<br>') : (b.isDebuff ? '디버프' : '버프');
}
// 성자의 숫자: KST 특정 시간대에 이 장비의 스탯 배율
function itemTimeMult(it) {
  if (!it || !it.timeMult) return 1;
  const h = (new Date(Date.now() + 9 * 3600 * 1000)).getUTCHours();
  return it.timeMult.hours.some(([a, b]) => h >= a && h < b) ? it.timeMult.mult : 1;
}
function calcStats(chara, opp) {
  for (var key in chara.base) {
    chara.stat[key] = chara.base[key];
  }
  for (var key in chara.stat) { if (!(key in chara.base)) chara.stat[key] = 0; }   // base에 없는 키(저항 등)는 매번 0에서
  for (var key in chara.items) {
    if (!chara.items[key]) {
      continue;
    }
    var tm = itemTimeMult(chara.items[key]);
    for (var keyItem in chara.items[key]['stat']) {
      chara.stat[keyItem] = (chara.stat[keyItem] || 0) + chara.items[key]['stat'][keyItem] * tm;
    }
  }
  for (var key in chara.items) {   // 아이템 % 스탯 (고서 - 죽음에 대하여 등)
    if (chara.items[key] && chara.items[key].pctStat) for (var pk in chara.items[key].pctStat) chara.stat[pk] = (chara.stat[pk] || 0) * (1 + chara.items[key].pctStat[pk]);
  }
  chara.name = chara.nameOri;
  chara.nameType = chara.nameTypeOri;
  chara.skill = JSON.parse(JSON.stringify(chara.skillOri));

  for (val of getBuffEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (stackMpl > val.maxApply) {
      stackMpl = val.maxApply;
    }
    if (val.isPercentStat) {
      stackMpl *= chara.stat[val.percentKey];
    }
    if (val.isPercentItem) {
      stackMpl *= chara.items[val.itemKey].stat[val.percentKey];
    }
    
    if (val.chk && findBuffByIds(chara, val.chk).length === 0) {
      continue;
    }
    if (val.chkAll && findBuffByIds(chara, val.chkAll).length < val.chkAll.length) {
      continue;
    }
    
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] = (chara.stat[val.key] || 0) + val.value * stackMpl;
    } else if (val.code === cons.EFFECT_TYPE_SET_NAME) {
      chara.name = val.value;
      chara.nameType = val.type;
    } 
  }
  for (val of getBuffEffects(opp, cons.ACTIVE_TYPE_OPP_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.code === cons.EFFECT_TYPE_OPP_STAT_ADD) {
      chara.stat[val.key] = (chara.stat[val.key] || 0) + val.value * stackMpl;
    }
  }
  for (val of getItemEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.isPercentStat) {
      stackMpl *= chara.stat[val.percentKey];
    } else if (val.isPercentItemValue) {
      stackMpl *= val.item.itemValue;
    } else if (val.isPercentSkill) {
      stackMpl *= ((chara.skill[val.skillKey] || {})[val.percentKey] || 0);   // 드라이브/스페셜이 없는 캐릭터(정규화 몬스터) 방어
    } else if (val.isPercentCurSp) {
      stackMpl *= (chara.skill.special && chara.skill.special.cost ? ((chara.curSp * 100) / chara.skill.special.cost) : 0);
    }
    
    if (val.countInv) {
      var usedMpl = chara.inventory.length;
      if (usedMpl > val.maxValue) {
        usedMpl = val.maxValue;
      }
      stackMpl *= usedMpl;
    }
    
    if (val.chk && findBuffByIds(chara, val.chk).length === 0) {
      continue;
    }
    if (val.chkOppIsFallen && !(opp && opp.isFallen)) {
      continue;
    }
    if (val.chkOppIsMonster && !(opp && opp.isMonster)) {
      continue;
    }
    if (val.chkTitle && opp.title !== val.chkTitle) {
      continue;
    }
    if (val.chkHp && chara.curHp > (chara.stat.maxHp * val.chkHp)) {
      continue;
    }
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] = (chara.stat[val.key] || 0) + val.value * stackMpl;
    }
  }

  for (val of getBuffEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.isPercentStat) {
      stackMpl *= chara.stat[val.percentKey];
    }

    if (val.chkNot && findBuffByIds(chara, val.chkNot).length > 0) {
      continue;
    }
    
    if (val.code === cons.EFFECT_TYPE_SET_SKILL) {
      if (val.key === 'base') {
        var valueSel = val.randomValue ? Math.floor(Math.random() * 3) : val.value;
        chara.skill.base[valueSel] = JSON.parse(JSON.stringify(val.target));
      } else if (val.key) {
        chara.skill[val.key] = JSON.parse(JSON.stringify(val.target));
      }
    } else if (val.code === cons.EFFECT_TYPE_ADD_SKILL_VALUE) {
      if (val.type == 'base') {
        if (val.effIndex !== undefined && chara.skill.base[val.skillKey].effect[val.effIndex]) {
          chara.skill.base[val.skillKey].effect[val.effIndex][val.key] += val.value * stackMpl;
        } else if (val.set) {
          chara.skill.base[val.skillKey][val.key] = val.value;
        }
      } else {
        chara.skill[val.type][val.key] += val.value * stackMpl;
      }
    }
  }
  
  // multiplication must be last (x0 case)
  for (val of getBuffEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.chk && findBuffByIds(chara, val.chk).length === 0) {
      continue;
    }
    
    if (val.code === 'skillDamageSet') {   // [광란의 추적]: 지정 슬롯 계수 고정
      const sk = chara.skill && chara.skill.base && chara.skill.base[val.slot];
      const setv = (chara.skill && chara.skill.special && chara.skill.special.setChaseDamage) || val.value;
      if (sk) sk.damage = setv;
      continue;
    }
    if (val.code === cons.EFFECT_TYPE_STAT_MULTIPLY) {
      chara.stat[val.key] *= Math.pow(val.value, stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_STAT_PERCENTAGE) {
      chara.stat[val.key] *= (1 + val.value * stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_SP_COST_PERCENTAGE) {
      if (chara.skill[val.key]) chara.skill[val.key].cost *= (1 + val.value * stackMpl);
    }
  }
  for (val of getItemEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.code === cons.EFFECT_TYPE_STAT_MULTIPLY) {
      chara.stat[val.key] *= Math.pow(val.value, stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_STAT_PERCENTAGE) {
      chara.stat[val.key] *= (1 + val.value * stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_SP_COST_PERCENTAGE) {
      if (chara.skill[val.key]) chara.skill[val.key].cost *= (1 + val.value * stackMpl);
    }
  }
  
  chara.stat.maxHp = Math.round(chara.stat.maxHp);
  // 체력 증가 버프(도시 태그·동물 스택 등): 전투 중 최대 체력이 새 최고치를 찍으면 늘어난 만큼 현재 체력도 올린다.
  // 최고치 기준이라 버프가 꺼졌다 켜지는 식으로 반복 회복되지는 않는다.
  if (chara.maxHpPeak === undefined || chara.curHp === undefined) {
    chara.maxHpPeak = chara.stat.maxHp;
  } else if (chara.stat.maxHp > chara.maxHpPeak) {
    if (chara.curHp > 0) chara.curHp += chara.stat.maxHp - chara.maxHpPeak;
    chara.maxHpPeak = chara.stat.maxHp;
  }
  if (chara.curHp > chara.stat.maxHp) {
    chara.curHp = chara.stat.maxHp;
  }
  chara.stat.hpRegen = Math.round(10 * chara.stat.hpRegen) / 10;
  chara.stat.spRegen = Math.round(10 * chara.stat.spRegen) / 10;
  for (const k in (chara.items || {})) {   // 스킬 아티팩트: 스킬 변조
    const it = chara.items[k]; if (!it || !it.skillMod) continue;
    const m = it.skillMod;
    if (m.add) chara.skill.base.forEach((sk, i) => { if (sk && sk.damage !== undefined && m.add[i]) sk.damage = Math.round((sk.damage + m.add[i]) * 100) / 100; });
    if (m.addAll) chara.skill.base.forEach(sk => { if (sk && sk.damage !== undefined) sk.damage = Math.round((sk.damage + m.addAll) * 100) / 100; });
    if (m.mult) chara.skill.base.forEach((sk, i) => { if (sk && sk.damage !== undefined && m.mult[i]) sk.damage = Math.round(sk.damage * m.mult[i] * 100) / 100; });
    if (m.average) { const ds = chara.skill.base.map(sk => sk && sk.damage || 0); const avg = Math.round(ds.reduce((a, b) => a + b, 0) / ds.length * 100) / 100; chara.skill.base.forEach(sk => { if (sk && sk.damage !== undefined) sk.damage = avg; }); }
    if (m.typeHigh) for (const i of m.typeHigh) { const sk = chara.skill.base[i]; if (sk) sk.type = (chara.stat.phyAtk || 0) >= (chara.stat.magAtk || 0) ? cons.DAMAGE_TYPE_PHYSICAL : cons.DAMAGE_TYPE_MAGICAL; }
    if (chara.skill.special) { if (m.specialCostMul) chara.skill.special.cost = Math.round(chara.skill.special.cost * m.specialCostMul); if (m.specialDmgMul && chara.skill.special.damage) chara.skill.special.damage = Math.round(chara.skill.special.damage * m.specialDmgMul * 100) / 100; }
    if (m.focus !== undefined && chara.run && chara.run.focusSkill !== undefined) chara.skill.base.forEach((sk, i) => { if (sk && sk.damage !== undefined) sk.damage = Math.round(sk.damage * (i === chara.run.focusSkill ? 2 : 0.5) * 100) / 100; });
    if (m.lowHpAdd && chara.curHp <= chara.stat.maxHp * m.lowHpAdd.hp) chara.skill.base.forEach(sk => { if (sk && sk.damage !== undefined) sk.damage = Math.round((sk.damage + m.lowHpAdd.add) * 100) / 100; });
  }
  if (chara.skillScale) {   // 로그라이크 몬스터 정규화: 버프로 세팅된 스킬 계수·스페셜 비용 보정 (사천왕/레드)
    for (const sk of chara.skill.base) if (sk && sk.damage) sk.damage = Math.round(sk.damage * chara.skillScale.damage * 100) / 100;
    if (chara.skill.special && chara.skillScale.specialCost) chara.skill.special.cost = Math.round(chara.skill.special.cost * chara.skillScale.specialCost);
  }
  for (const k in (chara.items || {})) {   // 재창시의 룬: 두 갈래를 높은 쪽 하나로 합친다 (합산 × 보너스, 낮은 쪽은 0)
    const rune = chara.items[k]; if (!rune || !rune.unifyAtk) continue;
    const bonus = rune.unifyAtk === true ? 1.2 : rune.unifyAtk;
    const phySum = (chara.stat.phyAtk || 0) + (chara.stat.phyAtkMin || 0), magSum = (chara.stat.magAtk || 0) + (chara.stat.magAtkMin || 0);
    const toPhy = phySum >= magSum;
    for (const [a, b] of [['phyAtk', 'magAtk'], ['phyAtkMin', 'magAtkMin'], ['phyAtkMax', 'magAtkMax']]) {
      const hi = toPhy ? a : b, lo = toPhy ? b : a;
      chara.stat[hi] = Math.round(((chara.stat[a] || 0) + (chara.stat[b] || 0)) * bonus);
      chara.stat[lo] = 0;
    }
    break;
  }
  for (const k in (chara.items || {})) {   // 태그 중첩당 스탯 (외우주 라인)
    const it = chara.items[k]; if (!it || !it.perTag) continue;
    const tb = (chara.buffs || []).find(b => b.id === it.perTag.tag); const st = tb ? (tb.stack || 1) : 0;
    if (st > 0) for (const sk in it.perTag.stat) chara.stat[sk] = (chara.stat[sk] || 0) + it.perTag.stat[sk] * st;
  }
  chara.stat.maxHp = Math.round(chara.stat.maxHp);
  const sciTag = (chara.buffs || []).find(b => b.id === 10610);
  if (chara.skill.special && sciTag) {   // 반중력 기술 문서 / 첨단 합금 분열포: 태그에 따른 스페셜 비용 할인
    for (const k in (chara.items || {})) { const it = chara.items[k]; if (!it || !it.sciSpDiscount) continue;
      if (it.sciSpDiscount.perStack) chara.skill.special.cost *= (1 - Math.min(it.sciSpDiscount.max || 1, it.sciSpDiscount.perStack * (sciTag.stack || 1)));
      else if ((sciTag.stack || 1) >= it.sciSpDiscount.stack) chara.skill.special.cost *= (1 - it.sciSpDiscount.value); }
  }
  if (chara.skill.special) {
    chara.skill.special.cost = Math.round(10 * chara.skill.special.cost) / 10;
  }
}

// 드라이브 조건/확률 보정 함수 (인스턴스마다 동일, 직렬화 대상 아님)
function makeModFuncs() {
  const f = [];
  f[0] = function (chara, opp, chance) { var tmp = opp.curHp / opp.stat.maxHp - chara.curHp / chara.stat.maxHp; tmp = tmp > 0 ? tmp : 0; return chance + tmp; };
  f[1] = function (chara, opp, data) { var ens = findBuffByIds(chara, [201793]); return (ens.length == 0 || ens[0].stack < 12) && (data.leftWin == data.rightWin); };
  f[2] = function (chara, opp, data) { var ens = getShieldValue2(chara); return (chara.curHp * 0.2 <= ens) && (chara.stat.maxHp * 0.05 <= ens); };
  return f;
}
Battlemodule.prototype._isBattleFinished = function() {
  return (this.charLeft.curHp <= 0 || this.charRight.curHp <= 0);
}

function getRandom(percent) {
  return (Math.random() < percent);
}

function getIga(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '가' : '이';
}

function getUro(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '로' : '으로';
}

function getUlrul(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '를' : '을';
}

function getUnnun(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '는' : '은';
}

function _initChar(char, flag) {
  if (flag === undefined) {
    char.curHp = char.stat.maxHp;
    char.curSp = 0;
  }
  char.curSp = char.curSp ? char.curSp : 0;
  char.buffs = [];
  char.nameOri = char.name;
  char.nameTypeOri = char.nameType;
  delete char.maxHpPeak;   // 체력 최고치 기록은 전투마다 새로
  char.skillOri = JSON.parse(JSON.stringify(char.skill));
  for (const k in (char.items || {})) {   // 드라이브 교체 아이템 (흑마법 의식 로브)
    const it = char.items[k]; if (it && it.driveOverride) char.skillOri.drive = JSON.parse(JSON.stringify(it.driveOverride));
  }
  char.lastDamage = 0;
  char.damageDone = 0;
  char.damageTaken = 0;
  char.maxDamageDone = 0;
  char.maxDamageTaken = 0;
  if (char.items.weapon) {
    for (eff of char.items.weapon.effect) {
      eff.item = char.items.weapon;
    }
  }
  if (char.items.armor) {
    for (eff of char.items.armor.effect) {
      eff.item = char.items.armor;
    }
  }
  if (char.items.subarmor) {
    for (eff of char.items.subarmor.effect) {
      eff.item = char.items.subarmor;
    }
  }
  if (char.items.trinket) {
    for (eff of char.items.trinket.effect) {
      eff.item = char.items.trinket;
    }
  }
  if (char.items.skillArtifact) {
    for (eff of char.items.skillArtifact.effect) {
      eff.item = char.items.skillArtifact;
    }
  }
}

function getShieldValue (chara) {
  var ret = findBuffByCode(chara, cons.EFFECT_TYPE_SHIELD).map(x => x.value);
  ret.push(0);
  return ret.reduce((acc, val) => acc + val);
}

function getShieldValue2 (chara) {
  var ret = findBuffByCode(chara, cons.EFFECT_TYPE_SHIELD).filter(x => x.name == '전자기 보호막').map(x => x.value);
  ret.push(0);
  return ret.reduce((acc, val) => acc + val);
}

Battlemodule.prototype.printCharInfo = function(flag) {
  this.result += '<div class="charInfoWrap">' + printChar(this.charLeft, 'Left', flag) + printChar(this.charRight, 'Right', flag) + '</div>';
}

function printChar(chara, name, flag) {
  var resultStr = '<div class="charInfo">' +
  '<div class="charInfoName color' + name + '">' + chara.name + '</div>' +
  '<div class="charInfoPoint"><span class="charInfoPointView">' + chara.curHp + ' / ' + chara.stat.maxHp + '</span> ';
  if (getShieldValue(chara) > 0) {
    resultStr += '<span class="colorSp">(' + getShieldValue(chara) + ')</span> ';
  }
  
  resultStr +=  '<span class="charInfoPointRegen colorHp">(+' + chara.stat.hpRegen + ') </span>' +
  '</div><div class="charInfoPoint"><span class="charInfoPointView">' + chara.curSp + ' / ' + (chara.skill.special ? chara.skill.special.cost : 'X') + '</span> ' +
  '<span class="charInfoPointRegen colorSp">(+' + chara.stat.spRegen + ')</span></div>';

  if (flag === 0) {
    resultStr += '<div class="charInfoItems">';
    if (chara.items.weapon) {
      resultStr += getItemText('weapon', chara.items.weapon);
    }
    if (chara.items.armor) {
      resultStr += getItemText('armor', chara.items.armor);
    }
    if (chara.items.subarmor) {
      resultStr += getItemText('subarmor', chara.items.subarmor);
    }
    if (chara.items.trinket) {
      resultStr += getItemText('trinket', chara.items.trinket);
    }
    if (chara.items.skillArtifact) {
      resultStr += getItemText('skillArtifact', chara.items.skillArtifact);
    }
    resultStr += '</div>';
  }
  if (flag === 1) {
    resultStr += '<div class="charInfoBuffs">';
    for (val of chara.buffs) {
      resultStr += '<span class="has-tip buffTip">' + val.name;
      if (val.stack) {
        resultStr += ' (' + val.stack + ')';
      }
      if (val.dur) {
        resultStr += ' (' + val.dur + '턴 남음)';
      }
      resultStr += '<span class="itemTooltip">' + describeBuff(val) + '</span></span><br>';
    }
    for (key in chara.items) {
      if (chara.items[key].itemValue > 0) {
        resultStr += chara.items[key].name + ' [' + chara.items[key].itemValue + ']<br>';
      }
    }
    resultStr += '</div>';
  }

  resultStr += '</div>';
  return resultStr;
}

function getItemText(key, val) {
  var resultStr = '';
  resultStr += (key ? (printName[key] + ' : ') : '') + val.name + '<br>(';
  resultStr += Object.entries(val.stat).map(arr => { 
    if (arr[0] == 'phyAtkMin') {
      return  '물리공격력 +' + arr[1] + '~' + val.stat.phyAtkMax;
    } else if (arr[0] == 'magAtkMin') {
      return  '마법공격력 +' + arr[1] + '~' + val.stat.magAtkMax;        
    } else if (arr[0] == 'phyAtkMax' || arr[0] == 'magAtkMax') {
      return '';
    } else {
      var sign = arr[1] > 0 ? '+' : '';
      if (arr[0] == 'phyReduce' || arr[0] == 'magReduce' || arr[0] == 'crit' || arr[0] == 'critDmg' || arr[0] == 'crit' || arr[0] == 'hit' || arr[0] == 'evasion' || arr[0] == 'pierce') {
        arr[1] = (arr[1] * 100).toFixed(2) + '%'; 
      }
      return printName[arr[0]] + ' ' + sign + arr[1];
    }      
  }).filter(x => x.length > 0).join(', ');
  if (val.effectDesc && val.effectDesc.length > 0) {
    resultStr += ', ' + val.effectDesc;
  }
  resultStr += ')<br>';
  return resultStr;
}
