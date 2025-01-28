const express = require('express');
const router = express.Router();
const { getMessages, getRecentChats } = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Get messages (group or private)
router.get('/', auth, getMessages);

// Get recent chats
router.get('/recent', auth, getRecentChats);

module.exports = router;
