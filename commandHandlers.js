var util = require('./util.js').util;

// Handler imports
var rollHandler     = require('./handlers/rollHandler.js');
var betHandler      = require('./handlers/betHandler.js');
var joinHandler     = require('./handlers/joinHandler.js');
var checkbuxHandler = require('./handlers/checkbuxHandler.js');
var coinHandler     = require('./handlers/coinHandler.js');

exports.command_handler = {};

// Adding in handlers
exports.command_handler.rollHandler     = rollHandler;
exports.command_handler.betHandler      = betHandler;
exports.command_handler.joinHandler     = joinHandler;
exports.command_handler.checkbuxHandler = checkbuxHandler;
exports.command_handler.coinHandler     = coinHandler;


// handle 8ball command
exports.command_handler.eightballHandler = function eightballHandler(){
  var result = {};
  var roll = util.doRoll(20,1)[0];
  result["message"] = util.eightball_msg[roll-1];
  return result;
}

// handle fortune command
exports.command_handler.fortuneHandler = function fortuneHandler(){
  var result = {};
  var roll = util.doRoll(util.quotes.length,1)[0];
  result["message"] = util.quotes[roll-1] + "..in bed ";
  roll = util.doRoll(util.emotes.length,1)[0];
  result["message"] += util.emotes[roll-1];
  return result;
}

//handle timer command
exports.command_handler.timerHandler = function timerHandler(time, args){
  args["message"] = "Hopefully " + time + " seconds have passed";
  return new Promise(function(resolve, reject){
    setTimeout(function() {
      resolve(args);
    }, time*1000);
  });
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

    case 8 : // FORTUNE
      result["message"] = "To use FORTUNE command:\n" +
                          "<@" + bot_id + "> FORTUNE\n";
      break;

    default : // Unknown command
      result["message"] = command + " is not a recognized command";
      break;
  }
  return result;
}


// resolve after X seconds
function _resolveAfterX(msg, time){
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(msg);
    }, time*1000);
  });
}
