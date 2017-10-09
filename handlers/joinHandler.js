var util = require('../util.js').util;

// handle join command
// params:
//   user - user joining
//   channel - channel joining from
// returns: resulting message object
module.exports = function joinHandler(user, channel, opts){
  var result = {};
  var channel_ids = opts.channel_ids;
  var bank = opts.bank;

  if(channel !== channel_ids.gamblers && channel !== channel_ids.bender_dev){
    result["message"] = "Cannot join. Please keep gambling content to " +
                        "<#" + channel_ids.gamblers + ">";
  }
  else{
    console.log("Attemping to add " + user + " to bank..");
    if(bank.hasOwnProperty(user)){
      result["message"] = "You are already registered.\n" +
                          "You currently have: " + bank[user] + " scrumbux";

      console.log("User " + user + " already exists");
    }
    else{
      bank[user] = 100;
      result["message"] = "You have been registered.\n" +
                          "You currently have: " + bank[user] + " scrumbux";

      console.log("User " + user + " has successfully joined bank");
    }
  }
  return result;
}
