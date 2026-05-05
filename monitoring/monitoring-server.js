const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected clients count
let connectedClients = 0;

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Client connected. Total: ${connectedClients}`);

    // Send initial data
    sendStats(socket);

    // Send stats every 2 seconds
    const interval = setInterval(() => {
        sendStats(socket);
    }, 2000);

    socket.on('disconnect', () => {
        connectedClients--;
        clearInterval(interval);
        console.log(`Client disconnected. Total: ${connectedClients}`);
    });
});

async function sendStats(socket) {
    try {
        const [cpu, mem, fsSize, osInfo, networkStats] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.fsSize(),
            si.osInfo(),
            si.networkStats()
        ]);

        const stats = {
            cpu: {
                usage: cpu.currentLoad?.currentLoad || 0,
                cores: cpu.cores,
                model: cpu.manufacturer + ' ' + cpu.brand
            },
            memory: {
                total: (mem.total / 1024 / 1024 / 1024).toFixed(2), // GB
                used: (mem.used / 1024 / 1024 / 1024).toFixed(2), // GB
                free: (mem.free / 1024 / 1024 / 1024).toFixed(2), // GB
                usagePercent: ((mem.used / mem.total) * 100).toFixed(1)
            },
            disk: fsSize.map(disk => ({
                filesystem: disk.fs,
                size: (disk.size / 1024 / 1024 / 1024).toFixed(2), // GB
                used: (disk.used / 1024 / 1024 / 1024).toFixed(2), // GB
                available: (disk.available / 1024 / 1024 / 1024).toFixed(2), // GB
                usePercent: disk.use,
                mount: disk.mount
            })),
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                uptime: osInfo.uptime
            },
            network: networkStats.map(net => ({
                interface: net.iface,
                rx_bytes: (net.rx_bytes / 1024 / 1024).toFixed(2), // MB
                tx_bytes: (net.tx_bytes / 1024 / 1024).toFixed(2) // MB
            })),
            timestamp: new Date().toISOString()
        };

        socket.emit('stats', stats);
    } catch (error) {
        console.error('Error getting system stats:', error);
        socket.emit('error', { message: 'Failed to get system stats' });
    }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Monitoring server running on port ${PORT}`);
});
