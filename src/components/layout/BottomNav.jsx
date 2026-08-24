import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Search, Bookmark, StickyNote } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const items = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/bible', label: 'Bible', icon: BookOpen },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/notes', label: 'Notes', icon: StickyNote },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || 
            (path === '/bible' && location.pathname.startsWith('/bible/'));
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[4rem] transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
