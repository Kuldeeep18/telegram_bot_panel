const { Worker } = require('bullmq');
const { connection } = require('./queue');
const Execution = require('../models/execution');
const Command = require('../models/command');
const botManager = require('../integrations/telegram/botManager');

console.log('Starting BullMQ Execution Worker...');

const executionWorker = new Worker('bot-events', async (job) => {
    const { botId, chatId, messageText } = job.data;
    
    console.log(`[Worker] Processing message for Bot ${botId}: "${messageText}"`);
    
    try {
        // 1. Log execution to MongoDB
        await Execution.create({
            botId,
            command: messageText,
            status: 'processing'
        });

        // 2. Register user dynamically to MongoDB for subscriptions/broadcasts
        const Subscriber = require('../models/subscriber');
        try {
            await Subscriber.findOneAndUpdate(
                { botId, chatId: String(chatId) },
                { 
                    botId, 
                    chatId: String(chatId),
                    username: `User_${chatId}` // Defaulting since Telegram username isn't passed via simple text hook yet
                },
                { upsert: true, new: true }
            );
            console.log(`[Worker] Ensured subscriber ${chatId} is registered for bot ${botId}.`);
        } catch (err) {
            console.error(`[Worker] Error registering subscriber:`, err.message);
        }

        // 3. Determine bot and respond
        const bot = botManager.getBot(botId);
        if (bot) {
            if (messageText && messageText.startsWith('/start')) {
                await bot.sendMessage(chatId, `🤖 Hello! Welcome to the TeleAdminPanel assistant. Send any message, and I'll process it!`);
            } else if (messageText && messageText.startsWith('/')) {
                // Look up custom command from MongoDB for this specific bot
                const customCmd = await Command.findOne({ botId, command: messageText.split('@')[0] });
                if (customCmd && customCmd.response) {
                    await bot.sendMessage(chatId, customCmd.response);
                    console.log(`[Worker] Responded to ${messageText} with custom command for bot ${botId}`);
                } else {
                    await bot.sendMessage(chatId, `❓ Unknown command: ${messageText}. Use the bot menu to see available commands.`);
                }
            } else if (messageText) {
                await bot.sendMessage(chatId, `✅ Received: "${messageText}"`);
            }
        } else {
            console.warn(`[Worker] Bot ${botId} not found in active memory!`);
        }
        
        return { success: true, processedAt: Date.now() };
    } catch (err) {
        console.error(`[Worker Error]`, err);
        throw err;
    }
}, { connection });

executionWorker.on('completed', (job, returnvalue) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
});

executionWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job.id} failed:`, err.message);
});

module.exports = executionWorker;
