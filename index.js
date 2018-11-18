const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const PORT = process.env.PORT || 5000;
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
const item = require('./items');
const monster = require('./monster');
const sessionMiddleware = session({
  secret: 'ewqwwolpe!d.ldx42EsCCXD#!$()_*#@',
  resave: true,
  saveUninitialized: true
});;

const app = express()
.use(express.static(path.join(__dirname, 'public')))
.use(sessionMiddleware)
.use(bodyParser.urlencoded({extended: false}))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', procIndex)
.get('/login', (req, res) => res.render('pages/login'))
.post('/login', procLogin)
.get('/join', (req, res) => res.render('pages/join'))
.post('/join', procJoin)
.get('/logout', procLogout)
.post('/useItem', procUseItem)
.post('/unequipItem', procUnequip)
.post('/enchantItem', procEnchantItem)
.get('/battleList', procBattleList)
.post('/doBattle', procBattle)
.get('/battleLogs', procBattleLogList)
.post('/battleLog', procBattleLog)
.get('/viewList', procViewList)
.post('/viewChar', procView)
.get('/shop', procShop)
.post('/useShop', procUseShop)
.get('/dungeon', procDungeon)
.post('/enterDungeon', procEnterDungeon)
.get('/nextPhaseDungeon', procNextPhaseDungeon)
.get('/dismantlingYard', procDismantlingYard)
.post('/dismantleItem', procDismantleItem)
.post('/useStatPoint', procUseStatPoint)
.post('/doRankup', procRankup)
.get('/test', (req, res) => res.render('pages/battle', {result: battlemodule.doBattle(chara.julius, monster.mCrawler).result}))
.get('/test2', (req, res) => res.send(setCharacter('kemderts', 1, chara.kines)))
.get('/test3', (req, res) => res.send(setCharacter('thelichking', 2, chara.lk)))
//.get('/test3', (req, res) => res.send(procInit()))
.get('/test5', (req, res) => res.render('pages/resultCard', {item : {name: 'test', rarity: Math.floor(Math.random() * 6)}}))
.get('/test6', (req, res) => res.render('pages/index', {
  user: {name: 'kk'},
  char: chara.julius,
  actionPoint : 0,
  news : []
}))
.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(app);
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
app

var ring = [];
var people = [];
var trades = {};
io.on('connection', (socket) => {
  socket.on('login', function(userName, uid) {
    socket.request.session.userName = userName;
    socket.request.session.charData = chara.julius;//await getCharacter(uid);
    people.push(userName);
    socket.emit('logged in', ring, people);
  });
  
  socket.on('chat message', function(msg) {
    ring.push({userName : socket.request.session.userName, message : msg });
    if (ring.length > 30) {
      ring.shift();
    }
    io.emit('chat message', socket.request.session.userName, msg);
  });
  
  socket.on('tradeInit', function(mode, uid) {
    console.log('tradeInit');
    if (mode == 1) {
      socket.broadcast.emit('tradeReq', uid, socket.request.session.charUid, socket.request.session.userName);
      var tradeData = {};
      tradeData.ouid = uid;
      tradeData.socket = socket;
      trades[socket.request.session.charUid] = tradeData;
    } else if (mode == 2) {
      var tradeData = trades[uid];
      socket.emit('tradeAck', socket.request.session.charData.inventory);
      tradeData.socket.emit('tradeAck', tradeData.socket.request.session.charData.inventory);
    }
  });
  
  socket.on('disconnect', function() {
    console.log('dc');
    people = people.filter(x => x != socket.request.session.userName);
    io.emit('person left', people);
  });
  
  socket.on('logout', function() {
    if (socket.handshake.session.userName) {
      delete socket.handshake.session.userName;
    }
    if (socket.handshake.session.charData) {
      delete socket.handshake.session.charData;
    }
  });  
});

function procFullTest() {
  var testChars = [chara.julius, chara.seriers, chara.aeika, chara.psi, chara.aeohelm, chara.nux];
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

async function procInit () {
  await setCharacter('thelichking', 1, chara.lk);
  await setCharacter('kemderts', 2, chara.kines);
  await setCharacter('bemderts', 3, chara.julius);
  await setCharacter('renia1369', 4, chara.psi);
  await setCharacter('bear1704', 5, chara.aeika);
  await setCharacter('megaxzero', 6, chara.seriers);
  await setCharacter('kyrus1300', 7, chara.aeohelm);
}

async function procIndex (req, res) {
  const sess = req.session; 
  const char = await getCharacter(sess.userUid);
  const news = await getNews(5);
  if (!sess.userUid) {
    res.render('pages/login');
  } else {
    res.render('pages/index', {
      user: {name: sess.userName, uid : sess.userUid},
      char: char.char_data ? JSON.parse(char.char_data) : undefined,
      actionPoint : char.actionPoint,
      news : news
    });
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

async function procJoin (req, res) {
  try {
    const body = req.body;
    if (body.userPwd !== body.userPwdCheck) {
      res.send('비밀번호 확인이 잘못되었습니다.');
      return;      
    }
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

function procLogout (req, res) {
  delete req.session.userUid;
  res.redirect('/');      
}  

function _getItem(rank, rarity, type) {
  var usedRank = rank < 1 ? 1 : rank;
  if (rarity == cons.ITEM_RARITY_COMMON_UNCOMMON) {
    var tgtList = item.list.filter(x => x.rank === usedRank && (x.rarity === cons.ITEM_RARITY_COMMON || x.rarity === rarity) && x.type <= 3);
  } else {
    var tgtList = item.list.filter(x => x.rank === usedRank && x.rarity === rarity && x.type <= 3);    
  }
  if (type <= 3) {
    tgtList = tgtList.filter(x => x.type === type)
  }
  return JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));  
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
            client.release();
            return;
          }
          chara.inventory.splice(body.itemNum, 1);
          var itemType = (tgtObj.type === cons.ITEM_TYPE_WEAPON) ? 'weapon' : ((tgtObj.type === cons.ITEM_TYPE_ARMOR) ? 'armor' : ((tgtObj.type === cons.ITEM_TYPE_SUBARMOR) ? 'subarmor' : ((tgtObj.type === cons.ITEM_TYPE_TRINKET) ? 'trinket' : 'skillArtifact')));
          var curItem = chara.items[itemType];
          if (curItem) {
            chara.items[itemType] = undefined;
            chara.inventory.push(curItem);              
          }
          chara.items[itemType] = tgtObj;
          calcStats(chara);
        } else if (tgtObj.type === cons.ITEM_TYPE_RESULT_CARD) {
          chara.inventory.splice(body.itemNum, 1);
          if (tgtObj.resultType === undefined) {
            var rand = Math.random();
            if (rand < 0.193) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_COMMON_UNCOMMON);
              chara.inventory.push(picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.239) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.249) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.25) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.58) {
              chara.premiumPoint += 1;
              res.render('pages/resultCard', {item : {name : '프리미엄 포인트 1점' , rarity : cons.ITEM_RARITY_COMMON}});
            } else if (rand < 0.6) {
              chara.premiumPoint += 2;
              res.render('pages/resultCard', {item : {name : '프리미엄 포인트 2점' , rarity : cons.ITEM_RARITY_RARE}});
            } else if (rand < 0.8) {
              const dustValue = 7 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              res.render('pages/resultCard', {item : {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_COMMON}});
            } else if (rand < 0.89) {
              const dustValue = 13 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              res.render('pages/resultCard', {item : {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_UNCOMMON}});
            } else if (rand < 0.9) {
              const dustValue = 50 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              res.render('pages/resultCard', {item : {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_RARE}});
            } else {
              var picked = makeDayStone();
              chara.inventory.push(picked);
              res.render('pages/resultCard', {item : picked});              
            }
          } else if (tgtObj.resultType < 90000) {
            var rand = Math.random();
            if (rand < 0.74) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.92) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.96) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.992) {
              var picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } 
          } else if (tgtObj.resultType == 90001) {
            var rand = Math.random();
            if (rand < 0.193) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_COMMON_UNCOMMON);
              chara.inventory.push(picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.239) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.249) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.25) {
              var picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.42) {
              chara.currencies.mevious += 2;
              res.render('pages/resultCard', {item : {name : '메비우스 섬멸의 증표 2개' , rarity : cons.ITEM_RARITY_COMMON}});
            } else if (rand < 0.58) {
              chara.premiumPoint += 1;
              res.render('pages/resultCard', {item : {name : '프리미엄 포인트 1점' , rarity : cons.ITEM_RARITY_COMMON}});
            } else if (rand < 0.6) {
              chara.premiumPoint += 2;
              res.render('pages/resultCard', {item : {name : '프리미엄 포인트 2점' , rarity : cons.ITEM_RARITY_RARE}});
            } else if (rand < 0.78) {
              const dustValue = 7 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              res.render('pages/resultCard', {item : {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_COMMON}});
            } else if (rand < 0.85) {
              const dustValue = 13 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              res.render('pages/resultCard', {item : {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_UNCOMMON}});
            } else if (rand < 0.89) {
              var picked = JSON.parse(JSON.stringify(item.list[412 + Math.floor(Math.random() * 4)]));
              chara.inventory.push(picked);
              res.render('pages/resultCard', {item : picked});
            } else if (rand < 0.9) {
              const dustValue = 50 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              res.render('pages/resultCard', {item : {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_RARE}});
            } else {
              var picked = makeDayStone();
              chara.inventory.push(picked);
              res.render('pages/resultCard', {item : picked});              
            }            
          }
        } else if (tgtObj.type === cons.ITEM_TYPE_DAYSTONE) {
          res.render('pages/selectItem', {title : '요일석 사용', inv : chara.inventory, mode : 1, usedItem : body.itemNum});
        }
        await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(chara), result.rows[0].uid]);
      }
    }
    client.release();
    if (!res.headersSent) {
      res.redirect('/');
    }
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

async function procEnchantItem (req, res) {
  try {
    var chara;
    const body = req.body;
    const client = await pool.connect();
    const result = await client.query('select * from users where id = $1', [req.session.userUid]);
    if (result.rows.length > 0) {
      const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
      if (resultChar.rows.length > 0) {
        chara = JSON.parse(resultChar.rows[0].char_data);
        var used = chara.inventory[body.itemUsed];
        var tgt = chara.inventory[body.itemNum];
        if (tgt.type < 4 && used.type === cons.ITEM_TYPE_DAYSTONE) {
          chara.inventory.splice(body.itemUsed, 1);
          if (!tgt.socket) {
            tgt.socket = [];
          }
          var sockNum = tgt.maxSocket ? tgt.maxSocket : 1;
          if (body.itemSocket < sockNum) {
            tgt.socket[body.itemSocket] = used;
          }
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

async function procBattleList(req, res) {
  try {
    const client = await pool.connect();
    const resultUser = await client.query('select * from users where id = $1', [req.session.userUid]);
    const cuid = resultUser.rows[0].uid;
    const result = await client.query('select * from characters where uid <> $1', [cuid]);
    var rval = [];
    for (val of result.rows) {
      var charData = JSON.parse(val.char_data);
      var obj = {};
      obj.name = charData.name + ', ' + charData.title;
      obj.uid = val.uid;
      obj.battleCnt = charData.battleCnt;
      obj.winCnt = charData.winCnt;
      // temp code
      charData.battleRecord = charData.battleRecord ? charData.battleRecord : {};
      charData.winRecord = charData.winRecord ? charData.winRecord : {};
      obj.vsBattleCnt = charData.battleRecord[cuid] ? charData.battleRecord[cuid] : 0;
      obj.vsWinCnt = charData.winRecord[cuid] ? charData.winRecord[cuid] : 0;
      rval.push(obj);
    } 
    res.render('pages/battleList', {list: rval, title: '전투 신청', formAction: '/doBattle'});
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
        if (cap <= 0) {
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
      if (left.expBoost && left.expBoost > 0) {
        left.expBoost--;
      }
      for (var i=0; i < re.resultLeft; i++) {
        addResultCard(left);
      }
      for (var i=0; i < re.resultRight; i++) {
        addResultCard(right);
      }
      left.battleRecord = left.battleRecord ? left.battleRecord : {};
      left.winRecord = left.winRecord ? left.winRecord : {};
      right.battleRecord = right.battleRecord ? right.battleRecord : {};
      right.winRecord = right.winRecord ? right.winRecord : {};
      left.battleCnt++;
      left.battleRecord[body.charUid] = left.battleRecord[body.charUid] ? left.battleRecord[body.charUid] + 1 : 1;
      right.battleCnt++;
      right.battleRecord[cuid] = right.battleRecord[cuid] ? right.battleRecord[cuid] + 1 : 1;
      if (re.winnerLeft) {
        left.winCnt++;
        left.winRecord[body.charUid] = left.winRecord[body.charUid] ? left.winRecord[body.charUid] + 1 : 1;
      }
      if (re.winnerRight) {
        right.winCnt++;
        right.winRecord[cuid] = right.winRecord[cuid] ? right.winRecord[cuid] + 1 : 1;
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

async function procBattleLogList(req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query('select id, title, date from results order by date desc');
    res.render('pages/battleLogList', {list: result.rows});
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

async function procViewList(req, res) {
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
    res.render('pages/battleList', {list: rval, title: '정보 보기', formAction: '/viewChar'});
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procView(req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query('select * from characters where uid = $1', [req.body.charUid]);
    for (val of result.rows) {
      var charData = JSON.parse(val.char_data);
    } 
    res.render('pages/viewChar', {char: charData});
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procTradeList(req, res) {
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
    res.render('pages/battleList', {list: rval, title: '거래 요청', formAction: '/doTrade'});
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procTrade(req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query('select * from characters where uid = $1', [req.body.charUid]);
    for (val of result.rows) {
      var charData = JSON.parse(val.char_data);
    }
    var mode = req.body.mode || 1;
    res.render('pages/trade', {mode: mode, char: charData, uid: req.body.charUid});
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procShop(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    res.render('pages/shop', {premiumPoint : char.premiumPoint, dust : char.dust, dayStoneBought : char.dayStoneBought, actionBought : char.actionBought, rankFactor : Math.pow(2, 9 - char.rank)});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procUseShop (req, res) {
  try {
    const body = req.body;
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var action = charRow.actionPoint;
    if (body.option == 1) {
      var cost = char.dayStoneBought ? 10 : 5;
      if (char.premiumPoint < cost) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= cost;
        var picked = makeDayStone(Math.floor(Math.random() * 7));
        char.inventory.push(picked);
        char.dayStoneBought = true;
      }
    } else if (body.option == 2) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.expBoost > 0) {
        res.send('이미 부스트를 구매했습니다.');
      } else {
        char.premiumPoint -= 10;
        char.expBoost = 5;
      }
    } else if (body.option == 3) {
      var cost = char.actionBought ? 15 : 10;
      if (char.premiumPoint < cost) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= cost;
        action += 2;
        char.actionBought = true;
      }
    } else if (body.option <= 7) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= 10;
        addSpecialResultCard(char, body.option - 4);
      }
    } else if (body.option >= 102) {
      var cost = body.option >= 106 ? 100 : 140;
      cost *= Math.pow(2, 9 - char.rank);
      if (char.dust < cost) {
        res.send('가루가 부족합니다.');
      } else {
        char.dust -= cost;
        addSpecialResultCard(char, body.option - 102);
      }
    }
    await client.query('update characters set char_data = $1, actionpoint = $3 where uid = $2', [JSON.stringify(char), charRow.uid, action]);
    client.release();
    if (!res.headersSent) {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procDungeon(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var dungeonList = [];
    dungeonList.push({name : '메모리얼 게이트 - 메비우스 섬멸', code : 1, active : !char.dungeonInfos.runMevious && (char.rank <= 8 || char.level >= 20)});
    dungeonList.push({name : '어나더 게이트 - 재의 묘소', code : 2, active : !char.dungeonInfos.runEmberCrypt && (char.rank <= 8 || char.level >= 20)});
    res.render('pages/dungeon', {dungeonList : dungeonList});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procEnterDungeon(req, res) {
  try {
    const body = req.body;
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var enemy;
    // check entering cond
    const rand = Math.random();
    if (body.option == 1) {
      if (!char.dungeonInfos.runMevious && (char.rank <= 8 || char.level >= 20)) {
        char.dungeonInfos.runMevious = true;
        enemy = rand < 0.5 ? monster.mCrawler : monster.mHeadHunter;
      }
    }
    if (enemy) {
      var re = battlemodule.doBattle(JSON.parse(JSON.stringify(char)), JSON.parse(JSON.stringify(enemy)), 1);
      var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
        result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp}];
      re.leftInfo.buffs = [];
      re.leftInfo.items = char.items;
      req.session.dungeonProgress = {code : body.option, phase : 1, resultList : resultList, charData : re.leftInfo};
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: resultList, isFinished : false});
    } else {
      res.redirect('/');
    }
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procNextPhaseDungeon(req, res) {
  try {
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var enemy;
    // check entering cond
    const rand = Math.random();
    if (req.session.dungeonProgress) {
      if (req.session.dungeonProgress.code == 1) {
        req.session.dungeonProgress.charData.curHp += (req.session.dungeonProgress.charData.maxHp - req.session.dungeonProgress.charData.curHp) * 0.15;
        if (req.session.dungeonProgress.phase == 1) {
          enemy = rand < 0.5 ? monster.mCrawler : monster.mHeadHunter;
        } else {
          enemy = rand < 0.15 ? monster.mTaurus : (rand < 0.575 ? monster.mCrawler : monster.mHeadHunter);
        }
      }
    }
    if (enemy) {
      var re = battlemodule.doBattle(JSON.parse(JSON.stringify(req.session.dungeonProgress.charData)), JSON.parse(JSON.stringify(enemy)), 1);
      req.session.dungeonProgress.resultList.push({phase : req.session.dungeonProgress.phase + 1, monImage : enemy.image, monName : enemy.name, 
        result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp});
      re.leftInfo.buffs = [];
      req.session.dungeonProgress.charData = re.leftInfo;
      req.session.dungeonProgress.phase = req.session.dungeonProgress.phase + 1;
      
      var isFinished = false;
      var reward = '';
      if (!re.winnerLeft) {
        isFinished = true;
        reward += '패배했습니다..';
      } else if (req.session.dungeonProgress.code == 1 && req.session.dungeonProgress.phase == 3) {
        isFinished = true;
        if (!char.dungeonInfos.clearMevious) {
          char.dungeonInfos.clearMevious = true;
          char.statPoint += 5;
          reward += '첫 번째 [메모리얼 게이트 - 메비우스 섬멸] 클리어!<br>스탯 포인트 5를 획득했습니다.<br>';
        }
        const curr = 3 + Math.floor(3 * Math.random());
        if (char.currencies.mevious) {
          char.currencies.mevious += curr;
        } else {
          char.currencies.mevious = curr;
        }
        reward += '메비우스 섬멸의 증표 ' + curr + '개를 획득했습니다.<br>';
        if (enemy.name == '메비우스 타우러스') {
          char.currencies.mevious += 5;
          reward += '타우러스를 처치했으므로 메비우스 섬멸의 증표 5개를 추가로 획득했습니다.<br>';          
        }
        char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '메비우스 섬멸 공훈 카드', rank : 8, resultType : 90001});
        reward += '메비우스 섬멸 공훈 카드 1개를 획득했습니다.';  
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: req.session.dungeonProgress.resultList, isFinished : isFinished, reward : reward});
    } else {
      res.redirect('/');
    }
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procDismantlingYard(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    res.render('pages/selectItem', {title : '아이템 해체', inv : char.inventory, mode : 2, dust : char.dust, dustVal : null, usedItem : 0});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

const dustInfo = [10, 14, 26, 26, 62, 170];
async function procDismantleItem (req, res) {
  try {
    const body = req.body;
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.inventory[body.itemNum];
    if (tgt.type <= 4) {
      char.inventory.splice(body.itemNum, 1);
      var dustVal = Math.round(dustInfo[tgt.rarity] * Math.pow(2, 9 - tgt.rank));
      char.dust += dustVal;
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '아이템 해체', inv : char.inventory, mode : 2, dustVal : dustVal, dust : char.dust, usedItem : 0});;
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procUseStatPoint (req, res) {
  const client = await pool.connect();
  const sess = req.session; 
  const charRow = await getCharacter(sess.userUid);
  const char = JSON.parse(charRow.char_data);
  if (char.statPoint > 0) {
    char.statPoint -= 1;
    var value = (req.body.keyType ==='maxHp') ? 10 : 1.25;
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

async function addItemNews (client, chara, tgtObj, picked) {
  const rarity = picked.rarity == cons.ITEM_RARITY_RARE ? 'Rare' : (picked.rarity == cons.ITEM_RARITY_UNIQUE ? 'Unique' : 'Epic');
  await client.query('insert into news(content, date) values ($1, $2)', 
      [chara.name + getIga(chara.nameType) + ' ' + tgtObj.name + '에서 <span class=\"rarity' + rarity + '\">' + picked.name + '<div class="itemTooltip">' + makeTooltip(picked) + '</div></span>' + getUlrul(picked.nameType) + ' 뽑았습니다!', new Date()]);
}

async function getNews (cnt) {
  try {
    var rval = [];
    const client = await pool.connect();
    const result = await client.query('select * from news order by date desc fetch first 5 rows only', []);
    for (const val of result.rows) {
      rval.push(val.content);
    }

    client.release();
    return rval;
  } catch (err) {
    console.error(err);
    return [];
  }   
}

async function getCharacter (id) {
  try {
    var rval = {};
    const client = await pool.connect();
    const result = await client.query('select * from users where id = $1', [id]);
    if (result.rows.length > 0) {
      const resultChar = await client.query('select * from characters where uid = $1', [result.rows[0].uid]);
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
    return {};
  }   
}

async function setCharacter (id, uid, data) {
  try {
    const client = await pool.connect();
    const result = await client.query('insert into characters(uid, char_data, actionpoint) values ($1, $2, 5)', [uid, data]);
    const result2 = await client.query('update users set uid = $1 where id = $2', [uid, id]);

    client.release();
  } catch (err) {
    console.error(err);
  }
}

function addExp(chara, exp) {
  chara.exp += exp;
  while (chara.level < 50 && chara.exp >= chara.reqExp) {
    chara.exp -= chara.reqExp;
    chara.level++;
    chara.statPoint += 2;
  }
}

const dayStoneData = [
                      [[[15, 35], [20, 60], [25, 90], [30, 120], [40, 150]]], 
                      [[[5, 25], [10, 40], [15, 60], [20, 85], [30, 110]]], 
                      [[[10, 35], [15, 50], [20, 70], [25, 100], [35, 140]]], 
                      [[[10, 35], [15, 50], [20, 70], [25, 100], [35, 140]]], 
                      [[[10, 30], [15, 45], [20, 65], [25, 90], [30, 120]]], 
                      [[[10, 20], [15, 35], [20, 55], [25, 75], [35, 100]]], 
                      [[[10, 35], [15, 50], [20, 70], [25, 95], [35, 125]]]];
const dayStonePrefix = ['최하급 ', '하급 ', '중급 ', '상급 ', '최상급 '];
const dayStoneName = ['일석', '월석', '화석', '수석', '목석', '금석', '토석'];
const dayStoneEffect = ['치명피해', '치명', '물리공격력', '마법공격력', 'SP 소모량', '저항', '생명력'];
function makeDayStone(dayIn) {
  var rand = Math.random();
  var item = {};
  item.type = cons.ITEM_TYPE_DAYSTONE;
  item.rarity = cons.ITEM_RARITY_RARE;
  item.day = dayIn ? dayIn : new Date().getDay();
  item.level = (rand < 0.39) ? 0 : ((rand < 0.68) ? 1 : ((rand < 0.88) ? 2 : ((rand < 0.98) ? 3 : 4)));
  item.name = dayStonePrefix[item.level] + dayStoneName[item.day];
  var fval = dayStoneData[item.day][0][item.level];
  var val = Math.floor(Math.random() * (fval[1] - fval[0]) + fval[0]) / 1000;
  item.effectDesc = dayStoneEffect[item.day] + ' ' + (val*100) + '%';
  switch (item.day) {
  case 0:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_ADD, key : 'critDmg', value : val}];
    break;
  case 1:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_ADD, key : 'crit', value : val}];
    break;
  case 2:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'phyAtk', value : val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'phyAtkMin', value : val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'phyAtkMax', value : val}];
    break;
  case 3:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'magAtk', value : val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'magAtkMin', value : val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'magAtkMax', value : val}];
    break;
  case 4:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_SP_COST_PERCENTAGE, key : 'drive', value : val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_SP_COST_PERCENTAGE, key : 'special', value : val}];
    break;
  case 5:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_ADD, key : 'phyReduce', value : val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_ADD, key : 'magReduce', value : val}];
    break;
  case 6:
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_PERCENTAGE, key : 'maxHp', value : val}];
    break;
  }
  return item;
}

function addResultCard(chara) {
  var item = {};
  item.type = cons.ITEM_TYPE_RESULT_CARD;
  item.name = chara.rank + '급 리설트 카드';
  item.rank = chara.rank;
  chara.inventory.push(item);
}

const typePrefix = ['무기', '방어구', '보조방어구', '장신구', '장비'];
function addSpecialResultCard(chara, type) {
  var item = {};
  item.type = cons.ITEM_TYPE_RESULT_CARD;
  item.name = chara.rank + '급 ' + typePrefix[type] + ' 리설트 카드';
  item.rank = chara.rank;
  item.resultType = type;
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

function calcItemStats(item) {
  item.stat = {};
  for (var key in item.base) {
    item.stat[key] = item.base[key];
  }

  for (var key in item.socket.stat) {
    if (!item.stat[key]) {
      item.stat[key] = 0;
    }
    item.stat[key] += item.socket.stat[key];
  }

}

var printName = {};
printName.maxHp = '생명력';
printName.hpRegen = 'HP재생';
printName.spRegen = 'SP재생';
printName.spCharge = 'SP충전';
printName.phyAtk = '물리공격력';
printName.magAtk = '마법공격력';
printName.crit = '치명';
printName.critDmg = '치명피해';
printName.phyReduce = '물리저항';
printName.magReduce = '마법저항';
printName.hit = '명중';
printName.evasion = '회피';
printName.dmgReduce = '피해감소';
printName.pierce = '관통';
printName[0] = '무기';
printName[1] = '갑옷';
printName[2] = '보조방어구';
printName[3] = '장신구';
printName[4] = '스킬 아티팩트';

function getRarityText(rarity) {
  var text = '';
  var cname = 'rarity';
  switch (rarity) {
  case 0:
    text = '커먼';
    cname += 'Common';
    break;
  case 1:
    text = '언커먼';
    cname += 'Uncommon';
    break;
  case 2:
    text = '레어';
    cname += 'Rare';
    break;
  case 3:
    text = '프리미엄';
    cname += 'Premium';
    break;
  case 4:
    text = '유니크';
    cname += 'Unique';
    break;
  case 5:
    text = '에픽';
    cname += 'Epic';
    break;
  }
  return '<span class="' + cname + '">' + text + '</span>';
}

function getStatList(val) {
  return Object.entries(val.stat).map(arr => { 
    if (arr[0] == 'phyAtkMin') {
      return  '물리공격력 +' + arr[1] + '~' + val.stat.phyAtkMax;
    } else if (arr[0] == 'magAtkMin') {
      return  '마법공격력 +' + arr[1] + '~' + val.stat.magAtkMax;        
    } else if (arr[0] == 'phyAtkMax' || arr[0] == 'magAtkMax') {
      return '';
    } else {
      var sign = arr[1] > 0 ? '+' : '';
      if (arr[0] == 'phyReduce' || arr[0] == 'magReduce' || arr[0] == 'crit' || arr[0] == 'critDmg' || arr[0] == 'crit' || arr[0] == 'hit' || arr[0] == 'evasion' || arr[0] == 'pierce') {
        arr[1] = (arr[1] * 100).toFixed(2) + '%'; 
      }
      return printName[arr[0]] + ' ' + sign + arr[1];
    }      
  }).filter(x => x.length > 0).join(', ');
}

function makeTooltip(item) {
  var rtext = '';
  rtext += item.name;
  if (item.type < 10) {
    rtext += '<br>' + item.rank + '급 ' + getRarityText(item.rarity) + ' ' + printName[item.type];
    rtext += '<br>' + getStatList(item);
    if (item.effectDesc && item.effectDesc.length > 0) {
      rtext += ', ' + item.effectDesc;
    }
    if (item.socket) {
      for (sock of item.socket) {
        rtext += '<br><br>[' + sock.name + '] ' + sock.effectDesc;
      }
    }
    if (item.flavor && item.flavor.length > 0) {
      rtext += '<br><br><span class="tooltipFlavor">' + item.flavor + '</span>';
    }
  }
  return rtext;
}

function getIga(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '가' : '이';
}

function getUro(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '로' : '으로';
}

function getUlrul(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '를' : '을';
}

function getUnnun(type) {
  return (type === cons.NAME_KOR_NO_END_CONS) ? '는' : '은';
}

// }
