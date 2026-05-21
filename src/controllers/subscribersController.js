const Bot = require('../models/bot');
const Subscriber = require('../models/subscriber');

exports.viewAllSubscribers = async (req, res) => {
    try {
        const user = res.locals.user;
        let bots = [];
        let subscribers = [];
        let filterBotId = req.query.botId || '';

        if (user) {
            // Get all bots belonging to the dashboard user
            bots = await Bot.find({ userId: user._id });
            const botIds = bots.map(b => b._id);

            // Construct filter query
            let query = { botId: { $in: botIds } };
            if (filterBotId) {
                // Check if the filtered bot actually belongs to this user
                const isValidBot = bots.some(b => b._id.toString() === filterBotId);
                if (isValidBot) {
                    query.botId = filterBotId;
                }
            }

            // Fetch subscribers with the applied filter
            subscribers = await Subscriber.find(query).populate('botId', 'name botType');
        }

        if (req.accepts('html')) {
            res.render('subscribers', { subscribers, bots, filterBotId });
        } else {
            res.json({ subscribers, totalCount: subscribers.length });
        }
    } catch (err) {
        console.error('Subscribers Error:', err);
        res.status(500).send('Error loading subscribers');
    }
};
