var assert = require('assert'),
    bitcoin = require('../'),
    config = require('./config'),
    commands = require('../lib/commands');
    
describe('Client Commands', function() {
  
  it('should have all the commands listed by `help`', function(done) {
    var client = new bitcoin.Client(config);
    var commandRegex = /^([a-z]+)/;
    
    // get the list of all the commands
    client.cmd('help', function(err, commandList) {
      assert.ifError(err);
      
      // split up the command list by newlines
      var commandListLines = commandList.split('\n');
      commandListLines.forEach(function(commandListLine) {
        
        // get the actual name of the command from the command list line
        var result = commandRegex.exec(commandListLine);
        assert.ok(result, 'command list line failed to match regex: ' + commandListLine);
        
        // check to see if the command name is in the commands object 
        var found = false;
        for (var i in commands) {
          if (commands[i] === result[1]) {
            found = true;
            break;
          }
        }
        assert.ok(found, 'missing command found in `help`: ' + result[1]);
      });
      
      done();
    });
  });
  
});
