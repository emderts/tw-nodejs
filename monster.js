const cons = require('./constant');
const item = require('./items');
const chara = require('./chara');
  
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
  
  charLeft = {name : '결실을 사르는 업화', nameType : cons.NAME_KOR_END_CONS, title : '불타는 과수원', rank : 7, level : 50, 
      stat : {maxHp : 400, phyAtk : 44, magAtk : 44}};
  _initChar(charLeft);
  
  charLeft.items = {};

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
  charLeft.boss = 0.9;
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
  charLeft.boss = 0.9;
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
  charLeft.boss = 0.9;
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
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

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
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

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
  charLeft.boss = 0.8;
  charLeft.bossStatus = 0.1;

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
  charLeft.boss = 0.85;
  charLeft.bossStatus = 0.15;

  charLeft.skill = chara.aeika.skill;
  module.exports.rAeika = charLeft;
  
  charLeft = {name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, title : '매버릭 타임 코더', rank : 7, level : 40, 
      stat : {maxHp : 6000, phyAtk : 70.3, magAtk : 70.3}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[203], armor : item.list[219], subarmor : item.list[228], trinket : item.list[261]};
  charLeft.boss = 0.85;
  charLeft.bossStatus = 0.15;
  charLeft.startEffects = [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 12, buffDur : 999999}];

  charLeft.skill = {
      base : [
              {code : 90001, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90002, name : '물리 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.0, effect : []}, 
              {code : 90003, name : '마법 공격', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.0, effect : []}
             ],
      drive : {code : 90039, name : '시간의 폭풍', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, active : cons.ACTIVE_TYPE_TURN_START,
               cost : 0, chance : 1,
               effect : [{code : cons.EFFECT_TYPE_SELF_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 999999, chkTurn : 50},
                         {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 999999, chkMoreAttack : true, chkTurn : 50}]}
  };
  module.exports.rTimeStorm = charLeft;
  
  charLeft = {name : '줄리어스 엠더츠', nameType : cons.NAME_KOR_NO_END_CONS, title : '매버릭 타임 코더', rank : 7, level : 40, 
      stat : {maxHp : 70200, phyAtk : 70.3, magAtk : 70.3}};
  _initChar(charLeft);
  
  charLeft.items = {weapon : item.list[356], armor : item.list[372], subarmor : item.list[391], trinket : item.list[411]};
  charLeft.boss = 0.85;
  charLeft.bossStatus = 0.15;

  charLeft.skill = chara.julius.skill;
  module.exports.rJulius = charLeft;
  
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
  
  module.exports.selectFunc = 
    [function() {
    return Math.floor(Math.random() * 3);
  }, function() {
    var rand = Math.random();
    return rand < 0.4 ? 0 : (rand < 0.8 ? 2 : 1);
  }];
  
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
