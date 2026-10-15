import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { soundEngine } from '../utils/soundSynthesizer';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState({
    status: 'LOBBY',
    currentIndex: 0,
    totalQuestions: 0,
    currentQuestion: null,
    timerDuration: 20,
    timeRemaining: 20,
    isTimerRunning: false,
    doublePoints: false,
    activeHintLevel: 0,
    answeredCount: 0,
    totalPlayers: 0,
    voteDistribution: {},
    leaderboard: [],
    allPlayers: [],
    questionsList: []
  });

  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem('emoji_movie_player');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedOption, setSelectedOption] = useState(null);
  const [networkInfo, setNetworkInfo] = useState({
    localIp: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    serverPort: 3001
  });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Determine backend server host
    const host = window.location.hostname;
    // Connect to port 3001 if on dev or localhost, otherwise window origin
    const serverUrl = window.location.port === '5173'
      ? `http://${host}:3001`
      : window.location.origin;

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Conectado al servidor Emoji Movie');
      setIsConnected(true);

      // Re-join if player was previously stored
      if (player && player.nickname) {
        newSocket.emit('player:join', {
          nickname: player.nickname,
          avatar: player.avatar
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor');
      setIsConnected(false);
    });

    newSocket.on('game:state', (state) => {
      setGameState(state);
    });

    newSocket.on('game:timer_tick', ({ timeRemaining }) => {
      setGameState(prev => ({ ...prev, timeRemaining }));
    });

    newSocket.on('player:joined', (playerData) => {
      setPlayer(playerData);
      localStorage.setItem('emoji_movie_player', JSON.stringify(playerData));
    });

    newSocket.on('player:selection_confirmed', ({ selectedOption: opt }) => {
      setSelectedOption(opt);
    });

    newSocket.on('player:kicked', () => {
      alert('Has sido retirado de la partida por el administrador.');
      setPlayer(null);
      setSelectedOption(null);
      localStorage.removeItem('emoji_movie_player');
    });

    newSocket.on('network:info', (info) => {
      if (info && info.localIp) {
        setNetworkInfo(info);
      }
    });

    newSocket.on('sound:play', ({ sound }) => {
      soundEngine.play(sound);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // When question changes, reset selectedOption if question moved
  useEffect(() => {
    if (gameState.status === 'QUESTION') {
      setSelectedOption(null);
    }
  }, [gameState.currentIndex, gameState.status]);

  // Keep player score updated from gameState.allPlayers
  useEffect(() => {
    if (socket && player && gameState.allPlayers) {
      const updated = gameState.allPlayers.find(p => p.id === socket.id);
      if (updated) {
        setPlayer(prev => ({ ...prev, ...updated }));
      }
    }
  }, [gameState.allPlayers, socket]);

  // --- ACTIONS ---
  const joinGame = useCallback((nickname, avatar) => {
    if (!socket) return;
    socket.emit('player:join', { nickname, avatar });
  }, [socket]);

  const selectOption = useCallback((option) => {
    if (!socket) return;
    soundEngine.play('click');
    socket.emit('player:select_option', { option });
  }, [socket]);

  const deselectOption = useCallback(() => {
    if (!socket) return;
    soundEngine.play('click');
    socket.emit('player:deselect_option');
  }, [socket]);

  // Admin actions
  const startLobby = useCallback(() => socket?.emit('admin:start_lobby'), [socket]);
  const startQuestion = useCallback((index) => socket?.emit('admin:start_question', { index }), [socket]);
  const toggleTimer = useCallback(() => socket?.emit('admin:toggle_timer'), [socket]);
  const revealAnswer = useCallback(() => socket?.emit('admin:reveal_answer'), [socket]);
  const showRanking = useCallback(() => socket?.emit('admin:show_ranking'), [socket]);
  const showPodium = useCallback(() => socket?.emit('admin:show_podium'), [socket]);
  const nextQuestion = useCallback(() => socket?.emit('admin:next_question'), [socket]);
  const prevQuestion = useCallback(() => socket?.emit('admin:prev_question'), [socket]);
  const showHint = useCallback(() => socket?.emit('admin:show_hint'), [socket]);
  const toggleDoublePoints = useCallback(() => socket?.emit('admin:toggle_double_points'), [socket]);
  const setTimerDuration = useCallback((seconds) => socket?.emit('admin:set_timer_duration', { seconds }), [socket]);
  const kickPlayer = useCallback((playerId) => socket?.emit('admin:kick_player', { playerId }), [socket]);
  const addCustomQuestion = useCallback((q) => socket?.emit('admin:add_custom_question', q), [socket]);
  const resetGame = useCallback(() => socket?.emit('admin:reset_game'), [socket]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        gameState,
        player,
        selectedOption,
        networkInfo,
        isMuted,
        toggleMute,
        joinGame,
        selectOption,
        deselectOption,
        startLobby,
        startQuestion,
        toggleTimer,
        revealAnswer,
        showRanking,
        showPodium,
        nextQuestion,
        prevQuestion,
        showHint,
        toggleDoublePoints,
        setTimerDuration,
        kickPlayer,
        addCustomQuestion,
        resetGame
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useGame must be used within a SocketProvider');
  }
  return context;
};
