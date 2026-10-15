import React, { useState } from 'react';
import { useGame } from '../context/SocketContext';
import { Check, Flame } from 'lucide-react';

const AVATARS = ['🍿', '🎬', '⭐', '🕶️', '🚀', '🦁', '🦖', '👑', '🧙‍♂️', '👻', '🎸', '⚡'];

export const PlayerView = () => {
  const {
    player,
    gameState,
    selectedOption,
    joinGame,
    selectOption,
    deselectOption
  } = useGame();

  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🍿');

  const currentQ = gameState.currentQuestion;

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    joinGame(nicknameInput.trim(), selectedAvatar);
  };

  const handleOptionClick = (option) => {
    if (gameState.status !== 'QUESTION') return;
    if (selectedOption === option) {
      deselectOption();
    } else {
      selectOption(option);
    }
  };

  // 1. JOIN FORM
  if (!player) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#131722]/95 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl text-center">
          <div className="text-4xl mb-2">🍿</div>

          <h2 className="text-2xl font-black text-white font-display mb-4">
            EMOJI MOVIE
          </h2>

          <form onSubmit={handleJoin} className="space-y-4 text-left">
            <div>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-yellow-400 scale-105 shadow-md shadow-yellow-400/30 border-2 border-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={18}
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Tu apodo o nombre"
                className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white placeholder-gray-500 font-bold text-sm focus:outline-none focus:border-yellow-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-300 text-black font-black text-base shadow-lg shadow-yellow-400/25 hover:opacity-95 active:scale-98 transition"
            >
              ¡Entrar a Jugar!
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. PLAYER STATUS BAR
  const PlayerHeader = () => (
    <div className="w-full max-w-md mx-auto mb-3 flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{player.avatar}</span>
        <div>
          <div className="text-sm font-black text-white leading-tight">
            {player.nickname}
          </div>
          <div className="text-[11px] text-gray-400">
            {gameState.allPlayers?.findIndex(p => p.id === player.id) + 1 ? (
              <span>#{gameState.allPlayers.findIndex(p => p.id === player.id) + 1} en el ranking</span>
            ) : 'Jugador'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {player.streak > 1 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>x{player.streak}</span>
          </div>
        )}
        <div className="text-right">
          <div className="text-sm font-black font-mono text-yellow-400">
            {(player.score || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">pts</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. LOBBY STATE
  if (gameState.status === 'LOBBY') {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 max-w-md mx-auto">
        <PlayerHeader />

        <div className="my-auto text-center space-y-3 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <div className="text-5xl animate-bounce-subtle">🍿</div>
          <h2 className="text-2xl font-black text-white font-display">
            ¡Estás en la Sala!
          </h2>
          <p className="text-gray-400 text-sm">
            Atento a la pantalla gigante para la primera película.
          </p>
        </div>

        <div className="h-4" />
      </div>
    );
  }

  // 4. QUESTION PHASE
  if (gameState.status === 'QUESTION' && currentQ) {
    const isLowTime = gameState.timeRemaining <= 5;

    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-3 sm:p-4 max-w-md mx-auto">
        <PlayerHeader />

        {/* Emojis Box */}
        <div className="bg-black/70 border border-yellow-400/40 rounded-2xl p-4 text-center mb-3 shadow-lg">
          <div className="text-4xl sm:text-5xl tracking-widest my-1 select-none">
            {currentQ.emojis}
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isLowTime ? 'bg-red-500' : 'bg-yellow-400'
              }`}
              style={{
                width: `${Math.max(0, (gameState.timeRemaining / gameState.timerDuration) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* 4 Clickable / Deselectable Options */}
        <div className="my-auto space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const letters = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={opt}
                onClick={() => handleOptionClick(opt)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                  isSelected
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-300 text-black border-white shadow-xl shadow-yellow-400/30 font-black scale-102 ring-2 ring-yellow-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isSelected ? 'bg-black text-yellow-400' : 'bg-white/10 text-gray-300'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">
                    {opt}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-black text-yellow-400 flex items-center justify-center text-xs font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/20" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Option Pill */}
        <div className="text-center pt-2 min-h-8">
          {selectedOption && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Marcado: {selectedOption}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. REVEAL STATE
  if (gameState.status === 'REVEAL' && currentQ) {
    const lastAns = player.lastAnswer;
    const isCorrect = lastAns?.isCorrect;

    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 max-w-md mx-auto">
        <PlayerHeader />

        <div className={`my-auto text-center p-6 sm:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl ${
          isCorrect
            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-emerald-500/20'
            : 'bg-red-950/40 border-red-500/50 shadow-red-500/20'
        }`}>
          <div className="text-5xl mb-2">
            {isCorrect ? '🎉' : '💔'}
          </div>

          <h2 className={`text-3xl font-black font-display mb-1 ${
            isCorrect ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
          </h2>

          <p className="text-xs text-gray-400 mb-4 font-semibold">
            Era: <span className="text-white font-black text-base">{currentQ.title}</span>
          </p>

          {isCorrect && (
            <div className="bg-black/50 border border-emerald-500/30 p-3.5 rounded-2xl space-y-1.5 text-xs text-left">
              <div className="flex justify-between items-center text-gray-300">
                <span>Puntos Base:</span>
                <span className="font-mono text-emerald-300 font-bold">+1.000</span>
              </div>
              {lastAns?.speedBonus > 0 && (
                <div className="flex justify-between items-center text-gray-300">
                  <span>Bono de Velocidad:</span>
                  <span className="font-mono text-yellow-400 font-bold">+{lastAns.speedBonus}</span>
                </div>
              )}
              {gameState.doublePoints && (
                <div className="flex justify-between items-center text-red-400 font-bold">
                  <span>Multiplicador:</span>
                  <span>x2 🔥</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-black text-white">
                <span>Total Ronda:</span>
                <span className="font-mono text-emerald-300">+{lastAns?.pointsEarned} pts</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    );
  }

  // 6. RANKING / PODIUM STATE
  if (gameState.status === 'RANKING' || gameState.status === 'PODIUM') {
    const isPodium = gameState.status === 'PODIUM';
    const playerRank = (gameState.allPlayers?.findIndex(p => p.id === player.id) || 0) + 1;

    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 max-w-md mx-auto">
        <PlayerHeader />

        <div className="my-auto text-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="text-5xl animate-bounce-subtle">
            {isPodium ? '🏆' : '📊'}
          </div>

          <h2 className="text-2xl font-black text-white font-display">
            {isPodium ? '¡Fin del Juego!' : 'Tu Posición'}
          </h2>

          <div className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30">
            <div className="text-5xl font-black text-white font-mono">
              #{playerRank}
            </div>
            <div className="text-sm font-black text-yellow-400 font-mono mt-1">
              {(player.score || 0).toLocaleString()} pts
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    );
  }

  return null;
};
