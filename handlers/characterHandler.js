var util = require('../util.js').util;

/**
 * Handles character commands
 * @returns {Object} - object containing the message to report
 */
module.exports = function characterHandler(){
  var result = {};
  var rolls = "";
  var stats = [];
  var drop = 0;
  var roll_msg = "";

  for(var i = 0; i < 6; i++){
    var rolls = util.doRoll(6,4);
    roll_msg += "\n\nYou rolled: " + rolls.join(", ");

    drop = Math.min(...rolls);
    roll_msg += "\nDropping " + drop + ", ";
    rolls[rolls.indexOf(drop)] = 0;

    var total = rolls.reduce(function(a, b){ return a+b; },0);
    roll_msg += "Total: " + total;
    stats[i] = total;
  }

  roll_msg += "\n\nYour stats are: " + stats.join(", ");

  result["message"] = roll_msg;

  return result;
}
