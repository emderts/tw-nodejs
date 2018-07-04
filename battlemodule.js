var NAME_KOR_NO_END_CONS = 0;
var NAME_KOR_END_CONS = 1;

var ITEM_TYPE_WEAPON = 0;
var ITEM_TYPE_ARMOR = 1;
var ITEM_TYPE_TRINKET = 2;

var DAMAGE_TYPE_ABSOLUTE = 0;
var DAMAGE_TYPE_PHYSICAL = 1;
var DAMAGE_TYPE_MAGICAL = 2;

var SKILL_TYPE_DRIVE = 10;
var SKILL_TYPE_SPECIAL = 100;

var ACTIVE_TYPE_ATTACK = 0;

var EFFECT_TYPE_SELF_BUFF = 1;
var EFFECT_TYPE_OPP_BUFF = 2;
var EFFECT_TYPE_SELF_SP = 3;
var EFFECT_TYPE_SELF_HP = 4;
var EFFECT_TYPE_ADD_HIT = 5;

var DURATION_TYPE_TURN_START = 1;
var DURATION_TYPE_TURN_END = 0;

var printName = {};
printName.weapon = '무기';
printName.armor = '갑옷';
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

module.exports.doBattle = function (left, right) {
  charLeft = left;
  charRight = right;
  _doBattleStart();

  while (!_isBattleFinished()) {
    _doBattleTurn();
  }
  return result;

  _doBattleEnd();
}

function _doBattleStart() {
  result = '';
  turnCount = 0;

  _initChar(charLeft);
  _initChar(charRight);

  calcStats(charLeft);
  calcStats(charRight);
  
  charLeft.curHp = charLeft.stat.maxHp;
  charRight.curHp = charRight.stat.maxHp;
  
  printCharInfo(0);
}

function _doBattleTurn() {
  turnCount++;
  result += '<br><div class="turnWrap"><span class="turnCount">' + turnCount + '턴</span><br>';

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
  if (findBuffByCode(winner, 10004).length > 0) {
    if (findBuffByCode(loser, 10004).length > 0) {
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
  } else if (findBuffByCode(loser, 10004).length > 0) {
    result += '<span class="skillUseWinner">' + winner.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';     
  } else if (winner == charLeft) {
    result += '<span class="skillUseWinner">' + charLeft.name + '의 [ ' + skillUsed.name + ' ]</span> vs ' + charRight.name + '의 [ ' + skillFailed.name + ' ]</span><br>';
  } else {
    result += charLeft.name + '의 [ ' + skillFailed.name + ' ] vs <span class="skillUseWinner">' + charRight.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';
  }

  // calc damage
  var damage = calcDamage(winner, loser, skillUsed);
  resolveTurnBegin(winner, loser);
  
  if (damage.hit) {
    result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + skillUsed.name + ' ] ' + getUro(skillUsed.nameType) + ' ';
    result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + damage.value + '대미지를 입혔습니다!';
    if (damage.crit) {
      result += ' (치명타)';
    }
    result += '</span><br>';

    resolveEffects(winner, loser, skillUsed.effect);
    if (winner.skill.drive.active === ACTIVE_TYPE_ATTACK && getRandom(winner.skill.drive.chance)) {
      winner.curSp -= winner.skill.drive.cost;
      result += '<div class="driveSkill">[ ' + winner.name + ' ] Drive Skill - [ ' + winner.skill.drive.name + ' ] 발동!</div>';
      resolveEffects(winner, loser, winner.skill.drive.effect);
    }
    dealDamage(winner, loser, damage);
    winner.curSp += winner.stat.spCharge;
  }

  resolveTurnEnd(winner, loser);

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

  result += '</div></div>';

  printCharInfo(1);
}

function calcDamage(winner, loser, skill) {
  var retObj = {};
  var isPhysical = (skill.type === DAMAGE_TYPE_PHYSICAL);
  var atkRat = isPhysical ? winner.stat.phyAtk : winner.stat.magAtk;
  var defReduce = isPhysical ? loser.stat.phyReduce : loser.stat.magReduce;
  var randDmg = Math.random() * 0.2 + 0.9;

  if (skill.type === DAMAGE_TYPE_ABSOLUTE) {
    atkRat = skill.damage;
    defReduce = 0;
  }

  for (val of findBuffByCode(winner, 2)) {
    if (val.buff.id === 20101 && skill.code === 20101) {
      atkRat += val.value;
      result += '[ ' + val.buff.name + ' ] 효과로 공격력이 ' + val.value + ' 올랐습니다!<br>';
    }
  }

  retObj.hit = getRandom(winner.stat.hit - loser.stat.evasion);
  retObj.crit = getRandom(winner.stat.crit);

  var damage = (skill.damage * atkRat) * (1 - defReduce);
  damage *= randDmg;
  if (retObj.crit) {
    damage *= winner.stat.critDmg;
  }
  retObj.value = Math.round(damage);

  return retObj;
}

function dealDamage(src, dst, damage) {
  dst.curHp -= damage.value;
}

function resolveEffects(winner, loser, effects) {
  for (var i = 0; i < effects.length; i++) {
    if (!getRandom(effects[i].chance)) {
      continue;
    }
    if (effects[i].code === EFFECT_TYPE_SELF_BUFF || effects[i].code === EFFECT_TYPE_OPP_BUFF) {
      var buffObj = getBuffData(effects[i]);
      buffObj.dur = effects[i].buffDur;

      var recv = (effects[i].code === EFFECT_TYPE_SELF_BUFF) ? winner : loser;
      result += recv.name + getUnnun(recv.nameType) + ' [ ' + buffObj.name + ' ] 효과를 받았습니다!<br>';

      var buffChk = recv.buffs.find(e => (e.id === buffObj.id));
      if (buffChk) {
        if (buffObj.stackType === 1) {
          buffChk.dur = buffObj.dur;
        } else if (buffObj.stackType === 2) {
          if (buffChk.stack) {
            buffChk.stack += 1;
          } else {
            buffChk.stack = 2;
          }
        } else if (buffObj.stackType === 3) {
          recv.buffs.push(buffObj);
        }
      } else {
        recv.buffs.push(buffObj);
      }   	  

    } else if (effects[i].code === EFFECT_TYPE_SELF_SP || effects[i].code === EFFECT_TYPE_SELF_HP) {
      if (effects[i].code === EFFECT_TYPE_SELF_SP) {
        winner.curSp += effects[i].value;
        var target = 'SP';
      } else {
        winner.curHp += effects[i].value;
        var target = 'HP';      
      }
      var act = (effects[i].value > 0) ? '회복했다' : '잃었다';
      result += winner.name + getUnnun(winner.nameType) + ' ' + target + '를 ' + Math.abs(effects[i].value) + ' ' + act + '!<br>';
    } else if (effects[i].code === EFFECT_TYPE_ADD_HIT) {
      var tempObj = {};
      tempObj.damage = effects[i].value;
      tempObj.type = DAMAGE_TYPE_PHYSICAL;
      var damage = calcDamage(winner, loser, tempObj);

      result += '<span class="skillDamage">' + loser.name + getUnnun(loser.nameType) + ' 추가로 ' + damage.value + '대미지를 입었습니다!';
      if (damage.crit) {
        result += ' (치명타)';
      }
      result += '</span><br>';
      dealDamage(winner, loser, damage);
    }
  }
}

function resolveTurnBegin(winner, loser) {
  calcStats(winner);
  calcStats(loser);
  resolveTurnBeginChar(winner);
  resolveTurnBeginChar(loser);
}

function resolveTurnBeginChar(chara) {

  for (buff of chara.buffs) {
    if (buff.durOff === DURATION_TYPE_TURN_START) {
      buff.dur--;
    }
    if (buff.dur >= 0) {

    }
  }
  chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
}

function resolveTurnEnd(winner, loser) {
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
    if (buff.durOff === DURATION_TYPE_TURN_END) {
      buff.dur--;
    }
    if (buff.dur >= 0) {
      for (eff of buff.effect) {
        if (eff.code === 1) {
          var stackMpl = buff.stack ? buff.stack : 1;
          eff.damage = eff.value * stackMpl;
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
        }
      }
    }
  }
  chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
}

function getBuffData(eff) {
  var retObj = {};
  retObj.id = eff.buffCode;
  switch (eff.buffCode) {
  case 4 : 
    retObj.name = '기절';
    retObj.nameType = NAME_KOR_END_CONS;
    retObj.durOff = DURATION_TYPE_TURN_START;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 10004;
    retObj.effect.push(effectObj);
    break;
  case 20101 : 
    retObj.name = '혼돈의 힘';
    retObj.nameType = NAME_KOR_END_CONS;
    retObj.durOff = DURATION_TYPE_TURN_START;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 2;
    effectObj.value = eff.value;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20102 : 
    retObj.name = '파괴됨';
    retObj.nameType = NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.durOff = DURATION_TYPE_TURN_START;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 1;
    effectObj.value = eff.value;
    effectObj.type = DAMAGE_TYPE_MAGICAL;
    retObj.effect.push(effectObj);
    break;
  case 20103 : 
    retObj.name = '지옥불길';
    retObj.nameType = NAME_KOR_END_CONS;
    retObj.durOff = DURATION_TYPE_TURN_START;
    retObj.stackType = 3;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 1;
    effectObj.value = eff.value;
    effectObj.type = DAMAGE_TYPE_MAGICAL;
    retObj.effect.push(effectObj);
    break;
  case 20091 : 
    retObj.name = '서리 폭풍우';
    retObj.nameType = NAME_KOR_NO_END_CONS;
    retObj.stackType = 1;
    retObj.durOff = DURATION_TYPE_TURN_START;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = eff.value;
    effectObj.key = 'hpRegen';
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20092 : 
    retObj.name = '사자의 군대';
    retObj.nameType = NAME_KOR_NO_END_CONS;
    retObj.stack = 8;
    retObj.durOff = DURATION_TYPE_TURN_START;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 4;
    effectObj.value = eff.value;
    effectObj.type = DAMAGE_TYPE_PHYSICAL;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 5;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20093 : 
    retObj.name = '서리한 포식';
    retObj.nameType = NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = eff.value;
    effectObj.key = 'spRegen';
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  }

  return retObj;
}

function findBuffByCode(chara, code) {
  if (!chara.buffs || chara.buffs.length === 0) {
    return [];
  }
  return chara.buffs.map(x => x.effect).reduce((acc, val) => acc.concat(val)).filter(x => (x.code == code));
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
    var stackMpl = val.buff.stack ? val.buff.stack : 1;
    chara.stat[val.key] += val.value * stackMpl;
  }
}

function _isBattleFinished() {
  return (charLeft.curHp <= 0 || charRight.curHp <= 0);
}

function getRandom(percent) {
  return (Math.random() < percent);
}

function getIga(type) {
  return (type === NAME_KOR_NO_END_CONS) ? '가' : '이';
}

function getUro(type) {
  return (type === NAME_KOR_NO_END_CONS) ? '로' : '으로';
}

function getUlrul(type) {
  return (type === NAME_KOR_NO_END_CONS) ? '를' : '을';
}

function getUnnun(type) {
  return (type === NAME_KOR_NO_END_CONS) ? '는' : '은';
}

function _initChar(char) {
  char.curHp = char.stat.maxHp;
  char.curSp = 0;
  char.buffs = [];
}

function printCharInfo(flag) {
  result += '<div class="charInfoWrap">' + printChar(charLeft, 'Left', flag) + printChar(charRight, 'Right', flag) + '</div>';
}

function printChar(chara, name, flag) {
  var resultStr = '<div class="charInfo">' +
  '<div class="charInfoName color' + name + '">' + chara.name + '</div>' +
  '<div class="charInfoPoint"><span class="charInfoPointView">' + chara.curHp + ' / ' + chara.stat.maxHp + '</span> ' +
  '<span class="charInfoPointRegen colorHp">(+' + chara.stat.hpRegen + ')</span></div>' +
  '<div class="charInfoPoint"><span class="charInfoPointView">' + chara.curSp + ' / ' + chara.skill.special.cost + '</span> ' +
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