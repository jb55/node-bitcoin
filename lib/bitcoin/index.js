
var rpc = require('../jsonrpc');
var _ = require('underscore')._;


//===----------------------------------------------------------------------===//
// jsonrpc wrappers
//===----------------------------------------------------------------------===//
var bitcoinAPI = {
  backupWallet: 'backupwallet',
  getBalance: 'getbalance',
  getBlockCount: 'getblockcount',
  getBlockNumber: 'getblocknumber',
  getConnectionCount: 'getconnectioncount',
  getDifficulty: 'getdifficulty',
  getGenerate: 'getgenerate',
  getHashesPerSecond: 'gethashespersec',
  getInfo: 'getinfo',
  getNewAddress: 'getnewaddress',
  getReceivedByAccount: 'getreceivedbyaccount',
  listReceivedByAccount: 'listreceivedbyaccount',
  getReceivedByAddress: 'getreceivedbyaddress',
  listReceivedByAddress: 'listreceivedbyaddress',
  getTransaction: 'gettransaction',
  getWork: 'getwork',
  setGenerate: 'setgenerate',
  validateAddress: 'validateaddress',
  help: 'help',
};


//===----------------------------------------------------------------------===//
// Client
//===----------------------------------------------------------------------===//
function Client(host, port, user, pass) {
  this.host = host;
  this.port = port;
  this.user = user;
  this.pass = pass;

  this.rpc = rpc.getClient(port, host, user, pass);
}


//===----------------------------------------------------------------------===//
// Initialize wrappers
//===----------------------------------------------------------------------===//
(function() {
  _.each(bitcoinAPI, function(jsonFn, protoFn) {
    Client.prototype[protoFn] = function() {
      var args = [].slice.call(arguments);
      var fn = args[args.length-1];

      // If the last function is a callback, pop it from the args list
      if(_.isFunction(fn)) {
        args.pop(); 
      } else {
        fn = function () {};
      }

      this.rpc.call(jsonFn, args, fn);
    };
  });
})();


// Export!
module.exports = Client;
