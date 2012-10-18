var util = require('util');
var http = require('http');
var METHOD_NOT_ALLOWED = "Method Not Allowed\n";
var INVALID_REQUEST = "Invalid Request\n";


//===----------------------------------------------------------------------===//
// Server Client
//===----------------------------------------------------------------------===//
var Client = function(port, host, user, password) {
  this.port = port;
  this.host = host;
  this.user = user;
  this.password = password;

  this.call = function(method, params, callback, errback, path) {
    
    var time = Date.now();
    var requestJSON;
    
    if (Array.isArray(method)) {
      // multiple rpc batch call
      requestJSON = [];
      method.forEach(function(batchCall, i) {
        requestJSON.push({
          id: time + '-' + i,
          method: batchCall.method,
          params: batchCall.params
        });
      });
    } else {
      // single rpc call
      requestJSON = {
        id: time,
        method: method,
        params: params
      };
    }

    // First we encode the request into JSON
    var requestJSON = JSON.stringify(requestJSON);

    // prepare request options
    var requestOptions = {
      host: host,
      port: port,
      method: 'POST',
      path: path || '/',
      headers: {
        'Host': host,
        'Content-Length': requestJSON.length
      }
    };
    
    // use HTTP auth if user and password set
    if (user && password) {
      requestOptions.auth = this.user + ':' + this.password;
    }
    
    // Now we'll make a request to the server
    var request = http.request(requestOptions);
    
    request.on('error', errback);

    request.on('response', function(response) {
      // We need to buffer the response chunks in a nonblocking way.
      var buffer = '';
      response.on('data', function(chunk) {
        buffer = buffer + chunk;
      });
      // When all the responses are finished, we decode the JSON and
      // depending on whether it's got a result or an error, we call
      // emitSuccess or emitError on the promise.
      response.on('end', function() {
        var err;
        
        try {
          var decoded = JSON.parse(buffer);
        } catch (e) {
          if (response.statusCode !== 200) {
            err = new Error('Invalid params, response status code: ' + response.statusCode);
            err.code = -32602;
            errback(err);
          } else {
            err = new Error('Problem parsing JSON response from server');
            err.code = -32603;
            errback(err);
          }
          return;
        }
        
        if (!Array.isArray(decoded)) {
          decoded = [decoded];
        }
        
        // iterate over each response, normally there will be just one
        // unless a batch rpc call response is being processed
        decoded.forEach(function(decodedResponse, i) {
          if (decodedResponse.hasOwnProperty('error') && decodedResponse.error != null) {
            if (errback) {
              err = new Error(decodedResponse.error.message || '');
              if (decodedResponse.error.code) {
                err.code = decodedResponse.error.code;
              }
              errback(err);
            }
          } else if (decodedResponse.hasOwnProperty('result')) {
            if (callback) {
              callback(decodedResponse.result);
            }
          } else {
            if (errback) {
              err = new Error(decodedResponse.error.message || '');
              if (decodedResponse.error.code) {
                err.code = decodedResponse.error.code;
              }
              errback(err);
            }
          }
        });
        
      });
    });
    request.end(requestJSON);
  };
}

//===----------------------------------------------------------------------===//
// Server
//===----------------------------------------------------------------------===//
function Server() {
  var self = this;
  this.functions = {};
  this.server = http.createServer(function(req, res) {
    Server.trace('<--', 'accepted request');
    if(req.method === 'POST') {
      self.handlePOST(req, res);
    }
    else {
      Server.handleNonPOST(req, res);
    }
  });
}


//===----------------------------------------------------------------------===//
// exposeModule
//===----------------------------------------------------------------------===//
Server.prototype.exposeModule = function(mod, object) {
  var funcs = [];
  for(var funcName in object) {
    var funcObj = object[funcName];
    if(typeof(funcObj) == 'function') {
      this.functions[mod + '.' + funcName] = funcObj;
      funcs.push(funcName);
    }
  }
  Server.trace('***', 'exposing module: ' + mod + ' [funs: ' + funcs.join(', ')
                + ']');
  return object;
}


//===----------------------------------------------------------------------===//
// expose
//===----------------------------------------------------------------------===//
Server.prototype.expose = function(name, func) {
  Server.trace('***', 'exposing: ' + name);
  this.functions[name] = func;
}


//===----------------------------------------------------------------------===//
// trace
//===----------------------------------------------------------------------===//
Server.trace = function(direction, message) {
  util.puts('   ' + direction + '   ' + message);
}


//===----------------------------------------------------------------------===//
// listen
//===----------------------------------------------------------------------===//
Server.prototype.listen = function(port, host) {
  this.server.listen(port, host);
  Server.trace('***', 'Server listening on http://' + (host || '127.0.0.1') +
                ':' + port + '/');
}


//===----------------------------------------------------------------------===//
// handleInvalidRequest
//===----------------------------------------------------------------------===//
Server.handleInvalidRequest = function(req, res) {
  res.writeHead(400, {'Content-Type': 'text/plain',
                      'Content-Length': INVALID_REQUEST.length});
  res.write(INVALID_REQUEST);
  res.end();
}


//===----------------------------------------------------------------------===//
// handlePOST
//===----------------------------------------------------------------------===//
Server.prototype.handlePOST = function(req, res) {
  var buffer = '';
  var self = this;
  var handle = function (buf) {
    var decoded = JSON.parse(buf);

    // Check for the required fields, and if they aren't there, then
    // dispatch to the handleInvalidRequest function.
    if(!(decoded.method && decoded.params)) {
      return Server.handleInvalidRequest(req, res);
    }

    if(!self.functions.hasOwnProperty(decoded.method)) {
      return Server.handleInvalidRequest(req, res);
    }

    // Build our success handler
    var onSuccess = function(funcResp) {
      Server.trace('-->', 'response (id ' + decoded.id + '): ' +
                    JSON.stringify(funcResp));

      var encoded = JSON.stringify({
        'result': funcResp,
        'error': null,
        'id': decoded.id
      });

      res.writeHead(200, {'Content-Type': 'application/json',
                          'Content-Length': encoded.length});
      res.write(encoded);
      res.end();
    };

    // Build our failure handler (note that error must not be null)
    var onFailure = function(failure) {
      Server.trace('-->', 'failure: ' + JSON.stringify(failure));
      var encoded = JSON.stringify({
        'result': null,
        'error': failure || 'Unspecified Failure',
        'id': decoded.id
      });
      res.writeHead(200, {'Content-Type': 'application/json',
                          'Content-Length': encoded.length});
      res.write(encoded);
      res.end();
    };

    Server.trace('<--', 'request (id ' + decoded.id + '): ' +
                  decoded.method + '(' + decoded.params.join(', ') + ')');

    // Try to call the method, but intercept errors and call our
    // onFailure handler.
    var method = self.functions[decoded.method];
    var args = decoded.params.unshift(function(resp) {
      onSuccess(resp);
    });

    try {
      method.apply(null, decoded.params);
    }
    catch(err) {
      return onFailure(err);
    }

  } // function handle(buf)

  req.addListener('data', function(chunk) {
    buffer = buffer + chunk;
  });

  req.addListener('end', function() {
    handle(buffer);
  });
}


//===----------------------------------------------------------------------===//
// handleNonPOST
//===----------------------------------------------------------------------===//
Server.handleNonPOST = function(req, res) {
  res.writeHead(405, {'Content-Type': 'text/plain',
                      'Content-Length': METHOD_NOT_ALLOWED.length,
                      'Allow': 'POST'});
  res.write(METHOD_NOT_ALLOWED);
  res.end();
}


module.exports.Server = Server;
module.exports.Client = Client;
