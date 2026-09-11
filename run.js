// 층 진행(로그라이크 런) 모듈
// 사이클 = 이벤트 → 상점 → 전투. 10사이클, 보스는 3·6·10사이클 전투.
const cons = require('./constant');
const roster = require('./roster');
const monsterPool = require('./monsterPool');

const TOTAL_CYCLES = 10;
const BOSS_CYCLES = [3, 6, 10];
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
function initRun(char) {
  char.run = { cycle: 1, stageIdx: 0, floor: 1, lives: 1 };   // lives = 남은 재도전 횟수
  char.gold = 80;
  return char;
}
function stage(char) { return STAGES[char.run.stageIdx]; }
function floorNo(char) { return (char.run.cycle - 1) * 3 + char.run.stageIdx + 1; }
function isBossCycle(cycle) { return BOSS_CYCLES.includes(cycle); }
// 급수는 2사이클마다 1씩 오름. 레어 이상 장비가 6급까지만 존재하므로 6급에서 멈춤
// 1사이클 9급, 2~3 8급, 4~5 7급, 6~ 6급
function rankForCycle(cycle) { return Math.max(6, 9 - Math.ceil((cycle - 1) / 2)); }
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
function newDeckState(deck, opts) {
  return { draw: shuffle(deck.map(c => Object.assign({}, c))), hand: [], discard: [], everyTurn: !!(opts && opts.shuffleEveryTurn) };
}
// 손패를 3장까지 보충. 뽑을 카드가 없을 때는 손패가 비어 있어야만 버림 더미를 셔플
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
const RARITY_BY_CYCLE = [1, 1, 1, 2, 2, 2, 4, 4, 4, 5]; // 언커먼 → 레어 → 유니크 → 에픽

function makeEnemy(char) {
  if (monsterPool.isMonsterCycle(char.run.cycle)) return makeMonster(char);
  return makeRosterEnemy(char);
}
// 장비/스탯 포인트 공통 (플레이어와 같은 환산)
function equipAndScale(e, cycle, boss) {
  let rarity = RARITY_BY_CYCLE[Math.min(cycle, 10) - 1];
  if (boss && rarity < 5) rarity = rarity === 1 ? 2 : (rarity === 2 ? 4 : 5);
  e.items = {};
  for (let t = 0; t <= 3; t++) {
    const it = getItemSafe(e.rank, rarity, t); if (it) e.items[['weapon', 'armor', 'subarmor', 'trinket'][t]] = it;
  }
  e.inventory = [];
  const pts = 3 * cycle + (boss ? 3 : 0);
  const magical = e.skill.base.filter(s => s.type === cons.DAMAGE_TYPE_MAGICAL).length >= 2;
  const hpPts = Math.round(pts / 3);
  e.base.maxHp += 10 * hpPts;
  e.base[magical ? 'magAtk' : 'phyAtk'] += 1.5 * (pts - hpPts);
  if (boss) e.base.maxHp = Math.round(e.base.maxHp * 1.15);
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
  // 레이드용 저항/명중은 로그라이크 스케일에 맞게 상한
  for (const k of ['phyReduce', 'magReduce']) e.base[k] = Math.min(e.base[k] || 0, 0.1);
  e.base.dmgReduce = 0; e.base.hit = Math.min(e.base.hit || 1, 1.05);
  // 레이드용 고유 버프(코드 90000+)를 100% 확률로 거는 스킬 효과는 발동 확률을 낮춰 정규화
  for (const sk of e.skill.base) for (const ef of (sk.effect || [])) {
    const bc = ef.buffCode; const raid = Array.isArray(bc) ? bc.some(x => x >= 90000) : bc >= 90000;
    if (raid && ef.chance === undefined) ef.chance = 0.35;
  }
  if (cfg.skill0) Object.assign(e.skill.base[0], cfg.skill0);
  if (cfg.tune) cfg.tune(e);   // base 조정은 여기서 (장비/스탯 포인트 반영 전)
  equipAndScale(e, cycle, boss);
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

  equipAndScale(e, cycle, boss);

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
const SHOP_INFO = {
  gear:       { label: '장비 상인',        blurb: '슬롯 무작위 레어 이상 장비 4개' },
  gearSlot:   { label: '전문 장비 상인',   blurb: '한 슬롯의 레어 이상 장비 4개' },
  stone:      { label: '요일석 상인',      blurb: '무작위 요일석 4개' },
  card:       { label: '카드 상인',        blurb: '가위·바위·보 카드 각 1장' },
  result:     { label: '리설트 카드 상인', blurb: '슬롯별 리설트 카드 4장' },
  resultRare: { label: '고급 리설트 카드 상인', blurb: '레어·유니크 확정 리설트 카드' },
  alchemist:  { label: '연금술사',         blurb: '스탯 포인트, 재도전(♥) 회복' },
  junk:       { label: '고물상',           blurb: '싸구려 장비 4개 (해체용)' },
};
const SHOP_TYPES = Object.keys(SHOP_INFO);
const SLOT_NAMES = ['무기', '방어구', '보조방어구', '장신구'];
// 상점 후보 2곳 (서로 다른 종류)
function makeShopOffers(char) {
  const a = SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)];
  let b; do { b = SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)]; } while (b === a);
  return [a, b].map(t => ({ type: t, label: SHOP_INFO[t].label, blurb: SHOP_INFO[t].blurb }));
}
function makeShop(char, typeIn) {
  const type = typeIn || SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)];
  const cycle = char.run.cycle;
  const goods = [];
  let label = SHOP_INFO[type].label;
  const rarityPool = cycle < 4 ? [2, 2, 2, 4] : (cycle < 7 ? [2, 2, 4, 4] : [2, 4, 4, 5]);
  const gearPrice = (it) => 40 + [0, 15, 35, 0, 70, 120][it.rarity] + 5 * cycle;
  if (type === 'gear' || type === 'gearSlot') {
    const fixed = type === 'gearSlot' ? Math.floor(Math.random() * 4) : -1;
    if (fixed >= 0) label = SLOT_NAMES[fixed] + ' 상인';
    for (let i = 0; i < 4; i++) {
      const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
      const t = fixed >= 0 ? fixed : Math.floor(Math.random() * 4);
      const it = getItemSafe(char.rank, rarity, t);
      if (it) goods.push({ kind: 'item', item: it, price: gearPrice(it) });
    }
  } else if (type === 'stone') {
    for (let i = 0; i < 4; i++) {
      const day = Math.floor(Math.random() * 7);
      const st = deps.makeDayStone(day, char.rank);
      goods.push({ kind: 'item', item: st, price: 30 + 10 * (st.level || 0) + 3 * cycle });
    }
  } else if (type === 'card') {
    for (let t = 0; t < 3; t++) goods.push({ kind: 'card', card: { type: t }, price: 45 + 5 * cycle });
  } else if (type === 'result') {
    for (let t = 0; t < 4; t++) goods.push({ kind: 'item', item: roster.makeResultCard(char.rank, t), price: 50 + 5 * cycle });
  } else if (type === 'resultRare') {
    // 레어 확정(97/2/1) 2장, 유니크 확정(96/4) 1장, 일반 슬롯 카드 1장
    const rare = () => ({ type: cons.ITEM_TYPE_RESULT_CARD, resultType: 5, rank: char.rank, name: char.rank + '급 레어 장비 리설트 카드', tooltip: '97% : 레어 장비<br>2% : 유니크 장비<br>1% : 에픽 장비' });
    const uniq = () => ({ type: cons.ITEM_TYPE_RESULT_CARD, resultType: 6, rank: char.rank, name: char.rank + '급 유니크 장비 리설트 카드', tooltip: '96% : 유니크 장비<br>4% : 에픽 장비' });
    goods.push({ kind: 'item', item: rare(), price: 75 + 6 * cycle });
    goods.push({ kind: 'item', item: rare(), price: 75 + 6 * cycle });
    goods.push({ kind: 'item', item: uniq(), price: 150 + 10 * cycle });
    goods.push({ kind: 'item', item: roster.makeResultCard(char.rank, Math.floor(Math.random() * 4)), price: 50 + 5 * cycle });
  } else if (type === 'alchemist') {
    goods.push({ kind: 'stat', value: 2, name: '스탯 포인트 +2', price: 60 + 8 * cycle });
    goods.push({ kind: 'stat', value: 2, name: '스탯 포인트 +2', price: 60 + 8 * cycle });
    goods.push({ kind: 'life', name: '재도전 +1 (최대 3)', price: 70 + 10 * cycle });
  } else if (type === 'junk') {
    for (let i = 0; i < 4; i++) {
      const rarity = [0, 1, 1, 2][Math.floor(Math.random() * 4)];
      const it = getItemSafe(char.rank, rarity, Math.floor(Math.random() * 4));
      if (it) goods.push({ kind: 'item', item: it, price: 12 + [0, 4, 10][rarity] + 2 * cycle });
    }
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
    code: 'medic', weight: lives < 2 ? 3 : 1, title: '떠돌이 의사', desc: '"한 번 더 일어설 힘을 팔지. ' + medicCost + '골드야." (재도전 최대 3)',
    options: [
      { label: '치료받는다 (' + medicCost + '골드, 재도전 +1)', effect: (ch) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= 3) return '더는 받을 수 없다.'; if (ch.gold < medicCost) return '골드가 부족하다.'; ch.gold -= medicCost; ch.run.lives = l + 1; return '재도전 +1. 현재 ' + ch.run.lives + '회.'; } },
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
      const keys = roster.KEYS.filter(k => k !== ch.rosterKey);
      const key = keys[Math.floor(Math.random() * keys.length)];
      const idx = Math.floor(Math.random() * 3);
      const src = roster.template(key);
      return { key, idx, from: src.name, skill: JSON.parse(JSON.stringify(src.skill.base[idx])) };
    },
    desc: has('master') && d.skill
      ? '"' + d.from + '에게 배운 기술이다. 네 ' + ['가위', '바위', '보'][d.idx] + ' 기술과 바꿔 주마. 되돌릴 수는 없다."'
      : '늙은 사범이 검을 닦고 있다.',
    html: has('master') && d.skill ? '<b>' + d.skill.name + '</b> <small>계수 ' + d.skill.damage + '</small><br>' + (d.skill.tooltip || '') + (d.skill.flavor ? '<br><span class="tooltipFlavor">' + d.skill.flavor + '</span>' : '') : '',
    options: has('master') && d.skill ? [
      { label: char.skill.base[d.idx].name + ' (' + char.skill.base[d.idx].damage + ') → ' + d.skill.name + ' (' + d.skill.damage + ')', effect: (ch) => { ch.skill.base[d.idx] = JSON.parse(JSON.stringify(d.skill)); return d.skill.name + '을(를) 익혔다.'; } },
      { label: '거절한다', effect: () => '사범은 고개를 끄덕이고 눈을 감았다.' }
    ] : [ { label: '지나간다', effect: () => '아무 일도 없었다.' } ]
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
    prepare: (ch) => ({ enemy: makeEnemy(ch) }),
    desc: has('scout') && d.enemy ? '높은 곳에서 다음 상대가 보인다. 준비할 시간이 있다.' : '낡은 망루가 서 있다.',
    html: has('scout') && d.enemy ? enemyBrief(d.enemy) : '',
    options: has('scout') && d.enemy ? [
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

  return pool;
}
// 스킬 아티팩트: 현재 급수 것, 없으면 가까운 급수
function pickArtifact(rank) {
  const list = require('./items').list.filter(x => x && x.type === cons.ITEM_TYPE_SKILL_ARTIFACT);
  let cand = list.filter(x => x.rank === rank);
  if (!cand.length) cand = list.sort((a, b) => Math.abs(a.rank - rank) - Math.abs(b.rank - rank)).filter((x, i, arr) => x.rank === arr[0].rank);
  return cand.length ? JSON.parse(JSON.stringify(cand[Math.floor(Math.random() * cand.length)])) : null;
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
  return o.effect(char, o.arg);
}

module.exports = {
  configure, TOTAL_CYCLES, HAND_SIZE, RESETS_PER_BATTLE, resetDeck, initRun, stage, stageLabel, floorNo, isBossCycle, rankForCycle, advance,
  newDeckState, drawHand, playCard, handTypes, deckCounts, aiPick, makeEnemy, enemyFromFallen, snapshotForFallen,
  makeMonster, makeRosterEnemy, makeShop, makeShopOffers, makeEvent, makeEventByCode, applyEvent, applyBuffs, applyEnemyDebuffs, tickBuffs
};
