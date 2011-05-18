var path = require('path');
require.paths.unshift(path.join(__dirname, '..'));

// test variables

var test = {
  account: "test"
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
    'an account address': {
      topic: function(client){
        client.getAccountAddress(test.account, this.callback);
      },
      'is valid': function(address){
        assert.ok(address, "Update test variables with a valid address?");
      },
      'after getting the account name again': {
        topic: function(address, client) {
          client.getAccount(address, this.callback);
        },
        'should be the same as the original': function(account) {
          assert.equal(account, test.account);
        }
      }
    },
    'account addresses': {
      topic: function(client){
        client.getAddressesByAccount(test.account, this.callback);
      },
      'is not empty': function(addresses) {
        assert.isTrue(addresses && addresses.length > 0);
      }
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


