var util = require('./util.js').util;

exports.command_handler = {};

// handles roll commands
// params:
//   die_msg - die value to parse
//   times - number of times to roll (default 1)
// returns:
//   result of roll(s)
exports.command_handler.rollHandler = function rollHandler(die_msg, times = 1){
  var result = {};
  var rolls = "";
  var die;

  if(util.isInt(die_msg)){
    die = parseInt(die_msg);
  }
  else{
    die = NaN;
  }

  // check for valid roll
  if(isNaN(die) || die < 2){
    console.log("Not a valid roll: " + die_msg);
    result["message"] = die_msg + " is not a valid roll.";
    return result;
  }

  console.log("Die to roll: " + die);

  var rolls = _doRoll(die);
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

  result["message"] = roll_msg;

  return result;
}

// handle bet command
// params:
//  user - incoming user
//  channel - incoming channel
//  game_data - data object about the game
// returns: message object

// ISSUES:
//  No way to get money once you run out
//  Can go negative
//  Overflowing account
//  No emoji bets
//  No scaling of rewards with risk
exports.command_handler.betHandler = function betHandler(user, channel, opts){
  var result = {};
  var channel_ids = opts.channel_ids;
  var bank = opts.bank;
  var games = opts.games;
  var game_data = opts.game_data;

  // check valid channel
  if(channel !== channel_ids.gamblers && channel !== channel_ids.bender_dev){
    result.message = "Betting not allowed in this channel.\n" +
                     "Please keep gambling content to " +
                     "<#" + channel_ids.gamblers + ">";
    return result;
  }
  // check if user is in bank
  if(!bank.hasOwnProperty(user)){
    result.message = "You are not currently registered.\n" +
                     "Please use the JOIN command in " +
                     "<#" + channel_ids.gamblers + ">";
    return result;
  }

  var amount;
  var game;


  // parse betting amount
  if(util.isInt(game_data.amount) && parseInt(game_data.amount) > 0){
    amount = parseInt(game_data.amount);
  }
  else if(util.isMeme(game_data.amount)){
    amount = util.parseMeme(game_data.amount);
  }
  else{
    result.message = game_data.amount + " is not a valid betting amount";
    return result;
  }

  // check game type
  game = games.indexOf(game_data.game.toUpperCase());
  switch(game){

    case 0 : // COIN game
      if(typeof game_data.ops.op1 === 'undefined'){ game_data.ops.op1 = ""; }
      var win_val = game_data.ops.op1.toUpperCase();
      //console.log("Win: " + win_val);
      if(win_val === "HEADS" || win_val === "H"){
        win_val = 1;
      }
      else if(win_val === "TAILS" || win_val === "T"){
        win_val = 2;
      }
      else{
        result.message = game_data.ops.op1 + " is not a valid option for COIN game";
        return result;
      }

      if(amount <= bank[user]){
        bank[user] -= amount;
        var roll = _doRoll(2)[0];
        result.message = "You got: ";
        if(roll === 1){ result.message += "HEADS\n"; }
        else{ result.message += "TAILS\n"; }

        if(roll === win_val){
          result.message += "You win! You've earned " + (amount*2) + " scrumbux!";
          bank[user] += amount*2;
        }
        else{
          result.message += "You lost. You're down " + amount + " scrumbux.";
          // quick and dirty fix for negative amounts, long term solution later
          if(bank[user] < 1){ bank[user] = 1; }
        }
      }
      else{
        result.message = "You do not have enough scrumbux to bet that amount\n" +
                         "You currently have " + bank[user] + " scrumbux";
      }
      break;

    case 1 : // ROLL game
      break;

    default :
      result.message = game_data.game + " is not a recognized game type";
      return result;
  }

  return result;
}

// handle join command
// params:
//   user - user joining
//   channel - channel joining from
// returns: resulting message object
exports.command_handler.joinHandler = function joinHandler(user, channel, opts){
  var result = {};
  var channel_ids = opts.channel_ids;
  var bank = opts.bank;

  if(channel !== channel_ids.gamblers && channel !== channel_ids.bender_dev){
    result["message"] = "User not added. Please keep gambling content to " +
                        "<#" + gamblers + ">";
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
    return result;
  }
}

// handle checkbux command
// params:
//   user - user checking
// returns: resulting message object
exports.command_handler.checkbuxHandler = function checkbuxHandler(user, opts){
  var result = {};
  var channel_ids = opts.channel_ids;
  var bank = opts.bank;

  if(bank.hasOwnProperty(user)){
    result["message"] = "You currently have: " + bank[user] + " scrumbux";
  }
  else{
    result["message"] = "You are not currently registered.\n" +
                        "Please use the JOIN command in " +
                        "<#" + channel_ids.gamblers + ">";
  }

  return result;
}

// handle help command
// params:
//  command - command to get details of
// returns: message object
exports.command_handler.helpHandler = function helpHandler(command){
  result = {};
  if(typeof command !== 'undefined'){
    result["message"] = "No, it's not finished. Go away. :bleh:";
  }
  else{
    result["message"] = "Bite my shiny metal ass";
  }
  return result;
}

// do the rolls
// params:
//   die - upper bound on roll
//   times - number of rolls
// returns: rolls
function _doRoll(die, times = 1){

  var rolls = [];

  for(let i = 0; i < times; i++){
    rolls[i] = Math.floor(Math.random() * die) + 1;
  }

  return rolls;
}
