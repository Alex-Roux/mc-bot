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
rl.prompt();
rl.on('line', (input) => {
    log("Received : " + input, 1);
    switch (input) {
        case "quit":
            bot.quit('disconnect.quitting');
            process.exit();
    }
    console.log('');
    rl.prompt();
});

// Creating the bot
const bot = mineflayer.createBot({
    //host: "",
    host: "localhost",
    port: 58921,
    username: 'Bot',
    //password: ''
});

const createMineflayerViewer = 1;

bot.once("login", () => {
    log('Logged in.', 1);
});

// MineflayerViewer
bot.once("spawn", () => {
    if(createMineflayerViewer) {
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
bot.on("chat", (username, message, translate, jsonMsg, matches) => {
    log("[CHAT] " + jsonMsg, 1);
    log("[matches]] " + matches, 0);
});
