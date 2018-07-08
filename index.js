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
  .get('/test', (req, res) => res.render('pages/battle', {result: battlemodule.doBattle(chara.psi, chara.julius)}))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  async function procIndex (req, res) {
    const sess = req.session; 
    const char = await getCharacter(sess.userUid);
    res.render('pages/index', {
      user: sess.userUid+1 ? {name: sess.userName} : null,
      char: char
    }); 
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
      const result = await client.query('insert into characters(uid, char_data) values ($1, $2)', [uid, data]);
      const result2 = await client.query('update users set uid = $1 where id = $2', [uid, id]);
      
      client.release();
    } catch (err) {
      console.error(err);
    }   
    
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