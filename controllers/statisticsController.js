const store = require('../utils/mockStore');

exports.viewAllStatistics = (req, res) => {
    // Minus 1 to exclude the default 'admin' account
    const totalUsers = Math.max(0, store.users.length - 1);
    const totalPayments = store.payments.length;

    if (req.accepts('html')) {
        res.render('statistics', {
            totalUsers,
            totalPayments
        });
    } else {
        res.json({
            totalUsers,
            totalPayments
        });
    }
};

exports.viewMonthlyStatistics = (req, res) => {
    const totalUsers = Math.max(0, store.users.length - 1);
    const totalPayments = store.payments.length;
    res.json({
        activeStats: { users: totalUsers, payments: totalPayments }
    });
};
