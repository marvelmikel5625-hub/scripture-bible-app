import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ArrowRight } from 'lucide-react';
import { BOOKS } from '../data/books';
import { getKJVChapter } from '../data/bibleLoader';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/storage';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const q = searchQuery.toLowerCase().trim();
    const allResults = [];

    BOOKS.forEach(book => {
      const chapterMatch = q.match(/(\w+)\s+(\d+):(\d+)/);
      if (chapterMatch) {
        const bookName = chapterMatch[1].toLowerCase();
        const chapterNum = parseInt(chapterMatch[2]);
        const verseNum = parseInt(chapterMatch[3]);
        
        if (book.name.toLowerCase().includes(bookName)) {
          const verses = getKJVChapter(book.id, chapterNum);
          const verse = verses.find(v => v.verse === verseNum);
          if (verse) {
            allResults.push({
              bookId: book.id,
              bookName: book.name,
              chapter: chapterNum,
              verse: verse.verse,
              text: verse.text,
              matchType: 'exact',
            });
          }
        }
      } else {
        for (let ch = 1; ch <= Math.min(book.chapters, 5); ch++) {
          const verses = getKJVChapter(book.id, ch);
          verses.forEach(verse => {
            if (verse.text.toLowerCase().includes(q)) {
              allResults.push({
                bookId: book.id,
                bookName: book.name,
                chapter: ch,
                verse: verse.verse,
                text: verse.text,
                matchType: 'keyword',
              });
            }
          });
        }
      }
    });

    setResults(allResults.slice(0, 20));
    setIsSearching(false);

    if (searchQuery.trim() && allResults.length > 0) {
      addRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
    }
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">{part}</span> : 
        part
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-6">Search Scripture</h1>

      <div className="relative mb-8">
        <div className="flex items-center bg-card rounded-xl border border-border focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <SearchIcon size={20} className="ml-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for verses... e.g., 'love', 'John 3:16'"
            className="flex-1 px-3 py-3 bg-transparent outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(query); }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); }} className="p-2 mr-2 rounded-lg hover:bg-muted transition-colors">
              <X size={18} />
            </button>
          )}
          <button onClick={() => handleSearch(query)} className="px-4 py-2 mr-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors">Search</button>
        </div>
      </div>

      {recentSearches.length > 0 && !query && results.length === 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
            <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <button key={index} onClick={() => { setQuery(term); handleSearch(term); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-sm">
                <Clock size={14} />{term}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSearching ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"></div><p className="text-muted-foreground">Searching...</p></div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{results.length} results found</p>
          {results.map((result, index) => (
            <Link key={index} to={`/bible/${result.bookId}/${result.chapter}`} className="block p-4 bg-card rounded-xl border border-border hover:border-primary-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{result.bookName}</span>
                    <span>{result.chapter}:{result.verse}</span>
                    {result.matchType === 'exact' && <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">Exact match</span>}
                  </div>
                  <p className="font-serif leading-relaxed">{highlightText(result.text, query)}</p>
                </div>
                <ArrowRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : query && !isSearching ? (
        <div className="text-center py-12"><div className="text-5xl mb-4">🔍</div><h3 className="text-xl font-semibold mb-2">No results found</h3><p className="text-muted-foreground">Try adjusting your search terms or check the spelling.</p></div>
      ) : (
        <div className="text-center py-12"><div className="text-5xl mb-4">📖</div><h3 className="text-xl font-semibold mb-2">Search the Bible</h3><p className="text-muted-foreground">Enter a word, phrase, or verse reference to get started.</p></div>
      )}
    </div>
  );
}
