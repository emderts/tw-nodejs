// 플레이 가능 캐릭터 로스터
// - key   : users.unlocked / 선택 폼에서 쓰는 식별자 (chara.js export 이름과 동일)
// - 템플릿은 chara.js의 객체를 그대로 참조하며, 실제 캐릭터 생성 시 깊은 복사해서 사용
const chara = require('./chara');

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

// 새 런용 캐릭터 인스턴스 생성 (템플릿 깊은 복사)
function create(key) {
  const c = template(key);
  if (!c) return null;
  const inst = JSON.parse(JSON.stringify(c));
  inst.rosterKey = key;
  return inst;
}

// 아직 해금되지 않은 키 중 하나를 무작위로 (클리어 보상용)
function randomLocked(unlocked) {
  const pool = KEYS.filter(k => !unlocked.includes(k));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { KEYS, template, summary, all, create, randomLocked };
