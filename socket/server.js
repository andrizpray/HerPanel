const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on user ID (if provided)
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});

module.exports = { io };