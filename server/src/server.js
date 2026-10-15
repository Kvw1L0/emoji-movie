import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import { GameManager } from './gameState.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager(io);

// Helper function to get local Wi-Fi / Ethernet IPv4 address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3001;
const LOCAL_IP = getLocalIpAddress();

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gameStatus: gameManager.status,
    totalPlayers: gameManager.players.size,
    localIp: LOCAL_IP,
    port: PORT
  });
});

app.get('/api/network-info', (req, res) => {
  res.json({
    localIp: LOCAL_IP,
    serverPort: PORT,
    clientUrl: `http://${LOCAL_IP}:5173`
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  // Send current game state immediately upon connection
  socket.emit('game:state', gameManager.getStatePayload());
  socket.emit('network:info', {
    localIp: LOCAL_IP,
    serverPort: PORT
  });

  // --- PLAYER EVENTS ---
  socket.on('player:join', ({ nickname, avatar }) => {
    const player = gameManager.addPlayer(socket.id, nickname, avatar);
    socket.emit('player:joined', player);
  });

  socket.on('player:select_option', ({ option }) => {
    gameManager.selectOption(socket.id, option);
  });

  socket.on('player:deselect_option', () => {
    gameManager.deselectOption(socket.id);
  });

  // --- ADMIN EVENTS ---
  socket.on('admin:start_lobby', () => {
    gameManager.startLobby();
  });

  socket.on('admin:start_question', ({ index } = {}) => {
    gameManager.startQuestion(index !== undefined ? index : null);
  });

  socket.on('admin:toggle_timer', () => {
    gameManager.toggleTimer();
  });

  socket.on('admin:reveal_answer', () => {
    gameManager.revealAnswer();
  });

  socket.on('admin:show_ranking', () => {
    gameManager.showRanking();
  });

  socket.on('admin:show_podium', () => {
    gameManager.showPodium();
  });

  socket.on('admin:next_question', () => {
    gameManager.nextQuestion();
  });

  socket.on('admin:prev_question', () => {
    gameManager.prevQuestion();
  });

  socket.on('admin:show_hint', () => {
    gameManager.showHint();
  });

  socket.on('admin:toggle_double_points', () => {
    gameManager.toggleDoublePoints();
  });

  socket.on('admin:set_timer_duration', ({ seconds }) => {
    gameManager.setTimerDuration(seconds);
  });

  socket.on('admin:kick_player', ({ playerId }) => {
    gameManager.kickPlayer(playerId);
  });

  socket.on('admin:add_custom_question', (questionData) => {
    const success = gameManager.addCustomQuestion(questionData);
    socket.emit('admin:custom_question_result', { success });
  });

  socket.on('admin:reset_game', () => {
    gameManager.resetGame();
  });

  socket.on('admin:request_sync', () => {
    gameManager.broadcastState();
  });

  // Disconnection
  socket.on('disconnect', () => {
    gameManager.removePlayer(socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Emoji Movie Server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://${LOCAL_IP}:${PORT}`);
});
