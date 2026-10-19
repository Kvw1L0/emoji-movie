import React, { useState } from 'react';
import { useGame } from '../context/SocketContext';
import { Check, Flame, Sparkles } from 'lucide-react';

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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = gameState.currentQuestion;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!nicknameInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await joinGame(nicknameInput.trim(), selectedAvatar);
      setIsEditingProfile(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Shell with official Key Visual background (Green balloons / visual identity)
  const PlayerLayout = ({ children, className = '' }) => (
    <div className={`min-h-screen w-full relative overflow-x-hidden bg-[#FAF7F2] text-[#133842] flex flex-col justify-between p-4 font-sans ${className}`}>
      {/* Key visual background with green globes */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-90"
        style={{ backgroundImage: `url('/key-visual.png')` }}
      />
      {/* Soft atmospheric gradient to preserve high contrast and readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-white/35 via-white/10 to-white/40 pointer-events-none" />

      {/* Main Content Container (Mobile-first, max-w-md, perfectly centered) */}
      <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-between my-auto py-2">
        {children}
      </div>
    </div>
  );

  // 1. JOIN FORM (First time or when editing profile)
  if (!player || isEditingProfile) {
    return (
      <PlayerLayout>
        <div className="my-auto w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,95,106,0.18)] border border-[#00A8B5]/30 text-center">
          <div className="text-5xl mb-2 select-none filter drop-shadow">{selectedAvatar}</div>

          <h2 className="text-3xl font-black text-[#133842] font-display mb-1">
            EMOJI <span className="text-[#00A8B5]">MOVIE</span>
          </h2>
          <p className="text-xs text-gray-500 mb-5 font-semibold">
            Elige tu avatar y escribe tu nombre para entrar
          </p>

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
                        ? 'bg-[#00A8B5] text-white scale-105 shadow-md shadow-[#00A8B5]/30 border-2 border-white ring-2 ring-[#00A8B5]'
                        : 'bg-[#FAF7F2] hover:bg-gray-100 border border-[#00A8B5]/15'
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
                placeholder={player?.nickname || "Tu nombre o apodo"}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#00A8B5]/30 rounded-xl text-[#133842] placeholder-gray-400 font-bold text-sm focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 transition shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00A8B5] to-[#008B9B] text-white font-black text-base shadow-lg shadow-[#00A8B5]/25 hover:opacity-95 active:scale-98 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : (player ? 'Guardar Cambios' : '¡Entrar a Jugar!')}
            </button>

            {player && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold"
              >
                Cancelar
              </button>
            )}
          </form>
        </div>
      </PlayerLayout>
    );
  }

  // 2. LOBBY STATE (No top header, beautiful glassmorphism card on key visual)
  if (gameState.status === 'LOBBY') {
    return (
      <PlayerLayout>
        <div className="my-auto text-center space-y-4 bg-white/95 backdrop-blur-md border border-[#00A8B5]/30 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,95,106,0.15)]">
          <div className="text-6xl animate-bounce-subtle select-none filter drop-shadow">🍿</div>
          <h2 className="text-3xl font-black text-[#133842] font-display">
            ¡Estás en la Sala!
          </h2>
          <p className="text-gray-600 text-sm font-medium leading-relaxed">
            Atento a la pantalla de transmisión para descubrir la primera película descrita con emoticones.
          </p>
          <div className="pt-3 border-t border-[#00A8B5]/20 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#005F6A]">Esperando al conductor...</span>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  // 3. QUESTION PHASE (No top header, solid emojis/photo, large tactile options)
  if (gameState.status === 'QUESTION' && currentQ) {
    const isLowTime = gameState.timeRemaining <= 5;

    return (
      <PlayerLayout>
        {/* Emojis / Photo Card */}
        <div className="bg-white/95 backdrop-blur-md border-2 border-[#00A8B5]/35 rounded-3xl p-4 sm:p-5 text-center mb-3 shadow-[0_15px_35px_rgba(0,95,106,0.12)]">
          {currentQ.photoUrl || currentQ.image ? (
            <div className="flex flex-col items-center">
              <img
                src={currentQ.photoUrl || currentQ.image}
                alt={currentQ.title}
                className="max-h-36 sm:max-h-44 w-auto object-contain rounded-2xl shadow-md mb-2 border-2 border-white"
              />
              <div className="text-2xl sm:text-3xl tracking-widest mt-1 select-none">{currentQ.emojis}</div>
            </div>
          ) : (
            <div className="text-5xl sm:text-6xl tracking-widest my-2 select-none filter drop-shadow-sm">
              {currentQ.emojis}
            </div>
          )}

          {/* Countdown timer bar */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full mt-3 overflow-hidden border border-gray-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isLowTime ? 'bg-red-500' : 'bg-gradient-to-r from-[#00A8B5] to-[#D4AF37]'
              }`}
              style={{
                width: `${Math.max(0, (gameState.timeRemaining / gameState.timerDuration) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* 4 Clickable / Deselectable Alternatives */}
        <div className="my-auto space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const letters = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    deselectOption();
                  } else {
                    selectOption(opt);
                  }
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#00A8B5] to-[#008B9B] text-white border-[#00A8B5] shadow-lg shadow-[#00A8B5]/30 font-black scale-102 ring-2 ring-[#00A8B5]/50'
                    : 'bg-white/95 hover:bg-white backdrop-blur-sm border-[#00A8B5]/20 text-[#133842] font-bold shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isSelected ? 'bg-white text-[#00A8B5]' : 'bg-[#FAF7F2] text-[#005F6A] border border-[#00A8B5]/25'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">
                    {opt}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-white text-[#00A8B5] flex items-center justify-center text-xs font-bold shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Option Notification / Changeability hint */}
        <div className="text-center pt-2 min-h-8">
          {selectedOption ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#00A8B5]/40 text-[#005F6A] text-xs font-bold animate-fade-in shadow-sm backdrop-blur-sm">
              <Check className="w-4 h-4 text-[#00A8B5]" />
              <span>Marcada: <strong className="text-[#133842]">{selectedOption}</strong></span>
              <span className="text-[10px] text-gray-500 font-normal ml-1">• Puedes cambiarla cuando quieras</span>
            </div>
          ) : (
            <span className="text-xs text-gray-700 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm font-medium shadow-sm">
              Toca una alternativa para responder (puedes cambiarla hasta el segundo 0)
            </span>
          )}
        </div>
      </PlayerLayout>
    );
  }

  // 4. REVEAL STATE (Result + "Respuesta correcta: [Título]")
  if (gameState.status === 'REVEAL' && currentQ) {
    const lastAns = player.lastAnswer;
    const isCorrect = lastAns?.isCorrect;

    return (
      <PlayerLayout>
        <div className={`my-auto text-center p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-md ${
          isCorrect
            ? 'bg-white/95 border-emerald-500 shadow-emerald-500/15'
            : 'bg-white/95 border-red-400 shadow-red-500/15'
        }`}>
          <div className="text-6xl mb-2 select-none filter drop-shadow">
            {isCorrect ? '🎉' : '💔'}
          </div>

          <h2 className={`text-3xl sm:text-4xl font-black font-display mb-2 ${
            isCorrect ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
          </h2>

          {/* Explicit label requested: "Respuesta correcta: [Título]" */}
          <div className="bg-[#FAF7F2] border border-[#00A8B5]/20 p-3 rounded-2xl mb-4">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-0.5">
              Respuesta correcta:
            </span>
            <span className="text-[#133842] font-black text-lg sm:text-xl font-display">
              {currentQ.correctAnswer || currentQ.title}
            </span>
          </div>

          {isCorrect && (
            <div className="bg-white border border-emerald-500/30 p-3.5 rounded-2xl space-y-1.5 text-xs text-left shadow-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Puntos Base:</span>
                <span className="font-mono text-emerald-600 font-bold">+1.000</span>
              </div>
              {lastAns?.speedBonus > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Bono de Rapidez:</span>
                  <span className="font-mono text-[#D4AF37] font-bold">+{lastAns.speedBonus}</span>
                </div>
              )}
              {gameState.doublePoints && (
                <div className="flex justify-between items-center text-red-600 font-bold">
                  <span>Multiplicador:</span>
                  <span>x2 🔥</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-[#133842]">
                <span>Total Ronda:</span>
                <span className="font-mono text-emerald-600">+{lastAns?.pointsEarned} pts</span>
              </div>
            </div>
          )}
        </div>
      </PlayerLayout>
    );
  }

  // 5. RANKING / PODIUM STATE
  if (gameState.status === 'RANKING' || gameState.status === 'PODIUM') {
    const isPodium = gameState.status === 'PODIUM';
    const playerRank = (gameState.allPlayers?.findIndex(p => p.id === player.id) || 0) + 1;

    return (
      <PlayerLayout>
        <div className="my-auto text-center p-7 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-[#00A8B5]/30 shadow-2xl space-y-4">
          <div className="text-6xl animate-bounce-subtle select-none filter drop-shadow">
            {isPodium ? '🏆' : '📊'}
          </div>

          <h2 className="text-3xl font-black text-[#133842] font-display">
            {isPodium ? '¡Fin de la Partida!' : 'Tu Posición Actual'}
          </h2>

          <div className="p-5 rounded-2xl bg-[#00A8B5]/10 border border-[#00A8B5]/30">
            <div className="text-5xl font-black text-[#005F6A] font-mono">
              #{playerRank}
            </div>
            <div className="text-base font-black text-[#D4AF37] font-mono mt-1">
              {(player.score || 0).toLocaleString()} pts
            </div>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return null;
};
