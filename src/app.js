require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

// Initialize DB and Telegram connections
// Initialize DB, Telegram connections, and Workers
const connectDB = require('./core/db');
const Bot = require('./models/bot');
const botManager = require('./integrations/telegram/botManager');

connectDB().then(async () => {
    if (process.env.REDIS_URL) {
        require('./workers/executionWorker');
        console.log("Redis Worker Initialized.");
    } else {
        console.warn("Warning: REDIS_URL not set. Background workers are disabled.");
    }

    // Auto-start all active bots from the database
    try {
        const activeBots = await Bot.find({ status: 'online' });
        console.log(`Found ${activeBots.length} active bots in DB to start...`);
        activeBots.forEach(bot => {
            botManager.startBot(bot._id.toString(), bot.token);
        });
    } catch (err) {
        console.error("Error auto-starting bots:", err);
    }
});

// Middleware for parsing JSON and url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware for serving static files
app.use(express.static(__dirname + '/public'));

// Setting up the view engine as EJS
app.set('views', __dirname + '/dashboard/views');
app.set('view engine', 'ejs');

// Import routes
const authRoutes = require('./routes/auth');
const botsRoutes = require('./routes/bots');
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscriptions');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const statisticRoutes = require('./routes/statistics');
const commandRoutes = require('./routes/commands');

const { checkUser } = require('./core/authMiddleware');

// Mount routes
app.get('*', checkUser);
app.use('/', authRoutes);
app.use('/bots', botsRoutes);
app.use('/', indexRoutes);
app.use('/users', userRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/messages', messageRoutes);
app.use('/payments', paymentRoutes);
app.use('/statistics', statisticRoutes);
app.use('/commands', commandRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

