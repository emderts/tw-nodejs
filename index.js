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
var cron = require('node-cron');
const battlemodule = require('./battlemodule');
const chara = require('./chara');
const cons = require('./constant');

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
  .post('/unequipItem', procUnequip)
  .post('/useItem', procUseItem)
  .get('/battleList', procBattleList)
  .post('/doBattle', procBattle)
  .get('/battleLogs', procBattleLogList)
  .post('/battleLog', procBattleLog)
  .post('/useStatPoint', procUseStatPoint)
  .post('/doRankup', procRankup)
  .get('/test', (req, res) => res.render('pages/battle', {result: battlemodule.doBattle(chara.julius, chara.aeohelm).result}))
  .get('/test2', (req, res) => res.send(procFullTest()))
  .get('/test3', (req, res) => res.send(setCharacter('kemderts', 2, chara.kines)))
  .get('/test4', (req, res) => res.send(setCharacter('thelichking', 1, chara.lk)))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
  function procFullTest() {
    var testChars = [chara.julius, chara.seriers, chara.aeika, chara.psi, chara.aeohelm, chara.lk];
    var testResults = [];
    var testTurns = [];
    var resultStr = '';
    for ([ind, left] of testChars.entries()) {
      testResults.push([0, 0, 0, 0, 0, 0]);
      testTurns.push([0, 0, 0, 0, 0, 0]);
      for ([indr, right] of testChars.entries()) {
        if (left == right) {
          continue;
        }
        for (var i=0; i<1000; i++) {
          var ret = battlemodule.doBattle(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));
          testResults[ind][indr] += (ret.winnerLeft ? 1 : 0);
          testTurns[ind][indr] += ret.turnCount;
        }
        resultStr += left.name + ' vs ' + right.name + ' : ' + testResults[ind][indr] + ', ' + testTurns[ind][indr] + '<br>';
      }
      resultStr += '<br>';
    }
    
    return resultStr;
}

cron.schedule('0 0,6,12,18 * * 1-5', async function() {
  const client = await pool.connect();
  await client.query('update characters set actionPoint = actionPoint + 1 where actionPoint < 10');
  client.release();  
})

cron.schedule('0 0,6,12,18 * * 6-7', async function() {
  const client = await pool.connect();
  await client.query('update characters set actionPoint = actionPoint + 3');
  await client.query('update characters set actionPoint = 10 where actionPoint > 10');
  client.release();  
})

  async function procIndex (req, res) {
    const sess = req.session; 
    const char = await getCharacter(sess.userUid);
    res.render('pages/index', {
      user: sess.userUid+1 ? {name: sess.userName} : null,
      char: char.char_data ? JSON.parse(char.char_data) : {},
      actionPoint : char.actionPoint
    }); 
  }

  async function procUseStatPoint (req, res) {
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    if (char.statPoint > 0) {
      char.statPoint -= 1;
      var value = (req.body.keyType ==='maxHp') ? 10 : 1;
      char.base[req.body.keyType] += value;
      calcStats(char);
    } 
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    res.redirect('/');
  }

  async function procRankup (req, res) {
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    if (char.level >= 20 && char.rank > 1) {
      char.level = 1;
      char.rank--;
      char.reqExp += 20;
      char.base.maxHp += 150;
      char.base.phyAtk += 10;
      char.base.magAtk += 10;
      calcStats(char);
    } 
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    res.redirect('/');
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

  async function procBattleList(req, res) {
    try {
      const client = await pool.connect();
      const resultUser = await client.query('select * from users where id = $1', [req.session.userUid]);
      const result = await client.query('select * from characters where uid <> $1', [resultUser.rows[0].uid]);
      var rval = [];
      for (val of result.rows) {
        var charData = JSON.parse(val.char_data);
        var obj = {};
        obj.name = charData.name + ', ' + charData.title;
        obj.uid = val.uid;
        rval.push(obj);
      } 
      res.render('pages/battleList', {list: rval});
      client.release();
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }

  async function procBattleLogList(req, res) {
    try {
      const client = await pool.connect();
      const result = await client.query('select id, title, date from results');
      res.render('pages/battleLogList', {list: result.rows});
      client.release();
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }

  async function procBattle(req, res) {
    try {
      const body = req.body;
      const client = await pool.connect();
      const resultUser = await client.query('select * from users where id = $1', [req.session.userUid]);
      const result = await client.query('select * from characters');
      var left, right;
      var cuid, cap;
      for (val of result.rows) {
        if (val.uid === resultUser.rows[0].uid) {
          left = JSON.parse(val.char_data);
          cuid = val.uid;
          cap = val.actionpoint;
          if (cap === 0) {
            client.release();
            res.redirect('/');
            return;
          }
        } else if (val.uid === body.charUid) {
          right = JSON.parse(val.char_data);
        }
      } 
      if (left && right) {
        var re = battlemodule.doBattle(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));
        addExp(left, re.expLeft);
        addExp(right, re.expRight);
        addResultCard(left);
        addResultCard(right);
        if (re.winnerLeft) {
          addResultCard(left);
        }
        if (re.winnerRight) {
          addResultCard(right);
        }
        await client.query('update characters set char_data = $1, actionPoint = $2 where uid = $3', [JSON.stringify(left), cap-1,  cuid]);
        await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(right), body.charUid]);
        var winner = re.winnerLeft ? left.name + ' 승리!' : (re.winnerRight ? right.name + ' 승리!' : '');
        var battleTitle = '[ ' + left.name + ' ] vs [ ' + right.name + ' ] - ' + winner;
        await client.query('insert into results(title, result, date) values ($1, $2, $3)', [battleTitle, re.result, new Date()]);
        res.render('pages/battle', {result: re.result});
      } else {
        res.redirect('/');
      }
      client.release();
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }

  async function procBattleLog(req, res) {
    try {
      const client = await pool.connect();
      const result = await client.query('select * from results where id = $1', [req.body.logId]);
      res.render('pages/battle', {result: result.rows[0].result});
      client.release();
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }
  
  function procLogout (req, res) {
	delete req.session.userUid;
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
    	res.send('가입되었습니다!');
      }      
      client.release();
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }
  
  async function procUnequip (req, res) {
    try {
      var chara;
      const body = req.body;
      const client = await pool.connect();
	  const result = await client.query('select * from users where id = $1', [req.session.userUid]);
	  if (result.rows.length > 0) {
		const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
	    if (resultChar.rows.length > 0) {
		  chara = JSON.parse(resultChar.rows[0].char_data);
		  var tgtObj = chara.items[body.itemType];
		  chara.items[body.itemType] = undefined;
		  calcStats(chara);
		  chara.inventory.push(tgtObj);
		  await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(chara), result.rows[0].uid]);
	    }
	  }
      client.release();
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }
  
  async function procUseItem (req, res) {
    try {
      var chara;
      const body = req.body;
      const client = await pool.connect();
	  const result = await client.query('select * from users where id = $1', [req.session.userUid]);
	  if (result.rows.length > 0) {
		const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
	    if (resultChar.rows.length > 0) {
		  chara = JSON.parse(resultChar.rows[0].char_data);
		  var tgtObj = chara.inventory[body.itemNum];
		  if (tgtObj.type < 10) {
		    if (Math.abs(tgtObj.rank - chara.rank) >= 2) {
		      res.send('착용할 수 없는 급수의 아이템입니다.');
		      return;
		    }
			chara.inventory.splice(body.itemNum, 1);
			var itemType = (tgtObj.type === cons.ITEM_TYPE_WEAPON) ? 'weapon' : ((tgtObj.type === cons.ITEM_TYPE_ARMOR) ? 'armor' : ((tgtObj.type === cons.ITEM_TYPE_SUBARMOR) ? 'subarmor' : 'trinket'));
			var curItem = chara.items[itemType];
			if (curItem) {
			  chara.items[itemType] = undefined;
			  chara.inventory.push(curItem);				
			}
			chara.items[itemType] = tgtObj;
			calcStats(chara);
		  }
		  await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(chara), result.rows[0].uid]);
	    }
	  }
      client.release();
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.send('내부 오류');
    }
  }

  async function getCharacter (id) {
    try {
      var rval = {};
      const client = await pool.connect();
      const result = await client.query('select * from users where id = $1', [id]);
      if (result.rows.length > 0) {
        const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
        if (resultChar.rows.length > 0) {
          rval.char_data = resultChar.rows[0].char_data;
          rval.actionPoint = resultChar.rows[0].actionpoint;
          rval.uid = resultChar.rows[0].uid;
        }
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
      const result = await client.query('insert into characters(uid, char_data) values ($1, $2)', [uid, data]);
      const result2 = await client.query('update users set uid = $1 where id = $2', [uid, id]);
      
      client.release();
    } catch (err) {
      console.error(err);
    }   
    
  }

  function addExp(chara, exp) {
    chara.exp += exp;
    if (chara.statPoint) {
      chara.statPoint = 0;
    }
    while (chara.level < 50 && chara.exp >= chara.reqExp) {
      chara.exp -= chara.reqExp;
      chara.level++;
      chara.statPoint += 2;
    }
  }

  function addResultCard(chara) {
    var item = {};
    item.type = cons.ITEM_TYPE_RESULT_CARD;
    item.name = chara.rank + '급 리절트 카드';
    item.rank = chara.rank;
    item.day = new Date().getDay();
    chara.inventory.push(item);
  }
  
  function calcStats(chara) {
    for (var key in chara.base) {
      chara.stat[key] = chara.base[key];
    }
    for (var key in chara.items) {
      if (!chara.items[key]) {
        continue;
      }
      for (var keyItem in chara.items[key]['stat']) {
        chara.stat[keyItem] += chara.items[key]['stat'][keyItem];
      }
    }
  }

 // }