# node-bitcoin changelog

## v2.0.1 (2014/01/08)
* default `host` to 'localhost'; `port` to '8332'

## v2.0.0 (2013/10/14)
* remove deprecated commands
  * `getMemoryPool`
  * `getMemorypool`
* remove deprecated functionality
  * creating `bitcoin.Client` with more than one argument

## v1.7.0 (2013/05/05)
* add missing commands from bitcoind v0.7.0
  * `createMultiSig`
  * `getBlockTemplate`
  * `getTxOut`
  * `getTxOutSetInfo`
  * `listAddressGroupings`
  * `submitBlock`
* deprecate commands
  * `getMemoryPool`
  * `getMemorypool`

## v1.6.2 (2013/03/21)
* shrink package size via .npmignore

## v1.6.1 (2013/03/13)
* add node v0.10.x support (rejectUnauthorized defaults to true in 0.10.x)

## v1.6.0 (2013/03/08)
* drop node v0.6.x support
* change test runner from `vows` to `mocha`
* upgrade testnet-box
* add commands for bitcoind v0.8.0
  * `addNode`
  * `getAddedNodeInfo`
  * `listLockUnspent`
  * `lockUnspent`
* deprecate creating `bitcoin.Client` with more than one argument
* add SSL support

## v1.5.0 (2012/10/22)
* remove `getBlockNumber` test
* upgrade testnet-box
* add RPC call batching (multiple RPC calls within one HTTP request)

## v1.4.0 (2012/09/09)
* add commands for bitcoind v0.7.0
  * `createRawTransaction`
  * `decodeRawTransaction`
  * `getPeerInfo`
  * `getRawMemPool`
  * `getRawTransaction`
  * `listUnspent`
  * `sendRawTransaction`
  * `signRawTransaction`
* remove deprecated `getBlockNumber`

## v1.3.1 (2012/08/19)
Remove `underscore` dependency

## v1.3.0 (2012/07/03)
Change use of http.createClient() (deprecated in node v0.8.x) to http.request()

## v1.2.2 (2012/04/26)
Fix callback being called twice when a client and request error
occur on the same command call.

## v1.2.1 (2012/04/26)
* add missing `getBlock` command

## v1.2.0 (2012/04/25)
* submodule testnet-box for running tests
* err objects should all now be an instance of Error

## v1.1.6 (2012/04/11)
* add commands for bitcoind v0.6.0
  * `addMultiSigAddress` (only available in testnet)
  * `dumpPrivKey`
  * `getBlockHash`
  * `getMiningInfo`
  * `importPrivKey`
