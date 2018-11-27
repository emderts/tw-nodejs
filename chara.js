const cons = require('./constant');
const item = require('./items');
  var charLeft = {};
  _initChar(charLeft);

  charLeft.name = '카이네스 엠더츠';
  charLeft.nameType = cons.NAME_KOR_NO_END_CONS;
  charLeft.title = '고대 흑마법사';
  charLeft.rank = 7;
  charLeft.level = 20;
  charLeft.statPoint = 40;
  charLeft.premiumPoint = 100;
  
  charLeft.items = {};
  charLeft.items.weapon = item.list[338];
  charLeft.items.armor = item.list[296];
  charLeft.items.subarmor = item.list[241];
  charLeft.items.trinket = item.list[335];
  charLeft.inventory.push(item.list[388]);

  charLeft.skill = {};
  charLeft.skill.base = [];

  var skillObj = {code : 20101, name : '혼돈의 화살', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.2,
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 20101, buffDur : 2, value : 0.6}],
      tooltip : '100\% 확률로 자신에게 2턴간 [혼돈의 힘] 버프 부여<br><br>[혼돈의 힘] : 혼돈의 화살 공격력 +0.6'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20102, name : '파괴의 저주', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.7, 
      effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.5, buffCode : 20102, buffDur : 3, value : 0.1}],
      tooltip : '50\% 확률로 적에게 3턴간 [파괴됨] 버프 부여<br><br>[파괴됨] : 마법 0.1 피해'};
  charLeft.skill.base.push(skillObj);

  skillObj = {code : 20103, name : '망각의 계약', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.1, 
      effect : [{code : cons.EFFECT_TYPE_SELF_SP, chance : 0.3, value : 15}],
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


  var charRight = {};
  _initChar(charRight);
  
  charRight.name = '아서스 메네실';
  charRight.nameType = cons.NAME_KOR_END_CONS;
  charRight.title = '리치 왕';
  charRight.rank = 7;
  charRight.level = 20;
  charRight.stat.maxHp = 1492;
  charRight.base.maxHp = 1492;
  charRight.stat.phyAtk = 62;
  charRight.stat.magAtk = 62;
  charRight.base.phyAtk = 62;
  charRight.base.magAtk = 62;
  
  charRight.skill = {};
  charRight.skill.base = [];
  charRight.items = {};
  itemObj = {};
  itemObj.name = '서리한';
  itemObj.nameType = cons.NAME_KOR_END_CONS;
  itemObj.type = cons.ITEM_TYPE_WEAPON;
  itemObj.rank = 7;
  itemObj.rarity = cons.ITEM_RARITY_EPIC;
  itemObj.stat = {};
  itemObj.stat.phyAtk = 32;
  itemObj.stat.magAtk = 30;
  itemObj.stat.spRegen = 10;
  itemObj.effect = [];
  charRight.items.weapon = itemObj;
  charRight.items.armor = item.list[375];
  itemObj = {};
  itemObj.name = '서리 끼인 영혼의 망토';
  itemObj.nameType = cons.NAME_KOR_NO_END_CONS;
  itemObj.type = cons.ITEM_TYPE_SUBARMOR;
  itemObj.rank = 7;
  itemObj.rarity = cons.ITEM_RARITY_EPIC;
  itemObj.stat = {};
  itemObj.stat.crit = 0.5;
  itemObj.effect = [];
  charRight.items.subarmor = itemObj;
  charRight.items.trinket = item.list[410];

  var skillObj = {};
  skillObj.code = 20091;
  skillObj.name = '죽음의 고리';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.3;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_HP;
  effectObj.chance = 1;
  effectObj.value = 15;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신의 HP 15 회복';
  charRight.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20092;
  skillObj.name = '울부짖는 한파';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 0.5;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 4;
  effectObj.buffDur = 1;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 상대에게 [기절] 상태이상 부여';
  charRight.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20093;
  skillObj.name = '서리 폭풍우';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.2;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20091;
  effectObj.buffDur = 3;
  effectObj.value = 4;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 3턴간 [서리 폭풍우] 버프 부여<br><br>[서리 폭풍우] : HP 재생 +4';
  charRight.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20094;
  skillObj.name = '서리한이 굶주렸다';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_ATTACK;
  skillObj.cost = 5;
  skillObj.chance = 0.25;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.chance = 1;
  effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  effectObj.value = 0.4;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20093;
  effectObj.buffDur = null;
  effectObj.value = 1;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '공격 성공 시 25\% 확률로 물리 0.4 피해를 주고 자신에게 [서리한 포식] 버프 부여<br><br>[서리한 포식] : SP 재생 +1';
  charRight.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 20095;
  skillObj.name = '사자의 군대';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 120;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20092;
  effectObj.buffDur = 8;
  effectObj.value = 0.02;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 8턴간 8스택의 [사자의 군대] 버프 부여<br><br>[사자의 군대] : 적에게 물리 0.02 피해';
  charRight.skill.special = skillObj;


  var charSeriers = {};
  _initChar(charSeriers);
  
  charSeriers.name = '세리어스 플로에르시아';
  charSeriers.nameType = cons.NAME_KOR_NO_END_CONS;
  charSeriers.title = '플로에르시아 가주 임시 대행';
  
  charSeriers.skill = {};
  charSeriers.skill.base = [];

  var skillObj = {};
  skillObj.code = 20171;
  skillObj.name = '이검 영원';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.3;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20171;
  effectObj.buffDur = 1;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.onCrit = true;
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20172;
  effectObj.buffDur = 1;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 적에게 1턴간 [이검 취약] 버프 부여<br><br>[이검 취약] : 물리/마법저항 -15\%p, 치명타 시 추가로 -10\%p';
  skillObj.flavor = '영계의 이력을 날카로운 물리적 형태로 재단한 후 베는 기술. 실제로 검을 사용하는 것은 아니다. 공격에 당한 적은 세리어스의 이어지는 공격에 취약해진다.';
  charSeriers.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20172;
  skillObj.name = '흐름 관찰';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 1;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SHIELD_FROM_DAMAGE;
  effectObj.chance = 1;
  effectObj.buffCode = 20173;
  effectObj.buffDur = null;
  effectObj.value = 0.8;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 [흐름 관찰] 버프 부여<br><br>[흐름 관찰] : 준 피해의 80\%만큼의 보호막';
  skillObj.flavor = '현실계의 흐름을 보는 영매의 능력을 제3세계의 마법으로 구현했다. 현상의 흐름을 시각화하고 순환하여 적에게 정신적인 타격을 주고 스스로의 위상을 보호한다.';
  charSeriers.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20173;
  skillObj.name = '환수 강령';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 0.7;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20174;
  effectObj.buffDur = 4;
  effectObj.value = 0.2;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 4턴간 [대환수 영랑] 버프 부여<br><br>[대환수 영랑] : 흐름 관찰의 보호막 생성 +20\%p, 공격 성공 시 지속 시간을 1턴 감소시키고 순수 물리 공격력만큼 추가 절대 피해';
  skillObj.flavor = '종계의 마수들을 제3세계로 끌어들이는 강령 마법. 이 마법으로 환수의 힘을 소환하는 동안, 세리어스의 전투 능력이 더욱 상승한다.';
  charSeriers.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20174;
  skillObj.name = '진실을 가로막는 허상';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TAKE_HIT;
  skillObj.cost = 10;
  skillObj.chance = 0.05;
  skillObj.cooldown = 4;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_CANCEL_DAMAGE;
  effectObj.chance = 1;
  effectObj.value = 1;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20175;
  effectObj.buffDur = 1;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '피격 시 5\% 확률로 받은 피해와 해로운 버프 무시';
  skillObj.flavor = '자신의 모습을 본딴 형체를 만들고, 피해 위치에서 이탈한다.';
  charSeriers.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 20175;
  skillObj.name = '광차원 스파크스터';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 165;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20176;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 4;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 7;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 8;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '적에게 3턴간 [기절], [침묵], [실명] 상태이상 부여, 자신에게 3턴간 [스파크스터] 버프 부여<br><br>[스파크스터] : HP 재생, SP 재생, SP 충전 0으로 고정, 물리/마법 저항 +50\%, 해로운 버프 무시, 종료 시 자신에게 1턴간 [기절] 상태이상 부여';
  skillObj.flavor = '세계로부터 유리된 절대 공간을 만든다. 현상을 이해할 수 없는 상대는 수많은 세계가 얽힌 이 공간을 빛에 둘러싸인 것처럼 여긴다. 이 공간에서 세리어스는 절대적인 힘을 발휘하지만 부작용이 있다.';
  charSeriers.skill.special = skillObj;


  var charPsi = {};
  _initChar(charPsi);
  
  charPsi.name = '프사이';
  charPsi.nameType = cons.NAME_KOR_NO_END_CONS;
  charPsi.title = '혼돈의 군체';
  
  charPsi.skill = {};
  charPsi.skill.base = [];

  var skillObj = {};
  skillObj.code = 20176;
  skillObj.name = '정신 교란';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 1.1;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  effectObj.chkNot = [20177];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 0.35;
  effectObj.buffCode = 20178;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 [불확실성] 버프가 없다면 [불확실성] 버프 부여, 35\% 확률로 적에게 3턴간 [프사이-정신교란] 버프 부여<br><br>[프사이-정신교란] : 명중 -12\%p';
  skillObj.flavor = '혼돈 그 자체인 프사이가 상대방의 정신을 교란시킵니다. 공격에 당한 적은 의식이 흐려져 전투에 집중할 수 없게 됩니다.';
  charPsi.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20177;
  skillObj.name = '의식의 지평선';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 0.7;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 0.35;
  effectObj.multiple = true;
  effectObj.buffCode = [20179, 201710, 201711];
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '35\% 확률로 적에게 3턴간 [프사이-정신분멸], [프사이-피해의식], [프사이-의식불명] 중 하나의 버프 부여<br><br>[프사이-정신분열] : [혼란] 상태이상<br>[프사이-피해의식] : [봉인] 상태이상<br>[프사이-의식불명] : [수면] 상태이상';
  skillObj.flavor = '프사이의 군체 의식이 상대방의 의식에 직접 간섭합니다. 상대방에게 치명적인 정신적 피해를 입힙니다.';
  charPsi.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20178;
  skillObj.name = '붕괴';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.2;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_CONVERT_BUFF;
  effectObj.chance = 0.35;
  effectObj.buffTarget = [20178, 20179, 201710, 201711];
  effectObj.buffCode = 201712;
  effectObj.buffDur = 3;
  effectObj.value = 0.25;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '35\% 확률로 적의 [프사이-*] 버프 하나를 3턴간 [프사이-의식붕괴] 버프로 변환 부여<br>[프사이-의식붕괴] : 물리 0.25 피해';
  skillObj.flavor = '혼돈으로 꿈틀대는 프사이의 손길로, 상대방을 내부로부터 파괴합니다.';
  charPsi.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 20179;
  skillObj.name = '불확실성';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TURN_END;
  skillObj.cost = 2;
  skillObj.chance = 1;
  skillObj.cooldown = 0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '턴 종료 시 100\% 확률로 자신에게 [불확실성] 버프 부여<br><br>[불확실성] : 스택 당 자신의 모든 일반 스킬의 상태이상 발동확률 +3.5\%, 회피 +2\%p, 회피 시 소거되고 SP 3 회복 (중첩 가능)';
  skillObj.flavor = '프사이의 위치는 항상 불분명합니다. 시간이 지날수록 프사이를 공격하기 어려워집니다.';
  charPsi.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 201710;
  skillObj.name = '대통합';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 130;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201713;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF_REFRESH;
  effectObj.chance = 1;
  effectObj.buffTarget = [20178, 20179, 201710, 201711, 201712];
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  effectObj.chkOpp = [20178];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  effectObj.chkOpp = [20179];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  effectObj.chkOpp =[201710];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  effectObj.chkOpp = [201711];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 20177;
  effectObj.buffDur = null;
  effectObj.chkOpp = [201712];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '적에게 걸린 [프사이-*] 버프의 지속시간을 3턴으로 갱신하고 자신에게 [혼돈의 완성] 버프 부여 및 [프사이-*] 버프의 수만큼 [불확실성] 버프 부여<br><br>[혼돈의 완성] : HP 재생 +(잃은 생명력의 5\%), 공격력 +(캐릭터 순수 공격력의 {50+(현재 회피수치)}\%)';
  skillObj.flavor = '프사이는 혼돈을 끊임없이 재생산해냅니다. 상대방이 느끼는 혼돈과 공포의 의식을 흡수하여 더 끔찍한 존재로 거듭납니다.';
  charPsi.skill.special = skillObj;


  var charJulius = {};
  _initChar(charJulius);
  
  charJulius.name = '줄리어스 엠더츠';
  charJulius.nameType = cons.NAME_KOR_NO_END_CONS;
  charJulius.title = '타임 코더';
  
  charJulius.skill = {};
  charJulius.skill.base = [];

  var skillObj = {};
  skillObj.code = 201711;
  skillObj.name = '중단점 설정';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 0.7;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_RETURN;
  effectObj.chance = 1;
  effectObj.buffCode = 201714;
  effectObj.chk = [201714];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201714;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 [중단점] 버프 부여<br><br>[중단점] : 재적용 시 처음 적용된 턴으로 돌아감';
  skillObj.flavor = '시간 내에 한 지점을 고정시켜 둔다.';
  charJulius.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201712;
  skillObj.name = '다중 선택 트리';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 0.9;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SKILL_RESELECT;
  effectObj.chance = 0.2;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '상성 패배 시 20\% 확률로 스킬 재선택';
  skillObj.flavor = '다중우주로 흐르는 시간들 중 선택해 시간을 진행시킨다.';
  charJulius.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201713;
  skillObj.name = '시간 조작';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.4;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.chance = 0.15;
  effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
  effectObj.value = 0.5;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '15\% 확률로 마법 0.5 추가 피해';
  skillObj.flavor = '시간을 조작해 상대를 혼란에 빠뜨린다.';
  charJulius.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201714;
  skillObj.name = '디버그 모드';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TAKE_HIT;
  skillObj.cost = 30;
  skillObj.chance = 0.1;
  skillObj.cooldown = 0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_SP;
  effectObj.chance = 1;
  effectObj.value = 30;
  effectObj.chkNot = [201714];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_RETURN;
  effectObj.chance = 1;
  effectObj.debug = true;
  effectObj.chk = [201714];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '피격 시 10\% 확률로 [중단점]으로 자신만 돌아감';
  skillObj.flavor = '자신의 시간을 과거부터 되짚어온다.';
  charJulius.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 201715;
  skillObj.name = '시간 왜곡';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 75;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201715;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 [시간 왜곡] 버프를 이 스킬을 시전한 수만큼 부여<br><br>[시간 왜곡] : 상성 패배 시 소거되고 스킬 재선택, 중단점 적용 사용 시 자신만 돌아감';
  skillObj.flavor = '주변의 시간을 왜곡한다. 왜곡의 강도는 점점 쌓여져 강해진다.';
  charJulius.skill.special = skillObj;


  var charAeika = {};
  _initChar(charAeika);
  
  charAeika.name = '에이카';
  charAeika.nameType = cons.NAME_KOR_NO_END_CONS;
  charAeika.title = '움직이는 요새';
  
  charAeika.skill = {};
  charAeika.skill.base = [];

  var skillObj = {};
  skillObj.code = 201716;
  skillObj.name = '모듈 - 복합 장갑';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 0.5;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201717;
  effectObj.buffDur = 3;
  effectObj.chk = [201716];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF_REFRESH;
  effectObj.chance = 1;
  effectObj.buffTarget = [201716];
  effectObj.stack = -1;
  effectObj.chk = [201716];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신의 [에너지 코어] 버프 1중첩을 제거하고 자신에게 3턴간 [복합 장갑] 버프 부여<br><br>[복합 장갑] : 물리/마법 저항 +15\%p, SP 재생 +1';
  skillObj.flavor = '갑자기 에이카의 외부에 육중한 방벽이 솟아오르더니 빠르게 둘러쳐집니다.';
  charAeika.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201717;
  skillObj.name = '모듈 - 방벽 시스템 작동';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 0.5;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201718;
  effectObj.buffDur = 2;
  effectObj.chk = [201716];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF_REFRESH;
  effectObj.chance = 1;
  effectObj.buffTarget = [201716];
  effectObj.stack = -1;
  effectObj.chk = [201716];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신의 [에너지 코어] 버프 1중첩을 제거하고 자신에게 2턴간 [방벽 시스템] 버프 부여<br><br>[방벽 시스템] : 턴 종료 시 자신에게 [요새 방벽] 버프 부여<br>[요새 방벽] : 최대 생명력의 10\%만큼의 보호막';
  skillObj.flavor = '에이카의 중심부 제어실에 있는 보호막 발생기에서 다층 마법 결계가 발생하여 외부를 덮습니다.';
  charAeika.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201718;
  skillObj.name = '모듈 - 출력 엔진';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 2.0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201720;
  effectObj.buffDur = null;
  effectObj.chk = [201716];
  effectObj.critNot = true;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELECTION;
  effectObj.chance = 1;
  effectObj.selectChances = [0.2, 1];
  effectObj.options = [];
  var optObj = {};
  optObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  optObj.buffCode = 4;
  optObj.buffDur = 1;
  optObj.chance = 1;
  effectObj.options.push(optObj);
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_SELF_SP;
  optObj.value = 10;
  optObj.chance = 1;
  effectObj.options.push(optObj);
  effectObj.chk = [201716];
  effectObj.onCrit = true;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF_REFRESH;
  effectObj.chance = 1;
  effectObj.buffTarget = [201716];
  effectObj.stack = -1;
  effectObj.chk = [201716];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF_REFRESH;
  effectObj.chance = 1;
  effectObj.buffTargetCode = 10010;
  effectObj.stack = -1;
  effectObj.chkNot = [201716];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신의 [에너지 코어] 버프 1중첩을 제거하고 치명타 시 20\% 확률로 적에게 1턴간 [기절] 상태이상 부여 혹은 80\% 확률로 SP 10 회복 혹은 치명타가 아닐 시 자신에게 [출력 모드] 버프 부여<br><br>[출력 모드] : 치명 +15\%p, 치명타 시 버프 소거';
  skillObj.flavor = '에이카가 1000개의 유압 실린더에서 전달되는 강력한 출력을 뿜어내며 돌진합니다.';
  charAeika.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201719;
  skillObj.name = '비상 프로토콜 - 재구축';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TURN_END;
  skillObj.cost = 0;
  skillObj.chance = 1;
  skillObj.cooldown = 0;
  skillObj.chkNot = [201716];
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201724;
  effectObj.buffDur = 1;
  effectObj.chkTurn = 2;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201716;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  effectObj = {code : cons.EFFECT_TYPE_MULTIPLE, chkHp : 0.2, chkNot : [201722],
      target : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201721, buffDur : 3},
                {code : cons.EFFECT_TYPE_SELF_BUFF_REFRESH, buffTarget : [201725], stack : -5},
                {code : cons.EFFECT_TYPE_SELF_HP, isPercentMax : true, value : 0.3},
                {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201722, buffDur : 20}]};
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '턴 종료 시 자신에게 [에너지 코어] 버프가 없다면 100\% 확률로 자신에게 1턴간 [방전] 버프 부여 및 [에너지 코어] 버프 3중첩 부여, 추가로 현재 생명력이 20\% 이하일 시 최대 생명력의 30\%만큼 생명력을 즉시 회복하고 자신에게 3턴 간 [재구축 중..] 버프 부여<br><br>[방전] : [기절] 상태이상, 종료 시 자신에게 [전하 충전] 버프 부여 (최대 5중첩)<br>[재구축 중..] : 물리/마법 저항 -50\%p, SP 재생 0으로 고정<br>[전하 충전] : 물리/마법저항 +2\%p';
  skillObj.flavor = '에이카가 붕괴 위험을 감지하고 재구축 프로토콜에 들어갑니다.';
  charAeika.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 201720;
  skillObj.name = '제압 프로토콜 - 에너지 방출';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 150;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELECTION;
  effectObj.chance = 1;
  effectObj.selectChances = [0.5, 1];
  effectObj.options = [];
  var optObj = {};
  optObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  optObj.buffCode = 4;
  optObj.buffDur = 3;
  optObj.chance = 1;
  effectObj.options.push(optObj);
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  optObj.buffCode = 201723;
  optObj.buffDur = 3;
  optObj.chance = 1;
  effectObj.options.push(optObj);
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '50\% 확률로 적에게 3턴간 [기절] 상태이상 부여 혹은 50\% 확률로 적에게 3턴간 [방출 감전] 버프 부여<br><br>[방출 감전] : 물리 저항 -25\%p';
  skillObj.flavor = '에이카가 모든 에너지 발전실을 100% 가동합니다. 주변에 강한 스파크가 방출됩니다.';
  charAeika.skill.special = skillObj;


  var charAeohelm = {};
  _initChar(charAeohelm);
  
  charAeohelm.name = '에오헬름';
  charAeohelm.nameType = cons.NAME_KOR_END_CONS;
  charAeohelm.title = '밤의 추격자';
  
  charAeohelm.skill = {};
  charAeohelm.skill.base = [];

  var skillObj = {};
  skillObj.code = 201721;
  skillObj.name = '사악한 암습';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.0;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 0.25;
  effectObj.chanceAddKey = 'crit';
  effectObj.buffCode = 3;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '(25 + 치명)\% 확률로 적에게 3턴간 [출혈] 상태이상 부여, 이미 [출혈] 상태이상이 있다면 (자신의 [환영] 버프 수 * 0.15)만큼 공격 계수 상승';
  skillObj.flavor = '단검을 휘둘러 적의 살점을 도려냅니다.';
  charAeohelm.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201722;
  skillObj.name = '조여오는 어둠';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 1.0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_SP;
  effectObj.chance = 1;
  effectObj.buffTarget =[201726];
  effectObj.value = 3;
  effectObj.chk = [201726];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201727;
  effectObj.buffDur = 2;
  effectObj.buffTarget =[201726];
  effectObj.chk = [201726];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 SP를 (자신의 [환영] 버프 수 * 3)만큼 회복하고 적에게 2턴간 [조여오는 어둠] 버프 부여<br><br>[조여오는 어둠] : 명중 (-5 * 적용 시 자신의 [환영] 버프 수)\%p';
  skillObj.flavor = '상대에게 공포감을 일으킵니다.';
  charAeohelm.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201723;
  skillObj.name = '그림자 습격';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_RESOLVE_DRIVE;
  effectObj.chance = 1;
  effectObj.chkNot = [201726];
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.chance = 1;
  effectObj.buffTarget = [201726];
  effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
  effectObj.value = 0.2;
  effectObj.chk = [201726];
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 [환영] 버프가 없다면 드라이브 스킬을 발동시킨 후 마법 (자신의 [환영] 버프 수 * 0.2) 추가 피해';
  skillObj.flavor = '적의 등 뒤에서 기습을 가합니다.';
  charAeohelm.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201724;
  skillObj.name = '환영';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TURN_START;
  skillObj.cost = 5;
  skillObj.chance = 0.25;
  skillObj.cooldown = 0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201726;
  effectObj.buffDur = 5;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '턴 시작 시 25\% 확률로 자신에게 5턴간 [환영] 버프 부여<br><br>[환영] : 치명 +2\%p, 회피 +6\%p, 회피 시 버프 하나 소거';
  skillObj.flavor = '자신의 행동을 따라하는 환영을 생성합니다.';
  charAeohelm.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 201725;
  skillObj.name = '환영 습격';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 125;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201726;
  effectObj.buffDur = 5;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201726;
  effectObj.buffDur = 5;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201728;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.chance = 1;
  effectObj.buffTarget = [201726];
  effectObj.separate = true;
  effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  effectObj.value = 0.6;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 5턴간 [환영] 버프를 2개 부여, 자신에게 3턴간 [암흑] 버프 부여, 자신의 [환영] 버프 수만큼 물리 0.6 추가 피해<br><br>[암흑] : 치명 +10\%p, 치명타 시 SP 3 흡수';
  skillObj.flavor = '수많은 환영들과 협공을 합니다.';
  charAeohelm.skill.special = skillObj;


  var charBks = {};
  _initChar(charBks);
  
  charBks.name = '나백수';
  charBks.nameType = cons.NAME_KOR_NO_END_CONS;
  charBks.title = '천상 날백수';
  
  charBks.skill = {};
  charBks.skill.base = [];

  var skillObj = {};
  skillObj.code = 201726;
  skillObj.name = '발로 물건 집기';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 0.9;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 0.25;
  effectObj.buffCode = 2;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.buffCode = 201737;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 [백수의 마음가짐] 1중첩 부여, 30\% 확률로 적에게 3턴 간 [중독] 상태이상 부여';
  skillObj.flavor = '꼬집힘을 당하였습니다. 상처나서 씻지 않은 발에 붙은 세균에 감염되었습니다.';
  charBks.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201727;
  skillObj.name = '키보드 샷건';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 1.2;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201729;
  effectObj.buffDur = null;
  effectObj.value = 1.3;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.buffCode = 201737;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 [백수의 마음가짐] 1중첩 부여, 100\% 확률로 자신에게 [키보드 샷건] 버프 부여<br><br>[키보드 샷건] : 스킬 공격 계수 +30\%, 공격 시 소거';
  skillObj.flavor = '게임을 하던 중 모종의 이유로 화가 났습니다. 샷건을 칩니다. 분노에 휩싸였습니다!';
  charBks.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201728;
  skillObj.name = '용돈 받기';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 0.9;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201730;
  effectObj.buffDur = 2;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.buffCode = 201737;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 [백수의 마음가짐] 1중첩 부여, 100\% 확률로 자신에게 2턴 간 [해탈] 버프 부여<br><br>[해탈] : SP 재생 +5, 물리저항 -15\%p, 마법저항 +15\%p, 해로운 버프 무시';
  skillObj.flavor = '지갑이 채워졌습니다. 인생이 행복합니다! 멘탈이 강화되었습니다!';
  charBks.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201729;
  skillObj.name = '백수의 마음가짐';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TAKE_HIT;
  skillObj.cost = 0;
  skillObj.chance = 0.06;
  skillObj.cooldown = 0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.chkDmgType = cons.DAMAGE_TYPE_PHYSICAL;
  effectObj.code = cons.EFFECT_TYPE_SELECTION;
  effectObj.chance = 1;
  effectObj.selectChances = [0.5, 1];
  effectObj.options = [];
  var optObj = {};
  optObj.code = cons.EFFECT_TYPE_CANCEL_DAMAGE;
  optObj.chance = 1;
  optObj.value = 0.3;
  effectObj.options.push(optObj);
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  optObj.buffCode = 201731;
  optObj.buffDur = null;
  optObj.chance = 1;
  optObj.value = 0.03;
  effectObj.options.push(optObj);
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.chkDmgType = cons.DAMAGE_TYPE_MAGICAL;
  effectObj.code = cons.EFFECT_TYPE_SELECTION;
  effectObj.chance = 1;
  effectObj.selectChances = [0.5, 1];
  effectObj.options = [];
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  optObj.buffCode = 201732;
  optObj.buffDur = null;
  optObj.chance = 1;
  optObj.value = 0.15;
  effectObj.options.push(optObj);
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  optObj.buffCode = 201733;
  optObj.buffDur = null;
  optObj.chance = 1;
  optObj.value = -0.03;
  effectObj.options.push(optObj);
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '물리 피격 시 3\% 확률로 받은 피해의 30%만큼을 즉시 회복하거나 3\% 확률로 자신에게 [거북이] 버프 부여 (최대 5중첩)<br>마법 피격 시 3\% 확률로 자신에게 [꼬장부리기] 버프 부여 혹은 3\% 확률로 자신에게 [팩트폭격] 버프 부여 (최대 5중첩)<br><br>[거북이] : 물리방어 +3\%p<br>[꼬장부리기] : 다음 스킬 피해에 15\% 절대 피해 추가<br>[팩트폭격] : 물리/마법방어 -3\%p<br>[백수의 마음가짐] : 드라이브 발동 확률 +9%, HP재생 +1, 드라이브 발동 시 1중첩 소거';
  skillObj.flavor = '';
  charBks.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 201730;
  skillObj.name = '꼬질꼬질한 파란츄리닝';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 90;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELECTION;
  effectObj.chance = 1;
  effectObj.selectChances = [0.5, 1];
  effectObj.options = [];
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  optObj.buffCode = 201734;
  optObj.buffDur = null;
  optObj.chance = 1;
  effectObj.options.push(optObj);
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  optObj.buffCode = 201735;
  optObj.buffDur = null;
  optObj.chance = 1;
  effectObj.options.push(optObj);
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201736;
  effectObj.buffDur = 1;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.buffCode = 201737;
  effectObj.buffDur = null;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  effectObj.value = 0.2;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.type = cons.DAMAGE_TYPE_MAGICAL;
  effectObj.value = 0.2;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '자신에게 [백수의 마음가짐] 1중첩 부여, 50\% 확률로 적에게 [한심한 시선] 버프 부여 혹은 50\% 확률로 적에게 [화병] 버프 부여, 자신에게 1턴간 [한심함] 버프 부여, 물리 0.2 + 마법 0.2 추가 피해<br><br>[한심한 시선] : 치명피해 -10\%p, SP 재생 -1, SP 충전 -1<br>[화병] : HP 재생 -3, SP 재생 -1, SP 충전 -1<br>[한심함] : 회피 +100\%p';
  skillObj.flavor = '어머니의 한심하다는 마음이 전해졌습니다. 아무것도 하지 않는 날백수에 대한 화병이 도집니다.';
  charBks.skill.special = skillObj;


  var charNux = {};
  _initChar(charNux);
  
  charNux.name = '이 눅스';
  charNux.nameType = cons.NAME_KOR_NO_END_CONS;
  charNux.title = '\"평범한\" 공돌이';
  
  charNux.skill = {};
  charNux.skill.base = [];

  var skillObj = {};
  skillObj.code = 201731;
  skillObj.name = '명령어 입력-Lookup';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 1.3;
  skillObj.effect = [];
  var effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_ADD_HIT;
  effectObj.chance = 1;
  effectObj.type = cons.DAMAGE_TYPE_ABSOLUTE;
  effectObj.value = 1;
  effectObj.isPercentOppStat = true;
  effectObj.percentKey = 'dmgReduce';
  effectObj.onCrit = true;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201738;
  effectObj.buffDur = 2;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 2턴 간 [정밀 조사] 버프 부여, 치명 타격 시 상대의 피해감소값만큼 추가 절대 피해<br><br>[정밀 조사] : 관통 +30%';
  skillObj.flavor = '귀차니즘인 눅스에게 오류 같은걸 발견하면 만들어 놓은 Lookup이란 만능명령어로 모든 오류를 발견하고 바로 처리한다. 물론 눅스가 평범하기 때문에(절대로 그렇지 않지만) 쓸 일이 많이 없다.';
  charNux.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201732;
  skillObj.name = '고속 대응 명령어';
  skillObj.nameType = cons.NAME_KOR_NO_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_MAGICAL;
  skillObj.damage = 1.2;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201739;
  effectObj.buffDur = null;
  effectObj.value = 0.2;
  effectObj.critNot = true;
  skillObj.effect.push(effectObj);
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201739;
  effectObj.buffDur = null;
  effectObj.value = 0.3;
  effectObj.onCrit = true;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '100\% 확률로 자신에게 [고속 대응 명령어] 버프 부여<br><br>[고속 대응 명령어] : 저항 +20%/회피 +15% (치명타 시 +30%/+20%), 피격 시 소거';
  skillObj.flavor = '왜인지 모르겠지만 눅스에게는 하루에 3번은 해킹 시도가 나타납니다. 따로 프로그램으로 대응하지도 않고 키보드로 엄청난 연타로 해킹 시도를 저지합니다.';
  charNux.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201733;
  skillObj.name = '오감 해킹';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.DAMAGE_TYPE_PHYSICAL;
  skillObj.damage = 0.5;
  skillObj.effect = [{code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 6, buffDur : 2, critNot : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 7, buffDur : 2, critNot : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 8, buffDur : 2, critNot : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 9, buffDur : 2, critNot : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 10, buffDur : 2, critNot : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 11, buffDur : 2, critNot : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 6, buffDur : 2, onCrit : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 7, buffDur : 2, onCrit : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 8, buffDur : 2, onCrit : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 9, buffDur : 2, onCrit : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 10, buffDur : 2, onCrit : true},
                     {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.25, buffCode : 11, buffDur : 2, onCrit : true}];
  skillObj.tooltip = '각각 15\% (치명타 시 25%) 확률로 적에게 2턴 간 [탈진], [침묵], [실명], [마비], [봉인], [혼란] 상태이상 부여';
  skillObj.flavor = '뒷세계에서 받은 기이한 물체, 테이저 건 같이 날아가서 붙이는데 이 때 감각 자체가 해킹이 돼서 오감의 활동을 불가능하게 만들어버린다.';
  charNux.skill.base.push(skillObj);

  skillObj = {};
  skillObj.code = 201734;
  skillObj.name = '귀차니즘 공돌이의 필수 아이템';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_DRIVE;
  skillObj.active = cons.ACTIVE_TYPE_TURN_START;
  skillObj.cost = 5;
  skillObj.chance = 0.05;
  skillObj.cooldown = 0;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_SELECTION;
  effectObj.chance = 1;
  effectObj.selectChances = [0.5, 1];
  effectObj.options = [];
  var optObj = {};
  optObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  optObj.chance = 1;
  optObj.buffCode = 201740;
  optObj.buffDur = 1;
  optObj.value = 55;
  effectObj.options.push(optObj);
  optObj = {};
  optObj.code = cons.EFFECT_TYPE_SELF_BUFF;
  optObj.chance = 1;
  optObj.buffCode = 201741;
  optObj.buffDur = 1;
  optObj.value = 0;
  effectObj.options.push(optObj);
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '턴 시작 시 5\% 확률로 공격 시 SP를 55 회복하거나 SP재생/SP충전 1턴 간 0으로 고정';
  skillObj.flavor = '';
  charNux.skill.drive = skillObj;

  skillObj = {};
  skillObj.code = 201735;
  skillObj.name = '귀찮아서 대충 만든 프로그램 – Last Embryo';
  skillObj.nameType = cons.NAME_KOR_END_CONS;
  skillObj.type = cons.SKILL_TYPE_SPECIAL;
  skillObj.cost = 200;
  skillObj.effect = [];
  effectObj = {};
  effectObj.code = cons.EFFECT_TYPE_OPP_BUFF;
  effectObj.chance = 1;
  effectObj.buffCode = 201742;
  effectObj.buffDur = 3;
  skillObj.effect.push(effectObj);
  skillObj.tooltip = '적에게 3턴 간 [종말] 디버프 부여<br><br>[종말] : [탈진], 상성 패배 시 적 공격 계수 +30%, 종료 시 적에게 1턴 간 [만사 귀차니즘] 디버프 부여<br>[만사 귀차니즘] : [기절], 저항 -30%';
  skillObj.flavor = '뒷세계에 연이 된 몇 명과 함께 만든 최악의 해킹시스템. 원래 만들 의향은 아니었지만 꽤 큰 돈을 받아서 조금 의욕은 있었지만 귀찮아서 대충 70% 정도 되는 양을 담당해서 만들었다. 30%는 아직 이해하는 중이라서 자신도 걸리면 조금 골치 아프다. 물론 못 풀지는 않기에 뒷세계 참여한 사람들은 눅스에게 이것을 잘 사용하지 않는다.';
  charNux.skill.special = skillObj;


  var charDekais = {};
  _initChar(charDekais);
  
  charDekais.name = '데 카이츠';
  charDekais.nameType = cons.NAME_KOR_NO_END_CONS;
  charDekais.title = '메탈 스트라이커';
  
  charDekais.skill = {};
  charDekais.skill.base = [];

  var skillObj = {code : 201736, name : '버스트 캐논 리로드', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.5, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201745, buffDur : null, chkNot : [201745]}],
      tooltip : '100\% 확률로 자신에게 [버스트 캐논] 버프 부여<br><br>[버스트 캐논] : 재부여 시 소거 후 물리 1.2 추가 피해',
      flavor : '무장을 순식간에 핸드캐논 형태로 바꾸어 발사한다.'};  
  charDekais.skill.base.push(skillObj);

  skillObj = {code : 201737, name : '판타스마 윈드밀', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1, 
      effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_ABSOLUTE, value : 0.02, isPercentStat : true, percentKey : 'maxHp'},
                {code : cons.EFFECT_TYPE_SELF_HP, value : -0.02, isPercentStat : true, percentKey : 'maxHp'}],
      tooltip : '100\% 확률로 자신의 최대 생명력의 2\%를 소모하여 그만큼 적에게 절대 피해',
      flavor : '갑주 상태라고는 믿을 수 없는 속도로 주변을 몰아내는 풍차 공격을 가한다.'};  
  charDekais.skill.base.push(skillObj);

  skillObj = {code : 201738, name : '파괴의 창', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.5, hitMod : 0.6,
      effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.5}],
      tooltip : '이 스킬의 명중률은 기본값의 60\%가 된다. 100\% 확률로 물리 0.5 추가 피해',
      flavor : '갑주를 무수한 투창으로 변환하여 적에게 흩뿌린다.'};  
  charDekais.skill.base.push(skillObj);

  skillObj = {code : 201739, name : '메탈 스크럽', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
      active : cons.ACTIVE_TYPE_SKILL_LOSE, cost : 10, chance : 0.1, cooldown : 0,
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201746, buffDur : 1},
                {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201747, buffDur : 2}],
      tooltip : '피격 시 10\% 확률로 자신에게 1턴 간 [메탈 스크럽] 버프 부여<br><br>[메탈 스크럽] : 저항 +30\%, 치명/명중 +10\%',
      flavor : '강철 조각을 흩뿌려 적의 공격을 경감하고, 회심의 공격 기회를 부여한다.'};
  charDekais.skill.drive = skillObj;

  skillObj = {code : 201740, name : '하이퍼 헤비 머신건', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 165, 
      effect : [{code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, chance : 0.4, value : 0.3, hitMod : 0.5},
                {code : cons.EFFECT_TYPE_ADD_HIT, type : cons.DAMAGE_TYPE_PHYSICAL, chance : 0.4, value : 0.3, hitMod : 0.5}],
      tooltip : '적에게 10-12회의 물리 0.3 피해 (명중 보정 50\%), 자신에게 1턴 간 [과열] 디버프 부여<br><br>[과열] : 저항 -30\%',
      flavor : '갑주를 최대 전개하여 무한의 탄환으로 적을 공격한다.'};
  charDekais.skill.special = skillObj;


  var charLozic = {};
  _initChar(charLozic);
  
  charLozic.name = '세컨드 로직';
  charLozic.nameType = cons.NAME_KOR_END_CONS;
  charLozic.title = '두 번째 수호자';
  
  charLozic.skill = {};
  charLozic.skill.base = [];

  var skillObj = {code : 201741, name : '되비침의 방패', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 0.8, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201749, buffDur : 2}],
      tooltip : '100\% 확률로 자신에게 2턴 간 [되비침의 방패] 부여<br><br>[되비침의 방패] : 표준 상태이상을 한 가지 무효화하고 그 절반의 턴만큼 적에게 부여, SP 10 회복 후 버프 소거',
      flavor : '자신의 방패에 부정한 것을 되비쳐 상대에게 일깨움을 주는 힘을 부여한다.'};  
  charLozic.skill.base.push(skillObj);

  skillObj = {code : 201742, name : '반격의 기회', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201750, buffDur : 2}],
      tooltip : '100\% 확률로 자신에게 1턴 간 [반격의 기회] 부여<br><br>[반격의 기회] : 피격 시 피해량의 50%를 경감하고 SP 10 회복, 피해량의 50%만큼 절대 피해, 물리 1.0 추가 피해',
      flavor : '적의 공격을 예상하여 몸을 숙이고 피해를 최소화한다.'};  
  charLozic.skill.base.push(skillObj);

  skillObj = {code : 201743, name : '심판의 천정', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1.2,
      calcEffect : [{name : '기회 포착', code : cons.EFFECT_TYPE_ADD_DAMAGE, value : 0.3, chkLessAttack : true, skillCode : 201743}],
      effect : [{code : cons.EFFECT_TYPE_SELF_SP, value : 1, isPercentStat : true, percentKey : 'spCharge', chkMoreAttack : true},
                {code : cons.EFFECT_TYPE_SELF_SP, value : 1, isPercentOppStat : true, percentKey : 'spCharge', chkMoreAttack : true},
                {code : cons.EFFECT_TYPE_SELF_SP, value : 1, isPercentStat : true, percentKey : 'spCharge', chkEqualAttack : true},
                {code : cons.EFFECT_TYPE_SELF_SP, value : 1, isPercentOppStat : true, percentKey : 'spCharge', chkEqualAttack : true}],
      tooltip : '자신의 공격횟수가 적보다 적을 경우 공격 계수 +0.3, 같거나 많은 경우 자신과 적의 SP충전만큼 자신의 SP 회복',
      flavor : '심판의 저울을 기울여 균형의 힘을 발휘한다.'};  
  charLozic.skill.base.push(skillObj);

  skillObj = {code : 201744, name : '축성', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
      active : cons.ACTIVE_TYPE_TURN_END, cost : 4, chance : 1, setCooldown : 2,
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : [201751, 201752, 201753], buffDur : null, multiple : true}],
      tooltip : '2턴마다 자신에게 [축성-물리], [축성-마법], [축성-보호] 버프 중 하나 부여 (최대 10중첩)<br><br>[축성-물리] : 물리저항 +1\%<br>[축성-마법] : 마법저항 +1\%<br>[축성-보호] : 피해감소 +1',
      flavor : '수호자의 힘은 시간이 지날 수록 더욱 견고해진다.'};
  charLozic.skill.drive = skillObj;

  skillObj = {code : 201745, name : '두 번의 의지', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 130, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201754, buffDur : null, stack : 2},
                {code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201757, buffDur : null}],
      tooltip : '가장 최근에 받은 피해 수치만큼 보호막 생성, 자신에게 [두 번의 의지] 버프 2중첩 부여<br><br>[두 번의 의지] : 스킬 공격 계수 +0.1, 공격 성공 시 자신의 잃은 생명력의 8%를 회복하고 1중첩 소거',
      flavor : '수호자의 불굴의 의지.'};
  charLozic.skill.special = skillObj;


  var charMarang = {};
  _initChar(charMarang);
  
  charMarang.name = '마랑';
  charMarang.nameType = cons.NAME_KOR_END_CONS;
  charMarang.title = '차가운 눈동자';
  
  charMarang.skill = {};
  charMarang.skill.base = [];

  var skillObj = {code : 201746, name : '삼월참', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_PHYSICAL, damage : 1.3, 
      calcEffect : [{name : '삼월참', code : cons.EFFECT_TYPE_FORCE_CRIT, chkOpp : [12], skillCode : 201746}],
      effect : [],
      tooltip : '자신에게 [설화의 계절], [서리 날개] 버프가 있다면 각각 치명 피해 1.2배, 적에게 [빙결] 상태이상이 있다면 확정 치명 타격',
      flavor : '서늘한 달빛을 머금고 베어내는 발검술.'};  
  charMarang.skill.base.push(skillObj);

  skillObj = {code : 201747, name : '설화의 계절', nameType : cons.NAME_KOR_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 1, 
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201755, buffDur : 4},
                {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 1, buffDur : 1}],
      tooltip : '100\% 확률로 자신에게 4턴 간 [설화의 계절] 부여, 15\% 확률로 적에게 1턴 간 [화상] 상태이상 부여<br><br>[설화의 계절] : 명중 +5\%, 물리저항 +5\%',
      flavor : '주변의 기온을 비정상적으로 조작하여 비좁은 공간에 냉기와 열기를 생성한다.'};  
  charMarang.skill.base.push(skillObj);

  skillObj = {code : 201748, name : '서리 날개', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.DAMAGE_TYPE_MAGICAL, damage : 0.7,
      effect : [{code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 201756, buffDur : 4},
                {code : cons.EFFECT_TYPE_OPP_BUFF, chance : 0.15, buffCode : 12, buffDur : 1}],
      tooltip : '100\% 확률로 자신에게 4턴 간 [서리 날개] 부여, 15\% 확률로 적에게 1턴 간 [빙결] 상태이상 부여<br><br>[서리 날개] : 명중 +5\%, 마법저항 +5\%',
      flavor : '주변을 급냉각하여 날개 형태의 서리로 형상화한다.'};  
  charMarang.skill.base.push(skillObj);

  skillObj = {code : 201749, name : '마랑의 검은 코트', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.SKILL_TYPE_DRIVE, 
      active : cons.ACTIVE_TYPE_RECEIVE_BUFF, cost : 5, chance : 1, setCooldown : 5, chk : [1, 12],
      effect : [{code : cons.EFFECT_TYPE_REMOVE_BUFF, buffTarget : [1, 12]},
                {code : cons.EFFECT_TYPE_SELF_HP, value : 0.05, isPercentStat : true, percentKey : 'maxHp'}],
      tooltip : '자신에게 [화상] 또는 [빙결] 상태이상이 걸릴 경우, 해당 상태이상을 즉시 해제하고 최대 생명력의 5%만큼 회복 (쿨타임 5턴)',
      flavor : '그녀가 두른 검은 늑대 코트는 불과 얼음의 시련을 극복할 수 있도록 돕는다.'};
  charMarang.skill.drive = skillObj;

  skillObj = {code : 201750, name : '얼음, 그리고 불꽃', nameType : cons.NAME_KOR_END_CONS, type : cons.SKILL_TYPE_SPECIAL, cost : 100, 
      effect : [{code : cons.EFFECT_TYPE_OPP_BUFF, buffCode : 12, buffDur : 2}],
      tooltip : '적에게 2턴 간 [빙결] 상태이상 부여, 자신에게 [설화의 계절]과 [서리 날개] 버프가 모두 있다면 [삼월참 설화] 발동<br><br>[삼월참 설화] : 물리 1.3, 확정 치명, 필중, 치명 피해 1.44배',
      flavor : '서리를 결정화하여 상대를 얼려버리고, 냉혹한 불길로 적을 베어낸다.'};
  charMarang.skill.special = skillObj;

  charMarang.expBoost = 10;
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 무기 카드', rank : 9, resultType : 0});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 무기 카드', rank : 9, resultType : 0});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 방어구 카드', rank : 9, resultType : 1});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 방어구 카드', rank : 9, resultType : 1});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 보조방어구 카드', rank : 9, resultType : 2});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 보조방어구 카드', rank : 9, resultType : 2});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 장신구 카드', rank : 9, resultType : 3});
  charMarang.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '흔들리는 달빛의 장신구 카드', rank : 9, resultType : 3});
  
  function _initChar(char) {
    char.stat = {};
    char.stat.maxHp = 400;
    char.stat.spCharge = 5;
    char.stat.hpRegen = 0;
    char.stat.spRegen = 5;
    char.stat.phyAtk = 20;
    char.stat.magAtk = 20;
    char.stat.crit = 0.05;
    char.stat.critDmg = 1.5;
    char.stat.phyReduce = 0;
    char.stat.magReduce = 0;
    char.stat.hit = 1;
    char.stat.evasion = 0;
    char.stat.phyAtkMin = 0;
    char.stat.phyAtkMax = 0;
    char.stat.magAtkMin = 0;
    char.stat.magAtkMax = 0;
    char.stat.dmgReduce = 0;
    char.stat.pierce = 0;
    char.base = JSON.parse(JSON.stringify(char.stat));
    char.inventory = [];
    char.items = {};
    char.items.weapon = item.list[0];
    char.items.armor = item.list[114];
    char.rank = 9;
    char.level = 1;
    char.exp = 0;
    char.reqExp = 100;
    char.statPoint = 0;
    char.premiumPoint = 20;
    char.battleCnt = 0;
    char.winCnt = 0;
    char.battleRecord = {};
    char.winRecord = {};
    char.dust = 0;
    char.dungeonInfos = {};
    char.currencies = {};
    char.quest = {};
    char.stoneCube = [];
    char.birth = null;
  }

  module.exports.kines = charLeft;
  module.exports.lk = charRight;
  module.exports.seriers = charSeriers;
  module.exports.psi = charPsi;
  module.exports.julius = charJulius;
  module.exports.aeika = charAeika;
  module.exports.aeohelm = charAeohelm;
  module.exports.bks = charBks;
  module.exports.nux = charNux;
  module.exports.dekaitz = charDekais;
  module.exports.lozic = charLozic;
  module.exports.marang = charMarang;
