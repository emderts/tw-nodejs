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

  this.modFunc = [];
  this.modFunc[0] = function (chara, opp, chance) {
    var tmp = opp.curHp / opp.stat.maxHp - chara.curHp / chara.stat.maxHp; 
    console.log(tmp);
    tmp = tmp > 0 ? tmp : 0;
    return chance + tmp;
  }
  this.modFunc[1] = function (chara, opp, data) {
    var ens = findBuffByIds(chara, [201793]);
    return (ens.length == 0 || ens[0].stack < 12) && (data.leftWin == data.rightWin);
  }
  this.modFunc[2] = function (chara, opp, data) {
    var ens = getShieldValue(chara);
    return (opp.curHp * 0.3 <= ens) && (opp.stat.maxHp * 0.05 <= ens);
  }

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
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillNum);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillNum);
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
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
    }
    this.result += '</span><br>';

    if (this.checkDrive(loser, cons.ACTIVE_TYPE_TAKE_HIT)) {
      this.resolveDrive(loser, winner, damage);
    }

    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    this.resolveEffects(winner, loser, skillUsed.effect, damage);
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
      winner.curSp = 0;
      this.resolveEffects(winner, loser, winner.skill.special.effect);
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
      loser.curSp = 0;
      this.resolveEffects(loser, winner, loser.skill.special.effect);
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
        this.result += '[ ' + skillFailed.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
        continue;
      } 
      for (val of getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          this.result += '[ ' + val.buff.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
          redecide = true;
          this.resolveEffects(loser, winner, [val], null);
          break;
        }
      }
      for (val of getItemEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          this.result += '[ ' + val.item.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
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
      return;
    }
  } 
  this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillNum);
  this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillNum);
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
      this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
    }
    this.result += '</span><br>';

    if (this.checkDrive(loser, cons.ACTIVE_TYPE_TAKE_HIT)) {
      this.resolveDrive(loser, winner, damage);
    }

    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage, skillUsed);
    this.resolveEffects(winner, loser, skillUsed.effect, damage);
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

  if (winner.skill.special && winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
    this.resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
      this.result += '<div class="specialSkill">[ ' + winner.name + ' ] Special Skill - [ ' + winner.skill.special.name + ' ] 발동!</div>';
      winner.curSp = 0;
      this.resolveEffects(winner, loser, winner.skill.special.effect);
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
      loser.curSp = 0;
      this.resolveEffects(loser, winner, loser.skill.special.effect);
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
  this.resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE), retObj, skill);
  this.resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE), retObj, skill);

  if (skill.type !== cons.DAMAGE_TYPE_ABSOLUTE) {
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

  return retObj;
}

Battlemodule.prototype.dealDamage = function(src, dst, damage) {
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
  if (src !== dst) {
    this.resolveEffects(src, dst, getBuffEffects(src, cons.ACTIVE_TYPE_DEAL_DAMAGE), damage);
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
  dst.curHp -= damageDealt;
}

Battlemodule.prototype.resolveEffects = function(winner, loser, effects, damage, skill) {
  for (var eff of effects) {
    var stackMpl = eff.noStack ? 1 : (eff.buff ? (eff.buff.stack ? eff.buff.stack : 1) : 1);
    if (stackMpl > eff.maxApply) {
      stackMpl = eff.maxApply;
    }
    var chance = eff.chance ? eff.chance : 1;
    if (eff.chanceAddKey) {
      var factor = eff.chanceAddKeyFactor ? eff.chanceAddKeyFactor : 1;
      if (eff.chanceAddKey == 'hit') {
        chance += winner.stat.hit > 1 ? (winner.stat.hit - 1) : 0;
      } else {
        chance += winner.stat[eff.chanceAddKey * factor];
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
    if (eff.chkOppHp && loser.curHp > (loser.stat.maxHp * eff.chkOppHp)) {
      continue;
    }
    if (eff.chkSp && winner.curSp < eff.chkSp) {
      continue;
    }
    if (eff.chkTurn && this.turnCount < eff.chkTurn) {
      continue;
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
    if (eff.chkEquip && !winner.items.values().some(checkInv.bind(this, eff.chkEquip))) {
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
    if (eff.chkLoseLast && winner.winLast) {
      continue;
    }
    if (eff.chkSkillNum && skill !== eff.chkSkillNum) {
      continue;
    }
    if (eff.code === cons.EFFECT_TYPE_SELF_BUFF || eff.code === cons.EFFECT_TYPE_OPP_BUFF) {
      if (eff.direct) {
        damage.dur *= eff.durMod;
        if (damage.dur < 1) {
          this.giveBuff(winner, loser, damage, true);
        }
        continue;
      }
      var buffObj = buffMdl.getBuffData(eff);
      buffObj.dur = eff.buffDur;
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
      } else if (buffObj.id === 201715) {
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
      } else if (buffObj.id === 2017105) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * (winner.stat.maxHp - winner.curHp) * stackMpl);
      } else if (buffObj.id === 2017106) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * (winner.stat.phyAtk + winner.stat.magAtk) * stackMpl);
      }

      if (eff.setStack) {        
        var valueUsed = eff.setStack * stackMpl;
        if (eff.isPercentDamage) {
          valueUsed *= damage.value;
        } else if (eff.addDamage) {
          for (const neff of eff.addDamage) {
            var tempObj = {};
            tempObj.damage = neff.value * stackMpl;
            tempObj.type = neff.type;
            var damageAdd = this.calcDamage(winner, loser, tempObj);
            valueUsed += damageAdd.value;
          }
        }
        if (eff.stackBase) {
          valueUsed += eff.stackBase;
        }
        buffObj.stack = Math.round(valueUsed);
      }
      var recv = (eff.code === cons.EFFECT_TYPE_SELF_BUFF) ? winner : loser;
      this.giveBuff(winner, recv, buffObj, true, eff.name);

    } else if (eff.code === cons.EFFECT_TYPE_SELF_SP || eff.code === cons.EFFECT_TYPE_SELF_HP || eff.code === cons.EFFECT_TYPE_OPP_SP || eff.code === cons.EFFECT_TYPE_OPP_HP) {
      var valueUsed = eff.isPercentMax ? eff.value * winner.stat.maxHp : eff.value;
      var dst = eff.code === cons.EFFECT_TYPE_OPP_SP || eff.code === cons.EFFECT_TYPE_OPP_HP ? loser : winner;
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
        valueUsed *= skill[eff.percentKey];
      } else if (eff.isPercentHpLost) {
        valueUsed *= (winner.stat.maxHp - winner.curHp);
      } else if (eff.isPercentBuffValue) {
        valueUsed *= damage.effect[0].value;
      } else if (eff.isPercentSkill) {
        valueUsed *= winner.skill[eff.skillKey][eff.percentKey];
      }
      if (eff.addAttackCount) {
        const atkCnt = (isLeft ? this.leftWin : this.rightWin);
        valueUsed *= (atkCnt - (this.atkCntBefore ? this.atkCntBefore : 0));
        this.atkCntBefore = atkCnt;
      }
      valueUsed = Math.round(valueUsed * stackMpl);
      if (valueUsed > eff.maxApply) {
        valueUsed = eff.maxApply;
      }
      var target = 'SP';
      if (eff.code === cons.EFFECT_TYPE_SELF_SP) {
        winner.curSp += valueUsed;
      } else if (eff.code === cons.EFFECT_TYPE_OPP_SP) {
        loser.curSp += valueUsed;
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
        tempObj.damage = getShieldValue(source) - tempObj.damage * target.curHp;
      }
      
      if ((eff.percentKey == 'maxHp' || eff.percentKey == 'curHp') && target.boss) {
        tempObj.damage *= (1 - target.boss);
      }
      
      if (eff.buffTarget) {
        if (eff.separate) {
          for (val of findBuffByIds(source, eff.buffTarget)) {
            var damageAdd = this.calcDamage(source, target, tempObj);

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
      var damageAdd = this.calcDamage(source, target, tempObj);

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
      buffObj.dur = eff.buffDur;
      
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
      buffObj.dur = eff.buffDur;

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
      this.resolveEffects(winner, loser, eff.target, damage);
    } else if (eff.code === cons.EFFECT_TYPE_ADD_RESOLUTION) {
      this.resolveEffects(winner, loser, skill.effect, damage);
    } else if (eff.code === cons.EFFECT_TYPE_CONVERT_ITEM) {
      if (eff.randomItem) {
        var tgtList = item.list.filter(x => x.rank === eff.randomItem && x.type < 4);
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
      } else {
        continue;
      }
    } else if (eff.code === cons.EFFECT_TYPE_RESOLVE_MAX_DAMAGE) {
      if (damage.type !== cons.DAMAGE_TYPE_PHYSICAL && damage.type !== cons.DAMAGE_TYPE_MAGICAL) {
        continue;
      }
      damage.diffDmg = damage.atkMax;
      this.result += '최대 공격력이 발휘됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_CHANGE_ATTACK_TYPE) {
      if (eff.anySkill && !skill.code) {
        continue;
      }
      this.result += 'n 공격력이 적용됩니다!<br>';
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
      if (eff.skillCode && eff.skillCode === skill.code) {
        damage.crit = true;
        this.result += '[ ' + eff.name + ' ] 효과로 치명타가 적용됩니다!<br>';
      } else {
        continue;
      }
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLY_DAMAGE_OBJECT || eff.code === cons.EFFECT_TYPE_ADD_DAMAGE_OBJECT) {
      if (eff.skillCode && eff.skillCode === skill.code) {
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
    } else if (eff.code === cons.EFFECT_TYPE_SET_ALL_BUFF_DURATION || eff.code === cons.EFFECT_TYPE_OPP_SET_ALL_BUFF_DURATION) {
      const recv = (eff.code === cons.EFFECT_TYPE_SET_ALL_BUFF_DURATION) ? winner : loser;
      const eText = eff.value > 0 ? '증가' : '감소';
      for (buf of recv.buffs) {
        if (eff.buffCode && eff.buffCode !== buf.id) {
          continue;
        } else if (eff.anyDebuff && (!buf.isDebuff || !buf.dispellable || !buf.durOff)) {
          continue;
        }
        this.result += '[ ' + buf.name + ' ] 효과의 지속시간이 ' + (eff.value > 0 ? eff.value : 0-eff.value) + ' ' + eText + '합니다!<br>';
        buf.dur += eff.value;
      }
    }
    
    
    if (eff.setCooldown) {
      eff.cooldown = eff.setCooldown;
    }
    if (eff.setTurnCooldown) {
      eff.turnCooldown = eff.setTurnCooldown;
      this.cooldowns.push(eff);
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
  if (winner.curHp > winner.stat.maxHp) {
    winner.curHp = winner.stat.maxHp;
  }
  if (loser.curHp > loser.stat.maxHp) {
    loser.curHp = loser.stat.maxHp;
  }
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
  if (recv.bossStatus && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(buffObj.id)) {
    if (Math.random < recv.bossStatus) {
      this.result += '보스 상태이상 저항으로 [ ' + buffObj.name + ' ] 효과가 무효화되었다!<br>';
      return;
    }
  }
  for (eff of findBuffByCode(recv, cons.EFFECT_TYPE_PREVENT_DEBUFF)) {
    if (eff.standard && ![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(buffObj.id)) {
      continue;
    }
    if (buffObj.isDebuff && buffObj.dispellable) {
      this.result += srcText + '[ ' + buffObj.name + ' ] 효과가 무효화되었다!<br>';
      this.resolveEffects(recv, src, getBuffEffects(recv, cons.ACTIVE_TYPE_PREVENT_DEBUFF), buffObj);
      this.resolveEffects(recv, src, getItemEffects(recv, cons.ACTIVE_TYPE_PREVENT_DEBUFF), buffObj);
      return;
    }
  }
  this.resolveEffects(src, recv, getBuffEffects(src, cons.ACTIVE_TYPE_GIVE_BUFF), buffObj);
  this.resolveEffects(src, recv, getItemEffects(src, cons.ACTIVE_TYPE_GIVE_BUFF), buffObj);
  this.resolveEffects(recv, src, getBuffEffects(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF), buffObj);
  this.resolveEffects(recv, src, getItemEffects(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF), buffObj);
  
  if (printFlag) {
    this.result += srcText + recv.name + getUnnun(recv.nameType) + ' [ ' + buffObj.name + ' ] 효과를 받았습니다!<br>';
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
      if (buffChk.stack) {
        buffChk.stack += 1;
      } else {
        buffChk.stack = 2;
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
  for (val in chara.items) {
    rval = rval.concat(chara.items[val].effect.filter(x => (x.active === active)));
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

function calcStats(chara, opp) {
  for (var key in chara.base) {
    chara.stat[key] = chara.base[key];
  }
  for (var key in chara.items) {
    if (!chara.items[key]) {
      continue;
    }
    for (var keyItem in chara.items[key]['stat']) {
      chara.stat[keyItem] += chara.items[key]['stat'][keyItem];
    }
  }
  chara.name = chara.nameOri;
  chara.skill = JSON.parse(JSON.stringify(chara.skillOri));

  for (val of getBuffEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (stackMpl > val.maxApply) {
      stackMpl = val.maxApply;
    }
    if (val.isPercentStat) {
      stackMpl *= chara.stat[val.percentKey];
    }
    
    if (val.chk && findBuffByIds(chara, val.chk).length === 0) {
      continue;
    }
    if (val.chkAll && findBuffByIds(chara, val.chkAll).length < val.chkAll.length) {
      continue;
    }
    
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] += val.value * stackMpl;
    } else if (val.code === cons.EFFECT_TYPE_SET_NAME) {
      chara.name = val.value;
    } 
  }
  for (val of getBuffEffects(opp, cons.ACTIVE_TYPE_OPP_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.code === cons.EFFECT_TYPE_OPP_STAT_ADD) {
      chara.stat[val.key] += val.value * stackMpl;
    }
  }
  for (val of getItemEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.isPercentStat) {
      stackMpl *= chara.stat[val.percentKey];
    } else if (val.isPercentItemValue) {
      stackMpl *= val.item.itemValue;
    } else if (val.isPercentSkill) {
      stackMpl *= chara.skill[val.skillKey][val.percentKey];
    } else if (val.isPercentCurSp) {
      stackMpl *= ((chara.curSp * 100) / chara.skill.special.cost);
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
    if (val.chkTitle && opp.title !== val.chkTitle) {
      continue;
    }
    if (val.chkHp && chara.curHp > (chara.stat.maxHp * val.chkHp)) {
      continue;
    }
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] += val.value * stackMpl;
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
        if (val.effIndex !== undefined) {
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
    
    if (val.code === cons.EFFECT_TYPE_STAT_MULTIPLY) {
      chara.stat[val.key] *= Math.pow(val.value, stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_STAT_PERCENTAGE) {
      chara.stat[val.key] *= (1 + val.value * stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_SP_COST_PERCENTAGE) {
      chara.skill[val.key].cost *= (1 + val.value * stackMpl);
    }
  }
  for (val of getItemEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.code === cons.EFFECT_TYPE_STAT_MULTIPLY) {
      chara.stat[val.key] *= Math.pow(val.value, stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_STAT_PERCENTAGE) {
      chara.stat[val.key] *= (1 + val.value * stackMpl);
    } else if (val.code === cons.EFFECT_TYPE_SP_COST_PERCENTAGE) {
      chara.skill[val.key].cost *= (1 + val.value * stackMpl);
    }
  }
  
  chara.stat.maxHp = Math.round(chara.stat.maxHp);
  chara.stat.hpRegen = Math.round(10 * chara.stat.hpRegen) / 10;
  chara.stat.spRegen = Math.round(10 * chara.stat.spRegen) / 10;
  if (chara.skill.special) {
    chara.skill.special.cost = Math.round(10 * chara.skill.special.cost) / 10;
  }
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
  char.skillOri = JSON.parse(JSON.stringify(char.skill));
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
      resultStr += val.name;
      if (val.stack) {
        resultStr += ' (' + val.stack + ')';
      }
      if (val.dur) {
        resultStr += ' (' + val.dur + '턴 남음)';
      }
      resultStr += '<br>';
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
