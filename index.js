var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

// bot token excluded from public repository for safety reasons
var bot_token = process.env.SLACK_BOT_TOKEN || '';
console.log("Token connected with: " + `${bot_token}`);

var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);

var defaultChannel = "bender_dev";
var channel;
var name; 

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  name = rtmStartData.self.id;
  console.log(`Name/ID: ${name}`);
  for (const c of rtmStartData.channels) {
    if (c.is_member){
      console.log("Member of channel: " + `${c.name}`);
      if (c.name === defaultChannel) {
        console.log("Setting read channel to: " + `${c.name}`);
	channel = c.id; 
      }
    }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to channel`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  console.log("RTM connection opened successfully\n\n\n");
});

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  //console.log(`${message.text}`);
  if(typeof message.text !== 'undefined') {
    var msg = message.text.split(" ");
    if(msg[0].toUpperCase() === "HI" && msg.length > 1){ 
      if(msg[1].toUpperCase() === "BENDER" || msg[1].includes(name)) {
        rtm.sendMessage("<@" + message.user + "> I\'m a Bender. I bend girders. :partyparrot:", message.channel);
      }
    }
    
    // Start checking for commands
    if(msg[0].includes(name) && msg.length > 1){
      console.log("\nMention detected, checking for command..");
      if(msg[1].toUpperCase() === "ROLL" && msg.length > 2){
        // ROLL command found
	console.log("Processing ROLL command...");

	var die;     
	var value;
	//Hard test first
	if(msg[2].toUpperCase().startsWith("D")){ die = parseInt(msg[2].substring(1)); }
	else{ die = parseInt(msg[2]); }
	if(isNaN(die) || die < 2){
	  console.log("Not a valid roll: " + die);
	  rtm.sendMessage("<@" + message.user + "> " + msg[2] + " is not a valid roll.",message.channel);
	  return;
	}
	console.log("Die to roll: " + die);
	 
	value = Math.floor((Math.random() * die) + 1);
	console.log("rolled: " + value);
	rtm.sendMessage("<@" + message.user + "> You rolled a: " + value, message.channel);
      }
    }
  }
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleReactionAdded(reactionEvent) {
  console.log("\n" + reactionEvent.reaction + " added to " + 
	             reactionEvent.item.type + " by " + 
	             reactionEvent.user);
  //console.log(reactionEvent.item);
  
  var item = {
    file         : reactionEvent.item.file,
    file_comment : reactionEvent.item.file_comment,
    channel      : reactionEvent.item.channel, 
    ts           : reactionEvent.item.ts};

  //console.log("channel: " + item.channel + "\nts: " + item.ts);
  //console.log(item);

  web.reactions.add(reactionEvent.reaction,reactionEvent.item, function handleAdd(err,res){
    if(err){ console.log("There was an error"); } 
  });
});


