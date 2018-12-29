const excel = require('exceljs');
const fs = require('fs');

const fseq = 439;
var seq = 0;
var names, result = '';

fs.readFile('target.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  names = data.split('\r\n');
  //doCommons();
  //doSeat();
});

const nameConv = {무기: 'WEAPON', 천옷: 'ARMOR', 경갑옷: 'ARMOR', 중갑옷: 'ARMOR', 
    장갑: 'SUBARMOR', 신발: 'SUBARMOR', 방패: 'SUBARMOR', 망토: 'SUBARMOR', 장신구: 'TRINKET', 언커먼: 'UNCOMMON', 레어: 'RARE', 유니크: 'UNIQUE', 에픽: 'EPIC'};
var workbook = new excel.Workbook();
var rds = [2, 4, 7, 10, 14, 18, 23, 29, 36];
workbook.xlsx.readFile('target.xlsx')
  .then(function() {
    var worksheet = workbook.getWorksheet(1);
    worksheet.eachRow(function(row, rowNumber) {
      var rowVal = row.values;
      if (!rowVal[1]) {
        return;
      }
      if (rowVal[2] == '천옷') {
        rowVal[31] = rowVal[31] ? rowVal[31] + 5 : 5;
        rowVal[26] = rowVal[26] ? rowVal[26] + 1 : 1;
      } else if (rowVal[2] == '경갑옷') {
        rowVal[29] = rowVal[29] ? rowVal[29] + 10 : 10;
      } else if (rowVal[2] == '중갑옷') {
        rowVal[31] = rowVal[31] ? rowVal[31] - 3 : -3;
      } else if (rowVal[2] == '방패') {
        //rowVal[32] = rowVal[32] ? rowVal[32] + rds[rowVal[3]] : rds[rowVal[3]];
      } else if (rowVal[2] == '신발') {
        rowVal[31] = rowVal[31] ? rowVal[31] + 5 : 5;
      } else if (rowVal[2] == '장갑') {
        rowVal[30] = rowVal[30] ? rowVal[30] + 7.5 : 7.5;
      } else if (rowVal[2] == '망토') {
        rowVal[27] = rowVal[27] ? rowVal[27] + 2 : 2;
      }
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + rowVal[1] + '\', type : cons.ITEM_TYPE_';
      result += nameConv[rowVal[2]] + ', flavor : \'' + rowVal[8] + '\', ';
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
      statStrs.push(rowVal[32] ? 'dmgReduce : ' + rowVal[32] : '');
      statStrs.push(rowVal[33] ? 'pierce : ' + (rowVal[33] * 0.01) : '');
      result += statStrs.filter(x => x.length > 0).join(', ');
      result += ' }, \r\neffectDesc : \'' + (rowVal[10] ? '<br><br>' + rowVal[10] : '') + '\', effect : [] };\r\n';
      seq++;
    });
    fs.writeFile('itemsEx.txt', result);
  }); 

var doCommons = function() {
  var rarity = ['', 'UN'];
  var group = [9, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
  var prates = [1.0, 1.1, 1.0, 1.1, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825, 0.75, 0.825, 0.75, 0.825];
  var mrates = [1.0, 1.1, 1.0, 1.1, 0.75, 0.825, 0.75, 0.825, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825];

  var drates = [1.0, 1.0, 2.5, 2.5, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0];
  var values = [10, 15, 22, 30, 38, 47, 58, 70, 83];
  var crates = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2];
  var diffs = [2, 2, 2, 3, 3, 4, 4, 5, 6];
  var crits = [0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.06, 0.07];
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + names[seq] + '\', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.ITEM_TYPE_WEAPON, ';
      result += 'rank : ' + (9-i) + ', rarity : cons.ITEM_RARITY_' + rarity[key % 2] + 'COMMON, stat : {';
      result += ' phyAtkMin : ' + Math.round(values[i] * prates[key] - diffs[i] * drates[key]) + ',';
      result += ' phyAtkMax : ' + Math.round(values[i] * prates[key] + diffs[i] * drates[key]) + ',';
      result += ' magAtkMin : ' + Math.round(values[i] * mrates[key] - diffs[i] * drates[key]) + ',';
      result += ' magAtkMax : ' + Math.round(values[i] * mrates[key] + diffs[i] * drates[key]) + ',';
      result += ' crit : ' + (crits[i] * crates[key]) + ' }, effect : [] };\r\n';
      seq++;
    }
  }
  
  var group = [9, 9, 9, 9, 8, 9];
  var rates = [0.7, 0.77, 1, 1.1, 1.3, 1.43];
  var sp = [1, 1, 0, 0, 0, 0];
  var evas = [0.05, 0.05, 0, 0, -0.05, -0.05];
  var critDmgs = [0, 0, 0.1, 0.1, 0, 0];
  var values = [40, 80, 150, 220, 310, 420, 550, 700, 870];
  var reduces = [0.01, 0.02, 0.03, 0.05, 0.07, 0.09, 0.11, 0.13, 0.16];
  var rrates = [1.0, 1.1, 1.0, 1.1, 1.0, 1.1];
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + names[seq] + '\', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.ITEM_TYPE_ARMOR, ';
      result += 'rank : ' + (9-i) + ', rarity : cons.ITEM_RARITY_' + rarity[key % 2] + 'COMMON, stat : {';
      result += ' maxHp : ' + Math.round(values[i] * rates[key]) + ',';
      result += evas[key] !== 0 ? ' evasion : ' + evas[key] + ',' : '';
      result += sp[key] !== 0 ? ' spRegen : ' + sp[key] + ',' : '';
      result += critDmgs[key] !== 0 ? ' critDmg : ' + critDmgs[key] + ',' : '';
      result += ' phyReduce : ' + Math.round(reduces[i] * rrates[key] * 10000) / 10000 + ',';
      result += ' magReduce : ' + Math.round(reduces[i] * rrates[key] * 10000) / 10000 + ' }, effect : [] };\r\n';
      seq++;
    }
  }
  
  var group = [9, 9, 9, 9];
  var rates = [0.44, 0.275, 0.275, 0.44];
  var sp = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6];
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += 'itemList[' + (seq + fseq) + '] = { id : ' + (seq + fseq) + ', name : \'' + names[seq] + '\', nameType : cons.NAME_KOR_NO_END_CONS, type : cons.ITEM_TYPE_SUBARMOR, ';
      result += 'rank : ' + (9-i) + ', rarity : cons.ITEM_RARITY_UNCOMMON, stat : {';
      result += key == 0 ? ' dmgReduce : ' + rds[i] + ',' : '';
      result += key == 1 ? ' evasion : ' + 0.05 + ',' : '';
      result += key == 3 ? ' spCharge : ' + 2 + ',' : '';
      result += key == 2 ? ' hit : ' + 0.075 + ',' : '';
      result += ' maxHp : ' + Math.round(values[i] * 0.44) + ' }, effect : [] };\r\n';
      seq++;
    }
  }
  fs.writeFile('items.txt', result);
}

var doSeat = function() {
  result = '';
  var group = [9, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
  var prates = [1.0, 1.1, 1.0, 1.1, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825, 0.75, 0.825, 0.75, 0.825];
  var mrates = [1.0, 1.1, 1.0, 1.1, 0.75, 0.825, 0.75, 0.825, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825];

  var drates = [1.0, 1.0, 2.5, 2.5, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0];
  var values = [10, 15, 22, 30, 38, 47, 58, 70, 83];
  var crates = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2];
  var diffs = [2, 2, 2, 3, 3, 4, 4, 5, 6];
  var crits = [0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.06, 0.07];
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += '물리공격력+' + Math.round(values[i] * prates[key] - diffs[i] * drates[key]) + '~';
      result += Math.round(values[i] * prates[key] + diffs[i] * drates[key]) + ',';
      result += ' 마법공격력+' + Math.round(values[i] * mrates[key] - diffs[i] * drates[key]) + '~';
      result += Math.round(values[i] * mrates[key] + diffs[i] * drates[key]) + ',';
      result += ' 치명+' + Math.round(crits[i] * crates[key] * 100) + '\%\r\n';
      seq++;
    }
    result += '\r\n\r\n';
  }
  
  var group = [9, 9, 9, 9, 8, 9];
  var rates = [0.7, 0.77, 1, 1.1, 1.3, 1.43];
  var sp = [1, 1, 0, 0, 0, 0];
  var evas = [0.05, 0.05, 0, 0, -0.05, -0.05];
  var critDmgs = [0, 0, 0.1, 0.1, 0, 0];
  var values = [40, 80, 150, 220, 310, 420, 550, 700, 870];
  var reduces = [0.01, 0.02, 0.03, 0.05, 0.07, 0.09, 0.11, 0.13, 0.16];
  var rrates = [1.0, 1.1, 1.0, 1.1, 1.0, 1.1];
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += '생명력+' + Math.round(values[i] * rates[key]) + ',';
      result += ' 물리저항+' + Math.round(reduces[i] * rrates[key] * 10000) / 100 + '\%,';
      result += ' 마법저항+' + Math.round(reduces[i] * rrates[key] * 10000) / 100 + '\%\r\n';
      seq++;
    }
    result += '\r\n\r\n';
  }
  
  var group = [9, 9, 9, 9];
  var rates = [0.275, 0.275, 0.275, 0.44];
  var sp = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6];
  var evas = [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.07, 0.08];
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += '생명력+' + Math.round(values[i] * rates[key]) + ',';
      if (key == 0) {
        result += ' 물리저항+' + Math.round(reduces[i] * 0.55 * 10000) / 100 + '\%,';
        result += ' 마법저항+' + Math.round(reduces[i] * 0.55 * 10000) / 100 + '\%';
      }
      result += key == 1 ? ' 회피+' + Math.round(evas[i] * 10000) / 100 + '\%' : '';
      result += key == 3 ? ' SP충전+' + sp[i] : '';
      result += key == 2 ? ' 명중+' + Math.round((evas[i] + 0.01) * 10000) / 100 + '\%' : '';
      result += '\r\n';
      seq++;
    }
    result += '\r\n\r\n';
  }
  fs.writeFile('itemsSeat.txt', result);
}
