// Libraries
const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const fs = require('fs');
const readline = require('readline');

// rl interface creation for command input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const parametersJson = {
    createMineflayerViewer: false,
    cracked: true, // true if the server allows cracked instances or hosted as localhost
    host: "localhost",
    port: "52663",
    username: "Bot",
    password: ""
}



// Global functions
// Logging function
function log(string, formalized) {;
	var date = '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' GMT] ';
    if(!formalized) date = '';
	var logLine = date + string;
	console.log(logLine);
	fs.appendFile('latest.log', logLine + "\r\n", function (err) {if (err) throw err;});
}

// Command handler
rl.prompt();
log('', 0);
rl.on('line', (input) => {
    //log("Input: " + input, 0);
    if(input == "/quit") {
        log("Exiting.", 1);
        bot.quit('disconnect.quitting');
        process.exit();

    } else if(input == "/players") {
        log("", 0);
        log("Players list", 0);
        playersList = bot.players;
        Object.keys(playersList).forEach(function(key) {
            var player = playersList[key];
            //console.log(player);
            log(" - " + player.username + ", " + player.ping + " ms", 0);
        });

    } else if(input == "/entities") {
        log("", 0);
        log("Entities list", 0);
        playersList = bot.entities;
        Object.keys(playersList).forEach(function(key) {
            var entity = playersList[key];
            //console.log(entity);
            if(entity.type == "player") {
                log(" - [Player] " + entity.username + " x:" + Math.round(entity.position.x)+ " y:" + Math.round(entity.position.y)+ " z:" + Math.round(entity.position.z), 0);
                //console.log(entity);
            } else if(entity.type == "mob") {
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
log("Starting...", 1);


const parameters = Object.create(parametersJson);

// Creating the bot
/*if(!parameters.cracked) {
    const bot = mineflayer.createBot({
        host: parameters.host,
        port: parameters.port,
        username: parameters.username,
        password: parameters.password
    });
}

if(parameters.cracked) {
    const bot = mineflayer.createBot({
        host: parameters.host,
        port: parameters.port,
        username: parameters.username
    });
}*/
const bot = mineflayer.createBot({
    host: parameters.host,
    port: parameters.port,
    username: parameters.username
});
log('Instance created.', 1);


bot.once("login", () => {
    log('Logged in.', 1);
});

// MineflayerViewer
bot.once("spawn", () => {
    if(parameters.createMineflayerViewer) {
        log('Spawning mineflayerViewer instance...', 1);
        try {
            mineflayerViewer(bot, { port: 3007, firstPerson: false });
        } catch (e) {
            log(e, 1);
        } finally {
            log("Done.", 1);
        }
    }
    bot.setControlState("sneak", true);
    log("Listening...", 1);
});

bot.on("death", () => {
    log("Respawning...", 1);
    bot.setControlState("sneak", true);
});
// Chat logger
bot.on("message", (jsonMsg, position) => {
    log("[CHAT] " + jsonMsg, 1);
});

bot.on("entitySpawn", () => {
    log("[CHAT] Entity", 1);
});

bot.on('kicked', (reason, loggedIn) => {
    log("[SYSTEM] KICKED : " + reason + ", " + loggedIn, 1);
    bot.quit('disconnect.quitting');
    process.exit();
});
bot.on('error', err => {
    log("[SYSTEM] ERROR : " + err, 1);
    bot.quit('disconnect.quitting');
    process.exit();
});
