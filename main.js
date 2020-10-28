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
        bot.quit('disconnect.quitting');
        process.exit();
    } else if(input.startsWith("/chat ")){
        var text = input.substring(6, 255);
        bot.chat(text);
        //log(text);
    } else {
        log("Unknown command.", 0);
    }
    rl.prompt();
});
log("Starting...", 1);

const parametersJson = {
    //createMineflayerViewer: false,
    alternateChatSystem: false,
    host: "localhost",
    port: "61960",
    username: "Bot",
    password: ""
}
const parameters = Object.create(parametersJson);

// Creating the bot
const bot = mineflayer.createBot({
    host: parameters.localhost,
    port: parameters.port,
    username: parameters.username
    //password: parameters.password // Password not needed for localhost
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
    log("Listening...", 1);
});

bot.on("death", () => {
    log("Respawning...", 1);
    bot.setControlState("sneak", true);
});
// Chat logger
bot.on("message", (jsonMsg, position) => {
    // Should work on most of the vanilla servers, if not, use alternateChatSystem (DEPRECATED)
    /*try {
        if(jsonMsg.json.with[0].insertion != parameters.username || parameters.alternateChatSystem) log("[CHAT] " + jsonMsg, 1);
    } catch (e) {
        log("[CHAT] " + jsonMsg, 1);
    }*/
    log("[CHAT] " + jsonMsg, 1);
});

/*bot.on("actionBar", (jsonMsg) => {
    console.log("actionBar");
    log("[ACTION BAR] " + jsonMsg, 1);
});*/
