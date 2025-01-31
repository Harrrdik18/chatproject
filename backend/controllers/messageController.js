const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const { recipient } = req.query;
    const username = req.user.username;

    let query = {};
    if (recipient && recipient !== 'everyone') {
      query = {
        $or: [
          { sender: username, recipient: recipient },
          { sender: recipient, recipient: username }
        ]
      };
    } else {
      query = { recipient: 'everyone' };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages.reverse()); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRecentChats = async (req, res) => {
  try {
    const username = req.user.username;

    const recentChats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: username },
            { recipient: username }
          ],
          recipient: { $ne: 'everyone' }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', username] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$text' },
          lastMessageTime: { $first: '$createdAt' }
        }
      },
      {
        $project: {
          username: '$_id',
          lastMessage: 1,
          lastMessageTime: 1,
          _id: 0
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(recentChats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const saveMessage = async (messageData) => {
  try {
    const message = new Message({
      text: messageData.text,
      sender: messageData.name,
      recipient: messageData.recipient || 'everyone',
      isPrivate: messageData.recipient && messageData.recipient !== 'everyone',
      socketID: messageData.socketID
    });
    await message.save();
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

module.exports = {
  getMessages,
  getRecentChats,
  saveMessage
};
