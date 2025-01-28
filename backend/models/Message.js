const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    default: 'everyone'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  },
  socketID: String
}, { 
  timestamps: true 
});

// Index for faster querying of chat history
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 }); // Index for unread messages

module.exports = mongoose.model('Message', messageSchema);
