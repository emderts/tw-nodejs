// 층 진행(로그라이크 런) 모듈
// 사이클 = 이벤트 → 상점 → 전투. 10사이클, 보스는 3·6·10사이클 전투.
const cons = require('./constant');
const roster = require('./roster');
const monsterPool = require('./monsterPool');
const monsterEvents = require('./monsterEvents');
const consumables = require('./consumables');

const TOTAL_CYCLES = 15;
const BOSS_CYCLES = [3, 6, 9, 11, 13, 15];
const STAGES = ['event', 'shop', 'battle'];
const RESETS_PER_BATTLE = 2;
const HAND_SIZE = 3;

// index.js 쪽 헬퍼 주입 (getItem, calcStats, makeDayStone)
let deps = {};
function configure(d) { deps = d; }
// 해당 급수/레어리티 조합이 없으면 한 단계씩 낮춰서 시도
function getItemSafe(rank, rarity, type) {
  const order = [rarity, 4, 2, 1, 0].filter((v, i, a) => a.indexOf(v) === i && v <= rarity);
  for (const ra of order) {
    try { const it = deps.getItem(rank, ra, type); if (it && it.name) return it; } catch (err) { /* next */ }
  }
  return null;
}

// ---------- 런 상태 ----------
// 장착 아이템의 로그라이크 효과(runEffect) 조회. 같은 키가 여럿이면 합산(수치) / true(플래그)
function runEffect(char, key) {
  let acc = null;
  for (const k in (char.items || {})) {
    const it = char.items[k];
    if (!it || !it.runEffect || it.runEffect.key !== key) continue;
    const v = it.runEffect.value;
    acc = (typeof v === 'number') ? ((acc || 0) + v) : v;
  }
  return acc;
}
function maxLives(char) { return 3 + (runEffect(char, 'luckyCoin') ? 1 : 0); }
function initRun(char) {
  char.run = { cycle: 1, stageIdx: 0, floor: 1, lives: 1 };   // lives = 남은 재도전 횟수
  char.gold = 80;   // 승천 2는 selectChar에서 적용
  char.inventory = char.inventory || [];
  const starter = consumables.random(['flee']);   // 시작 소모품 1개 (첫 전투부터 연막은 제외)
  if (starter) char.inventory.push(starter);
  prepareCycle(char);
  return char;
}
// 사이클 시작 시: 홀수면 이번 사이클 몬스터를 미리 뽑아 고정 (이벤트/망루가 참조·수정)
function prepareCycle(char) {
  // 줄리어스의 중단점: 사이클 시작 상태 저장 (아직 안 쓴 경우에만)
  if (runEffect(char, 'breakpoint') && !char.run.breakpointUsed) {
    const snap = JSON.parse(JSON.stringify(char)); snap.run.breakpoint = null;
    char.run.breakpoint = JSON.stringify(snap);
  }
  if (monsterPool.isMonsterCycle(char.run.cycle)) { char.run.nextMonster = makeMonster(char); char.run.lastMonster = null; }
  else char.run.nextMonster = null;
}
function stage(char) { return STAGES[char.run.stageIdx]; }
function floorNo(char) { return (char.run.cycle - 1) * 3 + char.run.stageIdx + 1; }
function isBossCycle(cycle) { return BOSS_CYCLES.includes(cycle); }
// 급수는 2사이클마다 1씩 오름. 레어 이상 장비가 6급까지만 존재하므로 6급에서 멈춤
// 1사이클 9급 … 15사이클 1급 (급수당 2사이클)
const RANK_BY_CYCLE = [9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 1];
function rankForCycle(cycle) { return RANK_BY_CYCLE[Math.min(Math.max(cycle, 1), RANK_BY_CYCLE.length) - 1]; }
function stageLabel(char) { return ({ shop: '상점', event: '이벤트', battle: isBossCycle(char.run.cycle) ? '보스 전투' : '전투' })[stage(char)]; }

// 스테이지 하나 소화 후 호출. 사이클이 끝나면 레벨/급수 반영. 마지막 사이클 전투까지 끝났으면 true(클리어)
// 하이퍼루프: 현재 층 기준 ±range 무작위 층으로 이동 (1층 ~ 마지막 층 안에서, 현재 층 제외)
function jumpFloor(char, range) {
  const cur = floorNo(char), maxF = TOTAL_CYCLES * STAGES.length;
  const cands = []; for (let f = Math.max(1, cur - range); f <= Math.min(maxF, cur + range); f++) if (f !== cur) cands.push(f);
  if (!cands.length) return cur;
  const target = cands[Math.floor(Math.random() * cands.length)];
  const newCycle = Math.floor((target - 1) / STAGES.length) + 1;
  const cycleChanged = newCycle !== char.run.cycle;
  char.run.cycle = newCycle; char.run.stageIdx = (target - 1) % STAGES.length; char.run.floor = target;
  delete char.run.battle; char.run.evData = null;
  if (cycleChanged) { char.level = newCycle; char.rank = rankForCycle(newCycle); prepareCycle(char); }
  return target;
}
function advance(char) {
  const fg = runEffect(char, 'skipShop'); if (typeof fg === 'number' && fg > 0) char.gold = (char.gold || 0) + fg;   // 나백수의 취업준비카드: 층마다 골드
  char.run.stageIdx++;
  if (char.run.stageIdx >= STAGES.length) {
    char.run.stageIdx = 0;
    char.run.cycle++;
    if (char.run.nextMonster) { char.run.lastMonster = { key: char.run.nextMonster.monsterKey, name: char.run.nextMonster.name }; }
    if (char.run.cycle > TOTAL_CYCLES) return true;
    char.level = char.run.cycle;
    char.rank = rankForCycle(char.run.cycle);
    prepareCycle(char);
  }
  char.run.floor = floorNo(char);
  return false;
}

// ---------- 덱 ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function newDeckState(deck, opts) {
  return { draw: shuffle(deck.map(c => Object.assign({}, c))), hand: [], discard: [], everyTurn: !!(opts && opts.shuffleEveryTurn) };
}
// 손패를 3장까지 보충. 뽑을 카드가 없을 때는 손패가 비어 있어야만 버림 더미를 셔플
// 덱을 다시 섞는다 (손패는 그대로 두고 버린 패까지 합쳐서)
function shuffleDeck(st) { st.draw = shuffle(st.draw.concat(st.discard)); st.discard = []; st.shuffles = (st.shuffles || 0) + 1; }
function drawHand(st) {
  if (st.everyTurn) { st.draw = shuffle(st.draw.concat(st.hand, st.discard)); st.hand = []; st.discard = []; }
  while (st.hand.length < HAND_SIZE) {
    if (st.draw.length === 0) {
      if (st.hand.length > 0 || st.discard.length === 0) break;
      st.draw = shuffle(st.discard); st.discard = []; st.shuffles = (st.shuffles || 0) + 1;
    }
    st.hand.push(st.draw.shift());
  }
  return st.hand;
}
function deckCounts(deck) {
  const c = [0, 0, 0];
  for (const cd of deck) if (cd.type >= 0 && cd.type <= 2) c[cd.type]++;
  return c;
}
function playCard(st, type) {
  const idx = st.hand.findIndex(c => c.type === type);
  if (idx === -1) return null;
  const card = st.hand.splice(idx, 1)[0];
  st.discard.push(card);
  return card;
}
function handTypes(st) { return st.hand.map(c => c.type).sort((a, b) => a - b); }   // 가위-바위-보 순
// 추가 드로우 (첫 턴 손패 보너스용)
function drawExtra(st, n) { for (let i = 0; i < n; i++) { if (!st.draw.length) { if (!st.discard.length) break; st.draw = shuffle(st.discard); st.discard = []; } st.hand.push(st.draw.pop()); } return st.hand; }
// 손패 교체: 지금 손패만 버리고 새로 뽑는다 (덱/버림은 그대로)
function redrawHand(st) {
  st.discard = st.discard.concat(st.hand); st.hand = [];
  return drawHand(st);
}
// 덱 리셋: 손패+버림+덱을 전부 섞어 새로 뽑음
function resetDeck(st) {
  st.draw = shuffle(st.draw.concat(st.hand, st.discard)); st.hand = []; st.discard = [];
  return drawHand(st);
}

// AI: 원하는 수 → 손패에 있으면 그것, 없으면 차선(무승부 수), 그것도 없으면 손패 중 무작위
// want는 상대 예상수 P를 이기는 수이므로 P = (want + 2) % 3
function aiPick(st, want) {
  const types = handTypes(st);
  if (types.includes(want)) return want;
  const tie = (want + 2) % 3;
  if (types.includes(tie)) return tie;
  return types[Math.floor(Math.random() * types.length)];
}

// ---------- 적 생성 ----------
const RARITY_BY_CYCLE = [1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 5, 5, 5, 5, 5]; // 언커먼 → 레어 → 유니크 → 에픽

function makeEnemy(char) {
  if (monsterPool.isMonsterCycle(char.run.cycle)) {
    if (!char.run.nextMonster) char.run.nextMonster = makeMonster(char);
    return JSON.parse(JSON.stringify(char.run.nextMonster));   // 이벤트로 수정된 상태 그대로
  }
  return makeRosterEnemy(char);
}
// 장비/스탯 포인트 공통 (플레이어와 같은 환산)
// ===== 승천 =====
const ASC_MAX = 10;
const ASC_RULES = [
  '',
  '적 체력 +10%, 공격력 +5%',
  '시작 골드 50, 상점 가격 +15%',
  '보스 장비 등급 +1',
  '적 AI가 카드를 센다 (남은 덱을 보고 대응)',
  '모든 적 장비 등급 +1',
  '적 체력 +20%, 공격력 +15%',
  '보스가 에픽 장비로 무장하고 [사용] 장비를 쓴다',
  '손패 교체·덱 리셋 기본 횟수 -1',
  '적이 SP 40을 들고 시작, 적 드라이브 발동률 +25%',
  '모든 적이 에픽 장비로 무장',
];
function ascOf(char) { return (char && char.run && char.run.asc) || 0; }
const nextRarity = (r) => r === 1 ? 2 : (r === 2 ? 4 : 5);
function equipAndScale(e, cycle, boss, asc) {
  asc = asc || 0;
  let rarity = RARITY_BY_CYCLE[Math.min(cycle, 10) - 1];
  if (boss && rarity < 5) rarity = nextRarity(rarity);
  if (asc >= 3 && boss && rarity < 5) rarity = nextRarity(rarity);   // 승천 3: 보스 장비 +1
  if (asc >= 5 && rarity < 5) rarity = nextRarity(rarity);            // 승천 5: 모든 적 +1
  if ((asc >= 7 && boss) || asc >= 10) rarity = 5;                    // 승천 7: 보스 풀 에픽 / 10: 전원 풀 에픽
  e.items = {};
  // 적에게는 플레이어 전용/기믹 아이템(runEffect·드라이브 교체·시간대·커스텀 코드 효과) 제외
  const AI_USE_OK = ['freeStrike', 'spBurn', 'regenHeal', 'cthunBlast', 'capacitorBurst'];   // 승천 7 보스가 쓸 수 있는 [사용]
  const useOk = (it) => !it.use || (asc >= 7 && boss && (it.use.effect || []).every(ef => typeof ef.code !== 'string' || AI_USE_OK.includes(ef.code)));
  const enemyOk = (it) => it && !it.runEffect && !it.driveOverride && !it.timeMult && useOk(it) && !(it.effect || []).some(ef => typeof ef.code === 'string');
  // 승천 7 보스: 쓸 수 있는 [사용] 장비가 있으면 슬롯마다 50% 확률로 우선 장착
  const usePool = (asc >= 7 && boss) ? require('./items').list.filter(x => x && x.use && x.type <= 3 && Math.abs(x.rank - e.rank) <= 1 && enemyOk(x)) : [];
  for (let t = 0; t <= 3; t++) {
    let it = null;
    const cand = usePool.filter(x => x.type === t);
    if (cand.length && Math.random() < 0.5) it = JSON.parse(JSON.stringify(cand[Math.floor(Math.random() * cand.length)]));
    for (let tries = 0; tries < 12 && !enemyOk(it); tries++) it = getItemSafe(e.rank, rarity, t);
    if (enemyOk(it)) e.items[['weapon', 'armor', 'subarmor', 'trinket'][t]] = it;
  }
  e.inventory = [];
  const pts = Math.round(2.5 * cycle) + (boss ? 3 : 0);
  const magical = e.skill.base.filter(s => s.type === cons.DAMAGE_TYPE_MAGICAL).length >= 2;
  const hpPts = Math.round(pts / 3);
  e.base.maxHp += 10 * hpPts;
  e.base[magical ? 'magAtk' : 'phyAtk'] += 1.5 * (pts - hpPts);
  if (boss) e.base.maxHp = Math.round(e.base.maxHp * 1.15);
  const hpM = asc >= 6 ? 1.2 : (asc >= 1 ? 1.1 : 1), atM = asc >= 6 ? 1.15 : (asc >= 1 ? 1.05 : 1);   // 승천 1·6
  e.base.maxHp = Math.round(e.base.maxHp * hpM); e.base.phyAtk *= atM; e.base.magAtk *= atM;
  if (asc >= 1) e.ascAtkMul = atM;   // 무기 공격력에도 같은 배율 (calcStats 이후 적용)
  if (asc >= 9 && e.skill && e.skill.drive && e.skill.drive.chance) e.skill.drive.chance = Math.min(1, e.skill.drive.chance * 1.25);   // 승천 9
  e.asc = asc;
  deps.calcStats(e);
}
function makeMonster(char) {
  const cycle = char.run.cycle;
  const boss = isBossCycle(cycle);
  const cfg = monsterPool.pick(cycle);
  const monster = require('./monster');
  const e = JSON.parse(JSON.stringify(monster[cfg.key]));
  e.monsterKey = cfg.key;
  e.rank = rankForCycle(cycle);
  e.level = cycle;
  // 스탯 정규화: 급수 기본치로 덮되 몬스터 고유 저항/명중 등은 유지
  Object.assign(e.base, roster.baseByRank(e.rank));
  // 사천왕/레드: 스킬이 비어 있고 시작 버프(포켓몬)가 SET_SKILL로 채움 → 표시·판정용으로 첫 폼을 미리 반영
  if (e.skill.base.every(sk => !sk || !sk.name) && e.startEffects && e.startEffects.length) {
    const buffMdl = require('./buff');
    const first = buffMdl.getBuffData({ buffCode: e.startEffects[0].buffCode });
    for (const ef of first.effect || []) {
      if (ef.code === cons.EFFECT_TYPE_SET_SKILL && ef.key === 'base') e.skill.base[ef.value] = JSON.parse(JSON.stringify(ef.target));
      if (ef.code === cons.EFFECT_TYPE_SET_SKILL && ef.key === 'special') e.skill.special = JSON.parse(JSON.stringify(ef.target));
      if (ef.code === cons.EFFECT_TYPE_SET_NAME) e.name = ef.value;
    }
    e.pokemonForms = e.startEffects.length;
    // 포켓몬 스킬은 상태이상 연타(광란·빙결·기절)가 강해 공격력을 낮춰 균형
    delete e.skill.drive;   // 회복약(체력 30% 이하 시 완전 회복)은 폼 교체 회복과 겹쳐 제거
  }
  // 레이드용 저항/명중은 로그라이크 스케일에 맞게 상한
  for (const k of ['phyReduce', 'magReduce']) e.base[k] = Math.min(e.base[k] || 0, 0.1);
  e.base.dmgReduce = 0; e.base.hit = Math.min(e.base.hit || 1, 1.05);
  // 레이드 보스용 %생명력 피해 저항(boss)은 체력이 정상 스케일인 여기선 제거 — 윈드밀 등 %기반 스킬이 무력화되는 것 방지
  delete e.boss; delete e.bossStatus;
  // 레이드용 고유 버프(코드 90000+)를 100% 확률로 거는 스킬 효과는 발동 확률을 낮춰 정규화
  for (const sk of e.skill.base) for (const ef of (sk.effect || [])) {
    const bc = ef.buffCode; const raid = Array.isArray(bc) ? bc.some(x => x >= 90000) : bc >= 90000;
    if (raid && ef.chance === undefined) ef.chance = 0.35;
  }
  if (cfg.skill0) Object.assign(e.skill.base[0], cfg.skill0);
  if (cfg.tune) cfg.tune(e);   // base 조정은 여기서 (장비/스탯 포인트 반영 전)
  equipAndScale(e, cycle, boss, ascOf(char));
  if (e.pokemonForms) {   // 포켓몬 스킬 계수(1.4~2.3)·저비용 스페셜 보정
    if (!e.skillScale) e.skillScale = { damage: 0.7, specialCost: 2.5 };
    e.base.phyAtk = Math.round(e.base.phyAtk * 0.8); e.base.magAtk = Math.round(e.base.magAtk * 0.8); deps.calcStats(e);
  }
  // 덱
  e.deck = [];
  cfg.deck.forEach((n, t) => { for (let i = 0; i < n; i++) e.deck.push({ type: t }); });
  const fav = cfg.deck.indexOf(Math.max(...cfg.deck));
  for (let i = 0; i < (cfg.extraFav || 0); i++) e.deck.push({ type: fav });
  e.favType = fav;
  e.deckOpts = cfg.shuffleEveryTurn ? { shuffleEveryTurn: true } : null;
  e.skillSelect = 2;
  e.rating = [0, 0, 0]; e.rating[fav] = 0.25;
  e.isBoss = boss;
  e.isMonster = true;
  return e;
}
function makeRosterEnemy(char) {
  const cycle = char.run.cycle;
  const boss = isBossCycle(cycle);
  const keys = roster.KEYS.filter(k => k !== char.rosterKey);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const e = JSON.parse(JSON.stringify(roster.template(key)));
  e.rosterKey = key;
  e.rank = rankForCycle(cycle);
  e.level = cycle;
  e.title = boss ? '층의 지배자' : '떠도는 도전자';
  Object.assign(e.base, roster.baseByRank(e.rank));

  equipAndScale(e, cycle, boss, ascOf(char));

  // 덱: 2/2/2 + 성향 편중 (사이클이 오를수록 편중 카드 추가)
  const fav = Math.floor(Math.random() * 3);
  e.deck = [0, 0, 1, 1, 2, 2].map(t => ({ type: t }));
  const extra = Math.min(3, Math.floor(cycle / 3)) + (boss ? 1 : 0);
  for (let i = 0; i < extra; i++) e.deck.push({ type: fav });
  e.favType = fav;

  // 반응형 AI (monster.selectFunc[2]) — rating은 성향 쪽으로 약간 기울임
  e.skillSelect = 2;
  e.rating = [0, 0, 0]; e.rating[fav] = 0.25;
  e.isBoss = boss;
  return e;
}

// 죽은 캐릭터 스냅샷을 적으로 변환
function enemyFromFallen(row, char) {
  const e = JSON.parse(row.char_data);
  e.title = '쓰러진 모험가';
  e.isFallen = true;
  e.inventory = [];
  if (!e.deck || e.deck.length === 0) e.deck = [0, 0, 1, 1, 2, 2].map(t => ({ type: t }));
  // 덱 편중을 성향으로
  const counts = [0, 0, 0];
  for (const c of e.deck) if (c.type >= 0 && c.type <= 2) counts[c.type]++;
  const fav = counts.indexOf(Math.max(...counts));
  e.favType = fav;
  e.skillSelect = 2;
  e.rating = [0, 0, 0]; e.rating[fav] = 0.25;
  e.isBoss = false;
  e.fallenId = row.id;
  e.fallenName = e.name;
  deps.calcStats(e);
  return e;
}

// ---------- 전투 스냅샷 (죽음 저장용) ----------
function snapshotForFallen(char) {
  const s = JSON.parse(JSON.stringify(char));
  delete s.run; delete s.inventory;
  return s;
}

// ---------- 상점 ----------
// 세트 컬렉션: 특별 상점이 한 번에 파는 묶음 (같은 슬롯끼리 겹쳐도 그대로 — 고르는 재미)
const COLLECTIONS = [
  { name: '불타는 과수원의 유물', desc: '과수원에서 건져 올린 것들', match: (it) => /과수원|결실/.test(it.name) },
  { name: '생태 복원 뱃지함', desc: '동물 스택을 쌓는 뱃지들', match: (it) => /(소형 동물|가축|펭귄|물고기|새) 뱃지|포식동물 제어장치/.test(it.name) },
  { name: '도시 건설 계획서', desc: '[도시 태그]를 굴리는 장비들', match: (it) => /이민자 도시|녹티스|로버 공장|광역 대도시권|대수도|상업 지구|지하 도시|돔 크레이터|용암동굴|타르시스/.test(it.name) },
  { name: '화성 연구단 보급품', desc: '[과학 태그]를 굴리는 장비들', match: (it) => /올림푸스|화성 연구자|화성 대학교|반중력|라그랑주|생명체 탐사|성층권|제한 구역|첨단 합금|연구 전초기지|워프 드라이브|AI 센트럴/.test(it.name) },
  { name: '목성권 원정 장비', desc: '[외우주 태그]를 굴리는 장비들', match: (it) => /가니메데|이오 탐사|유로파/.test(it.name) },
  { name: '엘바스의 유산', desc: '네 자루 중 남은 것들', match: (it) => /엘바스의 유산/.test(it.name) },
  { name: '울두아르의 수호자들', desc: '[티탄 수호자] 세트', match: (it) => /토림의 되새긴 의지|호디르의 얼음검|프레이야의 장로 신발|미미론의 붉은 버튼/.test(it.name) },
  { name: '고대 신의 속삭임', desc: '[고대 신의 타락] 세트', match: (it) => /요그사론의 정복당한 촉수|크툰의 의식 로브|느조스의 촉수 장갑|이샤라즈의 촉수 장창/.test(it.name) },
  { name: '두 머리의 유품', desc: '초의 견갑과 갈의 장갑', minItems: 2, match: (it) => /^초의 견갑$|^갈의 장갑$/.test(it.name) },
];
const SHOP_INFO = {
  gear:       { label: '장비 상인',        blurb: '슬롯 무작위 레어 이상 장비 4개' },
  gearSlot:   { label: '전문 장비 상인',   blurb: '한 슬롯의 레어 이상 장비 4개' },
  potion:     { label: '소모품 상인',      blurb: '물약·폭탄·일회용 카드 등 4개' },
  card:       { label: '카드 상인',        blurb: '가위·바위·보 카드 각 1장' },
  result:     { label: '리설트 카드 상인', blurb: '슬롯별 리설트 카드 4장' },
  resultRare: { label: '고급 리설트 카드 상인', blurb: '레어·유니크 확정 리설트 카드' },
  alchemist:  { label: '연금술사',         blurb: '스탯 포인트, 재도전(♥) 회복' },
  collector:  { label: '수집가',           blurb: '한 계열의 장비를 통째로 판다' },
};
const SHOP_TYPES = Object.keys(SHOP_INFO);
const SLOT_NAMES = ['무기', '방어구', '보조방어구', '장신구'];
function itemList() { return require('./items').list; }
// 현재 급수에서 살 만한 컬렉션 (해당 급수 ~ 2급 위, 3종 이상)
function collectionsFor(char) {
  return COLLECTIONS.map(col => ({ col, items: itemList().filter(x => x && x.type <= 4 && x.rank >= char.rank && x.rank <= Math.min(9, char.rank + 2) && col.match(x)) })).filter(x => x.items.length >= (x.col.minItems || 3));
}
// 상점 후보 2곳 (서로 다른 종류)
function makeShopOffers(char) {
  const n = Math.min(SHOP_TYPES.length, 2 + (runEffect(char, 'shopOffers') || 0));
  const common = SHOP_TYPES.filter(t => t !== 'collector');
  const picked = [];
  if (Math.random() < 0.1 && collectionsFor(char).length) picked.push('collector');   // 수집가는 10% 확률, 살 게 있을 때만
  while (picked.length < n) { const t = common[Math.floor(Math.random() * common.length)]; if (!picked.includes(t)) picked.push(t); }
  return picked.map(t => {
    const o = { type: t, label: SHOP_INFO[t].label, blurb: SHOP_INFO[t].blurb };
    if (t === 'gearSlot') { o.slot = Math.floor(Math.random() * 4); o.label = SLOT_NAMES[o.slot] + ' 상인'; o.blurb = SLOT_NAMES[o.slot] + ' 레어 이상 4개'; }
    return o;
  });
}
function makeShop(char, typeIn, opts) {
  const type = typeIn || SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)];
  opts = opts || {};
  const cycle = char.run.cycle;
  const goods = [];
  let label = SHOP_INFO[type].label;
  const rarityPool = cycle < 4 ? [2, 2, 2, 4] : (cycle < 7 ? [2, 2, 4, 4] : [2, 4, 4, 5]);
  const cc = runEffect(char, 'creditCard') || 0;   // 신용카드: 전 품목 할인
  const gearDisc = (1 - (runEffect(char, 'gearDiscount') || 0)) * (1 - cc) * (ascOf(char) >= 2 ? 1.15 : 1), potDisc = (1 - (runEffect(char, 'potionDiscount') || 0)) * (1 - cc) * (ascOf(char) >= 2 ? 1.15 : 1), allDisc = (1 - cc) * (ascOf(char) >= 2 ? 1.15 : 1);
  const gearPrice = (it) => Math.round((40 + [0, 15, 35, 0, 70, 120][it.rarity] + 5 * cycle) * gearDisc);
  if (type === 'gear' || type === 'gearSlot') {
    const fixed = type === 'gearSlot' ? (opts.slot !== undefined ? opts.slot : Math.floor(Math.random() * 4)) : -1;
    if (fixed >= 0) label = SLOT_NAMES[fixed] + ' 상인';
    for (let i = 0; i < 4; i++) {
      const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
      const t = fixed >= 0 ? fixed : Math.floor(Math.random() * 4);
      const it = getItemSafe(char.rank, rarity, t);
      if (it) goods.push({ kind: 'item', item: it, price: gearPrice(it) });
    }
  } else if (type === 'potion') {
    for (let i = 0; i < 4; i++) {
      const it = consumables.random();
      goods.push({ kind: 'item', item: it, price: Math.round(consumables.price(it.code, cycle) * potDisc) });
    }
  } else if (type === 'card') {
    for (let t = 0; t < 3; t++) goods.push({ kind: 'card', card: { type: t }, price: Math.round((45 + 5 * cycle) * allDisc) });
  } else if (type === 'result') {
    for (let t = 0; t < 4; t++) goods.push({ kind: 'item', item: roster.makeResultCard(char.rank, t), price: Math.round((50 + 5 * cycle) * allDisc) });
  } else if (type === 'resultRare') {
    // 레어 확정(97/2/1) 2장, 유니크 확정(96/4) 1장, 일반 슬롯 카드 1장
    const rare = () => ({ type: cons.ITEM_TYPE_RESULT_CARD, resultType: 5, rank: char.rank, name: char.rank + '급 레어 장비 리설트 카드', tooltip: '97% : 레어 장비<br>2% : 유니크 장비<br>1% : 에픽 장비' });
    const uniq = () => ({ type: cons.ITEM_TYPE_RESULT_CARD, resultType: 6, rank: char.rank, name: char.rank + '급 유니크 장비 리설트 카드', tooltip: '96% : 유니크 장비<br>4% : 에픽 장비' });
    goods.push({ kind: 'item', item: rare(), price: Math.round((75 + 6 * cycle) * allDisc) });
    goods.push({ kind: 'item', item: rare(), price: Math.round((75 + 6 * cycle) * allDisc) });
    goods.push({ kind: 'item', item: uniq(), price: Math.round((150 + 10 * cycle) * allDisc) });
    goods.push({ kind: 'item', item: roster.makeResultCard(char.rank, Math.floor(Math.random() * 4)), price: Math.round((50 + 5 * cycle) * allDisc) });
  } else if (type === 'collector') {
    // 한 계열을 골라, 현재 급수 이하에서 그 계열 장비를 전부 진열 (급수가 낮을수록 저렴)
    const pool = collectionsFor(char);
    if (pool.length) {
      const pickCol = pool[Math.floor(Math.random() * pool.length)];
      label = '수집가 — ' + pickCol.col.name;
      for (const it of pickCol.items.slice(0, 6)) {
        const price = Math.round((45 + [0, 15, 35, 0, 70, 120][it.rarity] + 5 * cycle) * (1 + (it.rank - char.rank) * -0.12) * allDisc * 1.15);
        goods.push({ kind: 'item', item: JSON.parse(JSON.stringify(it)), price: Math.max(20, price) });
      }
    }
  } else if (type === 'alchemist') {
    goods.push({ kind: 'stat', value: 2, name: '스탯 포인트 +2', price: Math.round((60 + 8 * cycle) * allDisc) });
    goods.push({ kind: 'stat', value: 2, name: '스탯 포인트 +2', price: Math.round((60 + 8 * cycle) * allDisc) });
    goods.push({ kind: 'life', name: '재도전 +1 (최대 ' + maxLives(char) + ')', price: Math.round((70 + 10 * cycle) * allDisc) });
  }
  if (cycle >= TOTAL_CYCLES) {   // 마지막 사이클: 어느 상점이든 1급 리설트 카드를 정가의 115%로 무제한 판매
    goods.push({ kind: 'resultStock', rank: char.rank, unlimited: true, name: char.rank + '급 리설트 카드 (무작위 부위 · 무제한)', price: Math.round((50 + 5 * cycle) * 1.15 * allDisc) });
  }
  return { type, label, goods, bought: [] };
}

// ---------- 이벤트 ----------
// 각 이벤트: { code, title, desc, options: [{ label, effect: fn(char, ctx) → 결과 문구 }] }
const T = ['가위', '바위', '보'];
function addCard(ch, t) { ch.deck.push({ type: t }); }
function giveGear(ch, rarity) {
  const it = getItemSafe(ch.rank, rarity, Math.floor(Math.random() * 4));
  if (!it) return null;
  ch.inventory.push(it);
  return it;
}
const RAR = ['커먼', '언커먼', '레어', '', '유니크', '에픽'];

function eventPool(char) {
  const cycle = char.run.cycle;
  const pool = [];

  // --- 카드 제거 (유일한 통로) ---
  pool.push({
    code: 'altar', weight: 3, title: '낡은 제단', desc: '제단에 카드 한 장을 바치면 덱이 가벼워진다. 바친 자리에는 무언가가 남는다.',
    options: [0, 1, 2].filter(t => char.deck.some(c => c.type === t)).map(t => ({
      label: T[t] + ' 카드 1장 제거', arg: t,
      effect: (ch, arg) => { const i = ch.deck.findIndex(c => c.type === arg); if (i !== -1) ch.deck.splice(i, 1); const rc = roster.makeResultCard(ch.rank, Math.floor(Math.random() * 4)); ch.inventory.push(rc); return T[arg] + ' 카드를 바쳤다. 덱 ' + ch.deck.length + '장. 제단이 ' + rc.name + '을(를) 남겼다.'; }
    })).concat([{ label: '지나친다', effect: () => '제단을 지나쳤다.' }])
  });

  // --- 카드 상인 + 대장장이 통합 ---
  pool.push({
    code: 'cardsmith', weight: 3, title: '떠돌이 카드 장인', desc: '"카드를 새로 찍어줄 수도, 있는 걸 다른 종류로 바꿔줄 수도 있어. 새 카드는 돈이 들지만."',
    options: [
      { label: '새 카드 1장 (30골드, 종류 무작위)', effect: (ch) => { if (ch.gold < 30) return '골드가 부족하다.'; ch.gold -= 30; const t = Math.floor(Math.random() * 3); addCard(ch, t); return T[t] + ' 카드를 얻었다.'; } }
    ].concat([0, 1, 2].filter(t => char.deck.some(c => c.type === t)).map(t => ({
      label: T[t] + ' 1장 → 다른 종류로 (무료)', arg: t,
      effect: (ch, arg) => { const i = ch.deck.findIndex(c => c.type === arg); if (i === -1) return '그 카드가 없다.'; const to = [(arg + 1) % 3, (arg + 2) % 3][Math.floor(Math.random() * 2)]; ch.deck[i] = { type: to }; return T[arg] + ' 카드가 ' + T[to] + ' 카드가 됐다.'; }
    }))).concat([{ label: '괜찮다', effect: () => '장인은 어깨를 으쓱했다.' }])
  });

  // --- 훈련장 ---
  pool.push({
    code: 'training', weight: 2, title: '버려진 훈련장', desc: '잠시 머물며 몸을 단련할 수 있다. 아니면 근처에서 값나가는 걸 뒤질 수도.',
    options: [
      { label: '단련한다 (스탯 포인트 +2)', effect: (ch) => { ch.statPoint += 2; return '스탯 포인트를 2 얻었다.'; } },
      { label: '뒤진다 (골드 +40)', effect: (ch) => { ch.gold += 40; return '40골드를 찾았다.'; } }
    ]
  });

  // --- 상자 3종 ---
  pool.push({
    code: 'chest_gold', weight: 2, title: '수상한 상자', desc: '잠긴 상자. 열면 보물일 수도, 함정일 수도.',
    options: [
      { label: '연다', effect: (ch) => { if (Math.random() < 0.55) { ch.gold += 80; return '보물이다! 80골드.'; } ch.gold = Math.max(0, ch.gold - 30); return '함정. 30골드를 잃었다.'; } },
      { label: '내버려둔다', effect: () => '상자를 두고 떠났다.' }
    ]
  });
  pool.push({
    code: 'chest_gear', weight: 2, title: '녹슨 철제 상자', desc: '묵직하다. 안에 뭔가 단단한 게 들어 있는 듯하지만, 자물쇠에 이상한 문양이 새겨져 있다.',
    options: [
      { label: '억지로 연다', effect: (ch) => {
          const r = Math.random();
          if (r < 0.6) { const it = giveGear(ch, cycle < 5 ? 2 : 4); return it ? '<span class="rarity' + ['Common','Uncommon','Rare','','Unique','Epic'][it.rarity] + '">' + it.name + '</span>' + '을(를) 얻었다.' : '비어 있었다.'; }
          if (r < 0.85) { ch.gold = Math.max(0, ch.gold - 40); return '자물쇠가 터지며 주머니가 찢어졌다. 40골드를 잃었다.'; }
          if (ch.statPoint > 0) { ch.statPoint -= 1; return '저주가 흘러나왔다. 스탯 포인트 1을 잃었다.'; }
          ch.gold = Math.max(0, ch.gold - 40); return '저주가 흘러나왔지만 빼앗길 게 없었다. 40골드를 잃었다.';
        } },
      { label: '내버려둔다', effect: () => '상자를 두고 떠났다.' }
    ]
  });
  pool.push({
    code: 'chest_cursed', weight: 1, title: '검은 상자', desc: '상자에서 낮은 웃음소리가 새어 나온다. 열면 카드 한 장을 빼앗기겠지만, 그 대가로 뭔가를 내놓는다고 한다.',
    options: [
      { label: '연다 (무작위 카드 1장 잃음)', effect: (ch) => {
          if (ch.deck.length === 0) return '빼앗길 카드가 없어 상자는 잠긴 채였다.';
          const i = Math.floor(Math.random() * ch.deck.length); const lost = ch.deck.splice(i, 1)[0];
          const it = giveGear(ch, cycle < 5 ? 4 : 5);
          return T[lost.type] + ' 카드를 빼앗겼다. 대신 ' + (it ? '<span class="rarity' + ['Common','Uncommon','Rare','','Unique','Epic'][it.rarity] + '">' + it.name + '</span>' + '을(를) 얻었다.' : '아무것도 나오지 않았다.');
        } },
      { label: '내버려둔다', effect: () => '웃음소리가 멀어졌다.' }
    ]
  });

  // --- 장비 / 소모품 / 리설트 카드 이벤트 ---
  pool.push({
    code: 'corpse', weight: 2, title: '쓰러진 모험가', desc: '누군가의 시신. 장비는 아직 쓸 만해 보인다.',
    options: [
      { label: '장비를 챙긴다', effect: (ch) => { const it = giveGear(ch, 2); return it ? it.name + '을(를) 챙겼다.' : '쓸 만한 게 없었다.'; } },
      { label: '묻어준다 (리설트 카드 1장)', effect: (ch) => { deps.addResultCard(ch, 4); return '묻어주었다. 품에서 ' + ch.rank + '급 장비 리설트 카드가 나왔다.'; } }
    ]
  });
  pool.push({
    code: 'shrine', weight: 2, title: '요일의 사당', desc: '일곱 개의 촛대 중 하나만 불이 켜져 있다.',
    options: [
      { label: '촛불에 손을 댄다 (소모품 2개)', effect: (ch) => { const a = consumables.random(), b = consumables.random(); ch.inventory.push(a, b); return a.name + ', ' + b.name + '을(를) 얻었다.'; } },
      { label: '기도한다 (골드 +25)', effect: (ch) => { ch.gold += 25; return '촛대 아래에서 25골드를 발견했다.'; } }
    ]
  });
  pool.push({
    code: 'gambler', weight: 2, title: '카드 도박꾼', desc: '"리설트 카드 하나에 40골드. 사려면 사고, 아니면 판돈을 걸어 두 장을 노려봐."',
    options: [
      { label: '산다 (40골드 → 리설트 카드 1장)', effect: (ch) => { if (ch.gold < 40) return '골드가 부족하다.'; ch.gold -= 40; deps.addResultCard(ch, 4); return '리설트 카드를 샀다.'; } },
      { label: '건다 (40골드 → 50%로 2장, 아니면 꽝)', effect: (ch) => { if (ch.gold < 40) return '골드가 부족하다.'; ch.gold -= 40; if (Math.random() < 0.5) { deps.addResultCard(ch, 4); deps.addResultCard(ch, 4); return '이겼다! 리설트 카드 2장.'; } return '졌다. 도박꾼이 웃으며 골드를 챙겼다.'; } },
      { label: '지나친다', effect: () => '도박꾼을 지나쳤다.' }
    ]
  });
  pool.push({
    code: 'merchant_gear', weight: 2, title: '떠돌이 무기상', desc: '"급하게 처분할 물건이 있어. 싸게 줄게."',
    options: [
      { label: '산다 (50골드, 레어 장비)', effect: (ch) => { if (ch.gold < 50) return '골드가 부족하다.'; const it = giveGear(ch, 2); if (!it) return '물건이 없었다.'; ch.gold -= 50; return it.name + '을(를) 샀다.'; } },
      { label: '거절한다', effect: () => '무기상은 서둘러 떠났다.' }
    ]
  });

  // --- 일시 버프 ---
  pool.push({
    code: 'camp', weight: 2, title: '야영지', desc: '불을 피우고 쉴 수 있다. 다음 두 번의 전투 동안 몸이 가볍다.',
    options: [
      { label: '무기를 손질한다 (다음 2전투 공격력 +25%)', effect: (ch) => { addBuff(ch, { key: 'atk', mult: 1.25, battles: 2, label: '공격력 +25%' }); return '날이 서늘하게 빛난다. 다음 2전투 공격력 +25%.'; } },
      { label: '푹 잔다 (다음 2전투 체력 +25%)', effect: (ch) => { addBuff(ch, { key: 'maxHp', mult: 1.25, battles: 2, label: '체력 +25%' }); return '몸이 개운하다. 다음 2전투 체력 +25%.'; } }
    ]
  });
  pool.push({
    code: 'shaman', weight: 2, title: '떠돌이 주술사', desc: '"작은 축복 하나 어때? 25골드면 돼."',
    options: [
      { label: '치명의 축복 (25골드, 다음 3전투 치명타 +10%p)', effect: (ch) => { if (ch.gold < 25) return '골드가 부족하다.'; ch.gold -= 25; addBuff(ch, { key: 'crit', add: 0.1, battles: 3, label: '치명타 +10%p' }); return '손끝이 저릿하다. 다음 3전투 치명타 +10%p.'; } },
      { label: '회피의 축복 (25골드, 다음 3전투 회피 +10%p)', effect: (ch) => { if (ch.gold < 25) return '골드가 부족하다.'; ch.gold -= 25; addBuff(ch, { key: 'evasion', add: 0.1, battles: 3, label: '회피 +10%p' }); return '발이 가벼워졌다. 다음 3전투 회피 +10%p.'; } },
      { label: '거절한다', effect: () => '주술사는 다음 손님을 찾아 떠났다.' }
    ]
  });
  pool.push({
    code: 'spring', weight: 1, title: '맑은 샘', desc: '물을 마시면 힘이 솟는다. 얼마나 오래 갈지는 모르겠다.',
    options: [
      { label: '마신다 (다음 전투 모든 능력치 +15%)', effect: (ch) => { addBuff(ch, { key: 'all', mult: 1.15, battles: 1, label: '전 능력치 +15%' }); return '온몸에 활력이 돈다. 다음 전투 전 능력치 +15%.'; } },
      { label: '물통에 담는다 (골드 +20)', effect: (ch) => { ch.gold += 20; return '지나던 상인에게 팔아 20골드를 받았다.'; } }
    ]
  });

  // ---------- 아래부터는 evData(사전 고정 데이터)를 쓰는 이벤트 ----------
  const d = char.run.evData || {};
  const has = (code) => d.code === code;
  const SLOT = { weapon: '무기', armor: '방어구', subarmor: '보조방어구', trinket: '장신구' };
  const SLOT_T = { weapon: 0, armor: 1, subarmor: 2, trinket: 3 };

  // --- 영구 능력치 ---
  pool.push({
    code: 'monolith', weight: 2, title: '고대의 비석', desc: '손을 대자 글자가 빛난다. 한 가지 힘을 새겨 넣을 수 있을 것 같다.',
    options: [
      { label: '체력 +40', effect: (ch) => { ch.base.maxHp += 40; return '몸이 단단해졌다. 최대 체력 +40.'; } },
      { label: '물리·마법 공격력 +6', effect: (ch) => { ch.base.phyAtk += 6; ch.base.magAtk += 6; return '팔에 힘이 실린다. 공격력 +6.'; } },
      { label: '치명타 +3%p', effect: (ch) => { ch.base.crit += 0.03; return '눈이 날카로워졌다. 치명타 +3%p.'; } }
    ]
  });
  pool.push({
    code: 'devil', weight: 2, title: '악마의 거래', desc: '"공짜는 없어. 하나를 내놓으면 하나를 주지."',
    options: [
      { label: '체력 −60 → 공격력 +12', effect: (ch) => { ch.base.maxHp = Math.max(50, ch.base.maxHp - 60); ch.base.phyAtk += 12; ch.base.magAtk += 12; return '숨이 짧아진 대신 손이 무거워졌다.'; } },
      { label: '공격력 −8 → 체력 +90', effect: (ch) => { ch.base.phyAtk = Math.max(5, ch.base.phyAtk - 8); ch.base.magAtk = Math.max(5, ch.base.magAtk - 8); ch.base.maxHp += 90; return '둔해진 대신 질겨졌다.'; } },
      { label: '명중 −5%p → 치명타 +8%p', effect: (ch) => { ch.base.hit -= 0.05; ch.base.crit += 0.08; return '흐릿하지만 날카롭다.'; } },
      { label: '거절한다', effect: () => '악마는 웃으며 사라졌다.' }
    ]
  });

  // --- 재도전 회복 ---
  const lives = char.run.lives === undefined ? 1 : char.run.lives;
  const medicCost = 60 + 10 * char.run.cycle;
  pool.push({
    code: 'medic', weight: lives < 2 ? 3 : 1, title: '떠돌이 의사', desc: '"한 번 더 일어설 힘을 팔지. ' + medicCost + '골드야." (재도전 최대 ' + maxLives(char) + ')',
    options: [
      { label: '치료받는다 (' + medicCost + '골드, 재도전 +1)', effect: (ch) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= maxLives(ch)) return '더는 받을 수 없다.'; if (ch.gold < medicCost) return '골드가 부족하다.'; ch.gold -= medicCost; ch.run.lives = l + 1; return '재도전 +1. 현재 ' + ch.run.lives + '회.'; } },
      { label: '거절한다', effect: () => '의사는 다음 환자를 찾아 떠났다.' }
    ]
  });

  // --- 장비 교체 (대장장이): 장착 슬롯 하나를 정해진 장비로 교체 ---
  pool.push({
    code: 'forge', weight: 2, title: '대장장이',
    prepare: (ch) => {
      const equipped = Object.keys(SLOT).filter(k => ch.items && ch.items[k] && ch.items[k].name);
      const slots = equipped.length ? equipped : Object.keys(SLOT);
      const slot = slots[Math.floor(Math.random() * slots.length)];
      const rarity = ch.run.cycle >= 7 ? 5 : 4;
      return { slot, item: getItemSafe(ch.rank, rarity, SLOT_T[slot]) };
    },
    desc: has('forge') && d.item
      ? '"네 ' + SLOT[d.slot] + ', 내가 만든 것으로 바꿔 주지. 원래 쓰던 건 녹여 버리겠지만."'
      : '대장장이가 화로 앞에 있다.',
    html: has('forge') && d.item ? (deps.makeTooltip ? deps.makeTooltip(d.item) : d.item.name) : '',
    options: has('forge') && d.item ? [
      { label: (char.items && char.items[d.slot] && char.items[d.slot].name ? char.items[d.slot].name : '(빈 슬롯)') + ' → ' + d.item.name, effect: (ch) => { if (!ch.items) ch.items = {}; ch.items[d.slot] = JSON.parse(JSON.stringify(d.item)); deps.calcStats(ch); return d.item.name + '을(를) 장착했다.'; } },
      { label: '거절한다', effect: () => '대장장이는 망치질로 돌아갔다.' }
    ] : [ { label: '지나간다', effect: () => '아무 일도 없었다.' } ]
  });

  // --- 스킬 교체 (검술 사범): 다른 캐릭터의 같은 슬롯 스킬로 교체 ---
  pool.push({
    code: 'master', weight: 2, title: '은둔한 사범',
    prepare: (ch) => {
      const keys = roster.KEYS.filter(k => k !== ch.rosterKey && k !== 'ruisun');   // 뤼순 훈련 스킬은 스택 전제라 제외
      const offers = [];
      while (offers.length < 2) {   // 서로 다른 캐릭터에게서 두 가지
        const key = keys[Math.floor(Math.random() * keys.length)];
        if (offers.some(o => o.key === key)) continue;
        const idx = Math.floor(Math.random() * 3);
        const src = roster.template(key);
        offers.push({ key, idx, from: src.name, skill: inherit(src.skill.base[idx], 'base') });
      }
      return { offers, skill: offers[0].skill };
    },
    desc: has('master') && d.offers
      ? '"두 가지를 보여 주마. 하나만 가져가라. 되돌릴 수는 없다."'
      : '늙은 사범이 검을 닦고 있다.',
    html: has('master') && d.offers ? d.offers.map(o => '<b>' + ['가위', '바위', '보'][o.idx] + ' · ' + o.skill.name + '</b> <small>' + o.from + ' · ' + dmgTypeName(o.skill) + ' 계수 ' + o.skill.damage + '</small><br>' + (o.skill.tooltip || '')).join('<hr style="border:0;border-top:1px solid var(--line);margin:8px 0">') : '',
    options: has('master') && d.offers ? d.offers.map(o => ({
      label: '[' + ['가위', '바위', '보'][o.idx] + '] ' + char.skill.base[o.idx].name + ' (' + dmgTypeName(char.skill.base[o.idx]) + ' ' + char.skill.base[o.idx].damage + ') → ' + o.skill.name + ' (' + dmgTypeName(o.skill) + ' ' + o.skill.damage + ')',
      effect: (ch) => { ch.skill.base[o.idx] = JSON.parse(JSON.stringify(o.skill)); return o.skill.name + '을(를) 익혔다.'; }
    })).concat([{ label: '거절한다', effect: () => '사범은 고개를 끄덕이고 눈을 감았다.' }]) : [ { label: '지나간다', effect: () => '아무 일도 없었다.' } ]
  });

  // --- 세부 능력치 영구 상승 (수련장) ---
  const SUBSTAT = [
    { key: 'spRegen', label: 'SP 재생 +1', add: 1 },
    { key: 'spCharge', label: 'SP 충전 +2', add: 2 },
    { key: 'hpRegen', label: '생명력 회복 +2', add: 2 },
    { key: 'crit', label: '치명 +3%p', add: 0.03 },
    { key: 'critDmg', label: '치명 피해 +10%p', add: 0.1 },
    { key: 'evasion', label: '회피 +3%p', add: 0.03 },
    { key: 'hit', label: '명중 +4%p', add: 0.04 },
    { key: 'pierce', label: '관통 +4%p', add: 0.04 },
    { key: 'dmgReduce', label: '피해감소 +3', add: 3 },
  ];
  pool.push({
    code: 'dojo', weight: 2, title: '떠돌이 수련장',
    prepare: () => { const pick = []; while (pick.length < 3) { const x = Math.floor(Math.random() * SUBSTAT.length); if (!pick.includes(x)) pick.push(x); } return { picks: pick }; },
    desc: '낡은 수련장이다. 한 가지만 몸에 익힐 시간이 있다.',
    options: (has('dojo') && d.picks ? d.picks : [0, 1, 2]).map(ix => ({
      label: SUBSTAT[ix].label + ' (영구)',
      effect: (ch) => { ch.base[SUBSTAT[ix].key] = Math.round(((ch.base[SUBSTAT[ix].key] || 0) + SUBSTAT[ix].add) * 1000) / 1000; deps.calcStats(ch); return SUBSTAT[ix].label + '. 몸이 기억한다.'; }
    })).concat([{ label: '지나간다', effect: () => '수련장을 지나쳤다.' }])
  });

  // --- 드라이브 / 스페셜 교체 (다른 캐릭터의 것) ---
  // 고유 버프·스택에 묶인 것은 제외 (옮겨가면 작동하지 않거나, 빼앗기면 본체가 무너짐)
  const BOUND = { ruisun: ['special', 'drive'], lunisha: ['drive', 'special'], aeika: ['drive'], gaius: ['special', 'drive'], seriers: ['special'], gabi: ['drive'], julius: ['drive'] };
  const canSwap = (key, slot) => !(BOUND[key] || []).includes(slot);
  if (['drive', 'special'].some(sl => canSwap(char.rosterKey, sl))) pool.push({   // 바꿀 수 있는 슬롯이 없는 캐릭터에겐 등장하지 않음
    code: 'secret', weight: 1, title: '봉인된 비전서',
    prepare: (ch) => {
      const slots = ['drive', 'special'].filter(sl => canSwap(ch.rosterKey, sl));
      if (!slots.length) return { skill: null };
      const slot = slots[Math.floor(Math.random() * slots.length)];
      const keys = roster.KEYS.filter(k => k !== ch.rosterKey && canSwap(k, slot) && roster.template(k).skill[slot]);
      const key = keys[Math.floor(Math.random() * keys.length)];
      const src = roster.template(key);
      return { key, slot, from: src.name, skill: inherit(src.skill[slot], slot) };
    },
    desc: has('secret') && d.skill
      ? d.from + '의 ' + (d.slot === 'drive' ? '드라이브' : '스페셜') + ' 스킬이 적힌 비전서다. 익히면 지금의 것은 잊는다.'
      : '봉인된 책이 놓여 있다.',
    html: has('secret') && d.skill ? '<b>' + d.skill.name + '</b>' + (d.slot === 'special' ? ' <small>SP ' + d.skill.cost + '</small>' : ' <small>드라이브</small>') + '<br>' + (d.skill.tooltip || '') + (d.skill.flavor ? '<br><span class="tooltipFlavor">' + d.skill.flavor + '</span>' : '') : '',
    options: has('secret') && d.skill ? [
      { label: ((char.skill[d.slot] && char.skill[d.slot].name) || '없음') + ' → ' + d.skill.name, effect: (ch) => { ch.skill[d.slot] = JSON.parse(JSON.stringify(d.skill)); return d.skill.name + '을(를) 익혔다.'; } },
      { label: '덮는다', effect: () => '비전서를 다시 봉인했다.' }
    ] : [ { label: '지나간다', effect: () => '아무 일도 없었다.' } ]
  });

  // --- 증폭 (하위 급수 장비를 현재 급수로) ---
  const SLOTK2 = ['weapon', 'armor', 'subarmor', 'trinket'];
  const lowGear = SLOTK2.map((k, t) => ({ k, t, it: char.items && char.items[k] })).filter(x => x.it && x.it.name && x.it.rank > char.rank);
  if (lowGear.length) pool.push({
    code: 'amplify', weight: 2, title: '영석 증폭로',
    desc: '낡은 증폭로가 아직 돌아간다. 한 점에 담긴 것이라면 급을 끌어올릴 수 있다.',
    options: lowGear.map(x => ({
      label: x.it.rank + '급 ' + x.it.name + ' → ' + char.rank + '급으로 증폭',
      effect: (ch) => { const before = ch.items[x.k].name; amplify(ch.items[x.k], ch.rank); deps.calcStats(ch); return before + '이(가) ' + ch.rank + '급 [ ' + ch.items[x.k].name + ' ] 이 되었다.'; }
    })).concat([{ label: '지나간다', effect: () => '증폭로를 지나쳤다.' }])
  });

  // --- 선택권 (하위 급수 유니크 3개 중 하나, 증폭해서) ---
  pool.push({
    code: 'pick3', weight: 1.5, title: '유물 진열대',
    prepare: (ch) => {
      const low = Math.min(9, ch.rank + 1);
      const pool2 = itemList().filter(x => x && x.rank === low && x.type <= 3 && x.rarity === 4 && !x.runEffect && !/^무형의/.test(x.name));
      const picks = [];
      while (picks.length < 3 && pool2.length) { const c = pool2[Math.floor(Math.random() * pool2.length)]; if (!picks.some(y => y.name === c.name)) picks.push(JSON.parse(JSON.stringify(c))); }
      return { picks };
    },
    desc: has('pick3') && d.picks ? '먼지 쌓인 진열대에 유물 셋이 놓여 있다. 하나만 가져갈 수 있고, 손에 쥐면 지금 급에 맞게 깨어난다.' : '무언가 놓여 있던 진열대다.',
    html: has('pick3') && d.picks ? d.picks.map(x => '<b>' + x.name + '</b> <small>' + x.rank + '급 유니크</small><br>' + (x.effectDesc || '')).join('<hr style="border:0;border-top:1px solid var(--line);margin:8px 0">') : '',
    options: has('pick3') && d.picks ? d.picks.map(x => ({
      label: x.name + ' 을(를) 가져간다',
      effect: (ch) => { const it = amplify(JSON.parse(JSON.stringify(x)), ch.rank); ch.inventory.push(it); return it.name + ' 을(를) 얻었다.'; }
    })).concat([{ label: '지나간다', effect: () => '진열대를 지나쳤다.' }]) : [{ label: '지나간다', effect: () => '아무것도 없었다.' }]
  });

  // --- 장비 변환 (결과는 비공개) ---
  const SLOTK = ['weapon', 'armor', 'subarmor', 'trinket'];
  const equipped = SLOTK.map((k, t) => ({ k, t, it: char.items && char.items[k] })).filter(x => x.it && x.it.name);
  if (equipped.length) pool.push({
    code: 'transmute', weight: 2, title: '형태를 바꾸는 가마',
    desc: '가마에 장비를 넣으면 같은 자리에 쓰는, 전혀 다른 무언가가 되어 나온다. 무엇이 나올지는 꺼내 봐야 안다.',
    options: equipped.map(x => ({
      label: SLOT_NAMES[x.t] + ' — ' + x.it.name + ' 을(를) 넣는다',
      effect: (ch) => {
        const r = Math.random(), rar = r < 0.3 ? 1 : r < 0.65 ? 2 : r < 0.9 ? 4 : 5;   // 언커먼 30 / 레어 35 / 유니크 25 / 에픽 10
        let it = null; for (let n = 0; n < 12 && !(it && it.name && !/^무형의/.test(it.name) && it.name !== x.it.name); n++) it = getItemSafe(ch.rank, rar, x.t);
        if (!it || !it.name) return '가마가 식어 버렸다. 아무 일도 없었다.';
        const before = ch.items[x.k].name; ch.items[x.k] = it; deps.calcStats(ch);
        return before + '이(가) 가마 속에서 녹아내리고… <b>' + it.name + '</b>이(가) 되어 나왔다.';
      }
    })).concat([{ label: '지나간다', effect: () => '가마를 지나쳤다.' }])
  });

  // --- 스킬 효과 발동률 강화 ---
  const chanceTargets = [0, 1, 2].map(i => ({ i, sk: char.skill.base[i] })).filter(x => x.sk && (x.sk.effect || []).some(e => e.chance && e.chance < 1))
    .map(x => ({ slot: 'base', i: x.i, label: ['가위', '바위', '보'][x.i] + ' · ' + x.sk.name, cur: (x.sk.effect || []).filter(e => e.chance && e.chance < 1).map(e => Math.round(e.chance * 100) + '%').join('/') }))
    .concat(char.skill.drive && char.skill.drive.chance && char.skill.drive.chance < 1 ? [{ slot: 'drive', label: '드라이브 · ' + char.skill.drive.name, cur: Math.round(char.skill.drive.chance * 100) + '%' }] : []);
  if (chanceTargets.length) pool.push({
    code: 'omen', weight: 1.5, title: '행운을 비는 석상',
    desc: '석상 앞에 동전을 놓으면, 기술 하나가 조금 더 자주 통하게 된다고 한다.',
    options: chanceTargets.map(ct => ({
      label: ct.label + ' (현재 ' + ct.cur + ' → ×1.3)',
      effect: (ch) => {
        const up = (c) => Math.min(1, Math.round(c * 1.3 * 1000) / 1000);
        if (ct.slot === 'drive') { ch.skill.drive.chance = up(ch.skill.drive.chance); return ch.skill.drive.name + '의 발동률이 ' + Math.round(ch.skill.drive.chance * 100) + '%가 되었다.'; }
        const sk = ch.skill.base[ct.i];
        for (const e of (sk.effect || [])) if (e.chance && e.chance < 1) e.chance = up(e.chance);
        if (sk.tooltip) sk.tooltip = sk.tooltip.replace(/(\d+)\\?% 확률/g, (m, n) => Math.min(100, Math.round(parseInt(n, 10) * 1.3)) + '% 확률');
        return sk.name + '이(가) 더 자주 통하게 되었다.';
      }
    })).concat([{ label: '지나간다', effect: () => '석상을 지나쳤다.' }])
  });

  // --- 스킬 계수 강화 ---
  const honeCost = 40 + 10 * char.run.cycle;
  pool.push({
    code: 'hone', weight: 2, title: '검술 도장', desc: '"기술 하나를 골라라. ' + honeCost + '골드면 한 단계 더 날카롭게 해 주지." (공격 계수 +0.15)',
    html: char.skill.base.map((sk, i) => ['가위', '바위', '보'][i] + ' <b>' + sk.name + '</b> 계수 ' + sk.damage).join('<br>'),
    options: char.skill.base.map((sk, i) => ({
      label: sk.name + ' ' + sk.damage + ' → ' + (Math.round((sk.damage + 0.15) * 100) / 100) + ' (' + honeCost + '골드)',
      effect: (ch) => { if (ch.gold < honeCost) return '골드가 부족하다.'; ch.gold -= honeCost; const t = ch.skill.base[i]; t.damage = Math.round((t.damage + 0.15) * 100) / 100; return t.name + ' 계수가 ' + t.damage + '이 됐다.'; }
    })).concat([{ label: '거절한다', effect: () => '사범은 어깨를 으쓱했다.' }])
  });

  // --- 스킬 아티팩트 ---
  pool.push({
    code: 'relic', weight: 2, title: '유물 상자',
    prepare: (ch) => ({ item: pickArtifact(ch.rank) }),
    desc: has('relic') && d.item
      ? '봉인된 상자 안에서 낯선 유물이 빛난다. 스킬 아티팩트 자리에 장착할 수 있다.' + (char.items && char.items.skillArtifact ? ' 지금 낀 ' + char.items.skillArtifact.name + '은(는) 버려진다.' : '')
      : '봉인된 상자가 있다.',
    html: has('relic') && d.item ? (deps.makeTooltip ? deps.makeTooltip(d.item) : d.item.name) : '',
    options: has('relic') && d.item ? [
      { label: d.item.name + ' 장착', effect: (ch) => { if (!ch.items) ch.items = {}; ch.items.skillArtifact = JSON.parse(JSON.stringify(d.item)); deps.calcStats(ch); return d.item.name + '을(를) 장착했다.'; } },
      { label: '두고 간다', effect: () => '상자를 다시 닫았다.' }
    ] : [ { label: '지나간다', effect: () => '아무 일도 없었다.' } ]
  });

  // --- 정찰 / 적 디버프 ---
  pool.push({
    code: 'scout', weight: 2, title: '망루',
    prepare: (ch) => (ch.run.nextMonster ? { useNext: true } : { enemy: makeEnemy(ch) }),
    desc: has('scout') && (d.enemy || d.useNext) ? '높은 곳에서 다음 상대가 보인다. 준비할 시간이 있다.' : '낡은 망루가 서 있다.',
    html: has('scout') && (d.enemy || (d.useNext && char.run.nextMonster)) ? enemyBrief(d.enemy || char.run.nextMonster) : '',
    options: has('scout') && (d.enemy || d.useNext) ? [
      { label: '약점을 파악한다 (다음 전투 적 체력 −20%)', effect: (ch) => { addBuff(ch, { target: 'enemy', key: 'maxHp', mult: 0.8, battles: 1, label: '적 체력 −20%' }); return '허점을 찾았다. 다음 전투 적 체력 −20%.'; } },
      { label: '기습을 준비한다 (다음 전투 적 공격력 −20%)', effect: (ch) => { addBuff(ch, { target: 'enemy', key: 'atk', mult: 0.8, battles: 1, label: '적 공격력 −20%' }); return '허를 찌를 수 있겠다. 다음 전투 적 공격력 −20%.'; } },
      { label: '그냥 내려간다', effect: () => '정보만 얻고 내려왔다.' }
    ] : [ { label: '지나간다', effect: () => '아무 일도 없었다.' } ]
  });
  pool.push({
    code: 'poison', weight: 2, title: '독 우물', desc: '누군가 우물에 독을 풀어 놓았다. 다음 상대가 이 물을 마실 것이다.',
    options: [
      { label: '독을 진하게 한다 (다음 전투 적 회피 −10%p, 명중 −10%p)', effect: (ch) => { addBuff(ch, { target: 'enemy', key: 'evasion', add: -0.1, battles: 1, label: '적 회피·명중 −10%p' }); addBuff(ch, { target: 'enemy', key: 'hit', add: -0.1, battles: 1, label: '' }); return '다음 상대는 비틀거릴 것이다.'; } },
      { label: '해독제를 판다 (골드 +30)', effect: (ch) => { ch.gold += 30; return '누군가에게 해독제를 팔아 30골드를 받았다.'; } }
    ]
  });

  // ---------- 몬스터 고유 이벤트 (등장률 ≈ 20%) ----------
  const monWeight = () => Math.round(pool.reduce((a, e) => a + (e.weight || 1), 0) * 0.25);
  const h = monsterHelpers();
  const nm = char.run.nextMonster;
  if (nm && monsterPool.isMonsterCycle(char.run.cycle) && monsterEvents.before[nm.monsterKey]) {
    const src = monsterEvents.before[nm.monsterKey];
    pool.push({ code: 'mon_before', weight: monWeight(), title: src.title, desc: src.desc,
      options: src.options.map(o => ({ label: o.label, effect: (ch) => o.effect(ch, ch.run.nextMonster, h) })) });
  }
  const lm = char.run.lastMonster;
  if (lm && !monsterPool.isMonsterCycle(char.run.cycle) && monsterEvents.after[lm.key]) {
    const src = monsterEvents.after[lm.key];
    pool.push({ code: 'mon_after', weight: monWeight(), title: src.title, desc: src.desc,
      options: src.options.map(o => ({ label: o.label, effect: (ch) => o.effect(ch, ch.run.lastMonster, h) })) });   // lastMonster는 다음 홀수 사이클 시작 때 정리
  }

  return pool;
}
// 스킬 아티팩트: 현재 급수 것, 없으면 가까운 급수
function pickArtifact(rank) {
  const list = require('./items').list.filter(x => x && x.type === cons.ITEM_TYPE_SKILL_ARTIFACT);
  let cand = list.filter(x => x.rank === rank);
  if (!cand.length) cand = list.sort((a, b) => Math.abs(a.rank - rank) - Math.abs(b.rank - rank)).filter((x, i, arr) => x.rank === arr[0].rank);
  return cand.length ? JSON.parse(JSON.stringify(cand[Math.floor(Math.random() * cand.length)])) : null;
}
// 몬스터 이벤트용 헬퍼
function monsterHelpers() {
  return {
    T: ['가위', '바위', '보'],
    addBuff, calcStats: (c) => deps.calcStats(c), maxLives,
    // 적 덱에서 카드 n장 제거 (type null이면 무작위). 최소 3장은 남김
    removeCards: (mon, type, n) => { let k = 0; for (let i = 0; i < n; i++) { if (mon.deck.length <= 3) break; const idx = type === null ? Math.floor(Math.random() * mon.deck.length) : mon.deck.findIndex(c => c.type === type); if (idx < 0) break; mon.deck.splice(idx, 1); k++; } return k; },
    gear: (rank, rarity, type) => getItemSafe(rank, rarity, type === undefined ? Math.floor(Math.random() * 4) : type),
    resultCard: (rank, type) => (type === 5 || type === 6)
      ? { type: cons.ITEM_TYPE_RESULT_CARD, resultType: type, rank, name: rank + '급 ' + (type === 5 ? '레어' : '유니크') + ' 장비 리설트 카드', tooltip: type === 5 ? '97% : 레어 장비<br>2% : 유니크 장비<br>1% : 에픽 장비' : '96% : 유니크 장비<br>4% : 에픽 장비' }
      : roster.makeResultCard(rank, type),
    artifact: (rank) => pickArtifact(rank),
    consumable: (code) => code ? consumables.make(code) : consumables.random(),
  };
}
// 아이템 증폭: 급수 기준선 비율만큼 능력치를 올리고 급수 표기도 올린다
const RANK_SCALE = { atk: { 9: 20, 8: 24, 7: 27, 6: 32, 5: 36, 4: 40, 3: 44, 2: 48, 1: 52 }, hp: { 9: 200, 8: 250, 7: 300, 6: 350, 5: 400, 4: 450, 3: 500, 2: 550, 1: 600 } };
function amplify(it, toRank) {
  if (!it || !it.rank || it.rank <= toRank) return it;
  const aM = RANK_SCALE.atk[toRank] / RANK_SCALE.atk[it.rank], hM = RANK_SCALE.hp[toRank] / RANK_SCALE.hp[it.rank];
  const ATK = ['phyAtkMin', 'phyAtkMax', 'magAtkMin', 'magAtkMax', 'phyAtk', 'magAtk'], HP = ['maxHp', 'hpRegen', 'dmgReduce'];
  for (const k in it.stat) {
    if (ATK.includes(k)) it.stat[k] = Math.round(it.stat[k] * aM * 10) / 10;
    else if (HP.includes(k)) it.stat[k] = Math.round(it.stat[k] * hM * 10) / 10;
  }
  it.rank = toRank;
  if (!/^증폭된 /.test(it.name)) it.name = '증폭된 ' + it.name;
  it.amplified = true;
  return it;
}
// 전수: 다른 캐릭터의 스킬을 넘겨받을 때의 보정 (고유 연계를 잃는 대신)
function inherit(skill, slot) {
  const sk = JSON.parse(JSON.stringify(skill));
  sk.name = '[전수] ' + sk.name;
  if (slot === 'base' && sk.damage) { sk.damage = Math.round(sk.damage * 1.2 * 100) / 100; sk.tooltip = (sk.tooltip || '') + '<br><br><span class="colorGold">전수 : 계수 +20%</span>'; }
  if (slot === 'drive') { if (sk.chance) sk.chance = Math.min(1, Math.round(sk.chance * 1.5 * 1000) / 1000); sk.tooltip = (sk.tooltip || '') + '<br><br><span class="colorGold">전수 : 발동률 ×1.5 (최대 100%)</span>'; }
  if (slot === 'special' && sk.cost) { sk.cost = Math.round(sk.cost * 0.8); sk.tooltip = (sk.tooltip || '') + '<br><br><span class="colorGold">전수 : SP 비용 -20%</span>'; }
  return sk;
}
// 스킬의 피해 타입 표기
function dmgTypeName(sk) {
  if (!sk) return '';
  return ({ [cons.DAMAGE_TYPE_PHYSICAL]: '물리', [cons.DAMAGE_TYPE_MAGICAL]: '마법', [cons.DAMAGE_TYPE_PHYSICAL_FIXED]: '물리 고정', [cons.DAMAGE_TYPE_MAGICAL_FIXED]: '마법 고정', [cons.DAMAGE_TYPE_ABSOLUTE]: '절대' })[sk.type] || '';
}
// 정찰용 적 요약
function enemyBrief(e) {
  const cnt = deckCounts ? [0, 1, 2].map(t => e.deck.filter(c => c.type === t).length) : [0, 0, 0];
  return '<b>' + e.name + '</b> <small>' + (e.title || '') + (e.isBoss ? ' · 보스' : '') + '</small>'
    + '<br>체력 ' + Math.round(e.stat.maxHp) + ' / 물리 ' + Math.round(e.stat.phyAtk) + ' / 마법 ' + Math.round(e.stat.magAtk)
    + '<br>덱: 가위 ' + cnt[0] + ' · 바위 ' + cnt[1] + ' · 보 ' + cnt[2] + ' (' + ['가위', '바위', '보'][e.favType] + ' 선호)'
    + '<br>기술: ' + e.skill.base.map(s => s.name).join(' / ');
}
// 일시 버프: char.run.buffs = [{ key, mult|add, battles, label }]
function addBuff(ch, b) { if (!ch.run.buffs) ch.run.buffs = []; ch.run.buffs.push(b); }
// 전투용 복사본에 버프 반영 (base에 적용 후 호출측에서 calcStats)
function applyBuffs(copy) {
  const buffs = ((copy.run && copy.run.buffs) || []).filter(b => b.target !== 'enemy');
  return applyStatMods(copy, buffs);
}
// 적에게 걸린 디버프(target: 'enemy') 반영. 반환값: 적용 여부
function applyEnemyDebuffs(char, enemy) {
  const buffs = ((char.run && char.run.buffs) || []).filter(b => b.target === 'enemy');
  return applyStatMods(enemy, buffs);
}
function applyStatMods(copy, buffs) {
  for (const b of buffs) {
    const keys = b.key === 'atk' ? ['phyAtk', 'magAtk'] : (b.key === 'all' ? ['maxHp', 'phyAtk', 'magAtk'] : [b.key]);
    for (const k of keys) {
      if (copy.base[k] === undefined) copy.base[k] = 0;
      if (b.mult) copy.base[k] = Math.round(copy.base[k] * b.mult * 100) / 100;
      if (b.add) copy.base[k] += b.add;
    }
  }
  return buffs.length > 0;
}
// 전투 하나 소화 후 버프 수명 감소
function tickBuffs(ch) {
  if (!ch.run.buffs) return;
  ch.run.buffs = ch.run.buffs.map(b => Object.assign({}, b, { battles: b.battles - 1 })).filter(b => b.battles > 0);
}
// 가중치 랜덤. 직전 이벤트는 제외
function pickWeighted(pool, excludeCode) {
  const cands = pool.filter(e => e.code !== excludeCode && (e.prepare || e.options.length > 1));
  const total = cands.reduce((a, e) => a + (e.weight || 1), 0);
  let r = Math.random() * total;
  for (const e of cands) { r -= (e.weight || 1); if (r <= 0) return e; }
  return cands[cands.length - 1];
}
function makeEvent(char) {
  const ev = pickWeighted(eventPool(char), char.run.lastEvent);
  char.run.lastEvent = ev.code;
  // 무작위 요소가 미리 보여야 하는 이벤트는 prepare로 데이터를 고정해 char.run.evData에 저장
  if (ev.prepare) { char.run.evData = Object.assign({ code: ev.code }, ev.prepare(char)); return makeEventByCode(char, ev.code); }
  char.run.evData = null;
  return ev;
}
function makeEventByCode(char, code) {
  return eventPool(char).find(x => x.code === code) || null;
}
// 이벤트 옵션은 함수를 포함하므로 세션에는 code/선택 인덱스만 저장, 실행 시 재생성
function applyEvent(char, code, optIdx) {
  const ev = makeEventByCode(char, code);
  if (!ev || !ev.options[optIdx]) return null;
  const o = ev.options[optIdx];
  const goldBefore = char.gold;
  const r = o.effect(char, o.arg);
  if (runEffect(char, 'luckyCoin') && char.gold > goldBefore) char.gold += (char.gold - goldBefore);   // 행운의 동전: 이벤트 골드 2배
  return r;
}

module.exports = { ASC_MAX, ASC_RULES, ascOf, shuffleDeck, amplify, jumpFloor, pickArtifact,
  configure, TOTAL_CYCLES, HAND_SIZE, RESETS_PER_BATTLE, resetDeck, redrawHand, drawExtra, runEffect, maxLives, initRun, stage, stageLabel, floorNo, isBossCycle, rankForCycle, advance,
  newDeckState, drawHand, playCard, handTypes, deckCounts, aiPick, makeEnemy, enemyFromFallen, snapshotForFallen,
  makeMonster, makeRosterEnemy, makeShop, makeShopOffers, makeEvent, makeEventByCode, applyEvent, applyBuffs, applyEnemyDebuffs, tickBuffs
};
