exports.util = {};

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
