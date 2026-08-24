import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { BOOKS } from '../data/books';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/storage';
import kjv from 'bible-kjv';

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
  const [loadingError, setLoadingError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all verses once when component mounts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    
    // Build complete verse index
    const verses = [];
    let errorOccurred = false;
    
    try {
      // Check if kjv data exists
      if (!kjv || typeof kjv !== 'object') {
        throw new Error('Bible data is not available. Please check your connection.');
      }

      const bookKeys = Object.keys(kjv);
      if (bookKeys.length === 0) {
        throw new Error('No Bible books found in the data.');
      }

      Object.entries(kjv).forEach(([bookName, book]) => {
        // Skip if book data is invalid
        if (!book || typeof book !== 'object') {
          console.warn(`Skipping invalid book: ${bookName}`);
          return;
        }

        Object.entries(book).forEach(([chapter, chapterData]) => {
          // Skip if chapter data is invalid
          if (!chapterData || typeof chapterData !== 'object') {
            console.warn(`Skipping invalid chapter ${chapter} in ${bookName}`);
            return;
          }

          Object.entries(chapterData).forEach(([verse, text]) => {
            // Skip if verse text is invalid
            if (!text || typeof text !== 'string') {
              console.warn(`Skipping invalid verse ${verse} in ${bookName} ${chapter}`);
              return;
            }

            const bookId = bookIdMap[bookName];
            if (!bookId) {
              console.warn(`Unknown book: ${bookName}`);
              return;
            }

            verses.push({
              bookName,
              chapter: parseInt(chapter),
              verse: parseInt(verse),
              text: text.trim(),
              bookId: bookId
            });
          });
        });
      });

      if (verses.length === 0) {
        throw new Error('No verses were loaded. The Bible data may be empty.');
      }

      setAllVerses(verses);
      setLoadingError(null);
    } catch (error) {
      console.error('Error loading KJV data:', error);
      errorOccurred = true;
      setLoadingError(error.message || 'Failed to load Bible data. Please try again later.');
      setAllVerses([]);
    } finally {
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      // No cleanup needed
    };
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (loadingError) {
      // Don't search if there was an error loading data
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

    // Regular search - search in verses
    const searchResults = allVerses.filter(verse => {
      try {
        const textMatch = verse.text.toLowerCase().includes(q);
        const bookMatch = verse.bookName.toLowerCase().includes(q);
        return textMatch || bookMatch;
      } catch (err) {
        console.warn('Error searching verse:', err);
        return false;
      }
    });

    setResults(searchResults.slice(0, 50));
    setIsSearching(false);

    if (searchQuery.trim() && searchResults.length > 0) {
      addRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
    }
  };

  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    try {
      const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? 
          <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">{part}</span> : 
          part
      );
    } catch (error) {
      console.warn('Error highlighting text:', error);
      return text;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-6">Search Scripture</h1>
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Bible data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadingError) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-6">Search Scripture</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Bible Data</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{loadingError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            disabled={!!loadingError}
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
            className="px-4 py-2 mr-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!!loadingError || allVerses.length === 0}
          >
            Search
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {allVerses.length > 0 
            ? `Search all ${allVerses.length.toLocaleString()} verses • Try "John 3:16" for exact verse`
            : 'Loading Bible data...'}
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
