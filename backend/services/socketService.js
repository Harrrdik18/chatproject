const { saveMessage } = require('../controllers/messageController');

const activeUsers = new Map(); 

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('newUser', (data) => {
      activeUsers.set(data.userName, {
        socketID: socket.id
      });

      io.emit('newUserResponse', Array.from(activeUsers.keys()).map(userName => ({
        userName,
        socketID: activeUsers.get(userName).socketID
      })));
    });

    socket.on('message', async (data) => {
      try {
        const savedMessage = await saveMessage(data);
        const messageToSend = {
          ...data,
          _id: savedMessage._id
        };

        if (data.isPrivate) {
          const recipientInfo = activeUsers.get(data.recipient);
          if (recipientInfo) {
            io.to(recipientInfo.socketID).emit('messageResponse', messageToSend);
            socket.emit('messageResponse', messageToSend);
          }
        } else {
          io.emit('messageResponse', messageToSend);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('messageError', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      for (const [userName, userInfo] of activeUsers.entries()) {
        if (userInfo.socketID === socket.id) {
          activeUsers.delete(userName);
          io.emit('newUserResponse', Array.from(activeUsers.keys()).map(userName => ({
            userName,
            socketID: activeUsers.get(userName).socketID
          })));
          break;
        }
      }
    });
  });
};

module.exports = setupSocket;
