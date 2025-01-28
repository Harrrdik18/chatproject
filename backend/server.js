const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
require('dotenv').config();

// Import routes and services
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const setupSocket = require('./services/socketService');
const connectDB = require('./config/db');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Setup Socket.io
const io = require('socket.io')(http, {
  cors: {
    origin: true
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Initialize socket
setupSocket(io);

const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
