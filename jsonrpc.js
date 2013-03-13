var http = require('http'),
    https = require('https');

var Client = function(port, host, user, password, ssl, sslStrict, sslCa) {
  this.port = port;
  this.host = host;
  this.user = user;
  this.password = password;
  
  this.ssl = ssl ? true : false;
  this.sslStrict = sslStrict ? true : false;
  this.http = this.ssl ? https : http;
  this.sslCa = sslCa;
};

Client.prototype.call = function(method, params, callback, errback, path) {
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
    host: this.host,
    port: this.port,
    method: 'POST',
    path: path || '/',
    headers: {
      'Host': this.host,
      'Content-Length': requestJSON.length
    },
    agent: false,
    rejectUnauthorized: this.ssl && this.sslStrict
  };
  
  if (this.ssl && this.sslCa) {
    requestOptions.ca = this.sslCa;
  }
    
  // use HTTP auth if user and password set
  if (this.user && this.password) {
    requestOptions.auth = this.user + ':' + this.password;
  }
    
  // Now we'll make a request to the server
  var request = this.http.request(requestOptions);
    
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

module.exports.Client = Client;
