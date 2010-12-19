
var bitcoin = require('./lib/bitcoin/index.js');
var client = new bitcoin.Client('localhost', 8332, 'jb55', 'thisisthepassword');

doCmd('getBalance');
doCmd('getConnectionCount');
doCmd('getDifficulty');
doCmd('getInfo');
doCmd('getHashesPerSecond');
doCmd('getGenerate');

function doCmd(cmd) {
  client[cmd](function(data) {
    console.log(cmd);
    console.log(data);
  });
}
