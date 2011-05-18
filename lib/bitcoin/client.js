
var rpc = require('../jsonrpc')
  ,   _ = require('underscore')._;

//===----------------------------------------------------------------------===//
// jsonrpc wrappers
//===----------------------------------------------------------------------===//
var bitcoinAPI = {
  backupWallet: 'backupwallet',
  getAccount: 'getaccount',
  getAccountAddress: 'getaccountaddress',
  getAddressesByAccount: 'getaddressesbyaccount',
  getBalance: 'getbalance',
  getBlockCount: 'getblockcount',
  getBlockNumber: 'getblocknumber',
  getConnectionCount: 'getconnectioncount',
  getDifficulty: 'getdifficulty',
  getGenerate: 'getgenerate',
  getHashesPerSecond: 'gethashespersec',
  getHashesPerSec: 'gethashespersec',
  getInfo: 'getinfo',
  getNewAddress: 'getnewaddress',
  getReceivedByAccount: 'getreceivedbyaccount',
  getReceivedByAddress: 'getreceivedbyaddress',
  getTransaction: 'gettransaction',
  getWork: 'getwork',
  help: 'help',
  listAccounts: 'listaccounts',
  listReceivedByAccount: 'listreceivedbyaccount',
  listReceivedByAddress: 'listreceivedbyaddress',
  listTransactions: 'listtransactions',
  move: 'move',
  sendFrom: 'sendfrom',
  sendToAddress: 'sendtoaddress',
  setGenerate: 'setgenerate',
  stop: 'stop',
  validateAddress: 'validateaddress',
};


//===----------------------------------------------------------------------===//
// Client
//===----------------------------------------------------------------------===//
function Client(host, port, user, pass) {
  this.host = host;
  this.port = port;
  this.user = user;
  this.pass = pass;

  this.rpc = new rpc.Client(port, host, user, pass);
}


//===----------------------------------------------------------------------===//
// cmd
//   Call custom jsonrpc commands
//===----------------------------------------------------------------------===//
Client.prototype.cmd = function() {
  var args = [].slice.call(arguments);
  var cmd = args.shift();

  callRpc(cmd, args, this.rpc);
}


//===----------------------------------------------------------------------===//
// callRpc
//===----------------------------------------------------------------------===//
function callRpc(cmd, args, rpc) {
  var fn = args[args.length-1];

  // If the last function is a callback, pop it from the args list
  if(_.isFunction(fn)) {
    args.pop();
  } else {
    fn = function () {};
  }

  rpc.call(cmd, args, function(){
    var args = [].slice.call(arguments);
    args.unshift(null);
    fn.apply(this, args);
  }, function(err){
    fn(err);
  });
}

//===----------------------------------------------------------------------===//
// Initialize wrappers
//===----------------------------------------------------------------------===//
(function() {
  _.each(bitcoinAPI, function(jsonFn, protoFn) {
    Client.prototype[protoFn] = function() {
      var args = [].slice.call(arguments);
      callRpc(jsonFn, args, this.rpc);
    }
  });
})();


// Export!
module.exports = Client;
