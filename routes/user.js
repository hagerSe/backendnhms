const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Fake user for demonstration
const user = { id: 1, username: 'admin' };

router.post('/login', (req, res) => {
    // Normally you'd check username & password here
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Protected route example
router.get('/dashboard', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: `Welcome user ${decoded.userId}` });
    } catch (err) {
        res.sendStatus(403); // Invalid token
    }
});

module.exports = router;
