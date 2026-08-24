import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import Bible from './pages/Bible';
import Search from './pages/Search';
import Bookmarks from './pages/Bookmarks';
import Notes from './pages/Notes';
import DailyVerse from './pages/DailyVerse';
import Settings from './pages/Settings';
import { getSettings } from './utils/storage';

function AppContent() {
  var [sidebarOpen, setSidebarOpen] = useState(false);
  var location = useLocation();

  useEffect(function() {
    var settings = getSettings();
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(function() {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={function() { setSidebarOpen(false); }} />
      <BottomNav />
      <main className="pt-14 transition-all duration-300 lg:ml-72 pb-20 lg:pb-8">
        <div className="px-4 sm:px-6 py-6 md:py-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bible" element={<Bible />} />
            <Route path="/bible/:bookId" element={<Bible />} />
            <Route path="/bible/:bookId/:chapter" element={<Bible />} />
            <Route path="/search" element={<Search />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/daily-verse" element={<DailyVerse />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
