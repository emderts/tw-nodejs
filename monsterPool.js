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
  3: [   // 보스 사이클
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
    { key: 'rKines2',       deck: [3, 2, 3], tune: (e) => { e.skill.drive.effect[1].value = -8; e.skill.base[0].damage = 1.0; } },
    { key: 'rTimeStorm',    deck: [2, 2, 2], shuffleEveryTurn: true, note: '매 턴 덱 재셔플', tune: (e) => { delete e.skill.drive; delete e.startEffects; for (const k of e.skill.base) k.damage = 1.3; } },   // 51턴 즉사 타이머·공격 불가 제거
    { key: 'rJulius',       deck: [2, 2, 2] },
  ],
  9: [
    { key: 'rsInzeal',      deck: [3, 3, 3], extraFav: 2, tune: (e) => { delete e.startEffects; } },
    { key: 'rsNagpa',       deck: [3, 3, 3], extraFav: 2, tune: (e) => { delete e.startEffects; e.skill.base[0].effect[0].chance = 0.4; } },
    { key: 'oLegor',        deck: [3, 3, 3], extraFav: 2, tune: (e) => { e.skill.drive.chance = 0.1; e.skill.base[1].effect[0].value = 0.3; e.skill.base[0].damage = 1.0; e.skill.base[2].damage = 1.1; } },
    { key: 'rInfernal',     deck: [4, 1, 2], extraFav: 2 },
  ],
};
function tierFor(cycle) { const t = [9, 7, 5, 3, 1].find(x => x <= cycle); return t; }
function isMonsterCycle(cycle) { return cycle % 2 === 1; }
function pick(cycle) {
  const list = TIERS[tierFor(cycle)];
  return list[Math.floor(Math.random() * list.length)];
}
module.exports = { TIERS, tierFor, isMonsterCycle, pick };
