// 플레이 가능 캐릭터 로스터
// - key   : users.unlocked / 선택 폼에서 쓰는 식별자 (chara.js export 이름과 동일)
// - 템플릿은 chara.js의 객체를 그대로 참조하며, 실제 캐릭터 생성 시 깊은 복사해서 사용
const chara = require('./chara');
const cons = require('./constant');
const item = require('./items');

const KEYS = ['seriers', 'gaius', 'kines', 'julius', 'psi', 'aeika', 'ruisun', 'aeohelm', 'dekaitz',
              'bks', 'lunisha', 'illun', 'nux', 'lozic', 'kasien', 'marang', 'gabi', 'jay'];

function template(key) {
  return KEYS.includes(key) ? chara[key] : null;
}

// 선택 화면용 요약 (툴팁 HTML은 그대로 전달)
function summary(key) {
  const c = template(key);
  if (!c) return null;
  return {
    key,
    name: c.name,
    title: c.title,
    rank: c.rank,
    skills: (c.skill && c.skill.base ? c.skill.base : []).map(s => ({
      name: s.name, type: s.type, damage: s.damage, tooltip: s.tooltip || ''
    })),
    special: c.skill && c.skill.special ? { name: c.skill.special.name, cost: c.skill.special.cost, tooltip: c.skill.special.tooltip || '' } : null,
    drive: c.skill && c.skill.drive ? { name: c.skill.drive.name, tooltip: c.skill.drive.tooltip || '' } : null,
  };
}

function all() {
  return KEYS.map(summary);
}

// ---- 새 런 시작값 ----
const RUN_START = { rank: 9, level: 1, statPoint: 5 };
// 가위/바위/보 각 2장. type은 skill.base 인덱스(0 가위, 1 바위, 2 보)와 대응
const START_DECK = [0, 0, 1, 1, 2, 2].map(t => ({ type: t }));

// 급수에 따른 기본 능력치 (기존 리셋 공식과 동일)
function baseByRank(rank) {
  return { phyAtk: 20 + 10 * (9 - rank), magAtk: 20 + 10 * (9 - rank), maxHp: 200 + 150 * (9 - rank) };
}

// 새 런용 캐릭터 인스턴스 생성 (템플릿 깊은 복사 후 런 시작값으로 초기화)
// 능력치 합산(calcStats)은 호출측(index.js)에서 수행
function create(key) {
  const c = template(key);
  if (!c) return null;
  const inst = JSON.parse(JSON.stringify(c));
  inst.rosterKey = key;

  inst.rank = RUN_START.rank;
  inst.level = RUN_START.level;
  inst.statPoint = RUN_START.statPoint;
  inst.premiumPoint = 0;
  inst.exp = 0;
  inst.dust = 0;
  inst.lastStat = null;
  Object.assign(inst.base, baseByRank(inst.rank));

  // 장비는 기본 무기/갑옷만, 템플릿의 시작 인벤토리는 비움
  inst.items = {};
  inst.inventory = [];
  // 슬롯별(무기/방어구/보조방어구/장신구) 리설트 카드 1장씩
  ['무기', '방어구', '보조방어구', '장신구'].forEach((label, type) => {
    inst.inventory.push({
      type: cons.ITEM_TYPE_RESULT_CARD, resultType: type, rank: inst.rank,
      name: inst.rank + '급 ' + label + ' 리설트 카드',
      tooltip: '27.3% : 언커먼 장비<br>55.2% : 레어 장비<br>12.5% : 유니크 장비<br>5% : 에픽 장비'
    });
  });

  inst.deck = JSON.parse(JSON.stringify(START_DECK));
  inst.run = { cycle: 1, floor: 1 };
  return inst;
}

// 아직 해금되지 않은 키 중 하나를 무작위로 (클리어 보상용)
function randomLocked(unlocked) {
  const pool = KEYS.filter(k => !unlocked.includes(k));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { KEYS, template, summary, all, create, randomLocked, baseByRank, RUN_START };
