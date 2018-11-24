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

var charLeft = {};
var charRight = {};
var result = '';
var turnCount = 0;  
var bpLeft; 
var bpRight;
var bpTurn;

module.exports.doBattle = function (left, right, flag) {
  charLeft = left;
  charRight = right;
  _doBattleStart(flag);

  while (!_isBattleFinished()) {
    _doBattleTurn();
  }

  return _doBattleEnd(flag);
}

function _doBattleStart(flag) {
  result = '';
  turnCount = 0;
  timeCrash = 0;

  _initChar(charLeft, flag);
  _initChar(charRight);

  calcStats(charLeft, charRight);
  calcStats(charRight, charLeft);

  if (flag === undefined) {
    charLeft.curHp = charLeft.stat.maxHp;
  } else {
    charLeft.curHp = charLeft.curHp ? charLeft.curHp : charLeft.stat.maxHp;
  }  
  charRight.curHp = charRight.stat.maxHp;

  printCharInfo(0);
  result += '<div class="turnWrap">';
  resolveEffects(charLeft, charRight, getItemEffects(charLeft, cons.ACTIVE_TYPE_BATTLE_START), null);
  resolveEffects(charRight, charLeft, getItemEffects(charRight, cons.ACTIVE_TYPE_BATTLE_START), null);
  calcStats(charLeft, charRight);
  calcStats(charRight, charLeft);
  result += '</div>';
}

function _doBattleEnd(flag) {
  var retObj = {};
  retObj.winnerLeft = (charLeft.curHp > 0);
  retObj.winnerRight = (charRight.curHp > 0);
  retObj.turnCount = turnCount;
  retObj.resultLeft = retObj.winnerLeft ? 2 : 1;
  retObj.resultRight = retObj.winnerRight ? 2 : 1;
  resolveEffects(charLeft, charRight, getBuffEffects(charLeft, cons.ACTIVE_TYPE_BATTLE_END), retObj, true);
  resolveEffects(charRight, charLeft, getBuffEffects(charRight, cons.ACTIVE_TYPE_BATTLE_END), retObj, false);
  
  result += '<div class="resultWrap"><div class="resultCharInfo">';
  var expTurn = turnCount < 200 ? turnCount : 200;
  var expRate = charLeft.rank > charRight.rank ? 0.9 : (charLeft.rank < charRight.rank ? 1.1 : 1);
  if (charLeft.expBoost && charLeft.ezpBoost > 0) {
    expRate += 0.15;
  }
  if (retObj.winnerLeft) {    
    retObj.expLeft = Math.round((30 + 0.35 * expTurn * expRate) * 0.75);
    result += '<span class="colorLeft">Victory!</span><br>' + charLeft.name + '의 승리입니다!<br>';
  } else {
    retObj.expLeft = Math.round((0.7 * (30 + 0.35 * expTurn * expRate)) * 0.75);
    result += '<span class="colorRight">Defeat...</span><br>' + charLeft.name + '의 패배입니다..<br>';    
  }
  if (flag === undefined) {
    result += '경험치를 ' + retObj.expLeft + ' 획득했습니다.<br>리설트 카드 ' + retObj.resultLeft + '장을 획득했습니다.';
  }
  result += '</div><div class="resultCharInfo">';
  var expRate = charRight.rank > charLeft.rank ? 0.9 : (charRight.rank < charLeft.rank ? 1 : 1.1);
  if (retObj.winnerRight) {
    retObj.expRight = Math.round((30 + 0.35 * expTurn * expRate) * 0.25);
    result += '<span class="colorLeft">Victory!</span><br>' + charRight.name + '의 승리입니다!<br>';
  } else {
    retObj.expRight = Math.round((0.7 * (30 + 0.35 * expTurn * expRate)) * 0.25);
    result += '<span class="colorRight">Defeat...</span><br>' + charRight.name + '의 패배입니다..<br>';    
  }
  if (flag === undefined) {
    result += '경험치를 ' + retObj.expRight + ' 획득했습니다.<br>리설트 카드 ' + retObj.resultRight + '장을 획득했습니다.';
  }
  result += '</div></div>';
  retObj.result = result;
  retObj.leftInfo = charLeft;
  retObj.rightInfo = charRight;
  return retObj;
  
}

function _doBattleTurn() {
  turnCount++;
  result += '<br><div class="turnWrap"><span class="turnCount">' + turnCount + '턴</span><br>';

  while (1) {
    // decide winner
    var winner = getRandom(0.5) ? charLeft : charRight;
    var loser = (winner === charLeft) ? charRight : charLeft;

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
    result += '<div class="skillResolutionWrap"><span class="skillUse">';
    if (findBuffByCode(winner, 10004).length > 0 || findBuffByCode(winner, 10005).length > 0) {
      if (findBuffByCode(loser, 10004).length > 0 || findBuffByCode(loser, 10005).length > 0) {
        resolveTurnBegin(winner, loser);
        result += '아무도 공격할 수 없다!</span><br>';
        resolveTurnEnd(winner, loser);
        result += '</div></div>';
        printCharInfo(1);
        return;
      } else {
        var tmp = loser;
        loser = winner;
        winner = tmp;
        tmp = skillFailed;
        skillFailed = skillUsed;
        skillUsed = tmp;
        result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';      
      }
    } else if (findBuffByCode(loser, 10004).length > 0 || findBuffByCode(loser, 10005).length > 0) {
      result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';     
    } else if (winner == charLeft) {
      result += '<span class="skillUseWinner">' + charLeft.name + '의 [ ' + skillUsed.name + ' ]</span> vs ' + charRight.name + '의 [ ' + skillFailed.name + ' ]</span><br>';
    } else {
      result += charLeft.name + '의 [ ' + skillFailed.name + ' ] vs <span class="skillUseWinner">' + charRight.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';
    }

    var redecide = false;
    if (findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
      if (!redecide && skillFailed.effect[0] && skillFailed.effect[0].code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(skillFailed.effect[0].chance)) {
        result += '[ ' + skillFailed.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
        continue;
      } 
      for (val of getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_RESELECT)) {
        if (val.code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(val.chance)) {
          result += '[ ' + val.buff.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
          redecide = true;
          resolveEffects(loser, winner, [val], null);
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
      resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CANNOT_ATTACK), skillUsed);
      resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CANNOT_ATTACK), skillUsed);
      resolveTurnBegin(winner, loser);
      result += '공격할 수 없다!</span><br>';
      resolveTurnEnd(winner, loser);
      result += '</div></div>';
      printCharInfo(1);
      return;
    }
  } 
  resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillNum);
  resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SKILL_WIN), skillUsed, skillNum);
  resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_SKILL_LOSE), skillUsed);
  resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_SKILL_LOSE), skillUsed);

  // calc damage
  var damage = calcDamage(winner, loser, skillUsed);
  resolveTurnBegin(winner, loser);

  if (findBuffByCode(winner, 10011).length > 0 && getRandom(0.35)) {
    result += winner.name + getUnnun(winner.nameType) + ' 혼란에 빠졌다!<br>';
    resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CONFUSION), skillUsed);
    resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CONFUSION), skillUsed);
    var confused = loser;
    loser = winner;
  }
  
  if (damage.hit) {
    result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + skillUsed.name + ' ] ' + getUro(skillUsed.nameType) + ' ';
    result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + damage.value + '대미지를 입혔습니다!';
    if (damage.crit) {
      result += ' (치명타)';
      resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK_CRIT), damage);
    }
    result += '</span><br>';

    if (checkDrive(loser, cons.ACTIVE_TYPE_TAKE_HIT)) {
      resolveDrive(loser, winner, damage);
    }

    resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_ATTACK), damage, skillUsed);
    resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage);
    resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TAKE_HIT), damage);
    resolveEffects(winner, loser, skillUsed.effect, damage);
    if (checkDrive(winner, cons.ACTIVE_TYPE_ATTACK)) {
      resolveDrive(winner, loser, damage);
    }
    
    dealDamage(winner, loser, damage);
    winner.curSp += winner.stat.spCharge;
  } else { // evaded
    result += loser.name + getUnnun(loser.nameType) + ' 공격을 회피했습니다!<br>'; 
    resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_MISS), damage); 
    resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_MISS), damage); 
    resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_EVADE), damage); 
    resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_EVADE), damage); 
  }
  if (winner == loser) {
    loser = confused;
  }

  if (winner.skill.special && winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
    resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (winner.skill.special.cost <= winner.curSp && findBuffByCode(winner, 10004).length == 0 && findBuffByCode(winner, 10005).length == 0) {
      result += '<div class="specialSkill">[ ' + winner.name + ' ] Special Skill - [ ' + winner.skill.special.name + ' ] 발동!</div>';
      winner.curSp = 0;
      resolveEffects(winner, loser, winner.skill.special.effect);
      resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
      resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
    }
  }
  if (loser.skill.special && loser.skill.special.cost <= loser.curSp && findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
    resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_BEFORE_USE_SPECIAL), damage);
    resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL), damage);
    if (loser.skill.special.cost <= loser.curSp && findBuffByCode(loser, 10004).length == 0 && findBuffByCode(loser, 10005).length == 0) {
      result += '<div class="specialSkill">[ ' + loser.name + ' ] Special Skill - [ ' + loser.skill.special.name + ' ] 발동!</div>';
      loser.curSp = 0;
      resolveEffects(loser, winner, loser.skill.special.effect);
      resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_USE_SPECIAL), damage);
      resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
      resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_OPP_USE_SPECIAL), damage);
    }
  }

  resolveTurnEnd(winner, loser);

  result += '</div></div>';

  printCharInfo(1);
}

function doHeal(winner, loser, amount) {
  var retObj = {};
  retObj.amount = amount;
  
  resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_DO_HEAL), retObj);
  resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_DO_HEAL), retObj);
  resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_DO_HEAL_RECEIVE), retObj);
  resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_DO_HEAL_RECEIVE), retObj);

  retObj.amount = Math.round(retObj.amount);
  winner.curHp += retObj.amount;

  return retObj;
}

function calcDamage(winner, loser, skill) {
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
  retObj.hit = getRandom(winner.stat.hit - loser.stat.evasion);
  var critMod = loser.stat.evasion < 0 ? -loser.stat.evasion : 0;
  retObj.crit = getRandom(winner.stat.crit + critMod);
  retObj.type = skill.type;
  retObj.value = (retObj.skillRat * retObj.atkRat) * (1 - retObj.reduce);
  
  resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_CALC_DAMAGE), retObj, skill);
  resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_CALC_DAMAGE), retObj, skill);
  resolveEffects(loser, winner, getBuffEffects(loser, cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE), retObj, skill);
  resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE), retObj, skill);

  if (skill.type !== cons.DAMAGE_TYPE_ABSOLUTE) {
    for (val of findBuffByCode(loser, 10005)) {
      result += '[ ' + val.buff.name + ' ] 효과로 치명타가 적용됩니다!<br>';
      resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_SLEEP), retObj, skill);
      resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_SLEEP), retObj, skill);
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
    damage *= winner.stat.critDmg;
    resolveEffects(winner, loser, getBuffEffects(winner, cons.ACTIVE_TYPE_DEAL_DAMAGE_CRIT));
  }
  if (skill.type !== cons.DAMAGE_TYPE_ABSOLUTE) {
    damage -= loser.stat.dmgReduce;
    damage *= retObj.randDmg;
  }
  retObj.value = damage > 0 ? Math.round(damage) : 0;

  return retObj;
}

function dealDamage(src, dst, damage) {
  var damageShield = Math.round(damage.value / (1- damage.reduce));
  var shielded = false;
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
    resolveEffects(src, dst, getBuffEffects(src, cons.ACTIVE_TYPE_DEAL_DAMAGE), damage);
  }
  var damageDealt = shielded ? damageShield : damage.value;
  dst.curHp -= damageDealt;
}

function resolveEffects(winner, loser, effects, damage, skill) {
  for (var eff of effects) {
    var chance = eff.chance ? eff.chance : 1;
    if (eff.chanceAddKey) {
      chance += winner.stat[eff.chanceAddKey];
    }
    if (eff.chanceSubKeyOpp) {
      chance -= loser.stat[eff.chanceSubKeyOpp];
    }
    if (eff.cooldown && eff.cooldown > 0) {
      eff.cooldown--;
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
    if (eff.chkHp && winner.curHp > (winner.stat.maxHp * eff.chkHp)) {
      continue;
    }
    if (eff.chkOppHp && loser.curHp > (loser.stat.maxHp * eff.chkOppHp)) {
      continue;
    }
    if (eff.chkSp && winner.curSp < eff.chkSp) {
      continue;
    }
    if (eff.chkTurn && turnCount < eff.chkTurn) {
      continue;
    }
    if (eff.chkDmgType && eff.chkDmgType !== damage.type) {
      continue;
    }
    if (eff.chkDmgMultiple && damage.value % eff.chkDmgMultiple !== 0) {
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
    if (eff.chkPercentDamage && damage.value < winner.curHp * eff.chkPercentDamage) {
      continue;
    }
    if (eff.chkTitle && loser.title !== eff.chkTitle) {
      continue;
    }
    if (eff.chkName && loser.name !== eff.chkName) {
      continue;
    }
    var stackMpl = eff.noStack ? 1 : (eff.buff ? (eff.buff.stack ? eff.buff.stack : 1) : 1);
    if (eff.code === cons.EFFECT_TYPE_SELF_BUFF || eff.code === cons.EFFECT_TYPE_OPP_BUFF) {
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
        bpLeft = JSON.stringify(charLeft);
        bpRight = JSON.stringify(charRight);
        bpTurn = turnCount;
        buffObj.name += turnCount + '턴';
      } else if (buffObj.id === 201715) {
        timeCrash++;
        buffObj.stack = timeCrash; 
      } else if (buffObj.id === 201719) {
        buffObj.effect[0].value = Math.round(buffObj.effect[0].value * winner.stat.maxHp);
      } else if (buffObj.id === 201727) {
        buffObj.effect[0].value *= findBuffByIds(winner, eff.buffTarget).length;
      } else if (buffObj.id === 201737) {
        buffObj.effect[0].value = buffObj.effect[0].value * 0.5 * (loser.stat.phyReduce + loser.stat.magReduce);
      }

      var recv = (eff.code === cons.EFFECT_TYPE_SELF_BUFF) ? winner : loser;
      giveBuff(winner, recv, buffObj, true);

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
      } else if (eff.isPercentSkill) {
        valueUsed *= skill[eff.percentKey];
      }
      valueUsed = Math.round(valueUsed * stackMpl);
      var target = 'SP';
      if (eff.code === cons.EFFECT_TYPE_SELF_SP) {
        winner.curSp += valueUsed;
      } else if (eff.code === cons.EFFECT_TYPE_OPP_SP) {
        loser.curSp += valueUsed;
      } else if (eff.code === cons.EFFECT_TYPE_OPP_HP) {
        var ret = doHeal(loser, winner, valueUsed);
        valueUsed = ret.amount;
        target = 'HP';      
      } else {
        var ret = doHeal(winner, loser, valueUsed);
        valueUsed = ret.amount;
        target = 'HP';      
      }
      var source = eff.name ? ' [ ' + eff.name + ' ] 효과로 ' : ' ';
      var act = (valueUsed > 0) ? '회복했다' : '잃었다';
      result += dst.name + getUnnun(dst.nameType) + source + target + '를 ' + Math.abs(valueUsed) + ' ' + act + '!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_ADD_HIT || eff.code === cons.EFFECT_TYPE_SELF_HIT || eff.code === cons.EFFECT_TYPE_OPP_HIT || eff.code === cons.EFFECT_TYPE_OPP_SELF_HIT) {
      var tempObj = {};
      tempObj.damage = eff.value * stackMpl;
      tempObj.type = eff.type;
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
        valueUsed *= loser[eff.percentKey];
      }
      
      if ((eff.percentKey == 'maxHp' || eff.percentKey == 'curHp') && source.boss) {
        valueUsed *= 0.05;
      }
      
      if (eff.buffTarget) {
        if (eff.separate) {
          for (val of findBuffByIds(source, eff.buffTarget)) {
            var damageAdd = calcDamage(source, target, tempObj);

            result += '<span class="skillDamage">' + target.name + getUnnun(target.nameType) + ' 추가로 ' + damageAdd.value + '대미지를 입었습니다!';
            if (damageAdd.crit) {
              result += ' (치명타)';
            }
            result += '</span><br>';
            dealDamage(source, target, damageAdd);            
          }
          continue;
        } else {
          tempObj.damage *= findBuffByIds(source, eff.buffTarget).length;
        }
      }
      var damageAdd = calcDamage(source, target, tempObj);

      var source = eff.name ? ' [ ' + eff.name + ' ] 효과로 ' : ' 추가로 ';
      result += '<span class="skillDamage">' + target.name + getUnnun(target.nameType) + source + damageAdd.value + '대미지를 입었습니다!';
      if (damageAdd.crit) {
        result += ' (치명타)';
      }
      result += '</span><br>';
      dealDamage(source, target, damageAdd);
    } else if (eff.code === cons.EFFECT_TYPE_SHIELD_FROM_DAMAGE) {
      var buffObj = buffMdl.getBuffData(eff);
      buffObj.dur = eff.buffDur;
      
      for (val of findBuffByCode(winner, cons.EFFECT_TYPE_CHANGE_VALUE)) {
        buffObj.effect[0].value += val.value;
      }
      
      buffObj.effect[0].value = Math.round(buffObj.effect[0].value * damage.value);

      result += winner.name + getUnnun(winner.nameType) + ' ' + buffObj.effect[0].value + '만큼 보호막을 얻었습니다!<br>';
      giveBuff(winner, winner, buffObj, false);
    } else if (eff.code === cons.EFFECT_TYPE_CANCEL_DAMAGE) {
      var dmgCancelled = Math.round(damage.value * eff.value);
      winner.curHp += dmgCancelled;

      result += dmgCancelled + '의 대미지를 무효화했다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_SELF_CONVERT_BUFF || eff.code === cons.EFFECT_TYPE_OPP_CONVERT_BUFF) {
      var buffObj = buffMdl.getBuffData(eff);
      buffObj.dur = eff.buffDur;

      var recv = (eff.code === cons.EFFECT_TYPE_SELF_CONVERT_BUFF) ? winner : loser;
      var tgt = findBuffByIds(recv, eff.buffTarget);
      if (tgt.length > 0) {
        removeBuff(tgt[0]);
        giveBuff(winner, recv, buffObj, true);
      } 

    } else if (eff.code === cons.EFFECT_TYPE_SELF_BUFF_REFRESH || eff.code === cons.EFFECT_TYPE_OPP_BUFF_REFRESH) {
      var recv = (eff.code === cons.EFFECT_TYPE_SELF_BUFF_REFRESH) ? winner : loser;
      if (eff.buffTarget) { 
        for (val of findBuffByIds(recv, eff.buffTarget)) {
          if (eff.buffDur) {
            result += '[ ' + val.name + ' ]의 효과가 갱신되었다!<br>';
            val.dur = eff.buffDur;
          }
          if (eff.stack) {
            val.stack += eff.stack;
            if (val.stack == 0) {
              removeBuff(val);
            }
          }
        }
      } else if (eff.buffTargetCode) { 
        for (val of findBuffByCode(recv, eff.buffTargetCode)) {
          if (eff.buffDur) {
            result += '[ ' + val.buff.name + ' ]의 효과가 갱신되었다!<br>';
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
      var oriWinnerLeft = (winner == charLeft);
      if (eff.debug || findBuffByIds(winner, [201715]).length > 0) {
        result += bpTurn + '턴으로 자신만 되돌아간다!<br>';
        if (oriWinnerLeft) {
          charLeft = JSON.parse(bpLeft);
          winner = charLeft;
        } else {
          charRight = JSON.parse(bpRight);
          winner = charRight;          
        }
      } else {
        result += bpTurn + '턴으로 되돌아간다!<br>';
        turnCount = bpTurn;
        charLeft = JSON.parse(bpLeft);
        charRight = JSON.parse(bpRight);

        if (oriWinnerLeft) {
          winner = charLeft;
          loser = charRight;          
        } else {
          winner = charRight;          
          loser = charLeft;
        }
      }
      
      break;

    } else if (eff.code === cons.EFFECT_TYPE_SELECTION) {
      for (var j = 0; j < eff.selectChances.length; j++) {
        if (getRandom(eff.selectChances[j])) {
          resolveEffects(winner, loser, [eff.options[j]], damage);
          break;
        }
      }

    } else if (eff.code === cons.EFFECT_TYPE_RESOLVE_DRIVE) {
      resolveDrive(winner, loser, damage);
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLE) {
      resolveEffects(winner, loser, eff.target, damage);
    } else if (eff.code === cons.EFFECT_TYPE_ADD_RESOLUTION) {
      resolveEffects(winner, loser, skill.effect, damage);
    } else if (eff.code === cons.EFFECT_TYPE_CONVERT_ITEM) {
      if (eff.randomItem) {
        var tgtList = item.list.filter(x => x.rank === eff.randomItem);
        var picked = JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));
      } else {
        var picked = JSON.parse(JSON.stringify(tgtList[eff.value]));
      }
      for (eff of picked.effect) {
        eff.item = picked;
      }
      result += '[ ' + winner.items[eff.key].name + ' ] 아이템이 [ ' + picked.name + ' ] 아이템으로 바뀌었다!<br>';
      winner.items[eff.key] = picked;
    } else if (eff.code === cons.EFFECT_TYPE_ADD_DAMAGE) {
      if (eff.skillCode && eff.skillCode === skill.code) {
        var namt = eff.buffTarget ? eff.value * findBuffByIds(loser, eff.buffTarget).length : eff.value;
        damage.skillRat += namt;
        result += '[ ' + eff.name + ' ] 효과로 공격 계수가 ' + namt + ' 올랐습니다!<br>';
      } else if (eff.anySkill && skill.code) {
        damage.skillRat += eff.value;
        result += '[ ' + eff.name + ' ] 효과로 공격력이 ' + eff.value + ' 올랐습니다!<br>';      
      } else {
        continue;
      }
    } else if (eff.code === cons.EFFECT_TYPE_MULTIPLY_DAMAGE) {
      if (eff.buffCode && findBuffByIds(loser, [eff.buffCode]).length > 0) {
        damage.skillRat *= eff.value;
        result += '공격력이 ' + Math.round((eff.value - 1) * 100) + '\% 올랐습니다!<br>';
      } else if (eff.anySkill && skill.code) {
        damage.skillRat *= eff.value;
        result += '[ ' + eff.name + ' ] 효과로 공격력이 ' + Math.round((eff.value - 1) * 100) + '\% 올랐습니다!<br>';
      } else if (eff.noSkill && skill.code === undefined) {
        damage.skillRat *= eff.value;
        result += '[ ' + eff.name + ' ] 효과로 공격력이 ' + Math.round((eff.value - 1) * 100) + '\% 올랐습니다!<br>';    
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
      result += '최대 공격력이 발휘됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_CHANGE_ATTACK_TYPE) {
      if (eff.anySkill && !skill.code) {
        continue;
      }
      result += 'n 공격력이 적용됩니다!<br>';
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
      }
      result += '[ ' + damage.name + ' ] 효과의 지속시간이 ' + eff.value + ' 감소합니다!<br>';
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
      for (buff of recv.buffs) {
        if (eff.all || buffTarget.includes(buff.id)) {
          removeBuff(buff);
          result += '[ ' + buff.name + ' ] 효과가 제거됩니다!<br>';
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
      result += '[ ' + eff.item.name + ' ] 아이템에 에너지가 ' + valueUsed + ' 쌓였습니다!<br>';
      
      eff.item.itemValue = valueUsed;
    } else if (eff.code === cons.EFFECT_TYPE_DUPLICATE_ITEM) {
      winner.items[eff.dupKey] = winner.items[eff.key];
      result += '[ ' + winner.items[eff.key].name + ' ] 아이템이 복제됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_SWAP_SP) {
      var swap = winner.curSp;
      winner.curSp = loser.curSp;
      loser.curSp = swap;
      result += 'SP가 서로 바뀝니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_CHANGE_SKILL) {
      var newSkill = winner.skill.base[eff.value];
      for (key in damage) {
        damage[key] = newSkill[key];
      }
      result += '[ ' + damage.name + ' ] 스킬이 사용됩니다!<br>';
    } else if (eff.code === cons.EFFECT_TYPE_RESOLVE_SKILL) {
      var keyUsed = eff.randomSkill ? Math.floor(Math.random() * 3) : eff.value;
      var resolvedDamage = calcDamage(winner, loser, winner.skill.base[keyUsed]);
      if (resolvedDamage.hit) {
        dealDamage(winner, loser, resolvedDamage);
        result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + winner.skill.base[keyUsed].name + ' ] ' + getUro(winner.skill.base[keyUsed].nameType) + ' ';
        result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + resolvedDamage.value + '대미지를 입혔습니다!<br>';
        resolveEffects(winner, loser, winner.skill.base[keyUsed].effect, damage);
      }
    } else if (eff.code === cons.EFFECT_TYPE_ADD_RESULT_CARD) {
      // 5th arg = isLeft
      if (skill) {
        damage.resultLeft += eff.value;
      } else {
        damage.resultRight += eff.value;
      }
      result += winner.name + '의 리설트 카드 갯수가 ' + eff.value + ' 되었습니다!<br>';
    }
    
    if (eff.setCooldown) {
      eff.cooldown = eff.setCooldown;
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
    if (eff.removeEffect) {
      eff.code = -1;
    }
    if (eff.removeBuff) {
      removeBuff(eff.buff);
    }

    if (eff.breakResolution) {
      break;
    }
  }
}

function resolveTurnBegin(winner, loser) {
  resolveEffects(winner, loser, getItemEffects(winner, cons.ACTIVE_TYPE_TURN_START), null);
  resolveEffects(loser, winner, getItemEffects(loser, cons.ACTIVE_TYPE_TURN_START), null);
  if (checkDrive(winner, cons.ACTIVE_TYPE_TURN_START)) {
    resolveDrive(winner, loser);
  }
  if (checkDrive(loser, cons.ACTIVE_TYPE_TURN_START)) {
    resolveDrive(loser, winner);
  }
  resolveTurnBeginChar(winner, loser);
  resolveTurnBeginChar(loser, winner);
  calcStats(winner, loser);
  calcStats(loser, winner);
}

function resolveTurnBeginChar(chara, opp) {

  resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_TURN_START), null);
  for (buff of chara.buffs) {
    if (buff.durOff === cons.DURATION_TYPE_TURN_START) {
      buff.dur--;
    }
    if (buff.dur <= 0) {
      resolveEffects(chara, opp, buff.effect.filter(x => (x.active === cons.ACTIVE_TYPE_DURATION_END)));
    }
  }
  chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
}

function resolveTurnEnd(winner, loser) {
  if (checkDrive(winner, cons.ACTIVE_TYPE_TURN_END)) {
    resolveDrive(winner, loser);
  }
  if (checkDrive(loser, cons.ACTIVE_TYPE_TURN_END)) {
    resolveDrive(loser, winner);
  }
  calcStats(winner, loser);
  calcStats(loser, winner);
  resolveTurnEndChar(winner, loser, 0);
  resolveTurnEndChar(loser, winner, 1);
  if (winner.curHp > winner.stat.maxHp) {
    winner.curHp = winner.stat.maxHp;
  }
  if (loser.curHp > loser.stat.maxHp) {
    loser.curHp = loser.stat.maxHp;
  }
}

function resolveTurnEndChar(chara, opp, flag) {
  chara.curHp += chara.stat.hpRegen;
  chara.curSp += chara.stat.spRegen;
  chara.curHp = Math.round(10 * chara.curHp) / 10;
  chara.curSp = Math.round(10 * chara.curSp) / 10;

  resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_TURN_END));
  resolveEffects(chara, opp, getItemEffects(chara, cons.ACTIVE_TYPE_TURN_END));
  resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_TURN_END_WIN + flag));
  for (buff of chara.buffs) {
    if (buff.durOff === cons.DURATION_TYPE_TURN_END) {
      buff.dur--;
    }
    if (buff.dur <= 0) {
      resolveEffects(chara, opp, buff.effect.filter(x => (x.active === cons.ACTIVE_TYPE_DURATION_END)));
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

function giveBuff(src, recv, buffObj, printFlag) {
  if (findBuffByCode(recv, cons.EFFECT_TYPE_PREVENT_DEBUFF).length > 0 && buffObj.isDebuff && buffObj.dispellable) {
    result += ' [ ' + buffObj.name + ' ] 효과가 무효화되었다!<br>';
    return;
  }
  resolveEffects(src, recv, getBuffEffects(src, cons.ACTIVE_TYPE_GIVE_BUFF), buffObj);
  resolveEffects(src, recv, getItemEffects(src, cons.ACTIVE_TYPE_GIVE_BUFF), buffObj);
  resolveEffects(recv, src, getBuffEffects(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF), buffObj);
  resolveEffects(recv, src, getItemEffects(recv, cons.ACTIVE_TYPE_RECEIVE_BUFF), buffObj);
  
  if (printFlag) {
    result += recv.name + getUnnun(recv.nameType) + ' [ ' + buffObj.name + ' ] 효과를 받았습니다!<br>';
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
    } else if (buffObj.stackType === 2) {
      if (buffChk.maxStack && buffChk.maxStack <= buffChk.stack) {
        return;
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
    }
  } else {
    recv.buffs.push(buffObj);
  }       
}

function removeBuff(buff) {
  buff.id = -1;
  buff.dur = 0;
  buff.effect = [];
}

function checkDrive(chara, active) {
  if (!chara.skill.drive) {
    return false;
  }
  if (chara.skill.drive.chkNot && findBuffByIds(chara, chara.skill.drive.chkNot).length > 0) {
    return false;
  }
  if (chara.skill.drive.chkHp && chara.curHp > (chara.stat.maxHp * chara.skill.drive.chkHp)) {
    return false;
  }
  if (chara.skill.drive.fireOnce) {
    chara.skillOri.drive.active = null;
  }
  return chara.skill.drive.active === active && getRandom(chara.skill.drive.chance) && chara.curSp >= chara.skill.drive.cost && findBuffByCode(chara, 10010).length == 0;
}

function resolveDrive(chara, opp, damage) {
  chara.curSp -= chara.skill.drive.cost;
  result += '<div class="driveSkill">[ ' + chara.name + ' ] Drive Skill - [ ' + chara.skill.drive.name + ' ] 발동!</div>';
  resolveEffects(chara, opp, chara.skill.drive.effect, damage);
  resolveEffects(chara, opp, getBuffEffects(chara, cons.ACTIVE_TYPE_USE_DRIVE), damage, chara.skill.drive);
  resolveEffects(chara, opp, getItemEffects(chara, cons.ACTIVE_TYPE_USE_DRIVE), damage, chara.skill.drive);
  resolveEffects(opp, chara, getBuffEffects(opp, cons.ACTIVE_TYPE_OPP_USE_DRIVE), damage, chara.skill.drive);
  resolveEffects(opp, chara, getItemEffects(opp, cons.ACTIVE_TYPE_OPP_USE_DRIVE), damage, chara.skill.drive);
}

function getItemEffects(chara, active) {
  if (!active) {
    active.k;
  }
  var rval = [];
  for (val in chara.items) {
    rval = rval.concat(chara.items[val].effect.filter(x => (x.active === active)));
    if (chara.items[val].socket) {
      for (sock of chara.items[val].socket) {
        rval = rval.concat(sock.effect.filter(x => (x.active === active)));
      }
    }
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
  chara.skill = JSON.parse(JSON.stringify(chara.skillOri));

  for (val of getBuffEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] += val.value * stackMpl;
    } else if (val.code === cons.EFFECT_TYPE_SET_SKILL) {
      if (val.key === 'base') {
        var valueSel = val.randomValue ? Math.floor(Math.random() * 3) : val.value;
        chara.skill.base[valueSel] = val.target;
      } else if (val.key) {
        chara.skill[val.key] = val.target;
      }
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
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] += val.value * stackMpl;
    }
  }
  
  // multiplication must be last (x0 case)
  for (val of getBuffEffects(chara, cons.ACTIVE_TYPE_CALC_STATS)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
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
}

function _isBattleFinished() {
  return (charLeft.curHp <= 0 || charRight.curHp <= 0);
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
  char.skillOri = JSON.parse(JSON.stringify(char.skill));
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

function printCharInfo(flag) {
  result += '<div class="charInfoWrap">' + printChar(charLeft, 'Left', flag) + printChar(charRight, 'Right', flag) + '</div>';
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
    resultStr += '</div>';
  }

  resultStr += '</div>';
  return resultStr;
}

function getItemText(key, val) {
  var resultStr = '';
  resultStr += printName[key] + ' : ' + val.name + '<br>(';
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
