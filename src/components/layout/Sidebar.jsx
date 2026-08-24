import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Search, Bookmark, StickyNote, Calendar, Settings } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/bible', label: 'Read Bible', icon: BookOpen },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/notes', label: 'Notes', icon: StickyNote },
    { path: '/daily-verse', label: 'Daily Verse', icon: Calendar },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:top-14 lg:pt-2`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-serif text-xl">✝</span>
            </div>
            <span className="font-serif text-xl font-semibold">Scripture</span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || 
                (path === '/bible' && location.pathname.startsWith('/bible/'));
              
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-6 rounded-full bg-primary-500" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <p>Scripture Bible</p>
              <p className="mt-0.5">King James Version (KJV)</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
