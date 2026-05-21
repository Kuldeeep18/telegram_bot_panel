const express = require('express');
const router = express.Router();
const Bot = require('../models/bot');
const botManager = require('../integrations/telegram/botManager');
const { requireAuth } = require('../core/authMiddleware');

router.post('/create', requireAuth, async (req, res) => {
    try {
        const { name, token, botType } = req.body;
        
        // 1. Save to DB
        const newBot = await Bot.create({
            userId: req.user.id,
            name,
            token,
            botType,
            status: 'online'
        });

        // 2. Start Bot in Manager
        const started = botManager.startBot(newBot._id.toString(), token);
        if (!started) {
            newBot.status = 'error';
            await newBot.save();
        }

        res.redirect('/');
    } catch (error) {
        console.error("Error creating bot:", error);
        res.status(500).send("Error creating bot");
    }
});

module.exports = router;
