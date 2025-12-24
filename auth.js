const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Example route: test JWT
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Example login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Dummy validation (replace with real DB logic)
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router; // <--- must export router
