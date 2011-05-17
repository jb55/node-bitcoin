var path = require('path');
require.paths.unshift(path.join(__dirname, '..'));

// test variables

var test = {
  address: "1GbDSt8XieCHQmkQsZmMirwHoUHJukjwXn"
}

// end test variables

var vows = require('vows'),
    assert = require('assert');

var bitcoin = require('lib/bitcoin');

function makeClient() {
  return new bitcoin.Client('localhost', 8332, 'jb55', 'thisisthepassword');
}

function notEmpty(data) {
  if (data === 0)
    return;
  assert.ok(data);
}

vows.describe('api').addBatch({
  '': {
    topic: makeClient,
    'an account': {
      topic: function(client){
        client.getAccount(test.address, this.callback);
      },
      'is valid': function(account){
        assert.ok(account, "Update test variables with a valid address?");
      },
    },
    'getDifficulty': {
      topic: function(client) { client.getDifficulty(this.callback); },
      'should not be empty': notEmpty,
      'is a number': function (data) {
        assert.isNumber(data);
      },
      'is greater than 0': function (data) { assert.isTrue(data > 0); }
    },
    'getInfo': {
      topic: function(client) { client.getInfo(this.callback); },
      'should not be empty': notEmpty,
      'info.errors should be empty': function (info) {
        assert.isEmpty(info.errors);
      },
    },
    'getHashesPerSec': {
      topic: function(client) { client.getHashesPerSec(this.callback); },
      'should not be empty': notEmpty,
      'is a number': function (data) { assert.isNumber(data) },
    },
    'help': {
      topic: function(client) { client.help(this.callback); },
      'should not be empty': notEmpty,
    },
    'getTransaction': {
      topic: "TODO: get valid transaction",
      'should not be empty': notEmpty,
    },
  },

}).run();


