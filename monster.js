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
  
  charLeft = {name : '부러진 직검을 든 망자', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 30, 
      stat : {maxHp : 960, phyAtk : 41, magAtk : 34}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[1], armor : item.list[115], subarmor : item.list[167]};
  charLeft.image = '';

  charLeft.skill = {
      base : [
              {code : 90012, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90014, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []},
              {code : 90013, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}
             ],
             special : {code : 90019, name : '망자의 집념', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 9, buffDur : 2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 1.0}]}
  };
  module.exports.eBroken = charLeft;
  
  charLeft = {name : '석궁수 망자', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 30, 
      stat : {maxHp : 640, phyAtk : 63, magAtk : 63}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[19], armor : item.list[115], subarmor : item.list[185]};
  charLeft.image = '';

  charLeft.skill = {
      base : [
              {code : 90015, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90017, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []},
              {code : 90016, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}
             ],
             special : {code : 90019, name : '망자의 집념', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 9, buffDur : 2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 1.0}]}
  };
  module.exports.eCrossbow = charLeft;
  
  charLeft = {name : '재의 심판자, 군다', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 50, 
      stat : {maxHp : 1336, phyAtk : 65, magAtk : 65}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[42], armor : item.list[286], skillArtifact : item.list[418]};
  charLeft.image = 'http://www.microsoftinsider.es/wp-content/uploads/2016/02/dark-souls-3-1.jpg';

  charLeft.skill = {
      base : [
              {code : 90015, name : '찌르기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90016, name : '종베기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90017, name : '휘두르기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
             drive : {code : 90018, name : '검게 꿈틀거리는 자', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_END,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 9, buffDur : 2},
                         {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90002, buffDur : null},
                         {code : cons.EFFECT_TYPE_REMOVE_BUFF, standard : true}], chkHp : 0.5, fireOnce : true},
             special : {code : 90020, name : '잡기', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 40, 
               effect : [{code : cons.EFFECT_TYPE_MULTIPLE, chance : 0.5, chanceSubKeyOpp : 'evasion', 
                 target : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 3, buffDur : 1},
                           {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 100}]}]}
  };
  module.exports.eGunda = charLeft;
  
  charLeft = {name : '꺼져가는 불의 정령왕', nameType : cons.NAME_KOR_END_CONS, title : '불타는 과수원', rank : 7, level : 50, 
      stat : {maxHp : 36500, phyAtk : 75, magAtk : 85}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[342], armor : item.list[369], subarmor : item.list[376], trinket : item.list[395]};
  charLeft.image = 'https://i.imgur.com/nuGyBWu.png';
  charLeft.boss = true;

  charLeft.skill = {
      base : [
              {code : 90021, name : '레그 번', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.3, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 1, buffDur : 1}]},
              {code : 90022, name : '불의 정령 소환', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.8, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90003, buffDur : null}]},
              {code : 90023, name : '살라맨더 소환', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.9, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90004, buffDur : 3}]}
             ],
             drive : {code : 90024, name : '화염 수호', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TAKE_HIT,
               cost : 15, chance : 0.2, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 2, isPercentDamage : true}]},
             special : {code : 90025, name : '불새의 춤', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 120, 
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90005, buffDur : null}]}
  };
  module.exports.oEleLord = charLeft;
  
  charLeft = {name : '타오르는 영석술사', nameType : cons.NAME_KOR_NO_END_CONS, title : '불타는 과수원', rank : 7, level : 50, 
      stat : {maxHp : 37800, phyAtk : 65, magAtk : 95}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[344], armor : item.list[372], subarmor : item.list[383], trinket : item.list[405]};
  charLeft.image = 'https://i.imgur.com/CvvNpto.png';
  charLeft.boss = true;

  charLeft.skill = {
      base : [
              {code : 90026, name : '타오르는 영석-악', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90006, buffDur : null}]},
              {code : 90027, name : '타오르는 영석-수호', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90007, buffDur : null}]},
              {code : 90028, name : '타오르는 영석-충전', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90008, buffDur : null}]}
             ],
             drive : {code : 90029, name : '에너지 파동', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_ATTACK,
               cost : 10, chance : 0.1, 
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90009, buffDur : null}]},
             special : {code : 90030, name : '가속화', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : [90006, 90007, 90008], buffDur : null, multiple : true},
                         {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : [90006, 90007, 90008], buffDur : null, multiple : true},
                         {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : [90006, 90007, 90008], buffDur : null, multiple : true}]}
  };
  module.exports.oStoneist = charLeft;
  
  charLeft = {name : '불타버린 죽음의 기사', nameType : cons.NAME_KOR_NO_END_CONS, title : '불타는 과수원', rank : 7, level : 50, 
      stat : {maxHp : 39100, phyAtk : 100, magAtk : 65}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[350], armor : item.list[375], subarmor : item.list[376], trinket : item.list[397]};
  charLeft.image = 'https://i.imgur.com/9ciU9QK.png';
  charLeft.boss = true;

  charLeft.skill = {
      base : [
              {code : 90031, name : '죽음과 부패', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.7, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 90010, buffDur : null}]},
              {code : 90032, name : '역병', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.8, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : [6, 9], buffDur : 2, multiple : true}]},
              {code : 90033, name : '가고일 소환', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.5, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90011, buffDur : null}]}
             ],
             drive : {code : 90034, name : '역병 고리', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 5, chance : 0.2, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : [2, 6, 7, 8, 9, 10], buffDur : 2, multiple : true}]},
             special : {code : 90035, name : '사자의 군대', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.2}]}
  };
  module.exports.oDeathKnight = charLeft;
  
  charLeft = {name : '거대개미 렉\'오르', nameType : cons.NAME_KOR_NO_END_CONS, title : '불타는 과수원', rank : 7, level : 55, 
      stat : {maxHp : 42000, phyAtk : 100, magAtk : 100}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[356], armor : item.list[373], subarmor : item.list[384], trinket : item.list[408]};
  charLeft.image = 'https://i.imgur.com/8EkPS8P.png';
  charLeft.boss = true;

  charLeft.skill = {
      base : [
              {code : 90036, name : '개미 무리', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.2, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 8, buffDur : 3}]},
              {code : 90037, name : '희생의 의식', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.9, 
                effect : [{code : cons.EFFECT_TYPE_SELF_HP, value : 0.6, isPercentDamage : true}]},
              {code : 90038, name : '가시 관통', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.4, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 2, buffDur : 2}]}
             ],
             drive : {code : 90039, name : '불타는 과수원', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_END,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 1, buffDur : 2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL, value : 0.8}]},
             special : {code : 90040, name : '잠복', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 150, 
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90012, buffDur : null},
                         {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90012, buffDur : null}]}
  };
  module.exports.oLegor = charLeft;
  
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
