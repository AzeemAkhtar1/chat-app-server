const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketConfig = require('./config/socket');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = [
    'https://chat-app-client-git-main-azeem-akhtars-projects.vercel.app',
    'https://chat-app-client-1qg9sz5dg-azeem-akhtars-projects.vercel.app',
    'http://localhost:8080'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS not allowed'));
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Socket.io configuration
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io configuration
socketConfig(io);

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});