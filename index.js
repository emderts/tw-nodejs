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
const ach = require('./achievement');
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
.use(bodyParser.urlencoded({extended: true}))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
.get('/', procIndex)
.get('/login', (req, res) => res.render('pages/login'))
.get('/event', procEvent)
.post('/login', procLogin)
.get('/join', (req, res) => res.render('pages/join'))
.post('/join', procJoin)
.get('/logout', procLogout)
.post('/useItem', procUseItem)
.post('/confirmItem', procConfirmItem)
.post('/unequipItem', procUnequip)
.post('/enchantItem', procEnchantItem)
.get('/doTest', procTrain)
.get('/battleList', procBattleList)
.get('/doBattle', procBattle)
.post('/doBattle', procBattle)
.get('/battleLogs', procBattleLogList)
.post('/battleLog', procBattleLog)
.get('/viewList', procViewList)
.post('/viewChar', procView)
.get('/viewItem', procViewItemInit)
.post('/viewItem', procViewItem)
.get('/tradeList', procTradeList)
.post('/doTrade', procTrade)
.post('/giveItem', procGive)
.post('/givePoint', procGivePoint)
.get('/shop', procShop)
.post('/useShop', procUseShop)
.get('/dungeon', procDungeon)
.post('/enterDungeon', procEnterDungeon)
.get('/raid', procRaid)
.post('/enterRaid', procEnterRaid)
.get('/nextPhaseDungeon', procNextPhaseDungeon)
.post('/nextPhaseDungeon', procNextPhaseDungeon)
.get('/stopDungeon', procStopDungeon)
.get('/sortInventory', procSortInventory)
.get('/viewAch', procViewAchievement)
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
.get('/test', (req, res) => res.render('pages/battle', {result: (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(monster.rsDeci)), JSON.parse(JSON.stringify(monster.mMegaTaurus)), 1).result}))
.get('/test2', (req, res) => res.render('pages/trade', {room : '1', uid : '03'}))
.get('/test3', (req, res) => res.render('pages/trade', {room : '1', uid : '06'}))
.get('/test4', (req, res) => res.send(procInit2()))
.get('/test5', (req, res) => res.render('pages/resultCard', {item : {name: 'test', rarity: Math.floor(Math.random() * 6)}}))
.get('/test6', (req, res) => res.send(procFullTest()))
.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(app);
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
app

var ring = [[], []];
var people = [];
var trades = {};
var curRoom = 1;
io.on('connection', (socket) => {
  socket.on('login', function(userName, uid, side) {
    socket.request.session.userName = userName;
    socket.request.session.charData = chara.julius;//await getCharacter(uid);
    socket.request.session.side = side;
    people.push(userName);
    socket.emit('logged in', ring[side], people);
  });
  
  socket.on('chat message', async function(msg) {
    ring[socket.request.session.side].push({userName : socket.request.session.userName, message : msg, side : socket.request.session.side });
    try {
      const client = await pool.connect();
      await client.query('insert into chat(content, date) values ($1, $2)', [{userName : socket.request.session.userName, message : msg, side : socket.request.session.side }, new Date()]);

      client.release();
    } catch (err) {
      console.error(err);
    }
    if (ring.length > 30) {  
      ring.shift();
    }
    io.emit('chat message', socket.request.session.userName, msg, socket.request.session.side);
  });
  
  socket.on('manualInit', function(room, uid) {
    console.log('manualInit' + room + '/' + uid);
    if (!trades[room]) {
      return;
    } else if (trades[room].leftUid == uid) {
      trades[room].left = socket;
    } else if (trades[room].rightUid == uid) {
      trades[room].right = socket;
    } else {
      trades[room].obv.push(socket);
      return;
    }
    
    if (trades[room].left && trades[room].right) {
      trades[room].bmod = (new battlemodule.bmodule());
      const result = trades[room].bmod.procBattleStart(chara[trades[room].leftChr], chara[trades[room].rightChr]);
      trades[room].left.emit('manualAck', result, getNames(chara[trades[room].leftChr]), getNames(chara[trades[room].rightChr]));
      trades[room].right.emit('manualAck', result, getNames(chara[trades[room].rightChr]), getNames(chara[trades[room].leftChr]));
      for (sock of trades[room].obv) {
        sock.emit('manualAck', result, getNames(chara[trades[room].leftChr]), getNames(chara[trades[room].rightChr]));        
      }
      
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
    } else if (trades[room].rightUid == uid) {
      trades[room].rightSel = key;
    }
    if (trades[room].leftSel !== undefined && trades[room].rightSel !== undefined) {
      const result = trades[room].bmod.procBattleTurn(trades[room].leftSel, trades[room].rightSel);
      trades[room].left.emit('manualSelectAck', result.result);
      trades[room].right.emit('manualSelectAck', result.result);
      for (sock of trades[room].obv) {
        sock.emit('manualSelectAck', result.result);     
      }
      delete trades[room].leftSel;
      delete trades[room].rightSel;
    }
  });
  
  socket.on('rankupDungeonInit', async function(room, uid) {
    console.log(room + ';' + uid + 'rdinit' + trades[room]);
    if (!trades[room]) {
      return;
    } else if (trades[room].leftUid == uid) {
      trades[room].left = socket;
      var charRow = await getCharacterByUid(uid);
      //trades[room].leftChr = JSON.parse(charRow.char_data);
      trades[room].bmod = (new battlemodule.bmodule());
    }
    
    if (trades[room].left) {
      const result = trades[room].bmod.procBattleStart(trades[room].leftChr, trades[room].rightChr, 1);
      trades[room].left.emit('manualAck', result, getNames(trades[room].leftChr), getNames(trades[room].rightChr));
      
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
  socket.on('rankupDungeonSelect', function(room, uid, key) {
    if (trades[room].leftUid == uid) {
      trades[room].leftSel = key;
      trades[room].rightSel = monster.selectFunc[trades[room].rightChr.skillSelect](trades[room].rightChr, key);
    }
    
    if (trades[room].leftSel !== undefined && trades[room].rightSel !== undefined) {
      const result = trades[room].bmod.procBattleTurn(trades[room].leftSel, trades[room].rightSel, 1);
      if (!result.leftInfo) {
        trades[room].left.emit('manualSelectAck', result.result);
      } else {
        trades[room].result = result;
        trades[room].left.emit('manualSelectEnd', result.result);        
      }
      delete trades[room].leftSel;
      delete trades[room].rightSel;
    }
  });
  socket.on('manualAdmin', function(room, luid, ruid, lc, rc) {
    trades[1000] = {};
    trades[1000].obv = [];
    trades[1000].leftUid = luid;
    trades[1000].rightUid = ruid;
    trades[1000].leftChr = lc;
    trades[1000].rightChr = rc;
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
  try {
    //const client = await pool.connect();
  var testChars = [chara.gaius, chara.lunisha, chara.ruisun, chara.seriers, chara.illun, chara.bks, chara.nux, chara.kasien, chara.marang, chara.gabi, chara.jay];
  var testResults = [];
  var testTurns = [];
  var resultStr = '';
  for ([ind, left] of testChars.entries()) {
    testResults.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    testTurns.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    var wins = 0;
    for ([indr, right] of testChars.entries()) {
      if (left == right) {
        continue;
      }
      for (var i=0; i<100; i++) {
        var ret = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));
        testResults[ind][indr] += (ret.winnerLeft ? 1 : 0);
        testTurns[ind][indr] += ret.turnCount;
        if (i == 0) {
          var winner = ret.winnerLeft ? left.name + ' 승리!' : (ret.winnerRight ? right.name + ' 승리!' : '');
          var battleTitle = '[ ' + left.name + ' ] vs [ ' + right.name + ' ] - ' + winner;
          //await client.query('insert into results(title, result, date) values ($1, $2, $3)', [battleTitle, ret.result, new Date()]);
        }
      }
      console.log(left.name + ' vs ' + right.name + ' : ' + testResults[ind][indr]);
      resultStr += left.name + ' vs ' + right.name + ' : ' + testResults[ind][indr] + ', ' + testTurns[ind][indr] + '<br>';
      wins += testResults[ind][indr];
    }
    resultStr += '총 승리 : ' + wins + '<br><br>';
  }
  //client.release();
  return resultStr;
  } catch (err) {
    
  }
}

async function procInit () {
  await setCharacter('thelichking', 2, chara.lk);
  /*var rc = {name : '계승의 카드 묶음', type : 90003, rarity : cons.ITEM_RARITY_PREMIUM};
  var rc2 = {name : '계승의 요일석 더미', type : 90004, rarity : cons.ITEM_RARITY_PREMIUM};
  var rc3 = item.list[434];
  var rc4 = item.list[435];
  var tgt = chara.gaius;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc3);
  tgt.premiumPoint = 5;
  await setCharacter('bemderts', '03', tgt);
  var tgt = chara.lunisha;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc2);
  tgt.inventory.push(rc3);
  tgt.premiumPoint = 16;
  await setCharacter('renia1369', '04', tgt);
  var tgt = chara.ruisun;
  tgt.inventory.push(item.list[408]);
  tgt.inventory.push(rc3);
  tgt.premiumPoint = 11;
  await setCharacter('bear1704', '05', tgt);
  var tgt = chara.seriers;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc3);
  tgt.statPoint = 5;
  tgt.premiumPoint = 6;
  tgt.cont = true;
  await setCharacter('megaxzero', '06', tgt);
  var tgt = chara.illun;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc2);
  tgt.inventory.push(rc3);
  tgt.premiumPoint = 9;
  await setCharacter('kyrus1300', '07', tgt);
  var tgt = chara.bks;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.statPoint = 5;
  tgt.premiumPoint = 5;
  tgt.cont = true;
  await setCharacter('xko1023', '08', tgt);
  var tgt = chara.nux;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc2);
  tgt.inventory.push(item.list[384]);
  tgt.inventory.push(item.list[368]);
  tgt.premiumPoint = 23;
  tgt.cont = true;
  await setCharacter('mun9659', '09', tgt);
  var tgt = chara.kasien;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc2);
  tgt.premiumPoint = 9;
  await setCharacter('sxngho', '10', tgt);
  var tgt = chara.marang;
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.inventory.push(rc);
  tgt.premiumPoint = 8;
  tgt.cont = true;
  await setCharacter('tkrsjs', '11', tgt);
  await setCharacter('miniho99', '12', chara.gabi);
  await setCharacter('becrow115', '13', chara.jay);
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
    const client = await pool.connect();
            await client.query('delete from raids where rindex > 100');
            await client.query('insert into raids(rindex, open, phase, monsters) values (103, \'O\', 1, $1)', 
        [JSON.stringify({1 : monster.rsInzeal})]);
            await client.query('insert into raids(rindex, open, phase, monsters) values (104, \'O\', 1, $1)', 
        [JSON.stringify({1 : monster.rsNagpa})]);
            await client.query('insert into raids(rindex, open, phase, monsters) values (105, \'O\', 1, $1)', 
        [JSON.stringify({1 : monster.rsStar1, 2 : monster.rsStar2, 3 : monster.rsStar3, 4 : monster.rsStar4, 5 : monster.rsStar5})]);
            await client.query('insert into raids(rindex, open, phase, monsters) values (106, \'O\', 1, $1)', 
        [JSON.stringify({1 : monster.rsStar1, 2 : monster.rsStar2, 3 : monster.rsStar3, 4 : monster.rsStar4, 5 : monster.rsStar5})]);
            await client.query('insert into raids(rindex, open, phase, monsters) values (107, \'O\', 1, $1)', 
                [JSON.stringify({1 : monster.rsDeci})]);
  try {
    const result = await client.query('select * from characters');
    
    for (val of result.rows) {
      var char = JSON.parse(val.char_data);

      char.raidEffort = 0;
      char.dungeonInfos.runRaid1 = false;
      char.dungeonInfos.runRaid2 = false;
      char.dungeonInfos.runRaid3 = false;
      char.dungeonInfos.runRaid4 = false;
      char.dungeonInfos.enterRaid1 = 1;
      char.dungeonInfos.enterRaid2 = 1;
      char.dungeonInfos.enterRaid3 = 1;
      char.dungeonInfos.enterRaid4 = 1;
      if (val.uid == '02') {
        char.inventory.push(item.list[392]);
        char.raidSide = null;
      }

      //_patchItem('trinket', 505);
      function _patchItem(type, id) {
        if (char.items[type] && char.items[type].id == id) {
          char.items[type].effectDesc = item.list[id].effectDesc;
          char.items[type].effect = item.list[id].effect;
          char.items[type].stat = item.list[id].stat;
        }
        for (itm of char.inventory) {
          if (itm.id == id) {
            itm.effectDesc = item.list[id].effectDesc;
            itm.effect = item.list[id].effect;
            itm.stat = item.list[id].stat;
          }
        }
      }
      
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), val.uid]);
    } 
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procIndex (req, res) {
    const client = await pool.connect();
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const news = await getNews(5);
    if (!sess.userUid) {
      res.render('pages/login');
    } else {
      const personalNews = await getPersonalNews(charRow.uid);
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
        news : news,
        personalNews : personalNews
        //mark : mark
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
}

async function procEvent(req, res) {
    const client = await pool.connect();
  try {
    const sess = req.session; 
    res.render('pages/event', {room: 1000, uid: sess.userUid});
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
}

async function procLogin (req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
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
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procJoin (req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
    if (body.userPwd !== body.userPwdCheck) {
      res.send('비밀번호 확인이 잘못되었습니다.');
      return;      
    }
    const result = await client.query('select * from users where id = $1', [body.userId]);
    if (result.rows.length != 0) {
      res.send('아이디가 중복됩니다.');
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(body.userPwd, salt); 
      const result = await client.query('insert into users(id, password, name, uid) values ($1, $2, $3, $4)', [body.userId, hash, body.userName, null]);
      res.send('가입되었습니다!');
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
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
    tgtList = tgtList.filter(x => x.type === type);
  }
  return JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));  
}

async function procUseItem (req, res) {
  const client = await pool.connect();
  try {
    var chara;
    const body = req.body;
    const result = await client.query('select * from users where id = $1', [req.session.userUid]);
    
    function _processRare(chara, tgtObj, picked) {
      chara.statistics.rareAmt += 1;
      if (chara.quest[5]) {
        chara.quest[5].progress += 1;
      }
    }
    
    function _processUnique(chara, tgtObj, picked) {
      chara.statistics.uniqueAmt += 1;
      picked.tradeCnt = 1;
      if (chara.quest[5]) {
        chara.quest[5].progress += 3;
      }
    }
    
    async function _processEpic(chara, tgtObj, picked) {
      chara.statistics.epicAmt += 1;
      picked.tradeCnt = 1;
      if (chara.quest[5]) {
        chara.quest[5].progress += 3;
      }
      if (!chara.achievement[26 - tgtObj.rank]) {
        await giveAchievement(result.rows[0].uid, chara, 26 - tgtObj.rank);
      }
      if (!chara.achievement[26] && chara.statistics.epicAmt >= 5) {
        await giveAchievement(result.rows[0].uid, chara, 26);
      }
      if (!chara.achievement[27] && chara.statistics.epicAmt >= 10) {
        await giveAchievement(result.rows[0].uid, chara, 27);
      }
    }
    
    function _processPremiumPoint(chara, tgtObj, value) {
      chara.premiumPoint += value;
      chara.statistics.premiumAmt += value;
      return {name : '프리미엄 포인트 ' + value + '점' , rarity : cons.ITEM_RARITY_COMMON};
    }
    
    function _processDust(chara, tgtObj, value, forceFlag) {
      const dustValue = value * (forceFlag ? 1 : Math.pow(2, 9 - tgtObj.rank));
      chara.dust += dustValue;
      chara.statistics.dustAmt += dustValue;
      if (chara.quest[4]) {
        chara.quest[4].progress += 1;
      }
      return {name : dustValue + ' 가루' , rarity : cons.ITEM_RARITY_COMMON};
    }
    
    if (result.rows.length > 0) {
      
      const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
      if (resultChar.rows.length > 0) {
        chara = JSON.parse(resultChar.rows[0].char_data);
        var tgtObj = chara.inventory[body.itemNum];
        if (tgtObj.type < 10) {
          if (tgtObj.rank < chara.rank) {
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
          chara.statistics.cardUsed += 1;
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
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else if (rand < 0.2985) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.3) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.62) {
              if (rand > 0.615 && tgtObj.rank <= 8) {
                picked = {name : '레이드 소환권 - 움직이는 요새', type : 90005, rarity : cons.ITEM_RARITY_PREMIUM, value : 0};
                chara.inventory.push(picked);
              } else if (rand > 0.61 && tgtObj.rank <= 7) {
                picked = {name : '레이드 소환권 - 매버릭 타임 코더', type : 90005, rarity : cons.ITEM_RARITY_PREMIUM, value : 1};
                chara.inventory.push(picked);
              } else {
                picked = _processPremiumPoint(chara, tgtObj, 1);
              }
            } else if (rand < 0.65) {
              picked = _processPremiumPoint(chara, tgtObj, 2);
            } else if (rand < 0.79) {
              picked = _processDust(chara, tgtObj, 12);
            } else if (rand < 0.88) {
              picked = _processDust(chara, tgtObj, 36);
            } else if (rand < 0.9) {
              picked = _processDust(chara, tgtObj, 100);
            } else {
              picked = makeDayStone(null, tgtObj.rank);
              chara.inventory.push(picked);
            }
          } else if (tgtObj.resultType <= 4) {
            if (rand < 0.605) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.881) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE, tgtObj.resultType);
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else if (rand < 0.9365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.9895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } 
          } else if (tgtObj.resultType == 90001) {
            if (rand < 0.405) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_COMMON_UNCOMMON);
              chara.inventory.push(picked);
            } else if (rand < 0.681) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE);
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else if (rand < 0.7365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.7895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.8) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
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
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else if (rand < 0.7365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.7895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.8) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
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
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else if (rand < 0.7365) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.7895) {
              picked = _getItem(tgtObj.rank - 1, cons.ITEM_RARITY_COMMON_UNCOMMON, tgtObj.resultType);
              chara.inventory.push(picked);
            } else if (rand < 0.8) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else if (rand < 0.95) {
              chara.currencies.burntMark += 2;
              picked = {name : '불탄 증표 2개', rarity : cons.ITEM_RARITY_COMMON};
            } else {
              chara.currencies.burntMark += 4;
              picked = {name : '불탄 증표 4개', rarity : cons.ITEM_RARITY_COMMON};
            }
          } else if (tgtObj.resultType == 5) {
            if (rand < 0.97) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_RARE, tgtObj.resultType);
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else if (rand < 0.99) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } 
          } else if (tgtObj.resultType == 6) {
            if (rand < 0.96) {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_UNIQUE, tgtObj.resultType);
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } else {
              picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
              await _processEpic(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
            } 
          } else if (tgtObj.resultType == 90005) {
            picked = _getItem(tgtObj.rank, cons.ITEM_RARITY_EPIC, tgtObj.resultType);
            await _processEpic(chara, tgtObj, picked);
            chara.inventory.push(picked);
            await addItemNews(client, chara, tgtObj, picked);
          } else if (tgtObj.resultType == 90006) {
            if (rand < 0.55) {
              picked = _processDust(chara, tgtObj, 150, true);
            } else if (rand < 0.85) {
              picked = _processDust(chara, tgtObj, 300, true);
            } else if (rand < 0.95) {
              picked = _processDust(chara, tgtObj, 600, true);
            } else if (rand < 0.99) {
              picked = tgtObj.value == 0 ? item.list[436] : item.list[510];
              _processRare(chara, tgtObj, picked);
              chara.inventory.push(picked);
            } else {
              picked = tgtObj.value == 0 ? item.list[437] : item.list[511];
              _processUnique(chara, tgtObj, picked);
              chara.inventory.push(picked);
              await addItemNews(client, chara, tgtObj, picked);
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
        } else if (tgtObj.type === 90003) {
          chara.inventory.splice(body.itemNum, 1);
          addSpecialResultCard(chara, 4);
          addSpecialResultCard(chara, 4);
          addSpecialResultCard(chara, 4);
          addSpecialResultCard(chara, 4);
          addSpecialResultCard(chara, 4);
        } else if (tgtObj.type === 90004) {
          chara.inventory.splice(body.itemNum, 1);
          for (var i = 0; i < 7; i++) {
            var ds = makeDayStone(i, null, 4);
            ds.tradeCnt = 0;
            chara.inventory.push(ds);            
          }
        } else if (tgtObj.type === 90005) {
          res.render('pages/confirm', {inv : chara.inventory, mode : 1, usedItem : body.itemNum});
        }
        await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(chara), result.rows[0].uid]);
      }
    }
    if (!res.headersSent) {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procConfirmItem (req, res) {
  const client = await pool.connect();
  try {
    const body = req.body;
    const charRow = await getCharacter(req.session.userUid);
    const char = JSON.parse(charRow.char_data);
    
    var tgtObj = char.inventory[body.itemUsed];
    if (tgtObj.type === 90005) {
      
      const resultg = await client.query('select * from global');
      for (val of resultg.rows) {
        var glb = JSON.parse(val.globals);
        if (!glb['fieldBossSpawned' + tgtObj.value]) {
          char.inventory.splice(body.itemUsed, 1);
          if (tgtObj.value == 0) {
            await client.query('insert into news(content, date) values ($1, $2)', 
                ['움직이는 요새 - 에이카가 나타났습니다!', new Date()]);
              await client.query('insert into raids(rindex, open, phase, monsters) values (4, \'O\', 1, $1)', 
                [JSON.stringify({1 : monster.rAeika})]);
          } else if (tgtObj.value == 1) {
            await client.query('insert into news(content, date) values ($1, $2)', 
                ['매버릭 타임 코더 - 줄리어스 엠더츠가 나타났습니다!', new Date()]);
              await client.query('insert into raids(rindex, open, phase, monsters) values (5, \'O\', 1, $1)', 
                [JSON.stringify({1 : monster.rJulius})]);
          }
          glb['fieldBossSpawned' + tgtObj.value] = 15;
          glb['fieldBossSummon' + tgtObj.value] = charRow.uid;
          await client.query('update global set globals = $1', [JSON.stringify(glb)]);
        } else {
          res.send('이미 해당 보스가 소환되었습니다.');
        }
      }
      
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    if (!res.headersSent) {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procUnequip (req, res) {
  const client = await pool.connect();
  try {
    var chara;
    const body = req.body;
    const result = await client.query('select * from users where id = $1', [req.session.userUid]);
    if (result.rows.length > 0) {
      const resultChar = await client.query('select char_data from characters where uid = $1', [result.rows[0].uid]);
      if (resultChar.rows.length > 0) {
        chara = JSON.parse(resultChar.rows[0].char_data);
        var tgtObj = chara.items[body.itemType];
        if (tgtObj) {
          chara.items[body.itemType] = undefined;
          calcStats(chara);
          chara.inventory.push(tgtObj);
        }
        await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(chara), result.rows[0].uid]);
      }
    }
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procEnchantItem (req, res) {
    const client = await pool.connect();
  try {
    var chara;
    const body = req.body;
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
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procTrain(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    monster.xTrain.base.maxHp = 2000 * Math.pow(2, 9 - char.rank);
    
    var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(char)), JSON.parse(JSON.stringify(monster.xTrain)), 1);
    res.render('pages/battle', {result: re.result});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procBattleList(req, res) {
    const client = await pool.connect();
  try {
    const sess = req.session; 
    const resultUser = await client.query('select * from users where id = $1', [req.session.userUid]);
    const cuid = resultUser.rows[0].uid;
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid <> $1 order by uid', [cuid]);
    var rval = [];
    for (val of result.rows) {
      if (char.lastBattle == val.uid) {
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
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procBattle(req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
    const resultUser = await client.query('select * from users where id = $1', [req.session.userUid]);
    const result = await client.query('select * from characters');
    const globals = await getGlobals();
    var randBattle = false;
    
    while (!body.charUid || body.charUid == resultUser.rows[0].uid) {
      body.charUid = ('0' + (3 + Math.floor(Math.random() * 11))).slice(-2);
      randBattle = true;
    } 
    
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
    if (left && right && left.lastBattle != body.charUid && (randBattle || left.matchCount > 0)) {
      var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));
      var globalObj = {actionUsed : {type : 'add', value : 1}};
      if (!randBattle) {
        left.matchCount--;
      }
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
      
      _doStatistics(left, re.leftInfo, right);
      _doStatistics(right, re.rightInfo, left);
      left.statistics.atkCnt += re.leftWin;
      left.statistics.atkRecvCnt += re.rightWin;
      right.statistics.atkCnt += re.rightWin;
      right.statistics.atkRecvCnt += re.leftWin;
      left.statistics.apUsed += globalObj.actionUsed.value;
      
      function _doStatistics(chara, charData, opp) {
        chara.statistics.damageDone += charData.damageDone;
        chara.statistics.damageTaken += charData.damageTaken;
        if (chara.statistics.maxDamageDone < charData.maxDamageDone) {
          chara.statistics.maxDamageDone = charData.maxDamageDone;
          chara.statistics.maxDamageDoneTo = opp.name;
        }
        if (chara.statistics.maxDamageTaken < charData.maxDamageTaken) {
          chara.statistics.maxDamageTaken = charData.maxDamageTaken;
          chara.statistics.maxDamageTakenFrom = opp.name;
        }
      }
      
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
        await _processWinner(left, right, body.charUid, cuid);
      }
      if (re.winnerRight) {
        await _processWinner(right, left, cuid, body.charUid);
      }
      
      async function _processWinner(winner, loser, uid, suid) {
        winner.winCnt++;
        if (!winner.achievement[8] && winner.winCnt >= 100) {
          await giveAchievement(suid, winner, 8);
        }
        if (!winner.achievement[9] && winner.winCnt >= 200) {
          await giveAchievement(suid, winner, 9);
        }
        if (!winner.achievement[10] && winner.winCnt >= 500) {
          await giveAchievement(suid, winner, 10);
        }
        if (!winner.achievement[11] && winner.winCnt >= 1000) {
          await giveAchievement(suid, winner, 11);
        }
        if (!winner.achievement[12] && winner.winCnt >= 1500) {
          await giveAchievement(suid, winner, 12);
        }
        if (!winner.achievement[13] && winner.winCnt >= 2000) {
          await giveAchievement(suid, winner, 13);
        }
        
        winner.winRecord[uid] = winner.winRecord[uid] ? winner.winRecord[uid] + 1 : 1;
        winner.recentRecord.push(true);
        loser.recentRecord.push(false);
        winner.winChain++;
        if (winner.winChain % 3 == 0) {
          if (winner.winChain > 5) {
            await client.query('insert into news(content, date) values ($1, $2)', 
                [winner.name + getIga(winner.nameType) + ' ' + winner.winChain + '연승 중입니다!', new Date()]);
          }
          winner.premiumPoint += 1;
          if (winner.winChain % 9 == 0) {
            winner.premiumPoint += 1;
          }
        }
        if (loser.winChain >= 3) {
          if (loser.winChain >= 5) {
            await client.query('insert into news(content, date) values ($1, $2)', 
                [winner.name + getIga(winner.nameType) + ' ' + loser.name + '의 ' + loser.winChain + '연승을 차단했습니다!', new Date()]);
          }
          winner.premiumPoint += Math.floor(loser.winChain / 3);            
        }
        loser.winChain = 0;
        if (!winner.achievement[14] && winner.winChain >= 6) {
          await giveAchievement(suid, winner, 14);
        }
        if (!winner.achievement[15] && winner.winChain >= 9) {
          await giveAchievement(suid, winner, 15);
        }
        if (!winner.achievement[16] && winner.winChain >= 15) {
          await giveAchievement(suid, winner, 16);
        }
        if (!winner.achievement[33] && loser.title == '리치 왕') {
          await giveAchievement(suid, winner, 33);
        }
        
        if (winner.quest[1]) {
          winner.quest[1].progress += 1;
        }
        if (winner.rank > loser.rank) {
          winner.statistics.wonHigherRank += 1;
          loser.statistics.lostLowerRank += 1;
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
      await client.query('insert into personal(uid, content, date) values ($1, $2, $3)', 
          [body.charUid, left.name + '의 전투 신청이 있었습니다. (' + (re.winnerLeft ? '패배' : '승리') + ')', new Date()]);
      await setGlobals(globalObj);
      var winner = re.winnerLeft ? left.name + ' 승리!' : (re.winnerRight ? right.name + ' 승리!' : '');
      var battleTitle = '[ ' + left.name + ' ] vs [ ' + right.name + ' ] - ' + winner;
      await client.query('insert into results(title, result, date) values ($1, $2, $3)', [battleTitle, re.result, new Date()]);
      res.render('pages/battle', {result: re.result});
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procBattleLogList(req, res) {
    const client = await pool.connect();
  try {
    const result = await client.query('select id, title, date from results order by date desc');
    res.render('pages/battleLogList', {list: result.rows});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procBattleLog(req, res) {
    const client = await pool.connect();
  try {
    const result = await client.query('select * from results where id = $1', [req.body.logId]);
    res.render('pages/battle', {result: result.rows[0].result});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procViewList(req, res) {
    const client = await pool.connect();
  try {
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
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procView(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('select * from characters where uid = $1', [req.body.charUid]);
    for (val of result.rows) {
      var charData = JSON.parse(val.char_data);
    } 
    res.render('pages/viewChar', {char: charData});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procViewItemInit(req, res) {
  res.render('pages/viewItem', {items : []});
}

async function procViewItem(req, res) {
  const body = req.body;
  var list = item.list.slice();
  console.log(body);
  if (body.rank && body.rank.includes) {
    var used = body.rank.map(x => Number(x));
    list = list.filter(x => used.includes(x.rank));
  }
  if (body.rarity && body.rarity.includes) {
    var used = body.rarity.map(x => Number(x));
    list = list.filter(x => used.includes(x.rarity));
  }
  if (body.type && body.type.includes) {
    var used = body.type.map(x => Number(x));
    list = list.filter(x => used.includes(x.type));
  }
  if (body.name) {
    list = list.filter(x => x.name.includes(body.name));
  }
  if (body.effect) {
    list = list.filter(x => x.effectDesc && x.effectDesc.includes(body.effect));
  }
  
  list.sort(function (a, b) {
      if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      } else {
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
      }
  });
  res.render('pages/viewItem', {items : list});
}

async function procTradeList(req, res) {
    const client = await pool.connect();
  try {
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
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procTrade(req, res) {
    const client = await pool.connect();
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid = $1', [req.body.charUid]);
    for (val of result.rows) {
      var charData = JSON.parse(val.char_data);
    }
    res.render('pages/selectItem', {title : '아이템 주기', premiumPoint : char.premiumPoint, inv : char.inventory, mode : 3, name : charData.name, uid : req.body.charUid, usedItem : null});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procGive(req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid = $1', [body.charUid]);
    const charRow2 = result.rows[0];
    const charTgt = JSON.parse(charRow2.char_data);
    var tgt = char.inventory[body.itemNum];
    if (tgt.type <= 3 || tgt.type == 999 || tgt.type == 90001) {
      if (tgt.tradeCnt !== undefined) {
        if (tgt.tradeCnt <= 0) {
          res.send('거래 횟수 초과입니다.');
          client.release();
          return;
        } else {
          tgt.tradeCnt--;
        }        
      }
      char.inventory.splice(body.itemNum, 1);
      charTgt.inventory.push(tgt);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charTgt), charRow2.uid]);
    await client.query('insert into personal(uid, content, date) values ($1, $2, $3)', 
        [charRow2.uid, char.name + '에게 ' + tgt.name + getUlrul(tgt.nameType) + ' 받았습니다.', new Date()]);
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '아이템 주기', premiumPoint : char.premiumPoint, inv : char.inventory, mode : 3, name : charTgt.name, uid : req.body.charUid, usedItem : null});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procGivePoint(req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from characters where uid = $1', [body.charUid]);
    const charRow2 = result.rows[0];
    const charTgt = JSON.parse(charRow2.char_data);
    var usedPoint = Math.floor(Number(body.point));
    if (usedPoint <= char.premiumPoint && usedPoint > 0) {
      char.premiumPoint -= usedPoint;
      charTgt.premiumPoint += usedPoint;
      await client.query('insert into personal(uid, content, date) values ($1, $2, $3)', 
          [charRow2.uid, char.name + '에게 프리미엄 포인트 ' + usedPoint + '점을 받았습니다.', new Date()]);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charTgt), charRow2.uid]);
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '아이템 주기', premiumPoint : char.premiumPoint, inv : char.inventory, mode : 3, name : charTgt.name, uid : req.body.charUid, usedItem : null});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
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
              burntMark : [item.list[420], item.list[421], item.list[422], item.list[423]],
              train : [item.list[512], item.list[513], item.list[514], char.dungeonInfos.buyBlacklight],
              indigo : [item.list[516]]}});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  }
}

async function procUseShop (req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
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
        char.dungeonInfos.enterMevious = 3;
        char.dungeonInfos.rewardMevious = false;
        char.dungeonInfos.rewardMevious2 = false;
        char.dungeonInfos.rewardMevious4 = false;
        char.dungeonInfos.rewardMevious6 = false;
        char.dungeonInfos.rewardMevious8 = false;
        char.dungeonInfos.rewardMevious10 = false;
        char.dungeonInfos.rewardMevious12 = false;
        char.dungeonInfos.rewardMevious14 = false;
        char.dungeonInfos.rewardMevious16 = false;
        char.dungeonInfos.rewardMevious18 = false;
        char.dungeonInfos.rewardMevious20 = false;
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
        char.dungeonInfos.enterEmberCrypt = 3;
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
      var cost = body.option >= 106 ? (body.option == 106 ? 100 : (body.option == 107 ? 300 : 800)) : 120;
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
    } else if (body.option >= 90009 && body.option < 90013) {
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
    } else if (body.option >= 90013 && body.option < 90016) {
      var cost = (body.option == 90013) ? 1 : (body.option == 90014 ? 4 : 7);
      if (char.currencies.warlock < cost) {
        res.send('흑마술의 파편이 부족합니다.');
      } else {
        char.currencies.warlock -= cost;
        if (body.option == 90013) {
          char.premiumPoint += 1;
        } else {
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 흑마법사의 선물', rank : 8, resultType : 6});
        }
      }
    } else if (body.option >= 90016 && body.option < 90019) {
      var cost = (body.option == 90016) ? 1 : (body.option == 90017 ? 3 : 5);
      if (char.currencies.aeika < cost) {
        res.send('움직이는 요새의 파편이 부족합니다.');
      } else {
        char.currencies.aeika -= cost;
        if (body.option == 90016) {
          char.premiumPoint += 1;
        } else if (body.option == 90017) {
          addSpecialResultCard(char, 4);
        } else {
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
        }
      }
    } else if (body.option >= 90019 && body.option < 90022) {
      var cost = (body.option == 90019) ? 1 : (body.option == 90020 ? 3 : 5);
      if (char.currencies.julius < cost) {
        res.send('조작된 시간의 파편이 부족합니다.');
      } else {
        char.currencies.julius -= cost;
        if (body.option == 90019) {
          char.premiumPoint += 1;
        } else if (body.option == 90020) {
          addSpecialResultCard(char, 4);
        } else {
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
        }
      }
    } else if (body.option >= 90022 && body.option < 90026) {
      var cost = (body.option == 90023 || body.option == 90024) ? 30 : (body.option == 90022 ? 10 : 60);
      if (char.currencies.train < cost) {
        res.send('수련의 결실이 부족합니다.');
      } else {
        char.currencies.train -= cost;
        if (body.option != 90022) {
          char.inventory.push(JSON.parse(JSON.stringify(item.list[512 + (body.option - 90023)])));
        } else {
          if (char.dungeonInfos.buyBlacklight >= 5) {
            char.currencies.train += cost;
            res.send('더 이상 구매할 수 없습니다.');            
          } else {
            char.dungeonInfos.buyBlacklight++;
            char.statPoint += 2;
          }
        }
      }
    } else if (body.option >= 90026 && body.option < 90030) {
      var cost = (body.option == 90026) ? 5 : (body.option == 90027 ? 10 : (body.option == 90028 ? 15 : 35));
      if (char.currencies.indigo < cost) {
        res.send('석영 증표가 부족합니다.');
      } else {
        char.currencies.indigo -= cost;
        if (body.option == 90029) {
          char.inventory.push(JSON.parse(JSON.stringify(item.list[516])));
        } else if (body.option == 90026) {
          char.inventory.push({name : '기력의 조각', type : 90001, value : 3, rarity : cons.ITEM_RARITY_PREMIUM});
        } else if (body.option == 90027) {
          addSpecialResultCard(char, 5);
        } else if (body.option == 90028) {
          var randl = Math.random();
          char.inventory.push(makeDayStone(null, null, randl < 0.62 ? 2 : (randl < 0.93 ? 3 : 4)));
        }
      }
    }
    await client.query('update characters set char_data = $1, actionpoint = $3 where uid = $2', [JSON.stringify(char), charRow.uid, action]);
    if (!res.headersSent) {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procRaid(req, res) {
  const client = await pool.connect();
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from raids');
    const globals = await getGlobals();
    var dungeonList = [];
    
    if (char.raidSide == 0) {
      dungeonList.push({name : '메비우스 습격 방어전', code : 1, progress : globals.raid.progress[1], additional : char.dungeonInfos.runRaid1, 
        active : globals.raid.open[1], left : globals.raid.left[1], remain : char.dungeonInfos.enterRaid1,
        tooltip : '파멸자는 자신의 힘으로 과거에 사라진 메비우스 괴물들을 다시 만들어내고 있습니다. 아리스란 대륙, 그의 은신처에서 끝없이 나타나는 메비우스로부터 버텨낸다면, 약 12시간 동안 다른 던전에서 추가적인 능력치를 얻습니다.'});
      dungeonList.push({name : '파멸의 표식 해체', code : 3, progress : globals.raid.progress[3], additional : char.dungeonInfos.runRaid2, 
        active : globals.raid.open[3], left : globals.raid.left[3], remain : char.dungeonInfos.enterRaid2,
        tooltip : '파멸자 데시메이트는 자신의 에너지를 통해 자신의 추종자를 되살려 냈습니다. 파멸의 사도 인-질이 파멸자의 봉인을 일깨우는 마법진을 그려냈다는 정보가 확인되었습니다. 아리스란의 공격대는 그를 처치하고 봉인을 푸는 술식을 부숴야만 합니다. 다행히, 싸움이 길어질수록 남아있는 봉인이 그의 힘을 약화시킬 것입니다. 이 던전은 클리어하면 48시간 동안 비활성화되며, 동시간대 미네르프 공격대가 봉인석 확보전을 완료했다면 최종 보스 던전이 해금됩니다.'});
      dungeonList.push({name : '봉인 활성화 작전(내부)', code : 5, progress : globals.raid.progress[5], additional : char.dungeonInfos.runRaid3, 
        active : globals.raid.open[5], left : globals.raid.left[5], remain : char.dungeonInfos.enterRaid3,
        tooltip : '파멸자 데시메이트의 힘을 약화하기 위해, 아리스란 공격대의 작전지역인 봉인실 내부의 봉인을 활성화해야 합니다. 봉인석을 오망성진에 배치해야 하지만, 파멸에 힘에 의한 피해로 한 번에 마법진을 모두 그리는 것은 불가능에 가깝습니다. 그 동안 다져온 대원들의 체력만이 봉인을 활성화하는 유일한 방법입니다. 내부 봉인을 활성화할 경우, 3시간 동안 아리스란 공격대가 데시메이트를 상대할 때 그의 힘을 약화시킬 수 있습니다.'});
      
    } else {
      dungeonList.push({name : '메비우스 기지 공략전', code : 2, progress : globals.raid.progress[2], additional : !char.dungeonInfos.runRaid1, 
        active : globals.raid.open[2], left : globals.raid.left[2], remain : char.dungeonInfos.enterRaid1,
        tooltip : '파멸자는 자신의 힘으로 과거에 사라진 메비우스 괴물들을 다시 만들어내고 있습니다. 미네르프 대륙의 공격대는 그들의 숨겨진 거점을 찾아 공략하여, 전세를 뒤집어야만 합니다. 이 작전에 성공한다면, 약 12시간 동안 다른 던전에서 추가적인 능력치를 얻습니다.'});
      dungeonList.push({name : '봉인석 확보전', code : 4, progress : globals.raid.progress[4], additional : char.dungeonInfos.runRaid2, 
        active : globals.raid.open[4], left : globals.raid.left[4], remain : char.dungeonInfos.enterRaid2,
        tooltip : '고대의 봉인에 금이 가고 있어, 대체할 수 있는 새로운 봉인석을 확보해야 합니다. 하지만 쉽지 않습니다. 파멸의 사도 나그파가 세력을 이끌고 봉인석의 재료가 되는 아말레이트 광산을 점거하고 있습니다. 그를 처치하고 봉인석을 확보하십시오. 다행히, 싸움이 길어질수록 파멸의 기운이 약화될 것입니다. 이 던전은 클리어하면 48시간 동안 비활성화되며, 동시간대 아리스란 공격대가 파멸의 표식을 해체했다면 최종 보스 던전이 해금됩니다.'});
      dungeonList.push({name : '봉인 활성화 작전(외부)', code : 6, progress : globals.raid.progress[6], additional : char.dungeonInfos.runRaid3, 
        active : globals.raid.open[6], left : globals.raid.left[6], remain : char.dungeonInfos.enterRaid3,
        tooltip : '파멸자 데시메이트의 힘을 약화하기 위해, 미네르프 공격대의 작전지역인 봉인실 외부의 봉인을 활성화해야 합니다. 봉인석을 오망성진에 배치해야 하지만, 파멸에 힘에 의한 피해로 한 번에 마법진을 모두 그리는 것은 불가능에 가깝습니다. 그 동안 다져온 대원들의 체력만이 봉인을 활성화하는 유일한 방법입니다. 외부 봉인을 활성화할 경우, 3시간 동안 미네르프 공격대가 데시메이트를 상대할 때 그의 힘을 약화시킬 수 있습니다.'});
      
    }
    dungeonList.push({name : '최종 작전 - 데시메이트 봉인', code : 7, progress : globals.raid.progress[7], additional : char.dungeonInfos.runRaid4, 
      active : globals.raid.open[7], remain : char.dungeonInfos.enterRaid4,
      tooltip : '날뛰는 파멸의 기운을 잠재우고, 거대한 에너지체인 데시메이트를 공략할 시간입니다. 모든 준비를 마쳐야만, 데시메이트를 상대할 때 어려움을 덜 수 있을 것입니다. 주의하십시오. 그의 봉인이 조금이라도 깨어난다면, 당신은 순식간에 소멸할 것입니다.'});
    res.render('pages/raids', {dungeonList : dungeonList, nameIn : char.name});
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procEnterRaid(req, res) {
  const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const globals = await getGlobals();
    var enemy, curData, hpBefore, row, list;
    if (!globals.raid.open[body.option]) {
      client.release();
      res.redirect('/');
      return;
    }
    // check entering cond
    const rand = Math.random();
    if (body.option == 1 || body.option == 2) {
      if (char.dungeonInfos.enterRaid1 > 0) {
        enemy = rand < 0.33 ? monster.mMassCrawler : (rand < 0.67 ? monster.mDestoryer : monster.mMegaTaurus);
        if (char.dungeonInfos.runRaid1) {
          if (charRow.actionPoint <= 0) {
            client.release();
            res.redirect('/');
            return;
          }
        }
      }
    } else if (body.option == 3 || body.option == 4) {
      if (char.dungeonInfos.enterRaid2 > 0) {
        const result = await client.query('select * from raids where rindex = $1', [100 + Number(body.option)]);
        row = result.rows[0];
        curData = JSON.parse(row.monsters);
        enemy = curData[row.phase];
        hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
        if (char.dungeonInfos.runRaid2) {
          if (charRow.actionPoint <= 0) {
            client.release();
            res.redirect('/');
            return;
          }
        }
      }
    } else if (body.option == 5 || body.option == 6) {
      if (char.dungeonInfos.enterRaid3 > 0) {
        const result = await client.query('select * from raids where rindex = $1', [100 + Number(body.option)]);
        row = result.rows[0];
        curData = JSON.parse(row.monsters);
        enemy = curData[row.phase];
        hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
        if (char.dungeonInfos.runRaid3) {
          if (charRow.actionPoint <= 0) {
            client.release();
            res.redirect('/');
            return;
          }
        }
      }
    } else if (body.option == 7) {
      if (char.dungeonInfos.enterRaid4 > 0) {
        const result = await client.query('select * from raids where rindex = $1', [100 + Number(body.option)]);
        row = result.rows[0];
        curData = JSON.parse(row.monsters);
        enemy = curData[row.phase];
        hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
        if (char.dungeonInfos.runRaid4) {
          if (charRow.actionPoint <= 0) {
            client.release();
            res.redirect('/');
            return;
          }
        }
      }
    }
    if (enemy) {
      var addInfo = {};
      if (body.option == 1 || body.option == 2) {
        var enemyUsed = JSON.parse(JSON.stringify(enemy));
        if (!enemyUsed.startEffects) {
          enemyUsed.startEffects = [];
        }
        enemyUsed.startEffects.push({code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90075, buffDur : null});
        var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(char)), enemyUsed, 1);
        var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
          result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp}];
        var isFinished = true;
        var reward = ''; 
        if (char.dungeonInfos.runRaid1) {
          char.dungeonInfos.enterRaid1--;
          await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
        }

        char.dungeonInfos.runRaid1 = true;
        if (!re.winnerLeft) {
          reward += '패배했습니다..';
        } else {
          reward += '공헌도 20을 얻었습니다!';
          char.raidEffort += 20;

          await setGlobals({raid : {type : 'raid', name : 'progress', idx : body.option, mode : 'add', value : 20}});
          if (globals.raid.progress[body.option] >= 80) {
            await setGlobals({raid : {type : 'raid', name : 'left', idx : body.option, mode : 'set', value : 72}});
            await setGlobals({raid : {type : 'raid', name : 'open', idx : body.option, mode : 'set', value : false}});
            await client.query('insert into news(content, date) values ($1, $2)', 
                [char.raidSide == 0 ? '아리스란이 메비우스 습격 방어전을 공략했습니다!' : '미네르프가 메비우스 기지 공략전을 공략했습니다!', new Date()]);            
          }
        }
      } else {
        var charUsed = JSON.parse(JSON.stringify(char));
        if (!charUsed.startEffects) {
          charUsed.startEffects = [];
        }
        if (!globals.raid.open[charUsed.raidSide + 1]) {
          charUsed.startEffects.push({code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90072, buffDur : null});
        }
        var enemyUsed = JSON.parse(JSON.stringify(enemy));
        if (!enemyUsed.startEffects) {
          enemyUsed.startEffects = [];
        }
        enemyUsed.startEffects.push({code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90075, buffDur : null});
        if (body.option == 7) {
          if (globals.raid.open[3]) {
            enemyUsed.startEffects.push({code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90073, buffDur : null});
          }
          if (globals.raid.open[4]) {
            enemyUsed.startEffects.push({code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : 90074, buffDur : null});
          }
          if (!globals.raid.open[charUsed.raidSide + 5]) {
            enemyUsed.startEffects.push({code : cons.EFFECT_TYPE_REMOVE_BUFF, buffTarget : [90069], buffDur : null});
            enemyUsed.startEffects.push({code : cons.EFFECT_TYPE_SET_ALL_BUFF_DURATION, value : 500, buffCode : 10});
          }
          
        }
        var re = (new battlemodule.bmodule()).doBattle(enemyUsed, charUsed, 1);
        var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
          result : re.winnerRight ? '승리' : '패배', hpLeft : re.leftInfo.curHp}];
        const damageDealt = hpBefore - re.leftInfo.curHp;
        re.leftInfo.buffs = [];
        re.leftInfo.items = enemy.items;
        re.leftInfo.skill = enemy.skill;
        re.leftInfo.startEffects = enemy.startEffects;
        if (body.option == 3 || body.option == 4) {
          re.leftInfo.turnCount = re.leftInfo.turnCount ? re.leftInfo.turnCount : 0;
          re.leftInfo.turnCount += re.turnCount;
        }
        var isFinished = true;
        curData[row.phase] = re.leftInfo;
        curData[row.phase].battleRecord[charRow.uid] = curData[row.phase].battleRecord[charRow.uid] ? curData[row.phase].battleRecord[charRow.uid] + damageDealt : damageDealt;
        curData[row.phase].winRecord[charRow.uid] = curData[row.phase].winRecord[charRow.uid] ? curData[row.phase].winRecord[charRow.uid] + 1 : 1;
        var reward = damageDealt + ' 피해를 입혔습니다! (누적 피해 : ' + curData[row.phase].battleRecord[charRow.uid] + ')<br>';
        
        if (body.option == 3 || body.option == 4) {
          var maxHpTotal = curData[row.phase].stat.maxHp;
          var raidEffort = Math.floor(damageDealt * 100 / maxHpTotal);
          if (raidEffort > 0) {
            char.raidEffort += raidEffort;
            reward += raidEffort + ' 공헌도를 획득했습니다.<br>';
          }
          await setGlobals({raid : {type : 'raid', name : 'progress', idx : body.option, mode : 'set', value : 100 - Math.ceil((re.leftInfo.curHp / re.leftInfo.stat.maxHp) * 100)}});
          
          if (char.dungeonInfos.runRaid2) {
            char.dungeonInfos.enterRaid2--;
            await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
          }

          char.dungeonInfos.runRaid2 = true;

          await client.query('update raids set phase = $1, monsters = $2 where rindex = $3', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData), 100 + Number(body.option)]);

          if (!re.winnerLeft) {
            await setGlobals({raid : {type : 'raid', name : 'left', idx : body.option, mode : 'set', value : 288}});
            await setGlobals({raid : {type : 'raid', name : 'open', idx : body.option, mode : 'set', value : false}});
            await client.query('insert into news(content, date) values ($1, $2)', 
                [char.raidSide == 0 ? '아리스란이 파멸의 표식 해체를 공략했습니다!' : '미네르프가 봉인석 확보전을 공략했습니다!', new Date()]); 
            
            if (!globals.raid.open[2 + Number(body.option)] && globals.raid.left[2 + Number(body.option)] == undefined) {
              await setGlobals({raid : {type : 'raid', name : 'open', idx : 2 + Number(body.option), mode : 'set', value : true}});
              await client.query('insert into news(content, date) values ($1, $2)', 
                  [char.raidSide == 0 ? '아리스란이 내부 봉인 활성화 작전을 시작합니다!' : '미네르프가 외부 봉인 활성화 작전을 시작합니다!', new Date()]);             
            }
            
            var otherOption = body.option == 3 ? 4 : 3;
            if (!globals.raid.open[otherOption] && !globals.raid.open[7]) {
              await setGlobals({raid : {type : 'raid', name : 'open', idx : 7, mode : 'set', value : true}});
              await client.query('insert into news(content, date) values ($1, $2)', 
                  ['최종 작전 - 데시메이트 봉인이 시작됩니다!', new Date()]);             
            }
            
            char.raidEffort += 10;
            addSpecialResultCard(char, 4, 6);
            reward += re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!<br>공헌도 10, 6급 장비 리설트 카드 1개를 획득했습니다.<br>';
            var leaderboard = await createRaidResults(100 + Number(body.option), 1, char);
            
            const results = await client.query('select * from characters');
            for (val of results.rows) {
              const charx = JSON.parse(val.char_data);
              if (charx.raidSide != char.raidSide) {
                continue;
              }
              charx.raidEffort += 10;
              addSpecialResultCard(charx, 4, 6);
              
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charx), val.uid]);
            } 
            
          }
        } else if (body.option == 5 || body.option == 6) {
          var raidEffort = Math.floor(hpBefore / 5000) - Math.floor(re.leftInfo.curHp / 5000);
          if (raidEffort > 0) {
            char.raidEffort += raidEffort;
            reward += raidEffort + ' 공헌도를 획득했습니다.<br>';
          }
          await setGlobals({raid : {type : 'raid', name : 'progress', idx : body.option, mode : 'set', value : 20 * row.phase - Math.ceil((re.leftInfo.curHp / re.leftInfo.stat.maxHp) * 20)}});
          
          if (char.dungeonInfos.runRaid3) {
            char.dungeonInfos.enterRaid3--;
            await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
          }

          char.dungeonInfos.runRaid3 = true;

          await client.query('update raids set phase = $1, monsters = $2 where rindex = $3', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData), 100 + Number(body.option)]);

          if (!re.winnerLeft) {
            
            if (row.phase >= 5) { 
              await setGlobals({raid : {type : 'raid', name : 'left', idx : body.option, mode : 'set', value : 18}});
              await setGlobals({raid : {type : 'raid', name : 'open', idx : body.option, mode : 'set', value : false}});
              await client.query('insert into news(content, date) values ($1, $2)', 
                  [char.raidSide == 0 ? '아리스란이 내부 봉인 활성화 작전을 완료했습니다!' : '미네르프가 외부 봉인 활성화 작전을 완료했습니다!', new Date()]);
              var leaderboard = await createRaidResults(100 + Number(body.option), 5, char);
            }
            
            char.raidEffort += 10;
            addSpecialResultCard(char, 4, 6);
            reward += re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!<br>공헌도 10, 6급 장비 리설트 카드 1개를 획득했습니다.<br>';
            
          }
        } else if (body.option == 7) {
          addResultGauge(char, 35);
          reward += '리설트 게이지를 35만큼 획득했습니다.<br>';
          if (curData[row.phase].battleRecord[charRow.uid] >= 10000 && !char.dungeonInfos['rewardRaid' + (curData[row.phase].battleRecord[charRow.uid] / 10000)]) {
            char.dungeonInfos['rewardRaid' + (curData[row.phase].battleRecord[charRow.uid] / 10000)] = true;
            char.raidEffort += 5;
            reward += '5 공헌도를 획득했습니다.<br>';
          }
          await setGlobals({raid : {type : 'raid', name : 'progress', idx : body.option, mode : 'set', value : 100 - Math.ceil((re.leftInfo.curHp / re.leftInfo.stat.maxHp) * 100)}});
          
          if (char.dungeonInfos.runRaid4) {
            char.dungeonInfos.enterRaid4--;
            await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
          }

          char.dungeonInfos.runRaid4 = true;

          await client.query('update raids set phase = $1, monsters = $2 where rindex = $3', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData), 100 + Number(body.option)]);

          if (!re.winnerLeft) {
            
            
          }
        }
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: resultList, isFinished : isFinished, reward : reward, stop : (body.option == 2), addInfo : addInfo});
    } else {
      if (!res.headersSent) {
        res.redirect('/');
      }
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procDungeon(req, res) {
    const client = await pool.connect();
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const result = await client.query('select * from raids');
    var dungeonList = [];
    dungeonList.push({name : '메모리얼 게이트 - 메비우스 섬멸 [9급 20레벨 이상]', code : 1, remain : char.dungeonInfos.enterMevious, active : !char.dungeonInfos.runMevious && char.dungeonInfos.enterMevious > 0 && (char.rank <= 8 || char.level >= 20)});
    dungeonList.push({name : '어나더 게이트 - 재의 묘소 [9급 20레벨 이상]', code : 2, remain : char.dungeonInfos.enterEmberCrypt, active : !char.dungeonInfos.runEmberCrypt && char.dungeonInfos.enterEmberCrypt > 0 && (char.rank <= 8 || char.level >= 20)});
    dungeonList.push({name : '승급 심사장 [20레벨 이상]', code : 3, active : !char.dungeonInfos.runRankup && char.level >= 20});
    dungeonList.push({name : '필드 보스 - 고대 흑마법사 출현', code : 4, active : false, tooltip : '매 30분/정각마다 도전 가능'});
    dungeonList.push({name : '필드 보스 - 움직이는 요새', code : 5, active : false, additional : char.dungeonInfos.runFieldBoss0, tooltip : '매 10분마다 무료로 도전 가능, 이후 피로도 1 소모'});
    dungeonList.push({name : '필드 보스 - 매버릭 타임 코더', code : 6, active : false, additional : char.dungeonInfos.runFieldBoss1, tooltip : '매 10분마다 무료로 도전 가능, 이후 피로도 1 소모'});
    dungeonList.push({name : '메모리얼 게이트 - 검은 빛의 수련장 [7급 10레벨 이상]', code : 7, remain : char.dungeonInfos.enterBlacklight, active : !char.dungeonInfos.runBlacklight && char.dungeonInfos.enterBlacklight > 0 && (char.rank <= 6 || (char.rank == 7 && char.level >= 10))});
    dungeonList.push({name : '어나더 게이트 - 전이된 석영 고원 [6급 이상]', code : 8, remain : char.dungeonInfos.enterIndigo, active : !char.dungeonInfos.runIndigo && char.dungeonInfos.enterIndigo > 0 && char.rank == 6});
    if (result && result.rows) {
      for (row of result.rows) {
        var tgt = dungeonList[row.rindex];
        if (row.rindex == 3 && row.phase <= 3) {
          tgt.active = row.open == 'O' && !char.dungeonInfos.runFieldBoss;
        } else if (row.rindex <= 5 && row.phase <= 1) {
          tgt.active = row.open == 'O';
        }
        if (row.open == 'O' && row.rindex < 100) {
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
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procEnterDungeon(req, res) {
  const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var enemy, curData, hpBefore, row, list;
    // check entering cond
    const rand = Math.random();
    if (body.option == 1) {
      if (!char.dungeonInfos.runMevious && char.dungeonInfos.enterMevious > 0 && (char.rank <= 8 || char.level >= 20)) {
        char.dungeonInfos.runMevious = true;
        char.dungeonInfos.enterMevious--;
        enemy = rand < 0.5 ? monster.mCrawler : monster.mHeadHunter;
      }
    } else if (body.option == 2) {
      if (!char.dungeonInfos.runEmberCrypt && char.dungeonInfos.enterEmberCrypt > 0 && (char.rank <= 8 || char.level >= 20)) {
        char.dungeonInfos.runEmberCrypt = true;
        char.dungeonInfos.enterEmberCrypt--;
        enemy = rand < 0.5 ? monster.eBroken : monster.eCrossbow;
      }
    } else if (body.option == 3) {
      if (!char.dungeonInfos.runRankup) {
        char.dungeonInfos.runRankup = true;
        list = [monster['ruPsi' + char.rank], monster['ruAeohelm' + char.rank], monster['ruLozic' + char.rank]];
        if (char.rank <= 6) {
          list.push(monster.ruDekaitz6);
        }
        const idx = Math.floor(Math.random() * 3);
        enemy = list[idx];
        list.splice(idx, 1);
      }
    } else if (body.option == 4) {
      const result = await client.query('select * from raids where rindex = 3');
      row = result.rows[0];
      if (!char.dungeonInfos.runFieldBoss && (row.open == 'O')) {
        curData = JSON.parse(row.monsters);
        char.dungeonInfos.runFieldBoss = true;
        enemy = curData[row.phase];
        if (enemy) {
          hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
        }
      }
    } else if (body.option == 5) {
      const result = await client.query('select * from raids where rindex = 4');
      row = result.rows[0];
      curData = JSON.parse(row.monsters);
      enemy = curData[row.phase];
      hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
      if (char.dungeonInfos.runFieldBoss0 && (row.open == 'O')) {
        if (charRow.actionPoint <= 0) {
          client.release();
          res.redirect('/');
          return;
        }
      }
    } else if (body.option == 6) {
      enemy = monster.rTimeStorm;
      if (char.dungeonInfos.runFieldBoss1) {
        if (charRow.actionPoint <= 0) {
          client.release();
          res.redirect('/');
          return;
        }
      }
    } else if (body.option == 7) {
      if (!char.dungeonInfos.runBlacklight && char.dungeonInfos.enterBlacklight > 0 && (char.rank <= 6 || (char.rank == 7 && char.level >= 10))) {
        char.dungeonInfos.runBlacklight = true;
        char.dungeonInfos.enterBlacklight--;
        enemy = monster.d7Knight;
      }
    } else if (body.option == 8) {
      if (!char.dungeonInfos.runIndigo && char.dungeonInfos.enterIndigo > 0 && char.rank <= 6) {
        char.dungeonInfos.runIndigo = true;
        char.dungeonInfos.enterIndigo--;
        enemy = monster.d720;
      }
    }
    if (enemy) {
      var addInfo = {};
      if (body.option == 1 || body.option == 2 || body.option == 6 || body.option == 8) {
        var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(char)), JSON.parse(JSON.stringify(enemy)), 1);
        var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
          result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp}];
        re.leftInfo.buffs = [];
        re.leftInfo.items = char.items;
        var isFinished = false;
        var reward = ''; 
        if (!re.winnerLeft) {
          isFinished = true;
          reward += '패배했습니다..';
          if (body.option == 6) {
            char.dungeonInfos.runFieldBoss1 = true;
          }
        }
        req.session.dungeonProgress = {code : body.option, phase : 1, resultList : resultList, charData : re.leftInfo};
        if (body.option == 1) {
          req.session.dungeonProgress.taurus = 0;
        }
        if (body.option == 8) {
          req.session.dungeonProgress.buffs = [{idx : 0, name : 'X Attack', desc : '물리공격력 20% 증가', buff : 90039},
                                               {idx : 1, name : 'X Special Attack', desc : '마법공격력 20% 증가', buff : 90040},
                                               {idx : 2, name : 'X Defense', desc : '물리저항 12%p 증가', buff : 90041},
                                               {idx : 3, name : 'X Special Defense', desc : '마법저항 12%p 증가', buff : 90042},
                                               {idx : 4, name : '녹지 않는 얼음', desc : '목호에게 스킬 계수 40% 증가', buff : 90053},
                                               {idx : 5, name : 'X Accuracy', desc : '명중/치명피해 20%p 증가', buff : 90044},
                                               {idx : 6, name : 'X Speed', desc : '회피 10%p 증가', buff : 90045},
                                               {idx : 7, name : '가드 렌즈', desc : '치명 10%p 증가', buff : 90046},
                                               {idx : 8, name : '회복약', desc : '전투 중 한 번 생명력 25% 회복', buff : 90047},
                                               {idx : 14, name : '회복약', desc : '전투 중 한 번 생명력 25% 회복', buff : 90047},
                                               {idx : 9, name : '열매 더미', desc : '받는 상태이상 무효화 (쿨다운 4턴)', buff : 90048},
                                               {idx : 10, name : '생명의 구슬', desc : '스킬 계수 50% 증가, 공격 시 최대 생명력의 10%만큼 절대 피해', buff : 90049},
                                               {idx : 11, name : '목탄', desc : '칸나에게 스킬 계수 40% 증가', buff : 90050},
                                               {idx : 12, name : '휘어진 스푼', desc : '시바에게 스킬 계수 40% 증가', buff : 90051},
                                               {idx : 13, name : '저주의 부적', desc : '국화에게 스킬 계수 40% 증가', buff : 90052}];
          addInfo.type = 8;
          addInfo.data = [];
          for (let i = 0; i < 3; i++) {
            var idx = Math.floor(req.session.dungeonProgress.buffs.length * Math.random());
            addInfo.data.push(req.session.dungeonProgress.buffs[idx]);
            req.session.dungeonProgress.buffs.splice(idx, 1);
          }
          req.session.dungeonProgress.addInfo = addInfo.data;
        }
      } else if (body.option == 3 || body.option == 7) {
        var roomNum = curRoom++;
        trades[roomNum] = {};
        trades[roomNum].leftUid = charRow.uid;
        trades[roomNum].leftChr = JSON.parse(JSON.stringify(char));
        trades[roomNum].rightChr = JSON.parse(JSON.stringify(enemy));
        req.session.dungeonProgress = {code : body.option, phase : 1, resultList : [], roomNum : roomNum, tgtList : list};

        await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
        res.render('pages/trade', {room: roomNum, uid: charRow.uid});
        return;
      } else {
        var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(enemy)), JSON.parse(JSON.stringify(char)), 1);
        var resultList = [{phase : 1, monImage : enemy.image, monName : enemy.name, 
          result : re.winnerRight ? '승리' : '패배', hpLeft : re.leftInfo.curHp}];
        const damageDealt = hpBefore - re.leftInfo.curHp;
        re.leftInfo.buffs = [];
        re.leftInfo.items = enemy.items;
        re.leftInfo.skill = enemy.skill;
        var isFinished = true;
        curData[row.phase] = re.leftInfo;
        curData[row.phase].battleRecord[charRow.uid] = curData[row.phase].battleRecord[charRow.uid] ? curData[row.phase].battleRecord[charRow.uid] + damageDealt : damageDealt;
        curData[row.phase].winRecord[charRow.uid] = curData[row.phase].winRecord[charRow.uid] ? curData[row.phase].winRecord[charRow.uid] + 1 : 1;
        var reward = damageDealt + ' 피해를 입혔습니다! (누적 피해 : ' + curData[row.phase].battleRecord[charRow.uid] + ')<br>';
        
        if (body.option == 4) {
          var maxHpTotal = curData[1].stat.maxHp + curData[2].stat.maxHp + curData[3].stat.maxHp;
          var dust = 10 * Math.floor(damageDealt * 100 / maxHpTotal);
          if (dust > 0) {
            char.dust += dust;
            reward += dust + ' 가루를 획득했습니다.<br>';
          }
          if (curData[row.phase].battleRecord[charRow.uid] >= maxHpTotal / 10) {
            if (!char.dungeonInfos['rewardFieldBoss' + row.phase]) {
              char.dungeonInfos['rewardFieldBoss' + row.phase] = true;
              char.currencies.warlock++;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 장비 카드', rank : 8, resultType : 4});
              reward += '누적 피해량 보상으로 고대 장비 카드 1개, 흑마술의 파편 1개를 획득했습니다.<br>';
            }  
          }
          await client.query('update raids set phase = $1, monsters = $2 where rindex = 3', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData)]);
          
        } else if (body.option == 5) {
          var maxHpTotal = curData[1].stat.maxHp;
          var dust = 11 * Math.floor(damageDealt * 100 / maxHpTotal);
          if (dust > 0) {
            char.dust += dust;
            reward += dust + ' 가루를 획득했습니다.<br>';
          }
          if (curData[row.phase].battleRecord[charRow.uid] >= maxHpTotal / 10) {
            var perNum = Math.floor(curData[row.phase].battleRecord[charRow.uid] * 10 / maxHpTotal);
            if (!char.dungeonInfos['rewardFieldBoss0' + perNum]) {
              char.dungeonInfos['rewardFieldBoss0' + perNum] = true;
              char.currencies.aeika++;
              reward += '누적 피해량 보상으로 움직이는 요새의 파편 1개를 획득했습니다.<br>';
            }  
          }
          if (char.dungeonInfos.runFieldBoss0) {
            await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
          }
          await client.query('update raids set phase = $1, monsters = $2 where rindex = 4', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData)]);

          char.dungeonInfos.runFieldBoss0 = true;
        }
        if (!re.winnerLeft) {
          if (body.option == 4) {
            if (row.phase <= 2) {
              char.currencies.warlock++;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 장비 카드', rank : 8, resultType : 4});
              reward += '페이즈 종료 보상으로 고대 장비 카드 1개, 흑마술의 파편 1개를 획득했습니다.<br>';
            } else {
              char.currencies.warlock += 3;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 흑마법사의 선물', rank : 8, resultType : 6});
              reward += re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!<br>고대 흑마법사의 선물 1개, 흑마술의 파편 3개를 획득했습니다.<br>';
              if (!char.achievement[28]) {
                await giveAchievement(charRow.uid, char, 28);
              }
              var leaderboard = await createRaidResults(3, 3, char);
              if (charRow.uid == leaderboard[0].key) {
                char.currencies.warlock += 3;
                char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 흑마법사의 선물', rank : 8, resultType : 6});
                reward += '누적 피해 보상으로 고대 흑마법사의 선물 1개, 흑마술의 파편 3개를 획득했습니다.<br>';
                if (!char.achievement[35]) {
                  await giveAchievement(charRow.uid, char, 35);
                }                
              } else {
                const charRow2 = await getCharacterByUid(leaderboard[0].key);
                const char2 = JSON.parse(charRow2.char_data);
                char2.currencies.warlock += 3;
                char2.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '고대 흑마법사의 선물', rank : 8, resultType : 6});
                if (!char2.achievement[35]) {
                  await giveAchievement(charRow2.uid, char2, 35);
                }
                await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char2), charRow2.uid]);
              }
            }
          } else if (body.option == 5) {
            char.currencies.aeika += 2;
            char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
            reward += re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!<br>에이카의 예비 부품 상자 1개, 움직이는 요새의 파편 2개를 획득했습니다.<br>';
            if (!char.achievement[34]) {
              await giveAchievement(charRow.uid, char, 34);
            }
            const globals = await getGlobals();
            var leaderboard = await createRaidResults(4, 1, char);
            if (charRow.uid == globals.fieldBossSummon0) {
              char.currencies.aeika++;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
              reward += '소환 보상으로 에이카의 예비 부품 상자 1개, 움직이는 요새의 파편 1개를 획득했습니다.<br>';
            } else {
              const charRow2 = await getCharacterByUid(globals.fieldBossSummon0);
              const char2 = JSON.parse(charRow2.char_data);
              char2.currencies.aeika++;
              char2.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char2), charRow2.uid]);
            }
            if (charRow.uid == leaderboard[0].key) {
              char.currencies.aeika++;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
              reward += '누적 피해 보상으로 에이카의 예비 부품 상자 1개, 움직이는 요새의 파편 1개를 획득했습니다.<br>';
              if (!char.achievement[36]) {
                await giveAchievement(charRow.uid, char, 36);
              }                
            } else {
              const charRow2 = await getCharacterByUid(leaderboard[0].key);
              const char2 = JSON.parse(charRow2.char_data);
              char2.currencies.aeika++;
              char2.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
              if (!char2.achievement[36]) {
                await giveAchievement(charRow2.uid, char2, 36);
              }
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char2), charRow2.uid]);
            }
            const results = await client.query('select * from characters');
            const partList = leaderboard.map(x => x.key);
            for (val of results.rows) {
              if (val.uid == charRow.uid) {
                continue;
              } 
              if (!partList.includes(val.uid)) {
                continue;
              }
              const charx = JSON.parse(val.char_data);
              charx.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '에이카의 예비 부품 상자', resultType : 90006, value : 0});
              
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charx), val.uid]);
            } 
          }
        } 
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: resultList, isFinished : isFinished, reward : reward, stop : (body.option == 2), addInfo : addInfo});
    } else {
      if (!res.headersSent) {
        res.redirect('/');
      }
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procNextPhaseDungeon(req, res) {
    const client = await pool.connect();
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var enemy, curData, hpBefore, row, list;
    // check entering cond
    const rand = Math.random();
    if (sess.dungeonProgress && (!sess.dungeonProgress.isFinished || sess.dungeonProgress.code == 2)) {
      if (sess.dungeonProgress.code == 1) {
        if (sess.dungeonProgress.phase < 10) {
          sess.dungeonProgress.charData.curHp += (sess.dungeonProgress.charData.stat.maxHp - sess.dungeonProgress.charData.curHp) * 0.15;
        }
        if (sess.dungeonProgress.phase < 20) {
          enemy = rand < 0.05 ? monster.mTaurus : (rand < 0.525 ? monster.mCrawler : monster.mHeadHunter);
        }
      } else if (sess.dungeonProgress.code == 2) {
        sess.dungeonProgress.charData.curHp = sess.dungeonProgress.charData.stat.maxHp;
        if (sess.dungeonProgress.phase == 1) {
          enemy = monster.eGunda;
        } 
      } else if (sess.dungeonProgress.code == 3) {
        var re = trades[sess.dungeonProgress.roomNum].result;
        if (req.session.dungeonProgress.phase == (10 - char.rank) && re.winnerLeft) {
          var reward = '';
          reward += '승급 심사를 통과했습니다!<br>';
          char.rankReq = true;
          delete trades[sess.dungeonProgress.roomNum];
          await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
          res.render('pages/dungeonResult', {result: re.result, resultList: [], isFinished : true, reward : reward, stop : false, addInfo : {}});
        } else if (re.winnerLeft) {
          list = req.session.dungeonProgress.tgtList;
          const idx = Math.floor(Math.random() * list.length);
          enemy = list[idx];
          list.splice(idx, 1);
        }
      } else if (sess.dungeonProgress.code == 6 && sess.dungeonProgress.phase == 1) {
        const result = await client.query('select * from raids where rindex = 5');
        row = result.rows[0];
        if ((row.open == 'O')) {
          curData = JSON.parse(row.monsters);
          enemy = curData[row.phase];
          hpBefore = enemy.curHp ? enemy.curHp : enemy.stat.maxHp;
          if (char.dungeonInfos.runFieldBoss1 && charRow.actionPoint <= 0) {
            client.release();
            res.redirect('/');
            return;
          }
        }
      } else if (sess.dungeonProgress.code == 7) {
        if (trades[sess.dungeonProgress.roomNum] && trades[sess.dungeonProgress.roomNum].result) {
          console.log(sess.userUid + '/' + sess.dungeonProgress.phase);
          var re = trades[sess.dungeonProgress.roomNum].result;
          if (re.winnerLeft && sess.dungeonProgress.phase <= 3) {
            var reward = '';
            var enterNext = true;
            re.leftInfo.buffs = [];
            re.leftInfo.items = char.items;
            re.leftInfo.skill = char.skill;
            req.session.dungeonProgress.charData = re.leftInfo;
            if (!char.dungeonInfos['rewardBlacklight' + sess.dungeonProgress.phase]) {
              char.dungeonInfos['rewardBlacklight' + sess.dungeonProgress.phase] = true;
              var minVal = sess.dungeonProgress.phase == 1 ? 1 : (sess.dungeonProgress.phase == 2 ? 2 : 4);
              var varVal = sess.dungeonProgress.phase == 1 ? 1 : (sess.dungeonProgress.phase == 2 ? 1 : 2);
              var train = minVal + Math.floor(varVal * Math.random());
              reward += '수련의 결실 ' + train + '개를 획득했습니다!<br>';
              char.currencies.train += train;
            }
            if (!char.dungeonInfos.clearBlacklight && req.session.dungeonProgress.phase == 2) {
              char.dungeonInfos.clearBlacklight = true;
              char.statPoint += 5;
              reward += '첫 번째 [메모리얼 게이트 - 검은 빛의 수련장] 2페이즈 돌파!<br>스탯 포인트 5를 획득했습니다.<br>';
              await client.query('insert into news(content, date) values ($1, $2)', 
                  [char.name + getIga(char.nameType) + ' [메모리얼 게이트 - 검은 빛의 수련장]을 돌파했습니다!', new Date()]);
            }
            if (req.session.dungeonProgress.phase == 2) {
              enterNext = false;
              if (re.leftInfo.curHp / re.leftInfo.stat.maxHp > 0.65) {
                enterNext = true;
                reward += '<br>"압도적인 실력에 경의를 표하지. 다음 상대는 나, 단장 로엔그린이다."<br>';
              }
              if (!enterNext && Math.random() < 0.15) {
                enterNext = true;
                reward += '<br>"잠깐의 여흥도 나쁘지 않지. 준비는 되었나?"<br>';
              }
            }
            if (req.session.dungeonProgress.phase >= 3) {
              enterNext = false;
              if (!char.achievement[39]) {
                await giveAchievement(charRow.uid, char, 39);
              }
            }
            delete trades[sess.dungeonProgress.roomNum];
            sess.dungeonProgress.nextPhase = sess.dungeonProgress.phase + 1;
            await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
            res.render('pages/dungeonResult', {result: re.result, resultList: [], isFinished : !enterNext, reward : reward, stop : false, addInfo : {}});
          }
        } else if (sess.dungeonProgress.nextPhase <= 3) {
          console.log(sess.userUid + '//' + sess.dungeonProgress.nextPhase);
          sess.dungeonProgress.charData.curHp += (sess.dungeonProgress.charData.stat.maxHp - sess.dungeonProgress.charData.curHp) * 0.15;
          enemy = sess.dungeonProgress.nextPhase == 2 ? monster.d7EliteKnight : monster.d7Lohengrin;
          delete sess.dungeonProgress.nextPhase;
        } else if (trades[sess.dungeonProgress.roomNum]) {
          res.render('pages/trade', {room: sess.dungeonProgress.roomNum, uid: charRow.uid});
          return;
        }
      } else if (sess.dungeonProgress.code == 8) {
        if (!sess.dungeonProgress.charData.startEffects) {
          sess.dungeonProgress.charData.startEffects = [];
        } else if (sess.dungeonProgress.curBuffs) {
          sess.dungeonProgress.charData.startEffects = sess.dungeonProgress.curBuffs;
        }
        sess.dungeonProgress.charData.startEffects.push({code : cons.EFFECT_TYPE_SELF_BUFF, buffCode : sess.dungeonProgress.addInfo[req.body.option].buff, buffDur : null})
        sess.dungeonProgress.curBuffs = sess.dungeonProgress.charData.startEffects;
        if (sess.dungeonProgress.charData.curHp >= 0) {
          sess.dungeonProgress.charData.curHp = sess.dungeonProgress.charData.stat.maxHp;
          if (sess.dungeonProgress.phase <= 4) {
            enemy = monster['d72' + sess.dungeonProgress.phase];
          }
          if (sess.dungeonProgress.phase == 5 && sess.dungeonProgress.redAppear) {
            enemy = monster['d72' + sess.dungeonProgress.phase];
          }
        }
      }
    }
    if (enemy) {
      if (req.session.dungeonProgress.code == 3 || req.session.dungeonProgress.code == 7) {
        var roomNum = curRoom++;
        trades[roomNum] = {};
        trades[roomNum].leftUid = charRow.uid;
        if (req.session.dungeonProgress.code == 3) {
          trades[roomNum].leftChr = JSON.parse(JSON.stringify(char));
        } else {
          trades[roomNum].leftChr = JSON.parse(JSON.stringify(req.session.dungeonProgress.charData));
        }
        trades[roomNum].rightChr = JSON.parse(JSON.stringify(enemy));
        req.session.dungeonProgress.phase = req.session.dungeonProgress.phase + 1;
        req.session.dungeonProgress.tgtList = req.session.dungeonProgress.tgtList;
        req.session.dungeonProgress.roomNum = roomNum;

        res.render('pages/trade', {room: roomNum, uid: charRow.uid});
        return;
      }
      var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(req.session.dungeonProgress.charData)), JSON.parse(JSON.stringify(enemy)), 1);
      req.session.dungeonProgress.resultList.push({phase : req.session.dungeonProgress.phase + 1, monImage : enemy.image, monName : enemy.name, 
        result : re.winnerLeft ? '승리' : '패배', hpLeft : re.winnerLeft ? re.leftInfo.curHp : re.rightInfo.curHp});
      re.leftInfo.buffs = [];
      re.leftInfo.items = char.items;
      req.session.dungeonProgress.charData = re.leftInfo;
      req.session.dungeonProgress.phase = req.session.dungeonProgress.phase + 1;
      
      var isFinished = false;
      var reward = '';
      var addInfo = {};
      if (req.session.dungeonProgress.code == 3 && req.session.dungeonProgress.phase == 2) {
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
        await client.query('update raids set phase = $1, monsters = $2 where rindex = $3', [row.phase + (re.winnerRight ? 0 : 1), JSON.stringify(curData), 2]);
      } else if (!re.winnerLeft && req.session.dungeonProgress.code != 6) {
        isFinished = true;
        reward += '패배했습니다..';
      } else if (req.session.dungeonProgress.code == 1 && req.session.dungeonProgress.phase % 2 == 0) {
        if (req.session.dungeonProgress.phase >= 20) {
          isFinished = true;
          if (!char.achievement[29]) {
            await giveAchievement(charRow.uid, char, 29);
          }
        }
        if (!char.dungeonInfos['rewardMevious' + req.session.dungeonProgress.phase]) {
          char.dungeonInfos['rewardMevious' + req.session.dungeonProgress.phase] = true;
          const curr = 1;
          if (char.currencies.mevious) {
            char.currencies.mevious += curr;
          } else {
            char.currencies.mevious = curr;
          }
          reward += '메비우스 섬멸의 증표 ' + curr + '개를 획득했습니다.<br>';
        }
        if (enemy.name == '메비우스 타우러스') {
          if (char.dungeonInfos.taurusReward > 0) {
            char.dungeonInfos.taurusReward--;
            char.currencies.mevious += 2;
            reward += '타우러스를 처치했으므로 메비우스 섬멸의 증표 2개를 추가로 획득했습니다.<br>';  
          }
          req.session.dungeonProgress.taurus++;
          if (!char.achievement[30] && req.session.dungeonProgress.taurus >= 5) {
            await giveAchievement(charRow.uid, char, 30);
          }
        }
        if (!char.dungeonInfos.clearMevious && req.session.dungeonProgress.phase == 10) {
          char.dungeonInfos.clearMevious = true;
          char.statPoint += 5;
          reward += '첫 번째 [메모리얼 게이트 - 메비우스 섬멸] 10층 돌파!<br>스탯 포인트 5를 획득했습니다.<br>';
          await client.query('insert into news(content, date) values ($1, $2)', 
              [char.name + getIga(char.nameType) + ' [메모리얼 게이트 - 메비우스 섬멸]을 돌파했습니다!', new Date()]);
        }
      } else if (req.session.dungeonProgress.code == 1 && req.session.dungeonProgress.phase % 2 == 1) {
        if (!char.dungeonInfos.rewardMevious && req.session.dungeonProgress.phase == 5) {
          char.dungeonInfos.rewardMevious = true;
          char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '메비우스 섬멸 공훈 카드', rank : 8, resultType : 90001});
          reward += '메비우스 섬멸 공훈 카드 1개를 획득했습니다.';
        }

        if (enemy.name == '메비우스 타우러스') {
          if (char.dungeonInfos.taurusReward > 0) {
            char.dungeonInfos.taurusReward--;
            char.currencies.mevious += 2;
            reward += '타우러스를 처치했으므로 메비우스 섬멸의 증표 2개를 추가로 획득했습니다.<br>';  
          }
          req.session.dungeonProgress.taurus++;
          if (!char.achievement[30] && req.session.dungeonProgress.taurus >= 5) {
            await giveAchievement(charRow.uid, char, 30);
          }
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
            if (!char.achievement[31]) {
              await giveAchievement(charRow.uid, char, 31);
            }
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
          
          var awaken = false;
          for (const buf of re.rightInfo.buffs) {
            if (buf.id == 90002) {
              awaken = true;
              break;
            }
          }
          if (!char.achievement[32] && !awaken) {
            await giveAchievement(charRow.uid, char, 32);
          }
        }
      } else if (req.session.dungeonProgress.code == 6 && req.session.dungeonProgress.phase == 2) {

        var re = (new battlemodule.bmodule()).doBattle(JSON.parse(JSON.stringify(enemy)), JSON.parse(JSON.stringify(char)), 1);
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
        
        if (req.session.dungeonProgress.code == 6) {
          var maxHpTotal = curData[1].stat.maxHp;
          var dust = 12 * Math.floor(damageDealt * 100 / maxHpTotal);
          if (dust > 0) {
            char.dust += dust;
            reward += dust + ' 가루를 획득했습니다.<br>';
          }
          if (curData[1].battleRecord[charRow.uid] >= maxHpTotal / 10) {
            var perNum = Math.floor(curData[1].battleRecord[charRow.uid] * 10 / maxHpTotal);
            if (!char.dungeonInfos['rewardFieldBoss1' + perNum]) {
              char.dungeonInfos['rewardFieldBoss1' + perNum] = true;
              char.currencies.julius++;
              reward += '누적 피해량 보상으로 조작된 시간의 파편 1개를 획득했습니다.<br>';
            }  
          }
          if (char.dungeonInfos.runFieldBoss1) {
            await client.query('update characters set actionPoint = $1 where uid = $2', [charRow.actionPoint - 1, charRow.uid]);
          }
          await client.query('update raids set phase = $1, monsters = $2 where rindex = 5', [row.phase + (re.winnerLeft ? 0 : 1), JSON.stringify(curData)]);

          char.dungeonInfos.runFieldBoss1 = true;
        }
        if (!re.winnerLeft) {
          if (req.session.dungeonProgress.code == 6) {
            char.currencies.julius += 2;
            char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
            reward += re.leftInfo.name + getUlrul(re.leftInfo.nameType) + ' 처치했습니다!<br>조작된 시간의 잠금 상자 1개, 조작된 시간의 파편 2개를 획득했습니다.<br>';
            if (!char.achievement[37]) {
              await giveAchievement(charRow.uid, char, 37);
            }
            const globals = await getGlobals();
            var leaderboard = await createRaidResults(5, 1, char);
            if (charRow.uid == globals.fieldBossSummon1) {
              char.currencies.julius++;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
              reward += '소환 보상으로 조작된 시간의 잠금 상자 1개, 조작된 시간의 파편 1개를 획득했습니다.<br>';
            } else {
              const charRow2 = await getCharacterByUid(globals.fieldBossSummon1);
              const char2 = JSON.parse(charRow2.char_data);
              char2.currencies.julius++;
              char2.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char2), charRow2.uid]);
            }
            if (charRow.uid == leaderboard[0].key) {
              char.currencies.julius++;
              char.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
              reward += '누적 피해 보상으로 조작된 시간의 잠금 상자 1개, 조작된 시간의 파편 1개를 획득했습니다.<br>';
              if (!char.achievement[38]) {
                await giveAchievement(charRow.uid, char, 38);
              }                
            } else {
              const charRow2 = await getCharacterByUid(leaderboard[0].key);
              const char2 = JSON.parse(charRow2.char_data);
              char2.currencies.julius++;
              char2.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
              if (!char2.achievement[38]) {
                await giveAchievement(charRow2.uid, char2, 38);
              }
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char2), charRow2.uid]);
            }
            const results = await client.query('select * from characters');
            const partList = leaderboard.map(x => x.key);
            for (val of results.rows) {
              if (val.uid == charRow.uid) {
                continue;
              } 
              if (!partList.includes(val.uid)) {
                continue;
              }
              const charx = JSON.parse(val.char_data);
              charx.inventory.push({type : cons.ITEM_TYPE_RESULT_CARD, name : '조작된 시간의 잠금 상자', resultType : 90006, value : 1});
              
              await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(charx), val.uid]);
            } 
          }
        } 
      } else if (req.session.dungeonProgress.code == 8) {
        addInfo.type = 8;
        addInfo.data = [];
        for (let i = 0; i < 3; i++) {
          var idx = Math.floor(req.session.dungeonProgress.buffs.length * Math.random());
          addInfo.data.push(req.session.dungeonProgress.buffs[idx]);
          req.session.dungeonProgress.buffs.splice(idx, 1);
        }
        req.session.dungeonProgress.addInfo = addInfo.data;
        if (req.session.dungeonProgress.phase == 5) {
          isFinished = true;
          if (!char.achievement[40]) {
            await giveAchievement(charRow.uid, char, 40);
          }
          if (!char.dungeonInfos.clearIndigo) {
            char.dungeonInfos.clearIndigo = true;
            char.statPoint += 5;
            reward += '첫 번째 [어나더 게이트 - 전이된 석영 고원] 클리어!<br>스탯 포인트 5를 획득했습니다.<br>';
            await client.query('insert into news(content, date) values ($1, $2)', 
                [char.name + getIga(char.nameType) + ' [어나더 게이트 - 전이된 석영 고원]을 돌파했습니다!', new Date()]);
          }
          if (char.dungeonInfos.enterIndigo >= 2) {
            reward += '<br>"..."<br>';
            req.session.dungeonProgress.redAppear = true;
            isFinished = false;
          }
        }
        if (req.session.dungeonProgress.phase >= 6) {
          isFinished = true;
          if (!char.achievement[41]) {
            await giveAchievement(charRow.uid, char, 41);
          }
          reward += '<br>"...!"<br>';
        }
        if (!char.dungeonInfos['rewardIndigo' + req.session.dungeonProgress.phase]) {
          char.dungeonInfos['rewardIndigo' + req.session.dungeonProgress.phase] = true;
          const curr = req.session.dungeonProgress.phase - 1;
          char.currencies.indigo += curr;
          reward += '석영 고원 증표 ' + curr + '개를 획득했습니다.<br>';
        }
      }
      await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
      res.render('pages/dungeonResult', {result: re.result, resultList: req.session.dungeonProgress.resultList, isFinished : isFinished, reward : reward, stop : false, addInfo : addInfo});
      if (isFinished) {
        delete req.session.dungeonProgress;
      }
    } else {
      if (!res.headersSent) {
        res.redirect('/');
      }
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procStopDungeon(req, res) {
    const client = await pool.connect();
  try {
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
      res.render('pages/dungeonResult', {result: '', resultList: req.session.dungeonProgress.resultList, isFinished : true, reward : reward, addInfo : {}});
    } else {
      if (!res.headersSent) {
        res.redirect('/');
      }
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procSortInventory(req, res) {
  const client = await pool.connect();
  try {
    const sess = req.session; 
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
          if (a.level < b.level) {
            return -1;
          } else if (a.level > b.level) {
            return 1;
          } else if (a.day < b.day) {
            return -1;
          } else if (a.day > b.day) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    });
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procViewAchievement(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    const globals = await getGlobals();
    res.render('pages/achievement', {charAch : char.achievement, charStats : char.statistics, achData : ach.achData, globalAch : globals.achievement});
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
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
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
    if (!res.headersSent) {
      res.render('pages/quest', {quest : char.quest, resetQuest : char.resetQuest});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procResetQuest (req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
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
    if (!res.headersSent) {
      res.render('pages/quest', {quest : char.quest, resetQuest : char.resetQuest});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
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
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.inventory[body.itemNum];
    if (tgt.type <= 4) {
      char.inventory.splice(body.itemNum, 1);
      var dustVal = Math.round(dustInfo[tgt.rarity] * Math.pow(2, 9 - tgt.rank));
      if (tgt.dustMod) {
        dustVal *= tgt.dustMod;
      }
      char.dust += dustVal;
      if (char.quest[6]) {
        char.quest[6].progress += 1;
      }
      if (char.quest[9] && tgt.rarity >= cons.ITEM_RARITY_UNIQUE) {
        char.quest[9].progress += 1;
      }
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '아이템 해체', inv : char.inventory, mode : 2, dustVal : dustVal, dust : char.dust, usedItem : 0});;
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
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
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.inventory[body.itemNum];
    if (tgt.type == 999 && char.stoneCube.length < 3) {
      char.inventory.splice(body.itemNum, 1);
      char.stoneCube.push(tgt);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procRemoveCube (req, res) {
    const client = await pool.connect();
  try {
    const body = req.body;
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    var tgt = char.stoneCube[body.itemNum];
    if (tgt.type == 999) {
      char.stoneCube.splice(body.itemNum, 1);
      char.inventory.push(tgt);
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procActivateCube (req, res) {
  const client = await pool.connect();
  try {
    const sess = req.session; 
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
    if (!res.headersSent) {
      res.render('pages/selectItem', {title : '요일석 합성', inv : char.inventory, mode : 4, cube : char.stoneCube, usedItem : 0});
    }
  } catch (err) {
    console.error(err);
    res.send('내부 오류');
  } finally {
    client.release();
  }
}

async function procUseStatPoint (req, res) {
  const client = await pool.connect();
  const sess = req.session; 
  const charRow = await getCharacter(sess.userUid);
  const char = JSON.parse(charRow.char_data);
  if (char.statPoint > 0) {
    char.statPoint -= 1;
    var value = (req.body.keyType === 'maxHp') ? 8 : 1.25;
    char.base[req.body.keyType] += value;
    char.statistics[req.body.keyType + 'Stat'] += 1;
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
  if (((char.level >= 20 && char.rank > 7) || (char.level >= 25 && char.rank == 7)) && char.rankReq) {
    char.level = 1;
    char.rank--;
    char.reqExp += 90;
    char.base.maxHp += 150;
    char.base.phyAtk += 10;
    char.base.magAtk += 10;
    char.rankReq = false;
    calcStats(char);
  } 
  
  if (!char.achievement[8 - char.rank]) {
    await giveAchievement(charRow.uid, char, 8 - char.rank);
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
    client.release();
    return [];
  } finally {
  }
}

async function getPersonalNews (uid) {
  try {
    var rval = [];
    const client = await pool.connect();
    const result = await client.query('select * from personal where uid = $1 order by date desc fetch first 10 rows only', [uid]);
    for (const val of result.rows) {
      rval.push(val.content);
    }

    client.release();
    return rval;
  } catch (err) {
    console.error(err);
    client.release();
    return [];
  } finally {
  }
}

async function getChat() {
  try {
    var rval = [];
    const client = await pool.connect();
    const result = await client.query('select * from chat order by date desc fetch first 20 rows only');
    for (const val of result.rows) {
      rval.push(JSON.parse(val.content));
    }

    client.release();
    return rval;
  } catch (err) {
    console.error(err);
    client.release();
    return [];
  } finally {
  }
}

async function giveAchievement (uid, chara, idx) {
  try {
    const client = await pool.connect();
    const globals = await getGlobals();
    
    if (!chara.achievement[idx]) {
      chara.achievement[idx] = new Date();
      chara.premiumPoint += 1;
      await client.query('insert into personal(uid, content, date) values ($1, $2, $3)', 
          [uid, '[ ' + ach.achData[idx].name + ' ] 업적을 달성했습니다!', new Date()]);
    }
    
    if (!globals.achievement[idx]) {
      await setGlobals({achievement : {type : 'achievement', idx : idx, holder : chara.name}});
      await client.query('insert into news(content, date) values ($1, $2)', 
          [chara.name + getIga(chara.nameType) + ' [ ' + ach.achData[idx].name + ' ] 업적을 달성했습니다!', new Date()]);
    }
    client.release();
    return;
  } catch (err) {
    client.release();
    console.error(err);
    return;
  } finally {
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
    client.release();
    console.error(err);
    return {};
  } finally {
  }
}

async function getCharacterByUid (uid) {
  try {
    var rval = {};
    const client = await pool.connect();
    const resultChar = await client.query('select * from characters where uid = $1', [uid]);
    if (resultChar.rows.length > 0) {
      rval.char_data = resultChar.rows[0].char_data;
      rval.actionPoint = resultChar.rows[0].actionpoint;
      rval.uid = resultChar.rows[0].uid;
    }
    client.release();

    return rval;
  } catch (err) {
    client.release();
    console.error(err);
    return {};
  } finally {
  }
}

async function getGlobals (setObj) {
  try {
    const client = await pool.connect();
    const result = await client.query('select * from global');
    client.release();

    return JSON.parse(result.rows[0].globals);
  } catch (err) {
    client.release();
    console.error(err);
    return;
  } finally {
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
        } else if (setObj[key].type == 'achievement') {
          if (!newObj[key]) {
            newObj[key] = {};
          }
          newObj[key][setObj[key].idx] = {holder : setObj[key].holder, date : new Date()};
        } else if (setObj[key].type == 'raid') {
          if (!newObj[key]) {
            newObj[key] = {};
          }
          if (setObj[key].mode == 'set') {
            newObj[key][setObj[key].name][setObj[key].idx] = setObj[key].value;
          } else {
            newObj[key][setObj[key].name][setObj[key].idx] += setObj[key].value;            
          }
        }
      }
      await client.query('update global set globals = $1', [JSON.stringify(newObj)]);
    }

    client.release();
    return;
  } catch (err) {
    client.release();
    console.error(err);
    return;
  } finally {
  }
}

async function setCharacter (id, uid, data) {
  try {
    const client = await pool.connect();
    const result = await client.query('insert into characters(uid, char_data, actionpoint) values ($1, $2, 10)', [uid, data]);
    const result2 = await client.query('update users set uid = $1 where id = $2', [uid, id]);

    client.release();
  } catch (err) {
    client.release();
    console.error(err);
  }
}

async function createRaidResults (rindex, phase, killed) {
  const client = await pool.connect();
  try {
    const result = await client.query('select * from raids where rindex = $1', [rindex]);
    var leaderboard = [];
    var reward;
    const names = {'03' : '가이우스 엠더츠', '04' : '루니샤', '05' : '뤼순 창', '06' : '세리어스 플로에르시아',
        '07' : '일룬드롤', '08' : '나백수', '09' : '이 눅스', '10' : '카시엔', '11' : '마랑', '12' : '가비류이', '13' : '제이'};
    for (val of result.rows) {
      var char = JSON.parse(val.monsters);
      var record = {};
      for (var i = 1; i <= phase; i++) {
        for (key in char[i].battleRecord) { 
          if (record[key]) {
            record[key] += char[i].battleRecord[key];
          } else {
            record[key] = char[i].battleRecord[key];
          }
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
        reward += '<tr><td>' + (Number(key) + 1) + '</td>';
        reward += '<td>' + leaderboard[key].name + '</td>';
        for (var i = 1; i <= phase; i++) {
          reward += '<td>' + (char[i].battleRecord[leaderboard[key].key] ? char[i].battleRecord[leaderboard[key].key] : 0) + ' / ' + (char[i].winRecord[leaderboard[key].key] ? char[i].winRecord[leaderboard[key].key] : 0) + '</td>';
        }
        if (phase > 1) {
          reward += '<td>' + leaderboard[key].damage + '</td></tr>';
        }
      }
      reward += '</table>';
      await client.query('insert into news(content, date) values ($1, $2)', 
          [killed.name + getIga(killed.nameType) + ' ' + char[phase].name + getUlrul(char[phase].nameType) + ' 처치했습니다!<div class="itemTooltip longWidth">' + reward + '</div>', new Date()]);
      
      return leaderboard;
    } 
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
  
}

function addExp(chara, exp) {
  
  if (exp > chara.maxExp) {
    exp = chara.maxExp;
  }
  chara.exp += exp;
  if (chara.rank <= 8 || chara.level > 10) {
    chara.maxExp -= exp;
  }
  while (chara.level < 50 && chara.exp >= chara.reqExp) {
    chara.exp -= chara.reqExp;
    chara.level++;
    chara.statPoint += 2;
  }
}

const dayStoneData = [
                      [[[15, 50], [20, 85], [30, 120], [40, 160], [50, 200]]], 
                      [[[5, 15], [10, 25], [15, 45], [20, 70], [30, 95]]], 
                      [[[10, 35], [15, 50], [20, 70], [25, 100], [35, 140]]], 
                      [[[10, 35], [15, 50], [20, 70], [25, 100], [35, 140]]], 
                      [[[10, 30], [15, 45], [20, 65], [25, 90], [30, 120]]], 
                      [[[10, 20], [15, 35], [20, 55], [25, 75], [35, 100]]], 
                      [[[10, 35], [15, 50], [20, 70], [25, 95], [35, 125]]]];
const dayStonePrefix = ['최하급 ', '하급 ', '중급 ', '상급 ', '최상급 '];
const dayStoneName = ['일석', '월석', '화석', '수석', '목석', '금석', '토석'];
const dayStoneEffect = ['확률강화', '치명', '물리공격력', '마법공격력', 'SP 소모량 감소', '저항', '생명력'];
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
    item.effect = [{active : cons.ACTIVE_TYPE_CALC_STATS, code : cons.EFFECT_TYPE_STAT_ADD, key : 'chanceEnh', value : val}];
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
  if (chara.resultMaxGauge >= 2500) {
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

const typePrefix = ['무기', '방어구', '보조방어구', '장신구', '장비', '레어 장비', '유니크 장비'];
function addSpecialResultCard(chara, type, rank) {
  var item = {};
  var rankUsed = rank ? rank : chara.rank;
  item.type = cons.ITEM_TYPE_RESULT_CARD;
  item.name = rankUsed + '급 ' + typePrefix[type] + ' 리설트 카드';
  item.rank = rankUsed;
  item.resultType = type;
  if (type <= 4) {
    item.tooltip = '60.5% : 언커먼 장비<br>27.6% : 레어 장비<br>5.55% : 유니크 장비<br>5.3% : 한 등급이 높은 커먼&언커먼 장비<br>1.05% : 에픽 장비';
  } else if (type == 5) {
    item.tooltip = '97% : 레어 장비<br>2% : 유니크 장비<br>1% : 에픽 장비';
  } else if (type == 6) {
    item.tooltip = '96% : 유니크 장비<br>4% : 에픽 장비';
  }
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
    if (item.tradeCnt !== undefined) {
      rtext += '<br>거래횟수 : ' + item.tradeCnt;
    }
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

async function fillChat() {
  var chats = await getChat();
  for (ctn of chats) {
    if (ctn.side) {
      ring[ctn.side].push(ctn);
    }
  }
}
fillChat();
// }
