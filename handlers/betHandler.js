var util = require('../util.js').util;

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
module.exports = function betHandler(user, channel, opts){
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
        var roll = util.doRoll(2,1)[0];
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
        var roll = util.doRoll(die,1)[0];
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
