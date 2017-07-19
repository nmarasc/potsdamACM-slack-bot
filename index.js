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
});

rtm.start();

// Message event handler
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  //console.log(message.text);

  //ignore non messages with no text
  if(typeof message.text === 'undefined') return;
 
  var processed_msg = processMessage(message.text);
  var bot_msg;
  
  switch(processed_msg.type){
    
    case 0: // HI command
      bot_msg = "I'm a Bender. I bend girders. :partyparrot:";
      postMessage(message.user, bot_msg, message.channel);
      break;
    
    case 1: // ROLL command
      var roll_result = handleRollCommand(processed_msg.die);
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
      break;

    default:
     if(typeof processed_msg.message !== 'undefined'){
        postMessage(message.user, processed_msg.message, message.channel);
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
//   object tailored to commands
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
  else if(msg[0].includes(bot_id) && msg.length > 1){
    console.log("\nMention detected, checking for command..");
    
    // ROLL command
    if(msg[1].toUpperCase() === "ROLL" && msg.length > 2){
      console.log("Processing ROLL command...");
      
      var die;
      
      // get die value to roll
      if(msg[2].toUpperCase().startsWith("D")){ 
        die = parseInt(msg[2].substring(1)); 
      }
      else{ 
        die = parseInt(msg[2]);
      }
      
      // check for valid roll
      if(isNaN(die) || die < 2){
        console.log("Not a valid roll: " + msg[2]);
        result["type"] = -1;
        result["message"] = msg[2] + " is not a valid roll.";
      }
      else{
        console.log("Die to roll: " + die);
        result["type"] = 1;
        result["die"] = die;
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

    // BET command (does nothing right now)
    else if(msg[1].toUpperCase() === "BET" && msg.length > 3){
      console.log("Processing BET command...");i
      result["type"] = -1;
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
//   die - upper bound on roll
//   times - number of times to roll (default 1)
// returns:
//   result of roll(s)
function handleRollCommand(die, times = 1){
  var result = {};
  var rolls = "";
  for(let i = 0; i < times; i++){
    // Yes, there's an extra space at the beginning. Sue me.
    rolls += " ";
    rolls += Math.floor(Math.random() * die) + 1; 
  }

  result["message"] = "You rolled:" + rolls;

  // special emote mode
  if(times === 1){
    console.log("roll: " + rolls);
    var roll = parseInt(rolls.trim());
    if(roll === 1){
      result.message += " :hyperbleh:";
    }
    else if(roll === die){
      result.message += " :partyparrot:";
    }
    else if(roll <= die/2){
      result.message += " :bleh:";
    }
    else{
      result.message += " :ok_hand:";
    }
  }

  return result;
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

// make sending messages more simple
// params:
//  user - user to notify
//  message - message to notify with
//  channel - where to post
// returns: nothing
function postMessage(user, message, channel){
  rtm.sendMessage("<@" + user + "> " + message, channel);
}
