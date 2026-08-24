import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Copy, Share2, ArrowRight, Calendar } from 'lucide-react';
import { getBookmarks, removeBookmark } from '../utils/storage';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (bookId, chapter, verse) => {
    setBookmarks(removeBookmark(bookId, chapter, verse));
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);
  
  const handleShare = async (text) => {
    try { 
      await navigator.share({ text }); 
    } catch { 
      handleCopy(text); 
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
            <Bookmark size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">No Bookmarks Yet</h2>
          <p className="text-muted-foreground mb-6">Start bookmarking verses as you read to save them here.</p>
          <Link to="/bible" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
            Start Reading <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold">
          Bookmarks 
          <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
            ({bookmarks.length})
          </span>
        </h1>
      </div>
      
      <div className="space-y-3">
        {bookmarks.map((bm, index) => {
          const shareText = `${bm.text} — ${bm.bookName} ${bm.chapter}:${bm.verse} (KJV)`;
          
          return (
            <div key={index} className="bg-card rounded-xl border border-border p-4 hover:border-primary-300 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 text-sm mb-1">
                    <Link to={`/bible/${bm.bookId}/${bm.chapter}`} className="font-medium hover:text-primary-600 transition-colors">
                      {bm.bookName}
                    </Link>
                    <span className="text-muted-foreground">{bm.chapter}:{bm.verse}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(bm.createdAt)}
                    </span>
                  </div>
                  <p className="font-serif leading-relaxed">"{bm.text}"</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                <Link to={`/bible/${bm.bookId}/${bm.chapter}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm">
                  Open <ArrowRight size={14} />
                </Link>
                <button 
                  onClick={() => handleCopy(shareText)} 
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Copy"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={() => handleShare(shareText)} 
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={() => handleRemove(bm.bookId, bm.chapter, bm.verse)} 
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"
                  aria-label="Remove bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
