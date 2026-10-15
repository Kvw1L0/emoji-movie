import React from 'react';
import { Tv, Smartphone, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useGame } from '../context/SocketContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const HomeView = ({ setView }) => {
  const { gameState, networkInfo } = useGame();
  const playerUrl = typeof window !== 'undefined'
    ? (window.location.hostname.includes('vercel.app') || (!window.location.hostname.includes('localhost') && !window.location.hostname.startsWith('192.168.') && !window.location.hostname.startsWith('10.')))
      ? `${window.location.origin}/?view=player`
      : `${window.location.protocol}//${networkInfo.localIp || window.location.hostname}:${window.location.port || '5173'}/?view=player`
    : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-2">
        <h1 className="text-6xl sm:text-7xl font-black text-white font-display tracking-tight drop-shadow-xl">
          EMOJI <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">MOVIE</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
          Adivina películas icónicas de Hollywood a través de emoticones en tiempo real.
        </p>
      </div>

      {/* 3 Main Screen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TV Screen */}
        <div
          onClick={() => setView('tv')}
          className="group bg-[#131722]/90 hover:bg-[#181d2b] border border-white/10 hover:border-yellow-400/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-xl hover:scale-102"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center text-xl group-hover:bg-yellow-400 group-hover:text-black transition-all">
              <Tv className="w-6 h-6" />
            </div>

            <div>
              <div className="text-[10px] uppercase font-black text-yellow-400 tracking-wider">
                Proyector / Smart TV
              </div>
              <h3 className="text-xl font-black text-white font-display">
                Pantalla Gigante
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Muestra los emojis gigantes, reloj sincronizado, revelaciones y podio con confeti.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-yellow-400 text-xs font-bold">
            <span>Abrir TV</span>
            <span>→</span>
          </div>
        </div>

        {/* Player Screen */}
        <div
          onClick={() => setView('player')}
          className="group bg-[#131722]/90 hover:bg-[#181d2b] border border-white/10 hover:border-emerald-400/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-xl hover:scale-102"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center text-xl group-hover:bg-emerald-400 group-hover:text-black transition-all">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <div className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                Teléfonos Móviles
              </div>
              <h3 className="text-xl font-black text-white font-display">
                Pantalla del Jugador
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Para los participantes. Botones de opciones cliqueables y desclickeables con puntaje en vivo.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>Entrar a Jugar</span>
            <span>→</span>
          </div>
        </div>

        {/* Admin Screen */}
        <div
          onClick={() => setView('admin')}
          className="group bg-[#131722]/90 hover:bg-[#181d2b] border border-white/10 hover:border-purple-400/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-xl hover:scale-102"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-400/10 border border-purple-400/30 text-purple-400 flex items-center justify-center text-xl group-hover:bg-purple-400 group-hover:text-black transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <div className="text-[10px] uppercase font-black text-purple-400 tracking-wider">
                Control de Conducción
              </div>
              <h3 className="text-xl font-black text-white font-display">
                Administrador
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Control de rondas, pausas, pistas en vivo, puntos x2, moderación y efectos de sonido.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-purple-400 text-xs font-bold">
            <span>Abrir Control</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* QR Code Join Box */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Red Wi-Fi Local</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Conecta los teléfonos a la misma red Wi-Fi
          </h3>
          <div className="font-mono text-xs text-yellow-300 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 inline-block select-all">
            {playerUrl}
          </div>
        </div>

        <div className="shrink-0">
          <QRCodeDisplay url={playerUrl} size={150} showDetails={false} />
        </div>
      </div>
    </div>
  );
};
