// 층 진행(로그라이크 런) 모듈
// 사이클 = 상점 → 이벤트 → 전투. 10사이클, 보스는 3·6·10사이클 전투.
const cons = require('./constant');
const roster = require('./roster');

const TOTAL_CYCLES = 10;
const BOSS_CYCLES = [3, 6, 10];
const STAGES = ['shop', 'event', 'battle'];
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
function initRun(char) {
  char.run = { cycle: 1, stageIdx: 0, floor: 1, lives: 1 };   // lives = 남은 재도전 횟수
  char.gold = 80;
  return char;
}
function stage(char) { return STAGES[char.run.stageIdx]; }
function floorNo(char) { return (char.run.cycle - 1) * 3 + char.run.stageIdx + 1; }
function isBossCycle(cycle) { return BOSS_CYCLES.includes(cycle); }
// 급수는 2사이클마다 1씩 오름. 레어 이상 장비가 6급까지만 존재하므로 6급에서 멈춤
function rankForCycle(cycle) { return Math.max(6, 9 - Math.floor((cycle - 1) / 2)); }
function stageLabel(char) { return ({ shop: '상점', event: '이벤트', battle: isBossCycle(char.run.cycle) ? '보스 전투' : '전투' })[stage(char)]; }

// 스테이지 하나 소화 후 호출. 사이클이 끝나면 레벨/급수 반영. 마지막 사이클 전투까지 끝났으면 true(클리어)
function advance(char) {
  char.run.stageIdx++;
  if (char.run.stageIdx >= STAGES.length) {
    char.run.stageIdx = 0;
    char.run.cycle++;
    if (char.run.cycle > TOTAL_CYCLES) return true;
    char.level = char.run.cycle;
    char.rank = rankForCycle(char.run.cycle);
  }
  char.run.floor = floorNo(char);
  return false;
}

// ---------- 덱 ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function newDeckState(deck) {
  return { draw: shuffle(deck.map(c => Object.assign({}, c))), hand: [], discard: [] };
}
// 손패를 3장까지 보충. 뽑을 카드가 없을 때는 손패가 비어 있어야만 버림 더미를 셔플
function drawHand(st) {
  while (st.hand.length < HAND_SIZE) {
    if (st.draw.length === 0) {
      if (st.hand.length > 0 || st.discard.length === 0) break;
      st.draw = shuffle(st.discard); st.discard = [];
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
function handTypes(st) { return st.hand.map(c => c.type); }

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
const RARITY_BY_CYCLE = [1, 1, 1, 2, 2, 2, 4, 4, 4, 5]; // 언커먼 → 레어 → 유니크 → 에픽

function makeEnemy(char) {
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

  // 장비: 사이클에 맞는 레어리티
  let rarity = RARITY_BY_CYCLE[Math.min(cycle, 10) - 1];
  if (boss && rarity < 5) rarity = rarity === 1 ? 2 : (rarity === 2 ? 4 : 5);
  e.items = {};
  for (let t = 0; t <= 3; t++) {
    const it = getItemSafe(e.rank, rarity, t); if (it) e.items[['weapon', 'armor', 'subarmor', 'trinket'][t]] = it;
  }
  e.inventory = [];

  // 스탯 포인트: 플레이어와 같은 총량(3 × 사이클)을 주력 공격 타입에 몰아줌
  // 플레이어 스탯 포인트와 같은 환산 (체력 +10 / 공격 +1.5 per point)
  const pts = 3 * cycle + (boss ? 3 : 0);
  const magical = e.skill.base.filter(s => s.type === cons.DAMAGE_TYPE_MAGICAL).length >= 2;
  const hpPts = Math.round(pts / 3);
  e.base.maxHp += 10 * hpPts;
  e.base[magical ? 'magAtk' : 'phyAtk'] += 1.5 * (pts - hpPts);
  if (boss) { e.base.maxHp = Math.round(e.base.maxHp * 1.15); }
  deps.calcStats(e);

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
const SHOP_TYPES = ['gear', 'stone', 'card'];
function makeShop(char) {
  const type = SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)];
  const cycle = char.run.cycle;
  const goods = [];
  if (type === 'gear') {
    // 레어 이상만 판매
    const rarityPool = cycle < 4 ? [2, 2, 2, 4] : (cycle < 7 ? [2, 2, 4, 4] : [2, 4, 4, 5]);
    for (let i = 0; i < 4; i++) {
      const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
      const t = Math.floor(Math.random() * 4);
      const it = getItemSafe(char.rank, rarity, t);
      if (it) goods.push({ kind: 'item', item: it, price: 40 + [0, 15, 35, 0, 70, 120][it.rarity] + 5 * cycle });
    }
  } else if (type === 'stone') {
    for (let i = 0; i < 4; i++) {
      const day = Math.floor(Math.random() * 7);
      const st = deps.makeDayStone(day, char.rank);
      goods.push({ kind: 'item', item: st, price: 30 + 10 * (st.level || 0) + 3 * cycle });
    }
  } else {
    // 카드 상점: 가위/바위/보 카드 추가 (스킬은 캐릭터 고정)
    for (let t = 0; t < 3; t++) goods.push({ kind: 'card', card: { type: t }, price: 45 + 5 * cycle });
  }
  return { type, label: ({ gear: '장비 상인', stone: '요일석 상인', card: '카드 상인' })[type], goods, bought: [] };
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
    code: 'altar', weight: 3, title: '낡은 제단', desc: '제단에 카드 한 장을 바치면 덱이 가벼워진다.',
    options: [0, 1, 2].filter(t => char.deck.some(c => c.type === t)).map(t => ({
      label: T[t] + ' 카드 1장 제거', arg: t,
      effect: (ch, arg) => { const i = ch.deck.findIndex(c => c.type === arg); if (i !== -1) ch.deck.splice(i, 1); return T[arg] + ' 카드를 바쳤다. 덱 ' + ch.deck.length + '장.'; }
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

  // --- 장비 / 요일석 / 리설트 카드 이벤트 ---
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
      { label: '촛불에 손을 댄다 (요일석)', effect: (ch) => { const st = deps.makeDayStone(null, ch.rank); ch.inventory.push(st); return st.name + '을(를) 얻었다.'; } },
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

  return pool;
}
// 가중치 랜덤. 직전 이벤트는 제외
function pickWeighted(pool, excludeCode) {
  const cands = pool.filter(e => e.code !== excludeCode && e.options.length > 1);
  const total = cands.reduce((a, e) => a + (e.weight || 1), 0);
  let r = Math.random() * total;
  for (const e of cands) { r -= (e.weight || 1); if (r <= 0) return e; }
  return cands[cands.length - 1];
}
function makeEvent(char) {
  const ev = pickWeighted(eventPool(char), char.run.lastEvent);
  char.run.lastEvent = ev.code;
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
  return o.effect(char, o.arg);
}

module.exports = {
  configure, TOTAL_CYCLES, HAND_SIZE, initRun, stage, stageLabel, floorNo, isBossCycle, rankForCycle, advance,
  newDeckState, drawHand, playCard, handTypes, deckCounts, aiPick, makeEnemy, enemyFromFallen, snapshotForFallen,
  makeShop, makeEvent, makeEventByCode, applyEvent
};
