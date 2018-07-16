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

const nameConv = {무기: 'WEAPON', 천옷: 'ARMOR', 경갑옷: 'ARMOR', 중갑옷: 'ARMOR', 
    장갑: 'SUBARMOR', 신발: 'SUBARMOR', 방패: 'SUBARMOR', 망토: 'SUBARMOR', 장신구: 'TRINKET', 언커먼: 'UNCOMMON'};
var workbook = new excel.Workbook();
workbook.xlsx.readFile('target.xlsx')
  .then(function() {
    var worksheet = workbook.getWorksheet(1);
    worksheet.eachRow(function(row, rowNumber) {
      var rowVal = row.values;
      if (!rowVal[1]) {
        return;
      }
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + rowVal[1] + '\', type : cons.ITEM_TYPE_';
      result += nameConv[rowVal[2]] + ', ';
      result += 'rank : ' + rowVal[3] + ', rarity : cons.ITEM_RARITY_' + nameConv[rowVal[4]] + ', stat : { ';
      var statStrs = [];
      statStrs.push(rowVal[14] ? 'phyAtkMin : ' + rowVal[14] : '');
      statStrs.push(rowVal[15] ? 'phyAtkMax : ' + rowVal[15] : '');
      statStrs.push(rowVal[18] ? 'magAtkMin : ' + rowVal[18] : '');
      statStrs.push(rowVal[19] ? 'magAtkMax : ' + rowVal[19] : '');
      statStrs.push(rowVal[22] ? 'phyReduce : ' + (rowVal[22] * 0.01) : '');
      statStrs.push(rowVal[23] ? 'magReduce : ' + (rowVal[23] * 0.01) : '');
      statStrs.push(rowVal[24] ? 'maxHp : ' + rowVal[24] : '');
      statStrs.push(rowVal[25] ? 'hpRegen : ' + rowVal[25] : '');
      statStrs.push(rowVal[26] ? 'spRegen : ' + rowVal[26] : '');
      statStrs.push(rowVal[27] ? 'spCharge : ' + rowVal[27] : '');
      statStrs.push(rowVal[28] ? 'crit : ' + (rowVal[28] * 0.01) : '');
      statStrs.push(rowVal[29] ? 'critDmg : ' + (rowVal[29] * 0.01) : '');
      statStrs.push(rowVal[30] ? 'hit : ' + (rowVal[30] * 0.01) : '');
      statStrs.push(rowVal[31] ? 'evasion : ' + (rowVal[31] * 0.01) : '');
      result += statStrs.filter(x => x.length > 0).join(', ');
      result += ' }, effect : [] };\r\n';
      seq++;
    });
    fs.writeFile('itemsEx.txt', result);
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
