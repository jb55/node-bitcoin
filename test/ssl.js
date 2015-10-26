/* global describe, it */

var assert = require('assert')
var fs = require('fs')
var clone = require('clone')
var bitcoin = require('../')
var config = require('./config')

var getInfo = function (opts, cb) {
  var client = new bitcoin.Client(opts)
  client.getInfo(cb)
}

describe('Client SSL', function () {
  it('use sslStrict by default', function (done) {
    var opts = clone(config)
    opts.ssl = true
    getInfo(opts, function (err, info) {
      assert.ok(err instanceof Error)
      // node v0.11 adds `code` param to this error
      // and uses a user-friendly `message`
      // continue using err.message for v0.8 and v0.10
      assert.equal(err.code || err.message, 'DEPTH_ZERO_SELF_SIGNED_CERT')
      done()
    })
  })

  it('strictSSL should fail with self-signed certificate', function (done) {
    var opts = clone(config)
    opts.ssl = true
    opts.sslStrict = true
    getInfo(opts, function (err, info) {
      assert.ok(err instanceof Error)
      // node v0.11 adds `code` param to this error
      // and uses a user-friendly `message`
      // continue using err.message for v0.8 and v0.10
      assert.equal(err.code || err.message, 'DEPTH_ZERO_SELF_SIGNED_CERT')
      done()
    })
  })

  it('self-signed certificate with sslStrict false', function (done) {
    var opts = clone(config)
    opts.ssl = true
    opts.sslStrict = false
    getInfo(opts, function (err, info) {
      assert.ifError(err)
      assert.ok(info)
      done()
    })
  })

  it('self-signed certificate with sslStrict and CA specified', function (done) {
    var opts = clone(config)
    opts.ssl = true
    opts.sslCa = fs.readFileSync(__dirname + '/testnet-box/1/regtest/server.cert')
    getInfo(opts, function (err, info) {
      assert.ifError(err)
      assert.ok(info)
      done()
    })
  })
})
