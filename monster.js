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
  
  charLeft = {name : '부러진 직검을 든 망자', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 25, 
      stat : {maxHp : 928, phyAtk : 34, magAtk : 34}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[1]};
  charLeft.image = '';

  charLeft.skill = {
      base : [
              {code : 90012, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90013, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90014, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ]
  };
  module.exports.eBroken = charLeft;
  
  charLeft = {name : '석궁수 망자', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 25, 
      stat : {maxHp : 576, phyAtk : 61, magAtk : 61}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[58]};
  charLeft.image = '';

  charLeft.skill = {
      base : [
              {code : 90015, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90016, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90017, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ]
  };
  module.exports.eCrossbow = charLeft;
  
  charLeft = {name : '재의 심판자, 군다', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 30, 
      stat : {maxHp : 1062, phyAtk : 70, magAtk : 54}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[43], armor : item.list[286], skillArtifact : item.list[418]};
  charLeft.image = 'http://www.microsoftinsider.es/wp-content/uploads/2016/02/dark-souls-3-1.jpg';

  charLeft.skill = {
      base : [
              {code : 90015, name : '찌르기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90016, name : '종베기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90017, name : '휘두르기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
             drive : {code : 90018, name : '각성', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_END,
               cost : 0, chance : 1, effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90002, buffDur : null}], chkNot : [90002]},
             special : {code : 90019, name : '잡기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 75, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 6, buffDur : 3},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 1.3}]}
  };
  module.exports.eGunda = charLeft;
  
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
