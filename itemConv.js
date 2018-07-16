const excel = require('exceljs');
const fs = require('fs');

const fseq = 0;
var seq = 0;
var names, result = '';

fs.readFile('target.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  names = data.split('\r\n');
  doCommons();
});

const nameConv = {무기: 'WEAPON', 천옷: 'ARMOR', 경갑옷: 'ARMOR', 중갑옷: 'ARMOR'};
var workbook = new Excel.Workbook();
workbook.xlsx.readFile('target.xlsx')
  .then(function() {
    var worksheet = workbook.getWorksheet(1);
    worksheet.eachRow(function(row, rowNumber) {
      var rowVal = row.values.filter(x => !x.length || x.length > 0);
      if (!rowVal[0]) {
        continue;
      }
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + rowVal[0] + '\', type : cons.ITEM_TYPE_';
      result += nameConv[rowVal[1]] + ', ';
      result += 'rank : ' + rowVal[2] + ', rarity : cons.ITEM_RARITY_' + nameConv[rowVal[3]] + ', stat : {';
      result += rowVal[13] ? ' phyAtkMin : ' + rowVal[13] + ',' : '';
      result += rowVal[14] ? ' phyAtkMax : ' + rowVal[14] + ',' : '';
      result += rowVal[17] ? ' magAtkMin : ' + rowVal[17] + ',' : '';
      result += rowVal[18] ? ' magAtkMax : ' + rowVal[18] + ',' : '';
      result += rowVal[21] ? ' phyReduce : ' + (rowVal[21] * 0.01) + ',' : '';
      result += rowVal[22] ? ' magReduce : ' + (rowVal[22] * 0.01) + ',' : '';
      result += rowVal[23] ? ' maxHp : ' + rowVal[23] + ',' : '';
      result += rowVal[24] ? ' hpRegen : ' + rowVal[24] + ',' : '';
      result += rowVal[25] ? ' spRegen : ' + rowVal[25] + ',' : '';
      result += rowVal[26] ? ' spCharge : ' + rowVal[26] + ',' : '';
      result += rowVal[27] ? ' crit : ' + (rowVal[27] * 0.01) + ',' : '';
      result += rowVal[28] ? ' critDmg : ' + (rowVal[28] * 0.01) + ',' : '';
      result += rowVal[29] ? ' hit : ' + (rowVal[29] * 0.01) + ',' : '';
      result += rowVal[30] ? ' evasion : ' + (rowVal[30] * 0.01) + ',' : '';
      result += ' }, effect : [] };\r\n';
      seq++;
    });
    fs.writeFile('items.txt', result);
  }); 

var doCommons = function() {
  var group = [9, 9, 8, 8, 8, 8, 8, 8, 8, 8];
  var rarity = ['', 'UN'];
  var prates = [1.0, 1.1, 1.0, 1.1, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825];
  var mrates = [1.0, 1.1, 1.0, 1.1, 0.75, 0.825, 0.75, 0.825, 1.25, 1.375];

  var drates = [1.0, 1.0, 2.5, 2.5, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0];
  var values = [10, 15, 22, 30, 38, 47, 58, 70, 83];
  var diffs = [2, 2, 2, 3, 3, 4, 4, 5, 6];
  var crits = [0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.06, 0.07]
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + names[seq] + '\', type : cons.ITEM_TYPE_WEAPON, ';
      result += 'rank : ' + (9-i) + ', rarity : cons.ITEM_RARITY_' + rarity[key % 2] + 'COMMON, stat : {';
      result += ' phyAtkMin : ' + Math.round(values[i] * prates[key] - diffs[i] * drates[key]) + ',';
      result += ' phyAtkMax : ' + Math.round(values[i] * prates[key] + diffs[i] * drates[key]) + ',';
      result += ' magAtkMin : ' + Math.round(values[i] * mrates[key] - diffs[i] * drates[key]) + ',';
      result += ' magAtkMax : ' + Math.round(values[i] * mrates[key] + diffs[i] * drates[key]) + ',';
      result += ' crit : ' + crits[i] + ' }, effect : [] };\r\n';
      seq++;
    }
  }
  fs.writeFile('items.txt', result);
}

var doSeat = function() {
  var group = [9, 9, 8, 8, 8, 8, 8, 8, 8, 8];
  var prates = [1.0, 1.1, 1.0, 1.1, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825];
  var mrates = [1.0, 1.1, 1.0, 1.1, 0.75, 0.825, 0.75, 0.825, 1.25, 1.375];

  var drates = [1.0, 1.0, 2.5, 2.5, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0];
  var values = [10, 15, 22, 30, 38, 47, 58, 70, 83];
  var diffs = [2, 2, 2, 3, 3, 4, 4, 5, 6];
  var crits = [2, 2, 3, 3, 4, 4, 5, 6, 7]
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += '물리공격력+' + Math.round(values[i] * prates[key] - diffs[i] * drates[key]) + '~';
      result += Math.round(values[i] * prates[key] + diffs[i] * drates[key]) + ',';
      result += ' 마법공격력+' + Math.round(values[i] * mrates[key] - diffs[i] * drates[key]) + '~';
      result += Math.round(values[i] * mrates[key] + diffs[i] * drates[key]) + ',';
      result += ' 치명+' + crits[i] + '\%\r\n';
      seq++;
    }
  }
  fs.writeFile('items.txt', result);
}
