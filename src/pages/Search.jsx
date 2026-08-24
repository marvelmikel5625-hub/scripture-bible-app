import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ArrowRight } from 'lucide-react';
import { BOOKS } from '../data/books';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/storage';
import kjv from 'kjv-bible';

// Map book IDs to names
const bookNameMap = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
  15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms',
  20: 'Proverbs', 21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah',
  24: 'Jeremiah', 25: 'Lamentations', 26: 'Ezekiel', 27: 'Daniel',
  28: 'Hosea', 29: 'Joel', 30: 'Amos', 31: 'Obadiah', 32: 'Jonah',
  33: 'Micah', 34: 'Nahum', 35: 'Habakkuk', 36: 'Zephaniah', 37: 'Haggai',
  38: 'Zechariah', 39: 'Malachi', 40: 'Matthew', 41: 'Mark', 42: 'Luke',
  43: 'John', 44: 'Acts', 45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians',
  48: 'Galatians', 49: 'Ephesians', 50: 'Philippians', 51: 'Colossians',
  52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
  56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
  61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude',
  66: 'Revelation'
};

// Reverse map for book ID lookup
const bookIdMap = {};
Object.entries(bookNameMap).forEach(([id, name]) => {
  bookIdMap[name] = parseInt(id);
});

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [allVerses, setAllVerses] = useState([]);

  // Load all verses once when component mounts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    
    // Build complete verse index
    const verses = [];
    Object.entries(kjv).forEach(([bookName, book]) => {
      Object.entries(book).forEach(([chapter, chapterData]) => {
        Object.entries(chapterData).forEach(([verse, text]) => {
          verses.push({
            bookName,
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            text,
            bookId: bookIdMap[bookName] || 0
          });
        });
      });
    });
    setAllVerses(verses);
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const q = searchQuery.toLowerCase().trim();
    
    // Check for verse reference: "John 3:16"
    const verseMatch = q.match(/^(\w+)\s+(\d+):(\d+)$/);
    if (verseMatch) {
      const bookName = verseMatch[1];
      const chapter = parseInt(verseMatch[2]);
      const verse = parseInt(verseMatch[3]);
      
      const found = allVerses.find(v => 
        v.bookName.toLowerCase() === bookName.toLowerCase() && 
        v.chapter === chapter && 
        v.verse === verse
      );
      
      if (found) {
        setResults([{ ...found, matchType: 'exact' }]);
      } else {
        setResults([]);
      }
      setIsSearching(false);
      if (searchQuery.trim()) {
        addRecentSearch(searchQuery.trim());
        setRecentSearches(getRecentSearches());
      }
      return;
    }

    // Regular search
    const searchResults = allVerses.filter(verse => {
      const textMatch = verse.text.toLowerCase().includes(q);
      const bookMatch = verse.bookName.toLowerCase().includes(q);
      return textMatch || bookMatch;
    });

    setResults(searchResults.slice(0, 50));
    setIsSearching(false);

    if (searchQuery.trim() && searchResults.length > 0) {
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
            <button 
              onClick={() => { setQuery(''); setResults([]); }} 
              className="p-2 mr-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <button 
            onClick={() => handleSearch(query)} 
            className="px-4 py-2 mr-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            Search
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Search all {allVerses.length.toLocaleString()} verses • Try "John 3:16" for exact verse
        </p>
      </div>

      {recentSearches.length > 0 && !query && results.length === 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
            <button 
              onClick={() => { clearRecentSearches(); setRecentSearches([]); }} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <button 
                key={index} 
                onClick={() => { setQuery(term); handleSearch(term); }} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-sm"
              >
                <Clock size={14} />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSearching ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching {allVerses.length.toLocaleString()} verses...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{results.length} results found</p>
          {results.map((result, index) => (
            <Link 
              key={index} 
              to={`/bible/${result.bookId}/${result.chapter}`} 
              className="block p-4 bg-card rounded-xl border border-border hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{result.bookName}</span>
                    <span>{result.chapter}:{result.verse}</span>
                    {result.matchType === 'exact' && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                        Exact match
                      </span>
                    )}
                  </div>
                  <p className="font-serif leading-relaxed">{highlightText(result.text, query)}</p>
                </div>
                <ArrowRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : query && !isSearching ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or check the spelling.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-xl font-semibold mb-2">Search the Bible</h3>
          <p className="text-muted-foreground">Enter a word, phrase, or verse reference to get started.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['love', 'faith', 'grace', 'peace', 'hope', 'joy', 'mercy'].map(term => (
              <button
                key={term}
                onClick={() => { setQuery(term); handleSearch(term); }}
                className="px-3 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
