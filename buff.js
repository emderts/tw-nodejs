const cons = require('./constant');

module.exports.getBuffData = function(eff) {
  var retObj = {};
  
  var buffCode = undefined;
  if (eff.multiple) {
    var rand = Math.floor(Math.random() * eff.buffCode.length);
    buffCode = eff.buffCode[rand];
  } else {
    buffCode = eff.buffCode;
  }
  
  retObj.id = buffCode;
  retObj.isDebuff = true;
  retObj.dispellable = true;
  retObj.effect = [];
  retObj.durOff = cons.DURATION_TYPE_TURN_START;
  var effectObj = {};
  
  switch (buffCode) {
  case 1 : 
    retObj.name = '화상';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.value = 0.05;
    effectObj.isPercentStat = true;
    effectObj.percentKey = 'maxHp';
    retObj.effect.push(effectObj);
    break;
  case 2 : 
    retObj.name = '중독';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.value = 0.08;
    effectObj.isPercentAttr = true;
    effectObj.percentKey = 'curHp';
    retObj.effect.push(effectObj);
    break;
  case 3 : 
    retObj.name = '출혈';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_SKILL_WIN;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.value = 0.05;
    effectObj.isPercentStat = true;
    effectObj.percentKey = 'maxHp';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.value = 0.03;
    effectObj.isPercentStat = true;
    effectObj.percentKey = 'maxHp';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_DAMAGE_RECEIVE;
    effectObj.code = cons.EFFECT_TYPE_ADD_DAMAGE;
    effectObj.value = 0.15;
    effectObj.buffTarget = [201726];
    effectObj.skillCode = 201721;
    retObj.effect.push(effectObj);
    break;
  case 4 : 
    retObj.name = '기절';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10004;
    retObj.effect.push(effectObj);
    break;
  case 5 : 
    retObj.name = '수면';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10005;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 6 : 
    retObj.name = '탈진';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10006;
    effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
    retObj.effect.push(effectObj);
    break;
  case 7 : 
    retObj.name = '침묵';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10006;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
    retObj.effect.push(effectObj);
    break;
  case 8 : 
    retObj.name = '실명';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.key = 'hit';
    effectObj.value = 0.5;
    retObj.effect.push(effectObj);
    break;
  case 9 : 
    retObj.name = '마비';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.key = 'evasion';
    effectObj.value = 0.5;
    retObj.effect.push(effectObj);
    break;
  case 10 : 
    retObj.name = '봉인';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10010;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 11 : 
    retObj.name = '혼란';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10011;
    retObj.effect.push(effectObj);
    break;
  case 10001 : 
    retObj.name = '깨진 유리검';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyAtk';
    effectObj.value = -15;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magAtk';
    effectObj.value = -15;
    retObj.effect.push(effectObj);
    break;
  case 10002 : 
    retObj.name = '허수아비의 원념';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = -0.02;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = -0.02;
    retObj.effect.push(effectObj);
    break;
  case 10003 : 
    retObj.name = '가치 하락';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.maxStack = 50;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_PERCENTAGE;
    effectObj.key = 'phyAtk';
    effectObj.value = -0.01;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_PERCENTAGE;
    effectObj.key = 'magAtk';
    effectObj.value = -0.01;
    retObj.effect.push(effectObj);
    break;
  case 10004 : 
    retObj.name = '샤에 물듦';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = null;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DEAL_DAMAGE;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.isPercentDamage = true;
    effectObj.value = 0.1;
    retObj.effect.push(effectObj);
    break;
  case 10005 : 
    retObj.name = '핏빛 관통';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = cons.DURATION_TYPE_TURN_END;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'pierce';
    effectObj.value = 1;
    retObj.effect.push(effectObj);
    break;
  case 10006 : 
    retObj.name = '불길의 아이우스타';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.durOff = cons.DURATION_TYPE_TURN_END;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK;
    effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL_FIXED;
    effectObj.value = 16;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK;
    effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
    effectObj.chance = 0.03;
    effectObj.buffCode = 1;
    effectObj.dur = 1;
    retObj.effect.push(effectObj);
    break;
  case 10007 : 
    retObj.name = '검은 정원의 가지';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 0;
    effectObj.key = 'phyReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 0;
    effectObj.key = 'magReduce';
    retObj.effect.push(effectObj);
    break;
  case 10008 : 
    retObj.name = '광신';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = null;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'crit';
    effectObj.value = 0.05;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_SKILL_LOSE;
    effectObj.removeBuff = true;
    retObj.effect.push(effectObj);
    break;
  case 10009 : 
    retObj.name = '야수의 격노';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.maxStack = 20;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyAtkMax';
    effectObj.value = 1;
    retObj.effect.push(effectObj);
    break;
  case 10010 : 
    retObj.name = '백은 수호';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = 0.05;
    retObj.effect.push(effectObj);
    break;
  case 10011 : 
    retObj.name = '춤추는 룬 무기';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK;
    effectObj.code = cons.EFFECT_TYPE_ADD_RESOLUTION;
    retObj.effect.push(effectObj);
    break;
  case 10012 : 
    retObj.name = '부서지는 호박석';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.maxStack = 5;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = -0.002;
    retObj.effect.push(effectObj);
    break;
  case 10013 : 
    retObj.name = '스피드 업!';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'evasion';
    effectObj.value = 0.01;
    retObj.effect.push(effectObj);
    break;
  case 10014 : 
    retObj.name = '펜타곤';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'dmgReduce';
    effectObj.value = 1;
    retObj.effect.push(effectObj);
    break;
  case 10015 : 
    retObj.name = '드렁큰 스텝';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'crit';
    effectObj.value = 1;
    retObj.effect.push(effectObj);
    break;
  case 10016 : 
    retObj.name = '지옥화염';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_OPP_HIT;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL_FIXED;
    effectObj.value = 20;
    retObj.effect.push(effectObj);
    break;
  case 10017 : 
    retObj.name = '지뢰';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.durOff = null;
    retObj.stackType = 3;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_PHYSICAL_FIXED;
    effectObj.chance = 0.2;
    effectObj.value = 20;
    effectObj.removeBuff = true;
    retObj.effect.push(effectObj);
    break;
  case 10018 : 
    retObj.name = '경호';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE;
    effectObj.code = cons.EFFECT_TYPE_SHIELD;
    effectObj.value = 40;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyAtkMin';
    effectObj.value = 8;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyAtkMax';
    effectObj.value = 12;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magAtkMin';
    effectObj.value = 8;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magAtkMax';
    effectObj.value = 12;
    retObj.effect.push(effectObj);
    break;
  case 20101 : 
    retObj.name = '혼돈의 힘';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_DAMAGE;
    effectObj.code = cons.EFFECT_TYPE_ADD_DAMAGE;
    effectObj.skillCode = 20101;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20102 : 
    retObj.name = '파괴됨';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_OPP_HIT;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20103 : 
    retObj.name = '지옥불길';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 3;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_HIT;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20104 : 
    retObj.name = '지옥불길';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 3;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_OPP_HIT;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20091 : 
    retObj.name = '서리 폭풍우';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.isDebuff = false;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'hpRegen';
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20092 : 
    retObj.name = '사자의 군대';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stack = 8;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
    effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_START;
    effectObj.code = cons.EFFECT_TYPE_SELF_HP;
    effectObj.isPercentMax = true;
    effectObj.value = eff.value;
    effectObj.noStack = true;
    retObj.effect.push(effectObj);
    break;
  case 20093 : 
    retObj.name = '서리한 포식';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spRegen';
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20171 : 
    retObj.name = '이검 취약';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = -0.15;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = -0.15;
    retObj.effect.push(effectObj);
    break;
  case 20172 : 
    retObj.name = '이검 취약';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = -0.1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = -0.1;
    retObj.effect.push(effectObj);
    break;
  case 20173 : 
    retObj.name = '흐름 관찰';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.durOff = null;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE;
    effectObj.code = cons.EFFECT_TYPE_SHIELD;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 20174 : 
    retObj.name = '대환수 영랑';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK;
    effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.value = 1;
    effectObj.isPercentBase = true;
    effectObj.percentKey = 'phyAtk';
    effectObj.turnReduce = 1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = cons.EFFECT_TYPE_CHANGE_VALUE;
    effectObj.skillCode = 20172;
    effectObj.value = 0.2;
    retObj.effect.push(effectObj);
    break;
  case 20175 : 
    retObj.name = '진실을 가로막는 허상';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.durOff = cons.DURATION_TYPE_TURN_END;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_RECEIVE_BUFF;
    effectObj.code = cons.EFFECT_TYPE_PREVENT_DEBUFF;
    retObj.effect.push(effectObj);
    break;
  case 20176 : 
    retObj.name = '스파크스터';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_RECEIVE_BUFF;
    effectObj.code = cons.EFFECT_TYPE_PREVENT_DEBUFF;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 0;
    effectObj.key = 'hpRegen';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 0;
    effectObj.key = 'spRegen';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 0;
    effectObj.key = 'spCharge';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 1.5;
    effectObj.key = 'phyReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 1.5;
    effectObj.key = 'magReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DURATION_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
    effectObj.buffCode = 201706;
    effectObj.buffDur = 2;
    retObj.effect.push(effectObj);
    break;
  case 201706 : 
    retObj.name = '기절';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.dispellable = false;
    retObj.durOff = cons.DURATION_TYPE_TURN_END;
    effectObj = {};
    effectObj.code = 10004;
    retObj.effect.push(effectObj);
    break;
  case 20177 : 
    retObj.name = '불확실성';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'evasion';
    effectObj.value = 0.02;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_EVADE;
    effectObj.code = cons.EFFECT_TYPE_SELF_SP;
    effectObj.value = 3;
    effectObj.removeBuff = true;
    retObj.effect.push(effectObj);
    break;
  case 20178 : 
    retObj.name = '프사이-정신교란';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'hit';
    effectObj.value = -0.12;
    retObj.effect.push(effectObj);
    break;
  case 20179 : 
    retObj.name = '프사이-정신분열';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.code = 10011;
    retObj.effect.push(effectObj);
    break;
  case 201710 : 
    retObj.name = '프사이-피해의식';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.code = 10010;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 201711 : 
    retObj.name = '프사이-의식불명';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    effectObj = {};
    effectObj.code = 10005;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 201712 : 
    retObj.name = '프사이-의식붕괴';
    retObj.nameType = cons.NAME_KOR_NO_aEND_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_OPP_HIT;
    effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 201713 : 
    retObj.name = '혼돈의 완성';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'hpRegen';
    effectObj.value = 0;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyAtk';
    effectObj.value = 0;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magAtk';
    effectObj.value = 0;
    retObj.effect.push(effectObj);
    break;
  case 201714 : 
    retObj.name = '중단점_';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = null;
    retObj.isDebuff = false;
    break;
  case 201715 : 
    retObj.name = '시간 왜곡';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.stackType = 4;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_SKILL_RESELECT;
    effectObj.code = cons.EFFECT_TYPE_SKILL_RESELECT;
    effectObj.chance = 1;
    effectObj.stackReduce = 1;
    retObj.effect.push(effectObj);
    break;
  case 201716 : 
    retObj.name = '에너지 코어';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stack = 3;
    retObj.durOff = null;
    retObj.isDebuff = false;
    break;
  case 201717 : 
    retObj.name = '복합 장갑';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 3;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spRegen';
    effectObj.value = 1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = 0.15;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = 0.15;
    retObj.effect.push(effectObj);
    break;
  case 201718 : 
    retObj.name = '방벽 시스템';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_TURN_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
    effectObj.buffCode = 201719;
    effectObj.buffDur = null;
    retObj.effect.push(effectObj);
    break;
  case 201719 : 
    retObj.name = '요새 방벽';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.durOff = null;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE;
    effectObj.code = cons.EFFECT_TYPE_SHIELD;
    effectObj.value = 0.1;
    retObj.effect.push(effectObj);
    break;
  case 201720 : 
    retObj.name = '출력 모드';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.durOff = null;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'crit';
    effectObj.value = 0.15;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK_CRIT;
    effectObj.removeBuff = true;
    retObj.effect.push(effectObj);
    break;
  case 201721 : 
    retObj.name = '재구축 중..';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = -0.5;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = -0.5;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_MULTIPLY;
    effectObj.value = 0;
    effectObj.key = 'spRegen';
    retObj.effect.push(effectObj);
    break;
  case 201722 : 
    retObj.name = '프로토콜 충전';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    break;
  case 201723 : 
    retObj.name = '방출 감전';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = -0.25;
    retObj.effect.push(effectObj);
    break;
  case 201724 : 
    retObj.name = '방전';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    effectObj = {};
    effectObj.code = 10004;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DURATION_END;
    effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
    effectObj.buffCode = 201725;
    effectObj.buffDur = null;
    retObj.effect.push(effectObj);
    break;
  case 201725 : 
    retObj.name = '전하 충전';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.maxStack = 5;
    retObj.isDebuff = false;
    retObj.durOff = null;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = 0.02;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = 0.02;
    retObj.effect.push(effectObj);
    break;
  case 201726 : 
    retObj.name = '환영';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 3;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'crit';
    effectObj.value = 0.02;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'evasion';
    effectObj.value = 0.06;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_EVADE;
    effectObj.breakResolution = true;
    effectObj.removeBuff = true;
    retObj.effect.push(effectObj);
    break;
  case 201727 : 
    retObj.name = '조여오는 어둠';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'hit';
    effectObj.value = -0.05;
    retObj.effect.push(effectObj);
    break;
  case 201728 : 
    retObj.name = '암흑';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'crit';
    effectObj.value = 0.1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_DEAL_DAMAGE_CRIT;
    effectObj.code = cons.EFFECT_TYPE_MULTIPLE;
    effectObj.target = [];
    var tgt = {};
    tgt.code = cons.EFFECT_TYPE_SELF_SP;
    tgt.value = 3;
    effectObj.target.push(tgt);
    tgt = {};
    tgt.code = cons.EFFECT_TYPE_OPP_SP;
    tgt.value = -3;
    effectObj.target.push(tgt);
    retObj.effect.push(effectObj);
    break;
  case 201729 : 
    retObj.name = '키보드 샷건';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_DAMAGE;
    effectObj.code = cons.EFFECT_TYPE_ADD_DAMAGE;
    effectObj.value = eff.value;
    effectObj.anySkill = true;
    retObj.effect.push(effectObj);
    break;
  case 201730 : 
    retObj.name = '해탈';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_RECEIVE_BUFF;
    effectObj.code = cons.EFFECT_TYPE_PREVENT_DEBUFF;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spRegen';
    effectObj.value = 5;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = -0.15;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = 0.15;
    retObj.effect.push(effectObj);
    break;
  case 201731 : 
    retObj.name = '거북이';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.maxStack = 5;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 201732 : 
    retObj.name = '꼬장부리기';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stackType = 1;
    retObj.durOff = null;
    retObj.isDebuff = false;
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_ATTACK;
    effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
    effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
    effectObj.value = 0.15;
    effectObj.isPercentDmg = true;
    effectObj.removeBuff = true;
    retObj.effect.push(effectObj);
    break;
  case 201733 : 
    retObj.name = '팩트폭격';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.maxStack = 5;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'phyReduce';
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'magReduce';
    effectObj.value = eff.value;
    retObj.effect.push(effectObj);
    break;
  case 201734 : 
    retObj.name = '한심한 시선';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'critDmg';
    effectObj.value = -0.1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spRegen';
    effectObj.value = -1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spCharge';
    effectObj.value = -1;
    retObj.effect.push(effectObj);
    break;
  case 201735 : 
    retObj.name = '화병';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'hpRegen';
    effectObj.value = -3;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spRegen';
    effectObj.value = -1;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'spCharge';
    effectObj.value = -1;
    retObj.effect.push(effectObj);
    break;
  case 201736 : 
    retObj.name = '한심함';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.isDebuff = false;
    retObj.effect = [];
    effectObj = {};
    effectObj.active = cons.ACTIVE_TYPE_CALC_STATS;
    effectObj.code = cons.EFFECT_TYPE_STAT_ADD;
    effectObj.key = 'evasion';
    effectObj.value = 1;
    retObj.effect.push(effectObj);
    break;
  }

  return retObj;
}
