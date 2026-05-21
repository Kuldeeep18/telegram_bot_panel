const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bot',
        required: true
    },
    command: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    logOutput: {
        type: String,
        default: ''
    },
    executedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Execution', executionSchema);
