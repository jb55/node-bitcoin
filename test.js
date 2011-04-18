
var bitcoin = require('./lib/bitcoin');
var client = new bitcoin.Client('localhost', 8332, 'jb55', 'thisisthepassword');

doCmd('getWork');

function doCmd(cmd) {
  client[cmd](function(data) {
    console.log(cmd);
    console.log(data);
    console.log('');
  });
}

