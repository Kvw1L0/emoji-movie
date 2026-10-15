import React, { useState } from 'react';
import { useGame } from '../context/SocketContext';
import { soundEngine } from '../utils/soundSynthesizer';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Eye,
  Trophy,
  Award,
  Lightbulb,
  Flame,
  Clock,
  Users,
  UserX,
  PlusCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

export const AdminView = () => {
  const {
    gameState,
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
    resetGame,
    isMuted,
    toggleMute
  } = useGame();

  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customEmojis, setCustomEmojis] = useState('');
  const [customOptions, setCustomOptions] = useState(['', '', '', '']);
  const [customCategory, setCustomCategory] = useState('Personalizada');
  const [customHint1, setCustomHint1] = useState('');
  const [customHint2, setCustomHint2] = useState('');

  const currentQ = gameState.currentQuestion;

  const handleAddQuestionSubmit = (e) => {
    e.preventDefault();
    if (!customTitle || !customEmojis || customOptions.some(o => !o.trim())) {
      alert('Completa el título, emojis y las 4 opciones.');
      return;
    }

    const optionsArray = customOptions.map(o => o.trim());
    if (!optionsArray.includes(customTitle.trim())) {
      optionsArray[0] = customTitle.trim();
    }

    addCustomQuestion({
      title: customTitle,
      emojis: customEmojis,
      options: optionsArray,
      category: customCategory,
      hint1: customHint1 || `Película de ${customCategory}`,
      hint2: customHint2 || '¡Mira bien los emoticones!'
    });

    setCustomTitle('');
    setCustomEmojis('');
    setCustomOptions(['', '', '', '']);
    setCustomHint1('');
    setCustomHint2('');
    setShowAddModal(false);
  };

  const handleResetConfirm = () => {
    if (window.confirm('¿Reiniciar la partida y restablecer puntajes a cero?')) {
      resetGame();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#161b26] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎛️</span>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white">
              Panel de Conducción
            </h1>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span className="font-bold text-yellow-400">{gameState.status}</span>
              <span>•</span>
              <span>Pregunta {gameState.currentIndex + 1}/{gameState.totalQuestions}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{gameState.totalPlayers} Jugadores</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-bold transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Crear Película</span>
          </button>

          <button
            onClick={handleResetConfirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Question Preview */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 shadow-xl">
            {currentQ ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-4xl sm:text-5xl select-none mb-1">
                      {currentQ.emojis}
                    </div>
                    <div className="text-lg font-black text-white">
                      {currentQ.title} <span className="text-xs text-gray-400 font-normal">({currentQ.year})</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {currentQ.category} • {currentQ.genre}
                    </div>
                  </div>

                  {/* Timer Badge */}
                  <div className={`p-3.5 rounded-2xl text-center border min-w-28 ${
                    gameState.isTimerRunning
                      ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    <div className="text-3xl font-black font-mono">
                      {gameState.timeRemaining}s
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">
                      {gameState.isTimerRunning ? 'Activo' : 'Pausado'}
                    </div>
                  </div>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {currentQ.options.map((opt) => {
                    const isCorrect = opt === currentQ.title;
                    const votes = gameState.voteDistribution?.[opt] || 0;
                    return (
                      <div
                        key={opt}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                            : 'bg-white/5 border-white/10 text-gray-300'
                        }`}
                      >
                        <span className="truncate">{isCorrect ? '✓ ' : '• '}{opt}</span>
                        <span className="font-mono text-xs bg-black/40 px-2 py-0.5 rounded font-bold ml-1 shrink-0">
                          {votes}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500 text-sm">Sin película seleccionada</div>
            )}
          </div>

          {/* Master Control Deck */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => startQuestion()}
                className="p-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-300 text-black font-black text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-yellow-400/20 active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Iniciar Pregunta</span>
              </button>

              <button
                onClick={toggleTimer}
                className={`p-3.5 rounded-xl border font-black text-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition ${
                  gameState.isTimerRunning
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {gameState.isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{gameState.isTimerRunning ? 'Pausar Reloj' : 'Reanudar Reloj'}</span>
              </button>

              <button
                onClick={revealAnswer}
                className="p-3.5 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300 hover:bg-purple-600/50 font-black text-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition"
              >
                <Eye className="w-5 h-5" />
                <span>Revelar en TV</span>
              </button>

              <button
                onClick={showRanking}
                className="p-3.5 rounded-xl bg-blue-600/30 border border-blue-500/50 text-blue-300 hover:bg-blue-600/50 font-black text-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition"
              >
                <Trophy className="w-5 h-5" />
                <span>Proyectar Ranking</span>
              </button>
            </div>

            {/* Navigation & Modifiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                onClick={prevQuestion}
                disabled={gameState.currentIndex === 0}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition"
              >
                <SkipBack className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={nextQuestion}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>Siguiente</span>
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={showHint}
                disabled={gameState.activeHintLevel >= 2}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Pista ({gameState.activeHintLevel}/2)</span>
              </button>

              <button
                onClick={toggleDoublePoints}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  gameState.doublePoints
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/30'
                    : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>{gameState.doublePoints ? 'Puntos x2 (ON)' : 'Puntos x2'}</span>
              </button>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={startLobby}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Sala QR
                </button>

                <button
                  onClick={showPodium}
                  className="px-3 py-1.5 rounded-lg bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Podio Final</span>
                </button>
              </div>

              {/* Timer Duration */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                {[10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimerDuration(sec)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                      gameState.timerDuration === sec
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound FX Buttons */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
            <span className="text-xs uppercase font-extrabold text-gray-400">SFX</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => soundEngine.play('correct')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold"
              >
                🔔 Acierto
              </button>
              <button
                onClick={() => soundEngine.play('wrong')}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold"
              >
                ❌ Error
              </button>
              <button
                onClick={() => soundEngine.play('ranking_drum')}
                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-bold"
              >
                🥁 Redoble
              </button>
              <button
                onClick={() => soundEngine.play('victory_fanfare')}
                className="px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-bold"
              >
                🎺 Fanfarria
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Moderation & Question Picker */}
        <div className="space-y-5">
          {/* Connected Players */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Jugadores ({gameState.totalPlayers})
              </h3>
              <span className="text-[11px] font-mono text-gray-400">
                {gameState.answeredCount}/{gameState.totalPlayers} listos
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
              {gameState.allPlayers?.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  Sin jugadores conectados
                </div>
              ) : (
                gameState.allPlayers?.map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span>{p.avatar}</span>
                      <div className="truncate font-bold text-gray-200">{p.nickname}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-gray-400">{p.score} pts</span>
                      <button
                        onClick={() => kickPlayer(p.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                        title="Expulsar"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Question Jump Selector */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-2">
              Películas ({gameState.questionsList?.length})
            </h3>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {gameState.questionsList?.map((q, idx) => {
                const isCurrent = gameState.currentIndex === idx;
                return (
                  <button
                    key={q.id || idx}
                    onClick={() => startQuestion(idx)}
                    className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-yellow-400 text-black font-extrabold shadow'
                        : 'bg-black/30 hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <span className="truncate">#{idx + 1} {q.title}</span>
                    <span className="text-xs shrink-0 ml-1">{q.emojis?.split(' ').slice(0, 3).join(' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE CUSTOM QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161b26] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Nueva Película
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-400 mb-1">Título de la Película</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: El Padrino"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 mb-1">Emojis</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 🐴 🍊 🔫 💼 🌹"
                  value={customEmojis}
                  onChange={(e) => setCustomEmojis(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 mb-1">4 Opciones</label>
                <div className="grid grid-cols-2 gap-2">
                  {customOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      required
                      placeholder={`Opción ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...customOptions];
                        copy[i] = e.target.value;
                        setCustomOptions(copy);
                      }}
                      className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-gray-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-yellow-400 text-black font-extrabold hover:bg-yellow-300"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
