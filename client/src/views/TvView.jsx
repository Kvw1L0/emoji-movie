import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/SocketContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Clock, Users, Flame, Trophy, Award, Sparkles } from 'lucide-react';
import { isAnswerCorrect } from '../data/moviesData';

export const TvView = () => {
  const { gameState, networkInfo } = useGame();
  const currentQ = gameState.currentQuestion;

  const joinUrl = typeof window !== 'undefined'
    ? (window.location.hostname.includes('vercel.app') || (!window.location.hostname.includes('localhost') && !window.location.hostname.startsWith('192.168.') && !window.location.hostname.startsWith('10.')))
      ? `${window.location.origin}/`
      : `${window.location.protocol}//${networkInfo.localIp || window.location.hostname}:${window.location.port || '5173'}/`
    : '';

  // Confetti on Ranking or Podium
  useEffect(() => {
    if (gameState.status === 'PODIUM' || gameState.status === 'RANKING') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [gameState.status]);

  // Common Key Visual Shell
  // Backing matches the user's uploaded 82 Años Key Visual with center card for OBS broadcast
  const TvWrapper = ({ children, customClass = '' }) => (
    <div className={`h-screen w-screen relative overflow-hidden bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-8 font-sans ${customClass}`}>
      {/* Key visual background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95"
        style={{ backgroundImage: `url('/key-visual.png')` }}
      />
      
      {/* Soft atmospheric gradient to ensure legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/30 pointer-events-none" />

      {/* Main Center Stage Container (aligned with the central card of the Key Visual) */}
      <div className="relative z-10 w-full max-w-5xl h-[84vh] max-h-[820px] bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A8B5]/20 shadow-[0_20px_50px_rgba(0,95,106,0.12)] p-6 sm:p-8 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );

  // 1. LOBBY VIEW (Streaming Broadcast Screen)
  if (gameState.status === 'LOBBY') {
    return (
      <TvWrapper>
        {/* Brand Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/30 text-[#005F6A] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hogar de Cristo • 82 Años</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#133842] font-display">
            EMOJI <span className="text-[#00A8B5]">MOVIE</span>
          </h1>
        </div>

        {/* Center: Clean QR Code & Join Link for Stream Viewers */}
        <div className="flex flex-col items-center justify-center gap-4 my-auto">
          <div className="p-3 bg-white rounded-2xl shadow-lg border border-[#00A8B5]/25">
            <QRCodeDisplay url={joinUrl} size={220} showDetails={false} />
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-xs sm:text-sm font-extrabold text-[#005F6A] uppercase tracking-wider">
              Escanea con tu teléfono para participar
            </span>
            <div className="font-mono text-xs sm:text-sm font-bold text-[#133842] bg-[#FAF7F2] px-5 py-1.5 rounded-full border border-[#00A8B5]/20 select-all shadow-inner">
              {joinUrl}
            </div>
          </div>
        </div>

        {/* Connected Players Floating Avatars */}
        <div className="w-full max-w-3xl mx-auto pt-2 border-t border-[#00A8B5]/15">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-[#005F6A] font-extrabold mb-2.5">
            <Users className="w-4 h-4 text-[#00A8B5]" />
            <span>Jugadores Conectados ({gameState.totalPlayers})</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto p-1">
            {gameState.allPlayers?.length === 0 ? (
              <span className="text-gray-400 italic text-xs font-medium">Esperando jugadores en sala...</span>
            ) : (
              gameState.allPlayers?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#00A8B5]/20 text-[#133842] text-xs font-bold shadow-sm"
                >
                  <span className="text-sm">{p.avatar || '🍿'}</span>
                  <span className="truncate max-w-[120px]">{p.nickname}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </TvWrapper>
    );
  }

  // 2. QUESTION IN PROGRESS (Streaming Overlay HUD)
  if (gameState.status === 'QUESTION' && currentQ) {
    const isLowTime = gameState.timeRemaining <= 5;

    return (
      <TvWrapper>
        {/* Top HUD: Question #, Category, Double points & Big Timer */}
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-xs sm:text-sm font-black text-[#005F6A]">
              Película {gameState.currentIndex + 1} de {gameState.totalQuestions}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs sm:text-sm font-bold text-[#8A7016]">
              {currentQ.category}
            </span>
            {gameState.doublePoints && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-100 border border-red-300 text-xs sm:text-sm font-black text-red-700 animate-pulse">
                <Flame className="w-4 h-4 text-red-600 fill-current" />
                PUNTOS x2
              </span>
            )}
          </div>

          {/* Countdown Clock */}
          <div className={`flex items-center gap-2.5 px-5 py-2 rounded-2xl border transition-all ${
            isLowTime
              ? 'bg-red-50 border-red-400 text-red-600 scale-105 animate-pulse shadow-md'
              : 'bg-[#FAF7F2] border-[#00A8B5]/30 text-[#133842]'
          }`}>
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-red-600 animate-spin' : 'text-[#00A8B5]'}`} />
            <span className="font-mono text-3xl sm:text-4xl font-black">
              {gameState.timeRemaining}s
            </span>
          </div>
        </div>

        {/* Center: Massive Emojis Box */}
        <div className="flex flex-col items-center justify-center my-auto text-center py-4">
          <div className="px-8 sm:px-16 py-8 sm:py-12 rounded-3xl bg-[#FAF7F2] border-2 border-[#00A8B5]/30 shadow-inner relative max-w-3xl w-full">
            <div className="text-6xl sm:text-8xl md:text-9xl tracking-wider select-none filter drop-shadow-md">
              {currentQ.emojis}
            </div>
          </div>

          {/* Dynamic Hints Bar if unlocked by Host */}
          {gameState.activeHintLevel > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2 max-w-xl animate-fade-in">
              {gameState.activeHintLevel >= 1 && (
                <div className="px-4 py-1.5 rounded-xl bg-[#00A8B5]/10 border border-[#00A8B5]/30 text-[#005F6A] text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span>💡</span>
                  <span>{currentQ.hint1} ({currentQ.year} • {currentQ.genre})</span>
                </div>
              )}
              {gameState.activeHintLevel >= 2 && (
                <div className="px-4 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span>🔍</span>
                  <span>{currentQ.hint2}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Telemetry Progress */}
        <div className="w-full pt-3 border-t border-[#00A8B5]/15">
          <div className="flex justify-between items-center text-xs text-[#005F6A] mb-1.5 font-bold">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00A8B5]" />
              <span>Votos Emitidos</span>
            </div>
            <span className="font-mono font-bold text-[#133842]">
              {gameState.answeredCount} / {gameState.totalPlayers}
            </span>
          </div>
          <div className="w-full h-3 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#00A8B5]/20">
            <div
              className="h-full bg-gradient-to-r from-[#00A8B5] to-[#D4AF37] transition-all duration-300 rounded-full"
              style={{
                width: `${gameState.totalPlayers > 0 ? (gameState.answeredCount / gameState.totalPlayers) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </TvWrapper>
    );
  }

  // 3. REVEAL SCREEN
  if (gameState.status === 'REVEAL' && currentQ) {
    const totalVotes = Object.values(gameState.voteDistribution || {}).reduce((a, b) => a + b, 0);

    return (
      <TvWrapper>
        {/* Top Header */}
        <div className="flex items-center justify-between w-full">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-[#005F6A] text-xs sm:text-sm font-black">
            Película {gameState.currentIndex + 1} de {gameState.totalQuestions}
          </span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {currentQ.category}
          </span>
        </div>

        {/* Center: Movie Title Reveal Card */}
        <div className="flex flex-col items-center text-center my-auto max-w-3xl mx-auto w-full">
          <div className="text-5xl sm:text-6xl mb-2 select-none">
            {currentQ.emojis}
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-[#005F6A] font-display mb-2 drop-shadow-sm">
            {currentQ.correctAnswer || currentQ.title}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#00A8B5]/20 font-bold">
              📅 {currentQ.year}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#00A8B5]/20 font-bold">
              🎬 {currentQ.director}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#00A8B5]/20 font-bold">
              🏷️ {currentQ.genre}
            </span>
          </div>

          {/* Trivia */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#00A8B5]/20 text-[#133842] text-xs sm:text-sm max-w-xl mx-auto italic shadow-inner">
            "{currentQ.trivia || currentQ.hint1}"
          </div>
        </div>

        {/* Bottom: Options Vote Breakdown Bars */}
        <div className="w-full max-w-4xl mx-auto mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ.options.map((opt) => {
              const count = gameState.voteDistribution?.[opt] || 0;
              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isCorrect = isAnswerCorrect(opt, currentQ);

              return (
                <div
                  key={opt}
                  className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-[#FAF7F2] border-gray-200 opacity-80'
                  }`}
                >
                  <div
                    className={`absolute top-0 bottom-0 left-0 opacity-20 rounded-l-xl transition-all duration-700 ${
                      isCorrect ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">
                          •
                        </span>
                      )}
                      <span className={`text-xs sm:text-sm font-bold ${isCorrect ? 'text-emerald-900 font-black' : 'text-[#133842]'}`}>
                        {opt}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#133842] mr-1.5">{count}</span>
                      <span className="text-[11px] text-gray-500 font-mono">({percent}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </TvWrapper>
    );
  }

  // 4. PODIUM / RANKING (Pure Broadcast Screen - No Navigation)
  if (gameState.status === 'RANKING' || gameState.status === 'PODIUM') {
    const isFinalPodium = gameState.status === 'PODIUM';
    const topPlayers = gameState.leaderboard || [];

    return (
      <TvWrapper>
        {/* Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#8A7016] text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hogar de Cristo • 82 Años</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#133842] font-display">
            {isFinalPodium ? '🏆 PODIO DE CAMPEONES' : 'CLASIFICACIÓN EN VIVO'}
          </h2>
        </div>

        {/* Center: Podium (Top 3) & List (4-10) */}
        <div className="w-full max-w-3xl mx-auto my-auto space-y-4">
          {topPlayers.length >= 1 && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-6 pb-2">
              {/* 2nd Place */}
              {topPlayers[1] ? (
                <div className="flex flex-col items-center bg-[#FAF7F2] border border-slate-300 rounded-2xl p-3.5 text-center order-1 h-44 sm:h-52 justify-end relative shadow-md">
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-slate-200 text-slate-800 font-black flex items-center justify-center text-sm shadow border-2 border-white">
                    2🥈
                  </div>
                  <div className="text-3xl mb-1">{topPlayers[1].avatar}</div>
                  <div className="font-black text-xs sm:text-sm text-[#133842] truncate max-w-full">
                    {topPlayers[1].nickname}
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-[#005F6A] font-extrabold mt-0.5">
                    {topPlayers[1].score.toLocaleString()} pts
                  </div>
                </div>
              ) : <div className="order-1" />}

              {/* 1st Place */}
              {topPlayers[0] && (
                <div className="flex flex-col items-center bg-gradient-to-t from-[#D4AF37]/20 to-white border-2 border-[#D4AF37] rounded-2xl p-4 text-center order-2 h-56 sm:h-64 justify-end relative shadow-xl shadow-[#D4AF37]/15">
                  <div className="absolute -top-7 w-14 h-14 rounded-full bg-gradient-to-tr from-[#D4AF37] to-amber-200 text-black font-black flex items-center justify-center text-2xl shadow-lg border-2 border-white animate-bounce-subtle">
                    👑
                  </div>
                  <div className="text-4xl sm:text-5xl mb-1">{topPlayers[0].avatar}</div>
                  <div className="font-black text-sm sm:text-lg text-[#133842] truncate max-w-full">
                    {topPlayers[0].nickname}
                  </div>
                  <div className="text-sm sm:text-base font-mono text-[#8A7016] font-black mt-0.5">
                    {topPlayers[0].score.toLocaleString()} pts
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topPlayers[2] ? (
                <div className="flex flex-col items-center bg-[#FAF7F2] border border-amber-300 rounded-2xl p-3.5 text-center order-3 h-36 sm:h-44 justify-end relative shadow-md">
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm shadow border-2 border-white">
                    3🥉
                  </div>
                  <div className="text-3xl mb-1">{topPlayers[2].avatar}</div>
                  <div className="font-black text-xs sm:text-sm text-[#133842] truncate max-w-full">
                    {topPlayers[2].nickname}
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-[#005F6A] font-extrabold mt-0.5">
                    {topPlayers[2].score.toLocaleString()} pts
                  </div>
                </div>
              ) : <div className="order-3" />}
            </div>
          )}

          {/* Ranks 4 to 10 */}
          {topPlayers.length > 3 && (
            <div className="bg-[#FAF7F2] border border-[#00A8B5]/20 rounded-2xl p-2.5 divide-y divide-gray-200/60 max-h-40 overflow-y-auto">
              {topPlayers.slice(3, 10).map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 px-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-gray-500 font-bold w-4">
                      #{idx + 4}
                    </span>
                    <span className="text-sm">{p.avatar}</span>
                    <span className="font-bold text-[#133842]">{p.nickname}</span>
                    {p.streak >= 2 && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-red-600" />
                        x{p.streak}
                      </span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-[#005F6A]">
                    {p.score.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-1" />
      </TvWrapper>
    );
  }

  return null;
};
