const store = require('../utils/mockStore');
const users = store.users;


exports.register = (req, res) => {
    const { username, password } = req.body;

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    users.push({ username, password });
    if (req.accepts('html')) {
        res.redirect('/login');
    } else {
        res.status(201).send('User registered successfully');
    }
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    if (req.accepts('html')) {
        res.redirect('/');
    } else {
        res.send('Logged in successfully');
    }
};

exports.logout = (req, res) => {
    if (req.accepts('html')) {
        res.redirect('/login');
    } else {
        res.send('Logged out successfully');
    }
};


exports.getUserDetails = (req, res) => {
    const { username } = req.params;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).send('User not found');
    }
    res.json(user);
};

exports.updateUser = (req, res) => {
    const { userId } = req.params;
    const updatedDetails = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).send('User not found');
    }
    Object.assign(user, updatedDetails);
    res.send('User updated successfully');
};

exports.deleteUser = (req, res) => {
    const { userId } = req.params;
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
        return res.status(404).send('User not found');
    }
    users.splice(index, 1);
    res.send('User deleted successfully');
};
