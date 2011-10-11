
var rpc = require('../jsonrpc')
  ,   _ = require('underscore')._;

//===----------------------------------------------------------------------===//
// jsonrpc wrappers
//===----------------------------------------------------------------------===//
var bitcoinAPI = {
  backupWallet: 'backupwallet',
  encryptWallet: 'encryptwallet',
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
  getMemorypool: 'getmemorypool',
  getMemoryPool: 'getmemorypool',
  getNewAddress: 'getnewaddress',
  getReceivedByAccount: 'getreceivedbyaccount',
  getReceivedByAddress: 'getreceivedbyaddress',
  getTransaction: 'gettransaction',
  getWork: 'getwork',
  help: 'help',
  keypoolRefill: 'keypoolrefill',
  listAccounts: 'listaccounts',
  listReceivedByAccount: 'listreceivedbyaccount',
  listReceivedByAddress: 'listreceivedbyaddress',
  listSinceBlock: 'listsinceblock',
  listTransactions: 'listtransactions',
  move: 'move',
  sendFrom: 'sendfrom',
  sendMany: 'sendmany',
  sendToAddress: 'sendtoaddress',
  setAccount: 'setaccount',
  setGenerate: 'setgenerate',
  setTxFee: 'settxfee',
  signMessage: 'signmessage',
  stop: 'stop',
  validateAddress: 'validateaddress',
  verifyMessage: 'verifymessage',
  walletLock: 'walletlock',
  walletPassphrase: 'walletpassphrase',
  walletPassphraseChange: 'walletpassphrasechange',
};


//===----------------------------------------------------------------------===//
// Client
//   Either pass in 4 arguments, or a single object with host, port, user, pass
//===----------------------------------------------------------------------===//
function Client() {
  var args = [].slice.call(arguments);
  this.host = args[0].host || args[0];
  this.port = args[0].port || args[1];
  this.user = args[0].user || args[2];
  this.pass = args[0].pass || args[3];
  
  this.rpc = new rpc.Client(this.port, this.host, this.user, this.pass);
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
