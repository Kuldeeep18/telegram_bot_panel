const express = require('express');
const router = express.Router();

const store = require('../utils/mockStore');

router.get('/', (req, res) => {
    const totalUsers = Math.max(0, store.users.length - 1);
    const revenue = store.payments.reduce((sum, payment) => sum + parseFloat(payment.amount.replace('$', '')), 0);
    res.render('dashboard', { totalUsers, revenue });  
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;

