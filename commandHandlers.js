var util = require('./util.js').util;

exports.command_handler = {};

/**
 * Handles roll commands
 * @param {String} die_msg - message containing the value to roll
 * @param {String} times_msg - message containing the number of times to roll
 * @returns {Object} - object containing the message to report
 */
exports.command_handler.rollHandler = function rollHandler(die_msg, times_msg){
  var result = {};
  var rolls = "";
  var die;

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
  if(isNaN(times) || times < 1 || times > 10){
    console.log("Not a valid times: " + times_msg);
    result["message"] = times_msg + " is not a valid number of rolls.\n" +
                                    "Must be a number between 1 and 10";
    return result;
  }

  console.log("Die to roll: " + die);

  var rolls = _doRoll(die,times);
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

// handle bet command
// params:
//  user - incoming user
//  channel - incoming channel
//  game_data - data object about the game
// returns: message object

// ISSUES:
//  Overflowing account
//  No scaling of rewards with risk
/**
 * Handle bet command
 * @param {String} user - incoming user
 * @param {String} channel - incoming channel
 */
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
        var roll = _doRoll(2,1)[0];
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
      if(typeof game_data.ops.op1 === 'undefined'){ game_data.ops.op1 = "";}
      if(typeof game_data.ops.op2 === 'undefined'){ game_data.ops.op2 = "";}

      var die;
      var win_val;
      // check for valid die
      if(util.isInt(game_data.ops.op1)){
        die = parseInt(game_data.ops.op1);
      }
      else if(util.isMeme(game_data.ops.op1)){
        die = util.parseMeme(game_data.ops.op1);
      }
      else{
        result.message = game_data.ops.op1 + " is not a valid die";
        return result;
      }

      // check for valid win value
      if(util.isInt(game_data.ops.op2)){
        win_val = parseInt(game_data.ops.op2);
      }
      else if(util.isMeme(game_data.ops.op2)){
        win_val = util.parseMeme(game_data.ops.op2);
      }
      else{
        result.message = game_data.ops.op2 + " is not a valid minimum win value";
        return result;
      }

      // check for "fairness"
      if(win_val < (die/2)){
        result.message = "Odds must not be in your favor, cheater :hyperbleh:";
        return result;
      }

      // think we can play now
      if(amount <= bank[user]){
        bank[user] -= amount;
        var roll = _doRoll(die,1)[0];
        result.message = "You got: " + roll + "\n";
        if(roll >= win_val){ // win
          result.message += "You win! You\'ve earned " + (amount*2) + " scrumbux!";
          bank[user] += (amount*2);
        }
        else{ // lose
          result.message += "You lost. You\'re down " + amount + " scrumbux";
          if(bank[user] < 1){ bank[user] = 1; }
        }
      }
      else{
        result.message = "You do not have enough scrumbux to bet that amount\n" +
                         "You currently have " + bank[user] + " scrumbux";
      }

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

// handle checkbux command
// params:
//   user - user checking
// returns: resulting message object
exports.command_handler.checkbuxHandler = function checkbuxHandler(user, opts){
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

// handle coin command
exports.command_handler.coinHandler = function coinHandler(){
  var result = {};
  result["message"] = "You got: ";
  var roll = _doRoll(2,1)[0];
  result["message"] += roll === 1 ? "HEADS" : "TAILS";
  return result;
}

// handle 8ball command
exports.command_handler.eightballHandler = function eightballHandler(){
  var result = {};
  var roll = _doRoll(20,1)[0];
  result["message"] = util.eightball_msg[roll-1];
  return result;
}

// handle fortune command
exports.command_handler.fortuneHandler = function fortuneHandler(){
  var result = {};
  var roll = _doRoll(util.quotes.length,1)[0];
  result["message"] = util.quotes[roll-1] + "...in bed";
  return result;
}

// handle help command
// params:
//  command - command to get details of
// returns: message object
exports.command_handler.helpHandler = function helpHandler(command, sub_command,
                                                           opts){
  var result = {};
  var commands = opts.commands;
  var games = opts.games;
  var channel_ids = opts.channel_ids;
  var bot_id = opts.bot_id;

  if(typeof command === 'undefined'){
    result["message"] = "Bite my shiny metal ass";
    return result;
  }

  var index = commands.indexOf(command.toUpperCase());
  switch(index){

    case 0 : // ROLL
      result["message"] = "To use ROLL command:\n" +
                          "<@" + bot_id + "> ROLL ( [d]X | YdX )\n" +
                          "Where X is <die-size> and Y is <num-of-dice>";
      break;

    case 1 : // JOIN
      result["message"] = "To use JOIN command:\n" +
                          "<@" + bot_id + "> JOIN\n" +
                          "Only available in <#" + channel_ids.gamblers + ">";
      break;

    case 2 : // CHECKBUX
      result["message"] = "To use CHECKBUX command:\n" +
                          "<@" + bot_id + "> CHECKBUX [<user>]";
      break;

    case 3 : // HELP
      result["message"] = "Get out of here, smartass";
      break;

    case 4 : // BET
      if(typeof sub_command === 'undefined'){
        result["message"] = "To use BET command:\n" +
                            "<@" + bot_id + "> BET " +
                            "<amount> <game-type> <game-options>\n" +
                            "Only available in <#" + channel_ids.gamblers + ">\n" +
                            "Use HELP BET <game-type> for options";
      }
      else{
        switch(games.indexOf(sub_command.toUpperCase())){

          case 0 : // COIN
            result["message"] = "Options for COIN game:\n" +
                                "  Op1 : HEADS/TAILS";
            break;

          case 1 : // ROLL
            result["message"] = "Options for ROLL game:\n" +
                                "  Op1 : <die-size>\n" +
                                "  Op2 : <min-win-value>\n";
            break;

          default: // Unknown game
            result["message"] = sub_command + " is not a recognized game type";
            break;
        }
      }

      break;

    case 5 : // COMMANDS
      result["message"] = "To use COMMANDS command:\n" +
                          "<@" + bot_id + "> COMMANDS\n" +
                          "C\'mon, it\'s not that hard";
      break;

    case 6 : // COIN
      result["message"] = "To use COIN command:\n" +
                          "<@" + bot_id + "> COIN\n" +
                          "C\'mon, it\'s not that hard";
      break;

    case 7 : // 8BALL
      result["message"] = "To use 8BALL command:\n" +
                          "<@" + bot_id + "> 8BALL\n";
      break;

    default : // Unknown command
      result["message"] = command + " is not a recognized command";
      break;
  }
  return result;
}

// do the rolls
// params:
//   die - upper bound on roll
//   times - number of rolls
// returns: rolls
function _doRoll(die, times){
  console.log("Rolling " + die + " " + times + " times");

  var rolls = [];

  for(let i = 0; i < times; i++){
    rolls[i] = Math.floor(Math.random() * die) + 1;
  }

  console.log("Results: " + rolls);

  return rolls;
}
