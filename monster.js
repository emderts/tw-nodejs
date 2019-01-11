const cons = require('./constant');
const item = require('./items');
const chara = require('./chara');
  
  var charLeft = {name : '메비우스 크로울러 무리', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 8, level : 20, 
      stat : {maxHp : 700, phyAtk : 48, magAtk : 40, hit : 1.1}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = 'https://i.imgur.com/8dFfCSW.png';
  charLeft.boss = 0.5;

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
  charLeft.boss = 0.5;

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
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

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
  
  var charLeft = {name : '메비우스 매스 크로울러', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 6, level : 20, 
      stat : {maxHp : 5344, phyAtk : 72, magAtk : 70, hit : 1.1}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = 'https://i.imgur.com/KGuCcUy.png';
  charLeft.boss = 0.5;

  charLeft.skill = {
      base : [
              {code : 90001, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
             drive : {code : 90018, name : '물량 돌격', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90064, buffDur : null, setStack : 100, isHpPercentage : true}]},
             special : {code : 90007, name : '증식', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, isPercentStat : true, percentKey : 'maxHp', value : 0.2}]}
  };
  module.exports.mMassCrawler = charLeft;
  
  var charLeft = {name : '메비우스 디스토리어', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 6, level : 20, 
      stat : {maxHp : 5016, phyAtk : 160, magAtk : 205}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = 'https://i.imgur.com/POvhxJP.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

  charLeft.skill = {
      base : [
              {code : 90001, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
             drive : {code : 90018, name : '디-스토리', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_ATTACK,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 10049, buffDur : 4}]},
             special : {code : 90007, name : '글레이브 투척', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 1, doRandomize : [0.01, 3]},
                         {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 4, buffDur : 1}]}
  };
  module.exports.mDestoryer = charLeft;
  
  charLeft = {name : '메비우스 메가 타우러스', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 6, level : 20, 
      stat : {maxHp : 5016, phyAtk : 205, magAtk : 160}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = 'https://i.imgur.com/fO9DwYc.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

  charLeft.skill = {
      base : [
              {code : 90008, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90009, name : '돌진', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 4, buffDur : 1}]}, 
              {code : 90010, name : '포악한 울음소리', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 4, buffDur : 1}]}
             ],
      drive : {code : 90018, name : '폭식', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_CALC_DAMAGE, chkOpp : [4],
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, value : 1, isPercentDamage : true}]},
      special : {code : 90011, name : '전투의 포효 II', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
        effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90063, buffDur : 3}]}
  };
  module.exports.mMegaTaurus = charLeft;
  
  charLeft = {name : '부러진 직검을 든 망자', nameType : cons.NAME_KOR_NO_END_CONS, title : '재의 묘소', rank : 8, level : 30, 
      stat : {maxHp : 960, phyAtk : 41, magAtk : 34}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[1], armor : item.list[115], subarmor : item.list[167]};
  charLeft.image = 'https://i.imgur.com/WcCqnzE.png';
  charLeft.boss = 0.5;

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
  charLeft.image = 'https://i.imgur.com/w7hyYXb.png';
  charLeft.boss = 0.5;

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
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

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
  
  charLeft = {name : '결실을 사르는 업화', nameType : cons.NAME_KOR_END_CONS, title : '불타는 과수원', rank : 7, level : 50, 
      stat : {maxHp : 400, phyAtk : 44, magAtk : 44}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.boss = 0.5;

  charLeft.skill = {
      base : [
              {code : 90021, name : '업화의 일격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.3, 
                effect : [{code : cons.EFFECT_TYPE_SELF_HP, value : 0.5, isPercentDamage : true}]},
              {code : 90022, name : '업화의 일격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.8, 
                effect : [{code : cons.EFFECT_TYPE_SELF_HP, value : 0.5, isPercentDamage : true}]},
              {code : 90023, name : '업화의 일격', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.9, 
                effect : [{code : cons.EFFECT_TYPE_SELF_HP, value : 0.5, isPercentDamage : true}]}
             ],
             special : {code : 90025, name : '거스르지 못한 업화', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 75, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 1, isPercentChar : true, percentKey : 'curHp'},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 1, isPercentChar : true, percentKey : 'curHp'}]}
  };
  module.exports.oFlame = charLeft;
  
  charLeft = {name : '꺼져가는 불의 정령왕', nameType : cons.NAME_KOR_END_CONS, title : '불타는 과수원', rank : 7, level : 50, 
      stat : {maxHp : 35000, phyAtk : 95, magAtk : 95}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[342], armor : item.list[369], subarmor : item.list[376], trinket : item.list[395]};
  charLeft.image = 'https://i.imgur.com/nuGyBWu.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

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
      stat : {maxHp : 37500, phyAtk : 100, magAtk : 100}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[344], armor : item.list[372], subarmor : item.list[383], trinket : item.list[405]};
  charLeft.image = 'https://i.imgur.com/CvvNpto.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

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
      stat : {maxHp : 40000, phyAtk : 105, magAtk : 105}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[350], armor : item.list[375], subarmor : item.list[376], trinket : item.list[397]};
  charLeft.image = 'https://i.imgur.com/9ciU9QK.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

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
      stat : {maxHp : 80000, phyAtk : 115, magAtk : 115}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[356], armor : item.list[373], subarmor : item.list[384], trinket : item.list[408]};
  charLeft.image = 'https://i.imgur.com/8EkPS8P.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

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
  
  charLeft = {name : '카이네스 엠더츠', nameType : cons.NAME_KOR_NO_END_CONS, title : '고대 흑마법사', rank : 7, level : 20, 
      stat : {maxHp : 14500, phyAtk : 100, magAtk : 85}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[355], armor : item.list[296], subarmor : item.list[241], trinket : item.list[335]};
  charLeft.image = 'https://i.imgur.com/IabA7Am.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

  charLeft.skill = {};
  charLeft.skill.base = [];

  var skillObj = {code : 20101, name : '혼돈의 화살', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.2,
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 20101, buffDur : 2, value : 0.6}],
      tooltip : '100\% 확률로 자신에게 2턴간 [혼돈의 힘] 버프 부여<br><br>[혼돈의 힘] : 혼돈의 화살 공격력 +0.6'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20102, name : '파괴의 저주', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.7, 
      effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 1, buffCode : 20102, buffDur : 3, value : 0.1}],
      tooltip : '50\% 확률로 적에게 3턴간 [파괴됨] 버프 부여<br><br>[파괴됨] : 마법 0.1 피해'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20103, name : '망각의 계약', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.1, 
      effect : [{code : cons.EFFECT_TYPE_SELF_SP, chance : 0.5, value : 15}],
      tooltip : '30\% 확률로 자신의 SP 15 회복'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20104, name : '생명력 전환', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
      active : cons.ACTIVE_TYPE_ATTACK, cost : 0, chance : 0.5, 
      effect : [{code : cons.EFFECT_TYPE_SELF_SP, value : 25},
                {code : cons.EFFECT_TYPE_SELF_HP, value : -20}],
      tooltip : '공격 성공 시 50\% 확률로 자신의 HP를 20 잃고 SP 25 회복'};
  charLeft.skill.drive = skillObj;

  skillObj = {code : 20105, name : '지옥불길', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 90, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 20103, buffDur : 5, value : 0.4},
                {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 20104, buffDur : 5, value : 0.4}],
      tooltip : '자신과 적에게 5턴간 [지옥불길] 버프 부여<br><br>[지옥불길] : 마법 0.4 피해'};
  charLeft.skill.special = skillObj;
  module.exports.rKines1 = charLeft;
  
  charLeft = {name : '지옥불정령 무리', nameType : cons.NAME_KOR_NO_END_CONS, title : '고대 흑마법사', rank : 7, level : 20, 
      stat : {maxHp : 12000, phyAtk : 80, magAtk : 80}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[351], armor : item.list[294], subarmor : item.list[305], trinket : item.list[333]};
  charLeft.image = 'https://i.imgur.com/DySw4QI.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

  charLeft.skill = {
      base : [
              {code : 90036, name : '돌진', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.2, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 6, buffDur : 2}]},
              {code : 90037, name : '일반 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.7, 
                effect : [{code : cons.EFFECT_TYPE_SELF_HP, value : 0.6, isPercentDamage : true}]},
              {code : 90038, name : '면역의 일격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.2, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 7, buffDur : 2}]}
             ],
             special : {code : 20105, name : '지옥불길', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 90, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 20103, buffDur : 5, value : 0.4},
                {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 20104, buffDur : 5, value : 0.4}],
      tooltip : '자신과 적에게 5턴간 [지옥불길] 버프 부여<br><br>[지옥불길] : 마법 0.4 피해'}
  };
  module.exports.rInfernal = charLeft;
  
  charLeft = {name : '카이네스 엠더츠 (2차)', nameType : cons.NAME_KOR_NO_END_CONS, title : '고대 흑마법사', rank : 7, level : 20, 
      stat : {maxHp : 15000, phyAtk : 100, magAtk : 100}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[355], armor : item.list[296], subarmor : item.list[241], trinket : item.list[335]};
  charLeft.image = 'https://i.imgur.com/IabA7Am.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

  charLeft.skill = {};
  charLeft.skill.base = [];

  var skillObj = {code : 20101, name : '혼돈의 화살', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.2,
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 20101, buffDur : 2, value : 0.6}],
      tooltip : '100\% 확률로 자신에게 2턴간 [혼돈의 힘] 버프 부여<br><br>[혼돈의 힘] : 혼돈의 화살 공격력 +0.6'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20102, name : '파괴의 저주', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.7, 
      effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 1, buffCode : 20102, buffDur : 3, value : 0.2}],
      tooltip : '50\% 확률로 적에게 3턴간 [파괴됨] 버프 부여<br><br>[파괴됨] : 마법 0.1 피해'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20103, name : '망각의 계약', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.1, 
      effect : [{code : cons.EFFECT_TYPE_SELF_SP, chance : 0.5, value : 25}],
      tooltip : '30\% 확률로 자신의 SP 15 회복'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20104, name : '생명력 전환', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
      active : cons.ACTIVE_TYPE_ATTACK, cost : 0, chance : 0.5, 
      effect : [{code : cons.EFFECT_TYPE_SELF_SP, value : 25},
                {code : cons.EFFECT_TYPE_SELF_HP, value : -20}],
      tooltip : '공격 성공 시 50\% 확률로 자신의 HP를 20 잃고 SP 25 회복'};
  charLeft.skill.drive = skillObj;

  skillObj = {code : 20105, name : '지옥불길', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 90, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 20103, buffDur : 5, value : 0.6},
                {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 20104, buffDur : 5, value : 0.6}],
      tooltip : '자신과 적에게 5턴간 [지옥불길] 버프 부여<br><br>[지옥불길] : 마법 0.4 피해'};
  charLeft.skill.special = skillObj;
  module.exports.rKines2 = charLeft;

  charLeft = {name : '허수아비', nameType : cons.NAME_KOR_NO_END_CONS, title : '메비우스', rank : 8, level : 20, 
      stat : {maxHp : 2000, phyAtk : 40, magAtk : 40}};
  _initChar(charLeft);
  
  charLeft.items = {};

  charLeft.skill = {
      base : [
              {code : 90001, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
  };
  module.exports.xTrain = charLeft;
  
  charLeft = {name : '에이카', nameType : cons.NAME_KOR_NO_END_CONS, title : '움직이는 요새', rank : 7, level : 40, 
      stat : {maxHp : 61800, phyAtk : 123.45, magAtk : 50}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[352], armor : item.list[370], subarmor : item.list[307], trinket : item.list[333], skillArtifact : item.list[437]};
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

  charLeft.skill = chara.aeika.skill;
  module.exports.rAeika = charLeft;
  
  charLeft = {name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, title : '매버릭 타임 코더', rank : 7, level : 40, 
      stat : {maxHp : 6000, phyAtk : 70.3, magAtk : 70.3}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[203], armor : item.list[219], subarmor : item.list[228], trinket : item.list[261]};
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 13, buffDur : 999999}];

  charLeft.skill = {
      base : [
              {code : 90001, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
      drive : {code : 90039, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1,
               effect : [{code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 999999, chkTurn : 51},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 999999, chkMoreAttack : true, chkTurn : 51}]}
  };
  module.exports.rTimeStorm = charLeft;
  
  charLeft = {name : '줄리어스 엠더츠', nameType : cons.NAME_KOR_NO_END_CONS, title : '매버릭 타임 코더', rank : 7, level : 40, 
      stat : {maxHp : 70200, phyAtk : 70.3, magAtk : 70.3}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[356], armor : item.list[372], subarmor : item.list[391], trinket : item.list[411]};
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;

  charLeft.skill = chara.julius.skill;
  module.exports.rJulius = charLeft;
  
  charLeft = {name : '초급 기사', nameType : cons.NAME_KOR_NO_END_CONS, title : '검은 빛의 수련장', rank : 7, level : 30, 
      stat : {maxHp : 1440, phyAtk : 92, magAtk : 57}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[11], armor : item.list[143], subarmor : item.list[178]};
  charLeft.image = '';
  charLeft.boss = 0.5;

  charLeft.skill = {
      base : [
              {code : 90015, name : '물리 공격 I', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90016, name : '물리 공격 II', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90017, name : '마법 공격', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
      drive : {code : 90041, name : '긴급 회피', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_SKILL_LOSE, cost : 10, chance : 0.05,
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90013, buffDur : 1}]},
      special : {code : 90040, name : '플레어 스트라이크', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 8, buffDur : 2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 2.0}]}
  };
  charLeft.skillSelect = 0;
  module.exports.d7Knight = charLeft;
  
  charLeft = {name : '정예 기사', nameType : cons.NAME_KOR_NO_END_CONS, title : '검은 빛의 수련장', rank : 7, level : 30, 
      stat : {maxHp : 1560, phyAtk : 120, magAtk : 65}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[341], armor : item.list[143], subarmor : item.list[178], trinket : item.list[398]};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

  charLeft.skill = {
      base : [
              {code : 90015, name : '물리 공격 I', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90016, name : '물리 공격 II', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []},
              {code : 90017, name : '마법 공격', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
      drive : {code : 90041, name : '향상된 긴급 회피', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_SKILL_LOSE, cost : 10, chance : 0.08,
               effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90013, buffDur : 1}]},
      special : {code : 90040, name : '플레어 스트라이크', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 8, buffDur : 2},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 2.0}]}
  };
  charLeft.skillSelect = 0;
  module.exports.d7EliteKnight = charLeft;
  
  charLeft = {name : '기사단장 로엔그린', nameType : cons.NAME_KOR_END_CONS, title : '검은 빛의 수련장', rank : 7, level : 40, 
      stat : {maxHp : 1680, phyAtk : 127, magAtk : 68}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[357], armor : item.list[143], subarmor : item.list[389], trinket : item.list[396], skillArtifact : item.list[514]};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

  charLeft.skill = {
      base : [
              {code : 90042, name : '피날레 임팩션', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : [10068, 10069, 10070, 10071, 10072, 10073], buffDur : 3, multiple : true},
                          {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : [10068, 10069, 10070, 10071, 10072, 10073], buffDur : 3, multiple : true}]},
              {code : 90043, name : '전술 지휘', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_OPP_SP, value : -10},
                          {code : cons.EFFECT_TYPE_RESOLVE_DRIVE}]},
              {code : 90044, name : '플레어 캐논', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_MULTIPLE, chance : 0.25, 
                  target : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 8, buffDur : 2},
                            {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 11, buffDur : 2}]}]}
             ],
      drive : {code : 90045, name : '흑색 유성', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_TAKE_HIT, cost : 10, chance : 0.25,
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 90014, buffDur : 1}]}
  };
  charLeft.skillSelect = 2;
  charLeft.rating = [0.35, 0.3, 0.35];
  module.exports.d7Lohengrin = charLeft;
  
  charLeft = {name : '석영 차원문', nameType : cons.NAME_KOR_END_CONS, title : '전이된 석영 고원', rank : 7, level : 50, 
      stat : {maxHp : 10, phyAtk : 44, magAtk : 44}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.boss = 0.5;

  charLeft.skill = {
      base : [
              {code : 90001, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ]
  };
  module.exports.d720 = charLeft;
  
  charLeft = {name : '사천왕 칸나', nameType : cons.NAME_KOR_NO_END_CONS, title : '사천왕 칸나', rank : 7, level : 40, 
      stat : {maxHp : 2100, phyAtk : 50, magAtk : 140, phyReduce : 0.35}};
  _initChar(charLeft);
  
  charLeft.items = {trinket : item.list[493]};
  charLeft.image = 'https://i.imgur.com/MY23fZT.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90015, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90017, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90019, buffDur : null}];

  charLeft.skill = {
      base : [
              {},
              {},
              {}
             ],
      drive : {code : 90045, name : '회복약', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_TAKE_HIT, cost : 0, chance : 0.5, fireOnce : true, chkHp : 0.3,
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, isPercentStat : true, percentKey : 'maxHp', value : 5}]}
  };
  module.exports.d721 = charLeft;
  
  charLeft = {name : '사천왕 시바', nameType : cons.NAME_KOR_NO_END_CONS, title : '사천왕 시바', rank : 7, level : 40, 
      stat : {maxHp : 2400, phyAtk : 180, magAtk : 50}};
  _initChar(charLeft);
  
  charLeft.items = {trinket : item.list[493]};
  charLeft.image = 'https://i.imgur.com/stlIqKO.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90021, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90023, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90025, buffDur : null}];

  charLeft.skill = {
      base : [
              {},
              {},
              {}
             ],
      drive : {code : 90045, name : '회복약', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_TAKE_HIT, cost : 0, chance : 0.65, fireOnce : true, chkHp : 0.3,
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, isPercentStat : true, percentKey : 'maxHp', value : 5}]}
  };
  module.exports.d722 = charLeft;
  
  charLeft = {name : '사천왕 국화', nameType : cons.NAME_KOR_NO_END_CONS, title : '사천왕 국화', rank : 7, level : 40, 
      stat : {maxHp : 2700, phyAtk : 50, magAtk : 205}};
  _initChar(charLeft);
  
  charLeft.items = {trinket : item.list[493]};
  charLeft.image = 'https://i.imgur.com/OaqAo1i.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90027, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90029, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90031, buffDur : null}];

  charLeft.skill = {
      base : [
              {},
              {},
              {}
             ],
      drive : {code : 90045, name : '회복약', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_TAKE_HIT, cost : 0, chance : 0.8, fireOnce : true, chkHp : 0.3,
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, isPercentStat : true, percentKey : 'maxHp', value : 5}]}
  };
  module.exports.d723 = charLeft;
  
  charLeft = {name : '사천왕 목호', nameType : cons.NAME_KOR_NO_END_CONS, title : '사천왕 목호', rank : 7, level : 40, 
      stat : {maxHp : 3200, phyAtk : 195, magAtk : 50, magReduce : 0.35}};
  _initChar(charLeft);
  
  charLeft.items = {trinket : item.list[493]};
  charLeft.image = 'https://i.imgur.com/fbbG1QX.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90033, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90035, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90037, buffDur : null}];

  charLeft.skill = {
      base : [
              {},
              {},
              {}
             ],
      drive : {code : 90045, name : '회복약', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_TAKE_HIT, cost : 0, chance : 1, fireOnce : true, chkHp : 0.3,
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, isPercentStat : true, percentKey : 'maxHp', value : 5}]}
  };
  module.exports.d724 = charLeft;
  
  charLeft = {name : '레드', nameType : cons.NAME_KOR_NO_END_CONS, title : '정점', rank : 7, level : 40, 
      stat : {maxHp : 4500, phyAtk : 210, magAtk : 210, phyReduce : 0.2, magReduce : 0.2}};
  _initChar(charLeft);
  
  charLeft.items = {trinket : item.list[493]};
  charLeft.image = 'https://i.imgur.com/9JdAG3q.png';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90054, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90055, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90057, buffDur : null},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90059, buffDur : null}];

  charLeft.skill = {
      base : [
              {},
              {},
              {}
             ],
      drive : {code : 90045, name : '회복약', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
               active : cons.ACTIVE_TYPE_TAKE_HIT, cost : 0, chance : 1, fireOnce : true, chkHp : 0.3,
               effect : [{code : cons.EFFECT_TYPE_SELF_HP, isPercentStat : true, percentKey : 'maxHp', value : 5}]}
  };
  module.exports.d725 = charLeft;
  
  charLeft = {name : '파멸의 사도 - 인-질', nameType : cons.NAME_KOR_END_CONS, title : '파멸의 사도', rank : 6, level : 40, 
      stat : {maxHp : 60000, phyAtk : 250, magAtk : 250, spCharge : 25}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[446], armor : item.list[466], subarmor : item.list[197]};
  charLeft.image = 'https://i.imgur.com/qZHi0h6.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;
  charLeft.turnCount = 0;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90067, buffDur : null, setStack : 0.02, isTurnCount : true}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '파멸의 전도', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.75, buffCode : 90065, buffDur : 5}]},
              {code : 90016, name : '감언이설', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                  effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.5, buffCode : 11, buffDur : 2}]},
              {code : 90017, name : '에너지 쇼크', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                  effect : [{code : cons.EFFECT_TYPE_MULTIPLE, chance : 0.5, 
                    target : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 6, buffDur : 1},
                              {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 7, buffDur : 1},
                              {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 9, buffDur : 1}]}]}
             ],
      special : {code : 90040, name : '파멸의 끝을 받아들여라', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 200, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 90066, buffDur : 10}]}
  };
  module.exports.rsInzeal = charLeft;
  
  charLeft = {name : '파멸의 사도 - 나그파', nameType : cons.NAME_KOR_NO_END_CONS, title : '파멸의 사도', rank : 6, level : 40, 
      stat : {maxHp : 60000, phyAtk : 250, magAtk : 250, spCharge : 25}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[446], armor : item.list[466], subarmor : item.list[197]};
  charLeft.image = 'https://i.imgur.com/qZHi0h6.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;
  charLeft.turnCount = 0;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90067, buffDur : null, setStack : 0.02, isTurnCount : true}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '파멸의 전도', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.75, buffCode : 90065, buffDur : 5}]},
              {code : 90016, name : '감언이설', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                  effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.5, buffCode : 11, buffDur : 2}]},
              {code : 90017, name : '에너지 쇼크', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                  effect : [{code : cons.EFFECT_TYPE_MULTIPLE, chance : 0.5, 
                    target : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 6, buffDur : 1},
                              {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 7, buffDur : 1},
                              {code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 9, buffDur : 1}]}]}
             ],
      special : {code : 90040, name : '파멸의 끝을 받아들여라', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 200, 
               effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 90066, buffDur : 10}]}
  };
  module.exports.rsNagpa = charLeft;
  
  charLeft = {name : '첫 번째 별', nameType : cons.NAME_KOR_END_CONS, title : '봉인 활성화', rank : 6, level : 40, 
      stat : {maxHp : 100000, phyAtk : 0, magAtk : 0}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90068, buffDur : null}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []}
             ],
      drive : {code : 90034, name : '압력', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110}]},
      special : {code : 90040, name : '봉인 활성화', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELECTION, active : cons.ACTIVE_TYPE_ATTACK, selectChances : [0.5, 1],
                 options : [{code : cons.EFFECT_TYPE_OPP_HP, value : 0.2, isPercentHpLost : true},
                            {code : cons.EFFECT_TYPE_SELF_HP, value : 10000}]}]}
  };
  module.exports.rsStar1 = charLeft;
  
  charLeft = {name : '두 번째 별', nameType : cons.NAME_KOR_END_CONS, title : '봉인 활성화', rank : 6, level : 40, 
      stat : {maxHp : 100000, phyAtk : 0, magAtk : 0}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90068, buffDur : null}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []}
             ],
      drive : {code : 90034, name : '압력', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110}]},
      special : {code : 90040, name : '봉인 활성화', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELECTION, active : cons.ACTIVE_TYPE_ATTACK, selectChances : [0.5, 1],
                 options : [{code : cons.EFFECT_TYPE_OPP_HP, value : 0.2, isPercentHpLost : true},
                            {code : cons.EFFECT_TYPE_SELF_HP, value : 10000}]}]}
  };
  module.exports.rsStar2 = charLeft;
  
  charLeft = {name : '세 번째 별', nameType : cons.NAME_KOR_END_CONS, title : '봉인 활성화', rank : 6, level : 40, 
      stat : {maxHp : 100000, phyAtk : 0, magAtk : 0}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90068, buffDur : null}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []}
             ],
      drive : {code : 90034, name : '압력', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110}]},
      special : {code : 90040, name : '봉인 활성화', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELECTION, active : cons.ACTIVE_TYPE_ATTACK, selectChances : [0.5, 1],
                 options : [{code : cons.EFFECT_TYPE_OPP_HP, value : 0.2, isPercentHpLost : true},
                            {code : cons.EFFECT_TYPE_SELF_HP, value : 10000}]}]}
  };
  module.exports.rsStar3 = charLeft;
  
  charLeft = {name : '네 번째 별', nameType : cons.NAME_KOR_END_CONS, title : '봉인 활성화', rank : 6, level : 40, 
      stat : {maxHp : 100000, phyAtk : 0, magAtk : 0}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90068, buffDur : null}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []}
             ],
      drive : {code : 90034, name : '압력', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_MAGICAL_FIXED, value : 110}]},
      special : {code : 90040, name : '봉인 활성화', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELECTION, active : cons.ACTIVE_TYPE_ATTACK, selectChances : [0.5, 1],
                 options : [{code : cons.EFFECT_TYPE_OPP_HP, value : 0.2, isPercentHpLost : true},
                            {code : cons.EFFECT_TYPE_SELF_HP, value : 10000}]}]}
  };
  module.exports.rsStar4 = charLeft;
  
  charLeft = {name : '다섯 번째 별', nameType : cons.NAME_KOR_END_CONS, title : '봉인 활성화', rank : 6, level : 40, 
      stat : {maxHp : 100000, phyAtk : 0, magAtk : 0}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = '';
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90068, buffDur : null}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []},
              {code : 90015, name : '봉인의 열쇠', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.1, effect : []}
             ],
      drive : {code : 90034, name : '압력', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110},
                         {code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_PHYSICAL_FIXED, value : 110}]},
      special : {code : 90040, name : '봉인 활성화', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
               effect : [{code : cons.EFFECT_TYPE_SELECTION, active : cons.ACTIVE_TYPE_ATTACK, selectChances : [0.5, 1],
                 options : [{code : cons.EFFECT_TYPE_OPP_HP, value : 0.2, isPercentHpLost : true},
                            {code : cons.EFFECT_TYPE_SELF_HP, value : 10000}]}]}
  };
  module.exports.rsStar5 = charLeft;
  
  charLeft = {name : '파멸자 데시메이트', nameType : cons.NAME_KOR_NO_END_CONS, title : '파멸자', rank : 6, level : 40, 
      stat : {maxHp : 300000, phyAtk : 300, magAtk : 300, spCharge : 25}};
  _initChar(charLeft);
  
  charLeft.items = {};
  charLeft.image = 'https://i.imgur.com/qZHi0h6.png';
  charLeft.boss = 0.95;
  charLeft.bossStatus = 0.2;
  
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 10, buffDur : 1000},
                           {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90069, buffDur : null}];

  charLeft.skill = {
      base : [
              {code : 90015, name : '소울 루인', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, 
                effect : [{code : cons.EFFECT_TYPE_SELF_SP, value : 20},
                          {code : cons.EFFECT_TYPE_OPP_SP, value : -20},
                          {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 4, buffDur : 1}]},
              {code : 90016, name : '다운폴', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                  effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_MAGICAL, value : 1.0},
                            {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 4, buffDur : 1}]},
              {code : 90017, name : '해체의 몸부림', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, 
                  effect : [{code : cons.EFFECT_TYPE_SELF_SP, value : 50},
                            {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 4, buffDur : 1}]}
             ],
      drive : {code : 90034, name : '모든 것의 파멸', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_END, chkNot : [4],
               cost : 0, chance : 1, 
               effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 500}]},
      special : {code : 90040, name : '풀려나는 봉인', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 1, 
               effect : [{code : cons.EFFECT_TYPE_SET_ALL_BUFF_DURATION, value : -1, buffCode : 10, isPercentChar : true, percentKey : 'curSp'}]}
  };
  module.exports.rsDeci = charLeft;
  
  charLeft = {name : '프사이', nameType : cons.NAME_KOR_NO_END_CONS, title : '승급 시험관', rank : 9, level : 40, 
      stat : {maxHp : 672, phyAtk : 33.75, magAtk : 61.25}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[203], armor : item.list[219], subarmor : item.list[228], trinket : item.list[261]};

  charLeft.skill = chara.psi.skill;
  charLeft.skillSelect = 0;
  module.exports.ruPsi9 = charLeft;
  
  charLeft = {name : '에오헬름', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 9, level : 40, 
      stat : {maxHp : 400, phyAtk : 117.5, magAtk : 20}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[206], armor : item.list[222], subarmor : item.list[233], trinket : item.list[262]};

  charLeft.skill = chara.aeohelm.skill;
  charLeft.skillSelect = 1;
  module.exports.ruAeohelm9 = charLeft;
  
  charLeft = {name : '세컨드 로직', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 9, level : 40, 
      stat : {maxHp : 880, phyAtk : 42.5, magAtk : 20}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[209], armor : item.list[218], subarmor : item.list[232], trinket : item.list[264]};

  charLeft.skill = chara.lozic.skill;
  charLeft.skillSelect = 0;
  module.exports.ruLozic9 = charLeft;
  
  charLeft = {name : '프사이', nameType : cons.NAME_KOR_NO_END_CONS, title : '승급 시험관', rank : 8, level : 40, 
      stat : {maxHp : 958, phyAtk : 51.25, magAtk : 92.5}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[272], armor : item.list[283], subarmor : item.list[304], trinket : item.list[327]};

  charLeft.skill = chara.psi.skill;
  charLeft.skillSelect = 0;
  module.exports.ruPsi8 = charLeft;
  
  charLeft = {name : '에오헬름', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 8, level : 40, 
      stat : {maxHp : 550, phyAtk : 175, magAtk : 30}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[275], armor : item.list[289], subarmor : item.list[298], trinket : item.list[325]};

  charLeft.skill = chara.aeohelm.skill;
  charLeft.skillSelect = 1;
  module.exports.ruAeohelm8 = charLeft;
  
  charLeft = {name : '세컨드 로직', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 8, level : 40, 
      stat : {maxHp : 1270, phyAtk : 67.75, magAtk : 30}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[269], armor : item.list[285], subarmor : item.list[299], trinket : item.list[327]};

  charLeft.skill = chara.lozic.skill;
  charLeft.skillSelect = 0;
  module.exports.ruLozic8 = charLeft;
  
  charLeft = {name : '프사이', nameType : cons.NAME_KOR_NO_END_CONS, title : '승급 시험관', rank : 7, level : 40, 
      stat : {maxHp : 1244, phyAtk : 68.75, magAtk : 123.75}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[341], armor : item.list[365], subarmor : item.list[382], trinket : item.list[395]};

  charLeft.skill = chara.psi.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0, 0, 0];
  module.exports.ruPsi7 = charLeft;
  
  charLeft = {name : '에오헬름', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 7, level : 40, 
      stat : {maxHp : 700, phyAtk : 232.5, magAtk : 40}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[348], armor : item.list[362], subarmor : item.list[379], trinket : item.list[397]};

  charLeft.skill = chara.aeohelm.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0.35, 0, 0.35];
  module.exports.ruAeohelm7 = charLeft;
  
  charLeft = {name : '세컨드 로직', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 7, level : 40, 
      stat : {maxHp : 1660, phyAtk : 93, magAtk : 40}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[341], armor : item.list[365], subarmor : item.list[384], trinket : item.list[397]};

  charLeft.skill = chara.lozic.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0, 0, 0];
  module.exports.ruLozic7 = charLeft;
  
  charLeft = {name : '프사이', nameType : cons.NAME_KOR_NO_END_CONS, title : '승급 시험관', rank : 6, level : 40, 
      stat : {maxHp : 1528, phyAtk : 86.25, magAtk : 155}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[451], armor : item.list[464], subarmor : item.list[479], trinket : item.list[505]};

  charLeft.skill = chara.psi.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0, 0, 0];
  module.exports.ruPsi6 = charLeft;
  
  charLeft = {name : '에오헬름', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 6, level : 40, 
      stat : {maxHp : 700, phyAtk : 290, magAtk : 50}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[445], armor : item.list[469], subarmor : item.list[385], trinket : item.list[507]};

  charLeft.skill = chara.aeohelm.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0.35, 0, 0.35];
  module.exports.ruAeohelm6 = charLeft;
  
  charLeft = {name : '세컨드 로직', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 8, level : 40, 
      stat : {maxHp : 2050, phyAtk : 118.25, magAtk : 50}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[454], armor : item.list[468], subarmor : item.list[488], trinket : item.list[509]};

  charLeft.skill = chara.lozic.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0, 0, 0];
  module.exports.ruLozic6 = charLeft;
  
  charLeft = {name : '데 카이츠', nameType : cons.NAME_KOR_END_CONS, title : '승급 시험관', rank : 8, level : 40, 
      stat : {maxHp : 1528, phyAtk : 121, magAtk : 121}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[452], armor : item.list[467], subarmor : item.list[486], trinket : item.list[508]};

  charLeft.skill = chara.dekaitz.skill;
  charLeft.skillSelect = 2;
  charLeft.rating = [0, 0, 0];
  module.exports.ruDekaitz6 = charLeft;
  
  module.exports.selectFunc = 
    [function() {
    return Math.floor(Math.random() * 3);
  }, function() {
    var rand = Math.random();
    return rand < 0.4 ? 0 : (rand < 0.8 ? 2 : 1);
  }, function(chara, key) {
    chara.rating = chara.rating.map(x => x * 0.95);
    chara.rating[(key + 1) % 3] += 0.1;
    chara.rating[(key + 2) % 3] -= 0.1;
    
    var expRate = chara.rating.map(x => Math.exp(x));
    var rand = Math.random() * (expRate[0] + expRate[1] + expRate[2]);
    if (rand < expRate[0]) {
      return 0;
    } else if (rand < expRate[0] + expRate[1]) {
      return 1;
    } else {
      return 2;
    }
  }];
  
  function _initChar(char) {
    char.stat.spCharge = char.stat.spCharge ? char.stat.spCharge : 5;
    char.stat.hpRegen = 0;
    char.stat.spRegen = 5;
    char.stat.crit = 0.05;
    char.stat.critDmg = 1.5;
    char.stat.phyReduce = char.stat.phyReduce ? char.stat.phyReduce : 0;
    char.stat.magReduce = char.stat.magReduce ? char.stat.magReduce : 0;
    char.stat.hit = char.stat.hit ? char.stat.hit : 1;
    char.stat.evasion = 0;
    char.stat.phyAtkMin = 0;
    char.stat.phyAtkMax = 0;
    char.stat.magAtkMin = 0;
    char.stat.magAtkMax = 0;
    char.stat.dmgReduce = char.stat.dmgReduce ? char.stat.dmgReduce : 0;
    char.stat.pierce = 0;
    char.stat.chanceEnh = 0;
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
