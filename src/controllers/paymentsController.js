const store = require('../utils/mockStore');
const payments = store.payments;


exports.viewAllPayments = (req, res) => {
    if (req.accepts('html')) {
        res.render('payments', { payments });
    } else {
        res.json(payments);
    }
};

exports.createPayment = (req, res) => {
    const { sender, amount } = req.body;
    const pay = {
        id: String(payments.length + 1),
        sender: sender || 'Anonymous',
        amount: amount || '$0.00'
    };
    payments.push(pay);
    if (req.accepts('html')) {
        res.redirect('/payments');
    } else {
        res.status(201).json(pay);
    }
};

exports.updatePayment = (req, res) => {
    const pay = payments.find(p => p.id === req.params.paymentId);
    if (!pay) return res.status(404).send('Payment not found');
    Object.assign(pay, req.body);
    res.send('Payment updated successfully');
};

exports.deletePayment = (req, res) => {
    const index = payments.findIndex(p => p.id === req.params.paymentId);
    if (index === -1) return res.status(404).send('Payment not found');
    payments.splice(index, 1);
    res.send('Payment deleted successfully');
};
