// Shared in-memory data store for the application
// This allows the Telegram bot and Express controllers to access and modify the same data in real-time.

const store = {
    // Keep the admin user for dashboard login, but users list starts empty
    users: [
        { id: 'admin', username: 'admin', password: 'admin', email: 'admin@teleadminpanel.com', dateJoined: new Date().toLocaleDateString(), role: 'admin' }
    ],
    subscriptions: [],
    contents: [],
    identityDocuments: [],
    messages: [],
    payments: [],
    commands: []
};

module.exports = store;
