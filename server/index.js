const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store active connections
const connections = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle user identification
  socket.on('IDENTIFY', ({ userId, userType }) => {
    connections.set(socket.id, { userId, userType });
    console.log(`${userType} identified:`, userId);
  });

  // Handle itinerary updates
  socket.on('ITINERARY_UPDATE', (data) => {
    console.log('Itinerary update:', data);
    socket.broadcast.emit('ITINERARY_UPDATE', data);
  });

  // Handle notes updates
  socket.on('NOTES_UPDATE', (data) => {
    console.log('Notes update:', data);
    socket.broadcast.emit('NOTES_UPDATE', data);
  });

  // Handle package status updates
  socket.on('PACKAGE_UPDATE', (data) => {
    console.log('Package update:', data);
    socket.broadcast.emit('PACKAGE_UPDATE', data);
  });

  // Handle location updates
  socket.on('LOCATION_UPDATE', (data) => {
    console.log('Location update:', data);
    socket.broadcast.emit('LOCATION_UPDATE', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connections.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});