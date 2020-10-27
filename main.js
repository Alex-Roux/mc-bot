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
	var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	if(formalized) date = ('[' + date + ' GMT] ');
	var logLine = date + string;
	console.log(logLine);
	fs.appendFile('latest.log', logLine + "\r\n", function (err) {if (err) throw err;});
}

// Command handler
console.log('');
rl.prompt();
rl.on('line', (input) => {
    log("Received : " + input, 1);
    if(input == "/quit") {
        bot.quit('disconnect.quitting');
        process.exit();
    } else if(input.startsWith("/chat ")){
        bot.chat(input.substring(6, 255))
    }


    rl.prompt();
});


const parametersJson = {
    createMineflayerViewer: false,
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
    //password: parameters.password
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

// Chat logger
bot.on("message", (jsonMsg, position) => {
    if(!jsonMsg.startsWith("<" + parameters.username)) log("[CHAT] " + jsonMsg, 1);
});

/*bot.on("actionBar", (jsonMsg) => {
    console.log("actionBar");
    log("[ACTION BAR] " + jsonMsg, 1);
});*/
