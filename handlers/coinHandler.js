var util = require('../util.js').util;

// handle coin command
module.exports = function coinHandler(){
  var result = {};
  result["message"] = "You got: ";
  var roll = util.doRoll(2,1)[0];
  result["message"] += roll === 1 ? "HEADS" : "TAILS";
  return result;
}
