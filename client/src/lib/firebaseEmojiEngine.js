import { database } from './firebase.js';
import { ref, set, get, onValue, update, remove } from 'firebase/database';
import { DEFAULT_MOVIES, isAnswerCorrect } from '../data/moviesData.js';

export class FirebaseEmojiEngine {
  constructor() {
    this.db = database;
    this.questions = [...DEFAULT_MOVIES];
  }

  // 1. Listen to global state
  onStateChange(callback) {
    if (!this.db) return () => {};
    const stateRef = ref(this.db, 'emoji_movie/state');
    return onValue(stateRef, (snapshot) => {
      const val = snapshot.val();
      if (val) callback(val);
    });
  }

  // 2. Listen to connected players
  onPlayersChange(callback) {
    if (!this.db) return () => {};
    const playersRef = ref(this.db, 'emoji_movie/players');
    return onValue(playersRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list = Object.values(val);
      callback(list);
    });
  }

  // 3. Listen to answers in current round
  onAnswersChange(callback) {
    if (!this.db) return () => {};
    const answersRef = ref(this.db, 'emoji_movie/answers');
    return onValue(answersRef, (snapshot) => {
      const val = snapshot.val() || {};
      callback(val);
    });
  }

  // 4. Initialize State if not present
  async initGame() {
    if (!this.db) return;
    const stateRef = ref(this.db, 'emoji_movie/state');
    const snap = await get(stateRef);
    if (!snap.exists()) {
      await set(stateRef, {
        status: 'LOBBY',
        currentIndex: 0,
        totalQuestions: this.questions.length,
        currentQuestion: this.questions[0],
        timerDuration: 20,
        timeRemaining: 20,
        isTimerRunning: false,
        doublePoints: false,
        activeHintLevel: 0,
        showTvOptions: false,
        voteDistribution: {},
        updatedAt: Date.now()
      });
    }
  }

  // 5. Register Player
  async joinPlayer(player) {
    if (!this.db || !player?.id) return;
    const playerRef = ref(this.db, `emoji_movie/players/${player.id}`);
    const snap = await get(playerRef);
    const existing = snap.val() || {};

    const updated = {
      id: player.id,
      nickname: player.nickname || existing.nickname || 'Jugador',
      avatar: player.avatar || existing.avatar || '🍿',
      score: existing.score || 0,
      streak: existing.streak || 0,
      lastAnswer: existing.lastAnswer || null,
      lastSeen: Date.now(),
      isConnected: true
    };

    await set(playerRef, updated);
    return updated;
  }

  // 6. Player Option Selection (Clickable / Deselectable)
  async selectOption(playerId, option, timeTaken = 1) {
    if (!this.db || !playerId) return;
    const answerRef = ref(this.db, `emoji_movie/answers/${playerId}`);
    await set(answerRef, {
      option,
      timeTaken: Math.max(0.5, timeTaken),
      timestamp: Date.now()
    });
  }

  async deselectOption(playerId) {
    if (!this.db || !playerId) return;
    const answerRef = ref(this.db, `emoji_movie/answers/${playerId}`);
    await remove(answerRef);
  }

  // 7. Admin Flow Controls
  async startLobby() {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      status: 'LOBBY',
      isTimerRunning: false,
      updatedAt: Date.now()
    });
    await remove(ref(this.db, 'emoji_movie/answers'));
  }

  async startQuestion(index = 0, timerDuration = 20) {
    if (!this.db) return;
    const qIndex = Math.max(0, Math.min(index, this.questions.length - 1));
    const question = this.questions[qIndex];

    await remove(ref(this.db, 'emoji_movie/answers'));

    await update(ref(this.db, 'emoji_movie/state'), {
      status: 'QUESTION',
      currentIndex: qIndex,
      currentQuestion: question,
      timerDuration: timerDuration,
      timeRemaining: timerDuration,
      startTime: Date.now(),
      isTimerRunning: true,
      activeHintLevel: 0,
      showTvOptions: false,
      voteDistribution: {},
      updatedAt: Date.now()
    });
  }

  async updateTimer(timeRemaining, isTimerRunning) {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      timeRemaining,
      isTimerRunning
    });
  }

  async toggleTimer(isCurrentlyRunning) {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      isTimerRunning: !isCurrentlyRunning
    });
  }

  async revealAnswer(currentQuestion, doublePoints = false, timerDuration = 20) {
    if (!this.db || !currentQuestion) return;

    // Get current answers and players
    const [answersSnap, playersSnap] = await Promise.all([
      get(ref(this.db, 'emoji_movie/answers')),
      get(ref(this.db, 'emoji_movie/players'))
    ]);

    const answers = answersSnap.val() || {};
    const players = playersSnap.val() || {};
    const correctTitle = currentQuestion.correctAnswer || currentQuestion.title;
    const multiplier = doublePoints ? 2 : 1;

    const distribution = {};
    for (const opt of currentQuestion.options) {
      distribution[opt] = 0;
    }

    const playerUpdates = {};

    for (const [pId, pData] of Object.entries(players)) {
      const pAnswer = answers[pId];
      if (pAnswer?.option && distribution[pAnswer.option] !== undefined) {
        distribution[pAnswer.option] += 1;
      }

      const isCorrect = isAnswerCorrect(pAnswer?.option, currentQuestion);
      let newScore = pData.score || 0;
      let newStreak = isCorrect ? (pData.streak || 0) + 1 : 0;
      let pointsEarned = 0;
      let speedBonus = 0;

      if (isCorrect) {
        const timeTaken = pAnswer?.timeTaken || timerDuration / 2;
        const timeRatio = Math.max(0, (timerDuration - timeTaken) / timerDuration);
        speedBonus = Math.round(timeRatio * 500);
        const streakBonus = Math.min(500, (newStreak - 1) * 100);
        pointsEarned = Math.round((1000 + speedBonus + streakBonus) * multiplier);
        newScore += pointsEarned;
      }

      playerUpdates[`emoji_movie/players/${pId}/score`] = newScore;
      playerUpdates[`emoji_movie/players/${pId}/streak`] = newStreak;
      playerUpdates[`emoji_movie/players/${pId}/lastAnswer`] = {
        option: pAnswer?.option || null,
        isCorrect,
        pointsEarned,
        speedBonus,
        streak: newStreak
      };
    }

    // Apply player updates
    if (Object.keys(playerUpdates).length > 0) {
      await update(ref(this.db), playerUpdates);
    }

    // Update state to REVEAL
    await update(ref(this.db, 'emoji_movie/state'), {
      status: 'REVEAL',
      isTimerRunning: false,
      showTvOptions: true,
      voteDistribution: distribution,
      updatedAt: Date.now()
    });
  }

  async showRanking() {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      status: 'RANKING',
      isTimerRunning: false,
      updatedAt: Date.now()
    });
  }

  async showPodium() {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      status: 'PODIUM',
      isTimerRunning: false,
      updatedAt: Date.now()
    });
  }

  async showHint(currentLevel) {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      activeHintLevel: Math.min(2, (currentLevel || 0) + 1)
    });
  }

  async toggleDoublePoints(currentVal) {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      doublePoints: !currentVal
    });
  }

  async toggleTvOptions(currentVal) {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      showTvOptions: !currentVal
    });
  }

  async setTimerDuration(seconds) {
    if (!this.db) return;
    await update(ref(this.db, 'emoji_movie/state'), {
      timerDuration: Number(seconds),
      timeRemaining: Number(seconds)
    });
  }

  async kickPlayer(playerId) {
    if (!this.db || !playerId) return;
    await remove(ref(this.db, `emoji_movie/players/${playerId}`));
    await remove(ref(this.db, `emoji_movie/answers/${playerId}`));
  }

  async resetGame() {
    if (!this.db) return;
    const playersSnap = await get(ref(this.db, 'emoji_movie/players'));
    const players = playersSnap.val() || {};

    const playerResets = {};
    for (const pId of Object.keys(players)) {
      playerResets[`emoji_movie/players/${pId}/score`] = 0;
      playerResets[`emoji_movie/players/${pId}/streak`] = 0;
      playerResets[`emoji_movie/players/${pId}/lastAnswer`] = null;
    }

    if (Object.keys(playerResets).length > 0) {
      await update(ref(this.db), playerResets);
    }

    await remove(ref(this.db, 'emoji_movie/answers'));

    await update(ref(this.db, 'emoji_movie/state'), {
      status: 'LOBBY',
      currentIndex: 0,
      currentQuestion: this.questions[0],
      isTimerRunning: false,
      doublePoints: false,
      activeHintLevel: 0,
      voteDistribution: {},
      updatedAt: Date.now()
    });
  }

  async addCustomQuestion(q) {
    if (!q || !q.title || !q.emojis) return;
    const questionObj = {
      id: `custom-${Date.now()}`,
      title: q.title.trim(),
      correctAnswer: q.correctAnswer?.trim() || q.title.trim(),
      emojis: q.emojis?.trim() || '🎬 ⭐ 🍿',
      photoUrl: q.photoUrl?.trim() || q.image?.trim() || '',
      options: q.options.map(o => o.trim()),
      category: q.category || 'Personalizada',
      year: q.year || new Date().getFullYear(),
      director: q.director || 'Desconocido',
      genre: q.genre || 'Cine / Especial',
      hint1: q.hint1 || 'Pregunta agregada por el Administrador',
      hint2: q.hint2 || '¡Mira bien los detalles en pantalla!',
      trivia: q.trivia || 'Pregunta creada en vivo.'
    };
    this.questions.push(questionObj);
    return questionObj;
  }
}

export const firebaseEmojiEngine = new FirebaseEmojiEngine();
