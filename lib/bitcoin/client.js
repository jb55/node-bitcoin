var rpc = require('../jsonrpc');

//===----------------------------------------------------------------------===//
// jsonrpc wrappers
//===----------------------------------------------------------------------===//
var bitcoinAPI = {
  addMultiSigAddress: 'addmultisigaddress',
  backupWallet: 'backupwallet',
  createRawTransaction: 'createrawtransaction', // Bitcoin v0.7+
  decodeRawTransaction: 'decoderawtransaction', // Bitcoin v0.7+
  dumpPrivKey: 'dumpprivkey',
  encryptWallet: 'encryptwallet',
  getAccount: 'getaccount',
  getAccountAddress: 'getaccountaddress',
  getAddressesByAccount: 'getaddressesbyaccount',
  getBalance: 'getbalance',
  getBlock: 'getblock',
  getBlockCount: 'getblockcount',
  getBlockHash: 'getblockhash',
  getConnectionCount: 'getconnectioncount',
  getDifficulty: 'getdifficulty',
  getGenerate: 'getgenerate',
  getHashesPerSecond: 'gethashespersec',
  getHashesPerSec: 'gethashespersec',
  getInfo: 'getinfo',
  getMemorypool: 'getmemorypool',
  getMemoryPool: 'getmemorypool',
  getMiningInfo: 'getmininginfo',
  getNewAddress: 'getnewaddress',
  getPeerInfo: 'getpeerinfo', // Bitcoin v0.7+
  getRawMemPool: 'getrawmempool', // Bitcoin v0.7+
  getRawTransaction: 'getrawtransaction', // Bitcoin v0.7+
  getReceivedByAccount: 'getreceivedbyaccount',
  getReceivedByAddress: 'getreceivedbyaddress',
  getTransaction: 'gettransaction',
  getWork: 'getwork',
  help: 'help',
  importPrivKey: 'importprivkey',
  keypoolRefill: 'keypoolrefill',
  keyPoolRefill: 'keypoolrefill',
  listAccounts: 'listaccounts',
  listReceivedByAccount: 'listreceivedbyaccount',
  listReceivedByAddress: 'listreceivedbyaddress',
  listSinceBlock: 'listsinceblock',
  listTransactions: 'listtransactions',
  listUnspent: 'listunspent', // Bitcoin v0.7+
  move: 'move',
  sendFrom: 'sendfrom',
  sendMany: 'sendmany',
  sendRawTransaction: 'sendrawtransaction', // Bitcoin v0.7+
  sendToAddress: 'sendtoaddress',
  setAccount: 'setaccount',
  setGenerate: 'setgenerate',
  setTxFee: 'settxfee',
  signMessage: 'signmessage',
  signRawTransaction: 'signrawtransaction', // Bitcoin v0.7+
  stop: 'stop',
  validateAddress: 'validateaddress',
  verifyMessage: 'verifymessage',
  walletLock: 'walletlock',
  walletPassphrase: 'walletpassphrase',
  walletPassphraseChange: 'walletpassphrasechange'
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
  if(typeof fn === 'function') {
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
  for (var protoFn in bitcoinAPI) {
    (function(protoFn) {
      Client.prototype[protoFn] = function() {
        var args = [].slice.call(arguments);
        callRpc(bitcoinAPI[protoFn], args, this.rpc);
      };
    })(protoFn);
  }
})();


// Export!
module.exports = Client;
