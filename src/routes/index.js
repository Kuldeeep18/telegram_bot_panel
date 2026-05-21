const express = require('express');
const router = express.Router();

const store = require('../utils/mockStore');
const Bot = require('../models/bot');

router.get('/', async (req, res) => {
    let userBots = [];
    if (res.locals.user) {
        userBots = await Bot.find({ userId: res.locals.user._id });
    }
    const totalUsers = Math.max(0, store.users.length - 1);
    const revenue = store.payments.reduce((sum, payment) => sum + parseFloat(payment.amount.replace('$', '')), 0);
    res.render('dashboard', { totalUsers, revenue, userBots });  
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;

