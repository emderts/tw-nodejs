const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
}); 

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(session({
    secret: 'ewqwwolpe!d.ldx42EsCCXD#!$()_*#@',
    resave: false,
    saveUninitialized: true
  }))
  .use(bodyParser.urlencoded({extended: false}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', procIndex)
  .get('/login', (req, res) => res.render('pages/login'))
  .post('/login', procLogin)
  .get('/join', (req, res) => res.render('pages/join'))
  .post('/join', procJoin)
  .get('/logout', procLogout)
  .get('/test', (req, res) => res.send(_doBattle()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  async function procIndex (req, res) {
    const sess = req.session; 
    const char = await getCharacter(sess.userUid);
    res.render('pages/index', {
      user: sess.userUid+1 ? {name: sess.userName} : null,
      char: char
    }); 
  }

  async function getCharacter (id) {
	try {
	  var rval = null;
	  const client = await pool.connect();
	  const result = await client.query('select * from users where id = $1', [id]);
	  if (result.rows.length > 0) {
		const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
	    if (resultChar.rows.length > 0) {
		  rval = resultChar.rows[0].char_data;
	    }
	  }
	  if (rval !== null) {
		rval = JSON.parse(rval);
	  }

	  client.release();
	  return rval;
	} catch (err) {
	  console.error(err);
	  return null;
	}	
  }

  async function setCharacter (id, uid, data) {
    try {
	  const client = await pool.connect();
	  const result = await client.query('insert into characters(uid, char_data) values ($1, $2)', [uid, JSON.stringify(data)]);
	  const result2 = await client.query('update users set uid = $1 where id = $2', [uid, id]);
	  
	  client.release();
	} catch (err) {
	  console.error(err);
	}	
	
  }

  async function procLogin (req, res) {
	try {
	  const body = req.body;
	  const client = await pool.connect();
	  const result = await client.query('select * from users where id = $1', [body.userId]);
	  if (result.rows.length > 0) {
	    if (bcrypt.compareSync(body.userPwd, result.rows[0].password)) {
	      req.session.userUid = result.rows[0].id;
	      req.session.userName = result.rows[0].name;
	      res.redirect('/');
	    } else {
	      res.send('아이디나 비밀번호 오류입니다.');
	    }
	  } else {
	    res.send('아이디나 비밀번호 오류입니다.');
	  }
	  client.release();
	} catch (err) {
	  console.error(err);
	  res.send('내부 오류');
	}
  }
  
  function procLogout (req, res) {
	delete req.session.uid;
	res.redirect('/');	  
  }  
  
  async function procJoin (req, res) {
    try {
      const body = req.body;
      const client = await pool.connect();
	  const result = await client.query('select * from users where id = $1', [body.userId]);
      if (result.rows.length != 0) {
        res.send('아이디가 중복됩니다.');
      } else {
    	const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(body.userPwd, salt); 
    	const result = await client.query('insert into users(id, password, name, uid) values ($1, $2, $3, $4)', [body.userId, hash, body.userName, null]);
      }      
      client.release();
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }

  var NAME_KOR_NO_END_CONS = 0;
  var NAME_KOR_END_CONS = 1;
  
  var ITEM_TYPE_WEAPON = 0;
  var ITEM_TYPE_ARMOR = 1;
  var ITEM_TYPE_TRINKET = 2;

  var DAMAGE_TYPE_ABSOLUTE = 0;
  var DAMAGE_TYPE_PHYSICAL = 1;
  var DAMAGE_TYPE_MAGICAL = 2;
  
  var SKILL_TYPE_DRIVE = 10;
  var SKILL_TYPE_SPECIAL = 100;
  
  var ACTIVE_TYPE_ATTACK = 0;
  
  var EFFECT_TYPE_SELF_BUFF = 1;
  var EFFECT_TYPE_OPP_BUFF = 2;
  var EFFECT_TYPE_SELF_SP = 3;
  var EFFECT_TYPE_SELF_HP = 4;
  var EFFECT_TYPE_ADD_HIT = 5;
  
  var DURATION_TYPE_TURN_START = 1;
  var DURATION_TYPE_TURN_END = 0;
  
  var printName = {};
  printName.weapon = '무기';
  printName.armor = '갑옷';
  printName.trinket = '장신구';
  printName.maxHp = '생명력';
  printName.hpRegen = '생명력 재생';
  printName.spRegen = 'SP 재생';
  printName.spCharge = 'SP 충전';
  printName.phyAtk = '물리공격력';
  printName.magAtk = '마법공격력';
  printName.crit = '치명';
  printName.critDmg = '치명피해';
  printName.phyReduce = '물리저항';
  printName.magReduce = '마법저항';
  printName.hit = '명중';
  printName.evasion = '회피';
  
//var battleModule = 
 // {
    var charLeft = {};
    var charRight = {};
    var turnCount = 0;
    var result = '';
    

    function _doBattle() {
      _doBattleStart();

      while (!_isBattleFinished()) {
        _doBattleTurn();
      }
      return result;

      _doBattleEnd();
    }

    function _doBattleStart() {
      charLeft = {};
      charRight = {};
      result = '';
      turnCount = 0;
      // temp css
      result += '<style>.turnWrap {text-align: center; }' + 
        'span.turnCount {font-size: 20px; font-weight: bold; }' + 
        'span.skillUseWinner {font-weight: bold; }' +
        '.driveSkill {margin-top: 5px; font-weight: bold; }' +  
        '.specialSkill {margin-top: 7px; font-weight: bold; }' +  
        '.colorLeft {color: red; font-weight: bold; }' +  
        '.colorRight {color: blue; font-weight: bold; }' +  
        '.colorHp {color: green; }' +  
        '.colorSp {color: blue; }' +  
        '.charInfoWrap {width: 40%; margin: 10px auto; overflow: hidden; }' + 
        '.charInfo {text-align: center; width: 49%; float: left; border-top: 1px solid black; }</style>';
      
      _initChar(charLeft);
      _initChar(charRight);
      
      // test code
      charLeft.name = '카이네스 엠더츠';
      charLeft.nameType = NAME_KOR_NO_END_CONS;
      charLeft.items = {};
      var itemObj = {};
      itemObj.name = '엠더타이드 인장 지팡이';
      itemObj.nameType = NAME_KOR_NO_END_CONS;
      itemObj.type = ITEM_TYPE_WEAPON;
      itemObj.stat = {};
      itemObj.stat.magAtk = 12;
      itemObj.stat.spCharge = 4;
      itemObj.effect = [];
      charLeft.items.weapon = itemObj;
      itemObj = {};
      itemObj.name = '엠더타이드 세공 상의';
      itemObj.nameType = NAME_KOR_NO_END_CONS;
      itemObj.type = ITEM_TYPE_ARMOR;
      itemObj.stat = {};
      itemObj.stat.maxHp = 100;
      itemObj.stat.spRegen = 3;
      itemObj.effect = [];
      charLeft.items.armor = itemObj;
      itemObj = {};
      itemObj.name = '기만의 인장';
      itemObj.nameType = NAME_KOR_END_CONS;
      itemObj.type = ITEM_TYPE_TRINKET;
      itemObj.stat = {};
      itemObj.stat.magAtk = 2;
      itemObj.stat.spCharge = 2;
      itemObj.stat.spRegen = 2;
      itemObj.effect = [];
      charLeft.items.trinket = itemObj;
      
      charLeft.skill = {};
      charLeft.skill.base = [];
      
      var skillObj = {};
      skillObj.code = 20101;
      skillObj.name = '혼돈의 화살';
      skillObj.nameType = NAME_KOR_END_CONS;
      skillObj.type = DAMAGE_TYPE_MAGICAL;
      skillObj.damage = 1.2;
      skillObj.effect = [];
      var effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_BUFF;
      effectObj.chance = 1;
      effectObj.buffCode = 20101;
      effectObj.buffDur = 2;
      effectObj.value = 15;
      skillObj.effect.push(effectObj);           
      charLeft.skill.base.push(skillObj);
      
      skillObj = {};
      skillObj.code = 20102;
      skillObj.name = '파괴의 저주';
      skillObj.nameType = NAME_KOR_NO_END_CONS;
      skillObj.type = DAMAGE_TYPE_MAGICAL;
      skillObj.damage = 0.7;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_OPP_BUFF;
      effectObj.chance = 0.5;
      effectObj.buffCode = 20102;
      effectObj.buffDur = 3;
      effectObj.value = 0.1;
      skillObj.effect.push(effectObj);            
      charLeft.skill.base.push(skillObj);
      
      skillObj = {};
      skillObj.code = 20103;
      skillObj.name = '망각의 계약';
      skillObj.nameType = NAME_KOR_END_CONS;
      skillObj.type = DAMAGE_TYPE_MAGICAL;
      skillObj.damage = 1.1;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_SP;
      effectObj.chance = 0.3;
      effectObj.value = 15;
      skillObj.effect.push(effectObj); 
      charLeft.skill.base.push(skillObj);
      
      skillObj = {};
      skillObj.code = 20104;
      skillObj.name = '생명력 전환';
      skillObj.nameType = NAME_KOR_END_CONS;
      skillObj.type = SKILL_TYPE_DRIVE;
      skillObj.active = ACTIVE_TYPE_ATTACK;
      skillObj.cost = 0;
      skillObj.chance = 0.5;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_SP;
      effectObj.chance = 1;
      effectObj.value = 25;
      skillObj.effect.push(effectObj); 
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_HP;
      effectObj.chance = 1;
      effectObj.value = -20;
      skillObj.effect.push(effectObj); 
      charLeft.skill.drive = skillObj;
      
      skillObj = {};
      skillObj.code = 20105;
      skillObj.name = '지옥불길';
      skillObj.nameType = NAME_KOR_END_CONS;
      skillObj.type = SKILL_TYPE_SPECIAL;
      skillObj.cost = 90;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_BUFF;
      effectObj.chance = 1;
      effectObj.buffCode = 20103;
      effectObj.buffDur = 5;
      effectObj.value = 0.4;
      skillObj.effect.push(effectObj);    
      effectObj = {};
      effectObj.code = EFFECT_TYPE_OPP_BUFF;
      effectObj.chance = 1;
      effectObj.buffCode = 20103;
      effectObj.buffDur = 5;
      effectObj.value = 0.4;
      skillObj.effect.push(effectObj);    
      charLeft.skill.special = skillObj;
      
      charRight.name = '아서스 메네실';
      charRight.nameType = NAME_KOR_END_CONS;
      charRight.skill = {};
      charRight.skill.base = [];
      charRight.items = {};
      itemObj = {};
      itemObj.name = '서리한';
      itemObj.nameType = NAME_KOR_END_CONS;
      itemObj.type = ITEM_TYPE_WEAPON;
      itemObj.stat = {};
      itemObj.stat.phyAtk = 12;
      itemObj.stat.spRegen = 4;
      itemObj.effect = [];
      charRight.items.weapon = itemObj;
      itemObj = {};
      itemObj.name = '리치 왕의 세공 갑옷';
      itemObj.nameType = NAME_KOR_NO_END_CONS;
      itemObj.type = ITEM_TYPE_ARMOR;
      itemObj.stat = {};
      itemObj.stat.maxHp = 120;
      itemObj.stat.magReduce = 0.1;
      itemObj.effect = [];
      charRight.items.armor = itemObj;
      itemObj = {};
      itemObj.name = '서리 끼인 영혼의 망토';
      itemObj.nameType = NAME_KOR_NO_END_CONS;
      itemObj.type = ITEM_TYPE_TRINKET;
      itemObj.stat = {};
      itemObj.stat.crit = 0.25;
      itemObj.effect = [];
      charRight.items.trinket = itemObj;
      
      var skillObj = {};
      skillObj.code = 20091;
      skillObj.name = '죽음의 고리';
      skillObj.nameType = NAME_KOR_NO_END_CONS;
      skillObj.type = DAMAGE_TYPE_PHYSICAL;
      skillObj.damage = 1.3;
      skillObj.effect = [];
      var effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_HP;
      effectObj.chance = 1;
      effectObj.value = 15;
      skillObj.effect.push(effectObj);           
      charRight.skill.base.push(skillObj);
      
      skillObj = {};
      skillObj.code = 20092;
      skillObj.name = '울부짖는 한파';
      skillObj.nameType = NAME_KOR_NO_END_CONS;
      skillObj.type = DAMAGE_TYPE_PHYSICAL;
      skillObj.damage = 0.5;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_OPP_BUFF;
      effectObj.chance = 0.5;
      effectObj.buffCode = 4;
      effectObj.buffDur = 1;
      skillObj.effect.push(effectObj);            
      charRight.skill.base.push(skillObj);
      
      skillObj = {};
      skillObj.code = 20093;
      skillObj.name = '서리 폭풍우';
      skillObj.nameType = NAME_KOR_NO_END_CONS;
      skillObj.type = DAMAGE_TYPE_PHYSICAL;
      skillObj.damage = 1.2;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_BUFF;
      effectObj.chance = 1;
      effectObj.buffCode = 20091;
      effectObj.buffDur = 3;
      effectObj.value = 4;
      skillObj.effect.push(effectObj); 
      charRight.skill.base.push(skillObj);
      
      skillObj = {};
      skillObj.code = 20094;
      skillObj.name = '서리한이 굶주렸다';
      skillObj.nameType = NAME_KOR_NO_END_CONS;
      skillObj.type = SKILL_TYPE_DRIVE;
      skillObj.active = ACTIVE_TYPE_ATTACK;
      skillObj.cost = 5;
      skillObj.chance = 0.25;
      skillObj.effect = [];
      effectObj = {};
      effectObj.code = EFFECT_TYPE_ADD_HIT;
      effectObj.chance = 1;
      effectObj.value = 0.4;
      skillObj.effect.push(effectObj); 
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_BUFF;
      effectObj.chance = 1;
      effectObj.buffCode = 20093;
      effectObj.buffDur = null;
      effectObj.value = 1;
      skillObj.effect.push(effectObj); 
      charRight.skill.drive = skillObj;
      
      skillObj = {};
      skillObj.code = 20095;
      skillObj.name = '사자의 군대';
      skillObj.nameType = NAME_KOR_NO_END_CONS;
      skillObj.type = SKILL_TYPE_SPECIAL;
      skillObj.cost = 120;
      skillObj.effect = [];  
      effectObj = {};
      effectObj.code = EFFECT_TYPE_SELF_BUFF;
      effectObj.chance = 1;
      effectObj.buffCode = 20092;
      effectObj.buffDur = 8;
      effectObj.value = 0.02;
      skillObj.effect.push(effectObj); 
      charRight.skill.special = skillObj;
      
      calcStats(charLeft);
      calcStats(charRight);
      setCharacter('thelichking', '1', charRight);
      charLeft.curHp = charLeft.stat.maxHp;
      charRight.curHp = charRight.stat.maxHp;
      printCharInfo(0);
    }
    
    function _doBattleTurn() {
      turnCount++;
      result += '<br><div class="turnWrap"><span class="turnCount">' + turnCount + '턴</span><br>';
      
      // decide winner
      var winner = getRandom(0.5) ? charLeft : charRight;
      var loser = (winner === charLeft) ? charRight : charLeft;
      
      // decide skill
      var skillUsed = undefined;
      var skillFailed = undefined;
      while (!skillUsed) {
    	var rand = Math.random();
    	if (rand < 0.33) {
    	  skillUsed = winner.skill.base[0];
    	  skillFailed = loser.skill.base[2];
    	} else if (rand < 0.66) {
          skillUsed = winner.skill.base[1];
    	  skillFailed = loser.skill.base[0];
       	} else if (rand < 0.99) {
          skillUsed = winner.skill.base[2];
    	  skillFailed = loser.skill.base[1];
       	}
      }
      result += '<div class="skillResolutionWrap"><span class="skillUse">';
      if (winner == charLeft) {
    	result += '<span class="skillUseWinner">' + charLeft.name + '의 [ ' + skillUsed.name + ' ]</span> vs ' + charRight.name + '의 [ ' + skillFailed.name + ' ]</span><br>';
      } else {
      	result += charLeft.name + '의 [ ' + skillFailed.name + ' ] vs <span class="skillUseWinner">' + charRight.name + '의 [ ' + skillUsed.name + ' ]</span></span><br>';
      }
      
      // calc damage
      var damage = calcDamage(winner, loser, skillUsed);
      resolveTurnBegin(winner, loser);
      if (damage.hit) {
        result += '<span class="skillDamage">' + winner.name + getIga(winner.nameType) + ' [ ' + skillUsed.name + ' ] ' + getUro(skillUsed.nameType) + ' ';
        result += loser.name + getUlrul(loser.nameType) + ' 공격해 ' + damage.value + '대미지를 입혔습니다!';
        if (damage.crit) {
      	  result += ' (치명타)';
        }
        result += '</span><br>';
        
        resolveEffects(winner, loser, skillUsed.effect);
        if (winner.skill.drive.active === ACTIVE_TYPE_ATTACK && getRandom(winner.skill.drive.chance)) {
          winner.curSp -= winner.skill.drive.cost;
          result += '<div class="driveSkill">[ ' + winner.name + ' ] Drive Skill - [ ' + winner.skill.drive.name + ' ] 발동!</div>';
          resolveEffects(winner, loser, winner.skill.drive.effect);
        }
        dealDamage(winner, loser, damage);
        winner.curSp += winner.stat.spCharge;
      }

      resolveTurnEnd(winner, loser);
      
      if (winner.skill.special.cost <= winner.curSp) {
        result += '<div class="specialSkill">[ ' + winner.name + ' ] Special Skill - [ ' + winner.skill.special.name + ' ] 발동!</div>';
    	winner.curSp = 0;
    	resolveEffects(winner, loser, winner.skill.special.effect);
      }
      if (loser.skill.special.cost <= loser.curSp) {
        result += '<div class="specialSkill">[ ' + loser.name + ' ] Special Skill - [ ' + loser.skill.special.name + ' ] 발동!</div>';
      	loser.curSp = 0;
      	resolveEffects(loser, winner, loser.skill.special.effect);
      }
      
      result += '</div></div>';
      
      printCharInfo(1);
    }
    
    function calcDamage(winner, loser, skill) {
      var retObj = {};
      var isPhysical = (skill.type === DAMAGE_TYPE_PHYSICAL);
      var atkRat = isPhysical ? winner.stat.phyAtk : winner.stat.magAtk;
      var defReduce = isPhysical ? loser.stat.phyReduce : loser.stat.magReduce;
      var randDmg = Math.random() * 0.2 + 0.9;
      
      if (skill.type === DAMAGE_TYPE_ABSOLUTE) {
    	atkRat = skill.damage;
    	defReduce = 0;
      }

      for (val of findBuffByCode(winner, 2)) {
    	if (val.buff.id === 20101 && skill.code === 20101) {
    	  atkRat += val.value;
      	  result += '[ ' + val.buff.name + ' ] 효과로 공격력이 ' + val.value + ' 올랐습니다!<br>';
    	}
      }
      
      retObj.hit = getRandom(winner.stat.hit - loser.stat.evasion);
      retObj.crit = getRandom(winner.stat.crit);
      
      var damage = (skill.damage * atkRat) * (1 - defReduce);
      damage *= randDmg;
      if (retObj.crit) {
    	damage *= winner.stat.critDmg;
      }
      retObj.value = Math.round(damage);
      
      return retObj;
    }
    
    function dealDamage(src, dst, damage) {
      dst.curHp -= damage.value;
    }
    
    function resolveEffects(winner, loser, effects) {
      for (var i = 0; i < effects.length; i++) {
    	if (!getRandom(effects[i].chance)) {
    	  continue;
    	}
    	if (effects[i].code === EFFECT_TYPE_SELF_BUFF || effects[i].code === EFFECT_TYPE_OPP_BUFF) {
    	  var buffObj = getBuffData(effects[i]);
    	  buffObj.dur = effects[i].buffDur;
    	  
    	  var recv = (effects[i].code === EFFECT_TYPE_SELF_BUFF) ? winner : loser;
    	  result += recv.name + getUnnun(recv.nameType) + ' [ ' + buffObj.name + ' ] 효과를 받았습니다!<br>';
    	  
    	  var buffChk = recv.buffs.find(e => (e.id === buffObj.id));
    	  if (buffChk) {
    	    if (buffObj.stackType === 1) {
    	      buffChk.dur = buffObj.dur;
    	    } else if (buffObj.stackType === 2) {
    	      if (buffChk.stack) {
    	    	buffChk.stack += 1;
    	      } else {
    	    	buffChk.stack = 2;
    	      }
    	    } else if (buffObj.stackType === 3) {
        	  recv.buffs.push(buffObj);
      	    }
    	  } else {
    	    recv.buffs.push(buffObj);
    	  }   	  
    	  
    	} else if (effects[i].code === EFFECT_TYPE_SELF_SP || effects[i].code === EFFECT_TYPE_SELF_HP) {
    	  if (effects[i].code === EFFECT_TYPE_SELF_SP) {
    	    winner.curSp += effects[i].value;
    	    var target = 'SP';
    	  } else {
    	    winner.curHp += effects[i].value;
    	    var target = 'HP';      
    	  }
    	  var act = (effects[i].value > 0) ? '회복했다' : '잃었다';
    	  result += winner.name + getUnnun(winner.nameType) + ' ' + target + '를 ' + Math.abs(effects[i].value) + ' ' + act + '!<br>';
    	} else if (effects[i].code === EFFECT_TYPE_ADD_HIT) {
    	  var tempObj = {};
    	  tempObj.damage = effects[i].value;
    	  tempObj.type = DAMAGE_TYPE_PHYSICAL;
    	  var damage = calcDamage(winner, loser, tempObj);
    
          result += '<span class="skillDamage">' + loser.name + getUnnun(loser.nameType) + ' 추가로 ' + damage.value + '대미지를 입었습니다!';
          if (damage.crit) {
            result += ' (치명타)';
          }
          result += '</span><br>';
          dealDamage(winner, loser, damage);
      	}
      }
    }
    
    function resolveTurnBegin(winner, loser) {
      calcStats(winner);
      calcStats(loser);
      resolveTurnBeginChar(winner);
      resolveTurnBeginChar(loser);
    }
    
    function resolveTurnBeginChar(chara) {
     
      for (buff of chara.buffs) {
    	if (buff.durOff === DURATION_TYPE_TURN_START) {
    	  buff.dur--;
    	}
    	if (buff.dur >= 0) {
    	
    	}
      }
      chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
    }
    
    function resolveTurnEnd(winner, loser) {
      calcStats(winner);
      calcStats(loser);
      resolveTurnEndChar(winner, loser);
      resolveTurnEndChar(loser, winner);
    }
    
    function resolveTurnEndChar(chara, opp) {
      chara.curHp += chara.stat.hpRegen;
      chara.curSp += chara.stat.spRegen;
      if (chara.curHp > chara.stat.maxHp) {
    	chara.curHp = chara.stat.maxHp;
      }
     
      for (buff of chara.buffs) {
    	if (buff.durOff === DURATION_TYPE_TURN_END) {
    	  buff.dur--;
    	}
    	if (buff.dur >= 0) {
    	  for (eff of buff.effect) {
            if (eff.code === 1) {
              var stackMpl = buff.stack ? buff.stack : 1;
              eff.damage = eff.value * stackMpl;
              var damage = calcDamage(opp, chara, eff);
              
              result += '<span class="skillDamage">' + chara.name + getUnnun(chara.nameType) + ' [ ' + buff.name + ' ] 효과로 ' + damage.value + '대미지를 입었습니다!';
              if (damage.crit) {
          	    result += ' (치명타)';
              }
              result += '</span><br>';
              dealDamage(opp, chara, damage);
    	    } else if (eff.code === 4) {
        	  var stackMpl = buff.stack ? buff.stack : 1;
              eff.damage = eff.value * stackMpl;
              var damage = calcDamage(chara, opp, eff);
        		
              result += '<span class="skillDamage">' + opp.name + getUnnun(opp.nameType) + ' [ ' + buff.name + ' ] 효과로 ' + damage.value + '대미지를 입었습니다!';
              if (damage.crit) {
                result += ' (치명타)';
              }
              result += '</span><br>';
              dealDamage(chara, opp, damage);
            }
    	  }
    	}
      }
      chara.buffs = chara.buffs.filter(x => (x.dur > 0) || (x.dur === null));
    }
    
    function getBuffData(eff) {
      var retObj = {};
      retObj.id = eff.buffCode;
      switch (eff.buffCode) {
      case 4 : 
        retObj.name = '기절';
        retObj.nameType = NAME_KOR_END_CONS;
    	retObj.durOff = DURATION_TYPE_TURN_START;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 104;
      	retObj.effect.push(effectObj);
        break;
      case 20101 : 
      	retObj.name = '혼돈의 힘';
      	retObj.nameType = NAME_KOR_END_CONS;
  	    retObj.durOff = DURATION_TYPE_TURN_START;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 2;
      	effectObj.value = eff.value;
      	effectObj.buff = retObj;
      	retObj.effect.push(effectObj);
      	break;
      case 20102 : 
      	retObj.name = '파괴됨';
      	retObj.nameType = NAME_KOR_END_CONS;
      	retObj.stackType = 1;
  	    retObj.durOff = DURATION_TYPE_TURN_START;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 1;
      	effectObj.value = eff.value;
      	effectObj.type = DAMAGE_TYPE_MAGICAL;
      	retObj.effect.push(effectObj);
      	break;
      case 20103 : 
      	retObj.name = '지옥불길';
      	retObj.nameType = NAME_KOR_END_CONS;
  	    retObj.durOff = DURATION_TYPE_TURN_START;
      	retObj.stackType = 3;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 1;
      	effectObj.value = eff.value;
      	effectObj.type = DAMAGE_TYPE_MAGICAL;
      	retObj.effect.push(effectObj);
      	break;
      case 20091 : 
        retObj.name = '서리 폭풍우';
        retObj.nameType = NAME_KOR_NO_END_CONS;
      	retObj.stackType = 1;
  	    retObj.durOff = DURATION_TYPE_TURN_START;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 3;
      	effectObj.value = eff.value;
      	effectObj.key = 'hpRegen';
      	effectObj.buff = retObj;
      	retObj.effect.push(effectObj);
        break;
      case 20092 : 
        retObj.name = '사자의 군대';
        retObj.nameType = NAME_KOR_NO_END_CONS;
      	retObj.stack = 8;
  	    retObj.durOff = DURATION_TYPE_TURN_START;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 4;
      	effectObj.value = eff.value;
      	effectObj.type = DAMAGE_TYPE_PHYSICAL;
      	retObj.effect.push(effectObj);
      	effectObj = {};
      	effectObj.code = 5;
      	effectObj.value = eff.value;
      	retObj.effect.push(effectObj);
        break;
      case 20093 : 
        retObj.name = '서리한 포식';
        retObj.nameType = NAME_KOR_END_CONS;
      	retObj.stackType = 2;
      	retObj.stack = 1;
      	retObj.effect = [];
      	var effectObj = {};
      	effectObj.code = 3;
      	effectObj.value = eff.value;
      	effectObj.key = 'spRegen';
      	effectObj.buff = retObj;
      	retObj.effect.push(effectObj);
        break;
      }
      
      return retObj;
    }
    
    function findBuffByCode(chara, code) {
      if (!chara.buffs || chara.buffs.length === 0) {
    	return [];
      }
      return chara.buffs.map(x => x.effect).reduce((acc, val) => acc.concat(val)).filter(x => (x.code == code));
    }
    
    function calcStats(chara) {
      for (var key in chara.base) {
    	chara.stat[key] = chara.base[key];
      }
      for (var key in chara.items) {
    	for (var keyItem in chara.items[key]['stat']) {
      	  chara.stat[keyItem] += chara.items[key]['stat'][keyItem];
    	}
      }

      for (val of findBuffByCode(chara, 3)) {
  		var stackMpl = val.buff.stack ? val.buff.stack : 1;
    	chara.stat[val.key] += val.value * stackMpl;
      }
    }
     
    function _isBattleFinished() {
      return (charLeft.curHp <= 0 || charRight.curHp <= 0);
    }
    
    function getRandom(percent) {
      return (Math.random() < percent);
    }
    
    function getIga(type) {
      return (type === NAME_KOR_NO_END_CONS) ? '가' : '이';
    }
    
    function getUro(type) {
      return (type === NAME_KOR_NO_END_CONS) ? '로' : '으로';
    }
    
    function getUlrul(type) {
      return (type === NAME_KOR_NO_END_CONS) ? '를' : '을';
    }
    
    function getUnnun(type) {
      return (type === NAME_KOR_NO_END_CONS) ? '는' : '은';
    }

    function _initChar(char) {
      char.stat = {};
      char.stat.maxHp = 400;
      char.stat.spCharge = 5;
      char.stat.hpRegen = 0;
      char.stat.spRegen = 5;
      char.stat.phyAtk = 20;
      char.stat.magAtk = 20;
      char.stat.crit = 0.05;
      char.stat.critDmg = 1.5;
      char.stat.phyReduce = 0;
      char.stat.magReduce = 0;
      char.stat.hit = 1;
      char.stat.evasion = 0;
      char.base = JSON.parse(JSON.stringify(char.stat));
      char.inventory = [];
      
      char.curHp = char.stat.maxHp;
      char.curSp = 0;
      char.buffs = [];
      char.items = {};
    }
    
    function printCharInfo(flag) {
      result += '<div class="charInfoWrap">' + printChar(charLeft, 'Left', flag) + printChar(charRight, 'Right', flag) + '</div>';
    }
    
    function printChar(chara, name, flag) {
      var resultStr = '<div class="charInfo">' +
        '<div class="charInfoName color' + name + '">' + chara.name + '</div>' +
        '<div class="charInfoPoint"><span class="charInfoPointView">' + chara.curHp + ' / ' + chara.stat.maxHp + '</span> ' +
        '<span class="charInfoPointRegen colorHp">(+' + chara.stat.hpRegen + ')</span></div>' +
        '<div class="charInfoPoint"><span class="charInfoPointView">' + chara.curSp + ' / ' + chara.skill.special.cost + '</span> ' +
        '<span class="charInfoPointRegen colorSp">(+' + chara.stat.spRegen + ')</span></div>';

      if (flag === 0) {
    	resultStr += '<div class="charInfoItems">';
    	for (const [key, val] of Object.entries(chara.items)) {
    	  resultStr += printName[key] + ' : ' + val.name + '<br>(';
    	  resultStr += Object.entries(val.stat).map(arr => { if (arr[1] > 0 && arr[1] < 1) arr[1] *= 100; return printName[arr[0]] + ' ' + arr[1]; }).join(', ') + ')<br>';
    	}
    	resultStr += '</div>';
      }
      if (flag === 1) {
    	resultStr += '<div class="charInfoBuffs">';
    	for (val of chara.buffs) {
    	  resultStr += val.name;
    	  if (val.stack) {
    		resultStr += ' (' + val.stack + ')';
    	  }
    	  if (val.dur) {
      		resultStr += ' (' + val.dur + '턴 남음)';
      	  }
    	  resultStr += '<br>';
    	}
    	resultStr += '</div>';
      }
      
      resultStr += '</div>';
      return resultStr;
    }
 // }