
var rpc = require('../jsonrpc');
var util = require('util');
var events = require('events');

function Pool(client) {
  if (! this instanceof Pool)
    return new Pool(client);
  events.EventEmitter.call(this);
  this.client = client;
  this.server = new rpc.Server();
  var self = this;

  // expose methods
  this.server.expose('getwork', function(res) {
    self.getWork(res);
  });

}

util.inherits(Pool, events.EventEmitter);


//===----------------------------------------------------------------------===//
// listen
//===----------------------------------------------------------------------===//
Pool.prototype.listen = function(port, host) {
  this.server.listen(port, host);
}


//===----------------------------------------------------------------------===//
// getWork (exposed JSON method)
//===----------------------------------------------------------------------===//
Pool.prototype.getWork = function(res) {
  this.client.getWork(function(work) {
    res(work);
  });
}

module.exports = Pool;
