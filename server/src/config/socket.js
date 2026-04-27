const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisConnection } = require('./redis');

let io;
const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://envsync-sockets.onrender.com',
          'https://envsync-rsm.vercel.app',
          process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Use Redis adapter for multi-instance scaling
  const pubClient = redisConnection;
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
    });
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
module.exports = {
  initSocket,
  getIO
};
