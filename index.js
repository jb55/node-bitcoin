var deprecate = require('deprecate'),
    commands = require('./commands'),
    rpc = require('./jsonrpc');

//===----------------------------------------------------------------------===//
// Client
//   Pass in an object with host, port, user, pass
//===----------------------------------------------------------------------===//
function Client() {
  var args = [].slice.call(arguments);
    
  if (args.length > 1) {
    deprecate('calling bitcoin.Client with more than one argument is deprecated');
    this.host = args[0];
    this.port = args[1];
    this.user = args[2];
    this.pass = args[3];
    this.ssl = false;
    this.sslStrict = false;
    this.sslCa = null;
  } else {
    this.host = args[0].host;
    this.port = args[0].port;
    this.user = args[0].user;
    this.pass = args[0].pass;
    this.ssl = args[0].ssl ? true : false;
    this.sslStrict = (typeof args[0].sslStrict === 'undefined' || args[0].sslStrict);
    this.sslCa = args[0].sslCa;
  }
  
  this.rpc = new rpc.Client(this.port, this.host, this.user, this.pass, 
    this.ssl, this.sslStrict, this.sslCa);
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
  for (var protoFn in commands) {
    (function(protoFn) {
      Client.prototype[protoFn] = function() {
        var args = [].slice.call(arguments);
        callRpc(commands[protoFn], args, this.rpc);
      };
    })(protoFn);
  }
})();

// Export!
module.exports.Client = Client;
