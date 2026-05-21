const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const maxAge = 3 * 24 * 60 * 60; // 3 days

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_super_secret', {
        expiresIn: maxAge
    });
};

exports.login_get = (req, res) => {
    res.render('login');
};

exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                const token = createToken(user._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                return res.status(200).json({ user: user._id });
            }
        }
        throw Error('incorrect email or password');
    } catch (err) {
        res.status(400).json({ error: 'Invalid login credentials' });
    }
};

exports.register_get = (req, res) => {
    res.render('register');
};

exports.register_post = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ username, email, password: hashedPassword });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        console.log("Registration Error:", err);
        res.status(400).json({ error: err.message || 'Error registering user' });
    }
};

exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};
