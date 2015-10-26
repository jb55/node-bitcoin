var commands = require('./commands')
var rpc = require('./jsonrpc')

// ===----------------------------------------------------------------------===//
// Client
// ===----------------------------------------------------------------------===//
function Client (opts) {
  this.rpc = new rpc.Client(opts)
}

// ===----------------------------------------------------------------------===//
// cmd
// ===----------------------------------------------------------------------===//
Client.prototype.cmd = function () {
  var args = [].slice.call(arguments)
  var cmd = args.shift()

  callRpc(cmd, args, this.rpc)
}

// ===----------------------------------------------------------------------===//
// callRpc
// ===----------------------------------------------------------------------===//
function callRpc (cmd, args, rpc) {
  var fn = args[args.length - 1]

  // If the last argument is a callback, pop it from the args list
  if (typeof fn === 'function') {
    args.pop()
  } else {
    fn = function () {}
  }

  rpc.call(cmd, args, function () {
    var args = [].slice.call(arguments)
    args.unshift(null)
    fn.apply(this, args)
  }, function (err) {
    fn(err)
  })
}

// ===----------------------------------------------------------------------===//
// Initialize wrappers
// ===----------------------------------------------------------------------===//
(function () {
  for (var protoFn in commands) {
    (function (protoFn) {
      Client.prototype[protoFn] = function () {
        var args = [].slice.call(arguments)
        callRpc(commands[protoFn], args, this.rpc)
      }
    })(protoFn)
  }
})()

// Export!
module.exports.Client = Client
