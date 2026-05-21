const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    botType: {
        type: String,
        enum: ['telegram', 'discord', 'slack'],
        default: 'telegram'
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'error'],
        default: 'offline'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bot', botSchema);
