require('dotenv').config();
const express = require('express');
const app = express();

// Initialize DB and Telegram connections
const connectDB = require('./utils/databaseConnection');
const telegramBot = require('./utils/telegramBotIntegration');

connectDB();
telegramBot.connectToBot();

// Middleware for parsing JSON and url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static('public'));

// Setting up the view engine as EJS
app.set('view engine', 'ejs');

// Import routes
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscriptions');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const statisticRoutes = require('./routes/statistics');
const commandRoutes = require('./routes/commands');

// Mount routes
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

