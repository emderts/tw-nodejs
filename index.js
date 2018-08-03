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
const item = require('./items');

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
.post('/enchantItem', procEnchantItem)
.get('/battleList', procBattleList)
.post('/doBattle', procBattle)
.get('/battleLogs', procBattleLogList)
.post('/battleLog', procBattleLog)
.get('/viewList', procViewList)
.post('/viewChar', procView)
.get('/shop', procShop)
.post('/useShop', procUseShop)
.get('/dismantlingYard', procDismantlingYard)
.post('/dismantleItem', procDismantleItem)
.post('/useStatPoint', procUseStatPoint)
.post('/doRankup', procRankup)
.get('/test', (req, res) => res.render('pages/battle', {result: battlemodule.doBattle(chara.nux, chara.aeohelm).result}))
.get('/test3', (req, res) => res.send(setCharacter('kemderts', 2, chara.kines)))
.get('/test4', (req, res) => res.send(setCharacter('thelichking', 1, chara.lk)))
.get('/test5', (req, res) => res.render('pages/resultCard', {name: 'test', rarity: Math.floor(Math.random() * 5)}))
.get('/test6', (req, res) => res.render('pages/viewChar', {char: chara.julius}))
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

async function procIndex (req, res) {
  const sess = req.session; 
  const char = await getCharacter(sess.userUid);
  const news = await getNews(5);
  if (!sess.userUid) {
    res.render('pages/login');
  } else {
    res.render('pages/index', {
      user: {name: sess.userName},
      char: char.char_data ? JSON.parse(char.char_data) : {},
      actionPoint : char.actionPoint,
      news : news
    });
  }
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
    res.render('pages/battleList', {list: rval, title: '전투 신청', formAction: '/doBattle'});
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

async function procShop(req, res) {
  try {
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    res.render('pages/shop', {premiumPoint : char.premiumPoint, dust : char.dust});
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
    res.render('pages/selectItem', {title : '아이템 해체', inv : char.inventory, mode : 2, dust : char.dust, usedItem : 0});
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
      addResultCard(left);
      addResultCard(right);
      left.battleCnt++;
      right.battleCnt++;
      if (re.winnerLeft) {
        addResultCard(left);
        left.winCnt++;
      }
      if (re.winnerRight) {
        addResultCard(right);
        right.winCnt++;
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

async function procUseShop (req, res) {
  try {
    const body = req.body;
    const client = await pool.connect();
    const sess = req.session; 
    const charRow = await getCharacter(sess.userUid);
    const char = JSON.parse(charRow.char_data);
    if (body.option == 1) {
      if (char.premiumPoint < 5) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else {
        char.premiumPoint -= 5;
        var picked = makeDayStone(Math.floor(Math.random() * 7));
        char.inventory.push(picked);
      }
    } else if (body.option == 2) {
      if (char.premiumPoint < 10) {
        res.send('프리미엄 포인트가 부족합니다.');
      } else if (char.expBoost > 0) {
        res.send('이미 부스트를 구매했습니다.');
      } else {
        char.premiumPoint -= 10;
        char.expBoost = 3;
      }
    }
    await client.query('update characters set char_data = $1 where uid = $2', [JSON.stringify(char), charRow.uid]);
    client.release();
    if (!res.headersSent) {
      res.redirect('/');
    }
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
    if (tgt.type <= 3) {
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
          var itemType = (tgtObj.type === cons.ITEM_TYPE_WEAPON) ? 'weapon' : ((tgtObj.type === cons.ITEM_TYPE_ARMOR) ? 'armor' : ((tgtObj.type === cons.ITEM_TYPE_SUBARMOR) ? 'subarmor' : 'trinket'));
          var curItem = chara.items[itemType];
          if (curItem) {
            chara.items[itemType] = undefined;
            chara.inventory.push(curItem);				
          }
          chara.items[itemType] = tgtObj;
          calcStats(chara);
        } else if (tgtObj.type === cons.ITEM_TYPE_RESULT_CARD) {
          chara.inventory.splice(body.itemNum, 1);
          var rand = Math.random();
          if (rand < 0.4) {
            var usedRank = tgtObj.rank;
            if (usedRank > 1 && rand > 0.36) {
              usedRank--;
            }
            var tgtList = item.list.filter(x => x.rank === usedRank && (x.rarity === cons.ITEM_RARITY_COMMON || x.rarity === cons.ITEM_RARITY_UNCOMMON));
            var picked = JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));
            chara.inventory.push(picked);
            res.render('pages/resultCard', picked);
          } else if (rand < 0.5) {
            var usedRank = tgtObj.rank;
            if (usedRank > 1 && rand > 0.49) {
              usedRank--;
            }
            var tgtList = item.list.filter(x => x.rank === usedRank && x.rarity === cons.ITEM_RARITY_RARE);
            var picked = JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));
            chara.inventory.push(picked);
            await client.query('insert into news(content, date) values ($1, $2)', [chara.name + getIga(chara.nameType) + ' ' + tgtObj.name + '에서 ' + picked.name + getUlrul(picked.nameType) + ' 뽑았습니다!', new Date()]);
            res.render('pages/resultCard', picked);
          } else if (rand < 0.54) {
            var usedRank = tgtObj.rank;
            if (usedRank > 1 && rand > 0.536) {
              usedRank--;
            }
            var tgtList = item.list.filter(x => x.rank === usedRank && x.rarity === cons.ITEM_RARITY_UNIQUE);
            var picked = JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));
            chara.inventory.push(picked);
            await client.query('insert into news(content, date) values ($1, $2)', [chara.name + getIga(chara.nameType) + ' ' + tgtObj.name + '에서 ' + picked.name + getUlrul(picked.nameType) + ' 뽑았습니다!', new Date()]);
            res.render('pages/resultCard', picked);
          } else if (rand < 0.55) {
            var usedRank = tgtObj.rank;
            if (usedRank > 1 && rand > 0.549) {
              usedRank--;
            }
            var tgtList = item.list.filter(x => x.rank === usedRank && x.rarity === cons.ITEM_RARITY_EPIC);
            var picked = JSON.parse(JSON.stringify(tgtList[Math.floor(Math.random() * tgtList.length)]));
            chara.inventory.push(picked);
            await client.query('insert into news(content, date) values ($1, $2)', [chara.name + getIga(chara.nameType) + ' ' + tgtObj.name + '에서 ' + picked.name + getUlrul(picked.nameType) + ' 뽑았습니다!', new Date()]);
            res.render('pages/resultCard', picked);
          } else if (rand < 0.9) {
            chara.premiumPoint += 1;
            res.render('pages/resultCard', {name : '프리미엄 포인트 1점' , rarity : cons.ITEM_RARITY_COMMON});
          } else {
            var picked = makeDayStone();
            chara.inventory.push(picked);
            res.render('pages/resultCard', picked);              
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
        if (tgt.type < 10 && used.type === cons.ITEM_TYPE_DAYSTONE) {
          var minRank = used.level >= 3 ? 7 : (used.level === 2 ? 8 : 9); 
          if (tgt.rank <= minRank) {
            if (used.day === 1 && (tgt.type === 1 || tgt.type === 2)) {
              client.release();
              res.send('');
              return;
            }
            if (used.day === 5 && tgt.type >= 1) {
              client.release();
              res.send('');
              return;
            }
            chara.inventory.splice(body.itemUsed, 1);
            tgt.socket = used;
            calcItemStats(tgt);
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

async function getNews (cnt) {
  try {
    var rval = [];
    const client = await pool.connect();
    const result = await client.query('select * from news order by date desc fetch first $1 rows only', [cnt]);
    for (const val of result.rows) {
      rval.push(val.content);
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
  if (chara.statPoint) {
    chara.statPoint = 0;
  }
  while (chara.level < 50 && chara.exp >= chara.reqExp) {
    chara.exp -= chara.reqExp;
    chara.level++;
    chara.statPoint += 2;
  }
}

const dayStoneData = [
                      [[[3, 9], [6, 15], [12, 21], [18, 27], [24, 33]]], 
                      [[[1, 3], [2, 5], [4, 7], [6, 9], [8, 11]]], 
                      [[[2, 6], [4, 10], [8, 14], [12, 18], [16, 22]]], 
                      [[[2, 6], [4, 10], [8, 14], [12, 18], [16, 22]]], 
                      [[[1, 3], [2, 5], [4, 7], [6, 9], [8, 11]], [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4]]], 
                      [[[1, 3], [2, 5], [4, 7], [6, 9], [8, 11]]], 
                      [[[7, 35], [25, 80], [70, 145], [135, 225], [210, 315]]]];
const dayStonePrefix = ['최하급 ', '하급 ', '중급 ', '상급 ', '최상급 '];
const dayStoneName = ['일석', '월석', '화석', '수석', '목석', '금석', '토석'];
function makeDayStone(dayIn) {
  var rand = Math.random();
  var item = {};
  item.type = cons.ITEM_TYPE_DAYSTONE;
  item.rarity = cons.ITEM_RARITY_RARE;
  item.day = dayIn ? dayIn : new Date().getDay();
  item.level = (rand < 0.39) ? 0 : ((rand < 0.68) ? 1 : ((rand < 0.88) ? 2 : ((rand < 0.98) ? 3 : 4)));
  item.name = dayStonePrefix[item.level] + dayStoneName[item.day];
  item.stat = {};
  var fval = dayStoneData[item.day][0][item.level];
  var val = Math.floor(Math.random() * (fval[1] - fval[0]) + fval[0]);
  switch (item.day) {
  case 0:
    item.stat.critDmg = val * 0.01;
    break;
  case 1:
    item.stat.crit = val * 0.01;
    break;
  case 2:
    item.stat.phyAtkMin = val;
    item.stat.phyAtkMax = val;
    break;
  case 3:
    item.stat.magAtkMin = val;
    item.stat.magAtkMax = val;
    break;
  case 4:
    item.stat.hpRegen = val;
    fval = dayStoneData[item.day][1][item.level];
    val = Math.floor(Math.random() * (fval[1] - fval[0]) + fval[0]);
    if (val > 0) {
      item.stat.spRegen = val;
    }
    break;
  case 5:
    item.stat.phyReduce = val * 0.01;
    item.stat.magReduce = val * 0.01;
    break;
  case 6:
    item.stat.maxHp = val;
    break;
  }
  return item;
}

function addResultCard(chara) {
  var item = {};
  item.type = cons.ITEM_TYPE_RESULT_CARD;
  item.name = chara.rank + '급 리설트 카드';
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

function calcItemStats(item) {
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
