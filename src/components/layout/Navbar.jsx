import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../utils/storage';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [settings, setSettings] = useState(getSettings());
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleThemeChange = (theme) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    saveSettings(newSettings);
    applyTheme(theme);
    setShowThemeMenu(false);
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-serif text-xl">✝</span>
            </div>
            <span className="font-serif text-xl font-semibold hidden sm:block">Scripture</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/search" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Search size={20} />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {settings.theme === 'dark' ? <Moon size={20} /> :
               settings.theme === 'light' ? <Sun size={20} /> :
               <Monitor size={20} />}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-2 z-50">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value)}
                    className={`flex items-center gap-3 w-full px-4 py-2 hover:bg-muted transition-colors ${
                      settings.theme === value ? 'text-primary-500' : ''
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    {settings.theme === value && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
