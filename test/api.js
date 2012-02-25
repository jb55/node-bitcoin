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
    'getblocknumber is deprecated': {
      topic: function(client) {
        client.cmd('getblocknumber', this.callback);
      },
      'and has been replaced by getblockcount': {
        topic: function(number, client) {
          client.cmd('getblockcount', this.callback);
        },
        'getBlockNumber uses getblockcount': {
          topic: function(count, number, client) {
            var self = this;
            client.getBlockNumber(function(err, number2) {
              self.callback(err, number2, count, number);
            });
          },
          'and should match both': function(err, number2, count, number) {
            assert.equal(number2, count);
            assert.equal(number2, number);
          }
        }
      }
    },
    'creating a bitcoin related error': {
      topic: function(client) {
        client.cmd('nomethod', this.callback);
      },
      'should create non-null err in callback': function(err, expectedValue) {
        assert.deepEqual(err, {
          code: -32601,
          message: 'Method not found'
        });
        assert.equal(expectedValue, undefined);
      },
    },
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
        assert.isNotNull(err);
        assert.isObject(err);
        assert.equal(difficulty, undefined);
      },
    },
  },
  
}).export(module);
