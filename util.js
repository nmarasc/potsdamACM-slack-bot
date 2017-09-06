exports.util = {};

exports.util.quotes = require("./bigStupidArrays.js").quotes;
exports.util.eightball_msg = require("./bigStupidArrays.js").eightball_msg;
exports.util.emotes = require("./bigStupidArrays.js").emotes;

// check for numeric values
// params: n - value to check
// returns: true if numeric, false otherwise
exports.util.isNumeric = function isNumeric(n){
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// check for integer value
// params: n - value to check
// returns true if int, false otherwise
exports.util.isInt = function isInt(n){
  return this.isNumeric(n) && (parseFloat(n) === parseInt(n));
}

// check for meme value
// params: meme_msg - potential meme value
// returns true if meme, false otherwise
exports.util.isMeme = function isMeme(meme_msg){
  return (meme_msg === ":100:" || meme_msg.toUpperCase() === ":HERB:");
}

// parse meme value
// params: meme_msg - meme value
// returns: numeric value of meme
exports.util.parseMeme = function parseMeme(meme_msg){
  switch(meme_msg.toUpperCase()){
    case ":100:" :
      return 100;
    case ":HERB:" :
      return 420;
    default :
      return NaN;
  }
}

// split while preserving memes
// I hate everything
exports.util.memeSafeSplit = function memeSafeSplit(msg, delim){
  var result = [];
  var token = "";
  for(var i = 0; i < msg.length; i++){
    if(msg.charAt(i) === delim){
      result[result.length] = token;
      token = "";
    }
    else {
      if(msg.charAt(i) === ":"){
        token += msg.charAt(i++);
        while(msg.charAt(i) !== ":"){
          token += msg.charAt(i++);
        }
      }
      token += msg.charAt(i);
    }
  }
  result[result.length] = token;
  return result;
}

// check for valid user id format
exports.util.validUserID = function validUserID(id_str){
  return /^<@U[A-Z0-9]{8}>$/.test(id_str);
}
