const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bot',
        required: true
    },
    command: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    response: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one command per bot (no duplicates)
commandSchema.index({ botId: 1, command: 1 }, { unique: true });

module.exports = mongoose.model('Command', commandSchema);
