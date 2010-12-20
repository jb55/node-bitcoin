
var bitcoin = require('./lib/bitcoin');
var client = new bitcoin.Client('localhost', 8332, 'jb55', 'thisisthepassword');
var pool = new bitcoin.Pool(client);

pool.listen(8355, 'localhost');
