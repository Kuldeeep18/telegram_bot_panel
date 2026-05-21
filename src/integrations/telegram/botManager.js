const TelegramBot = require('node-telegram-bot-api');
const { pushBotEvent } = require('../../workers/queue');

class BotManager {
    constructor() {
        this.activeBots = new Map(); // Store active bots: botId -> botInstance
    }

    startBot(botId, token) {
        if (this.activeBots.has(botId)) {
            console.log(`Bot ${botId} is already running.`);
            return;
        }

        try {
            const bot = new TelegramBot(token, { polling: true });

            bot.on('message', async (msg) => {
                console.log(`[Bot ${botId}] Queuing message from ${msg.chat.id}`);
                await pushBotEvent(botId, msg.chat.id, msg.text);
            });

            this.activeBots.set(botId, bot);
            console.log(`Successfully started Telegram bot: ${botId}`);
            return true;
        } catch (error) {
            console.error(`Failed to start bot ${botId}:`, error);
            return false;
        }
    }

    stopBot(botId) {
        if (!this.activeBots.has(botId)) {
            return false;
        }
        const bot = this.activeBots.get(botId);
        bot.stopPolling();
        this.activeBots.delete(botId);
        console.log(`Stopped Telegram bot: ${botId}`);
        return true;
    }

    getBot(botId) {
        return this.activeBots.get(botId);
    }
}

// Export singleton instance
module.exports = new BotManager();
