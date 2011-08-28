
var bitcoin = require('./lib/bitcoin');
var client = new bitcoin.Client('localhost', 8332, 'jb55', 'thisisthepassword');

function doCmd(cmd) {
  client[cmd](function(err, data) {
    console.log(cmd);
    console.log(data);
    console.log("err: ", err);
    console.log('');
  });
}

doCmd('getWork');
