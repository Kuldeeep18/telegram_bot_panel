const store = require('../utils/mockStore');
const telegramBot = require('../utils/telegramBotIntegration');
const commands = store.commands;

exports.viewAllCommands = (req, res) => {
    if (req.accepts('html')) {
        res.render('commands', { commands });
    } else {
        res.json(commands);
    }
};

exports.addCommand = (req, res) => {
    let { command, description, response } = req.body;
    
    // Ensure command always starts with a slash
    if (!command.startsWith('/')) {
        command = '/' + command;
    }

    const cmd = {
        id: String(commands.length + 1),
        command: command,
        description: description || '',
        response: response || ''
    };
    
    // Replace if it already exists
    const existingIndex = commands.findIndex(c => c.command === command);
    if (existingIndex !== -1) {
        commands[existingIndex] = cmd;
    } else {
        commands.push(cmd);
    }

    // Trigger sync with Telegram API
    telegramBot.updateTelegramMenuCommands();

    if (req.accepts('html')) {
        res.redirect('/commands');
    } else {
        res.status(201).json(cmd);
    }
};

exports.deleteCommand = (req, res) => {
    const { commandId } = req.params;
    const index = commands.findIndex(c => c.id === commandId);
    
    if (index !== -1) {
        commands.splice(index, 1);
        telegramBot.updateTelegramMenuCommands();
        res.status(200).send('Command deleted successfully');
    } else {
        res.status(404).send('Command not found');
    }
};
