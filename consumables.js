// 소모품: 전투 중 자유 행동으로 사용 (턴을 쓰지 않음). 일회용 카드만 그 턴의 카드로 낸다.
const cons = require('./constant');
const TYPE = 997;   // ITEM_TYPE_CONSUMABLE
const T = ['가위', '바위', '보'];

const DEFS = {
  hp_s:    { name: '치유 물약',       tooltip: '전투 중 사용: 최대 생명력의 25% 회복', w: 4 },
  hp_l:    { name: '고급 치유 물약',  tooltip: '전투 중 사용: 최대 생명력의 50% 회복', w: 1 },
  sp:      { name: '기력 물약',       tooltip: '전투 중 사용: SP +40', w: 2 },
  atk:     { name: '맹공의 물약',     tooltip: '전투 중 사용: 이번 전투 물리·마법 공격력 +20%', w: 3 },
  crit:    { name: '예리함의 물약',   tooltip: '전투 중 사용: 이번 전투 치명타 +15%p', w: 2 },
  evade:   { name: '안개의 물약',     tooltip: '전투 중 사용: 이번 전투 회피 +15%p', w: 2 },
  guard:   { name: '철벽의 물약',     tooltip: '전투 중 사용: 이번 전투 물리·마법 저항 +15%p', w: 2 },
  cleanse: { name: '정화수',          tooltip: '전투 중 사용: 자신의 해제 가능한 디버프 제거', w: 2 },
  bomb:    { name: '폭탄',            tooltip: '전투 중 사용: 적에게 적 최대 생명력의 12% 절대 피해 (1은 남김)', w: 2 },
  poison:  { name: '독약',            tooltip: '전투 중 사용: 적에게 3턴 간 [중독]', w: 2 },
  fire:    { name: '화염병',          tooltip: '전투 중 사용: 적에게 3턴 간 [화상]', w: 2 },
  stun:    { name: '마비 가루',       tooltip: '전투 중 사용: 적에게 1턴 간 [기절]', w: 1 },
  silence: { name: '침묵의 부적',     tooltip: '전투 중 사용: 적에게 2턴 간 [침묵]', w: 1 },
  card0:   { name: '일회용 가위 카드', tooltip: '전투 중 사용: 손패와 상관없이 이번 턴 가위를 낸다 (덱 카드 소모 없음)', w: 2, card: 0 },
  card1:   { name: '일회용 바위 카드', tooltip: '전투 중 사용: 손패와 상관없이 이번 턴 바위를 낸다 (덱 카드 소모 없음)', w: 2, card: 1 },
  card2:   { name: '일회용 보 카드',   tooltip: '전투 중 사용: 손패와 상관없이 이번 턴 보를 낸다 (덱 카드 소모 없음)', w: 2, card: 2 },
};
const STATUS = { poison: [2, 3], fire: [1, 3], stun: [4, 1], silence: [7, 2] };   // [buffCode, dur]

function make(code) {
  const d = DEFS[code]; if (!d) return null;
  return { type: TYPE, code, name: d.name, tooltip: d.tooltip, card: d.card };
}
function random(exclude) {
  const keys = Object.keys(DEFS).filter(k => !exclude || !exclude.includes(k));
  const total = keys.reduce((a, k) => a + DEFS[k].w, 0);
  let r = Math.random() * total;
  for (const k of keys) { r -= DEFS[k].w; if (r <= 0) return make(k); }
  return make(keys[keys.length - 1]);
}
function price(code, cycle) {
  const base = { hp_s: 25, hp_l: 60, sp: 30, atk: 35, crit: 30, evade: 30, guard: 30, cleanse: 25, bomb: 40, poison: 30, fire: 30, stun: 45, silence: 40, card0: 20, card1: 20, card2: 20 }[code] || 30;
  return base + 3 * cycle;
}
// 전투 중 사용. 반환: 로그 문자열. bm: battlemodule 인스턴스, L/R: 전투용 캐릭터 복사본
function apply(code, bm, L, R, buffMdl, mods) {
  const d = DEFS[code]; if (!d) return null;
  mods = mods || {};
  const log = (s) => '<span class="skillDamage">' + L.name + '의 [ ' + d.name + ' ] 사용: ' + s + '</span><br>';
  const heal = (p) => { const v = Math.round(L.stat.maxHp * p * (1 + (mods.healBonus || 0))); L.curHp = Math.min(L.stat.maxHp, L.curHp + v); return log('생명력 ' + v + ' 회복'); };
  switch (code) {
    case 'hp_s': return heal(0.25);
    case 'hp_l': return heal(0.5);
    case 'sp': L.curSp = (L.curSp || 0) + 40; return log('SP +40');
    case 'atk': L.stat.phyAtk = Math.round(L.stat.phyAtk * 1.2 * 100) / 100; L.stat.magAtk = Math.round(L.stat.magAtk * 1.2 * 100) / 100; return log('공격력 +20%');
    case 'crit': L.stat.crit = (L.stat.crit || 0) + 0.15; return log('치명타 +15%p');
    case 'evade': L.stat.evasion = (L.stat.evasion || 0) + 0.15; return log('회피 +15%p');
    case 'guard': L.stat.phyReduce = (L.stat.phyReduce || 0) + 0.15; L.stat.magReduce = (L.stat.magReduce || 0) + 0.15; return log('저항 +15%p');
    case 'cleanse': { const before = (L.buffs || []).length; L.buffs = (L.buffs || []).filter(b => !(b.isDebuff && b.dispellable && b.durOff)); return log('디버프 ' + (before - L.buffs.length) + '개 제거'); }
    case 'bomb': { const v = Math.max(1, Math.round(R.stat.maxHp * 0.12)); R.curHp = Math.max(1, R.curHp - v); return log(R.name + '에게 ' + v + ' 절대 피해'); }
    default: {
      if (STATUS[code]) {
        const [bc, dur0] = STATUS[code]; const dur = dur0 + (mods.statusBonus || 0);
        const buffObj = buffMdl.getBuffData({ buffCode: bc }); buffObj.dur = dur;
        bm.giveBuff(L, R, buffObj, true, d.name);
        return log(R.name + '에게 [' + buffObj.name + '] ' + dur + '턴');
      }
      return null;
    }
  }
}
module.exports = { TYPE, DEFS, make, random, price, apply, T };
