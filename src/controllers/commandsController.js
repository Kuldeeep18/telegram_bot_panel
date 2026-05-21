const Command = require('../models/command');
const Bot = require('../models/bot');
const botManager = require('../integrations/telegram/botManager');

// Helper: sync commands to Telegram Menu API for a specific bot
async function syncCommandsToTelegram(botId) {
    const bot = botManager.getBot(botId);
    if (!bot) {
        console.warn(`[Sync] Bot ${botId} is not running, skipping Telegram menu sync.`);
        return;
    }

    const commands = await Command.find({ botId });
    const tgCommands = commands.map(cmd => {
        let name = cmd.command.startsWith('/') ? cmd.command.substring(1) : cmd.command;
        return {
            command: name,
            description: cmd.description || 'Custom bot command'
        };
    });

    try {
        await bot.setMyCommands(tgCommands);
        console.log(`[Sync] Successfully synced ${tgCommands.length} commands to Telegram for bot ${botId}`);
    } catch (err) {
        console.error(`[Sync] Failed to sync commands for bot ${botId}:`, err.message);
    }
}

exports.viewAllCommands = async (req, res) => {
    const user = res.locals.user;
    let bots = [];
    let commands = [];
    
    if (user) {
        bots = await Bot.find({ userId: user._id });
        const botIds = bots.map(b => b._id);
        commands = await Command.find({ botId: { $in: botIds } }).populate('botId', 'name');
    }
    
    if (req.accepts('html')) {
        res.render('commands', { commands, bots });
    } else {
        res.json(commands);
    }
};

exports.addCommand = async (req, res) => {
    let { command, description, response, botId } = req.body;
    
    // Ensure command always starts with a slash
    if (!command.startsWith('/')) {
        command = '/' + command;
    }

    try {
        // Upsert: update if same command+bot exists, else create new
        await Command.findOneAndUpdate(
            { botId, command },
            { botId, command, description: description || '', response: response || '' },
            { upsert: true, new: true }
        );

        // Sync with Telegram Menu API
        await syncCommandsToTelegram(botId);

        if (req.accepts('html')) {
            res.redirect('/commands');
        } else {
            res.status(201).json({ success: true });
        }
    } catch (err) {
        console.error('Error adding command:', err);
        res.status(500).send('Error adding command');
    }
};

exports.deleteCommand = async (req, res) => {
    const { commandId } = req.params;
    
    try {
        const cmd = await Command.findByIdAndDelete(commandId);
        if (!cmd) {
            return res.status(404).send('Command not found');
        }

        // Re-sync with Telegram after deletion
        await syncCommandsToTelegram(cmd.botId);

        res.status(200).send('Command deleted successfully');
    } catch (err) {
        console.error('Error deleting command:', err);
        res.status(500).send('Error deleting command');
    }
};
