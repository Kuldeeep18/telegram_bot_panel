const store = require('../utils/mockStore');
const subscriptions = store.subscriptions;

exports.viewAllSubscriptions = (req, res) => {
    const totalUsers = Math.max(0, store.users.length - 1);
    res.render('subscriptions', { subscriptions, totalUsers });
};

exports.viewSubscriptionById = (req, res) => {
    const { subscriptionId } = req.params;
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
        return res.status(404).send('Subscription not found');
    }
    res.json(subscription);
};

exports.addSubscription = (req, res) => {
    const { subscriptionDetails } = req.body;
    subscriptions.push(subscriptionDetails);
    res.status(201).send('Subscription added successfully');
};

exports.updateSubscription = (req, res) => {
    const { subscriptionId } = req.params;
    const updatedDetails = req.body;
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
        return res.status(404).send('Subscription not found');
    }
    Object.assign(subscription, updatedDetails);
    res.send('Subscription updated successfully');
};

exports.deleteSubscription = (req, res) => {
    const { subscriptionId } = req.params;
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (index === -1) {
        return res.status(404).send('Subscription not found');
    }
    subscriptions.splice(index, 1);
    res.send('Subscription deleted successfully');
};
