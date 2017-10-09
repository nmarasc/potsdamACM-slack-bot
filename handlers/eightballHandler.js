var util = require('../util.js').util;

// handle 8ball command
module.exports = function eightballHandler(){
  var result = {};
  var roll = util.doRoll(20,1)[0];
  result["message"] = util.eightball_msg[roll-1];
  return result;
}
