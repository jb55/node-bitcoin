var assert = require('assert'),
    bitcoin = require('../'),
    config = require('./config'),
    commands = require('../lib/commands');
    
    
var getHelpCommands = function(client, cb) {
  var commandRegex = /^([a-z]+)/;
  client.cmd('help', function(err, commandList) {
    if (err) return cb(err);
    
    var helpCommands = [];
    
    // split up the command list by newlines
    var commandListLines = commandList.split('\n');
    var result;
    for (var i in commandListLines) {
      result = commandRegex.exec(commandListLines[i]);
      if (!result) {
        return cb(new Error('command list line failed to match regex: ' + commandListLines[i]));
      }
      helpCommands.push(result[1]);
    }
    cb(null, helpCommands);
  });
};
    
describe('Client Commands', function() {
  
  it('should have all the commands listed by `help`', function(done) {
    var client = new bitcoin.Client(config);
    getHelpCommands(client, function(err, helpCommands) {
      assert.ifError(err);
      
      for (var i in helpCommands) {
        var found = true;
        for (var j in commands) {
          if (commands[j] === helpCommands[i]) {
            found = true;
            break;
          }
        }
        assert.ok(found, 'missing command found in `help`: ' + helpCommands[i]);
      }
      
      done();
    });
  });
  
  it('should not have any commands not listed by `help`', function(done) {
    var client = new bitcoin.Client(config);
    getHelpCommands(client, function(err, helpCommands) {
      assert.ifError(err);
      
      for (var i in commands) {
        var found = false;
        for (var j in helpCommands) {
          if (commands[i] === helpCommands[j]) {
            found = true;
            break;
          }
        }
        
        // ignore commands not found in help because they are hidden
        // if the wallet isn't encrypted
        var ignore = ['walletlock', 'walletpassphrase', 'walletpassphrasechange'];
        if (~ignore.indexOf(commands[i])) {
          assert.ok(!found, 'command found in `help`: ' + commands[i]);
        } else {
          assert.ok(found, 'command not found in `help`: ' + commands[i]);
        }
      }
      
      done();
    });
  });
  
});
