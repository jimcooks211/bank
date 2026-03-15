const bcrypt = require('bcrypt');
const pool = require('../db');
const crypto = require('crypto');

async function signUp(req, res) {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        await pool.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

        const valid = await bcrypt.compare(password, rows[0].password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day
        await pool.execute(
            'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
            [rows[0].id, token, expires]
        );

        res.cookie('session_token', token, { httpOnly: true, expires });
        res.json({ message: 'Logged in successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { signUp, login };
