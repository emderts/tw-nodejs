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
const battlemodule2 = require('./battlemodule2');
const chara = require('./chara');
const cons = require('./constant');
const item = require('./items');
const monster = require('./monster');
const sessionMiddleware = session({
  secret: 'ewqwwolpe!d.ldx42EsCCXD#!$()_*#@',
  resave: true,
  saveUninitialized: true
});;
const favicon = require('serve-favicon');

const app = express()
.use(express.static(path.join(__dirname, 'public')))
.use(sessionMiddleware)
.use(bodyParser.urlencoded({extended: false}))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
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
.get('/tradeList', procTradeList)
.post('/doTrade', procTrade)
.post('/giveItem', procGive)
.post('/givePoint', procGivePoint)
.get('/shop', procShop)
.post('/useShop', procUseShop)
.get('/dungeon', procDungeon)
.post('/enterDungeon', procEnterDungeon)
.get('/nextPhaseDungeon', procNextPhaseDungeon)
.get('/stopDungeon', procStopDungeon)
.get('/sortInventory', procSortInventory)
.get('/quest', procQuest)
.post('/submitQuest', procSubmitQuest)
.post('/resetQuest', procResetQuest)
.get('/dismantlingYard', procDismantlingYard)
.post('/dismantleItem', procDismantleItem)
.get('/stoneCube', procStoneCube)
.post('/addCube', procAddCube)
.post('/removeCube', procRemoveCube)
.get('/activateCube', procActivateCube)
.post('/useStatPoint', procUseStatPoint)
.post('/doRankup', procRankup)
.post('/getCard', procGetCard)
.post('/actionAccel', procActionAccel)
.get('/test', (req, res) => res.render('pages/battle', {result: battlemodule.doBattle(chara.nux, chara.psi, 1).result}))
.get('/test2', (req, res) => res.render('pages/trade', {room : '1', uid : '03'}))
.get('/test3', (req, res) => res.render('pages/trade', {room : '1', uid : '06'}))
.get('/test4', (req, res) => res.send(procInit2()))
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
  
  socket.on('chat message', async function(msg) {
    ring.push({userName : socket.request.session.userName, message : msg });
    try {
      const client = await pool.connect();
      await client.query('insert into chat(content, date) values ($1, $2)', [{userName : socket.request.session.userName, message : msg }, new Date()]);

      client.release();
    } catch (err) {
      console.error(err);
    }
    if (ring.length > 30) {  
      ring.shift();
    }
    io.emit('chat message', socket.request.session.userName, msg);
  });
  
  socket.on('manualInit', function(room, uid) {
    console.log('manualInit');
    if (!trades[room]) {
      trades[room] = {left : socket, leftUid : uid};
    } else {
      trades[room].right = socket;
      trades[room].rightUid = uid;
      const result = battlemodule2.procBattleStart(chara.julius, chara.seriers);
      trades[room].left.emit('manualAck', result, getNames(chara.julius), getNames(chara.seriers));
      trades[room].right.emit('manualAck', result, getNames(chara.seriers), getNames(chara.julius));
      
      function makeSkillTooltip(skill) {
        var rtext = '<div class="itemTooltip">';
        rtext += skill.tooltip + '<br><br><span class="tooltipFlavor">' + skill.flavor + '</span></div>';
        return rtext;
      }
      
      function getNames(chara) {
        return [chara.skill.base[0].name + makeSkillTooltip(chara.skill.base[0]), chara.skill.base[1].name + makeSkillTooltip(chara.skill.base[1]), chara.skill.base[2].name + makeSkillTooltip(chara.skill.base[2])];
      }
    }
  });
  socket.on('manualSelect', function(room, uid, key) {
    console.log('manualSelect');
    if (trades[room].leftUid == uid) {
      trades[room].leftSel = key;
    } else {
      trades[room].rightSel = key;
    }
    if (trades[room].leftSel !== undefined && trades[room].rightSel !== undefined) {
      const result = battlemodule2.procBattleTurn(trades[room].leftSel, trades[room].rightSel);
      trades[room].left.emit('manualSelectAck', result.result);
      trades[room].right.emit('manualSelectAck', result.result);
      delete trades[room].leftSel;
      delete trades[room].rightSel;
    }
  });
  
  socket.on('disconnect', function() {
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
  var testChars = [chara.julius, chara.seriers, chara.aeika, chara.psi, chara.aeohelm, chara.nux, chara.dekaitz];
  var testResults = [];
  var testTurns = [];
  var resultStr = '';
  for ([ind, left] of testChars.entries()) {
    testResults.push([0, 0, 0, 0, 0, 0, 0]);
    testTurns.push([0, 0, 0, 0, 0, 0, 0]);
    for ([indr, right] of testChars.entries()) {
      if (left == right) {
        continue;
      }
      for (var i=0; i<100; i++) {
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
  chara.dekaitz.maxExp += chara.dekaitz.reqExp * 20;
  addExp(chara.dekaitz, chara.dekaitz.reqExp * 20);
  chara.dekaitz.level = 1;
  chara.dekaitz.rank--;
  chara.dekaitz.reqExp += 90;
  chara.dekaitz.base.maxHp += 150;
  chara.dekaitz.base.phyAtk += 10;
  chara.dekaitz.base.magAtk += 10;
  calcStats(chara.dekaitz);
  chara.dekaitz.maxExp += chara.dekaitz.reqExp * 20;
  addExp(chara.dekaitz, chara.dekaitz.reqExp * 20);
  chara.dekaitz.level = 1;
  chara.dekaitz.rank--;
  chara.dekaitz.reqExp += 90;
  chara.dekaitz.base.maxHp += 150;
  chara.dekaitz.base.phyAtk += 10;
  chara.dekaitz.base.magAtk += 10;
  calcStats(chara.dekaitz);
  await setCharacter('guest', 12, chara.dekaitz);
  //await setCharacter('kemderts', 2, chara.kines);
  /*await setCharacter('bemderts', 3, chara.julius);
  await setCharacter('renia1369', 4, chara.psi);
  await setCharacter('bear1704', 5, chara.aeika);
  await setCharacter('megaxzero', 6, chara.seriers);
  await setCharacter('kyrus1300', 7, chara.aeohelm);
  try {
    const client = await pool.connect();
    const result = await client.query('insert into raids(rindex, open, phase, monsters) values (2, \'C\', 1, $1)', 
        [JSON.stringify({1 : monster.oEleLord, 2 : monster.oStoneist, 3 : monster.oDeathKnight, 4 : monster.oLegor})]);

    client.release();
  } catch (err) {
    console.error(err);
  }*/
}

async function procInit2 () {
  try {
    const client = await pool.connect();
    const result = await client.query('select * from characters');
    const result2 = await client.query('insert into raids(rindex, open, phase, monsters) values (2, \'O\', 1, $1)', 
        [JSON.stringify({1 : monster.oEleLord, 2 : monster.oStoneist, 3 : monster.oDeathKnight, 4 : monster.oLegor})]);
    var leaderboard = [];
    var reward;
    const names = {'03' : '줄리어스 엠더츠', '04' : '프사이', '05' : '에이카', '06' : '세리어스 플로에르시아',
        '07' : '에오헬름', '08' : '나백수', '09' : '이 눅스', '10' : '세컨드 로직', '11' : '마랑'};
    /*for (val of result2.rows) {
      var char = JSON.parse(val.monsters);
      var record = {};
      for (key in char[1].battleRecord) { 
        if (record[key]) {
          record[key] += char[1].battleRecord[key];
        } else {
          record[key] = char[1].battleRecord[key];
        }
      }
      for (key in char[2].battleRecord) { 
        if (record[key]) {
          record[key] += char[2].battleRecord[key];
        } else {
          record[key] = char[2].battleRecord[key];
        }
      }
      for (key in char[3].battleRecord) { 
        if (record[key]) {
          record[key] += char[3].battleRecord[key];
        } else {
          record[key] = char[3].battleRecord[key];
        }
      }
      for (key in record) { 
        leaderboard.push({name : names[key], damage : record[key], key : key});
      }
      leaderboard.sort(function(a, b) {
        if (a.damage > b.damage) {
          return -1;
        } else if (a.damage == b.damage) {
          return 0;
        } else {
          return 1;
        }
      }); 
      reward = '<table>';
      for (key in leaderboard) {
        reward += '<tr><td>' + (key + 1) + '</td><td>' + leaderboard[key].name + '</td><td>' + char[1].battleRecord[leaderboard[key].key] + '</td><td>' + char[2].battleRecord[leaderboard[key].key] + '</td><td>' + char[3].battleRecord[leaderboard[key].key] + '</td><td>' + leaderboard[key].damage + '</td></tr>';
      }
      reward += '</table>';
    } */
    for (val of result.rows) {
      var char = JSON.parse(val.char_data);
      if (val.uid == '02') {
      }
      
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), val.uid]);
    } 
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procIndex (req, res) {
  try {
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const news = await getNews(5);
    if (!sess.userUid) {
      res.render('pages/login');
    } else {
      /*var mark;
      if (charRow.char_data) {
      const char = JSON.parse(charRow.char_data);
      mark = char.lastBattleTime > char.lastLogin;
      char.lastLogin = new Date();
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), sess.userUid]);
      }*/
      res.render('pages/index', {
        user: {name: sess.userName, uid : sess.userUid},
        char: charRow.char_data ? JSON.parse(charRow.char_data) : undefined,
        actionPoint : charRow.actionPoint,
        news : news
        //mark : mark
      });
    }
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
        res.send('아이디나 비밀번호 오류입니다.<br><a href="/">돌아가기</a>');
      }
    } else {
      res.send('아이디나 비밀번호 오류입니다.<br><a href="/">돌아가기</a>');
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
          const nextIdx = chara.inventory.findIndex(x => (x.type === cons.ITEM_TYPE_RESULT_CARD && x.resultType === tgtObj.resultType));
          var rand = Math.random();
          var picked;
          if (chara.quest[10]) {
            chara.quest[10].progress += 1;
          }
          if (tgtObj.resultType === undefined) {
            if (rand < 0.236) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_COMMON_UNCOMMON);
              chara.inventory.push(picked);
            } else if (rand < 0.286) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 1;
              }
            } else if (rand < 0.2985) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.3) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.62) {
              chara.premiumPoint += 1;
              picked = {name : '프리미엄 포인트 1점' , rarity : cons.ITEM_RARITY_COMMON};
            } else if (rand < 0.65) {
              chara.premiumPoint += 2;
              picked = {name : '프리미엄 포인트 2점' , rarity : cons.ITEM_RARITY_RARE};
            } else if (rand < 0.79) {
              const dustValue = 7 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              picked = {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_COMMON};
              if (chara.quest[4]) {
                chara.quest[4].progress += 1;
              }
            } else if (rand < 0.88) {
              const dustValue = 13 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              picked = {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_UNCOMMON};
              if (chara.quest[4]) {
                chara.quest[4].progress += 1;
              }
            } else if (rand < 0.9) {
              const dustValue = 50 * Math.pow(2, 9 - tgtObj.rank);
              chara.dust += dustValue;
              picked = {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_RARE};
              if (chara.quest[4]) {
                chara.quest[4].progress += 1;
              }
            } else {
              picked = makeDayStone(null, tgtObj.rank);
              chara.inventory.push(picked);
            }
          } else if (tgtObj.resultType < 90000) {
            if (rand < 0.605) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.881) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 1;
              }
            } else if (rand < 0.9365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.9895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } 
          } else if (tgtObj.resultType == 90001) {
            if (rand < 0.405) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_COMMON_UNCOMMON);
              chara.inventory.push(picked);
            } else if (rand < 0.681) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 1;
              }
            } else if (rand < 0.7365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.7895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.8) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.95) {
              chara.currencies.mevious += 2;
              picked = {name : '메비우스 섬멸의 증표 2개' , rarity : cons.ITEM_RARITY_COMMON};
            } else {
              picked = JSON.parse(JSON.stringify(item.list[412 + Math.floor(Math.random() * 2)]));
              chara.inventory.push(picked);
            } 
          } else if (tgtObj.resultType == 90002) {
            if (rand < 0.405) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_COMMON_UNCOMMON);
              chara.inventory.push(picked);
            } else if (rand < 0.681) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 1;
              }
            } else if (rand < 0.7365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.7895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.8) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.95) {
              chara.currencies.ember += 2;
              picked = {name : '잔불 2개' , rarity : cons.ITEM_RARITY_COMMON};
            } else {
              picked = JSON.parse(JSON.stringify(item.list[416 + Math.floor(Math.random() * 2)]));
              chara.inventory.push(picked);
            } 
          } else if (tgtObj.resultType == 90003) {
            if (rand < 0.405) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.681) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 1;
              }
            } else if (rand < 0.7365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.7895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.8) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else if (rand < 0.95) {
              chara.currencies.burntMark += 2;
              picked = {name : '불탄 증표 2개', rarity : cons.ITEM_RARITY_COMMON};
            } else {
              chara.currencies.burntMark += 4;
              picked = {name : '불탄 증표 4개', rarity : cons.ITEM_RARITY_COMMON};
            }
          } else if (tgtObj.resultType == 90004) {
            if (rand < 0.96) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } else {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
              if (chara.quest[5]) {
                chara.quest[5].progress += 3;
              }
            } 
          }
          res.render('pages/resultCard', {item : picked, nextIdx : nextIdx});
        } else if (tgtObj.type === cons.ITEM_TYPE_DAYSTONE) {
          res.render('pages/selectItem', {title : '요일석 사용', inv : chara.inventory, mode : 1, usedItem : body.itemNum, uid : null});
        } else if (tgtObj.type === 90001) {
          chara.inventory.splice(body.itemNum, 1);
          await client.query('update characters set actionpoint = actionpoint + $1 where uid = $2', [tgtObj.value, result.rows[0].uid]);
        } else if (tgtObj.type === 90002) {
          chara.inventory.splice(body.itemNum, 1);
          chara.maxExp += chara.reqExp * tgtObj.value;
          addExp(chara, chara.reqExp * tgtObj.value);
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
          if (chara.quest[11] && used.day == new Date().getDay()) {
            chara.quest[11].progress += 1;
          }
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
    const sess = req.session; 
    const resultUser = await client.query('select * from users where id = $1', [req.session.userUid]);
    const cuid = resultUser.rows[0].uid;
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid <> $1 order by uid', [cuid]);
    var rval = [];
    for (val of result.rows) {
      if (char.lastBattle == val.uid || val.uid == '12') {
        continue;
      }
      var charData = JSON.parse(val.char_data);
      var obj = {};
      obj.name = charData.name + ', ' + charData.title + ' [' + charData.rank + '급]';
      obj.uid = val.uid;
      obj.battleCnt = charData.battleCnt;
      obj.winCnt = charData.winCnt;
      obj.winRate = Math.round((obj.battleCnt ? obj.winCnt / obj.battleCnt : 0) * 10000) / 100;
      // temp code
      charData.battleRecord = charData.battleRecord ? charData.battleRecord : {};
      charData.winRecord = charData.winRecord ? charData.winRecord : {};
      obj.vsBattleCnt = charData.battleRecord[cuid] ? charData.battleRecord[cuid] : 0;
      obj.vsWinCnt = charData.winRecord[cuid] ? charData.winRecord[cuid] : 0;
      obj.vsWinRate = Math.round((obj.vsBattleCnt ? obj.vsWinCnt / obj.vsBattleCnt : 0) * 10000) / 100;
      obj.recentBattleCnt = charData.recentRecord.length;
      obj.recentWinCnt = charData.recentRecord.filter(x => x).length;
      obj.recentWinRate = Math.round((obj.recentBattleCnt ? obj.recentWinCnt / obj.recentBattleCnt : 0) * 10000) / 100;
      if (Math.random() < 0.5) {
        rval.push(obj);
      } else {
        rval.unshift(obj);
      }
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
        if (cap <= 0 || (left.actionAccel && cap <= 1)) {
          client.release();
          res.redirect('/');
          return;
        }
      } else if (val.uid === body.charUid) {
        right = JSON.parse(val.char_data);
      }
    } 
    if (left && right && left.lastBattle != body.charUid) {
      var re = battlemodule.doBattle(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));
      var globalObj = {actionUsed : {type : 'add', value : 1}};
      if (left.expBoost && left.expBoost > 0) {
        left.expBoost--;
        left.maxExp += re.expLeft;
      }
      if (left.actionAccel) {
        re.expLeft *= 2;
        re.resultLeft *= 2;
        re.expRight *= 2;
        re.resultRight *= 2;
        globalObj.actionUsed.value += 1;
      }
      addExp(left, re.expLeft);
      addExp(right, re.expRight);
      addResultGauge(left, re.resultLeft);
      addResultGauge(right, re.resultRight);
      left.lastBattle = body.charUid; 
      left.battleRecord = left.battleRecord ? left.battleRecord : {};
      left.winRecord = left.winRecord ? left.winRecord : {};
      right.battleRecord = right.battleRecord ? right.battleRecord : {};
      right.winRecord = right.winRecord ? right.winRecord : {};
      left.battleCnt++;
      left.battleRecord[body.charUid] = left.battleRecord[body.charUid] ? left.battleRecord[body.charUid] + 1 : 1;
      right.battleCnt++;
      right.battleRecord[cuid] = right.battleRecord[cuid] ? right.battleRecord[cuid] + 1 : 1;
      right.lastBattleTime = new Date();
      if (left.quest[2]) {
        if (!left.quest[2].data) {
          left.quest[2].data = [];
        }
        if (!left.quest[2].data.includes(body.charUid)) {
          left.quest[2].data.push(body.charUid);
          left.quest[2].progress += 1;            
        }
      }
      if (left.quest[7] && right.title == '리치 왕') {
        left.quest[7].progress += 1;
      }
      if (left.quest[12]) {
        left.quest[12].progress += re.leftWin;
      }
      if (right.quest[3]) {
        right.quest[3].progress += 1;
      }
      if (right.quest[12]) {
        right.quest[12].progress += re.rightWin;
      }
      if (re.winnerLeft) {
        left.winCnt++;
        left.winRecord[body.charUid] = left.winRecord[body.charUid] ? left.winRecord[body.charUid] + 1 : 1;
        left.recentRecord.push(true);
        right.recentRecord.push(false);
        if (left.quest[1]) {
          left.quest[1].progress += 1;
        }
      }
      if (re.winnerRight) {
        right.winCnt++;
        right.winRecord[cuid] = right.winRecord[cuid] ? right.winRecord[cuid] + 1 : 1;
        right.recentRecord.push(true);
        left.recentRecord.push(false);
        if (right.quest[1]) {
          right.quest[1].progress += 1;
        }
      }
      if (left.recentRecord.length > 50) {
        left.recentRecord.shift();
      }
      if (right.recentRecord.length > 50) {
        right.recentRecord.shift();
      }
      await client.query('update characters set char_data = $1, actionPoint = $2 where uid = $3', [JSON.stringify(left), left.actionAccel ? cap-2 : cap-1, cuid]);
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(right), body.charUid]);
      await setGlobals(globalObj);
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
    const result = await client.query('select * from characters where uid <> $1 order by uid', [resultUser.rows[0].uid]);
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
    const result = await client.query('select * from characters where uid <> $1 order by uid', [resultUser.rows[0].uid]);
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
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid = $1', [req.body.charUid]);
    for (val of result.rows) {
      var charData = JSON.parse(val.char_data);
    }
    res.render('pages/selectItem', {title : '아이템 주기', premiumPoint : char.premiumPoint, inv : char.inventory, mode : 3, name : charData.name, uid : req.body.charUid, usedItem : null});
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procGive(req, res) {
  try {
    const body = req.body;
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid = $1', [body.charUid]);
    const charRow2 = result.rows[0];
    const charTgt = JSON.parse(charRow2.char_data);
    var tgt = char.inventory[body.itemNum];
    if (tgt.type <= 3 || tgt.type == 999 || tgt.type == 90001) {
      char.inventory.splice(body.itemNum, 1);
      charTgt.inventory.push(tgt);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charTgt), charRow2.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '아이템 주기', premiumPoint : char.premiumPoint, inv : char.inventory, mode : 3, name : charTgt.name, uid : req.body.charUid, usedItem : null});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procGivePoint(req, res) {
  try {
    const body = req.body;
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid = $1', [body.charUid]);
    const charRow2 = result.rows[0];
    const charTgt = JSON.parse(charRow2.char_data);
    if (body.point <= char.premiumPoint) {
      char.premiumPoint -= body.point;
      charTgt.premiumPoint += Number(body.point);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charTgt), charRow2.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '아이템 주기', premiumPoint : char.premiumPoint, inv : char.inventory, mode : 3, name : charTgt.name, uid : req.body.charUid, usedItem : null});
    }
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
    res.render('pages/shop', {premiumPoint : char.premiumPoint, dust : char.dust, dayStoneBought : char.dayStoneBought, 
      actionBought : char.actionBought, rankFactor : Math.pow(2, 9 - char.rank), currencies : char.currencies,
      item : {mevious : [item.list[412], item.list[413], item.list[414], item.list[415]], 
              ember : [item.list[416], item.list[417], item.list[418], item.list[419]],
              burntMark : [item.list[420], item.list[421], item.list[422], item.list[423]]}});
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
      var cost = char.dayStoneBought ? 5 + char.dayStoneBought : 5;
      if (char.premiumPoint < cost) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= cost;
        var picked = makeDayStone(Math.floor(Math.random() * 7));
        char.inventory.push(picked);
        char.dayStoneBought = char.dayStoneBought ? (char.dayStoneBought < 5 ? 1 + char.dayStoneBought : 5) : 1;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option == 2) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.expBoost > 0) {
        res.send('이미 부스트를 구매했습니다.');
      } else {
        char.premiumPoint -= 10;
        char.expBoost = 15;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option == 8) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.addExpCount == 0) {
        res.send('오늘 최대치를 구매했습니다.');
      } else {
        char.premiumPoint -= 10;
        char.addExpCount -= 1;
        char.maxExp += char.reqExp;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option == 3) {
      var cost = char.actionBought ? 15 : 10;
      if (char.premiumPoint < cost) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= cost;
        action += 10;
        char.actionBought = true;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option == 9) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.dungeonInfos.resetMevious) {
        res.send('오늘 최대치를 구매했습니다.');
      } else {
        char.premiumPoint -= 10;
        char.dungeonInfos.runMevious = false;
        char.dungeonInfos.rewardMevious = false;
        char.dungeonInfos.resetMevious = true;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option == 10) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.dungeonInfos.resetEmberCrypt) {
        res.send('오늘 최대치를 구매했습니다.');
      } else {
        char.premiumPoint -= 10;
        char.dungeonInfos.runEmberCrypt = false;
        char.dungeonInfos.rewardEmberCrypt = false;
        char.dungeonInfos.resetEmberCrypt = true;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option == 11) {
      if (char.premiumPoint < 15) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.resetGauge) {
        res.send('오늘 최대치를 구매했습니다.');
      } else {
        char.premiumPoint -= 15;
        char.resultMaxGauge = 0;
        char.resetGauge = true;
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option <= 7) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= 10;
        addSpecialResultCard(char, body.option - 4);
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option >= 102 && body.option < 90000) {
      var cost = body.option >= 106 ? 100 : 140;
      cost *= Math.pow(2, 9 - char.rank);
      if (char.dust < cost) {
        res.send('가루가 부족합니다.');
      } else {
        char.dust -= cost;
        addSpecialResultCard(char, body.option - 102);
        if (char.quest[8]) {
          char.quest[8].progress += 1;
        }
      }
    } else if (body.option >= 90001 && body.option < 90005) {
      var cost = body.option <= 90002 ? 10 : (body.option == 90003 ? 30 : 60);
      if (char.currencies.mevious < cost) {
        res.send('메비우스 섬멸의 증표가 부족합니다.');
      } else {
        char.currencies.mevious -= cost;
        char.inventory.push(JSON.parse(JSON.stringify(item.list[412 + (body.option - 90001)])));
      }
    } else if (body.option >= 90005 && body.option < 90009) {
      var cost = body.option == 90005 ? 5 : (body.option == 90006 ? 15 : (body.option == 90007 ? 30 : 60));
      if (char.currencies.ember < cost) {
        res.send('잔불이 부족합니다.');
      } else {
        char.currencies.ember -= cost;
        char.inventory.push(JSON.parse(JSON.stringify(item.list[416 + (body.option - 90005)])));
      }
    } else if (body.option >= 90009 && body.option < 90014) {
      var cost = (body.option == 90009 || body.option == 90013) ? 5 : (body.option == 90010 ? 10 : (body.option == 90011 ? 20 : 60));
      if (char.currencies.burntMark < cost) {
        res.send('불탄 증표가 부족합니다.');
      } else {
        char.currencies.burntMark -= cost;
        if (body.option != 90013) {
          char.inventory.push(JSON.parse(JSON.stringify(item.list[420 + (body.option - 90009)])));
        } else {
          char.dungeonInfos.runBurningOrchard = false;
        }
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
    const client = await pool.connect();
    const result = await client.query('select * from raids');
    var dungeonList = [];
    dungeonList.push({name : '메모리얼 게이트 - 메비우스 섬멸 [9급 20레벨 이상]', code : 1, active : !char.dungeonInfos.runMevious && (char.rank <= 8 || char.level >= 20)});
    dungeonList.push({name : '어나더 게이트 - 재의 묘소 [9급 20레벨 이상]', code : 2, active : !char.dungeonInfos.runEmberCrypt && (char.rank <= 8 || char.level >= 20)});
    dungeonList.push({name : '시즌 레이드 - 불타는 과수원 [피로도 1 / 7급 10레벨 이상]', code : 3, active : false});
    dungeonList.push({name : '필드 보스 - 고대 흑마법사 출현', code : 4, active : false});
    if (result && result.rows) {
      for (row of result.rows) {
        var tgt = dungeonList[row.rindex];
        if (row.rindex == 2 && row.phase <= 4) {
          tgt.active = row.open == 'O' && char.rank <= 7 && char.level >= 10 && !char.dungeonInfos.runBurningOrchard;
        } else if (row.rindex == 3 && row.phase <= 3) {
          tgt.active = row.open == 'O' && !char.dungeonInfos.runFieldBoss;
        }
        if (row.open == 'O') {
          tgt.phase = row.phase;
          const curData = JSON.parse(row.monsters);
          if (!curData[row.phase]) {
            row.phase -= 1;
          }
          tgt.image = curData[row.phase].image;
          tgt.bossName = curData[row.phase].name;
          //tgt.curHp = curData[row.phase].curHp ? curData[row.phase].curHp : curData[row.phase].stat.maxHp;
          //tgt.maxHp = curData[row.phase].stat.maxHp;
          tgt.battleRecord = curData[row.phase].battleRecord;
        }
      }
    }
    res.render('pages/dungeon', {dungeonList : dungeonList, nameIn : char.name});
    client.release();
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
    var enemy, curData, hpBefore;
    // check entering cond
    const rand = Math.random();
    if (body.option == 1) {
      if (!char.dungeonInfos.runMevious && (char.rank <= 8 || char.level >= 20)) {
        char.dungeonInfos.runMevious = true;
        enemy = rand < 0.5 ? monster.mCrawler : monster.mHeadHunter;
      }
    } else if (body.option == 2) {
      if (!char.dungeonInfos.runEmberCrypt && (char.rank <= 8 || char.level >= 20)) {
        char.dungeonInfos.runEmberCrypt = true;
        enemy = rand < 0.5 ? monster.eBroken : monster.eCrossbow;
      }
    } else if (body.option == 3) {
      if (!char.dungeonInfos.runBurningOrchard && (row.open == 'O')) {
        char.dungeonInfos.runBurningOrchard = true;
        enemy = monster.oFlame;
        if (charRow.actionPoint <= 0) {
          client.release();
          res.redirect('/');
          return;
        }
      }
    } else if (body.option == 4) {
      const result = await client.query('select * from raids where rindex = 3');
      const row = result.rows[0];
      if (!char.dungeonInfos.runFieldBoss && (row.open == 'O')) {
        curData = JSON.parse(row.monsters);
        char.dungeonInfos.runFieldBoss = true;
        enemy = curData[row.phase];
        hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
      }
    }
    if (enemy) {
      if (body.option == 1 || body.option == 2 || body.option == 3) {
        var re = battlemodule.doBattle(JSON.parse(JSON.stringify(char)), JSON.parse(JSON.stringify(enemy)), 1);
        var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
          result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp}];
        re.leftInfo.buffs = [];
        re.leftInfo.items = char.items;
        var isFinished = false;
        var reward = ''; 
        if (!re.winnerLeft) {
          isFinished = true;
          reward += '패배했습니다..';
        }
        if (body.option == 3) {
          await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
        }
        req.session.dungeonProgress = {code : body.option, phase : 1, resultList : resultList, charData : re.leftInfo};
      } else {
        var re = battlemodule.doBattle(JSON.parse(JSON.stringify(enemy)), JSON.parse(JSON.stringify(char)), 1);
        var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
          result : re.winnerRight ? '승리' : '패배', hpLeft : re.leftInfo.curHp}];
        const damageDealt = hpBefore - re.leftInfo.curHp;
        re.leftInfo.buffs = [];
        re.leftInfo.items = enemy.items;
        var isFinished = true;
        curData[row.phase] = re.leftInfo;
        curData[row.phase].battleRecord[charRow.uid] = curData[row.phase].battleRecord[charRow.uid] ? curData[row.phase].battleRecord[charRow.uid] + damageDealt : damageDealt;
        curData[row.phase].winRecord[charRow.uid] = curData[row.phase].winRecord[charRow.uid] ? curData[row.phase].winRecord[charRow.uid] + 1 : 1;
        var reward = damageDealt + ' 피해를 입혔습니다! (누적 피해 : ' + curData[row.phase].battleRecord[charRow.uid] + ')<br>';
        
        if (body.option == 4) {
          if (curData[row.phase].battleRecord[charRow.uid] >= re.leftInfo.stat.maxHp / 4) {
            if (!char.dungeonInfos['rewardFieldBoss' + row.phase]) {
              char.dungeonInfos['rewardFieldBoss' + row.phase] = true;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 장비 카드', rank : 8, resultType : 4});
              reward += '누적 피해량 보상으로 고대 장비 카드 1개를 획득했습니다.<br>';
            }  
          }
          
        }
        if (!re.winnerLeft) {
          if (body.option == 4) {
            if (row.phase <= 2) {
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 장비 카드', rank : 8, resultType : 4});
              reward += '페이즈 종료 보상으로 고대 장비 카드 1개를 획득했습니다.<br>';
            } else {
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 흑마법사의 선물', rank : 8 + Math.floor(Math.random() * 2), resultType : 90004});
              reward += re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!<br>고대 흑마법사의 선물 1개를 획득했습니다.<br>';
            await client.query('insert into news(content, date) values ($1, $2)', 
                [char.name + getIga(char.nameType) + ' ' + re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!', new Date()]);
            }            
          }
        } 
        await client.query('update raids set phase = $1, monsters = $2 where rindex = $3', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData), row.rindex]);
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: resultList, isFinished : isFinished, reward : reward, stop : (body.option == 2)});
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
    var enemy, curData, hpBefore;
    // check entering cond
    const rand = Math.random();
    if (sess.dungeonProgress) {
      if (sess.dungeonProgress.code == 1) {
        sess.dungeonProgress.charData.curHp += (sess.dungeonProgress.charData.stat.maxHp - sess.dungeonProgress.charData.curHp) * 0.15;
        if (sess.dungeonProgress.phase == 1) {
          enemy = rand < 0.5 ? monster.mCrawler : monster.mHeadHunter;
        } else {
          enemy = rand < 0.15 ? monster.mTaurus : (rand < 0.575 ? monster.mCrawler : monster.mHeadHunter);
        }
      } else if (sess.dungeonProgress.code == 2) {
        sess.dungeonProgress.charData.curHp = sess.dungeonProgress.charData.stat.maxHp;
        if (sess.dungeonProgress.phase == 1) {
          enemy = monster.eGunda;
        } 
      } else if (sess.dungeonProgress.code == 3) {
        const result = await client.query('select * from raids where rindex = 2');
        const row = result.rows[0];
        var curData = JSON.parse(row.monsters);
        enemy = curData[row.phase];
        hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
      }
    }
    if (enemy) {
      var re = battlemodule.doBattle(JSON.parse(JSON.stringify(req.session.dungeonProgress.charData)), JSON.parse(JSON.stringify(enemy)), 1);
      req.session.dungeonProgress.resultList.push({phase : req.session.dungeonProgress.phase + 1, monImage : enemy.image, monName : enemy.name, 
        result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp});
      re.leftInfo.buffs = [];
      re.leftInfo.items = char.items;
      req.session.dungeonProgress.charData = re.leftInfo;
      req.session.dungeonProgress.phase = req.session.dungeonProgress.phase + 1;
      
      var isFinished = false;
      var reward = '';
      if (req.session.dungeonProgress.code == 3) {
        const damageDealt = hpBefore - re.rightInfo.curHp;
        re.rightInfo.buffs = [];
        re.rightInfo.items = enemy.items;
        isFinished = true;
        curData[row.phase] = re.rightInfo;
        curData[row.phase].battleRecord[charRow.uid] = curData[row.phase].battleRecord[charRow.uid] ? curData[row.phase].battleRecord[charRow.uid] + damageDealt : damageDealt;
        curData[row.phase].winRecord[charRow.uid] = curData[row.phase].winRecord[charRow.uid] ? curData[row.phase].winRecord[charRow.uid] + 1 : 1;
        var reward = damageDealt + ' 피해를 입혔습니다! (누적 피해 : ' + curData[row.phase].battleRecord[charRow.uid] + ')<br>';
        const curr = 1 + Math.floor(3 * Math.random());
        if (char.currencies.burntMark) {
          char.currencies.burntMark += curr;
        } else {
          char.currencies.burntMark = curr;
        }
        reward += '불탄 증표 ' + curr + '개를 획득했습니다.<br>';
        if (curData[row.phase].battleRecord[charRow.uid] >= re.rightInfo.stat.maxHp / 10) {
          if (!char.dungeonInfos['rewardBurningOrchard' + row.phase]) {
            char.dungeonInfos['rewardBurningOrchard' + row.phase] = true;
            char.currencies.burntMark += 10;
            char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '불타는 영웅의 증명 카드', rank : 7, resultType : 90003});
            reward += '누적 피해량 보상으로 불탄 징표 10개와 불타는 영웅의 증명 카드 1개를 획득했습니다.<br>';
          }  
        }
        if (!re.winnerRight) {
          char.currencies.burntMark += 20;
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '불타는 영웅의 증명 카드', rank : 7, resultType : 90003});
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '불타는 영웅의 증명 카드', rank : 7, resultType : 90003});
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '불타는 영웅의 증명 카드', rank : 7, resultType : 90003});
          reward += re.rightInfo.name + getUlrul(re.rightInfo.nameType) + ' 처치했습니다!<br>불탄 징표 20개와 불타는 영웅의 증명 카드 3개를 획득했습니다.<br>';
          await client.query('insert into news(content, date) values ($1, $2)', 
              [char.name + getIga(char.nameType) + ' 불타는 과수원에서 ' + re.rightInfo.name + getUlrul(re.rightInfo.nameType) + ' 처치했습니다!', new Date()]);
        }
        await client.query('update raids set phase = $1, monsters = $2 where rindex = $3', [row.phase + (re.winnerRight ? 0 : 1), JSON.stringify(curData), row.rindex]);
      } else if (!re.winnerLeft) {
        isFinished = true;
        reward += '패배했습니다..';
      } else if (req.session.dungeonProgress.code == 1 && req.session.dungeonProgress.phase >= 3) {
        isFinished = true;
        if (!char.dungeonInfos.rewardMevious) {
          char.dungeonInfos.rewardMevious = true;
          if (!char.dungeonInfos.clearMevious) {
            char.dungeonInfos.clearMevious = true;
            char.statPoint += 5;
            reward += '첫 번째 [메모리얼 게이트 - 메비우스 섬멸] 클리어!<br>스탯 포인트 5를 획득했습니다.<br>';
            await client.query('insert into news(content, date) values ($1, $2)', 
                [char.name + getIga(char.nameType) + ' [메모리얼 게이트 - 메비우스 섬멸]을 돌파했습니다!', new Date()]);
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
      } else if (req.session.dungeonProgress.code == 2 && req.session.dungeonProgress.phase >= 2) {
        isFinished = true;
        if (!char.dungeonInfos.rewardEmberCrypt) {
          char.dungeonInfos.rewardEmberCrypt = true;
          if (!char.dungeonInfos.clearEmberCrypt) {
            char.dungeonInfos.clearEmberCrypt = true;
            char.statPoint += 5;
            reward += '첫 번째 [어나더 게이트 - 재의 묘소] 클리어!<br>스탯 포인트 5를 획득했습니다.<br>';
            await client.query('insert into news(content, date) values ($1, $2)', 
                [char.name + getIga(char.nameType) + ' [어나더 게이트 - 재의 묘소]를 돌파했습니다!', new Date()]);
          }
          const curr = 3 + Math.floor(3 * Math.random());
          if (char.currencies.ember) {
            char.currencies.ember += curr;
          } else {
            char.currencies.ember = curr;
          }
          reward += '잔불 ' + curr + '개를 획득했습니다.<br>';
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '재의 묘소 리설트 카드', rank : 8, resultType : 90002});
          reward += '재의 묘소 리설트 카드 1개를 획득했습니다.';
        }
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: req.session.dungeonProgress.resultList, isFinished : isFinished, reward : reward, stop : false});
    } else {
      res.redirect('/');
    }
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procStopDungeon(req, res) {
  try {
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var enemy;
    // check entering cond
    const rand = Math.random();
    if (sess.dungeonProgress) {
      if (sess.dungeonProgress.code == 2) {
        if (sess.dungeonProgress.phase == 1) {
          enemy = true;
        } 
      }
    }
    if (enemy) {
      req.session.dungeonProgress.phase = req.session.dungeonProgress.phase + 1;
      
      var reward = '';
      if (req.session.dungeonProgress.code == 2 && req.session.dungeonProgress.phase == 2 && !char.dungeonInfos.rewardEmberCrypt) {
        char.dungeonInfos.rewardEmberCrypt = true;
        const curr = 2 + Math.floor(3 * Math.random());
        if (char.currencies.ember) {
          char.currencies.ember += curr;
        } else {
          char.currencies.ember = curr;
        }
        reward += '잔불 ' + curr + '개를 획득했습니다.<br>';
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: '', resultList: req.session.dungeonProgress.resultList, isFinished : true, reward : reward});
    } else {
      res.redirect('/');
    }
    client.release();
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procSortInventory(req, res) {
  try {
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    char.inventory = char.inventory.filter(x => x != null);
    char.inventory.sort(function compare(a, b) {
      if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      } else {
        if (a.type <= 4) {
          if (a.rank > b.rank) {
            return -1;
          } else if (a.rank < b.rank) {
            return 1;
          } else if (a.rarity < b.rarity) {
            return -1;
          } else if (a.rarity > b.rarity) {
            return 1;
          } else if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
            return 1;
          } else {
            return 0;
          }
        } else if (a.type === cons.ITEM_TYPE_RESULT_CARD) {
          if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
            return 1;
          } else {
            return 0;
          }
        } else if (a.type === cons.ITEM_TYPE_DAYSTONE) {
          if (a.day < b.day) {
            return -1;
          } else if (a.day > b.day) {
            return 1;
          } else if (a.level < b.level) {
            return -1;
          } else if (a.level > b.level) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    });
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procQuest(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    res.render('pages/quest', {quest : char.quest, resetQuest : char.resetQuest});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procSubmitQuest (req, res) {
  try {
    const body = req.body;
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.quest[body.option];
    if (tgt.progress >= tgt.target) {
      addExp(char, char.reqExp / 10);
      if (tgt.rewardType == 0) {
        char.premiumPoint += 3 + 2 * tgt.rewardAmt;
      } else if (tgt.rewardType == 1) {
        addResultCard(char);
        addResultCard(char);
        if (tgt.rewardAmt == 1) {
          addResultCard(char);
          addResultCard(char);
        }
      } else if (tgt.rewardType == 2) {
        await client.query('update characters set actionpoint = actionpoint + $1 where uid = $2', [8 + 1 * tgt.rewardAmt, charRow.uid]);
      } else if (tgt.rewardType == 3) {
        addSpecialResultCard(char, 4);
        if (tgt.rewardAmt == 1) {
          addSpecialResultCard(char, 4);
        }
      }
      delete char.quest[body.option];
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/quest', {quest : char.quest, resetQuest : char.resetQuest});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procResetQuest (req, res) {
  try {
    const body = req.body;
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    if (char.resetQuest) {
      char.resetQuest = false;
      var quests = [{code : 1, progress : 0, target : 5},
                    {code : 2, progress : 0, target : 5},
                    {code : 3, progress : 0, target : 10},
                    {code : 4, progress : 0, target : 5},
                    {code : 5, progress : 0, target : 3},
                    {code : 6, progress : 0, target : 8},
                    {code : 7, progress : 0, target : 2},
                    {code : 8, progress : 0, target : 1},
                    {code : 9, progress : 0, target : 1},
                    {code : 10, progress : 0, target : 10},
                    {code : 11, progress : 0, target : 1},
                    {code : 12, progress : 0, target : 50}];
      for (key in char.quest) {
        var i = 0;
        for (qst of quests) {
          if (qst.code == key) {
            quests.splice(i, 1);
            break;
          }
          i++;
        }
      }
      var rand = Math.floor(Math.random() * quests.length);
      var target = quests[rand];
      target.rewardType = Math.floor(Math.random() * 4);
      target.rewardAmt = 0;
      char.quest[target.code] = target;
      delete char.quest[body.option];
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/quest', {quest : char.quest, resetQuest : char.resetQuest});
    }
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
      if (char.quest[6]) {
        char.quest[6].progress += 1;
      }
      if (char.quest[9] && tgt.rarity >= cons.ITEM_RARITY_UNIQUE) {
        char.quest[9].progress += 1;
      }
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

async function procStoneCube(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procAddCube (req, res) {
  try {
    const body = req.body;
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.inventory[body.itemNum];
    if (tgt.type == 999 && char.stoneCube.length < 3) {
      char.inventory.splice(body.itemNum, 1);
      char.stoneCube.push(tgt);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procRemoveCube (req, res) {
  try {
    const body = req.body;
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.stoneCube[body.itemNum];
    if (tgt.type == 999) {
      char.stoneCube.splice(body.itemNum, 1);
      char.inventory.push(tgt);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procActivateCube (req, res) {
  try {
    const sess = req.session; 
    const client = await pool.connect();
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data)
    if (char.stoneCube.length >= 3) {
      const level = char.stoneCube[0].level;
      const day = char.stoneCube[0].day;
      if (level < 4) {
        const equalLevel = (level == char.stoneCube[1].level) && (level == char.stoneCube[2].level);
        const equalDay = (day == char.stoneCube[1].day) && (day == char.stoneCube[2].day);
        if (equalLevel) {
          char.stoneCube = [];
          char.inventory.push(makeDayStone((equalDay ? day : Math.floor(Math.random() * 7)), null, level + 1));
        }
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    }
    client.release();
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
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
    var value = (req.body.keyType ==='maxHp') ? 8 : 1.25;
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
  if (char.level >= 20 && char.rank > 7) {
    char.level = 1;
    char.rank--;
    char.reqExp += 90;
    char.base.maxHp += 150;
    char.base.phyAtk += 10;
    char.base.magAtk += 10;
    calcStats(char);
  } 
  await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
  await client.query('insert into news(content, date) values ($1, $2)', 
      [char.name + getIga(char.nameType) + ' ' + char.rank + '급을 달성했습니다!', new Date()]);
  client.release();
  res.redirect('/');
}

async function procGetCard(req, res) {
  const client = await pool.connect();
  const sess = req.session; 
  const charRow = await getCharacter(sess.userUid);
  const char = JSON.parse(charRow.char_data);
  if (char.resultGauge >= 100) {
    char.resultGauge -= 100;
    addResultCard(char);
  } 
  await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
  client.release();
  res.redirect('/');
}

async function procActionAccel(req, res) {
  const client = await pool.connect();
  const sess = req.session; 
  const charRow = await getCharacter(sess.userUid);
  const char = JSON.parse(charRow.char_data);
  char.actionAccel = !char.actionAccel;
  await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
  client.release();
  res.redirect('/');
}

async function addItemNews (client, chara, tgtObj, picked) {
  const rarity = picked.rarity == cons.ITEM_RARITY_RARE ? 'Rare' : (picked.rarity == cons.ITEM_RARITY_UNIQUE ? 'Unique' : (picked.rarity == cons.ITEM_RARITY_COMMON_UNCOMMON ? 'Rare' : 'Epic'));
  await client.query('insert into news(content, date) values ($1, $2)', 
      [chara.name + getIga(chara.nameType) + ' ' + tgtObj.name + '에서 <span class=\"rarity' + rarity + '\">' + picked.name + '<div class="itemTooltip">' + makeTooltip(picked) + '</div></span>' + getUlrul(picked.nameType) + ' 뽑았습니다!', new Date()]);
}

async function getNews (cnt) {
  try {
    var rval = [];
    const client = await pool.connect();
    const result = await client.query('select * from news order by date desc fetch first 10 rows only', []);
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

async function setGlobals (setObj) {
  try {
    const client = await pool.connect();
    const result = await client.query('select * from global');
    if (result.rows.length > 0) {
      var newObj = JSON.parse(result.rows[0].globals);
      for (key in setObj) {
        if (setObj[key].type == 'add') {
          if (newObj[key]) {
            newObj[key] += setObj[key].value;
          } else {
            newObj[key] = setObj[key].value;
          }
        }
      }
      await client.query('update global set globals = $1', [JSON.stringify(newObj)]);
    }

    client.release();
    return;
  } catch (err) {
    console.error(err);
    return;
  }   
}

async function setCharacter (id, uid, data) {
  try {
    const client = await pool.connect();
    const result = await client.query('insert into characters(uid, char_data, actionpoint) values ($1, $2, 40)', [uid, data]);
    const result2 = await client.query('update users set uid = $1 where id = $2', [uid, id]);

    client.release();
  } catch (err) {
    console.error(err);
  }
}

function addExp(chara, exp) {
  if (exp > chara.maxExp) {
    exp = chara.maxExp;
  }
  chara.exp += exp;
  if (chara.rank >= 8 || chara.level > 10) {
    chara.maxExp -= exp;
  }
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
const dayStoneEffect = ['치명피해', '치명', '물리공격력', '마법공격력', 'SP 소모량 감소', '저항', '생명력'];
function makeDayStone(dayIn, rank, levelIn) {
  var rand = Math.random();
  var item = {};
  item.type = cons.ITEM_TYPE_DAYSTONE;
  item.rarity = cons.ITEM_RARITY_RARE;
  item.day = dayIn ? dayIn : new Date().getDay();
  item.level = (rand < 0.39) ? 0 : ((rand < 0.68) ? 1 : ((rand < 0.88) ? 2 : ((rand < 0.98) ? 3 : 4)));
  if (rank == 9 && item.level > 2) {
    item.level = 2;
  }
  if (rank == 8 && item.level > 3) {
    item.level = 3;
  }
  if (levelIn) {
    item.level = levelIn;
  }
  item.name = dayStonePrefix[item.level] + dayStoneName[item.day];
  var fval = dayStoneData[item.day][0][item.level];
  var val = Math.floor(Math.random() * (fval[1] - fval[0]) + fval[0]) / 1000;
  item.tooltip = dayStoneEffect[item.day] + ' ' + (fval[0]/10) + '% - ' + (fval[1]/10) + '%';
  item.effectDesc = dayStoneEffect[item.day] + ' ' + (Math.round(val*1000)/10) + '%';
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
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_SP_COST_PERCENTAGE, key : 'drive', value : 0-val},
                   {active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_SP_COST_PERCENTAGE, key : 'special', value : 0-val}];
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

function addResultGauge(chara, rg) {
  if (chara.resultMaxGauge >= 2000) {
    rg *= 0.5;
  }
  chara.resultGauge += rg;
  if (chara.resultGauge > 500) {
    chara.resultMaxGauge -= (chara.resultGauge - 500);
    chara.resultGauge = 500;
  }
  chara.resultMaxGauge += rg;
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
  var sockets = [];
  for (var key in chara.items) {
    if (!chara.items[key]) {
      continue;
    }
    for (var keyItem in chara.items[key]['stat']) {
      chara.stat[keyItem] += chara.items[key]['stat'][keyItem];
    }
    if (chara.items[key].socket) {
      for (sock of chara.items[key].socket) {
        sockets = sockets.concat(sock.effect.filter(x => (x.active === cons.ACTIVE_TYPE_CALC_STATS)));
      }
    }
  }
  var sval = [];
  for (sock of sockets) {
    if (sval.findIndex(x => x.key == sock.key) == -1) {
      var nv = JSON.parse(JSON.stringify(sock));
      nv.value = 0;
      for (ns of sockets.filter(x => x.key == sock.key)) {
        nv.value += ns.value;
      }
      sval.push(nv);
    }
  }
  for (val of sval) {
    var stackMpl = val.buff ? (val.buff.stack ? val.buff.stack : 1) : 1;
    if (val.code === cons.EFFECT_TYPE_STAT_ADD) {
      chara.stat[val.key] += val.value * stackMpl;
    } else if (val.code === cons.EFFECT_TYPE_STAT_PERCENTAGE) {
      chara.stat[val.key] *= (1 + val.value * stackMpl);
    }
  }

  for (var key in chara.stat) {
    chara.stat[key] = Math.round(chara.stat[key] * 100) / 100;
  }
  chara.stat.maxHp = Math.round(chara.stat.maxHp);
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
