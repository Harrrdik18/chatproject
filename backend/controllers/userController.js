const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);
    res.status(201).json({ token, username });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed. Please try again.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const currentUser = req.user.username;
    
    const users = await User.find(
      { username: { $ne: currentUser } },
      { username: 1, _id: 0 }
    );

    // Get last message and unread count for each user
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      // Get the last message between current user and this user
      const lastMessage = await Message.findOne({
        $or: [
          { sender: currentUser, recipient: user.username },
          { sender: user.username, recipient: currentUser }
        ]
      })
      .sort({ createdAt: -1 })
      .select('text createdAt sender');

      // Get unread message count
      const unreadCount = await Message.countDocuments({
        sender: user.username,
        recipient: currentUser,
        read: false
      });

      return {
        username: user.username,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          time: lastMessage.createdAt,
          sender: lastMessage.sender
        } : null,
        unreadCount
      };
    }));

    // Sort users by last message time
    usersWithDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
    });

    res.json(usersWithDetails);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

module.exports = {
  register,
  login,
  getAllUsers
};
