// 계정 업적 (로그라이크). 계정(users.achievements)에 저장되어 런이 끝나도 남는다.
// hidden: 달성 전엔 이름·조건이 가려진다.

const CHAR_CLEAR = {
  seriers: '광차원의 끝', gaius: '일월이 겹치는 날', kines: '혼돈의 끝에서', julius: '중단점 없는 여정',
  psi: '흐트러지지 않은 의식', aeika: '재구축 완료', ruisun: '대군의 행진', aeohelm: '그림자는 정상에 닿는다',
  dekaitz: '버스트 캐논, 최대 출력', bks: '드디어 취업', lunisha: '진형은 무너지지 않는다', illun: '끝까지 증폭',
  nux: '해킹 완료', lozic: '논리적 결론', kasien: '보따리 속의 정상', marang: '마지막 한 방울',
  gabi: '달을 삼킨 아이', jay: '앙코르는 정상에서', senal: '숲이 닿은 정상',
};

// 몬스터 테마 (현재 풀 기준)
const THEMES = {
  mobius:   { name: '메비우스 섬멸', desc: '메비우스 계열 몬스터를 모두 격파', keys: ['mCrawler', 'mHeadHunter', 'mMassCrawler', 'mDestoryer', 'mTaurus', 'mMegaTaurus'] },
  ash:      { name: '재의 묘소 정리', desc: '재의 묘소 몬스터를 모두 격파', keys: ['eGunda', 'eBroken', 'eCrossbow'] },
  orchard:  { name: '불 꺼진 과수원', desc: '불타는 과수원 몬스터를 모두 격파', keys: ['oFlame', 'oEleLord', 'oStoneist', 'oDeathKnight', 'oLegor'] },
  knights:  { name: '검은 빛의 수련 종료', desc: '기사단 몬스터를 모두 격파', keys: ['d7Knight', 'd7EliteKnight', 'd7Lohengrin'] },
  rift:     { name: '어긋난 시간 봉합', desc: '지옥불정령 무리와 시간의 폭풍을 모두 격파', keys: ['rInfernal', 'rTimeStorm'] },
  moon:     { name: '달이 저문 밤', desc: '달빛 계열 몬스터를 모두 격파', keys: ['mGatekeeper', 'mLibei', 'mFrena', 'mCouncil', 'mNeon', 'mIZ'] },
  ruin:     { name: '파멸을 막은 자', desc: '파멸의 사도 둘과 파멸자를 모두 격파', keys: ['rsInzeal', 'rsNagpa', 'rsDeci'] },
  quartz:   { name: '석영 리그 제패', desc: '사천왕 넷과 레드를 모두 격파', keys: ['d721', 'd722', 'd723', 'd724', 'd725'] },
};

const LIST = [];
function add(id, cat, name, desc, hidden) { LIST.push({ id, cat, name, desc, hidden: !!hidden }); }

// 1. 진행
add('first_win', '진행', '첫 발걸음', '첫 전투 승리');
add('cyc3', '진행', '달빛이 비치는 층', '3사이클 도달');
add('cyc8', '진행', '절반의 탑', '8사이클 도달');
add('cyc11', '진행', '사천왕의 문턱', '11사이클 도달');
add('cyc15', '진행', '마지막 계단', '15사이클 도달');
add('clear1', '진행', '탑의 정복자', '탑 정복');
add('clear3', '진행', '다시, 정상으로', '탑 정복 3회');
add('clear10', '진행', '익숙한 길', '탑 정복 10회');
add('win100', '진행', '끝없는 등반', '누적 전투 승리 100회');
add('win500', '진행', '수백 번의 층', '누적 전투 승리 500회');
// 2. 캐릭터
const rosterMod = require('./roster');
// '로/으로' 조사: 받침 없음·ㄹ 받침이면 '로'
function ro(word) { const c = word.charCodeAt(word.length - 1) - 0xAC00; if (c < 0 || c > 11171) return '로'; const jong = c % 28; return (jong === 0 || jong === 8) ? '로' : '으로'; }
for (const k in CHAR_CLEAR) { const t = rosterMod.template(k); const nm = t ? t.name : k; add('char_' + k, '캐릭터', CHAR_CLEAR[k], nm + ro(nm) + ' 탑 정복'); }
add('unlock5', '캐릭터', '새로운 얼굴', '캐릭터 5명 해금');
add('unlockAll', '캐릭터', '모두가 모인 자리', '모든 캐릭터 해금');
add('multi5', '캐릭터', '여러 개의 정상', '서로 다른 캐릭터 5명으로 정복');
add('multiAll', '캐릭터', '모든 이름으로', '모든 캐릭터로 정복');
// 3. 보스·테마
add('boss_red', '보스', '새로운 정점', '레드 격파');
add('boss_neon', '보스', '고장 난 공방', '달빛의 공학자 네온 격파');
add('boss_iz', '보스', '정화된 달빛', '달빛의 타락자 iZ 격파');
add('boss_council', '보스', '의회 해산', '달빛 의회 격파');
add('boss_deci', '보스', '파멸의 끝', '파멸자 데시메이트 격파');
add('boss_vyres', '보스', '쌍검을 꺾다', '엘바스의 쌍검사 바이레스 격파');
add('boss_both', '보스', '두 개의 끝', '데시메이트와 바이레스 모두 격파');
for (const t in THEMES) add('theme_' + t, '보스', THEMES[t].name, THEMES[t].desc);
add('hunt20', '보스', '사냥꾼의 기록', '서로 다른 몬스터 20종 격파');
// 4. 수집
add('epic1', '수집', '첫 에픽', '에픽 장비 획득');
add('epic25', '수집', '빛나는 창고', '에픽 장비 누적 25개');
add('epic100', '수집', '보물고', '에픽 장비 누적 100개');
add('art10', '수집', '유물 수집가', '서로 다른 스킬 아티팩트 10종 획득');
add('set_titan', '수집', '울두아르의 계승자', '[티탄 수호자] 4중첩');
add('set_god', '수집', '속삭임에 귀 기울인 자', '[고대 신의 타락] 4중첩');
add('set_city', '수집', '도시 계획가', '[도시 태그] 15중첩');
add('set_sci', '수집', '연구단장', '[과학 태그] 10중첩');
add('set_predator', '수집', '먹이사슬의 정점', '[포식] 10중첩');
add('chogall', '수집', '두 머리가 하나로', '초갈 연계로 낙인 2배 피해');
add('collector5', '수집', '수집가의 단골', '수집가 상점에서 5회 구매');
// 5. 숨김 — 도전
add('no_undo', '도전', '무르기는 없다', '무르기를 한 번도 쓰지 않고 정복', true);
add('no_life', '도전', '한 번에', '재도전을 한 번도 쓰지 않고 정복', true);
add('no_item', '도전', '맨손의 등반', '소모품을 한 번도 쓰지 않고 정복', true);
add('deck_small', '도전', '가벼운 짐', '덱 6장 이하로 정복', true);
add('deck_big', '도전', '무거운 짐', '덱 16장 이상으로 정복', true);
add('pure', '도전', '순수한 선택', '이벤트에서 지나간다·거절한다만 고르고 11사이클 도달', true);
add('onehit', '도전', '한 방', '한 번의 공격으로 1000 이상 피해', true);
add('thread', '도전', '실낱같은', '생명력 1% 이하로 전투 승리', true);
add('flawless', '도전', '무결점', '피해를 한 번도 받지 않고 보스 격파', true);
add('quick', '도전', '번개 같은', '3턴 안에 전투 승리', true);
add('marathon', '도전', '끝없는 전투', '30턴 이상 걸린 전투에서 승리', true);
add('rich', '도전', '부자의 등반', '골드 1000 보유', true);
// 6. 숨김 — 재미
add('taurus3', '재미', '왜 나한테만 이래?', '한 번의 모험에서 타우러스 계열을 3번 만남', true);
add('ruby_down', '재미', '공평한 생명', '생명의 어머니의 루비로 생명력이 줄어듦', true);
add('tectus3', '재미', '조각조각', '텍터스의 조각으로 세 번 부활', true);
add('hourglass', '재미', '모래시계 너머', '청동의 모래시계로 넘긴 시간 동안 적이 쓰러짐', true);
add('hyper_back', '재미', '다른 층으로', '하이퍼루프로 아래층으로 이동', true);
add('mark_death', '재미', '자기 무덤', '달빛의 징표 피해로 쓰러짐', true);
add('last_seat', '재미', '마지막 의석', '달빛 의회를 한 종류 카드만 남기고 격파', true);
add('pierrot', '재미', '맛있게먹어', '삐에로의 맛있게먹어를 마심', true);
add('abandon', '재미', '스스로 접은 날개', '모험을 포기함', true);
add('devil3', '재미', '불공평한 거래', '악마의 거래 3번', true);

const BY_ID = {}; for (const a of LIST) BY_ID[a.id] = a;

// 전투 결과에서 판정 (ctx: { char, enemy, L, won, log, stats, unlockedCount })
function onBattle(ctx) {
  const g = []; const { char, enemy, L, won, log, stats } = ctx;
  const txt = (log || '').replace(/<[^>]+>/g, '');
  if (won) {
    g.push('first_win');
    if (stats.wins >= 100) g.push('win100');
    if (stats.wins >= 500) g.push('win500');
    const mk = enemy.monsterKey;
    if (mk === 'd725') g.push('boss_red');
    if (mk === 'mNeon') g.push('boss_neon');
    if (mk === 'mIZ') g.push('boss_iz');
    if (mk === 'mCouncil') { g.push('boss_council'); if (new Set((enemy.deck || []).map(c => c.type)).size === 1) g.push('last_seat'); }
    if (mk === 'rsDeci') g.push('boss_deci');
    if (mk === 'rsVyres') g.push('boss_vyres');
    const killed = new Set(stats.killed || []);
    if (killed.has('rsDeci') && killed.has('rsVyres')) g.push('boss_both');
    for (const t in THEMES) if (THEMES[t].keys.every(k => killed.has(k))) g.push('theme_' + t);
    if (killed.size >= 20) g.push('hunt20');
    if ((L.maxDamageDone || 0) >= 1000) g.push('onehit');
    if (L.curHp > 0 && L.curHp <= L.stat.maxHp * 0.01) g.push('thread');
    if (enemy.isBoss && (L.damageTaken || 0) === 0) g.push('flawless');
    if (!enemy.isBoss && ctx.turns <= 3) g.push('quick');
    if (ctx.turns >= 30) g.push('marathon');
    if (ctx.hourglassKill) g.push('hourglass');
  } else {
    if (/달빛의 징표/.test(txt.slice(-600)) && enemy.monsterKey === 'mGatekeeper') g.push('mark_death');
  }
  const stackOf = (id) => { const b = (L.buffs || []).find(x => x.id === id); return b ? (b.stack || 1) : 0; };
  if (stackOf(10685) >= 4) g.push('set_titan');
  if (stackOf(10695) >= 4) g.push('set_god');
  if (stackOf(10630) >= 15) g.push('set_city');
  if (stackOf(10610) >= 10) g.push('set_sci');
  if (stackOf(10626) >= 10) g.push('set_predator');
  if (stackOf(10713) >= 3) g.push('tectus3');
  if (/낙인이 겹쳐 두 배/.test(txt)) g.push('chogall');
  const ruby = [...txt.matchAll(/생명은 공평하다\. (\d+) → (\d+)/g)]; if (ruby.some(m => +m[2] < +m[1])) g.push('ruby_down');
  if (/남은 것을 한 번에 들이켰다/.test(txt)) g.push('pierrot');
  if ((char.gold || 0) >= 1000) g.push('rich');
  return g;
}
// 층 진행 (사이클 도달)
function onProgress(char) {
  const g = []; const c = char.run.cycle;
  if (c >= 3) g.push('cyc3'); if (c >= 8) g.push('cyc8'); if (c >= 11) g.push('cyc11'); if (c >= 15) g.push('cyc15');
  if (c >= 11 && !(char.run.ach && char.run.ach.chose)) g.push('pure');
  if ((char.gold || 0) >= 1000) g.push('rich');
  return g;
}
// 탑 정복
function onClear(char, stats) {
  const g = ['clear1']; const a = char.run.ach || {};
  if (stats.clears >= 3) g.push('clear3');
  if (stats.clears >= 10) g.push('clear10');
  if (CHAR_CLEAR[char.rosterKey]) g.push('char_' + char.rosterKey);
  const cleared = new Set(stats.clearedChars || []);
  if (cleared.size >= 5) g.push('multi5');
  if (Object.keys(CHAR_CLEAR).every(k => cleared.has(k))) g.push('multiAll');
  if (!a.undo) g.push('no_undo');
  if (!a.life) g.push('no_life');
  if (!a.item) g.push('no_item');
  const n = (char.deck || []).length;
  if (n <= 6) g.push('deck_small');
  if (n >= 16) g.push('deck_big');
  return g;
}
function onStats(stats, unlockedCount, total) {
  const g = [];
  if ((stats.epics || 0) >= 1) g.push('epic1');
  if ((stats.epics || 0) >= 25) g.push('epic25');
  if ((stats.epics || 0) >= 100) g.push('epic100');
  if ((stats.artifacts || []).length >= 10) g.push('art10');
  if ((stats.collectorBuys || 0) >= 5) g.push('collector5');
  if ((stats.devil || 0) >= 3) g.push('devil3');
  if (unlockedCount >= 5) g.push('unlock5');
  if (total && unlockedCount >= total) g.push('unlockAll');
  return g;
}

// 업적별 진행 상황 문자열 (없으면 null). ext: { unlocked, totalChars, monName(key) }
function progress(id, st, ext) {
  st = st || {}; ext = ext || {};
  const frac = (n, t) => Math.min(n || 0, t) + ' / ' + t;
  const killed = new Set(st.killed || []), cleared = new Set(st.clearedChars || []);
  const name = (k) => (ext.monName && ext.monName(k)) || k;
  const cyc = { cyc3: 3, cyc8: 8, cyc11: 11, cyc15: 15 };
  if (cyc[id]) return '최고 도달 ' + (st.bestCycle || 0) + '사이클 / ' + cyc[id];
  const cnt = { win100: ['wins', 100, '승리'], win500: ['wins', 500, '승리'], clear1: ['clears', 1, '정복'], clear3: ['clears', 3, '정복'], clear10: ['clears', 10, '정복'],
    epic1: ['epics', 1, '에픽'], epic25: ['epics', 25, '에픽'], epic100: ['epics', 100, '에픽'], collector5: ['collectorBuys', 5, '구매'], devil3: ['devil', 3, '거래'] };
  if (cnt[id]) return cnt[id][2] + ' ' + frac(st[cnt[id][0]], cnt[id][1]);
  if (id === 'art10') return '아티팩트 ' + frac((st.artifacts || []).length, 10);
  if (id === 'hunt20') return '격파한 몬스터 ' + frac(killed.size, 20);
  if (id === 'unlock5') return '해금 ' + frac(ext.unlocked, 5);
  if (id === 'unlockAll') return '해금 ' + frac(ext.unlocked, ext.totalChars || 19);
  if (id === 'multi5') return '정복한 캐릭터 ' + frac(cleared.size, 5);
  if (id === 'multiAll') { const miss = Object.keys(CHAR_CLEAR).filter(k => !cleared.has(k)); return '정복한 캐릭터 ' + frac(cleared.size, Object.keys(CHAR_CLEAR).length) + (miss.length && miss.length <= 6 ? ' — 남은: ' + miss.map(k => (rosterMod.template(k) || {}).name || k).join(', ') : ''); }
  if (id.startsWith('char_')) { const k = id.slice(5); const b = (st.best || {})[k]; return b ? '이 캐릭터 최고 ' + b + '사이클 / 15' : '아직 이 캐릭터로 오른 적이 없다'; }
  if (id.startsWith('theme_')) { const th = THEMES[id.slice(6)]; if (!th) return null; const got = th.keys.filter(k => killed.has(k)); const miss = th.keys.filter(k => !killed.has(k));
    return '격파 ' + got.length + ' / ' + th.keys.length + (miss.length ? ' — 남은: ' + miss.map(name).join(', ') : ''); }
  if (id === 'boss_both') return '데시메이트 ' + (killed.has('rsDeci') ? '✓' : '✗') + ' · 바이레스 ' + (killed.has('rsVyres') ? '✓' : '✗');
  const setMax = { set_titan: ['titan', 4], set_god: ['god', 4], set_city: ['city', 15], set_sci: ['sci', 10], set_predator: ['predator', 10] };
  if (setMax[id]) return '최고 ' + frac((st.maxStack || {})[setMax[id][0]], setMax[id][1]) + '중첩';
  return null;
}

module.exports = { LIST, BY_ID, THEMES, CHAR_CLEAR, onBattle, onProgress, onClear, onStats, progress };
