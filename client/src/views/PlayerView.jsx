import React, { useState } from 'react';
import { useGame } from '../context/SocketContext';
import { Check, Flame, Edit2, Sparkles, Trophy } from 'lucide-react';

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

  // 1. JOIN FORM (First time or when editing profile)
  if (!player || isEditingProfile) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#133842] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,95,106,0.12)] border border-[#00A8B5]/25 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00A8B5]/10 text-[#005F6A] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hogar de Cristo • 82 Años</span>
          </div>

          <div className="text-5xl mb-2">{selectedAvatar}</div>

          <h2 className="text-2xl font-black text-[#133842] font-display mb-1">
            EMOJI <span className="text-[#00A8B5]">MOVIE</span>
          </h2>
          <p className="text-xs text-gray-500 mb-5 font-medium">
            Elige tu avatar y escribe tu nombre
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
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#00A8B5]/30 rounded-xl text-[#133842] placeholder-gray-400 font-bold text-sm focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 transition"
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
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-medium"
              >
                Cancelar
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // 2. PLAYER STATUS BAR
  const PlayerHeader = () => (
    <div className="w-full max-w-md mx-auto mb-3 flex items-center justify-between p-3 rounded-2xl bg-white border border-[#00A8B5]/20 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">{player.avatar}</span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-[#133842] leading-tight">
              {player.nickname}
            </span>
            <button
              onClick={() => {
                setNicknameInput(player.nickname);
                setSelectedAvatar(player.avatar);
                setIsEditingProfile(true);
              }}
              className="text-gray-400 hover:text-[#00A8B5] p-0.5"
              title="Cambiar apodo o avatar"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[11px] text-[#005F6A] font-semibold">
            {gameState.allPlayers?.findIndex(p => p.id === player.id) + 1 ? (
              <span>#{gameState.allPlayers.findIndex(p => p.id === player.id) + 1} en el ranking</span>
            ) : 'En sala'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {player.streak > 1 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>x{player.streak}</span>
          </div>
        )}
        <div className="text-right">
          <div className="text-sm font-black font-mono text-[#005F6A]">
            {(player.score || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">pts</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. LOBBY STATE
  if (gameState.status === 'LOBBY') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#133842] flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
        <PlayerHeader />

        <div className="my-auto text-center space-y-3 bg-white border border-[#00A8B5]/20 p-7 rounded-3xl shadow-[0_10px_30px_rgba(0,95,106,0.08)]">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00A8B5]/10 text-[#005F6A] text-xs font-bold uppercase tracking-wider mb-1">
            <span>Hogar de Cristo • 82 Años</span>
          </div>
          <div className="text-5xl animate-bounce-subtle">🍿</div>
          <h2 className="text-2xl font-black text-[#133842] font-display">
            ¡Estás en la Sala!
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm">
            Atento a la pantalla de la transmisión para ver la primera película.
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
      <div className="min-h-screen bg-[#FAF7F2] text-[#133842] flex flex-col justify-between p-3 sm:p-4 max-w-md mx-auto font-sans">
        <PlayerHeader />

        {/* Emojis / Photo Box */}
        <div className="bg-white border-2 border-[#00A8B5]/30 rounded-2xl p-4 text-center mb-3 shadow-md">
          {currentQ.photoUrl || currentQ.image ? (
            <div className="flex flex-col items-center">
              <img
                src={currentQ.photoUrl || currentQ.image}
                alt={currentQ.title}
                className="max-h-36 sm:max-h-44 w-auto object-contain rounded-xl shadow mb-1 border border-gray-200"
              />
              <div className="text-xl sm:text-2xl tracking-widest mt-1">{currentQ.emojis}</div>
            </div>
          ) : (
            <div className="text-4xl sm:text-5xl tracking-widest my-1 select-none">
              {currentQ.emojis}
            </div>
          )}

          {/* Timer bar */}
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

        {/* 4 Clickable / Deselectable Options */}
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
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-[#133842] font-bold shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isSelected ? 'bg-white text-[#00A8B5]' : 'bg-[#FAF7F2] text-[#005F6A] border border-[#00A8B5]/20'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">
                    {opt}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-white text-[#00A8B5] flex items-center justify-center text-xs font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Option Pill with changeability hint */}
        <div className="text-center pt-2 min-h-8">
          {selectedOption ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00A8B5]/15 border border-[#00A8B5]/40 text-[#005F6A] text-xs font-bold animate-fade-in shadow-sm">
              <Check className="w-4 h-4 text-[#00A8B5]" />
              <span>Marcada: <strong className="text-[#133842]">{selectedOption}</strong></span>
              <span className="text-[10px] text-gray-500 font-normal ml-1">• Puedes cambiarla cuando quieras</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 font-medium italic">Toca una alternativa para responder (puedes cambiarla hasta el segundo 0)</span>
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
      <div className="min-h-screen bg-[#FAF7F2] text-[#133842] flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
        <PlayerHeader />

        <div className={`my-auto text-center p-6 sm:p-8 rounded-3xl border shadow-xl ${
          isCorrect
            ? 'bg-white border-emerald-500 shadow-emerald-500/10'
            : 'bg-white border-red-400 shadow-red-500/10'
        }`}>
          <div className="text-5xl mb-2">
            {isCorrect ? '🎉' : '💔'}
          </div>

          <h2 className={`text-3xl font-black font-display mb-1 ${
            isCorrect ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
          </h2>

          <p className="text-xs text-gray-500 mb-4 font-semibold">
            Era: <span className="text-[#133842] font-black text-base">{currentQ.correctAnswer || currentQ.title}</span>
          </p>

          {isCorrect && (
            <div className="bg-[#FAF7F2] border border-emerald-500/30 p-3.5 rounded-2xl space-y-1.5 text-xs text-left">
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

        <div className="h-4" />
      </div>
    );
  }

  // 6. RANKING / PODIUM STATE
  if (gameState.status === 'RANKING' || gameState.status === 'PODIUM') {
    const isPodium = gameState.status === 'PODIUM';
    const playerRank = (gameState.allPlayers?.findIndex(p => p.id === player.id) || 0) + 1;

    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#133842] flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
        <PlayerHeader />

        <div className="my-auto text-center p-6 rounded-3xl bg-white border border-[#00A8B5]/25 shadow-xl space-y-4">
          <div className="text-5xl animate-bounce-subtle">
            {isPodium ? '🏆' : '📊'}
          </div>

          <h2 className="text-2xl font-black text-[#133842] font-display">
            {isPodium ? '¡Fin de la Partida!' : 'Tu Posición Actual'}
          </h2>

          <div className="p-4 rounded-2xl bg-[#00A8B5]/10 border border-[#00A8B5]/30">
            <div className="text-5xl font-black text-[#005F6A] font-mono">
              #{playerRank}
            </div>
            <div className="text-sm font-black text-[#D4AF37] font-mono mt-1">
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
