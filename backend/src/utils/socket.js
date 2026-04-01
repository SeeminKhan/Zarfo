// WebSocket setup for real-time updates
import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join hotel-specific room
    socket.on('join-hotel', (hotelId) => {
      socket.join(`hotel-${hotelId}`);
      console.log(`Socket ${socket.id} joined hotel-${hotelId}`);
    });

    // Join food-specific room for monitoring
    socket.on('monitor-food', (foodId) => {
      socket.join(`food-${foodId}`);
      console.log(`Socket ${socket.id} monitoring food-${foodId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit price update to all clients monitoring a food item
export const emitPriceUpdate = (foodId, data) => {
  if (io) {
    io.to(`food-${foodId}`).emit('price-update', {
      foodId,
      ...data,
      timestamp: new Date(),
    });
  }
};

// Emit status change to hotel dashboard
export const emitStatusChange = (hotelId, foodId, status, data = {}) => {
  if (io) {
    io.to(`hotel-${hotelId}`).emit('status-change', {
      foodId,
      status,
      ...data,
      timestamp: new Date(),
    });
  }
};

// Emit analytics update
export const emitAnalyticsUpdate = (hotelId, analytics) => {
  if (io) {
    io.to(`hotel-${hotelId}`).emit('analytics-update', {
      ...analytics,
      timestamp: new Date(),
    });
  }
};

// Emit agent decision
export const emitAgentDecision = (hotelId, foodId, decision) => {
  if (io) {
    io.to(`hotel-${hotelId}`).emit('agent-decision', {
      foodId,
      decision,
      timestamp: new Date(),
    });
  }
};
