// Libraries
const mineflayer = require("mineflayer");
const mineflayerViewer = require("prismarine-viewer").mineflayer;
const fs = require("fs");
const readline = require("readline");
const colors = require("colors");

// rl interface creation for command input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// Color theme
colors.setTheme({
  info: "cyan",
  warn: "yellow",
  error: "red"
});

const rawdata = fs.readFileSync("settings.json");
const parameters = JSON.parse(rawdata);

var movementCooldown = {};
var functionCooldown = {}; //// COMBAK:
var playersList;

// Global functions
// Logging function
function log(string, formalized) {
	var date = "[" + new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") + " GMT] ";
    if(!formalized) date = "";
	var logLine = date.grey + string;
	console.log(logLine);
    const regex = new RegExp(/(\x1B\x5B39m|\x1B\x5B90m|\x1B\x5B36m|\x1B\x5B31m)/gmu);  // oh my
    logLine = logLine.replace(regex, "");
	fs.appendFile("latest.log", logLine + "\r\n", function (err) {if (err) throw err;});
}


rl.prompt();
log("", 0);

log("Starting...".info, 1);

// Creating the bot  // COMBAK
const bot = mineflayer.createBot({
    host: parameters.host,
    port: parameters.port,
    username: parameters.username
});
log("Instance created.".info, 1);


// Command handler
rl.on("line", (input) => {
    if(input === "/quit") {
        log("Exiting.", 1);
        bot.quit("disconnect.quitting");
        process.exit();

    } else if(input === "/players") {
        log("", 0);
        log("Players list", 0);
        playersList = bot.players;
        Object.keys(playersList).forEach(function(key) {
            var player = playersList[key];
            //console.log(player);
            log(" - " + player.username + ", " + player.ping + " ms", 0);
        });

    } else if(input === "/entities") {
        log("", 0);
        log("Entities list", 0);
        playersList = bot.entities;
        Object.keys(playersList).forEach(function(key) {
            var entity = playersList[key];
            //console.log(entity);
            if(entity.type === "player") {
                log(" - [Player] " + entity.username + " x:" + Math.round(entity.position.x)+ " y:" + Math.round(entity.position.y)+ " z:" + Math.round(entity.position.z), 0);
                //console.log(entity);
            } else if(entity.type === "mob") {
                log(" - [Mob]    " + entity.displayName, 0);
            } else {
                log(" - [Entity] " + entity.displayName, 0);
            }
            //log(" - " + entity.displayName + ", " + entity.ping + " ms", 0);
        });

    } else if(input.startsWith("/chat ")){
        var text = input.substring(6, 255);
        bot.chat(text);

    } else {
        log("Unknown command.", 0);
    }
    rl.prompt();
});

bot.once("login", () => {
    log("Logged in.".info, 1);
});

// MineflayerViewer
bot.once("spawn", () => {
    if(parameters.createMineflayerViewer) {
        log("Spawning mineflayerViewer instance...", 1);
        try {
            mineflayerViewer(bot, { port: 3007, firstPerson: false });
        } catch (e) {
            log(e, 1);
        } finally {
            log("Done.", 1);
        }
    }
    bot.setControlState("sneak", true);
    playersList = bot.players;
    log("Online players : ".info, 1);
    Object.keys(playersList).forEach(function(key) {
        var player = playersList[key];
        //console.log(player);
        log(" - " + player.username + ", " + player.ping + " ms", 1);
    });
    log("Listening...".info, 1);
});

bot.on("death", () => {
    log("Respawning...", 1);
    bot.setControlState("sneak", true);
});
// Chat logger
bot.on("message", (jsonMsg, position) => {
    log("[CHAT] " + jsonMsg, 1);
});

bot.on("entitySpawn", (entity) => {
    if(entity.type === "player") {
        //log("[SECURITY] New player in range", 1);
        if(entity.username !== bot.username) {
            if(!parameters.trustedPlayers.includes(entity.username)) {
                for (var i = 0; i < 5; i++) {
                    log("[SECURITY]".error + " NEW PLAYER IN SCANNING RANGE : " + entity.username, 1);
                }
            } else {
                log("[SECURITY]".error + " New trusted player in scanning range : " + entity.username, 1);
            }
        }
    }
});
bot.on("entityGone", (entity) => {
    if(entity.type === "player") {
        log("[SECURITY]".error + " " + entity.username + " left the scanning range", 1);
    }
});

bot.on("health", (entity) => {
    var health = Math.round(bot.health);
    var food = Math.round(bot.food);
    var sat = Math.round(bot.foodSaturation);
    log("Health : ".info + health + " Hunger/Saturation : ".info + food + "/" + sat, 1);
});

bot.on("entityMoved", (entity) => {
    var millis = Date.now();
    var cooldown;
    if(entity.type === "player") {
        if(parameters.trustedPlayers.includes(entity.username)) {
            cooldown = 10000;
        } else {
            cooldown = 2000;
        }
        if(!movementCooldown[entity.username]) {
            movementCooldown[entity.username] = millis;
        } else if(millis > movementCooldown[entity.username] + cooldown && parameters.logCoordsforTrustedPlayers) {
            log("[SECURITY]".error + " " + entity.username + "  position : x:" + Math.round(entity.position.x)+ " y:" + Math.round(entity.position.y)+ " z:" + Math.round(entity.position.z), 1);
            movementCooldown[entity.username] = millis;
        }

    }
});
bot.on("kicked", (reason, loggedIn) => {
    log("[SYSTEM] KICKED".error + "  : " + reason + ", " + loggedIn, 1);
    bot.quit("disconnect.quitting");
    process.exit();
});
bot.on("error", (err) => {
    log("[SYSTEM] ERROR".error + "  : " + err, 1);
    bot.quit("disconnect.quitting");
    process.exit();
});
