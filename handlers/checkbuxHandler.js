var util = require('../util.js').util;

// handle checkbux command
// params:
//   user - user checking
// returns: resulting message object
module.exports = function checkbuxHandler(user, opts){
  var result = {};
  var channel_ids = opts.channel_ids;
  var bank = opts.bank;
  var target = opts.target;

  if(typeof target !== 'undefined'){
    if(util.validUserID(target)){
      target = target.substring(2,target.length-1);
      if(bank.hasOwnProperty(target)){
        result["message"] = "<@" + target + "> currently has " +
                             bank[target] + " scrumbux";
      }
      else{
        result["message"] = "<@" + target + "> is not currently registered.";
      }
    }
    else{
      result["message"] = target + " is not a valid user";
    }
  }
  else{
    if(bank.hasOwnProperty(user)){
      result["message"] = "You currently have " + bank[user] + " scrumbux";
    }
    else{
      result["message"] = "You are not currently registered.\n" +
                          "Please use the JOIN command in " +
                          "<#" + channel_ids.gamblers + "> to join";
    }
  }

  return result;
}
