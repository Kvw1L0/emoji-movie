import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { soundEngine } from '../utils/soundSynthesizer';
import { isFirebaseConfigured } from '../lib/firebase';
import { firebaseEmojiEngine } from '../lib/firebaseEmojiEngine';
import { DEFAULT_MOVIES } from '../data/moviesData';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [gameState, setGameState] = useState({
    status: 'LOBBY',
    currentIndex: 0,
    totalQuestions: DEFAULT_MOVIES.length,
    currentQuestion: DEFAULT_MOVIES[0],
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
    questionsList: DEFAULT_MOVIES
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
    serverPort: 5173
  });
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef(null);

  // Initialize and listen to Firebase Realtime Engine
  useEffect(() => {
    if (isFirebaseConfigured()) {
      firebaseEmojiEngine.initGame();

      // 1. Global state listener
      const unsubState = firebaseEmojiEngine.onStateChange((state) => {
        if (state) {
          setGameState(prev => {
            // Trigger sound on status change
            if (prev.status !== state.status) {
              if (state.status === 'QUESTION') soundEngine.play('question_start');
              if (state.status === 'REVEAL') soundEngine.play('reveal_answer');
              if (state.status === 'RANKING') soundEngine.play('ranking_drum');
              if (state.status === 'PODIUM') soundEngine.play('victory_fanfare');
            }
            if (state.activeHintLevel > prev.activeHintLevel) {
              soundEngine.play('hint_popup');
            }
            if (state.doublePoints !== prev.doublePoints) {
              soundEngine.play('double_on');
            }

            return {
              ...prev,
              ...state,
              currentQuestion: state.currentQuestion || DEFAULT_MOVIES[state.currentIndex || 0],
              voteDistribution: state.voteDistribution || {}
            };
          });
        }
      });

      // 2. Players listener
      const unsubPlayers = firebaseEmojiEngine.onPlayersChange((players) => {
        const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
        setGameState(prev => ({
          ...prev,
          totalPlayers: players.length,
          allPlayers: sorted,
          leaderboard: sorted.slice(0, 10)
        }));

        // Update current player instance if exists
        if (player?.id) {
          const current = players.find(p => p.id === player.id);
          if (current) {
            setPlayer(prev => ({ ...prev, ...current }));
          }
        }
      });

      // 3. Answers listener
      const unsubAnswers = firebaseEmojiEngine.onAnswersChange((answers) => {
        const count = Object.keys(answers).length;
        setGameState(prev => ({
          ...prev,
          answeredCount: count
        }));

        // Update selected option for current player
        if (player?.id && answers[player.id]) {
          setSelectedOption(answers[player.id].option);
        } else if (player?.id && !answers[player.id] && gameState.status === 'QUESTION') {
          // If answer was removed
          setSelectedOption(null);
        }
      });

      setIsConnected(true);

      return () => {
        unsubState();
        unsubPlayers();
        unsubAnswers();
      };
    }
  }, [player?.id]);

  // Synchronized Timer Engine
  useEffect(() => {
    if (gameState.status === 'QUESTION' && gameState.isTimerRunning) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (!prev.isTimerRunning) return prev;
          const nextTime = Math.max(0, prev.timeRemaining - 1);

          if (nextTime <= 5 && nextTime > 0) {
            soundEngine.play('timer_tick');
          }

          const isController = typeof window !== 'undefined' && (
            window.location.pathname.includes('/admin') ||
            window.location.search.includes('view=admin') ||
            window.location.pathname.includes('/tv') ||
            window.location.search.includes('view=tv')
          );

          if (nextTime === 0) {
            clearInterval(timerRef.current);
            if (isController) {
              // Auto reveal if timer reaches 0 from controller
              firebaseEmojiEngine.revealAnswer(
                prev.currentQuestion,
                prev.doublePoints,
                prev.timerDuration
              );
            }
          }

          // Sync timer every 3 seconds to keep clients in harmony (controllers only)
          if (isController && nextTime > 0 && nextTime % 3 === 0) {
            firebaseEmojiEngine.updateTimer(nextTime, true);
          }

          return { ...prev, timeRemaining: nextTime };
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState.status, gameState.isTimerRunning]);

  // Reset selected option when question advances
  useEffect(() => {
    if (gameState.status === 'QUESTION') {
      setSelectedOption(null);
    }
  }, [gameState.currentIndex, gameState.status]);

  // --- ACTIONS ---
  const joinGame = useCallback(async (nickname, avatar) => {
    const cleanNick = (nickname || 'Jugador').trim().slice(0, 18);
    let playerId = player?.id;
    if (!playerId) {
      playerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }

    const newPlayerData = {
      id: playerId,
      nickname: cleanNick,
      avatar: avatar || '🍿',
      score: player?.score || 0,
      streak: player?.streak || 0,
      lastAnswer: null,
      isConnected: true
    };

    setPlayer(newPlayerData);
    localStorage.setItem('emoji_movie_player', JSON.stringify(newPlayerData));

    try {
      await firebaseEmojiEngine.joinPlayer(newPlayerData);
    } catch (e) {
      console.warn('Firebase join note:', e);
    }
  }, [player]);

  const selectOption = useCallback(async (option) => {
    if (!player?.id || gameState.status !== 'QUESTION') return;
    soundEngine.play('click');
    setSelectedOption(option);

    const timerDuration = gameState.timerDuration || 20;
    let timeTaken = 1;
    if (gameState.startTime) {
      const elapsed = (Date.now() - gameState.startTime) / 1000;
      timeTaken = Math.min(timerDuration, Math.max(0.2, elapsed));
    } else {
      timeTaken = Math.min(timerDuration, Math.max(0.2, timerDuration - (gameState.timeRemaining || 0)));
    }

    await firebaseEmojiEngine.selectOption(player.id, option, timeTaken);
  }, [player, gameState.status, gameState.timerDuration, gameState.timeRemaining, gameState.startTime]);

  const deselectOption = useCallback(async () => {
    if (!player?.id || gameState.status !== 'QUESTION') return;
    soundEngine.play('click');
    setSelectedOption(null);
    await firebaseEmojiEngine.deselectOption(player.id);
  }, [player, gameState.status]);

  // Admin Actions
  const startLobby = useCallback(() => firebaseEmojiEngine.startLobby(), []);
  
  const startQuestion = useCallback((index) => {
    const idx = index !== undefined ? index : gameState.currentIndex;
    firebaseEmojiEngine.startQuestion(idx, gameState.timerDuration);
  }, [gameState.currentIndex, gameState.timerDuration]);

  const toggleTimer = useCallback(() => {
    firebaseEmojiEngine.toggleTimer(gameState.isTimerRunning);
  }, [gameState.isTimerRunning]);

  const revealAnswer = useCallback(() => {
    firebaseEmojiEngine.revealAnswer(
      gameState.currentQuestion,
      gameState.doublePoints,
      gameState.timerDuration
    );
  }, [gameState.currentQuestion, gameState.doublePoints, gameState.timerDuration]);

  const showRanking = useCallback(() => firebaseEmojiEngine.showRanking(), []);
  const showPodium = useCallback(() => firebaseEmojiEngine.showPodium(), []);

  const nextQuestion = useCallback(() => {
    if (gameState.currentIndex + 1 < gameState.totalQuestions) {
      firebaseEmojiEngine.startQuestion(gameState.currentIndex + 1, gameState.timerDuration);
    } else {
      firebaseEmojiEngine.showPodium();
    }
  }, [gameState.currentIndex, gameState.totalQuestions, gameState.timerDuration]);

  const prevQuestion = useCallback(() => {
    if (gameState.currentIndex > 0) {
      firebaseEmojiEngine.startQuestion(gameState.currentIndex - 1, gameState.timerDuration);
    }
  }, [gameState.currentIndex, gameState.timerDuration]);

  const showHint = useCallback(() => {
    firebaseEmojiEngine.showHint(gameState.activeHintLevel);
  }, [gameState.activeHintLevel]);

  const toggleDoublePoints = useCallback(() => {
    firebaseEmojiEngine.toggleDoublePoints(gameState.doublePoints);
  }, [gameState.doublePoints]);

  const toggleTvOptions = useCallback(() => {
    firebaseEmojiEngine.toggleTvOptions(gameState.showTvOptions);
  }, [gameState.showTvOptions]);

  const setTimerDuration = useCallback((sec) => {
    firebaseEmojiEngine.setTimerDuration(sec);
  }, []);

  const kickPlayer = useCallback((pId) => {
    firebaseEmojiEngine.kickPlayer(pId);
  }, []);

  const addCustomQuestion = useCallback((q) => {
    return firebaseEmojiEngine.addCustomQuestion(q);
  }, []);

  const resetGame = useCallback(() => {
    firebaseEmojiEngine.resetGame();
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  return (
    <SocketContext.Provider
      value={{
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
        toggleTvOptions,
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
