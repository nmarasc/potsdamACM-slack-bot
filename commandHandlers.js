// Handler imports
var rollHandler      = require('./handlers/rollHandler.js');
var betHandler       = require('./handlers/betHandler.js');
var joinHandler      = require('./handlers/joinHandler.js');
var checkbuxHandler  = require('./handlers/checkbuxHandler.js');
var coinHandler      = require('./handlers/coinHandler.js');
var eightballHandler = require('./handlers/eightballHandler.js');
var fortuneHandler   = require('./handlers/fortuneHandler.js');
var timerHandler     = require('./handlers/timerHandler.js');
var helpHandler      = require('./handlers/helpHandler.js');
var pickitHandler    = require('./handlers/pickitHandler.js');
var characterHandler = require('./handlers/characterHandler.js');

exports.command_handler = {};

// Adding in handlers
exports.command_handler.rollHandler      = rollHandler;
exports.command_handler.betHandler       = betHandler;
exports.command_handler.joinHandler      = joinHandler;
exports.command_handler.checkbuxHandler  = checkbuxHandler;
exports.command_handler.coinHandler      = coinHandler;
exports.command_handler.eightballHandler = eightballHandler;
exports.command_handler.fortuneHandler   = fortuneHandler;
exports.command_handler.timerHandler     = timerHandler;
exports.command_handler.helpHandler      = helpHandler;
exports.command_handler.pickitHandler    = pickitHandler;
exports.command_handler.characterHandler = characterHandler;
