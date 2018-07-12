const cons = require('./constant');
const buffMdl = require('./buff');
const JSON = require('circular-json');

var printName = {};
printName.weapon = '무기';
printName.armor = '갑옷';
printName.subarmor = '보조방어구';
printName.trinket = '장신구';
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

var charLeft = {};
var charRight = {};
var result = '';
var turnCount = 0;  
var bpLeft; 
var bpRight;
var bpTurn;

module.exports.doBattle = function (left, right) {
  charLeft = left;
  charRight = right;
  _doBattleStart();

  while (!_isBattleFinished()) {
    _doBattleTurn();
  }

  return _doBattleEnd();
}

function _doBattleStart() {
  result = '';
  turnCount = 0;
  timeCrash = 0;

  _initChar(charLeft);
  _initChar(charRight);

  calcStats(charLeft);
  calcStats(charRight);

  charLeft.curHp = charLeft.stat.maxHp;
  charRight.curHp = charRight.stat.maxHp;

  printCharInfo(0);
}

function _doBattleEnd() {
  var retObj = {};
  retObj.winnerLeft = (charLeft.curHp > 0);
  retObj.winnerRight = (charRight.curHp > 0);
  retObj.turnCount = turnCount;
  
  result += '<div class="resultWrap"><div class="resultCharInfo">';
  var expTurn = turnCount < 200 ? turnCount : 200;
  if (retObj.winnerLeft) {
    var expRate = charLeft.rank > charRight.rank ? 0.9 : (charLeft.rank < charRight.rank ? 1.1 : 1.0);
    retObj.expRight = Math.round(30 + 0.35 * expTurn * expRate);
    retObj.expLeft = Math.round(30 + 0.35 * expTurn);
    result += '<span class="colorLeft">Victory!</span><br>' + charLeft.name + '의 승리입니다!<br>경험치를 ' + retObj.expLeft + ' 획득했습니다.<br>리절트 카드 2장을 획득했습니다.';
  } else {
    retObj.expLeft = Math.round(0.7 * (30 + 0.35 * expTurn));
    result += '<span class="colorRight">Defeat...</span><br>' + charLeft.name + '의 패배입니다..<br>경험치를 ' + retObj.expLeft + ' 획득했습니다.<br>리절트 카드 1장을 획득했습니다.';    
  }
  result += '</div><div class="resultCharInfo">';
  if (retObj.winnerRight) {
    var expRate = charRight.rank > charLeft.rank ? 0.9 : (charRight.rank < charLeft.rank ? 1.1 : 1.0);
    retObj.expRight = Math.round(30 + 0.35 * expTurn * expRate);
    result += '<span class="colorLeft">Victory!</span><br>' + charRight.name + '의 승리입니다!<br>경험치를 ' + retObj.expRight + ' 획득했습니다.<br>리절트 카드 2장을 획득했습니다.';
  } else {
    retObj.expRight = Math.round(0.7 * (30 + 0.35 * expTurn));
    result += '<span class="colorRight">Defeat...</span><br>' + charRight.name + '의 패배입니다..<br>경험치를 ' + retObj.expRight + ' 획득했습니다.<br>리절트 카드 1장을 획득했습니다.';    
  }
  result += '</div></div>';
  retObj.result = result;
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
    while (!skillUsed) {
      var rand = Math.random();
      if (rand < 0.33) {
        skillUsed = winner.skill.base[0];
        skillFailed = loser.skill.base[2];
      } else if (rand < 0.66) {
        skillUsed = winner.skill.base[1];
        skillFailed = loser.skill.base[0];
      } else if (rand < 0.99) {
        skillUsed = winner.skill.base[2];
        skillFailed = loser.skill.base[1];
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
    if (!redecide && skillFailed.effect[0].code === cons.EFFECT_TYPE_SKILL_RESELECT && getRandom(skillFailed.effect[0].chance)) {
      result += '[ ' + skillFailed.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
      continue;
    } 
    for (val of findBuffByCode(loser, 13)) {
      if (val.buff.stack > 0 && getRandom(val.chance)) {
        val.buff.stack -= 1;
        if (val.buff.stack == 0) {
          val.buff.dur = 0;
          val.buff.effect = [];
          val.buff.id  = -1;
        }
        result += '[ ' + val.buff.name + ' ] 효과로 스킬이 재선택됩니다!<br>';
        redecide = true;
        break;
      }
    }

    if (!redecide) {
      break;
    }
  }

  // calc damage
  var damage = calcDamage(winner, loser, skillUsed);
  resolveTurnBegin(winner, loser);

  if (findBuffByCode(winner, 10011).length > 0 && getRandom(0.35)) {
    result += winner.name + getUnnun(winner.nameType) + ' 혼란에 빠졌다!<br>';
    var confused = loser;
    loser = winner;
  }
  
  if (damage.hit) {
    result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + skillUsed.name + ' ] ' + getUro(skillUsed.nameType) + ' ';
    result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + damage.value + '대미지를 입혔습니다!';
    if (damage.crit) {
      result += ' (치명타)';
      for (val of findBuffByCode(winner, 15)) {
        if (val.removeOnCrit) {
          val.buff.dur = 0;
          val.buff.id = -1;
          val.buff.effect = [];
        }
      }
    }
    result += '</span><br>';
    
    if (checkDrive(loser, cons.ACTIVE_TYPE_TAKE_HIT)) {
      loser.curSp -= loser.skill.drive.cost;
      result += '<div class="driveSkill">[ ' + loser.name + ' ] Drive Skill - [ ' + loser.skill.drive.name + ' ] 발동!</div>';
      resolveEffects(loser, winner, loser.skill.drive.effect, damage);
    }
    
    for (eff of findBuffByCode(winner, 10003)) {
      var stackMpl = eff.buff.stack ? eff.buff.stack : 1;
      eff.damage = eff.value * stackMpl;
      if (eff.isPercentMax) {
        eff.damage *= winner.stat.maxHp;
      }
      var damage = calcDamage(winner, winner, eff);

      result += '<span class="skillDamage">' + winner.name + getUnnun(winner.nameType) + ' [ ' + eff.buff.name + ' ] 효과로 ' + damage.value + '대미지를 입었습니다!';
      if (damage.crit) {
        result += ' (치명타)';
      }
      result += '</span><br>';
      dealDamage(winner, winner, damage);
    }
    
    for (val of findBuffByCode(winner, 7)) {
      addDamage = {};
      addDamage.value = winner.base[val.key];
      addDamage.reduce = 0;
      result += '[ ' + val.buff.name + ' ] 효과로 ' + loser.name + getUnnun(loser.nameType) + ' 추가로 ' + addDamage.value + ' 대미지를 입었습니다!<br>';
      if (val.turnReduce) {
        val.buff.dur -= val.turnReduce;
      }
      dealDamage(winner, loser, addDamage);
    }

    resolveEffects(winner, loser, skillUsed.effect, damage);
    if (checkDrive(winner, cons.ACTIVE_TYPE_ATTACK)) {
      winner.curSp -= winner.skill.drive.cost;
      result += '<div class="driveSkill">[ ' + winner.name + ' ] Drive Skill - [ ' + winner.skill.drive.name + ' ] 발동!</div>';
      resolveEffects(winner, loser, winner.skill.drive.effect, damage);
    }
    
    dealDamage(winner, loser, damage);
    winner.curSp += winner.stat.spCharge;
  } else { // evaded
    result += loser.name + getUnnun(loser.nameType) + ' 공격을 회피했습니다!<br>'; 
    for (val of findBuffByCode(loser, 12)) {
      var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
      if (val.key) {
        loser[val.key] += stackMpl * val.value;
      }
      val.buff.dur = 0;
      val.buff.id = -1;
      val.buff.effect = [];
      result += '[ ' + val.buff.name + ' ] 효과 발동!<br>'; 
      break;
    }
  }
  if (winner == loser) {
    loser = confused;
  }

  if (winner.skill.special.cost <= winner.curSp) {
    result += '<div class="specialSkill">[ ' + winner.name + ' ] Special Skill - [ ' + winner.skill.special.name + ' ] 발동!</div>';
    winner.curSp = 0;
    resolveEffects(winner, loser, winner.skill.special.effect);
  }
  if (loser.skill.special.cost <= loser.curSp) {
    result += '<div class="specialSkill">[ ' + loser.name + ' ] Special Skill - [ ' + loser.skill.special.name + ' ] 발동!</div>';
    loser.curSp = 0;
    resolveEffects(loser, winner, loser.skill.special.effect);
  }

  resolveTurnEnd(winner, loser);

  result += '</div></div>';

  printCharInfo(1);
}

function calcDamage(winner, loser, skill) {
  var retObj = {};
  var isPhysical = (skill.type === cons.DAMAGE_TYPE_PHYSICAL);
  var atkRat = isPhysical ? winner.stat.phyAtk : winner.stat.magAtk;
  var defReduce = isPhysical ? loser.stat.phyReduce : loser.stat.magReduce;
  var randDmg = Math.random() * 0.2 + 0.9;
  var skillRat = skill.damage;

  for (val of findBuffByCode(winner, 2)) {
    if (val.buff.id === 20101 && skill.code === 20101) {
      atkRat += val.value;
      result += '[ ' + val.buff.name + ' ] 효과로 공격력이 ' + val.value + ' 올랐습니다!<br>';
    }
  }
  for (val of findBuffByCode(loser, 17)) {
    if (val.buff.id === 3 && skill.code === 201721) {
      var namt = val.value * findBuffByIds(winner, val.buffTarget).length;
      skillRat += namt;
      result += '[ ' + val.buff.name + ' ] 효과로 공격 계수가 ' + namt + ' 올랐습니다!<br>';
    }
  }

  retObj.hit = getRandom(winner.stat.hit - loser.stat.evasion);
  retObj.crit = getRandom(winner.stat.crit);
  for (val of findBuffByCode(loser, 10005)) {
    result += '[ ' + val.buff.name + ' ] 효과로 치명타가 적용됩니다!<br>';
    val.buff.dur = 0;
    val.buff.effect = [];
    val.buff.id = -1;
    retObj.crit = true;
    break;
  }
  retObj.reduce = defReduce;

  if (skill.type === cons.DAMAGE_TYPE_ABSOLUTE) {
    atkRat = 1;
    defReduce = 0;
    retObj.crit = false;
  }
  
  var damage = (skillRat * atkRat) * (1 - defReduce);
  damage *= randDmg;
  if (retObj.crit) {
    damage *= winner.stat.critDmg;
    for (val of findBuffByCode(winner, 15)) {
      if (val.stealSp) {
        winner.curSp += val.stealSp;
        loser.curSp -= val.stealSp;
        result += '[ ' + val.buff.name + ' ] 효과로 SP를 ' + val.stealSp + ' 흡수합니다!<br>';
      }
    }
  }
  retObj.value = Math.round(damage);

  return retObj;
}

function dealDamage(src, dst, damage) {
  var damageShield = Math.round(damage.value / (1- damage.reduce));
  var shielded = false;
  for (val of findBuffByCode(dst, 6)) {
    if (val.value > damageShield) {
      val.value -= damageShield;
      return;
    } else {
      damageShield -= val.value;
      val.value = 0;
      val.buff.dur = 0;
      val.buff.id = -1;
      shielded = true;
    }
  }
  var damageDealt = shielded ? damageShield : damage.value;
  dst.curHp -= damageDealt;
}

function resolveEffects(winner, loser, effects, damage) {
  for (var i = 0; i < effects.length; i++) {
    var chance = effects[i].chance;
    if (effects[i].chanceAddKey) {
      chance += winner.stat[effects[i].chanceAddKey];
    }
    if (!getRandom(chance)) {
      continue;
    }
    if (effects[i].onCrit && !damage.crit) {
      continue;
    }
    if (effects[i].critNot && damage.crit) {
      continue;
    }
    if (effects[i].chkNot && findBuffByIds(winner, effects[i].chkNot).length > 0) {
      continue;
    }
    if (effects[i].chk && findBuffByIds(winner, effects[i].chk).length === 0) {
      continue;
    }
    if (effects[i].chkOpp && findBuffByIds(loser, effects[i].chkOpp).length === 0) {
      continue;
    }
    if (effects[i].chkHp && winner.curHp > (winner.stat.maxHp * effects[i].chkHp)) {
      continue;
    }
    if (effects[i].chkTurn && turnCount <= effects[i].chkTurn) {
      continue;
    }
    if (effects[i].code === cons.EFFECT_TYPE_SELF_BUFF || effects[i].code === cons.EFFECT_TYPE_OPP_BUFF) {
      var buffObj = buffMdl.getBuffData(effects[i]);
      buffObj.dur = effects[i].buffDur;
      
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
      } else if (buffObj.id === 201727) {
        buffObj.effect[0].value *= findBuffByIds(winner, effects[i].buffTarget).length;
      } 

      var recv = (effects[i].code === cons.EFFECT_TYPE_SELF_BUFF) ? winner : loser;
      giveBuff(recv, buffObj, true);

    } else if (effects[i].code === cons.EFFECT_TYPE_SELF_SP || effects[i].code === cons.EFFECT_TYPE_SELF_HP) {
      var valueUsed = effects[i].isPercentMax ? effects[i].value * winner.stat.maxHp : effects[i].value;
      if (effects[i].buffTarget) {
        valueUsed *= findBuffByIds(winner, effects[i].buffTarget).length;
      }
      if (effects[i].code === cons.EFFECT_TYPE_SELF_SP) {
        winner.curSp += valueUsed;
        var target = 'SP';
      } else {
        winner.curHp += valueUsed;
        var target = 'HP';      
      }
      var act = (valueUsed > 0) ? '회복했다' : '잃었다';
      result += winner.name + getUnnun(winner.nameType) + ' ' + target + '를 ' + Math.abs(valueUsed) + ' ' + act + '!<br>';
    } else if (effects[i].code === cons.EFFECT_TYPE_ADD_HIT) {
      var tempObj = {};
      tempObj.damage = effects[i].value;
      tempObj.type = effects[i].type;
      
      if (effects[i].buffTarget) {
        if (effects[i].separate) {
          for (val of findBuffByIds(winner, effects[i].buffTarget)) {
            var damageAdd = calcDamage(winner, loser, tempObj);

            result += '<span class="skillDamage">' + loser.name + getUnnun(loser.nameType) + ' 추가로 ' + damageAdd.value + '대미지를 입었습니다!';
            if (damageAdd.crit) {
              result += ' (치명타)';
            }
            result += '</span><br>';
            dealDamage(winner, loser, damageAdd);            
          }
          continue;
        } else {
          tempObj.damage *= findBuffByIds(winner, effects[i].buffTarget).length;
        }
      }
      var damageAdd = calcDamage(winner, loser, tempObj);

      result += '<span class="skillDamage">' + loser.name + getUnnun(loser.nameType) + ' 추가로 ' + damageAdd.value + '대미지를 입었습니다!';
      if (damageAdd.crit) {
        result += ' (치명타)';
      }
      result += '</span><br>';
      dealDamage(winner, loser, damageAdd);
    } else if (effects[i].code === cons.EFFECT_TYPE_SHIELD_FROM_DAMAGE) {
      var buffObj = buffMdl.getBuffData(effects[i]);
      buffObj.dur = effects[i].buffDur;
      
      for (val of findBuffByCode(winner, 8)) {
        buffObj.effect[0].value += val.value;
      }
      
      buffObj.effect[0].value = Math.round(buffObj.effect[0].value * damage.value);

      result += winner.name + getUnnun(winner.nameType) + ' ' + buffObj.effect[0].value + '만큼 보호막을 얻었습니다!<br>';
      giveBuff(winner, buffObj, false);
    } else if (effects[i].code === cons.EFFECT_TYPE_CANCEL_DAMAGE) {
      winner.curHp += damage.value;

      result += damage.value + '의 대미지를 무효화했다!<br>';
    } else if (effects[i].code === cons.EFFECT_TYPE_SELF_CONVERT_BUFF || effects[i].code === cons.EFFECT_TYPE_OPP_CONVERT_BUFF) {
      var buffObj = buffMdl.getBuffData(effects[i]);
      buffObj.dur = effects[i].buffDur;

      var recv = (effects[i].code === cons.EFFECT_TYPE_SELF_CONVERT_BUFF) ? winner : loser;
      var tgt = findBuffByIds(recv, effects[i].buffTarget);
      if (tgt.length > 0) {
        tgt[0].effect = [];
        tgt[0].dur = 0;
        tgt[0].id = -1;
        giveBuff(recv, buffObj, true);
      } 

    } else if (effects[i].code === cons.EFFECT_TYPE_SELF_BUFF_REFRESH || effects[i].code === cons.EFFECT_TYPE_OPP_BUFF_REFRESH) {
      var recv = (effects[i].code === cons.EFFECT_TYPE_SELF_BUFF_REFRESH) ? winner : loser;
      if (effects[i].buffTarget) { 
        for (val of findBuffByIds(recv, effects[i].buffTarget)) {
          if (effects[i].buffDur) {
            result += '[ ' + val.name + ' ]의 효과가 갱신되었다!<br>';
            val.dur = effects[i].buffDur;
          }
          if (effects[i].stack) {
            val.stack += effects[i].stack;
            if (val.stack == 0) {
              val.dur = 0;
              val.effect = [];
              val.id  = -1;
            }
          }
        }
      } else if (effects[i].buffTargetCode) { 
        for (val of findBuffByCode(recv, effects[i].buffTargetCode)) {
          if (effects[i].buffDur) {
            result += '[ ' + val.buff.name + ' ]의 효과가 갱신되었다!<br>';
            val.buff.dur = effects[i].buffDur;
          }
          if (effects[i].stack) {
            val.buff.stack += effects[i].stack;
            if (val.buff.stack == 0) {
              val.dur = 0;
              val.effect = [];
              val.id  = -1;
            }
          }
        }
      }

    } else if (effects[i].code === cons.EFFECT_TYPE_RETURN) {
      var oriWinnerLeft = (winner == charLeft);
      if (effects[i].debug || findBuffByIds(winner, [201715]).length > 0) {
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

    } else if (effects[i].code === cons.EFFECT_TYPE_SELECTION) {
      for (var j = 0; j < effects[i].selectChances.length; j++) {
        if (getRandom(effects[i].selectChances[j])) {
          resolveEffects(winner, loser, [effects[i].options[j]], damage);
          break;
        }
      }

    } else if (effects[i].code === cons.EFFECT_TYPE_RESOLVE_DRIVE) {
      winner.curSp -= winner.skill.drive.cost;
      result += '<div class="driveSkill">[ ' + winner.name + ' ] Drive Skill - [ ' + winner.skill.drive.name + ' ] 발동!</div>';
      resolveEffects(winner, loser, winner.skill.drive.effect);
    }
  }
}

function resolveTurnBegin(winner, loser) {
  if (checkDrive(winner, cons.ACTIVE_TYPE_TURN_START)) {
    winner.curSp -= winner.skill.drive.cost;
    result += '<div class="driveSkill">[ ' + winner.name + ' ] Drive Skill - [ ' + winner.skill.drive.name + ' ] 발동!</div>';
    resolveEffects(winner, loser, winner.skill.drive.effect);
  }
  if (checkDrive(loser, cons.ACTIVE_TYPE_TURN_START)) {
    loser.curSp -= loser.skill.drive.cost;
    result += '<div class="driveSkill">[ ' + loser.name + ' ] Drive Skill - [ ' + loser.skill.drive.name + ' ] 발동!</div>';
    resolveEffects(loser, winner, loser.skill.drive.effect);
  }
  calcStats(winner);
  calcStats(loser);
  resolveTurnBeginChar(winner);
  resolveTurnBeginChar(loser);
}

function resolveTurnBeginChar(chara) {

  for (buff of chara.buffs) {
    if (buff.durOff === cons.DURATION_TYPE_TURN_START) {
      buff.dur--;
    }
    if (buff.dur >= 0) {
      for (eff of buff.effect) {
      if (eff.code === 11 && buff.dur === 0) {
        var buffObj = buffMdl.getBuffData(eff);
        buffObj.dur = eff.dur;
        giveBuff(chara, buffObj, true);
      }
      }
    }
  }
  chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
}

function resolveTurnEnd(winner, loser) {
  if (checkDrive(winner, cons.ACTIVE_TYPE_TURN_END)) {
    winner.curSp -= winner.skill.drive.cost;
    result += '<div class="driveSkill">[ ' + winner.name + ' ] Drive Skill - [ ' + winner.skill.drive.name + ' ] 발동!</div>';
    resolveEffects(winner, loser, winner.skill.drive.effect);
  }
  if (checkDrive(loser, cons.ACTIVE_TYPE_TURN_END)) {
    loser.curSp -= loser.skill.drive.cost;
    result += '<div class="driveSkill">[ ' + loser.name + ' ] Drive Skill - [ ' + loser.skill.drive.name + ' ] 발동!</div>';
    resolveEffects(loser, winner, loser.skill.drive.effect);
  }
  calcStats(winner);
  calcStats(loser);
  resolveTurnEndChar(winner, loser);
  resolveTurnEndChar(loser, winner);
}

function resolveTurnEndChar(chara, opp) {
  chara.curHp += chara.stat.hpRegen;
  chara.curSp += chara.stat.spRegen;
  if (chara.curHp > chara.stat.maxHp) {
    chara.curHp = chara.stat.maxHp;
  }

  for (buff of chara.buffs) {
    if (buff.durOff === cons.DURATION_TYPE_TURN_END) {
      buff.dur--;
    }
    if (buff.dur >= 0) {
      for (eff of buff.effect) {
        if (eff.code === 1) {
          var stackMpl = buff.stack ? buff.stack : 1;
          eff.damage = eff.value * stackMpl;
          if (eff.isPercentMax) {
            eff.damage *= chara.stat.maxHp;
          }
          var damage = calcDamage(opp, chara, eff);

          result += '<span class="skillDamage">' + chara.name + getUnnun(chara.nameType) + ' [ ' + buff.name + ' ] 효과로 ' + damage.value + '대미지를 입었습니다!';
          if (damage.crit) {
            result += ' (치명타)';
          }
          result += '</span><br>';
          dealDamage(opp, chara, damage);
        } else if (eff.code === 4) {
          var stackMpl = buff.stack ? buff.stack : 1;
          eff.damage = eff.value * stackMpl;
          var damage = calcDamage(chara, opp, eff);

          result += '<span class="skillDamage">' + opp.name + getUnnun(opp.nameType) + ' [ ' + buff.name + ' ] 효과로 ' + damage.value + '대미지를 입었습니다!';
          if (damage.crit) {
            result += ' (치명타)';
          }
          result += '</span><br>';
          dealDamage(chara, opp, damage);
        } else if (eff.code === 14) {
          if (eff.isPercent) {
            var rval = eff.value * chara.stat[eff.key];
          }
          var buffObj = buffMdl.getBuffData(eff);
          buffObj.dur = eff.dur;
          buffObj.effect[0].value = Math.round(rval);
          giveBuff(chara, buffObj, true);
        }
      }
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

function giveBuff(recv, buffObj, printFlag) {
  if (findBuffByCode(recv, 9).length > 0 && buffObj.isDebuff) {
    result += ' [ ' + buffObj.name + ' ] 효과가 무효화되었다!<br>';
    return;
  }
  
  if (printFlag) {
    result += recv.name + getUnnun(recv.nameType) + ' [ ' + buffObj.name + ' ] 효과를 받았습니다!<br>';
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

function checkDrive(chara, active) {
  if (chara.skill.drive.chkNot && findBuffByIds(chara, chara.skill.drive.chkNot).length > 0) {
    return false;
  }
  return chara.skill.drive.active === active && getRandom(chara.skill.drive.chance) && chara.curSp >= chara.skill.drive.cost && findBuffByCode(chara, 10010).length == 0;
}

function calcStats(chara) {
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

  for (val of findBuffByCode(chara, 3)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    chara.stat[val.key] += val.value * stackMpl;
  }

  for (val of findBuffByCode(chara, 10)) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    chara.stat[val.key] *= val.value * stackMpl;
  }
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

function _initChar(char) {
  char.curHp = char.stat.maxHp;
  char.curSp = 0;
  char.buffs = [];
}

function getShieldValue (chara) {
  var ret = findBuffByCode(chara, 6).map(x => x.value);
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
  '</div><div class="charInfoPoint"><span class="charInfoPointView">' + chara.curSp + ' / ' + chara.skill.special.cost + '</span> ' +
  '<span class="charInfoPointRegen colorSp">(+' + chara.stat.spRegen + ')</span></div>';

  if (flag === 0) {
    resultStr += '<div class="charInfoItems">';
    for (const [key, val] of Object.entries(chara.items)) {
      resultStr += printName[key] + ' : ' + val.name + '<br>(';
      resultStr += Object.entries(val.stat).map(arr => { if (arr[1] > 0 && arr[1] < 1) arr[1] *= 100; return printName[arr[0]] + ' ' + arr[1]; }).join(', ') + ')<br>';
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