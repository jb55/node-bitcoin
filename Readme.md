# node-bitcoin

[![Build Status](https://secure.travis-ci.org/freewil/node-bitcoin.png)](https://secure.travis-ci.org/freewil/node-bitcoin)

node-bitcoin is a simple wrapper for the Bitcoin client's JSON-RPC API.

The API is equivalent to the API document [here](https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_Calls_list).
The methods are exposed as lower camelcase methods on the `bitcoin.Client`
object, or you may call the API directly using the `cmd` method.

## Install

`npm install bitcoin`

## Setup

1. Traverse to `~/.bitcoin` or `~/Library/Application Support/Bitcoin` and add a
file called `bitcoin.conf` if it doesn't already exist.

2. Add these lines to the file:

    rpcuser=username

    rpcpassword=password

You will use these to login to the server.

3. Start your Bitcoin client with the `-server` argument or run `bitcoind`

4. You should now be able to communicate with Bitcoin JSON-RPC API using the
node-bitcoin library, try it out!

## Examples

### Create client
```js
var bitcoin = require('bitcoin');
var client = new bitcoin.Client('localhost', 8332, 'username', 'password');
```

### Create client with single object
```js
var client = new bitcoin.Client({
  host: 'localhost',
  port: 8332,
  user: 'username',
  pass: 'password'
});
```

### Get balance across all accounts with minimum confirmations of 6

```js
client.getBalance('*', 6, function(err, balance) {
  if (err) return console.log(err);
  console.log('Balance:', balance);
});
```
### Getting the balance directly using `cmd`

```js
client.cmd('getbalance', '*', 6, function(err, balance){
  if (err) return console.log(err);
  console.log('Balance:', balance);
});
```

### Batch multiple RPC calls into single HTTP request

```js
var batch = [];
for (var i = 0; i < 10; ++i) {
  batch.push({
    method: 'getnewaddress',
    params: ['myaccount']
  });
}
client.cmd(batch, function(err, address) {
  if (err) return console.log(err);
  console.log('Address:', address);
});
```
