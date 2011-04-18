var path = require('path');
require.paths.unshift(path.join(__dirname, '..'));

var vows = require('vows'),
    assert = require('assert');

var bitcoin = require('lib/bitcoin');

var nullError = function(cb) { 
  var self = this;
  return function() { 
    var args = [].slice.call(arguments);
    args.unshift(null);
    cb.apply(self, args);
  };
}

function makeClient() {
  return new bitcoin.Client('localhost', 8332, 'jb55', 'thisisthepassword');
}

function clientTopic() {
  var args = [].slice.call(arguments);
  var cmd = args.shift();
  return function(client){
    args.push(nullError(this.callback));
    client[cmd].apply(client, args);
  }
}

function notEmpty(err, data) {
  if (data === 0)
    return;
  assert.ok(data);
}

vows.describe('api').addBatch({
  'client': {
    topic: makeClient(),
    'getTransaction': {
      topic: clientTopic('getTransaction', "fff2525b8931402dd09222c50775608f75787bd2b87e56995a7bdd30f79702c4"),
      'should not be empty': notEmpty,
    },
    'getDifficulty': {
      topic: clientTopic('getDifficulty'),
      'should not be empty': notEmpty,
      'is a number': function (err, data) { assert.isNumber(data) },
      'is greater than 0': function (err, data) { assert.isTrue(data > 0); }
    },
    'getInfo': {
      topic: clientTopic('getInfo'),
      'should not be empty': notEmpty,
      'info.errors should be empty': function (err, info) {
        assert.isEmpty(info.errors);
      },
    },
    'getHashesPerSec': {
      topic: clientTopic('getHashesPerSec'),
      'should not be empty': notEmpty,
      'is a number': function (err, data) { assert.isNumber(data) },
    },
    'help': {
      topic: clientTopic('help'),
      'should not be empty': notEmpty,
    }
  },
  
}).run();


