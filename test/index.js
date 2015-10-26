/* global describe, it */

var assert = require('assert')
var clone = require('clone')
var http = require('http')
var bitcoin = require('../')
var config = require('./config')

var test = {
  account: 'test'
}

var makeClient = function makeClient () {
  return new bitcoin.Client(config)
}

var notEmpty = function notEmpty (data) {
  if (data === 0) return
  assert.ok(data)
}

var makeServer = function (port) {
  var server = http.createServer()
  server.listen(port)
  return server
}

describe('Client', function () {
  describe('getAccountAddress()', function () {
    it('should be able to get an account address', function (done) {
      var client = makeClient()
      client.getAccountAddress(test.account, function (err, address) {
        assert.ifError(err)
        assert.ok(address)
        client.getAccount(address, function (err, account) {
          assert.ifError(err)
          assert.equal(account, test.account)
          done()
        })
      })
    })
  })

  describe('listTransactions()', function () {
    it('should be able to listTransactions with specific count', function (done) {
      var client = makeClient()
      client.listTransactions(test.account, 15, function (err, txs) {
        assert.ifError(err)
        assert.ok(txs)
        assert.ok(Array.isArray(txs))
        done()
      })
    })

    it('should be able to listTransactions without specific count', function (done) {
      var client = makeClient()
      client.listTransactions(test.account, function (err, txs) {
        assert.ifError(err)
        assert.ok(txs)
        assert.ok(Array.isArray(txs))
        done()
      })
    })
  })

  describe('getNewAddress()', function () {
    it('should be able to get new address', function (done) {
      var client = makeClient()
      client.getNewAddress(test.account, function (err, address) {
        assert.ifError(err)
        client.getAddressesByAccount(test.account, function (err, addresses) {
          assert.ifError(err)
          assert.ok(addresses && addresses.length > 0)
          done()
        })
      })
    })
  })

  describe('getBalance()', function () {
    it('should return balance without any args', function (done) {
      var client = makeClient()
      client.getBalance(function (err, balance) {
        assert.ifError(err)
        assert.ok(typeof balance === 'number')
        done()
      })
    })
  })

  describe('getDifficulty()', function () {
    it('should get difficulty', function (done) {
      var client = makeClient()
      client.getDifficulty(function (err, difficulty) {
        assert.ifError(err)
        assert.ok(typeof difficulty === 'number')
        done()
      })
    })
  })

  describe('getInfo()', function () {
    it('should get info', function (done) {
      var client = makeClient()
      client.getInfo(function (err, info, headers) {
        assert.ifError(err)
        notEmpty(info)
        assert.ok(info.errors === '')
        done()
      })
    })
  })

  describe('help()', function () {
    it('should return help', function (done) {
      var client = makeClient()
      client.help(function (err, help) {
        assert.ifError(err)
        notEmpty(help)
        done()
      })
    })
  })

  it('bitcoin related error should be an Error object', function (done) {
    var client = makeClient()
    client.cmd('nomethod', function (err, expectedValue) {
      assert.ok(err instanceof Error)
      assert.equal(err.message, 'Method not found')
      assert.equal(err.code, -32601)
      assert.equal(expectedValue, undefined)
      done()
    })
  })

  it('running batch of rpc calls', function (done) {
    this.timeout(5000)
    var batch = []
    for (var i = 0; i < 10; ++i) {
      batch.push({
        method: 'getnewaddress',
        params: [test.account]
      })
    }
    var client = makeClient()
    var batchCallbackCount = 0
    client.cmd(batch, function (err, address) {
      assert.ifError(err)
      assert.ok(++batchCallbackCount <= 10)
      assert.ok(address)
      if (batchCallbackCount === 10) done()
    })
  })

  describe('invalid credentials', function () {
    var badCredentials = clone(config)
    badCredentials.user = 'baduser'
    badCredentials.pass = 'badpwd'
    var client = new bitcoin.Client(badCredentials)

    it('should still return client object', function (done) {
      assert.ok(client instanceof bitcoin.Client)
      done()
    })

    it('should return status 401 with html', function (done) {
      client.getDifficulty(function (err, difficulty) {
        assert.ok(err instanceof Error)
        assert.equal(err.message, 'Invalid params, response status code: 401')
        assert.equal(err.code, -32602)
        assert.equal(difficulty, undefined)
        done()
      })
    })
  })

  describe('creating client on non-listening port', function () {
    var badPort = clone(config)
    badPort.port = 9897
    badPort.user = 'baduser'
    badPort.pass = 'badpwd'
    var client = new bitcoin.Client(badPort)

    it('will return client object', function (done) {
      assert.ok(client instanceof bitcoin.Client)
      done()
    })

    it('should not call callback more than once', function (done) {
      client.listSinceBlock(function (err, result) {
        assert.ok(err instanceof Error)
        done()
      })
    })
  })

  describe('request timeouts', function () {
    it('should occur by default after 30000ms', function (done) {
      this.timeout(31000)
      var server = makeServer(19998)
      var request // eslint-disable-line no-unused-vars
      var response
      server.on('request', function (req, res) {
        request = req
        response = res
      })
      var client = new bitcoin.Client({
        host: 'localhost',
        port: 19998,
        user: 'admin1',
        pass: '123'
      })
      var start = Date.now()
      client.getInfo(function (err, info) {
        var delta = Date.now() - start
        assert.ok(err instanceof Error)
        assert.ok(err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT')
        assert.ok(delta >= 30000, 'delta should be >= 30000: ' + delta)
        response.end()
        server.close()
        done()
      })
    })

    it('should be customizable', function (done) {
      this.timeout(4500)
      var server = makeServer(19999)
      var request // eslint-disable-line no-unused-vars
      var response
      server.on('request', function (req, res) {
        request = req
        response = res
      })
      var client = new bitcoin.Client({
        host: 'localhost',
        port: 19999,
        user: 'admin1',
        pass: '123',
        timeout: 2500
      })
      var start = Date.now()
      client.getInfo(function (err, info) {
        var delta = Date.now() - start
        assert.ok(err instanceof Error)
        assert.ok(err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT')
        assert.ok(delta >= 2500, 'delta should be >= 2500:' + delta)
        response.end()
        server.close()
        done()
      })
    })
  })

  describe('response headers', function () {
    var assertResHeaders = function (resHeaders) {
      assert.ok(resHeaders)
      assert.ok(resHeaders.server)
      assert.ok(/bitcoin/.test(resHeaders.server))
    }
    it('should be returned for no parameter calls', function (done) {
      var client = makeClient()
      client.getInfo(function (err, info, resHeaders) {
        assert.ifError(err)
        notEmpty(info)
        assert.ok(info.errors === '')
        assertResHeaders(resHeaders)
        done()
      })
    })

    it('should be returned for 1-parameter call', function (done) {
      var client = makeClient()
      client.getNewAddress(test.account, function (err, address, resHeaders) {
        assert.ifError(err)
        assert.ok(address)
        assertResHeaders(resHeaders)
        done()
      })

      it('should be returned for 2-parameter call', function (done) {
        var client = makeClient()
        client.listTransactions(test.account, 15, function (err, txs, resHeaders) {
          assert.ifError(err)
          assert.ok(txs)
          assert.ok(Array.isArray(txs))
          assertResHeaders(resHeaders)
          done()
        })
      })
    })
  })
})
