const { saveMessage } = require('../controllers/messageController');

let users = [];

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('newUser', (data) => {
      users.push(data);
      io.emit('newUserResponse', users);
    });

    socket.on('message', async (data) => {
      try {
        await saveMessage(data);
        io.emit('messageResponse', data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      users = users.filter((user) => user.socketID !== socket.id);
      io.emit('newUserResponse', users);
    });
  });
};

module.exports = setupSocket;
