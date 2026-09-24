// 몬스터 고유 이벤트.
//  before[key] : 그 몬스터를 만나기 전(홀수 사이클 이벤트 층). effect(ch, mon, h) — mon = 다음 전투 몬스터 객체(직접 수정 가능)
//  after[key]  : 그 몬스터를 잡은 다음 사이클 이벤트 층. effect(ch, info, h) — info = { key, name }
//  h : 헬퍼 { addBuff, calcStats, removeCards, gear, resultCard, T }
const T = ['가위', '바위', '보'];

const before = {
  mCrawler: { title: '벌레 둥지', desc: '벽 틈마다 알집이 붙어 있다. 크로울러 무리가 이 근처에서 나온다.',
    options: [
      { label: '불을 지른다 (적 덱에서 카드 2장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, null, 2); return '알집이 타들어 간다. 무리가 ' + n + '장 줄었다.'; } },
      { label: '알을 팔아넘긴다 (골드 +35)', effect: (ch) => { ch.gold += 35; return '수상한 상인이 알을 사 갔다. 35골드.'; } }
    ] },
  mHeadHunter: { title: '사냥꾼의 흔적', desc: '나무에 덫이 걸려 있다. 헤드 헌터가 사냥감을 기다리는 자리다.',
    options: [
      { label: '덫을 해체한다 (적의 머리 사냥 계수 2.4 → 1.4)', effect: (ch, mon) => { mon.skill.base[0].damage = 1.4; return '덫이 없으니 머리 사냥도 무디다.'; } },
      { label: '덫을 되돌려 놓는다 (적 시작 체력 −25%)', effect: (ch, mon, h) => { mon.base.maxHp = Math.round(mon.base.maxHp * 0.75); h.calcStats(mon); return '사냥꾼이 제 덫에 걸렸다.'; } }
    ] },
  mMassCrawler: { title: '벌레 떼의 행렬', desc: '바닥이 검게 움직인다. 매스 크로울러가 몰려오고 있다.',
    options: [
      { label: '길목을 태운다 (적 덱 3장 제거, 골드 −20)', effect: (ch, mon, h) => { if (ch.gold < 20) return '기름 살 돈이 없다.'; ch.gold -= 20; const n = h.removeCards(mon, null, 3); return '행렬이 ' + n + '장 줄었다.'; } },
      { label: '틈을 노린다 (다음 전투 적 회피 −15%p)', effect: (ch, mon, h) => { h.addBuff(ch, { target: 'enemy', key: 'evasion', add: -0.15, battles: 1, label: '적 회피 −15%p' }); return '떼가 뭉치면 피할 데가 없다.'; } }
    ] },
  mDestoryer: { title: '무너진 갱도', desc: '디스토리어가 파 놓은 굴이다. 바닥이 흔들린다.',
    options: [
      { label: '굴을 무너뜨린다 (적 드라이브 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '굴이 막히자 놈의 움직임이 둔해졌다.'; } },
      { label: '광석을 캔다 (골드 +45, 적 체력 +15%)', effect: (ch, mon, h) => { ch.gold += 45; mon.base.maxHp = Math.round(mon.base.maxHp * 1.15); h.calcStats(mon); return '45골드. 소음에 놈이 깨어났다.'; } }
    ] },
  mTaurus: { title: '축사', desc: '거대한 발자국이 축사 안으로 이어진다. 타우러스가 여기 있다.',
    options: [
      { label: '소를 풀어준다 (적 덱에서 바위 2장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, 1, 2); return '무리가 흩어졌다. 바위 ' + n + '장 제거.'; } },
      { label: '우리를 잠근다 (재도전 ♥ +1)', effect: (ch, _x1, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '퇴로를 확보했다. 재도전 +1.'; } }
    ] },
  mMegaTaurus: { title: '떨리는 대지', desc: '메가 타우러스가 가까이 있다. 발밑에서 뿔 하나가 나뒹군다.',
    options: [
      { label: '뿔을 줍는다 (물리 공격 +5 영구, 적 공격 +10%)', effect: (ch, mon, h) => { ch.base.phyAtk += 5; mon.base.phyAtk = Math.round(mon.base.phyAtk * 1.1); h.calcStats(mon); return '뿔을 무기에 달았다. 놈이 화가 났다.'; } },
      { label: '함정을 판다 (적 기절 확률 절반)', effect: (ch, mon) => { for (const s of mon.skill.base) for (const e of (s.effect || [])) if (e.chance) e.chance /= 2; return '놈의 돌진이 자꾸 헛돈다.'; } }
    ] },
  eGunda: { title: '재의 제단', desc: '군다가 심판을 내리던 제단이다. 재가 아직 따뜻하다.',
    options: [
      { label: '제물을 바친다 (골드 50, 적 특수기 봉인)', effect: (ch, mon) => { if (ch.gold < 50) return '바칠 것이 없다.'; ch.gold -= 50; delete mon.skill.special; return '심판의 불이 꺼졌다.'; } },
      { label: '재를 뒤진다 (레어 장비, 적 공격 +10%)', effect: (ch, mon, h) => { const it = h.gear(ch.rank, 2); if (it) ch.inventory.push(it); mon.base.phyAtk = Math.round(mon.base.phyAtk * 1.1); h.calcStats(mon); return (it ? it.name + '을(를) 찾았다. ' : '') + '군다가 노했다.'; } }
    ] },
  eBroken: { title: '부러진 검', desc: '망자가 쓰던 직검 조각이 땅에 박혀 있다.',
    options: [
      { label: '줍는다 (가위 스킬 계수 +0.1 영구)', effect: (ch) => { const s = ch.skill.base[0]; s.damage = Math.round((s.damage + 0.1) * 100) / 100; return s.name + ' 계수 ' + s.damage + '.'; } },
      { label: '묻어준다 (적 시작 체력 −30%)', effect: (ch, mon, h) => { mon.base.maxHp = Math.round(mon.base.maxHp * 0.7); h.calcStats(mon); return '망자가 조금은 편해졌다.'; } }
    ] },
  eCrossbow: { title: '화살 무더기', desc: '석궁수 망자가 쟁여 둔 화살이다.',
    options: [
      { label: '화살촉을 꺾는다 (적 조준 사격 계수 1.5 → 1.0)', effect: (ch, mon) => { mon.skill.base[0].damage = 1.0; return '무딘 화살이 되었다.'; } },
      { label: '화살을 가져간다 (다음 2전투 치명타 +10%p)', effect: (ch, mon, h) => { h.addBuff(ch, { key: 'crit', add: 0.1, battles: 2, label: '치명타 +10%p' }); return '쓸 만하다.'; } }
    ] },
  oFlame: { title: '불씨', desc: '과수원 한가운데 불씨가 살아 있다. 업화가 이걸 먹고 자란다.',
    options: [
      { label: '물을 붓는다 (적 흡혈 무효)', effect: (ch, mon) => { for (const s of mon.skill.base) s.effect = (s.effect || []).filter(e => !(e.code === 4 && e.isPercentDamage)); return '불이 사그라든다.'; } },
      { label: '가져간다 (다음 전투 내 공격 +20%)', effect: (ch, mon, h) => { h.addBuff(ch, { key: 'atk', mult: 1.2, battles: 1, label: '공격력 +20%' }); return '손이 뜨겁다.'; } }
    ] },
  oEleLord: { title: '꺼져가는 불', desc: '정령왕의 힘이 새어 나오는 균열이다.',
    options: [
      { label: '균열을 막는다 (적 드라이브 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '왕의 불이 더는 터지지 않는다.'; } },
      { label: '힘을 빨아들인다 (마법 공격 +6 영구, 적 마법 공격 +10%)', effect: (ch, mon, h) => { ch.base.magAtk += 6; mon.base.magAtk = Math.round(mon.base.magAtk * 1.1); h.calcStats(mon); return '뜨거운 힘이 들어왔다.'; } }
    ] },
  oStoneist: { title: '영석 파편', desc: '영석술사가 흘린 돌 조각이 반짝인다.',
    options: [
      { label: '파편을 부순다 (적 버프 스킬 무효)', effect: (ch, mon) => { for (const s of mon.skill.base) s.effect = (s.effect || []).filter(e => !e.buffCode); return '술사의 돌이 힘을 잃었다.'; } },
      { label: '파편을 판다 (골드 +50)', effect: (ch) => { ch.gold += 50; return '50골드.'; } }
    ] },
  oDeathKnight: { title: '검은 기사의 갑주', desc: '죽음의 기사가 벗어 둔 갑주 한 벌이 서 있다.',
    options: [
      { label: '갑주를 훼손한다 (적 저항 0, 체력 −15%)', effect: (ch, mon, h) => { mon.base.phyReduce = 0; mon.base.magReduce = 0; mon.base.maxHp = Math.round(mon.base.maxHp * 0.85); h.calcStats(mon); return '기사가 맨몸으로 나올 것이다.'; } },
      { label: '갑주 조각을 챙긴다 (유니크 방어구, 적 공격 +15%)', effect: (ch, mon, h) => { const it = h.gear(ch.rank, 4, 1); if (it) ch.inventory.push(it); mon.base.phyAtk = Math.round(mon.base.phyAtk * 1.15); h.calcStats(mon); return (it ? it.name + ' 획득. ' : '') + '기사가 분노했다.'; } }
    ] },
  oLegor: { title: '개미굴', desc: "렉'오르의 굴 입구다. 안에서 땅이 울린다.",
    options: [
      { label: '입구를 막는다 (적 드라이브 무효, 덱 2장 제거)', effect: (ch, mon, h) => { delete mon.skill.drive; const n = h.removeCards(mon, null, 2); return '병정개미가 못 나온다. ' + n + '장 제거.'; } },
      { label: '파고든다 (유니크 장비, 적 체력 +15%)', effect: (ch, mon, h) => { const it = h.gear(ch.rank, 4); if (it) ch.inventory.push(it); mon.base.maxHp = Math.round(mon.base.maxHp * 1.15); h.calcStats(mon); return (it ? it.name + ' 획득. ' : '') + '여왕이 깨어났다.'; } }
    ] },
  d7Knight: { title: '수련장 문패', desc: '기사단 수련장. 문패에 오늘 당번 이름이 적혀 있다.',
    options: [
      { label: '문패를 바꿔 단다 (적 덱 무작위 2장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, null, 2); return '준비 안 된 기사가 나온다. ' + n + '장 제거.'; } },
      { label: '수련에 끼어든다 (스탯 +2)', effect: (ch) => { ch.statPoint += 2; return '몸이 풀렸다. 스탯 포인트 +2.'; } }
    ] },
  d7EliteKnight: { title: '정예 기사의 맹세', desc: '벽에 맹세문이 새겨져 있다. 읽으면 힘이 느껴진다.',
    options: [
      { label: '맹세문을 긁어낸다 (적 공격 −15%)', effect: (ch, mon, h) => { mon.base.phyAtk = Math.round(mon.base.phyAtk * 0.85); h.calcStats(mon); return '맹세가 흐려졌다.'; } },
      { label: '따라 읽는다 (체력 +40 영구)', effect: (ch) => { ch.base.maxHp += 40; return '굳건해졌다. 최대 체력 +40.'; } }
    ] },
  d7Lohengrin: { title: '단장의 편지', desc: '로엔그린이 남긴 편지다. 그의 전술이 적혀 있다.',
    options: [
      { label: '전술을 읽는다 (적 덱 구성 공개 + 적 명중 −10%p)', effect: (ch, mon, h) => { h.addBuff(ch, { target: 'enemy', key: 'hit', add: -0.1, battles: 1, label: '적 명중 −10%p' }); return '덱: ' + [0, 1, 2].map(t => T[t] + ' ' + mon.deck.filter(c => c.type === t).length).join(' · ') + '. 허점이 보인다.'; } },
      { label: '편지를 판다 (골드 +60)', effect: (ch) => { ch.gold += 60; return '60골드.'; } }
    ] },
  rKines1: { title: '혼돈의 잔재', desc: '카이네스가 지나간 자리에 보랏빛 균열이 남았다.',
    options: [
      { label: '균열을 봉한다 (적 생명력 전환 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '혼돈이 잦아든다.'; } },
      { label: '힘을 훔친다 (마법 공격 +8 영구, 체력 −30)', effect: (ch) => { ch.base.magAtk += 8; ch.base.maxHp = Math.max(50, ch.base.maxHp - 30); return '힘은 얻었지만 몸이 상했다.'; } }
    ] },
  rInfernal: { title: '지옥불 웅덩이', desc: '인페르날이 남긴 불웅덩이가 부글거린다.',
    options: [
      { label: '흙으로 덮는다 (적 가위 스킬 계수 −0.4)', effect: (ch, mon) => { mon.skill.base[0].damage = Math.max(0.5, mon.skill.base[0].damage - 0.4); return '불이 잦아들었다.'; } },
      { label: '무기를 담근다 (다음 3전투 공격 +15%)', effect: (ch, mon, h) => { h.addBuff(ch, { key: 'atk', mult: 1.15, battles: 3, label: '공격력 +15%' }); return '날이 벌겋게 달았다.'; } }
    ] },
  rKines2: { title: '두 번째 혼돈', desc: '균열이 둘로 갈라져 있다. 카이네스가 더 강해졌다.',
    options: [
      { label: '균열 하나를 봉한다 (적 특수기 봉인)', effect: (ch, mon) => { delete mon.skill.special; return '혼돈의 절반이 잠들었다.'; } },
      { label: '둘 다 열어본다 (에픽 장비, 적 공격 +20%)', effect: (ch, mon, h) => { const it = h.gear(ch.rank, 5); if (it) ch.inventory.push(it); mon.base.magAtk = Math.round(mon.base.magAtk * 1.2); h.calcStats(mon); return (it ? it.name + ' 획득. ' : '') + '혼돈이 넘친다.'; } }
    ] },
  rTimeStorm: { title: '멈춘 시계', desc: '시간의 폭풍 중심에 커다란 시계가 멈춰 있다.',
    options: [
      { label: '태엽을 감는다 (적 매 턴 셔플 해제)', effect: (ch, mon) => { mon.deckOpts = null; return '시간이 다시 흐른다. 폭풍이 규칙적이 됐다.'; } },
      { label: '시계를 부순다 (이번 런 덱 리셋 +1)', effect: (ch) => { ch.run.extraResets = (ch.run.extraResets || 0) + 1; return '시간을 한 번 더 되감을 수 있다.'; } }
    ] },
  rJulius: { title: '되감긴 발자국', desc: '같은 발자국이 몇 번이고 겹쳐 있다. 줄리어스가 여기서 시간을 되돌렸다.',
    options: [
      { label: '발자국을 지운다 (적 드라이브 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '되돌릴 길이 없다.'; } },
      { label: '따라 밟는다 (재도전 ♥ +1)', effect: (ch, _x1, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '한 번 더 돌아올 수 있다. 재도전 +1.'; } }
    ] },
  rsInzeal: { title: '심연의 문', desc: '인-질이 넘어온 문이 열려 있다.',
    options: [
      { label: '문을 닫는다 (적 체력 −20%)', effect: (ch, mon, h) => { mon.base.maxHp = Math.round(mon.base.maxHp * 0.8); h.calcStats(mon); return '힘의 일부가 심연에 남았다.'; } },
      { label: '들여다본다 (스탯 +4, 다음 전투 적 공격 +15%)', effect: (ch, mon, h) => { ch.statPoint += 4; h.addBuff(ch, { target: 'enemy', key: 'atk', mult: 1.15, battles: 1, label: '적 공격 +15%' }); return '무언가 마주 보았다. 스탯 +4.'; } }
    ] },
  rsNagpa: { title: '저주의 두루마리', desc: '나그파의 주문이 적힌 두루마리다.',
    options: [
      { label: '태운다 (적 디버프 스킬 무효)', effect: (ch, mon) => { for (const s of mon.skill.base) s.effect = (s.effect || []).filter(e => !e.buffCode); return '주문이 재가 됐다.'; } },
      { label: '읽는다 (마법 공격 +10 영구, 적도 +10)', effect: (ch, mon, h) => { ch.base.magAtk += 10; mon.base.magAtk += 10; h.calcStats(mon); return '둘 다 주문을 익혔다.'; } }
    ] },

  // ---- 11·13·15 보스 ----
  d721: { title: '얼음의 방', desc: '벽에 서리가 앉아 있다. 사천왕 칸나의 방이다. 세 마리의 숨소리가 들린다.',
    options: [
      { label: '난로에 불을 지핀다 (적 체력 -30%)', effect: (ch, mon, h) => { mon.base.maxHp = Math.round(mon.base.maxHp * 0.7); h.calcStats(mon); return '방이 데워지자 파르셀이 껍질 밖으로 나오지 못한다.'; } },
      { label: '얼음을 깨서 판다 (골드 +80)', effect: (ch) => { ch.gold += 80; return '얼음 조각을 상인에게 팔았다. 80골드.'; } }
    ] },
  d722: { title: '수련의 도장', desc: '격투 소리가 벽을 흔든다. 사천왕 시바의 도장이다.',
    options: [
      { label: '대련을 지켜본다 (적 덱에서 바위 2장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, 1, 2); return '주먹의 버릇을 읽었다. 바위 ' + n + '장 제거.'; } },
      { label: '대련에 끼어든다 (스탯 +5, 다음 전투 적 공격 +10%)', effect: (ch, mon, h) => { ch.statPoint += 5; h.addBuff(ch, { target: 'enemy', key: 'atk', mult: 1.1, battles: 1, label: '적 공격 +10%' }); return '한 판 붙었다. 스탯 +5. 시바가 몸을 풀었다.'; } }
    ] },
  d723: { title: '독안개의 정원', desc: '보랏빛 안개가 낮게 깔려 있다. 사천왕 국화의 정원이다.',
    options: [
      { label: '향을 피워 안개를 걷는다 (다음 전투 적 회피·명중 -15%p)', effect: (ch, mon, h) => { h.addBuff(ch, { target: 'enemy', key: 'evasion', add: -0.15, battles: 1, label: '적 회피·명중 -15%p' }); h.addBuff(ch, { target: 'enemy', key: 'hit', add: -0.15, battles: 1, label: '' }); return '안개가 걷히자 팬텀이 갈 곳을 잃었다.'; } },
      { label: '독초를 캔다 (독약 3개)', effect: (ch, mon, h) => { for (let i = 0; i < 3; i++) ch.inventory.push(h.consumable('poison')); return '독약 3개를 얻었다.'; } }
    ] },
  d724: { title: '용의 둥지', desc: '뜨거운 바람이 올라온다. 사천왕 목호의 둥지다.',
    options: [
      { label: '둥지에 물을 붓는다 (다음 전투 적 공격 -20%)', effect: (ch, mon, h) => { h.addBuff(ch, { target: 'enemy', key: 'atk', mult: 0.8, battles: 1, label: '적 공격 -20%' }); return '김이 오르며 용들이 움츠러들었다.'; } },
      { label: '용의 비늘을 줍는다 (에픽 장비, 적 체력 +15%)', effect: (ch, mon, h) => { const it = h.gear(ch.rank, 5); if (it) ch.inventory.push(it); mon.base.maxHp = Math.round(mon.base.maxHp * 1.15); h.calcStats(mon); return (it ? it.name + ' 획득. ' : '') + '용들이 깨어났다.'; } }
    ] },
  d725: { title: '챔피언의 방', desc: '아무 장식도 없다. 레드가 조용히 기다리고 있다. 네 개의 볼이 허리에 걸려 있다.',
    options: [
      { label: '볼 하나를 슬쩍한다 (적 폼 4 → 3)', effect: (ch, mon) => { if (mon.startEffects && mon.startEffects.length > 3) mon.startEffects.pop(); mon.pokemonForms = 3; return '피카츄의 볼을 빼돌렸다. 레드는 눈치채지 못했다.'; } },
      { label: '정면으로 도전한다 (스탯 +6)', effect: (ch) => { ch.statPoint += 6; return '레드가 고개를 끄덕였다. 각오가 굳었다. 스탯 +6.'; } }
    ] },
  rAeika: { title: '요새의 정비고', desc: '거대한 기계가 정비 중이다. 에이카의 에너지 코어가 충전되고 있다.',
    options: [
      { label: '코어 충전을 끊는다 (적 SP 충전 -50%)', effect: (ch, mon, h) => { mon.base.spCharge = Math.round((mon.base.spCharge || 0) * 0.5); h.calcStats(mon); return '코어가 반만 찼다.'; } },
      { label: '설계도를 훔친다 (스킬 아티팩트, 적 저항 +5%p)', effect: (ch, mon, h) => { const it = h.artifact(ch.rank); if (it) { if (!ch.items) ch.items = {}; ch.items.skillArtifact = it; h.calcStats(ch); } mon.base.phyReduce = (mon.base.phyReduce || 0) + 0.05; mon.base.magReduce = (mon.base.magReduce || 0) + 0.05; h.calcStats(mon); return (it ? it.name + ' 장착. ' : '') + '경보가 울렸다.'; } }
    ] },
  mGatekeeper: { title: '달빛이 드는 문', desc: '문 위로 달빛이 쏟아진다. 수문장이 그 빛을 등지고 서 있다.',
    options: [
      { label: '달을 가린다 (적 스페셜 [광란의 추적] 무효)', effect: (ch, mon) => { delete mon.skill.special; return '달빛이 끊겼다. 추적은 시작되지 않는다.'; } },
      { label: '표식을 긁어낸다 (적 덱에서 바위 2장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, 1, 2); return '징표가 흐려졌다. 바위 ' + n + '장 제거.'; } }
    ] },
  mLibei: { title: '그을린 소환진', desc: '바닥에 그려진 소환진이 아직 연기를 피운다.',
    options: [
      { label: '소환진을 훼손한다 (적 [어둠의 소환] 지속 2턴)', effect: (ch, mon) => { for (const sk of [...mon.skill.base, mon.skill.special].filter(Boolean)) for (const ef of (sk.effect || [])) if (ef.buffCode === 10718) ef.buffDur = 2; return '불러낸 것들이 오래 머물지 못한다.'; } },
      { label: '화살통을 훔친다 (적 덱에서 보 2장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, 2, 2); return '암흑의 화살이 줄었다. 보 ' + n + '장 제거.'; } }
    ] },
  mFrena: { title: '원소의 결정', desc: '세 빛깔의 결정이 공중에 떠 있다. 대마법사의 힘이 여기서 나온다.',
    options: [
      { label: '결정을 깬다 (적 상태이상 확률 절반)', effect: (ch, mon) => { for (const sk of mon.skill.base) for (const ef of (sk.effect || [])) if (ef.chance) ef.chance = Math.round(ef.chance * 50) / 100; return '원소가 흩어졌다.'; } },
      { label: '마법진을 흐트러뜨린다 (적 드라이브 [환기] 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '패를 섞을 수 없게 되었다.'; } }
    ] },
  mCouncil: { title: '빈 의석', desc: '원탁에 의자가 하나 비어 있다. 의회는 아직 그걸 모른다.',
    options: [
      { label: '의석을 더 비운다 (적 덱에서 무작위 3장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, null, 3); return '판결을 내릴 목소리가 줄었다. ' + n + '장 제거.'; } },
      { label: '판결문을 훔친다 (적 스페셜 [달의 의식] 무효)', effect: (ch, mon) => { delete mon.skill.special; return '의식은 열리지 않는다.'; } }
    ] },
  mNeon: { title: '공방의 배전반', desc: '굵은 전선이 공방 안쪽으로 이어진다. 스위치 하나면 된다.',
    options: [
      { label: '전원을 내린다 (적 드라이브 [보호 실드] 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '실드 발생기가 꺼졌다.'; } },
      { label: '폭탄 부품을 빼돌린다 (적 덱에서 가위 3장 제거)', effect: (ch, mon, h) => { const n = h.removeCards(mon, 0, 3); return '로봇을 조립할 수 없다. 가위 ' + n + '장 제거.'; } }
    ] },
  mIZ: { title: '물든 샘', desc: '맑던 샘이 탁하게 물들어 있다. 타락자가 지나간 자리다.',
    options: [
      { label: '정화의 향을 피운다 (적 스페셜 [완연한 타락] 무효)', effect: (ch, mon) => { delete mon.skill.special; return '타락이 번지지 않는다.'; } },
      { label: '해독제를 챙긴다 (다음 전투 중독 저항 +60%)', effect: (ch, mon, h) => { h.addBuff(ch, { key: 'resist_2', add: 0.6, battles: 1, label: '중독 저항 +60%' }); return '독이 잘 스미지 않을 것이다.'; } }
    ] },
  rsVyres: { title: '멈춘 쌍검', desc: '두 자루의 검이 바닥에 꽂혀 있다. 주인은 곧 돌아온다.',
    options: [
      { label: '한 자루를 뽑아 던진다 (적 연계·반격 무효)', effect: (ch, mon) => { mon.startEffects = []; return '서리와 불꽃이 더는 맞물리지 않는다.'; } },
      { label: '숨을 고른다 (재도전 ♥ +1)', effect: (ch, mon, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '한 번 더 설 수 있다. 재도전 +1.'; } }
    ] },
  rsDeci: { title: '파멸의 문 앞', desc: '문 너머에서 모든 것이 부서지는 소리가 난다. 여기가 끝이다.',
    options: [
      { label: '문에 봉인을 새긴다 (적 드라이브 무효)', effect: (ch, mon) => { delete mon.skill.drive; return '파멸이 한 박자 늦어졌다.'; } },
      { label: '남은 것을 전부 쏟는다 (골드 100당 스탯 +3)', effect: (ch) => { const n = Math.floor(ch.gold / 100) * 3; ch.statPoint += n; ch.gold = ch.gold % 100; return '더는 쓸 데가 없다. 스탯 +' + n + '.'; } },
      { label: '숨을 고른다 (재도전 ♥ +1)', effect: (ch, mon, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '한 번 더 설 수 있다. 재도전 +1.'; } }
    ] },
};

const after = {
  mCrawler: { title: '남은 알집', desc: '무리를 쓸어낸 자리에 알집 몇 개가 남았다.',
    options: [ { label: '팔아넘긴다 (골드 +40)', effect: (ch) => { ch.gold += 40; return '40골드.'; } },
               { label: '으깬다 (다음 2전투 치명타 +8%p)', effect: (ch, i, h) => { h.addBuff(ch, { key: 'crit', add: 0.08, battles: 2, label: '치명타 +8%p' }); return '손맛이 남았다.'; } } ] },
  mHeadHunter: { title: '사냥꾼의 창고', desc: '헤드 헌터가 모아 둔 전리품 창고를 찾았다.',
    options: [ { label: '무기를 고른다 (레어 무기)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 2, 0); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '쓸 만한 게 없다.'; } },
               { label: '두개골을 판다 (골드 +55)', effect: (ch) => { ch.gold += 55; return '55골드.'; } } ] },
  mMassCrawler: { title: '벌레 껍질', desc: '매스 크로울러의 껍질이 산처럼 쌓였다.',
    options: [ { label: '갑옷을 만든다 (레어 방어구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 2, 1); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '재료가 부족하다.'; } },
               { label: '태운다 (스탯 +2)', effect: (ch) => { ch.statPoint += 2; return '단련이 됐다. 스탯 +2.'; } } ] },
  mDestoryer: { title: '디스토리어의 광석', desc: '놈이 캐던 광석이 굴 안에 쌓여 있다.',
    options: [ { label: '가져간다 (골드 +60)', effect: (ch) => { ch.gold += 60; return '60골드.'; } },
               { label: '녹여서 무기에 바른다 (물리 공격 +5 영구)', effect: (ch) => { ch.base.phyAtk += 5; return '물리 공격 +5.'; } } ] },
  mTaurus: { title: '타우러스의 뿔', desc: '쓰러진 타우러스의 뿔이 남았다.',
    options: [ { label: '장신구로 만든다 (유니크 장신구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4, 3); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '실패했다.'; } },
               { label: '갈아 마신다 (체력 +50 영구)', effect: (ch) => { ch.base.maxHp += 50; return '최대 체력 +50.'; } } ] },
  mMegaTaurus: { title: '거대한 가죽', desc: '메가 타우러스의 가죽은 한 사람이 다 들 수 없다.',
    options: [ { label: '방어구로 만든다 (유니크 방어구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4, 1); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '실패했다.'; } },
               { label: '판다 (골드 +90)', effect: (ch) => { ch.gold += 90; return '90골드.'; } } ] },
  eGunda: { title: '심판자의 재', desc: '군다가 재로 흩어졌다. 재에서 온기가 난다.',
    options: [ { label: '재를 삼킨다 (스탯 +4)', effect: (ch) => { ch.statPoint += 4; return '스탯 +4.'; } },
               { label: '재를 모아 판다 (유니크 리설트 카드)', effect: (ch, i, h) => { ch.inventory.push(h.resultCard(ch.rank, 6)); return '유니크 리설트 카드 획득.'; } } ] },
  eBroken: { title: '망자의 안식', desc: '직검을 든 망자가 마침내 쉬었다.',
    options: [ { label: '검을 거둔다 (레어 무기)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 2, 0); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '검이 부서졌다.'; } },
               { label: '기도한다 (재도전 ♥ +1)', effect: (ch, _x1, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '재도전 +1.'; } } ] },
  eCrossbow: { title: '석궁', desc: '망자의 석궁이 아직 쓸 만하다.',
    options: [ { label: '가위 스킬에 단다 (가위 스킬 계수 +0.15)', effect: (ch) => { const s = ch.skill.base[0]; s.damage = Math.round((s.damage + 0.15) * 100) / 100; return s.name + ' 계수 ' + s.damage + '.'; } },
               { label: '판다 (골드 +50)', effect: (ch) => { ch.gold += 50; return '50골드.'; } } ] },
  oFlame: { title: '식은 재', desc: '업화가 꺼진 자리에 익은 과일이 남았다.',
    options: [ { label: '먹는다 (체력 +40 영구)', effect: (ch) => { ch.base.maxHp += 40; return '최대 체력 +40.'; } },
               { label: '판다 (골드 +45)', effect: (ch) => { ch.gold += 45; return '45골드.'; } } ] },
  oEleLord: { title: '정령의 핵', desc: '정령왕이 남긴 핵이 뜨겁게 빛난다.',
    options: [ { label: '흡수한다 (마법 공격 +8 영구)', effect: (ch) => { ch.base.magAtk += 8; return '마법 공격 +8.'; } },
               { label: '아티팩트로 만든다 (스킬 아티팩트)', effect: (ch, i, h) => { const it = h.artifact(ch.rank); if (!it) return '실패했다.'; if (!ch.items) ch.items = {}; ch.items.skillArtifact = it; h.calcStats(ch); return it.name + ' 장착.'; } } ] },
  oStoneist: { title: '영석 무더기', desc: '술사가 쌓아 둔 영석이 그대로 남았다.',
    options: [ { label: '영석을 정제한다 (고급 치유 물약 + 소모품 1개)', effect: (ch, i, h) => { ch.inventory.push(h.consumable('hp_l')); const b = h.consumable(); ch.inventory.push(b); return '고급 치유 물약, ' + b.name + ' 획득.'; } },
               { label: '판다 (골드 +70)', effect: (ch) => { ch.gold += 70; return '70골드.'; } } ] },
  oDeathKnight: { title: '기사의 유언', desc: '죽음의 기사가 마지막으로 무언가 말했다.',
    options: [ { label: '검을 잇는다 (유니크 무기)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4, 0); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '검이 바스러졌다.'; } },
               { label: '유언을 새긴다 (바위 스킬 계수 +0.15)', effect: (ch) => { const s = ch.skill.base[1]; s.damage = Math.round((s.damage + 0.15) * 100) / 100; return s.name + ' 계수 ' + s.damage + '.'; } } ] },
  oLegor: { title: '여왕개미의 방', desc: "렉'오르가 지키던 방에 알이 가득하다.",
    options: [ { label: '알을 판다 (골드 +100)', effect: (ch) => { ch.gold += 100; return '100골드.'; } },
               { label: '여왕의 갑각을 벗긴다 (유니크 보조방어구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4, 2); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '실패했다.'; } } ] },
  d7Knight: { title: '기사의 표창', desc: '수련장 기사를 이겼다는 소문이 퍼졌다.',
    options: [ { label: '상금을 받는다 (골드 +60)', effect: (ch) => { ch.gold += 60; return '60골드.'; } },
               { label: '수련에 참가한다 (스탯 +3)', effect: (ch) => { ch.statPoint += 3; return '스탯 +3.'; } } ] },
  d7EliteKnight: { title: '정예의 인장', desc: '정예 기사의 인장을 손에 넣었다.',
    options: [ { label: '무기고를 연다 (유니크 장비)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '비어 있다.'; } },
               { label: '인장을 판다 (골드 +80)', effect: (ch) => { ch.gold += 80; return '80골드.'; } } ] },
  d7Lohengrin: { title: '단장의 유품', desc: '로엔그린의 검과 전술서가 남았다.',
    options: [ { label: '전술서 (보 스킬 계수 +0.2)', effect: (ch) => { const s = ch.skill.base[2]; s.damage = Math.round((s.damage + 0.2) * 100) / 100; return s.name + ' 계수 ' + s.damage + '.'; } },
               { label: '검 (에픽 무기)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 5, 0); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '검이 사라졌다.'; } } ] },
  rKines1: { title: '혼돈의 조각', desc: '카이네스가 흘린 혼돈이 응고했다.',
    options: [ { label: '삼킨다 (마법 공격 +10 영구, 체력 −20)', effect: (ch) => { ch.base.magAtk += 10; ch.base.maxHp = Math.max(50, ch.base.maxHp - 20); return '마법 공격 +10, 체력 −20.'; } },
               { label: '봉인해서 판다 (골드 +80)', effect: (ch) => { ch.gold += 80; return '80골드.'; } } ] },
  rInfernal: { title: '지옥불의 심장', desc: '인페르날의 심장이 아직 뛴다.',
    options: [ { label: '무기에 박는다 (가위 스킬 계수 +0.2)', effect: (ch) => { const s = ch.skill.base[0]; s.damage = Math.round((s.damage + 0.2) * 100) / 100; return s.name + ' 계수 ' + s.damage + '.'; } },
               { label: '아티팩트로 만든다 (스킬 아티팩트)', effect: (ch, i, h) => { const it = h.artifact(ch.rank); if (!it) return '실패했다.'; if (!ch.items) ch.items = {}; ch.items.skillArtifact = it; h.calcStats(ch); return it.name + ' 장착.'; } } ] },
  rKines2: { title: '닫힌 균열', desc: '균열이 닫히며 힘이 응축됐다.',
    options: [ { label: '흡수한다 (스탯 +5)', effect: (ch) => { ch.statPoint += 5; return '스탯 +5.'; } },
               { label: '응축체를 판다 (유니크 리설트 카드 2장)', effect: (ch, i, h) => { ch.inventory.push(h.resultCard(ch.rank, 6)); ch.inventory.push(h.resultCard(ch.rank, 6)); return '유니크 리설트 카드 2장.'; } } ] },
  rTimeStorm: { title: '폭풍의 눈', desc: '폭풍이 걷히자 시간이 고요하다.',
    options: [ { label: '한 번 더 (이번 런 덱 리셋 +1)', effect: (ch) => { ch.run.extraResets = (ch.run.extraResets || 0) + 1; return '덱 리셋 +1.'; } },
               { label: '시간을 판다 (골드 +90)', effect: (ch) => { ch.gold += 90; return '90골드.'; } } ] },
  rJulius: { title: '되감기의 끝', desc: '줄리어스가 더는 되돌리지 못했다.',
    options: [ { label: '회중시계 (재도전 ♥ +1)', effect: (ch, _x1, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '재도전 +1.'; } },
               { label: '시간의 지혜 (스킬 3개 계수 +0.05)', effect: (ch) => { for (const s of ch.skill.base) s.damage = Math.round((s.damage + 0.05) * 100) / 100; return '모든 스킬 계수 +0.05.'; } } ] },
  rsInzeal: { title: '심연의 잔향', desc: '인-질이 사라진 자리에 검은 결정이 남았다.',
    options: [ { label: '결정 (에픽 장비)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 5); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '부서졌다.'; } },
               { label: '잔향을 마신다 (스탯 +6)', effect: (ch) => { ch.statPoint += 6; return '스탯 +6.'; } } ] },
  rsNagpa: { title: '나그파의 서', desc: '나그파의 주문서가 온전히 남았다.',
    options: [ { label: '읽는다 (마법 공격 +12 영구)', effect: (ch) => { ch.base.magAtk += 12; return '마법 공격 +12.'; } },
               { label: '판다 (골드 +120)', effect: (ch) => { ch.gold += 120; return '120골드.'; } } ] },

  d721: { title: '칸나의 얼음 조각', desc: '싸움이 끝난 방에 녹지 않는 얼음이 남았다.',
    options: [ { label: '삼킨다 (마법 공격 +12 영구)', effect: (ch) => { ch.base.magAtk += 12; return '마법 공격 +12.'; } },
               { label: '깎아 판다 (골드 +120)', effect: (ch) => { ch.gold += 120; return '120골드.'; } } ] },
  d722: { title: '시바의 도복', desc: '땀에 젖은 도복이 걸려 있다.',
    options: [ { label: '입는다 (물리 공격 +12 영구)', effect: (ch) => { ch.base.phyAtk += 12; return '물리 공격 +12.'; } },
               { label: '단련한다 (스탯 +6)', effect: (ch) => { ch.statPoint += 6; return '스탯 +6.'; } } ] },
  d723: { title: '국화의 독병', desc: '정원 한쪽에 독병이 나란히 놓여 있다.',
    options: [ { label: '가져간다 (독약 2 + 화염병 2)', effect: (ch, i, h) => { ch.inventory.push(h.consumable('poison'), h.consumable('poison'), h.consumable('fire'), h.consumable('fire')); return '독약 2, 화염병 2.'; } },
               { label: '판다 (유니크 리설트 카드 2장)', effect: (ch, i, h) => { ch.inventory.push(h.resultCard(ch.rank, 6), h.resultCard(ch.rank, 6)); return '유니크 리설트 카드 2장.'; } } ] },
  d724: { title: '용의 알', desc: '둥지에 알 하나가 남았다. 따뜻하다.',
    options: [ { label: '품는다 (체력 +80 영구)', effect: (ch) => { ch.base.maxHp += 80; return '최대 체력 +80.'; } },
               { label: '판다 (에픽 장비)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 5); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '깨져 버렸다.'; } } ] },
  d725: { title: '챔피언의 벨트', desc: '레드가 말없이 벨트를 건넸다.',
    options: [ { label: '찬다 (스탯 +8)', effect: (ch) => { ch.statPoint += 8; return '스탯 +8.'; } },
               { label: '볼을 받는다 (에픽 장신구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 5, 3); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '비어 있었다.'; } } ] },
  rAeika: { title: '요새의 잔해', desc: '멈춘 기계 사이에서 에너지 코어가 아직 빛난다.',
    options: [ { label: '코어를 몸에 넣는다 (SP 충전 +3 영구)', effect: (ch) => { ch.base.spCharge = (ch.base.spCharge || 0) + 3; return 'SP 충전 +3.'; } },
               { label: '장갑판을 벗겨 판다 (에픽 방어구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 5, 1); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '녹아 버렸다.'; } } ] },
  mGatekeeper: { title: '열린 문', desc: '수문장이 쓰러지자 문이 스스로 열렸다.',
    options: [ { label: '방패를 챙긴다 (레어 보조방어구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 2, 2); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '쓸 만한 게 없다.'; } },
               { label: '문지기의 열쇠를 판다 (골드 +50)', effect: (ch) => { ch.gold += 50; return '50골드.'; } } ] },
  mLibei: { title: '흑마술사의 서가', desc: '리베이가 남긴 책들이 아직 따뜻하다.',
    options: [ { label: '마술서를 연다 (스킬 아티팩트)', effect: (ch, i, h) => { const a = h.artifact(ch.rank); if (a) { ch.inventory.push(a); return a.name + ' 획득.'; } return '읽을 수 없는 글뿐이다.'; } },
               { label: '촉매를 챙긴다 (소모품 2개)', effect: (ch, i, h) => { const a = h.consumable(), b = h.consumable(); ch.inventory.push(a, b); return a.name + ', ' + b.name + ' 획득.'; } } ] },
  mFrena: { title: '대마법사의 탑', desc: '프레나의 연구실 문이 열려 있다.',
    options: [ { label: '지팡이를 가져간다 (유니크 무기)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4, 0); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '쓸 만한 게 없다.'; } },
               { label: '원소 정수를 마신다 (다음 2전투 명중 +10%p)', effect: (ch, i, h) => { h.addBuff(ch, { key: 'hit', add: 0.1, battles: 2, label: '명중 +10%p' }); return '눈이 맑아졌다.'; } } ] },
  mCouncil: { title: '해산된 의회', desc: '원탁 위에 의회의 인장만 남았다.',
    options: [ { label: '인장을 가져간다 (유니크 장신구)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 4, 3); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '쓸 만한 게 없다.'; } },
               { label: '빈 의석에 앉아 쉰다 (재도전 ♥ +1)', effect: (ch, mon, h) => { const l = ch.run.lives === undefined ? 1 : ch.run.lives; if (l >= h.maxLives(ch)) return '더는 받을 수 없다.'; ch.run.lives = l + 1; return '잠시 쉬었다. 재도전 +1.'; } } ] },
  mNeon: { title: '멈춘 공방', desc: '네온의 공방에 부품이 산더미처럼 남았다.',
    options: [ { label: '부품을 뒤진다 (레어 장비 2개)', effect: (ch, i, h) => { const a = h.gear(ch.rank, 2), b = h.gear(ch.rank, 2); if (a) ch.inventory.push(a); if (b) ch.inventory.push(b); return [a, b].filter(x => x).map(x => x.name).join(', ') + ' 획득.'; } },
               { label: '설계도를 판다 (골드 +70)', effect: (ch) => { ch.gold += 70; return '70골드.'; } } ] },
  mIZ: { title: '타락의 잔재', desc: 'iZ가 사라진 자리에 검게 물든 결정이 남았다.',
    options: [ { label: '결정을 쥔다 (에픽 장비)', effect: (ch, i, h) => { const it = h.gear(ch.rank, 5); if (it) { ch.inventory.push(it); return it.name + ' 획득.'; } return '손에 닿자 부서졌다.'; } },
               { label: '결정을 정화한다 (스탯 +4)', effect: (ch) => { ch.statPoint += 4; return '맑아진 힘이 스며든다. 스탯 +4.'; } } ] },
  rsVyres: { title: '쌍검사의 유산', desc: '바이레스의 두 자루가 나란히 놓여 있다.',
    options: [ { label: '두 자루를 모두 챙긴다 (에픽 장비 2개)', effect: (ch, i, h) => { const a = h.gear(ch.rank, 5), b = h.gear(ch.rank, 5); if (a) ch.inventory.push(a); if (b) ch.inventory.push(b); return [a, b].filter(x => x).map(x => x.name).join(', ') + ' 획득.'; } },
               { label: '검을 거둔다 (스탯 +10)', effect: (ch) => { ch.statPoint += 10; return '스탯 +10.'; } } ] },
  rsDeci: { title: '파멸 이후', desc: '모든 것이 부서진 자리에 당신만 서 있다.',
    options: [ { label: '남은 것을 줍는다 (에픽 장비 2개)', effect: (ch, i, h) => { const a = h.gear(ch.rank, 5), b = h.gear(ch.rank, 5); if (a) ch.inventory.push(a); if (b) ch.inventory.push(b); return [a, b].filter(x => x).map(x => x.name).join(', ') + ' 획득.'; } },
               { label: '돌아본다 (스탯 +10)', effect: (ch) => { ch.statPoint += 10; return '스탯 +10.'; } } ] },
};

module.exports = { before, after };
