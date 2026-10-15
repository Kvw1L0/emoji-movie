import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/SocketContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Trophy, Clock, Users, Flame, Sparkles } from 'lucide-react';

export const TvView = () => {
  const { gameState, networkInfo } = useGame();
  const currentQ = gameState.currentQuestion;

  const joinUrl = typeof window !== 'undefined'
    ? (window.location.hostname.includes('vercel.app') || (!window.location.hostname.includes('localhost') && !window.location.hostname.startsWith('192.168.') && !window.location.hostname.startsWith('10.')))
      ? `${window.location.origin}/?view=player`
      : `${window.location.protocol}//${networkInfo.localIp || window.location.hostname}:${window.location.port || '5173'}/?view=player`
    : '';

  // Trigger confetti on Ranking or Podium
  useEffect(() => {
    if (gameState.status === 'PODIUM' || gameState.status === 'RANKING') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [gameState.status]);

  // 1. LOBBY VIEW
  if (gameState.status === 'LOBBY') {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-between p-6 sm:p-10 relative overflow-hidden bg-gradient-to-b from-[#0f111a] via-[#090b10] to-[#040507]">
        {/* Hollywood Lights Backdrop */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center z-10 pt-4">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white font-display drop-shadow-[0_0_40px_rgba(255,215,0,0.35)]">
            EMOJI <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">MOVIE</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mt-2 font-medium">
            Trivia de Cine de Hollywood
          </p>
        </div>

        {/* Center: Clean QR Code & Join Link */}
        <div className="z-10 flex flex-col items-center gap-4 my-auto">
          <QRCodeDisplay url={joinUrl} size={240} showDetails={false} />

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold text-yellow-400 tracking-wider uppercase">
              Escanea para entrar desde tu celular
            </span>
            <div className="font-mono text-xs text-gray-300 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 select-all">
              {joinUrl}
            </div>
          </div>
        </div>

        {/* Connected Players Floating Avatars */}
        <div className="w-full max-w-4xl z-10 pb-4">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
            <Users className="w-4 h-4 text-yellow-400" />
            <span>Jugadores Conectados ({gameState.totalPlayers})</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-h-28 overflow-y-auto p-1">
            {gameState.allPlayers?.length === 0 ? (
              <span className="text-gray-500 italic text-sm">Esperando jugadores...</span>
            ) : (
              gameState.allPlayers?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm backdrop-blur shadow animate-fade-in"
                >
                  <span className="text-base">{p.avatar || '🍿'}</span>
                  <span className="font-bold text-xs sm:text-sm">{p.nickname}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. QUESTION IN PROGRESS VIEW
  if (gameState.status === 'QUESTION' && currentQ) {
    const isLowTime = gameState.timeRemaining <= 5;

    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-radial from-[#151a2e] to-[#06070a]">
        {/* Glow ambient */}
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 ${
          isLowTime ? 'bg-red-600/20' : 'bg-yellow-500/10'
        }`} />

        {/* Top Bar: Question #, Category, Double points & Big Timer */}
        <div className="flex items-center justify-between gap-4 z-10 w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs sm:text-sm font-black text-gray-200">
              Película {gameState.currentIndex + 1} de {gameState.totalQuestions}
            </span>
            <span className="px-3.5 py-1 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-xs sm:text-sm font-bold text-yellow-300">
              {currentQ.category}
            </span>
            {gameState.doublePoints && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/30 border border-red-500/50 text-xs sm:text-sm font-black text-red-300 animate-pulse">
                <Flame className="w-4 h-4 text-red-400 fill-current" />
                PUNTOS x2
              </span>
            )}
          </div>

          {/* Big Timer Clock */}
          <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border transition-all ${
            isLowTime
              ? 'bg-red-500/20 border-red-500/60 text-red-400 scale-105 animate-pulse'
              : 'bg-black/50 border-white/10 text-white'
          }`}>
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-red-400 animate-spin' : 'text-yellow-400'}`} />
            <span className="font-mono text-3xl sm:text-4xl font-black">
              {gameState.timeRemaining}s
            </span>
          </div>
        </div>

        {/* Center: Massive Emojis Display */}
        <div className="z-10 flex flex-col items-center justify-center my-auto text-center py-6">
          <div className="px-8 sm:px-20 py-10 sm:py-14 rounded-3xl bg-black/60 border-2 border-yellow-400/40 shadow-[0_0_60px_rgba(255,215,0,0.15)] backdrop-blur-xl relative">
            <div className="text-7xl sm:text-9xl md:text-[10rem] tracking-wider select-none transform hover:scale-102 transition-transform duration-300 filter drop-shadow-2xl">
              {currentQ.emojis}
            </div>
          </div>

          {/* Dynamic Hints Bar if unlocked by Admin */}
          {gameState.activeHintLevel > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2 max-w-2xl animate-fade-in">
              {gameState.activeHintLevel >= 1 && (
                <div className="px-5 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-semibold flex items-center gap-2">
                  <span>💡</span>
                  <span>{currentQ.hint1} ({currentQ.year} • {currentQ.genre})</span>
                </div>
              )}
              {gameState.activeHintLevel >= 2 && (
                <div className="px-5 py-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-sm font-semibold flex items-center gap-2">
                  <span>🔍</span>
                  <span>{currentQ.hint2}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Live Vote Progress */}
        <div className="z-10 w-full max-w-6xl mx-auto pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5 font-bold">
            <span>Respuestas</span>
            <span className="font-mono text-yellow-400">
              {gameState.answeredCount} / {gameState.totalPlayers}
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 transition-all duration-300 rounded-full"
              style={{
                width: `${gameState.totalPlayers > 0 ? (gameState.answeredCount / gameState.totalPlayers) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 3. REVEAL SCREEN
  if (gameState.status === 'REVEAL' && currentQ) {
    const totalVotes = Object.values(gameState.voteDistribution || {}).reduce((a, b) => a + b, 0);

    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-gradient-to-b from-[#180e29] via-[#0b0c14] to-[#040507]">
        {/* Top Header */}
        <div className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto">
          <span className="px-4 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs sm:text-sm font-black">
            Película {gameState.currentIndex + 1} de {gameState.totalQuestions}
          </span>
          <span className="text-xs text-gray-400 font-semibold">
            {currentQ.category}
          </span>
        </div>

        {/* Center: Movie Title Reveal Card */}
        <div className="z-10 flex flex-col items-center text-center my-auto max-w-4xl mx-auto">
          <div className="text-5xl sm:text-6xl mb-3 select-none">
            {currentQ.emojis}
          </div>

          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white font-display mb-3 text-emerald-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]">
            {currentQ.title}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-300 mb-5">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-bold">
              📅 {currentQ.year}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-bold">
              🎬 {currentQ.director}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-bold">
              🏷️ {currentQ.genre}
            </span>
          </div>

          {/* Trivia */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm max-w-2xl mx-auto backdrop-blur-md italic">
            "{currentQ.trivia || currentQ.hint1}"
          </div>
        </div>

        {/* Bottom: Options Vote Breakdown Bars */}
        <div className="z-10 w-full max-w-5xl mx-auto mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const count = gameState.voteDistribution?.[opt] || 0;
              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isCorrect = opt === currentQ.title;

              return (
                <div
                  key={opt}
                  className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/5 border-white/10 opacity-75'
                  }`}
                >
                  <div
                    className={`absolute top-0 bottom-0 left-0 opacity-25 rounded-l-xl transition-all duration-700 ${
                      isCorrect ? 'bg-emerald-400' : 'bg-gray-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-white/10 text-gray-400 flex items-center justify-center text-xs">
                          •
                        </span>
                      )}
                      <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-300 font-extrabold' : 'text-gray-300'}`}>
                        {opt}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-white mr-1.5">{count}</span>
                      <span className="text-xs text-gray-400 font-mono">({percent}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. RANKING / LEADERBOARD VIEW
  if (gameState.status === 'RANKING' || gameState.status === 'PODIUM') {
    const isFinalPodium = gameState.status === 'PODIUM';
    const topPlayers = gameState.leaderboard || [];

    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-radial from-[#1e1708] via-[#0b0c10] to-[#040507]">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Header */}
        <div className="text-center z-10 max-w-2xl mx-auto pt-2">
          <h2 className="text-5xl sm:text-7xl font-black text-white font-display">
            {isFinalPodium ? '🏆 PODIO DE CAMPEONES' : 'CLASIFICACIÓN'}
          </h2>
        </div>

        {/* Center: Podium (Top 3) & List (4-10) */}
        <div className="z-10 w-full max-w-4xl mx-auto my-auto space-y-6">
          {topPlayers.length >= 1 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-8 pb-4">
              {/* 2nd Place */}
              {topPlayers[1] ? (
                <div className="flex flex-col items-center bg-white/5 border border-slate-400/30 rounded-2xl p-4 text-center order-1 h-52 sm:h-60 justify-end relative shadow-lg">
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-slate-300 text-black font-black flex items-center justify-center text-lg shadow-md border-2 border-white">
                    2🥈
                  </div>
                  <div className="text-3xl mb-1">{topPlayers[1].avatar}</div>
                  <div className="font-black text-sm sm:text-base text-white truncate max-w-full">
                    {topPlayers[1].nickname}
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-yellow-400 font-extrabold mt-1">
                    {topPlayers[1].score.toLocaleString()} pts
                  </div>
                </div>
              ) : <div className="order-1" />}

              {/* 1st Place */}
              {topPlayers[0] && (
                <div className="flex flex-col items-center bg-gradient-to-t from-yellow-500/20 to-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-5 text-center order-2 h-64 sm:h-76 justify-end relative shadow-2xl shadow-yellow-400/20">
                  <div className="absolute -top-8 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-200 text-black font-black flex items-center justify-center text-2xl shadow-xl border-4 border-yellow-300 animate-bounce-subtle">
                    👑
                  </div>
                  <div className="text-5xl mb-1">{topPlayers[0].avatar}</div>
                  <div className="font-black text-lg sm:text-2xl text-yellow-300 truncate max-w-full">
                    {topPlayers[0].nickname}
                  </div>
                  <div className="text-sm sm:text-base font-mono text-white font-black mt-1">
                    {topPlayers[0].score.toLocaleString()} pts
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topPlayers[2] ? (
                <div className="flex flex-col items-center bg-white/5 border border-amber-700/30 rounded-2xl p-4 text-center order-3 h-44 sm:h-52 justify-end relative shadow-lg">
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-lg shadow-md border-2 border-amber-600">
                    3🥉
                  </div>
                  <div className="text-3xl mb-1">{topPlayers[2].avatar}</div>
                  <div className="font-black text-sm sm:text-base text-white truncate max-w-full">
                    {topPlayers[2].nickname}
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-yellow-400 font-extrabold mt-1">
                    {topPlayers[2].score.toLocaleString()} pts
                  </div>
                </div>
              ) : <div className="order-3" />}
            </div>
          )}

          {/* Ranks 4 to 10 */}
          {topPlayers.length > 3 && (
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 divide-y divide-white/5 max-h-48 overflow-y-auto">
              {topPlayers.slice(3, 10).map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-500 font-bold w-5">
                      #{idx + 4}
                    </span>
                    <span className="text-base">{p.avatar}</span>
                    <span className="font-bold text-gray-200">{p.nickname}</span>
                    {p.streak >= 2 && (
                      <span className="text-[11px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-red-400" />
                        x{p.streak}
                      </span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-yellow-400">
                    {p.score.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    );
  }

  return null;
};
