const store = require('../utils/mockStore');
const messages = store.messages;
const telegramBot = require('../utils/telegramBotIntegration');

exports.viewAllMessages = (req, res) => {
    if (req.accepts('html')) {
        res.render('messages', { messages });
    } else {
        res.json(messages);
    }
};

exports.sendMessage = (req, res) => {
    const { sender, content } = req.body;
    const msg = {
        id: String(messages.length + 1),
        sender: sender || 'Admin',
        content: content || ''
    };
    messages.push(msg);

    // Get all users who have registered with their Telegram chat ID (excluding admin)
    const activeUsers = store.users.filter(user => user.id !== 'admin');
    activeUsers.forEach(user => {
        if (user.id) {
            console.log(`[Broadcast] Dispatching message to user: ${user.username} (ID: ${user.id})`);
            telegramBot.sendMessage(user.id, content);
        }
    });

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
