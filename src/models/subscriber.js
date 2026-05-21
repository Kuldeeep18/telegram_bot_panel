const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bot',
        required: true
    },
    chatId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: 'Unknown'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// A user can only be subscribed once per bot
subscriberSchema.index({ botId: 1, chatId: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
