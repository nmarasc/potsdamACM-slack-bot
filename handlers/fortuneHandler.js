var util = require('../util.js').util;

// handle fortune command
module.exports = function fortuneHandler(){
  var result = {};
  var roll = util.doRoll(util.quotes.length,1)[0];
  result["message"] = util.quotes[roll-1] + "..in bed ";
  roll = util.doRoll(util.emotes.length,1)[0];
  result["message"] += util.emotes[roll-1];
  return result;
}
