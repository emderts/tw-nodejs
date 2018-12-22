const cons = require('./constant');
const item = require('./items');
  const ach = {};
  ach[0] = {name : '8급 달성', nameType : cons.NAME_KOR_END_CONS, desc : '시즌 내 캐릭터 8급 달성'};
  ach[1] = {name : '7급 달성', nameType : cons.NAME_KOR_END_CONS, desc : '시즌 내 캐릭터 7급 달성'};
  ach[2] = {name : '6급 달성', nameType : cons.NAME_KOR_END_CONS, desc : '시즌 내 캐릭터 6급 달성'};

  ach[8] = {name : '전투 100승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 100승 달성'};
  ach[9] = {name : '전투 200승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 200승 달성'};
  ach[10] = {name : '전투 500승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 500승 달성'};
  ach[11] = {name : '전투 1000승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 1000승 달성'};
  ach[12] = {name : '전투 1500승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 1500승 달성'};
  ach[13] = {name : '전투 2000승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 2000승 달성'};

  ach[14] = {name : '전투 6연승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 6연승 달성'};
  ach[15] = {name : '전투 9연승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 9연승 달성'};
  ach[16] = {name : '전투 15연승', nameType : cons.NAME_KOR_END_CONS, desc : 'PVP 전투에서 15연승 달성'};

  ach[17] = {name : '에픽 나인', nameType : cons.NAME_KOR_END_CONS, desc : '9급 에픽 장비 획득'};
  ach[18] = {name : '에픽 에잇', nameType : cons.NAME_KOR_END_CONS, desc : '8급 에픽 장비 획득'};
  ach[19] = {name : '에픽 세븐', nameType : cons.NAME_KOR_END_CONS, desc : '7급 에픽 장비 획득'};
  ach[20] = {name : '에픽 식스', nameType : cons.NAME_KOR_NO_END_CONS, desc : '6급 에픽 장비 획득'};
  
  ach[26] = {name : '에픽 5개 획득', nameType : cons.NAME_KOR_END_CONS, desc : '에픽 장비 5개 획득'};
  ach[27] = {name : '에픽 10개 획득', nameType : cons.NAME_KOR_END_CONS, desc : '에픽 장비 10개 획득'};
  
  ach[28] = {name : '고대 흑마법 해체', nameType : cons.NAME_KOR_NO_END_CONS, desc : '고대 흑마법사 - 카이네스 엠더츠 공략'};

  ach[33] = {name : '여명의 빛', nameType : cons.NAME_KOR_END_CONS, desc : '아서스 메네실에게 승리', hidden : true};

  ach[29] = {name : '메비우스 학살자', nameType : cons.NAME_KOR_END_CONS, desc : '메모리얼 게이트 - 메비우스 섬멸에서 20페이즈 돌파', hidden : true};
  ach[30] = {name : '왜 나한테만 이래?', nameType : cons.NAME_KOR_NO_END_CONS, desc : '메모리얼 게이트 - 메비우스 섬멸에서 타우러스 5회 조우', hidden : true};
  ach[31] = {name : '재의 귀인', nameType : cons.NAME_KOR_END_CONS, desc : '어나더 게이트 - 재의 묘소에서 군다 처치', hidden : true};
  ach[32] = {name : '전문 봉인가', nameType : cons.NAME_KOR_NO_END_CONS, desc : '어나더 게이트 - 재의 묘소에서 각성 상태가 아닌 군다 처치', hidden : true};
  
  module.exports.achData = ach;