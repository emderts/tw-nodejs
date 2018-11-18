const cons = require('./constant');
const item = require('./items');

  var charLeft = {name : '메비우스 크로울러 무리', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 8, level : 20, 
      stat : {maxHp : 700, phyAtk : 48, magAtk : 40, hit : 1.1}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = 'https://i.imgur.com/8dFfCSW.png';

  charLeft.skill = {
      base : [
              {code : 90001, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
  };
  module.exports.mCrawler = charLeft;
  
  charLeft = {name : '메비우스 헤드 헌터', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 8, level : 20, 
      stat : {maxHp : 700, phyAtk : 48, magAtk : 40}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[34]};
  charLeft.image = 'https://i.imgur.com/OUFhWjw.png';

  charLeft.skill = {
      base : [
              {code : 90004, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90005, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90006, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
      special : {code : 90007, name : '머리 사냥', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 60, 
        effect : [{code : cons.EFFECT_TYPE_ADD_HIT, chance : 0.2, chanceSubKeyOpp : 'evasion', type : cons.DAMAGE_TYPE_PHYSICAL, value : 3}]}
  };
  module.exports.mHeadHunter = charLeft;
  
  charLeft = {name : '메비우스 타우러스', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 8, level : 30, 
      stat : {maxHp : 1090, phyAtk : 48, magAtk : 40}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[58]};
  charLeft.image = 'https://i.imgur.com/gVfJIio.png';

  charLeft.skill = {
      base : [
              {code : 90008, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90009, name : '돌진', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 4, buffDur : 1}]}, 
              {code : 90010, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
      special : {code : 90011, name : '전투의 포효', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 80, 
        effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90001, buffDur : 3}]}
  };
  module.exports.mTaurus = charLeft;
  
  function _initChar(char) {
    char.stat.spCharge = 5;
    char.stat.hpRegen = 0;
    char.stat.spRegen = 5;
    char.stat.crit = 0.05;
    char.stat.critDmg = 1.5;
    char.stat.phyReduce = 0;
    char.stat.magReduce = 0;
    char.stat.hit = char.stat.hit ? char.stat.hit : 1;
    char.stat.evasion = 0;
    char.stat.phyAtkMin = 0;
    char.stat.phyAtkMax = 0;
    char.stat.magAtkMin = 0;
    char.stat.magAtkMax = 0;
    char.stat.dmgReduce = 0;
    char.stat.pierce = 0;
    char.base = JSON.parse(JSON.stringify(char.stat));
    char.inventory = [];
    char.exp = 0;
    char.reqExp = 100;
    char.statPoint = 0;
    char.premiumPoint = 10;
    char.battleCnt = 0;
    char.winCnt = 0;
    char.battleRecord = {};
    char.winRecord = {};
    char.dust = 0;
    char.dungeonInfos = {};
  }
