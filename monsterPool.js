// 로그라이크용 몬스터 풀. monster.js의 스킬/드라이브/특성만 빌리고 스탯은 사이클 규칙으로 다시 깐다.
// deck: [가위, 바위, 보] 장수. skill0Boost: 가위 스킬을 강한 스킬로 교체. shuffleEveryTurn: 매 턴 덱 전체 재셔플
const cons = require('./constant');

const TIERS = {
  1: [
    { key: 'mCrawler',     deck: [4, 0, 4], note: '바위 없음' },
    { key: 'mHeadHunter',  deck: [1, 2, 4], skill0: { name: '머리 사냥', damage: 2.4 }, note: '가위 1장이 치명적' },
    { key: 'mMassCrawler', deck: [3, 3, 4], note: '10장 물량', tune: (e) => { e.skill.special.effect[0].value = 0.1; } },
    { key: 'mDestoryer',   deck: [1, 4, 1], note: '바위 위주', tune: (e) => { e.skill.drive.chance = 0.3; e.skill.special.cost = 100; } },
  ],
  3: [
    { key: 'mGatekeeper',   deck: [5, 3, 0], extraFav: 1, note: '달빛의 수문장 — 징표를 걸고 광란의 추적', tune: (e) => {
      e.skill.special.cost = 110;
      e.skill.special.effect[0].buffDur = 5;
      e.skill.special.tooltip = '5턴 간 [광란의 추적] — 가위 스킬의 계수가 1.7로 고정된다';
      e.skill.special.setChaseDamage = 1.5;
      e.skill.special.tooltip = '5턴 간 [광란의 추적] — 가위 스킬의 계수가 1.5로 고정된다';
    } },
    { key: 'mLibei',        deck: [2, 0, 5], extraFav: 1, note: '대흑마술사 R. 리베이 — 소환을 쌓는다', tune: (e) => {
      for (const sk of e.skill.base) for (const ef of (sk.effect || [])) if (ef.buffCode === 10718) ef.buffDur = 3;
      e.summonPower = 0.13;
      e.skill.special.effect = e.skill.special.effect.slice(0, 2);
      e.skill.special.tooltip = '[어둠의 소환] 2개를 한 번에 부여';
    } },   // 보스 사이클
    { key: 'mTaurus',      deck: [1, 5, 1], note: '돌진', tune: (e) => { e.skill.special.cost = 120; } },
    { key: 'mMegaTaurus',  deck: [0, 6, 2], note: '바위 6', tune: (e) => { e.skill.drive.effect[0].value = 0.1; e.skill.base[1].effect[0].chance = 0.15; e.skill.base[2].effect[0].chance = 0.15; e.skill.special.effect[0].buffCode = 90001; e.skill.special.cost = 120; e.base.maxHp -= 60; } },   // 포효 II(회복 200/턴) → 포효 I
    { key: 'eGunda',       deck: [3, 3, 3], tune: (e) => { e.skill.drive.chance = 0.35; } },
  ],
  5: [
    { key: 'eBroken',      deck: [1, 2, 1], note: '4장 덱, 빠른 순환' },
    { key: 'eCrossbow',    deck: [3, 0, 3], skill0: { name: '조준 사격', damage: 1.5 } },
    { key: 'oFlame',       deck: [2, 2, 4], tune: (e) => { for (const k of e.skill.base) k.effect[0].value = 0.2; } },
    { key: 'oEleLord',     deck: [3, 1, 3], tune: (e) => { e.skill.drive.chance = 0.08; e.skill.base[0].damage = 1.1; } },
    { key: 'oStoneist',    deck: [2, 4, 2], },
    { key: 'oDeathKnight', deck: [1, 4, 2], tune: (e) => { e.skill.base[2].damage = 1.1; e.skill.special.cost = 140; } },
    { key: 'oLegor',       deck: [3, 3, 3], tune: (e) => { e.skill.drive.chance = 0.1; e.skill.base[1].effect[0].value = 0.3; e.skill.base[0].damage = 1.0; e.skill.base[2].damage = 1.1; } },
  ],
  7: [
    { key: 'd7Knight',      deck: [2, 3, 2] },
    { key: 'd7EliteKnight', deck: [2, 3, 3] },
    { key: 'd7Lohengrin',   deck: [3, 3, 3], tune: (e) => { for (const k of e.skill.base) k.damage = 1.2; } },
    { key: 'rKines1',       deck: [3, 2, 2], tune: (e) => { e.skill.drive.effect[1].value = -8; } },
    { key: 'rInfernal',     deck: [4, 1, 2] },
    { key: 'mFrena',        deck: [1, 1, 1], extraFav: 2, note: '대마법사 프레나 — 삼원소와 마법 폭풍', tune: (e) => {
      for (const sk of e.skill.base) { sk.damage = 1.15; for (const ef of (sk.effect || [])) if (ef.chance) ef.chance = 0.25; sk.tooltip = sk.tooltip.replace('33%', '25%'); }
      e.skill.special.cost = 115;
    } },
    { key: 'rTimeStorm',    deck: [2, 2, 2], shuffleEveryTurn: true, note: '매 턴 덱 재셔플', tune: (e) => { delete e.skill.drive; delete e.startEffects; for (const k of e.skill.base) k.damage = 1.3; } },   // 51턴 즉사 타이머·공격 불가 제거
    { key: 'rJulius',       deck: [2, 2, 2] },
  ],
  11: [   // 보스: 사천왕 (포켓몬 3폼 교체, 각 폼 체력 -67%)
    { key: 'd721', deck: [4, 2, 3], note: '칸나 — 파르셀·루주라·라프라스' },
    { key: 'd722', deck: [2, 5, 2], note: '시바 — 홍수몬·시라소몬·괴력몬' },
    { key: 'd723', deck: [3, 2, 4], note: '국화 — 팬텀·아보크·팬텀' },
    { key: 'd724', deck: [3, 3, 3], extraFav: 1, note: '목호 — 리자몽·갸라도스·망나뇽', tune: (e) => { e.base.maxHp = Math.round(e.base.maxHp * 0.8); e.skillScale = { damage: 0.55, specialCost: 3 }; } },
  ],
  13: [   // 보스
    { key: 'd725',  deck: [3, 3, 3], extraFav: 2, note: '레드 — 이상해꽃·거북왕·잠만보·피카츄 (4폼, -75%)', tune: (e) => { e.base.maxHp = Math.round(e.base.maxHp * 0.85); e.skillScale = { damage: 0.7, specialCost: 4 }; } },   // 수면가루(SP 25) 등 저비용 스페셜 억제
    { key: 'mIZ', deck: [3, 3, 3], extraFav: 2, note: '달빛의 타락자 iZ — 중독을 깔고 증폭', tune: (e) => {
      e.skill.base[0].effect[0].chance = 0.35; e.skill.base[0].tooltip = '35% 확률로 적에게 2턴 간 [중독]';
      e.skill.base[2].effect[0].chance = 0.6; e.skill.base[2].effect[0].buffDur = 1; e.skill.base[2].tooltip = '60% 확률로 적에게 1턴 간 [수면]';
      for (const ef of e.skill.special.effect) ef.buffDur = 1;
      e.skill.special.tooltip = '[기절]을 제외한 모든 표준 상태이상을 1턴 간 부여';
      e.skill.drive.chance = 0.3;
    } },
      ],
  15: [   // 최종 보스
    { key: 'rsDeci', deck: [3, 3, 3], extraFav: 2, note: '파멸자 데시메이트 — 기절 연타, 안 걸리면 파멸', tune: (e) => {
      delete e.startEffects; delete e.skill.special;
      for (const k of e.skill.base) for (const ef of (k.effect || [])) if (ef.buffCode === 4) ef.chance = 0.35;
      e.skill.drive.chance = 0.3;
      e.skill.drive.effect = [{ code: cons.EFFECT_TYPE_ADD_HIT, type: cons.DAMAGE_TYPE_ABSOLUTE, isPercentOppStat: true, percentKey: 'maxHp', value: 0.1275 }];
      e.skill.drive.tooltip = '턴 종료 시 상대가 [기절]이 아니면 30% 확률로 상대 최대 생명력의 12.75% 절대 피해';
    } },
    { key: 'rsVyres', deck: [4, 4, 3], extraFav: 2, note: '엘바스의 쌍검사 바이레스 — 서리와 불꽃 연계' },
  ],
  9: [
    { key: 'mCouncil',      deck: [4, 4, 4], extraFav: 2, note: '달빛 의회 — 받은 만큼 상대 카드를 지운다' },
    { key: 'rsInzeal',      deck: [4, 2, 3], extraFav: 2, note: '인-질 — 파멸을 퍼뜨린다', tune: (e) => {
      delete e.startEffects;
      e.skill.base[0].name = '파멸의 전도'; e.skill.base[0].damage = 0.8;
      e.skill.base[0].effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, chance: 1, buffCode: 90065, buffDur: 8 }];
      e.skill.base[0].tooltip = '마법 0.8 피해, [파멸] 8턴 부여 (턴 종료 시 현재 생명력의 1%)';
      e.skill.base[1].name = '썩어가는 축복'; e.skill.base[1].damage = 1.1;
      e.skill.base[1].effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, chance: 0.5, buffCode: 2, buffDur: 3 }];
      e.skill.base[1].tooltip = '마법 1.1 피해, 50% 확률로 [중독] 3턴';
      e.skill.base[2].name = '역병의 손길'; e.skill.base[2].damage = 1.2; e.skill.base[2].type = cons.DAMAGE_TYPE_PHYSICAL;
      e.skill.base[2].effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, chance: 0.4, buffCode: 10505, buffDur: 3 }];
      e.skill.base[2].tooltip = '물리 1.2 피해, 40% 확률로 [벌어진 상처] 3턴 (회복량 -50%)';
      e.skill.special.name = '모두 썩어 문드러져라'; e.skill.special.cost = 120;
      e.skill.special.effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 90065, buffDur: 12 }, { code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 2, buffDur: 5 }];
      e.skill.special.tooltip = '[파멸] 12턴, [중독] 5턴 부여';
    } },
    { key: 'rsNagpa',       deck: [2, 4, 3], extraFav: 2, note: '나그파 — 정신을 묶는다', tune: (e) => {
      delete e.startEffects;
      e.skill.base[0].name = '감언이설'; e.skill.base[0].damage = 0.9;
      e.skill.base[0].effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, chance: 0.4, buffCode: 11, buffDur: 2 }];
      e.skill.base[0].tooltip = '마법 0.9 피해, 40% 확률로 [광란] 2턴';
      e.skill.base[1].name = '입을 봉하는 주문'; e.skill.base[1].damage = 1.0;
      e.skill.base[1].effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, chance: 0.3, buffCode: 7, buffDur: 1 }, { code: cons.EFFECT_TYPE_OPP_SP, value: -8 }];
      e.skill.base[1].tooltip = '마법 1.0 피해, 30% 확률로 [침묵] 1턴, 상대 SP -8';
      e.skill.base[2].name = '에너지 쇼크'; e.skill.base[2].damage = 1.1; e.skill.base[2].type = cons.DAMAGE_TYPE_PHYSICAL;
      e.skill.base[2].effect = [{ code: cons.EFFECT_TYPE_MULTIPLE, chance: 0.35, target: [{ code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 6, buffDur: 1 }, { code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 8, buffDur: 2 }, { code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 4, buffDur: 1 }] }];
      e.skill.base[2].tooltip = '물리 1.1 피해, 35% 확률로 [마비]/[암흑]/[기절] 중 하나';
      e.skill.special.name = '파멸의 끝을 받아들여라'; e.skill.special.cost = 190;
      e.skill.special.effect = [{ code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 90066, buffDur: 3 }, { code: cons.EFFECT_TYPE_OPP_BUFF, buffCode: 10, buffDur: 2 }];
      e.skill.special.tooltip = '[파멸의 끝] 3턴 (턴 종료 시 절대 150), [봉인] 2턴';
    } },
    { key: 'oLegor',        deck: [3, 3, 3], extraFav: 2, tune: (e) => { e.skill.drive.chance = 0.1; e.skill.base[1].effect[0].value = 0.3; e.skill.base[0].damage = 1.0; e.skill.base[2].damage = 1.1; } },
    { key: 'rInfernal',     deck: [4, 1, 2], extraFav: 2 },
  ],
};
function tierFor(cycle) { const t = [15, 13, 11, 9, 7, 5, 3, 1].find(x => x <= cycle); return t; }
function isMonsterCycle(cycle) { return cycle % 2 === 1; }
function pick(cycle) {
  const list = TIERS[tierFor(cycle)];
  return list[Math.floor(Math.random() * list.length)];
}
module.exports = { TIERS, tierFor, isMonsterCycle, pick };
