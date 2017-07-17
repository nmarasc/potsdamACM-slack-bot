var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

// bot token excluded from public repository for safety reasons
var bot_token = process.env.SLACK_BOT_TOKEN || '';
console.log(`${bot_token}`);

var rtm = new RtmClient(bot_token);

//rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  //console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to channel`);
//});

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if(message.text === "Hi bender") {
    //var channel = "#random";
    rtm.sendMessage("<@" + message.user + "> I\'m a Bender. I bend girders.", message.channel);
  }
});

