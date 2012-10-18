var path = require('path');

// test variables

var test = {
    account: 'test'
};

var config = require('./config');

// end test variables

var vows = require('vows'),
    assert = require('assert');

var bitcoin = require('../lib/bitcoin');

function makeClient() {
  return new bitcoin.Client(config.host, config.port, config.user, config.pass);
}

function notEmpty(data) {
  if (data === 0)
    return;
  assert.ok(data);
}

var batchCallbackCount = 0;

vows.describe('api').addBatch({
  '': {
    topic: makeClient,
    'an account address': {
      topic: function(client){
        client.getAccountAddress(test.account, this.callback);
      },
      'is valid': function(address){
        assert.ok(address);
      },
      'after getting the account name again': {
        topic: function(address, client) {
          client.getAccount(address, this.callback);
        },
        'should be the same as the original': function(account) {
          assert.equal(account, test.account);
        }
      },
    },
    'listTransactions with specific amount': {
      topic: function(client){
        client.listTransactions(test.account, 15, this.callback);
      },
      'should not be empty': function(txs){ assert.ok(txs); },
      'is an array': function(txs) { assert.isTrue(txs instanceof Array); }
    },
    'listTransactions without specific amount': {
      topic: function(client){
        client.listTransactions(test.account, this.callback);
      },
      'should not be empty': function(txs){ assert.ok(txs); },
      'is an array': function(txs) { assert.isTrue(txs instanceof Array); }
    },
    'account addresses': {
      topic: function(client){
        var self = this;
        client.getNewAddress(test.account, function(err, address) {
          if (err) {
            return self.callback(err);
          }
          client.getAddressesByAccount(test.account, self.callback);
        });
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
    'getWork': {
      topic: function(client) { client.getWork(this.callback); },
      'should not be empty': notEmpty,
    },
    'getTransaction': {
      topic: "TODO: get valid transaction",
      'should not be empty': notEmpty,
    },
    'client creation with single object': {
      topic: function(client){
        var client2 = new bitcoin.Client(config);
        var self = this;
        client2.getWork(function(err, work) {
          self.callback(err, work, client2, client);
        });
      },
      'should have same params': function(err, work, client2, client) {
        assert.isNull(err);
        assert.equal(client2.host, client.host);
        assert.equal(client2.port, client.port);
        assert.equal(client2.user, client.user);
        assert.equal(client2.pass, client.pass);
      },
      'getWork should be an object': function(work) {
        assert.isObject(work);
      }
    },
    'creating a bitcoin related error': {
      topic: function(client) {
        client.cmd('nomethod', this.callback);
      },
      'should pass Error object in callback': function(err, expectedValue) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Method not found');
        assert.equal(err.code, -32601);
        assert.equal(expectedValue, undefined);
      },
    },
    'running batch of rpc calls': {
      topic: function(client) {
        // create batch of calls to get 10 new addresses
        var batch = [];
        for (var i = 0; i < 10; ++i) {
          batch.push({
            method: 'getnewaddress',
            params: [test.account]
          });
        }
        var self = this;
        client.cmd(batch, function(err, address) {
          assert.isTrue(++batchCallbackCount <= 10);
          if (batchCallbackCount === 10) {
            self.callback(err, address);
          }
        });
      },
      'should receive new address': function(err, address){
        assert.equal(err, null);
        assert.ok(address);
      }
    }
  },
  'invalid credentials': {
    topic: function() {
      return new bitcoin.Client(config.host, config.port, 'baduser', 'badpwd');
    },
    'should still return client object': function(client) {
      assert.equal(typeof client, 'object');
      assert.equal(client.host, config.host);
      assert.equal(client.port, config.port);
      assert.equal(client.user, 'baduser');
      assert.equal(client.pass, 'badpwd');
    },
    'will return status 401 with html': {
      topic: function(client) {
        client.getDifficulty(this.callback);
      },
      'and should be able to handle it': function(err, difficulty) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Invalid params, response status code: 401');
        assert.equal(err.code, -32602);
        assert.equal(difficulty, undefined);
      },
    },
  },
  'creating a client on a non-listening port': {
    topic: function() {
      return new bitcoin.Client(config.host, 9897, 'baduser', 'badpwd');
    },
    'will return client object': function(client) {
      assert.equal(typeof client, 'object');
    },
    'but when calling a command': {
      topic: function(client) {
        client.listSinceBlock(this.callback);
      },
      'should not call callback more than once': function(err, result) {
        assert.instanceOf(err, Error);
      }
    }
  }
  
}).export(module);
