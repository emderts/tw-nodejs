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
  
  switch (buffCode) {
  case 4 : 
    retObj.name = '기절';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    var effectObj = {};
    effectObj.code = 10004;
    retObj.effect.push(effectObj);
    break;
  case 5 : 
    retObj.name = '수면';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    var effectObj = {};
    effectObj.code = 10005;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 7 : 
    retObj.name = '침묵';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    var effectObj = {};
    effectObj.code = 10007;
    retObj.effect.push(effectObj);
    break;
  case 8 : 
    retObj.name = '실명';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    var effectObj = {};
    effectObj.code = 10;
    effectObj.key = 'hit';
    effectObj.value = 0.5;
    retObj.effect.push(effectObj);
    break;
  case 10 : 
    retObj.name = '봉인';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    var effectObj = {};
    effectObj.code = 10010;
    retObj.effect.push(effectObj);
    break;
  case 11 : 
    retObj.name = '혼란';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    var effectObj = {};
    effectObj.code = 10011;
    retObj.effect.push(effectObj);
    break;
  case 20101 : 
    retObj.name = '혼돈의 힘';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.isDebuff = false;
    var effectObj = {};
    effectObj.code = 2;
    effectObj.value = eff.value;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20102 : 
    retObj.name = '파괴됨';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    var effectObj = {};
    effectObj.code = 1;
    effectObj.value = eff.value;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
    retObj.effect.push(effectObj);
    break;
  case 20103 : 
    retObj.name = '지옥불길';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 3;
    var effectObj = {};
    effectObj.code = 1;
    effectObj.value = eff.value;
    effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
    retObj.effect.push(effectObj);
    break;
  case 20091 : 
    retObj.name = '서리 폭풍우';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.isDebuff = false;
    retObj.stackType = 1;
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = eff.value;
    effectObj.key = 'hpRegen';
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20092 : 
    retObj.name = '사자의 군대';
    retObj.nameType = cons.NAME_KOR_NO_END_CONS;
    retObj.stack = 8;
    retObj.isDebuff = false;
    var effectObj = {};
    effectObj.code = 4;
    effectObj.value = eff.value;
    effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 5;
    effectObj.value = eff.value;
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
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = eff.value;
    effectObj.key = 'spRegen';
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20171 : 
    retObj.name = '이검 취약';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = -0.15;
    effectObj.key = 'phyReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 3;
    effectObj.value = -0.15;
    effectObj.key = 'magReduce';
    retObj.effect.push(effectObj);
    break;
  case 20172 : 
    retObj.name = '이검 취약';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = -0.1;
    effectObj.key = 'phyReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 3;
    effectObj.value = -0.1;
    effectObj.key = 'magReduce';
    retObj.effect.push(effectObj);
    break;
  case 20173 : 
    retObj.name = '흐름 관찰';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.durOff = null;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 6;
    effectObj.value = eff.value;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20174 : 
    retObj.name = '대환수 영랑';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 7;
    effectObj.turnReduce = 1;
    effectObj.buff = retObj;
    effectObj.key = 'phyAtk';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 8;
    effectObj.value = 0.2;
    retObj.effect.push(effectObj);
    break;
  case 20175 : 
    retObj.name = '진실을 가로막는 허상';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.durOff = cons.DURATION_TYPE_TURN_END;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 9;
    retObj.effect.push(effectObj);
    break;
  case 20176 : 
    retObj.name = '스파크스터';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.isDebuff = false;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 9;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 10;
    effectObj.value = 0;
    effectObj.key = 'hpRegen';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 10;
    effectObj.value = 0;
    effectObj.key = 'spRegen';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 10;
    effectObj.value = 0;
    effectObj.key = 'spCharge';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 10;
    effectObj.value = 1.5;
    effectObj.key = 'phyReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 10;
    effectObj.value = 1.5;
    effectObj.key = 'magReduce';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 11;
    effectObj.buffCode = 4;
    effectObj.dur = 1;
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
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = 0.02;
    effectObj.key = 'evasion';
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 12;
    effectObj.value = 3;
    effectObj.key = 'curSp';
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 20178 : 
    retObj.name = '프사이-정신교란';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = -0.12;
    effectObj.key = 'hit';
    retObj.effect.push(effectObj);
    break;
  case 20179 : 
    retObj.name = '프사이-정신분열';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 10011;
    retObj.effect.push(effectObj);
    break;
  case 201710 : 
    retObj.name = '프사이-피해의식';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 10010;
    retObj.effect.push(effectObj);
    break;
  case 201711 : 
    retObj.name = '프사이-의식불명';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 10005;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  case 201712 : 
    retObj.name = '프사이-의식붕괴';
    retObj.nameType = cons.NAME_KOR_NO_aEND_CONS;
    retObj.stackType = 1;
    var effectObj = {};
    effectObj.code = 1;
    effectObj.value = eff.value;
    effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
    retObj.effect.push(effectObj);
    break;
  case 201713 : 
    retObj.name = '혼돈의 완성';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 1;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 3;
    effectObj.value = 0;
    effectObj.key = 'hpRegen';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 3;
    effectObj.value = 0;
    effectObj.key = 'phyAtk';
    retObj.effect.push(effectObj);
    effectObj = {};
    effectObj.code = 3;
    effectObj.value = 0;
    effectObj.key = 'magAtk';
    retObj.effect.push(effectObj);
    break;
  case 201714 : 
    retObj.name = '중단점_';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.effect = [];
    break;
  case 201715 : 
    retObj.name = '시간 왜곡';
    retObj.nameType = cons.NAME_KOR_END_CONS;
    retObj.stackType = 2;
    retObj.stack = 1;
    retObj.durOff = null;
    retObj.isDebuff = false;
    retObj.stackType = 4;
    retObj.effect = [];
    var effectObj = {};
    effectObj.code = 13;
    effectObj.chance = 1;
    effectObj.turnReduce = 1;
    effectObj.buff = retObj;
    retObj.effect.push(effectObj);
    break;
  }

  return retObj;
}