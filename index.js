var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

// bot token excluded from public repository for safety reasons
var bot_token = process.env.SLACK_BOT_TOKEN || '';
console.log("Token connected with: " + bot_token);

// create clients to make api calls
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);

// channel ids
var channel_ids = {};
// keeps track of scrumbux and people registered
var game = {};
// id for the bot
var bot_id;

// Successfully authenticated
// Get bot id and the ids of channels bot is a member of
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  bot_id = rtmStartData.self.id;
  console.log("Name/ID: " + bot_id);

  for (const c of rtmStartData.channels) {
    if (c.is_member){
      console.log("Member of channel: " + c.name);
      channel_ids[c.name] = c.id;
      //console.log(channel_ids[c.name]);
    }
  }
  console.log("Logged in as " + rtmStartData.self.name +
              " of team " + rtmStartData.team.name +
              ", but not yet connected to channel");
});

// Successfully connected to RTM
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
  console.log("RTM connection opened successfully\n\n");
  rtm.sendMessage("Bender has successfully connected",channel_ids.bender_dev);
});

rtm.start();

// Message event handler
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  //console.log(message.text);

  //ignore non messages with no text
  if(typeof message.text === 'undefined') return;

  var new_msg = processMessage(message.text);
  var bot_msg;

  switch(new_msg.type){

    case 0: // HI command
      bot_msg = "I'm a Bender. I bend girders. :partyparrot:";
      postMessage(message.user, bot_msg, message.channel);
      break;

    case 1: // ROLL command
      var roll_result = handleRollCommand(new_msg.die);
      bot_msg = roll_result.message;
      postMessage(message.user, bot_msg, message.channel);
      break;

    case 2: // JOIN command
      var join_result = handleJoinCommand(message.user, message.channel);
      bot_msg = join_result.message;
      postMessage(message.user, bot_msg, message.channel);
      break;

    case 3: // CHECKBUX command
      var checkbux_result = handleCheckbuxCommand(message.user);
      bot_msg = checkbux_result.message;
      postMessage(message.user, bot_msg, message.channel);
      break;

    case 4: // HELP command
      //var help_result = handleHelpCommand();
      bot_msg = "Bite my shiny metal ass";
      postMessage(message.user, bot_msg, message.channel);
      break;

    case 5: // BET command
      var bet_result = handleBetCommand(message.user, message.channel,
                                        new_msg.game_data);
      break;

    default:
     if(typeof new_msg.message !== 'undefined'){
        postMessage(message.user, new_msg.message, message.channel);
      }
      return;
  }
});

// reaction added handler (doesn't do messages for some godforsaken reason)
rtm.on(RTM_EVENTS.REACTION_ADDED, function handleReactionAdded(evnt) {
  console.log("\n" + evnt.reaction + " added to " +
	                   evnt.item.type + " by " +
	                   evnt.user);
  //console.log(evnt.item);

  var item = {
    file         : evnt.item.file,
    file_comment : evnt.item.file_comment,
    channel      : evnt.item.channel,
    ts           : evnt.item.ts};

  //console.log("channel: " + item.channel + "\nts: " + item.ts);
  //console.log(item);

  web.reactions.add(evnt.reaction,item, function handleAdd(err,res){
    if(err){ console.log("There was an error, no reaction added"); }
    else{ console.log("Posted successfully"); }
  });
});

// processes incoming message into command handled objects
// params:
//   msg - incoming message
// returns:
//   object tailored to command
function processMessage(msg){
  var result = {};
  msg = msg.split(" ");

  // Legacy "HI" command
  if(msg[0].toUpperCase() === "HI" && msg.length > 1){
    if(msg[1].toUpperCase() === "BENDER" || msg[1].includes(bot_id)) {
      result["type"] = 0;
    }
  }

  // Start checking for real commands
  else if((msg[0].includes(bot_id) || msg[0].toUpperCase() === ":B:") &&
           msg.length > 1){
    console.log("\nMention detected, checking for command..");

    // ROLL command
    if((msg[1].toUpperCase() === "ROLL" || msg[1].toUpperCase() === ":GAME_DIE:") &&
        msg.length > 2){
      console.log("Processing ROLL command...");
      result["type"] = 1;

      // Here lies Adam's case and unreasonable requests
      if(msg[2] === ":100:"){
        result["die"] = "100";
      }
      // Here lied Jarred's case and unreasonable requests
      else if(msg[2].toUpperCase() === ":HERB:"){
        result["die"] = "420";
      }
      // trim d off roll if it exists
      else if(msg[2].toUpperCase().startsWith("D")){
        result["die"] = msg[2].toUpperCase().substring(1);
      }
      // otherwise we good
      else{
        result["die"] = msg[2];
      }
    }

    // JOIN command
    else if(msg[1].toUpperCase() === "JOIN"){
      console.log("Processing JOIN command...");
      result["type"] = 2;
    }

    // CHECKBUX command
    else if(msg[1].toUpperCase() === "CHECKBUX"){
      console.log("Processing CHECKBUX command...");
      result["type"] = 3;
    }

    // HELP command
    else if(msg[1].toUpperCase() === "HELP"){
      console.log("Processing HELP command...");
      result["type"] = 4;
    }

    // BET command
    else if(msg[1].toUpperCase() === "BET" && msg.length > 3){
      console.log("Processing BET command...");
      result["type"] = 5;
      result["game_data"] = {};
      result.game_data["amount"] = msg[2];
      result.game_data["game"] = msg[3];
      result.game_data["ops"] = {};
      for(let i = 4; i < msg.length; i++){
        result.game_data.ops[("op" + (i-3))] = msg[i];
      }

    }

  }
  // Not a command or anything bot cares about
  else{
    result["type"] = -1;
  }

  return result;

}



// handles roll commands
// params:
//   die_msg - die value to parse
//   times - number of times to roll (default 1)
// returns:
//   result of roll(s)
function handleRollCommand(die_msg, times = 1){
  var result = {};
  var rolls = "";
  var die;

  if(isInt(die_msg)){
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

  result["message"] = doRoll(die);

  return result;
}

// do the rolls
// params:
//   die - upper bound on roll
//   times - number of rolls
// returns: rolls message
function doRoll(die, times = 1){

  var rolls = [];

  for(let i = 0; i < times; i++){
    rolls[i] = Math.floor(Math.random() * die) + 1;
  }

  roll_msg = "You rolled: " + rolls.join(", ");

  // special emote mode
  if(times === 1){
    console.log("Roll: " + rolls);
    var roll = parseInt(rolls[0]);
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
  return roll_msg;
}

// handle join command
// params:
//   user - user joining
//   channel - channel joining from
// returns: resulting message object
function handleJoinCommand(user, channel){
  var result = {};

  if(channel !== channel_ids.gamblers && channel !== channel_ids.bender_dev){
    result["message"] = "User not added. Please keep gambling content to " +
                        "<#" + gamblers + ">";
  }
  else{
    console.log("Attemping to add " + user + " to game..");
    if(game.hasOwnProperty(user)){
      result["message"] = "You are already registered.\n" +
                          "You currently have: " + game[user] + " scrumbux";

      console.log("User " + user + " already exists");
    }
    else{
      game[user] = 100;
      result["message"] = "You have been registered.\n" +
                          "You currently have: " + game[user] + " scrumbux";

      console.log("User " + user + " has successfully joined game");
    }
    return result;
  }
}

// handle checkbux command
// params:
//   user - user checking
// returns: resulting message object
function handleCheckbuxCommand(user){
  var result = {};

  if(game.hasOwnProperty(user)){
    result["message"] = "You currently have: " + game[user] + " scrumbux";
  }
  else{
    result["message"] = "You are not currently registered.\n" +
                        "Please use the JOIN command in " +
                        "<#" + channel_ids.gamblers + ">";
  }

  return result;
}

// handle help command
// params: none
// returns: message object
function handleHelpCommand(){
  return {};
}

// handle bet command
// params:
//  user - incoming user
//  channel - incoming channel
//  game_data - data object about the game
// returns: message object
function handleBetCommand(user, channel, game_data){
  var result = {};
  return result;
}

// check for numeric values
// params: n - value to check
// returns: true if numeric, false otherwise
function isNumeric(n){
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// check for integer value
// params: n - value to check
// returns true if int, false otherwise
function isInt(n){
  return isNumeric(n) && (parseFloat(n) === parseInt(n));
}

// make sending messages more simple
// params:
//  user - user to notify
//  message - message to notify with
//  channel - where to post
// returns: nothing
function postMessage(user, message, channel){
  rtm.sendMessage("<@" + user + "> " + message, channel);
}
