var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

// bot token excluded from public repository for safety reasons
var bot_token = process.env.SLACK_BOT_TOKEN || '';
console.log("Token connected with: " + `${bot_token}`);

// create clients to make api calls
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);


// channel ids
var gamblers;
var bender_dev;
var default_channel;

var bot_id;
var game = {};

// successfully authenticated
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  bot_id = rtmStartData.self.id;
  console.log("Name/ID: " + bot_id);

  for (const c of rtmStartData.channels) {
    if (c.is_member){
      console.log("Member of channel: " + `${c.name}`);
      if (c.name === "bender_dev") {
        console.log("Setting default channel to: " + `${c.name}`);
	      default_channel = c.id;
        bender_dev = c.id;
      }
      else if(c.name === "gamblers"){
        gamblers = c.id;
      }
    }
  }
  console.log("Logged in as " + rtmStartData.self.name + 
              " of team " + rtmStartData.team.name +
              ", but not yet connected to channel");
});

// successfully connected to RTM
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
  console.log("RTM connection opened successfully\n\n");
});

rtm.start();

// Message handler
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  //console.log(message.text);

  //ignore non messages with no text
  if(typeof message.text === 'undefined') return;
  
  var msg = message.text.split(" ");
  
  // LEGACY HI COMMAND DO NOT REMOVE
  if(msg[0].toUpperCase() === "HI" && msg.length > 1){ 
    if(msg[1].toUpperCase() === "BENDER" || msg[1].includes(bot_id)) {
      rtm.sendMessage("<@" + message.user + "> " + 
                      "I\'m a Bender. I bend girders. :partyparrot:"
                      ,message.channel);
    }
  }
  
  // Start checking for real commands
  if(msg[0].includes(bot_id) && msg.length > 1){
    console.log("\nMention detected, checking for command..");
    
    // ROLL command
    if(msg[1].toUpperCase() === "ROLL" && msg.length > 2){
      console.log("Processing ROLL command...");

      var die;     
      var result;
      
      // get die value to roll
      if(msg[2].toUpperCase().startsWith("D")){ 
        die = parseInt(msg[2].substring(1)); 
      }
      else{ 
        die = parseInt(msg[2]);
      }

      if(isNaN(die) || die < 2){
        console.log("Not a valid roll: " + die);
        rtm.sendMessage("<@" + message.user + "> " + 
                        msg[2] + " is not a valid roll.",message.channel);
        return;
      }
      console.log("Die to roll: " + die);

      result = handleRollCommand(die);
      console.log("rolled: " + result.rolls);

      //value = Math.floor((Math.random() * die) + 1);
      //console.log("rolled: " + value);
      rtm.sendMessage("<@" + message.user + "> " + 
                      "You rolled:" + result.rolls, message.channel);
    }

    // JOIN command
    if(msg[1].toUpperCase() === "JOIN"){
      console.log("Processing JOIN from: " + message.channel);
      if(message.channel !== gamblers && message.channel !== bender_dev){
        rtm.sendMessage("<@" + message.user + "> User not added. " +
                        "Please keep gambling content to <#" + gamblers + ">"
                        ,message.channel);
        return;
      }
      else{ 
        console.log("Attemping to add " + message.user + " to game..");
        if(game.hasOwnProperty(message.user)){
          console.log("User " + message.user +
                      " already exists with " + game[message.user] + " scrumbux");
          rtm.sendMessage("<@" + message.user + "> You are already registered.\n" +
                          "You currently have: " + game[message.user] + " scrumbux"
                          ,message.channel);
        }
        else{
          console.log("User " + message.user +
                      " has successfully joined game");
          game[message.user] = 100;
          rtm.sendMessage("<@" + message.user + "> You have been registered.\n" +
                          "You currently have: " + game[message.user] + " scrumbux"
                          ,message.channel);
        }
      }
    }

    // CHECKBUX command
    if(msg[1].toUpperCase() == "CHECKBUX"){
      console.log("Processing CHECKBUX from: " + message.channel);
      if(message.channel !== gamblers && message.channel !== bender_dev){
        rtm.sendMessage("<@" + message.user + "> " +
                        "Please keep gambling content to <#" + gamblers + ">"
                        ,message.channel);
        return;
      }
      else if(game.hasOwnProperty(message.user)){
        rtm.sendMessage("<@" + message.user + "> " +
                        "You currently have: " + game[message.user] + " scrumbux"
                        ,message.channel);
      }
      else{
        rtm.sendMessage("<@" + message.user + "> " +
                        "You are not currently registered. Use the JOIN command "
                        ,message.channel);
      }
    }
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

// handles roll commands
// params:
//   die - upper bound on roll
//   times - number of times to roll (default 1)
// returns:
//   result of roll(s)
function handleRollCommand(die, times = 1){
  var result = { rolls : "" };
  for(let i = 0; i < times; i++){
    // Yes, there's an extra space at the beginning. Sue me.
    result.rolls += " ";
    result.rolls += Math.floor(Math.random() * die) + 1; 
  }
  return result;
}
