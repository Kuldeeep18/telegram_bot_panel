const Bot = require('../models/bot');
const Command = require('../models/command');
const Execution = require('../models/execution');
const User = require('../models/user');

exports.viewAllStatistics = async (req, res) => {
    try {
        const user = res.locals.user;

        // Platform-wide stats
        const totalUsers = await User.countDocuments();
        const totalBots = user ? await Bot.countDocuments({ userId: user._id }) : 0;
        const onlineBots = user ? await Bot.countDocuments({ userId: user._id, status: 'online' }) : 0;
        const totalCommands = user
            ? await Command.countDocuments({ botId: { $in: (await Bot.find({ userId: user._id })).map(b => b._id) } })
            : 0;
        const totalExecutions = await Execution.countDocuments();

        // Recent executions (last 20)
        const recentExecutions = await Execution.find()
            .sort({ executedAt: -1 })
            .limit(20)
            .populate('botId', 'name');

        // Daily execution counts for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyStats = await Execution.aggregate([
            { $match: { executedAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$executedAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        if (req.accepts('html')) {
            res.render('statistics', {
                totalUsers,
                totalBots,
                onlineBots,
                totalCommands,
                totalExecutions,
                recentExecutions,
                dailyStats
            });
        } else {
            res.json({ totalUsers, totalBots, onlineBots, totalCommands, totalExecutions, dailyStats });
        }
    } catch (err) {
        console.error('Statistics Error:', err);
        res.status(500).send('Error loading statistics');
    }
};

exports.viewMonthlyStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalExecutions = await Execution.countDocuments();
        res.json({ activeStats: { users: totalUsers, executions: totalExecutions } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
