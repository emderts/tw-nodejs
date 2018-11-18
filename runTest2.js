const battlemodule = require('./battlemodule');
const chara = require('./chara2');
const cons = require('./constant');
const item = require('./items');
const excel = require('exceljs');
const JSON = require('circular-json');
const fs = require('fs');

//procFullTest(9, 'testResult.xlsx');
procFullTest(7, 'testResult2x.xlsx');
function procFullTest(testRank, resFile) {
  var testCount = 100;
  var workbook = new excel.Workbook();
  var workSheet = workbook.addWorksheet('Test');

  var testChars = [chara.julius, chara.seriers, chara.aeika, chara.psi, chara.aeohelm, chara.bks, chara.nux];
  var rval = [];
  rval[1] = '아이템명';
  var resultStr = '';
  for ([ind, left] of testChars.entries()) {
    for ([indr, right] of testChars.entries()) {
      if (left == right) {
        continue;
      }
      rval[ind*7+indr+2] = left.name + ' vs ' + right.name;
    }
  }
  workSheet.addRow(rval);
  for (itm of item.list.filter(x => x.rank === testRank && x.type === cons.ITEM_TYPE_WEAPON)) {
    console.log(itm.name);
    var testResults = [];
    var testTurns = [];
    var rval = [];
    rval[1] = itm.name;
    rval[51] = 0;
    for ([ind, left] of testChars.entries()) {
      testResults.push([0, 0, 0, 0, 0, 0, 0]);
      testTurns.push([0, 0, 0, 0, 0, 0, 0]);
      for ([indr, right] of testChars.entries()) {
        if (left == right) {
          continue;
        }
        for (var i=0; i<testCount; i++) {
          var leftChar = JSON.parse(JSON.stringify(left));
          leftChar.items.weapon = JSON.parse(JSON.stringify(item.list[itm.id]));
          var ret = battlemodule.doBattle(leftChar, JSON.parse(JSON.stringify(right)));
          testResults[ind][indr] += (ret.winnerLeft ? 1 : 0);
          testTurns[ind][indr] += ret.turnCount;
        }
        rval[ind*7+indr+2] = testResults[ind][indr] + ', ' + testTurns[ind][indr];
        rval[51] += testResults[ind][indr];
      }
    }
    rval[51] = Math.round(rval[51] / 42) / 10;
    workSheet.addRow(rval);
  }
  for (itm of item.list.filter(x => x.rank === testRank && x.type === cons.ITEM_TYPE_ARMOR)) {
    console.log(itm.name);
    var testResults = [];
    var testTurns = [];
    var rval = [];
    rval[1] = itm.name;
    rval[51] = 0;
    for ([ind, left] of testChars.entries()) {
      testResults.push([0, 0, 0, 0, 0, 0, 0]);
      testTurns.push([0, 0, 0, 0, 0, 0, 0]);
      for ([indr, right] of testChars.entries()) {
        if (left == right) {
          continue;
        }
        for (var i=0; i<testCount; i++) {
          var leftChar = JSON.parse(JSON.stringify(left));
          leftChar.items.armor = JSON.parse(JSON.stringify(item.list[itm.id]));
          var ret = battlemodule.doBattle(leftChar, JSON.parse(JSON.stringify(right)));
          testResults[ind][indr] += (ret.winnerLeft ? 1 : 0);
          testTurns[ind][indr] += ret.turnCount;
        }
        rval[ind*7+indr+2] = testResults[ind][indr] + ', ' + testTurns[ind][indr];
        rval[51] += testResults[ind][indr];
      }
    }
    rval[51] = Math.round(rval[51] / 42) / 10;
    workSheet.addRow(rval);
  }
  for (itm of item.list.filter(x => x.rank === testRank && x.type === cons.ITEM_TYPE_SUBARMOR)) {
    console.log(itm.name);
    var testResults = [];
    var testTurns = [];
    var rval = [];
    rval[1] = itm.name;
    rval[51] = 0;
    for ([ind, left] of testChars.entries()) {
      testResults.push([0, 0, 0, 0, 0, 0, 0]);
      testTurns.push([0, 0, 0, 0, 0, 0, 0]);
      for ([indr, right] of testChars.entries()) {
        if (left == right) {
          continue;
        }
        for (var i=0; i<testCount; i++) {
          var leftChar = JSON.parse(JSON.stringify(left));
          leftChar.items.subarmor = JSON.parse(JSON.stringify(item.list[itm.id]));
          var ret = battlemodule.doBattle(leftChar, JSON.parse(JSON.stringify(right)));
          testResults[ind][indr] += (ret.winnerLeft ? 1 : 0);
          testTurns[ind][indr] += ret.turnCount;
        }
        rval[ind*7+indr+2] = testResults[ind][indr] + ', ' + testTurns[ind][indr];
        rval[51] += testResults[ind][indr];
      }
    }
    rval[51] = Math.round(rval[51] / 42) / 10;
    workSheet.addRow(rval);
  }
  for (itm of item.list.filter(x => x.rank === testRank && x.type === cons.ITEM_TYPE_TRINKET)) {
    console.log(itm.name);
    var testResults = [];
    var testTurns = [];
    var rval = [];
    rval[51] = 0;
    rval[1] = itm.name;
    for ([ind, left] of testChars.entries()) {
      testResults.push([0, 0, 0, 0, 0, 0, 0]);
      testTurns.push([0, 0, 0, 0, 0, 0, 0]);
      for ([indr, right] of testChars.entries()) {
        if (left == right) {
          continue;
        }
        for (var i=0; i<testCount; i++) {
          var leftChar = JSON.parse(JSON.stringify(left));
          leftChar.items.trinket = JSON.parse(JSON.stringify(item.list[itm.id]));
          var ret = battlemodule.doBattle(leftChar, JSON.parse(JSON.stringify(right)));
          testResults[ind][indr] += (ret.winnerLeft ? 1 : 0);
          testTurns[ind][indr] += ret.turnCount;
        }
        rval[ind*7+indr+2] = testResults[ind][indr] + ', ' + testTurns[ind][indr];
        rval[51] += testResults[ind][indr];
      }
    }
    rval[51] = Math.round(rval[51] / 42) / 10;
    workSheet.addRow(rval);
  }

  workbook.xlsx.writeFile(resFile).then(function() {
    console.log("xls file is written.");
  });
}
