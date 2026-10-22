import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { SocketService } from './services/SocketService';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    game: 'Skribbl.io Clone',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

const socketService = new SocketService(io);
socketService.registerHandlers();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Skribbl Game Server running on port ${PORT}`);
});
