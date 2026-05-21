const { Queue } = require('bullmq');
const Redis = require('ioredis');

let connection;
let botEventQueue;

if (process.env.REDIS_URL) {
    connection = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null
    });
    botEventQueue = new Queue('bot-events', { connection });
} else {
    console.warn("Queue: REDIS_URL is not set. Queue is disabled.");
}

async function pushBotEvent(botId, chatId, messageText) {
    if (!botEventQueue) {
        console.warn(`[Queue Disabled] Mock pushing event for Bot ${botId}`);
        return;
    }
    await botEventQueue.add('process-message', {
        botId,
        chatId,
        messageText,
        timestamp: Date.now()
    });
}

module.exports = {
    botEventQueue,
    pushBotEvent,
    connection
};
