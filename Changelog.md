# node-bitcoin changelog

## v1.4.0 (2012/09/09)
* New commands for bitcoin v0.7.0
  * `createRawTransaction`
  * `decodeRawTransaction`
  * `getPeerInfo`
  * `getRawMemPool`
  * `getRawTransaction`
  * `listUnspent`
  * `sendRawTransaction`
  * `signRawTransaction`
* Remove deprecated `getBlockNumber`

## v1.3.1 (2012/08/19)
Remove `underscore` dependency

## v1.3.0 (2012/07/03)
Change use of http.createClient() (deprecated in node v0.8.x) to http.request()

## v1.2.2 (2012/04/26)
Fix callback being called twice when a client and request error
occur on the same command call.

## v1.2.1 (2012/04/26)
* Add missing `getBlock` command

## v1.2.0 (2012/04/25)
* Submoduled testnet-box for running tests
* err objects should all now be an instance of Error

## v1.1.6 (2012/04/11)
* New commands for bitcoin v0.6.0
  * `addMultiSigAddress` (only available in testnet)
  * `dumpPrivKey`
  * `getBlockHash`
  * `getMiningInfo`
  * `importPrivKey`
