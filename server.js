// server.js
require('dotenv').config(); // Optional: for environment variables (recommended)

const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────
app.use(express.json());           // Parse JSON bodies (for fetch/axios)
app.use(express.urlencoded({ extended: true })); // For form-urlencoded if needed
app.use(cors({
  origin: true,
  credentials: true
}));


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-123', // ← change this!
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false,               // set to true in production with HTTPS
    httpOnly: true
  }
}));

// ────────────────────────────────────────────────
// Database Connection Pool
// ────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST     || 'localhost',
  user: process.env.DB_USER     || 'root',
  password: process.env.DB_PASS || 'your-new-password-here', // ← use the one you just reset
  database: process.env.DB_NAME || 'yourdbname',             // ← e.g. usersdb
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────

// POST /users - Create new user from form
app.post('/users', async (req, res) => {
  const { name, email, phone } = req.body;

  console.log('📱 Form received:', { name, email, phone });

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    console.log('❌ Invalid name');
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  // Validate email presence and format
  if (!email || typeof email !== 'string' || !email.trim()) {
    console.log('❌ Email is required');
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    console.log('❌ Invalid email format');
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    let userId;
    let isNewUser = false;

    // Check if user exists by email
    const [existing] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      // Email exists → treat as returning user
      userId = existing[0].id;
      // Optional: update name if different
      await pool.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name.trim(), userId]
      );
      console.log(`👤 Existing user found (email match) – updated – ID: ${userId}`);
    } else {
      // Email does not exist → create new user
      isNewUser = true;
      const [result] = await pool.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name.trim(), cleanEmail]
      );
      userId = result.insertId;
      console.log(`🆕 New user created (no email match) – ID: ${userId}`);
    }

    // Build user object
    const user = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      isNew: isNewUser,
      lastCheckIn: new Date().toISOString()
    };

    // Save to session
    req.session.user = user;

      req.session.save(() => {
        return res.status(201).json({
          message: isNewUser ? 'User created successfully' : 'Welcome back!',
          user,
          redirectTo: '/create-account'
        });
      });


  } catch (err) {
    console.error('💥 Database error:', err.code, err.sqlMessage);
    return res.status(500).json({ error: 'Server error - please try again later' });
  }
});

app.post('/create-account', async (req, res) => {
  const { email, phone } = req.body;

  // Require user to be logged in (from /users step)
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  const userId = req.session.user.id;

  try {
    // Update user with new data (no duplicate check)
    const updates = {};
    if (email) updates.email = email.trim().toLowerCase();
    if (phone) updates.phone = phone.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No data provided to update" });
    }

    // Build query dynamically
    const fields = Object.keys(updates);
    const values = fields.map(field => updates[field]);
    values.push(userId);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    await pool.query(query, values);

    console.log(`User updated – ID: ${userId}`, updates);

    // Update session
    req.session.user = { ...req.session.user, ...updates };

    return res.status(200).json({
      message: "Account updated successfully",
      user: req.session.user
    });

  } catch (err) {
    console.error('Create account error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /add-mobile-number
app.post('/add-mobile-number', async (req, res) => {
  // Make sure user is logged in
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({
      error: "You must be logged in to add a mobile number"
    });
  }

  const { phone } = req.body;

  // Basic validation
  if (!phone) {
    return res.status(400).json({ error: "Mobile number is required" });
  }

  // Clean and validate format (international format, starts with +, 8–15 digits)
  const cleanPhone = phone.trim();
  if (!cleanPhone.startsWith('+') || !/^\+\d{8,15}$/.test(cleanPhone)) {
    return res.status(400).json({
      error: "Invalid phone number format. Use international format (e.g. +2348012345678)"
    });
  }

  try {
    const userId = req.session.user.id;
    const cleanPhoneLower = cleanPhone.toLowerCase(); // in case someone sends uppercase

    console.log(`Adding mobile number for user ID ${userId}: ${cleanPhoneLower}`);

    // Check if this number is already used by someone else
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE phone = ? AND id != ?',
      [cleanPhoneLower, userId]
    );

    if (existing.length > 0) {
      console.log(`Duplicate phone number detected: ${cleanPhoneLower}`);
      return res.status(409).json({
        error: "This mobile number is already registered to another account"
      });
    }

    // Update the current user's phone number
    const [result] = await pool.query(
      'UPDATE users SET phone = ? WHERE id = ?',
      [cleanPhoneLower, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update session data
    req.session.user.phone = cleanPhoneLower;

    console.log(`Mobile number added successfully – User ID: ${userId}, Phone: ${cleanPhoneLower}`);

    return res.status(200).json({
      message: "Mobile number added successfully",
      phone: cleanPhoneLower
    });

  } catch (err) {
    console.error('Add mobile number error:', err);
    return res.status(500).json({ error: 'Server error while adding mobile number' });
  }
});
// GET /profile - Check current logged-in user (for testing session)
app.get('/profile', (req, res) => {
  if (req.session.user) {
    return res.json({
      loggedIn: true,
      user: req.session.user
    });
  }
  return res.status(401).json({ loggedIn: false, message: 'No active session' });
});

// GET /logout - Destroy session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// ────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /users       → create user + session');
  console.log('  GET    /profile     → check current user/session');
  console.log('  GET    /logout      → destroy session');
});