import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { TvView } from './views/TvView';
import { PlayerView } from './views/PlayerView';
import { AdminView } from './views/AdminView';
import { HomeView } from './views/HomeView';

function resolveView() {
  if (typeof window === 'undefined') return 'player';

  const path = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const queryView = params.get('view')?.toLowerCase();

  // 1. Direct TV / Streaming route
  if (path === '/tv' || path.startsWith('/tv/') || queryView === 'tv' || path === '/screen') {
    return 'tv';
  }

  // 2. Direct Admin route
  if (path === '/admin' || path.startsWith('/admin/') || queryView === 'admin') {
    return 'admin';
  }

  // 3. Optional Launcher Hub
  if (path === '/hub' || path.startsWith('/hub/') || queryView === 'hub') {
    return 'hub';
  }

  // 4. Default: All other routes, root '/', and mobile players go directly to Player Screen!
  return 'player';
}

export function App() {
  const [view, setView] = useState(resolveView);

  useEffect(() => {
    const handlePopState = () => {
      setView(resolveView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetView = (newView) => {
    setView(newView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (newView === 'player') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', newView);
      }
      window.history.pushState({}, '', url);
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-[#FAF7F2] text-[#133842] flex flex-col font-sans selection:bg-[#00A8B5] selection:text-white">
        {/* Isolated Screens: NO global navbar */}
        <main className="flex-1 w-full">
          {view === 'tv' && <TvView />}
          {view === 'player' && <PlayerView />}
          {view === 'admin' && <AdminView setView={handleSetView} />}
          {view === 'hub' && <HomeView setView={handleSetView} />}
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;
