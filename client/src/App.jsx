import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { TvView } from './views/TvView';
import { PlayerView } from './views/PlayerView';
import { AdminView } from './views/AdminView';

export function App() {
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryView = params.get('view');
      if (['home', 'tv', 'player', 'admin'].includes(queryView)) {
        return queryView;
      }
    }
    return 'home';
  });

  // Sync URL query param when view changes without full page reload
  const handleSetView = (newView) => {
    setView(newView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('view', newView);
      window.history.pushState({}, '', url);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const qView = params.get('view');
      if (['home', 'tv', 'player', 'admin'].includes(qView)) {
        setView(qView);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <SocketProvider>
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
        {/* Navigation Bar */}
        <Navbar currentView={view} setView={handleSetView} />

        {/* Active Screen View */}
        <main className="flex-1">
          {view === 'home' && <HomeView setView={handleSetView} />}
          {view === 'tv' && <TvView />}
          {view === 'player' && <PlayerView />}
          {view === 'admin' && <AdminView />}
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;
