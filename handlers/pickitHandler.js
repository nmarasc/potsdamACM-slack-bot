var util = require('../util.js').util;

module.exports = function pickitHandler(ops){
  var result = {};
  var roll = util.doRoll(ops.length,1)[0];
  result["message"] = "I choose: " + ops[roll-1];
  return result;
}
