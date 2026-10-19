import { DEFAULT_MOVIES, isAnswerCorrect } from './moviesData.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.questions = [...DEFAULT_MOVIES];
    this.currentIndex = 0;
    this.status = 'LOBBY'; // LOBBY, QUESTION, REVEAL, RANKING, PODIUM
    this.timerDuration = 20; // Seconds
    this.timeRemaining = 20;
    this.isTimerRunning = false;
    this.timerInterval = null;
    this.doublePoints = false;
    this.showTvOptions = false;
    this.activeHintLevel = 0; // 0: None, 1: Hint 1, 2: Hint 2

    // Players: Map socketId -> player object
    this.players = new Map();

    // Round answers: Map socketId -> { option, timeTaken, timestamp }
    this.currentAnswers = new Map();

    // Question start timestamp for latency-accurate speed bonus
    this.questionStartTime = 0;
  }

  // --- PLAYER MANAGEMENT ---
  addPlayer(socketId, nickname, avatar = '🍿') {
    // Avoid empty or duplicate names
    const cleanNick = (nickname || 'Jugador').trim().slice(0, 20);
    const player = {
      id: socketId,
      nickname: cleanNick,
      avatar: avatar || '🍿',
      score: 0,
      streak: 0,
      lastAnswer: null, // { option, isCorrect, pointsEarned }
      isConnected: true,
      joinedAt: Date.now()
    };
    this.players.set(socketId, player);
    this.broadcastState();
    return player;
  }

  removePlayer(socketId) {
    if (this.players.has(socketId)) {
      this.players.delete(socketId);
      this.currentAnswers.delete(socketId);
      this.broadcastState();
    }
  }

  kickPlayer(playerId) {
    if (this.players.has(playerId)) {
      const socket = this.io.sockets.sockets.get(playerId);
      if (socket) {
        socket.emit('player:kicked');
        socket.disconnect(true);
      }
      this.players.delete(playerId);
      this.currentAnswers.delete(playerId);
      this.broadcastState();
    }
  }

  // --- PLAYER SELECTION / DESELECTION ---
  selectOption(socketId, option) {
    if (this.status !== 'QUESTION') return;
    const player = this.players.get(socketId);
    if (!player) return;

    const timeTaken = Math.max(0.5, ((Date.now() - this.questionStartTime) / 1000));

    this.currentAnswers.set(socketId, {
      option,
      timeTaken: Math.min(this.timerDuration, timeTaken),
      timestamp: Date.now()
    });

    // Notify player their selection was registered
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('player:selection_confirmed', { selectedOption: option });
    }

    this.broadcastState();
  }

  deselectOption(socketId) {
    if (this.status !== 'QUESTION') return;
    if (this.currentAnswers.has(socketId)) {
      this.currentAnswers.delete(socketId);
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('player:selection_confirmed', { selectedOption: null });
      }
      this.broadcastState();
    }
  }

  // --- GAME FLOW CONTROLS ---
  startLobby() {
    this.stopTimer();
    this.status = 'LOBBY';
    this.broadcastState();
  }

  startQuestion(index = null) {
    if (index !== null && index >= 0 && index < this.questions.length) {
      this.currentIndex = index;
    }
    this.stopTimer();
    this.status = 'QUESTION';
    this.showTvOptions = false;
    this.activeHintLevel = 0;
    this.currentAnswers.clear();
    this.timeRemaining = this.timerDuration;
    this.questionStartTime = Date.now();

    // Reset last answer display on players
    for (const player of this.players.values()) {
      player.lastAnswer = null;
    }

    this.isTimerRunning = true;
    this.runTimer();
    this.broadcastState();
    this.io.emit('sound:play', { sound: 'question_start' });
  }

  toggleTvOptions() {
    this.showTvOptions = !this.showTvOptions;
    this.broadcastState();
  }

  runTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isTimerRunning) return;

      this.timeRemaining = Math.max(0, this.timeRemaining - 1);

      // Play tick sound on critical 5 seconds
      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        this.io.emit('sound:play', { sound: 'timer_tick' });
      }

      this.io.emit('game:timer_tick', {
        timeRemaining: this.timeRemaining,
        timerDuration: this.timerDuration
      });

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.revealAnswer();
      }
    }, 1000);
  }

  toggleTimer() {
    if (this.status !== 'QUESTION') return;
    this.isTimerRunning = !this.isTimerRunning;
    this.broadcastState();
  }

  stopTimer() {
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  revealAnswer() {
    this.stopTimer();
    this.status = 'REVEAL';
    this.showTvOptions = true;

    const currentQ = this.getCurrentQuestion();
    const correctTitle = currentQ ? currentQ.title : '';
    const multiplier = this.doublePoints ? 2 : 1;

    // Calculate scores for all players
    for (const [playerId, player] of this.players.entries()) {
      const answer = this.currentAnswers.get(playerId);
      const isCorrect = isAnswerCorrect(answer?.option, currentQ);

      if (isCorrect) {
        const basePoints = 1000;
        const timeRatio = Math.max(0, (this.timerDuration - answer.timeTaken) / this.timerDuration);
        const speedBonus = Math.round(timeRatio * 500);
        player.streak += 1;
        const streakBonus = Math.min(500, (player.streak - 1) * 100);
        const roundPoints = Math.round((basePoints + speedBonus + streakBonus) * multiplier);

        player.score += roundPoints;
        player.lastAnswer = {
          option: answer.option,
          isCorrect: true,
          pointsEarned: roundPoints,
          speedBonus,
          streak: player.streak
        };
      } else {
        player.streak = 0;
        player.lastAnswer = {
          option: answer ? answer.option : null,
          isCorrect: false,
          pointsEarned: 0,
          streak: 0
        };
      }
    }

    this.broadcastState();
    this.io.emit('sound:play', { sound: 'reveal_answer' });
  }

  showRanking() {
    this.stopTimer();
    this.status = 'RANKING';
    this.broadcastState();
    this.io.emit('sound:play', { sound: 'ranking_drum' });
  }

  showPodium() {
    this.stopTimer();
    this.status = 'PODIUM';
    this.broadcastState();
    this.io.emit('sound:play', { sound: 'victory_fanfare' });
  }

  nextQuestion() {
    if (this.currentIndex + 1 < this.questions.length) {
      this.currentIndex += 1;
      this.startQuestion();
    } else {
      this.showPodium();
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.startQuestion();
    }
  }

  showHint() {
    if (this.status !== 'QUESTION' && this.status !== 'REVEAL') return;
    if (this.activeHintLevel < 2) {
      this.activeHintLevel += 1;
      this.broadcastState();
      this.io.emit('sound:play', { sound: 'hint_popup' });
    }
  }

  toggleDoublePoints() {
    this.doublePoints = !this.doublePoints;
    this.broadcastState();
    this.io.emit('sound:play', { sound: this.doublePoints ? 'double_on' : 'double_off' });
  }

  setTimerDuration(seconds) {
    const val = parseInt(seconds, 10);
    if (!isNaN(val) && val >= 5 && val <= 120) {
      this.timerDuration = val;
      if (this.status === 'QUESTION' && !this.isTimerRunning) {
        this.timeRemaining = val;
      }
      this.broadcastState();
    }
  }

  addCustomQuestion(newQ) {
    if (!newQ || !newQ.title || !newQ.emojis || !Array.isArray(newQ.options)) return false;
    const questionObj = {
      id: `custom-${Date.now()}`,
      title: newQ.title.trim(),
      emojis: newQ.emojis.trim(),
      options: newQ.options.map(o => o.trim()),
      category: newQ.category || 'Personalizada',
      year: newQ.year || new Date().getFullYear(),
      director: newQ.director || 'Desconocido',
      genre: newQ.genre || 'Cine',
      hint1: newQ.hint1 || `Película de ${newQ.category || 'Cine'}`,
      hint2: newQ.hint2 || '¡Mira bien los emoticones!',
      trivia: newQ.trivia || 'Pregunta creada en vivo por el Administrador.'
    };
    this.questions.push(questionObj);
    this.broadcastState();
    return true;
  }

  resetGame() {
    this.stopTimer();
    this.currentIndex = 0;
    this.status = 'LOBBY';
    this.activeHintLevel = 0;
    this.doublePoints = false;
    this.currentAnswers.clear();
    for (const player of this.players.values()) {
      player.score = 0;
      player.streak = 0;
      player.lastAnswer = null;
    }
    this.broadcastState();
  }

  // --- STATS & DATA SERIALIZERS ---
  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  getVoteDistribution() {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return {};

    const distribution = {};
    for (const opt of currentQ.options) {
      distribution[opt] = 0;
    }

    for (const answer of this.currentAnswers.values()) {
      if (answer && answer.option && distribution[answer.option] !== undefined) {
        distribution[answer.option] += 1;
      }
    }
    return distribution;
  }

  getLeaderboard() {
    return Array.from(this.players.values())
      .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
  }

  getStatePayload() {
    const currentQ = this.getCurrentQuestion();
    const leaderboard = this.getLeaderboard();
    const voteDistribution = this.getVoteDistribution();
    const answeredCount = this.currentAnswers.size;
    const totalPlayers = this.players.size;

    return {
      status: this.status,
      currentIndex: this.currentIndex,
      totalQuestions: this.questions.length,
      currentQuestion: currentQ,
      timerDuration: this.timerDuration,
      timeRemaining: this.timeRemaining,
      isTimerRunning: this.isTimerRunning,
      doublePoints: this.doublePoints,
      showTvOptions: this.showTvOptions,
      activeHintLevel: this.activeHintLevel,
      answeredCount,
      totalPlayers,
      voteDistribution,
      leaderboard: leaderboard.slice(0, 10), // Top 10
      allPlayers: leaderboard,
      questionsList: this.questions.map((q, idx) => ({
        id: q.id,
        index: idx,
        title: q.title,
        emojis: q.emojis,
        category: q.category
      }))
    };
  }

  broadcastState() {
    this.io.emit('game:state', this.getStatePayload());
  }
}
