
# node-bitcoin

node-bitcoin is a simple wrapper for the Bitcoin client's JSON-RPC API. 

The API is equivalent to the API document [here](http://www.bitcoin.org/wiki/doku.php?id=api#methods). 
The methods are exposed as lower camelcase methods on the `bitcoin.Client` 
object.

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

## Example

    var bitcoin = require('bitcoin');
    var client = new bitcoin.Client('localhost', 8332, 'username', 'password');

    client.getBalance(function(balance) {
      console.log("Balance:", balance);
    }

