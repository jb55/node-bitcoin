var assert = require('assert'),
    bitcoin = require('../lib/bitcoin'),
    config = require('./config'),
    deprecate = require('deprecate');

// hide deprecation warnings    
deprecate.silence = true;

var test = {
  account: 'test'
};

var makeClient = function makeClient() {
  return new bitcoin.Client(config.host, config.port, config.user, config.pass);
};

var notEmpty = function notEmpty(data) {
  if (data === 0) return;
  assert.ok(data);
};

describe('Client', function() {
  
  describe('getAccountAddress()', function() {
    it('should be able to get an account address', function(done) {
      var client = makeClient();
      client.getAccountAddress(test.account, function(err, address) {
        assert.ifError(err);
        assert.ok(address);
        client.getAccount(address, function(err, account) {
          assert.ifError(err);
          assert.equal(account, test.account);
          done();
        });
      });
    });
  });
  
  describe('listTransactions()', function() {
    it('should be able to listTransactions with specific count', function(done) {
      var client = makeClient();
      client.listTransactions(test.account, 15, function(err, txs) {
        assert.ifError(err);
        assert.ok(txs);
        assert.ok(Array.isArray(txs));
        done();
      });
    });
    
    it('should be able to listTransactions without specific count', function(done) {
      var client = makeClient();
      client.listTransactions(test.account, function(err, txs) {
        assert.ifError(err);
        assert.ok(txs);
        assert.ok(Array.isArray(txs));
        done();
      });
    });
  });
  
  describe('getNewAddress()', function() {
    it('should be able to get new address', function(done) {
      var client = makeClient();
      client.getNewAddress(test.account, function(err, account) {
        assert.ifError(err);
        client.getAddressesByAccount(test.account, function(err, addresses) {
          assert.ifError(err);
          assert.ok(addresses && addresses.length > 0);
          done();
        });
      });
    });
  });
  
  describe('getDifficulty()', function() {
    it('should get difficulty', function(done) {
      var client = makeClient();
      client.getDifficulty(function(err, difficulty) {
        assert.ifError(err);
        assert.ok(typeof difficulty === 'number');
        done();
      });
    });
  });
  
  describe('getInfo()', function() {
    it('should get info', function(done) {
      var client = makeClient();
      client.getInfo(function(err, info) {
        assert.ifError(err);
        notEmpty(info);
        assert.ok(info.errors === '');
        done();
      });
    });
  });
  
  describe('getHashesPerSec()', function() {
    it('should get hashes per second', function(done) {
      var client = makeClient();
      client.getHashesPerSec(function(err, data) {
        assert.ifError(err);
        notEmpty(data);
        assert.ok(typeof data === 'number');
        done();
      });
    });
  });
  
  describe('help()', function() {
    it('should return help', function(done) {
      var client = makeClient();
      client.help(function(err, help) {
        assert.ifError(err);
        notEmpty(help);
        done();
      });
    });
  });
  
  describe('getWork()', function() {
    it('should get work', function(done) {
      var client = makeClient();
      client.getWork(function(err, work) {
        assert.ifError(err);
        notEmpty(work);
        done();
      });
    });
  });
  
  it('client creation with single object', function(done) {
    var client = makeClient();
    var client2 = new bitcoin.Client(config);
    client2.getWork(function(err, work) {
      assert.ifError(err);
      notEmpty(work);
      assert.ok(typeof work === 'object');
      assert.equal(client2.host, client.host);
      assert.equal(client2.port, client.port);
      assert.equal(client2.user, client.user);
      assert.equal(client2.pass, client.pass);
      done();
    });
  });
  
  it('bitcoin related error should be an Error object', function(done) {
    var client = makeClient();
    client.cmd('nomethod', function(err, expectedValue) {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Method not found');
      assert.equal(err.code, -32601);
      assert.equal(expectedValue, undefined);
      done();
    });
  });
  
  it('running batch of rpc calls', function(done) {
    this.timeout(5000);
    var batch = [];
    for (var i = 0; i < 10; ++i) {
      batch.push({
        method: 'getnewaddress',
        params: [test.account]
      });
    }
    var client = makeClient();
    var batchCallbackCount = 0;
    client.cmd(batch, function(err, address) {
      assert.ifError(err);
      assert.ok(++batchCallbackCount <= 10);
      assert.ok(address);
      if (batchCallbackCount === 10) done();
    });
  });
  
  describe('invalid credentials', function() {
    var client = new bitcoin.Client(config.host, config.port, 'baduser', 'badpwd');
    
    it('should still return client object', function(done) {
      assert.equal(typeof client, 'object');
      assert.equal(client.host, config.host);
      assert.equal(client.port, config.port);
      assert.equal(client.user, 'baduser');
      assert.equal(client.pass, 'badpwd');
      done();
    });
    
    it('should return status 401 with html', function(done) {
      client.getDifficulty(function(err, difficulty) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid params, response status code: 401');
        assert.equal(err.code, -32602);
        assert.equal(difficulty, undefined);
        done();
      });
    });
  });
  
  describe('creating client on non-listening port', function() {
    var client = new bitcoin.Client(config.host, 9897, 'baduser', 'badpwd');
    
    it('will return client object', function(done) {
      assert.ok(typeof client === 'object');
      done();
    });
    
    it('should not call callback more than once', function(done) {
      client.listSinceBlock(function(err, result) {
        assert.ok(err instanceof Error);
        done();
      });
    });
  });
  
});
