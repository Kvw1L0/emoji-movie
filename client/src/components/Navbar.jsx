import React, { useState } from 'react';
import { Tv, Smartphone, ShieldCheck, Home, Volume2, VolumeX, Users, Maximize2, Minimize2 } from 'lucide-react';
import { useGame } from '../context/SocketContext';

export const Navbar = ({ currentView, setView }) => {
  const { isConnected, gameState, isMuted, toggleMute } = useGame();
  const [cinemaMode, setCinemaMode] = useState(false);

  // If in cinema mode on TV, show only a small floating toggle button
  if (currentView === 'tv' && cinemaMode) {
    return (
      <button
        onClick={() => setCinemaMode(false)}
        className="fixed top-3 right-3 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg"
        title="Mostrar barra de navegación"
      >
        <Minimize2 className="w-4 h-4" />
      </button>
    );
  }

  // If on player screen, keep only a minimal player bar so participants don't see admin/tv controls
  if (currentView === 'player') {
    return (
      <header className="sticky top-0 z-50 bg-[#0b0c10]/90 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div 
          onClick={() => setView('home')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-xl">🎬</span>
          <span className="font-black text-sm tracking-wider bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
            EMOJI MOVIE
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
          </button>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
        </div>
      </header>
    );
  }

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'tv', label: 'Pantalla TV', icon: Tv },
    { id: 'player', label: 'Jugador', icon: Smartphone },
    { id: 'admin', label: 'Administrador', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/10 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => setView('home')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🎬</span>
          <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
            EMOJI MOVIE
          </span>
        </div>

        {/* View Switcher */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Info */}
        <div className="flex items-center gap-2">
          {currentView === 'tv' && (
            <button
              onClick={() => setCinemaMode(true)}
              className="p-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-semibold flex items-center gap-1"
              title="Ocultar barra para proyectar en TV"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo TV</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs text-gray-300 font-mono">
            <Users className="w-3.5 h-3.5 text-yellow-400" />
            <span>{gameState.totalPlayers}</span>
          </div>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            title={isMuted ? 'Sonido silenciado' : 'Sonido activo'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
          </button>

          <span 
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} 
            title={isConnected ? 'En línea' : 'Desconectado'} 
          />
        </div>
      </div>
    </header>
  );
};
