var util = require('../util.js').util;

module.exports = function pickitHandler(ops){
  var result = {};

  if(ops.length < 2 || ops.length > 20){
    result["message"] = "Must pick between 2 and 20 things";
    return result;
  }

  var roll = util.doRoll(ops.length,1)[0];
  result["message"] = "I choose: " + ops[roll-1];
  return result;
}
