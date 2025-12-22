
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  res.json({ message: 'User registered successfully' });
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('LOGIN BODY 👉', req.body); // 🔍 DEBUG

    const email = req.body?.email;
    const password = req.body?.password;

    // ✅ HARD validation (before SQL)
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        body: req.body
      });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(String(password), user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });

  } catch (error) {
    console.error('LOGIN ERROR 👉', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Protected route
router.get('/profile', auth, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT id, name, email FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json(rows[0]);
});


router.post('/logout', (req, res) => {
  return res.status(200).json({
    message: 'Logout successful. Please delete token on client side.'
  });
});


router.post('/change-password', auth, async (req, res) => {
  try {
    console.log('CHANGE PASSWORD BODY 👉', req.body);

    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    // ✅ Validation
    if (!old_password || !new_password) {
      return res.status(400).json({
        message: 'Old password and new password are required'
      });
    }

    if (new_password.length < 4) {
      return res.status(400).json({
        message: 'New password must be at least 4 characters'
      });
    }

    // 🔍 Get user
    const [rows] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // 🔐 Compare old password
    const isMatch = await bcrypt.compare(
      String(old_password),
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Old password is incorrect'
      });
    }

    // 🔒 Hash new password
    const hashedPassword = await bcrypt.hash(
      String(new_password),
      10
    );

    // 💾 Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('CHANGE PASSWORD ERROR 👉', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});


router.get('/corporates', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE is_role = ?',
      [2]
    );

    res.json({
      status: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

router.get('/regionals/:corporate_id', async (req, res) => {
  try {
    const corporateId = req.params.corporate_id;

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE created_by = ? AND is_role = ?',
      [corporateId, 1]
    );

    res.json({
      status: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});


router.get('/units/:regional_id', async (req, res) => {
  try {
    const regionalId = req.params.regional_id;

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE created_by1 = ? AND is_role = ?',
      [regionalId, 3]
    );

    res.json({
      status: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
