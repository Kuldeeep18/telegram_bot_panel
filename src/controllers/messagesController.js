const store = require('../utils/mockStore');
const messages = store.messages;
const botManager = require('../integrations/telegram/botManager');
const Bot = require('../models/bot');

exports.viewAllMessages = async (req, res) => {
    const user = res.locals.user;
    let bots = [];
    if (user) {
        bots = await Bot.find({ userId: user._id });
    }
    
    if (req.accepts('html')) {
        res.render('messages', { messages, bots });
    } else {
        res.json(messages);
    }
};

exports.sendMessage = async (req, res) => {
    const { sender, content, botId } = req.body;
    const msg = {
        id: String(messages.length + 1),
        sender: sender || 'Admin',
        content: content || ''
    };
    messages.push(msg);

    // Get the specified bot from BotManager
    const bot = botManager.getBot(botId);
    if (!bot) {
        console.warn(`[Broadcast] Bot ${botId} is not running! Cannot broadcast.`);
    } else {
        // Find users that interacted with THIS bot. For now, we mock broadcasting to test users.
        const activeUsers = store.users.filter(user => user.id !== 'admin');
        activeUsers.forEach(user => {
            if (user.id) {
                console.log(`[Broadcast] Dispatching via Bot ${botId} to user: ${user.username} (ID: ${user.id})`);
                bot.sendMessage(user.id, content).catch(err => console.error(err));
            }
        });
    }

    if (req.accepts('html')) {
        res.redirect('/messages');
    } else {
        res.status(201).json(msg);
    }
};

exports.deleteMessage = (req, res) => {
    const index = messages.findIndex(m => m.id === req.params.messageId);
    if (index === -1) return res.status(404).send('Message not found');
    messages.splice(index, 1);
    res.send('Message deleted successfully');
};
