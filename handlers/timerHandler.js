var util = require('../util.js').util;

//handle timer command
module.exports = function timerHandler(time, args){
  args["message"] = "Hopefully " + time + " seconds have passed";
  return new Promise(function(resolve, reject){
    setTimeout(function() {
      resolve(args);
    }, time*1000);
  });
}
