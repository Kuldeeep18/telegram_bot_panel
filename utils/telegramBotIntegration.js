const TelegramBot = require('node-telegram-bot-api');
const store = require('./mockStore');
const TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Ensure this environment variable is set

let bot;
if (TOKEN) {
    bot = new TelegramBot(TOKEN, {polling: true});
    
    // Setup message and command listeners
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'User';
        const username = msg.from.username ? `@${msg.from.username}` : firstName;

        // Register user dynamically in the dashboard
        const userExists = store.users.some(u => u.username === username);
        if (!userExists) {
            store.users.push({
                id: String(chatId),
                username: username,
                email: `${msg.from.username || 'user'}@telegram.com`,
                dateJoined: new Date().toLocaleDateString(),
                role: 'user'
            });
        }

        bot.sendMessage(chatId, `🤖 Hello ${firstName}! Welcome to the TeleAdminPanel administration assistant bot. Send any message, and I'll receive it.`);
    });

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'User';
        const username = msg.from.username ? `@${msg.from.username}` : firstName;
        
        // Ensure user is registered dynamically in the dashboard on any message
        const userExists = store.users.some(u => u.username === username);
        if (!userExists) {
            store.users.push({
                id: String(chatId),
                username: username,
                email: `${msg.from.username || 'user'}@telegram.com`,
                dateJoined: new Date().toLocaleDateString(),
                role: 'user'
            });
        }

        // Check if message is a custom command (and not just /start)
        if (msg.text && msg.text.startsWith('/') && msg.text !== '/start') {
            const cmdString = msg.text.trim();
            const matchedCmd = store.commands.find(c => c.command === cmdString);
            if (matchedCmd) {
                bot.sendMessage(chatId, matchedCmd.response);
            }
            return;
        }

        if (msg.text && !msg.text.startsWith('/')) {
            console.log(`[Telegram Bot] Message from ${username}: ${msg.text}`);
            
            // Log message dynamically in the dashboard
            store.messages.push({
                id: String(store.messages.length + 1),
                sender: username,
                content: msg.text
            });

            bot.sendMessage(msg.chat.id, `✅ Received: "${msg.text}". TeleAdminPanel is tracking your request.`);
        }
    });
} else {
    console.warn('Warning: TELEGRAM_BOT_TOKEN is not defined. Telegram Bot integrations will be disabled.');
}

// Function to connect to the bot
exports.connectToBot = () => {
    if (bot) {
        console.log('Connected to the Telegram bot');
    } else {
        console.log('Telegram bot connection skipped (no token)');
    }
};

// Function to send a message to a specific chat
exports.sendMessage = (chatId, message) => {
    if (!bot) {
        console.log(`[Mock Send] Would send to ${chatId}: ${message}`);
        return;
    }
    bot.sendMessage(chatId, message)
        .then(() => {
            console.log(`Sent message to the Telegram chat ${chatId}: ${message}`);
        })
        .catch(err => {
            console.error("Failed to send message:", err);
        });
};


// You can add other utility functions related to the Telegram bot as needed...

exports.updateTelegramMenuCommands = () => {
    if (!bot) return;

    // Convert our internal commands list to Telegram API format
    // Telegram API expects: [{ command: "help", description: "Shows help" }]
    // (Notice: command name shouldn't have the slash in setMyCommands)
    const tgCommands = store.commands.map(cmd => {
        let name = cmd.command.startsWith('/') ? cmd.command.substring(1) : cmd.command;
        return {
            command: name,
            description: cmd.description || "Custom bot command"
        };
    });

    bot.setMyCommands(tgCommands)
        .then(() => console.log('Successfully synced custom commands with Telegram Menu!'))
        .catch(err => console.error('Failed to sync commands with Telegram:', err));
};
