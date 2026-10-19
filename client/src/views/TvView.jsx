import React, { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/SocketContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Clock, Users, Flame, Trophy, Sparkles, Zap, Video } from 'lucide-react';
import { isAnswerCorrect } from '../data/moviesData';

// Slots around the perimeter of the 16:9 canvas for floating lobby players
const LOBBY_SLOTS = [
  { left: '4%', top: '14%' },
  { left: '84%', top: '14%' },
  { left: '5%', top: '42%' },
  { left: '85%', top: '44%' },
  { left: '6%', top: '72%' },
  { left: '83%', top: '74%' },
  { left: '16%', top: '7%' },
  { left: '74%', top: '7%' },
  { left: '18%', top: '88%' },
  { left: '72%', top: '88%' },
  { left: '11%', top: '26%' },
  { left: '80%', top: '28%' },
  { left: '9%', top: '58%' },
  { left: '81%', top: '60%' },
  { left: '30%', top: '6%' },
  { left: '60%', top: '6%' },
  { left: '32%', top: '90%' },
  { left: '58%', top: '90%' },
  { left: '2%', top: '30%' },
  { left: '89%', top: '32%' },
  { left: '3%', top: '84%' },
  { left: '87%', top: '86%' }
];

export const TvView = () => {
  const { gameState, networkInfo } = useGame();
  const currentQ = gameState.currentQuestion;

  const [chromaMode, setChromaMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('chroma') === 'true';
  });

  const joinUrl = typeof window !== 'undefined'
    ? (window.location.hostname.includes('vercel.app') || (!window.location.hostname.includes('localhost') && !window.location.hostname.startsWith('192.168.') && !window.location.hostname.startsWith('10.')))
      ? `${window.location.origin}/`
      : `${window.location.protocol}//${networkInfo.localIp || window.location.hostname}:${window.location.port || '5173'}/`
    : '';

  // Enhanced Televised Confetti & Fireworks on Podium / Ranking
  useEffect(() => {
    if (gameState.status === 'PODIUM') {
      const duration = 7500;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        // Fireworks from left and right corners
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.75 },
          colors: ['#00A8B5', '#D4AF37', '#FF6B6B', '#4FD1C5', '#F6DF88']
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.75 },
          colors: ['#00A8B5', '#D4AF37', '#FF6B6B', '#4FD1C5', '#F6DF88']
        });
      }, 700);

      return () => clearInterval(interval);
    } else if (gameState.status === 'RANKING') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00A8B5', '#D4AF37', '#4FD1C5']
      });
    }
  }, [gameState.status]);

  // Common Key Visual Shell (with OBS Chroma Key Support)
  const TvWrapper = ({ children, customClass = '' }) => (
    <div className={`h-screen w-screen relative overflow-hidden flex items-center justify-center p-3 sm:p-6 font-sans ${
      chromaMode ? 'bg-[#00FF00]' : 'bg-[#FAF7F2]'
    } ${customClass}`}>
      {/* Key visual background (hidden in chroma mode for transparency in OBS) */}
      {!chromaMode && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95"
            style={{ backgroundImage: `url('/key-visual.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/30 pointer-events-none" />
        </>
      )}

      {/* Main Center Stage Container: fully centered horizontally and vertically */}
      <div className={`relative z-20 w-full max-w-5xl h-[86vh] max-h-[840px] rounded-3xl border border-[#00A8B5]/25 shadow-[0_25px_60px_rgba(0,95,106,0.15)] p-6 sm:p-8 flex flex-col justify-between my-auto transition-all ${
        chromaMode ? 'bg-white/98' : 'bg-white/95 backdrop-blur-md'
      }`}>
        {children}
      </div>

      {/* Discrete Chroma Toggle in Bottom Right for Production Team */}
      <button
        onClick={() => setChromaMode(prev => !prev)}
        className="absolute bottom-2 right-2 z-50 p-1.5 rounded-lg bg-black/20 hover:bg-black/50 text-white/50 hover:text-white text-[10px] flex items-center gap-1 transition"
        title={chromaMode ? 'Desactivar pantalla verde OBS' : 'Activar pantalla verde OBS (Chroma Key)'}
      >
        <Video className="w-3 h-3" />
        <span className="hidden sm:inline">{chromaMode ? 'Chroma ON' : 'OBS Chroma'}</span>
      </button>
    </div>
  );

  // 1. LOBBY VIEW (Streaming Broadcast Screen with Floating Players)
  if (gameState.status === 'LOBBY') {
    const players = gameState.allPlayers || [];

    return (
      <div className="h-screen w-screen relative overflow-hidden bg-[#FAF7F2] flex items-center justify-center p-3 sm:p-6 font-sans">
        {/* Key visual background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95"
          style={{ backgroundImage: `url('/key-visual.png')` }}
        />
        
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/30 pointer-events-none" />

        {/* Floating Player Bubbles in the space around the QR */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {players.map((p, idx) => {
            const slot = LOBBY_SLOTS[idx % LOBBY_SLOTS.length];
            const duration = 5 + (idx % 4);
            const delay = (idx * 0.3) % 2.5;

            return (
              <div
                key={p.id || idx}
                style={{
                  left: slot.left,
                  top: slot.top,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`
                }}
                className="absolute animate-pop-in animate-float-gentle flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#00A8B5]/35 shadow-lg shadow-[#00A8B5]/15 backdrop-blur-md"
              >
                <span className="text-xl select-none leading-none">{p.avatar || '🍿'}</span>
                <span className="font-black text-xs sm:text-sm text-[#133842] truncate max-w-[120px]">
                  {p.nickname}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            );
          })}
        </div>

        {/* Center Card with QR Code */}
        <div className="relative z-20 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A8B5]/25 shadow-[0_25px_60px_rgba(0,95,106,0.18)] p-7 sm:p-8 flex flex-col items-center justify-center text-center my-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#133842] font-display">
            EMOJI <span className="text-[#00A8B5]">MOVIE</span>
          </h1>

          <div className="p-3 bg-white rounded-2xl shadow-xl border border-[#00A8B5]/30">
            <QRCodeDisplay url={joinUrl} size={220} showDetails={false} />
          </div>

          <div className="pt-1">
            <span className="text-xs sm:text-sm font-extrabold text-[#005F6A] uppercase tracking-wider block">
              Escanea para entrar desde tu celular
            </span>
          </div>

          <div className="pt-2 border-t border-[#00A8B5]/15 w-full flex items-center justify-center gap-2 text-xs font-black text-[#005F6A]">
            <Users className="w-4 h-4 text-[#00A8B5]" />
            <span>{players.length} {players.length === 1 ? 'jugador en sala' : 'jugadores en sala'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. QUESTION & REVEAL VIEW (Ultra-Clean Broadcast Stage)
  if ((gameState.status === 'QUESTION' || gameState.status === 'REVEAL') && currentQ) {
    const isReveal = gameState.status === 'REVEAL';
    const isLowTime = !isReveal && gameState.timeRemaining <= 5;
    const showAlternatives = Boolean(gameState.showTvOptions);
    const showTitle = isReveal && Boolean(gameState.showTvTitle);
    const totalVotes = Object.values(gameState.voteDistribution || {}).reduce((a, b) => a + b, 0);

    const sortedOptionsByVotes = [...currentQ.options].sort((a, b) => {
      const vA = gameState.voteDistribution?.[a] || 0;
      const vB = gameState.voteDistribution?.[b] || 0;
      return vB - vA;
    });
    const top2Options = sortedOptionsByVotes.slice(0, 2);

    return (
      <TvWrapper>
        {/* Top Header: Ultra-Clean (Only doublePoints if active, countdown timer on right) */}
        <div className="w-full flex items-center justify-between min-h-[44px]">
          <div>
            {gameState.doublePoints && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-red-100 border border-red-300 text-xs font-black text-red-700 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-red-600 fill-current" />
                PUNTOS x2
              </span>
            )}
          </div>

          {/* Minimalist Clock Countdown during question (Hidden during reveal) */}
          {!isReveal && gameState.timeRemaining > 0 && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border transition-all ${
              isLowTime
                ? 'bg-red-50 border-red-400 text-red-600 scale-105 animate-pulse shadow-md'
                : 'bg-[#FAF7F2] border-[#00A8B5]/30 text-[#133842]'
            }`}>
              <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-600 animate-spin' : 'text-[#00A8B5]'}`} />
              <span className="font-mono text-2xl font-black">
                {gameState.timeRemaining}s
              </span>
            </div>
          )}
        </div>

        {/* Center: Massive Emojis / Photo - ALWAYS SOLID, Crisp & Fully Centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto w-full max-w-4xl mx-auto py-2">
          {currentQ.photoUrl || currentQ.image ? (
            <div className="relative flex flex-col items-center justify-center">
              <img
                src={currentQ.photoUrl || currentQ.image}
                alt={currentQ.title}
                className="max-h-[280px] sm:max-h-[340px] md:max-h-[380px] w-auto object-contain rounded-3xl shadow-2xl border-4 border-white transition-all"
              />

              {/* When revealed, the correct answer name appears directly below the photo, centered */}
              {showTitle ? (
                <div className="mt-3 sm:mt-4 animate-dramatic-reveal text-center">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#005F6A] font-display tracking-tight drop-shadow-sm">
                    {currentQ.correctAnswer || currentQ.title}
                  </h2>
                  {currentQ.emojis && (
                    <div className="mt-1 text-xl sm:text-2xl select-none filter drop-shadow opacity-80">
                      {currentQ.emojis}
                    </div>
                  )}
                </div>
              ) : (
                /* Emojis shown while question is active */
                <div className="mt-3 text-3xl sm:text-5xl select-none filter drop-shadow">
                  {currentQ.emojis}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="px-8 sm:px-16 py-8 sm:py-12 rounded-3xl bg-[#FAF7F2] border-2 border-[#00A8B5]/30 shadow-inner relative max-w-3xl w-full">
                {/* Emojis ALWAYS SOLID - NO blur filter */}
                <div className="text-7xl sm:text-9xl md:text-[10rem] tracking-wider select-none filter drop-shadow-md">
                  {currentQ.emojis}
                </div>
              </div>

              {/* Movie Title: Directly below emojis, centered */}
              {showTitle && (
                <div className="mt-4 sm:mt-6 animate-dramatic-reveal text-center">
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#005F6A] font-display tracking-tight drop-shadow-sm">
                    {currentQ.correctAnswer || currentQ.title}
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Single Row for Alternatives (only when called by Admin) */}
        <div className="w-full min-h-[90px] flex items-center justify-center">
          {showAlternatives ? (
            /* Single Horizontal Row of 4 Alternatives */
            <div className="w-full grid grid-cols-4 gap-2.5 sm:gap-3 animate-fade-in">
              {currentQ.options.map((opt, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const count = gameState.voteDistribution?.[opt] || 0;
                const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isCorrect = isReveal && Boolean(gameState.showTvTitle) && isAnswerCorrect(opt, currentQ);
                const isSuspense = Boolean(gameState.suspenseMode) && !isReveal;
                const isTop2 = isSuspense && top2Options.includes(opt);
                const isDimmed = isSuspense && !top2Options.includes(opt);

                return (
                  <div
                    key={opt}
                    className={`p-3 rounded-2xl border text-center relative overflow-hidden transition-all duration-500 flex flex-col justify-between min-h-[72px] sm:min-h-[82px] shadow-sm ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-500 shadow-lg ring-2 ring-emerald-500/40 text-emerald-950 font-black scale-102'
                        : isTop2
                          ? 'bg-amber-50/95 border-amber-400 shadow-xl ring-2 ring-amber-400 text-amber-950 font-black scale-102 animate-pulse'
                          : isDimmed
                            ? 'opacity-25 grayscale scale-95 bg-gray-100 border-gray-200 text-gray-400'
                            : 'bg-[#FAF7F2] border-[#00A8B5]/20 text-[#133842]'
                    }`}
                  >
                    {/* Percent fill bar during reveal */}
                    {isReveal && (
                      <div
                        className={`absolute bottom-0 left-0 right-0 opacity-25 transition-all duration-700 ${
                          isCorrect ? 'bg-emerald-500' : 'bg-[#00A8B5]'
                        }`}
                        style={{ height: `${percent}%` }}
                      />
                    )}

                    {/* Top Row: Letter badge and percentage */}
                    <div className="relative z-10 flex items-center justify-between w-full mb-1">
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isTop2
                            ? 'bg-amber-500 text-black font-extrabold'
                            : 'bg-[#00A8B5]/20 text-[#005F6A]'
                      }`}>
                        {letters[idx]}
                      </span>
                      {isTop2 && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/90 px-1.5 py-0.5 rounded-full border border-amber-400">
                          ⚡ Top Votos
                        </span>
                      )}
                      {isReveal && (
                        <span className="font-mono text-xs font-black text-[#133842]">
                          {percent}%
                        </span>
                      )}
                    </div>

                    {/* Option Text */}
                    <div className="relative z-10 text-xs sm:text-sm font-bold truncate leading-tight my-auto">
                      {opt}
                    </div>

                    {/* Vote Count during reveal */}
                    {isReveal && (
                      <div className="relative z-10 text-[10px] text-gray-500 font-mono mt-0.5">
                        {count} {count === 1 ? 'voto' : 'votos'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* When alternatives are hidden: clean empty state, completely pristine */
            <div className="h-4" />
          )}
        </div>
      </TvWrapper>
    );
  }

  // 3. PODIUM / RANKING (Pure Broadcast Screen)
  if (gameState.status === 'RANKING' || gameState.status === 'PODIUM') {
    const isFinalPodium = gameState.status === 'PODIUM';
    const topPlayers = gameState.leaderboard || [];

    return (
      <TvWrapper>
        {/* Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#8A7016] text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>EMOJI MOVIE</span>
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
