/*const excel = require('exceljs');

//read from a file
var workbook = new Excel.Workbook();
workbook.xlsx.readFile(filename)
    .then(function() {
        // use workbook
    }); */
fs = require('fs')

var seq = 0;
var names, result = '';

fs.readFile('target.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  names = data.split('\r\n');
  doCommons();
});

var doCommons = function() {
  var group = [9, 9, 8, 8, 8, 8, 8, 8, 8, 8];
  var rarity = ['', 'UN'];
  var prates = [1.0, 1.1, 1.0, 1.1, 1.25, 1.375, 1.25, 1.375, 0.75, 0.825];
  var mrates = [1.0, 1.1, 1.0, 1.1, 0.75, 0.825, 0.75, 0.825, 1.25, 1.375];

  var drates = [1.0, 1.0, 2.5, 2.5, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0];
  var values = [10, 15, 22, 30, 38, 47, 58, 70, 83];
  var diffs = [2, 2, 2, 3, 3, 4, 4, 5, 6];
  var crits = [2, 2, 3, 3, 4, 4, 5, 6, 7]
  
  for ([key, val] of group.entries()) {
    for (var i = 9 - val; i < 9; i++) {
      result += 'itemList[' + seq + '] = { id : ' + seq + ', name : \'' + names[seq] + '\', type : cons.ITEM_TYPE_WEAPON, ';
      result += 'rank : ' + (9-i) + ', rarity : cons.ITEM_RARITY_' + rarity[key % 2] + 'COMMON, stat : {';
      result += ' phyAtkMin : ' + Math.round(values[i] * prates[key] - diffs[i] * drates[key]) + ',';
      result += ' phyAtkMax : ' + Math.round(values[i] * prates[key] + diffs[i] * drates[key]) + ',';
      result += ' magAtkMin : ' + Math.round(values[i] * mrates[key] - diffs[i] * drates[key]) + ',';
      result += ' magAtkMax : ' + Math.round(values[i] * mrates[key] + diffs[i] * drates[key]) + ',';
      result += ' crit : ' + crits[i] + ' }, effect : [] }\r\n';
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
