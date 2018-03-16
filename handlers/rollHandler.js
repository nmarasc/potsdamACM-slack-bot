var util = require('../util.js').util;

/**
 * Handles roll commands
 * @param {String} die_msg - message containing the value to roll
 * @param {String} times_msg - message containing the number of times to roll
 * @returns {Object} - object containing the message to report
 */
module.exports = function rollHandler(die_msg, times_msg){
  var result = {};
  var rolls = "";
  var die;

  var today = new Date();
  if((today.getMonth() == 9 && today.getDate() == 31) ||
     (today.getDate() == 13 && today.getDay() == 5)){
    result["message"] = "You rolled: 13 :ghost:";
    return result;
  }


  // parse die value
  if(util.isInt(die_msg)){
    die = parseInt(die_msg);
  }
  else if(util.isMeme(die_msg)){
    die = util.parseMeme(die_msg);
  }
  else{
    die = NaN;
  }

  // parse times value
  if(util.isInt(times_msg)){
    times = parseInt(times_msg);
  }
  else if(util.isMeme(times_msg)){
    times = util.parseMeme(times_msg);
  }
  else{
    times = NaN;
  }

  // check for valid roll
  if(isNaN(die) || die < 2){
    console.log("Not a valid roll: " + die_msg);
    result["message"] = die_msg + " is not a valid roll.";
    return result;
  }
  if(isNaN(times) || times < 1 || times > 111){
    console.log("Not a valid times: " + times_msg);
    result["message"] = times_msg + " is not a valid number of rolls.\n" +
                                    "Must be a number between 1 and 111";
    return result;
  }

  console.log("Die to roll: " + die);

  var rolls = util.doRoll(die,times);
  var roll_msg = "You rolled: " + rolls.join(", ");

  // special emote mode
  if(times === 1){
    var roll = rolls[0];
    console.log("Roll: " + roll);
    if(roll === 1){
      roll_msg += " :hyperbleh:";
    }
    else if(roll === 420){ // meme rolls
      roll_msg += " :herb:";
    }
    else if(roll === 69){ // meme rolls
      roll_msg += " :eggplant:";
    }
    else if(roll === die){
      roll_msg += " :partyparrot:";
    }
    else if(roll <= die/2){
      roll_msg += " :bleh:";
    }
    else{
      roll_msg += " :ok_hand:";
    }
  }
  else{
    var total = rolls.reduce(function(a, b){ return a+b; },0);
    roll_msg += "\nTotal: " + total;
  }

  result["message"] = roll_msg;

  return result;
}
