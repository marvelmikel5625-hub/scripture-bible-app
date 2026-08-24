import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/storage';
import kjv from '../data/kjv-data';

// Map book IDs to names
var bookNameMap = {
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
var bookIdMap = {};
Object.entries(bookNameMap).forEach(function(entry) {
  var id = entry[0];
  var name = entry[1];
  bookIdMap[name] = parseInt(id);
});

export default function Search() {
  var [query, setQuery] = useState('');
  var [results, setResults] = useState([]);
  var [isSearching, setIsSearching] = useState(false);
  var [recentSearches, setRecentSearches] = useState([]);
  var [allVerses, setAllVerses] = useState([]);
  var [loadingError, setLoadingError] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  // Load all verses once when component mounts
  useEffect(function() {
    setRecentSearches(getRecentSearches());
    
    // Build complete verse index from local data
    var verses = [];
    
    try {
      // Check if kjv data exists
      if (!kjv || typeof kjv !== 'object') {
        throw new Error('Bible data is not available.');
      }

      var bookKeys = Object.keys(kjv);
      if (bookKeys.length === 0) {
        throw new Error('No Bible books found in the data.');
      }

      Object.entries(kjv).forEach(function(entry) {
        var bookName = entry[0];
        var book = entry[1];
        
        // Skip if book data is invalid
        if (!book || typeof book !== 'object') {
          console.warn('Skipping invalid book:', bookName);
          return;
        }

        Object.entries(book).forEach(function(chapterEntry) {
          var chapter = chapterEntry[0];
          var chapterData = chapterEntry[1];
          
          // Skip if chapter data is invalid
          if (!chapterData || typeof chapterData !== 'object') {
            console.warn('Skipping invalid chapter', chapter, 'in', bookName);
            return;
          }

          Object.entries(chapterData).forEach(function(verseEntry) {
            var verse = verseEntry[0];
            var text = verseEntry[1];
            
            // Skip if verse text is invalid
            if (!text || typeof text !== 'string') {
              console.warn('Skipping invalid verse', verse, 'in', bookName, chapter);
              return;
            }

            var bookId = bookIdMap[bookName];
            if (!bookId) {
              console.warn('Unknown book:', bookName);
              return;
            }

            verses.push({
              bookName: bookName,
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
      console.error('Error loading Bible data:', error);
      setLoadingError(error.message || 'Failed to load Bible data. Please try again later.');
      setAllVerses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  var handleSearch = function(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (loadingError) {
      return;
    }

    setIsSearching(true);
    var q = searchQuery.toLowerCase().trim();
    
    // Check for verse reference: "John 3:16"
    var verseMatch = q.match(/^(\w+)\s+(\d+):(\d+)$/);
    if (verseMatch) {
      var bookName = verseMatch[1];
      var chapter = parseInt(verseMatch[2]);
      var verse = parseInt(verseMatch[3]);
      
      var found = null;
      for (var i = 0; i < allVerses.length; i++) {
        var v = allVerses[i];
        if (v.bookName.toLowerCase() === bookName.toLowerCase() && v.chapter === chapter && v.verse === verse) {
          found = v;
          break;
        }
      }
      
      if (found) {
        setResults([{ 
          bookName: found.bookName, 
          bookId: found.bookId, 
          chapter: found.chapter, 
          verse: found.verse, 
          text: found.text, 
          matchType: 'exact' 
        }]);
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
    var searchResults = [];
    for (var i = 0; i < allVerses.length; i++) {
      var verse = allVerses[i];
      try {
        var textMatch = verse.text.toLowerCase().indexOf(q) !== -1;
        var bookMatch = verse.bookName.toLowerCase().indexOf(q) !== -1;
        if (textMatch || bookMatch) {
          searchResults.push(verse);
        }
      } catch (err) {
        console.warn('Error searching verse:', err);
      }
    }

    setResults(searchResults.slice(0, 50));
    setIsSearching(false);

    if (searchQuery.trim() && searchResults.length > 0) {
      addRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
    }
  };

  var highlightText = function(text, query) {
    if (!query || !query.trim() || !text) return text;
    try {
      var parts = text.split(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
      return parts.map(function(part, i) {
        if (part.toLowerCase() === query.toLowerCase()) {
          return <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">{part}</span>;
        }
        return part;
      });
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
            onClick={function() { window.location.reload(); }} 
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
            onChange={function(e) { setQuery(e.target.value); }}
            placeholder="Search for verses... e.g., 'love', 'John 3:16'"
            className="flex-1 px-3 py-3 bg-transparent outline-none"
            onKeyDown={function(e) { if (e.key === 'Enter') handleSearch(query); }}
            disabled={!!loadingError}
          />
          {query && (
            <button 
              onClick={function() { setQuery(''); setResults([]); }} 
              className="p-2 mr-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <button 
            onClick={function() { handleSearch(query); }} 
            className="px-4 py-2 mr-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!!loadingError || allVerses.length === 0}
          >
            Search
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {allVerses.length > 0 
            ? 'Search all ' + allVerses.length.toLocaleString() + ' verses • Try "John 3:16" for exact verse'
            : 'Loading Bible data...'}
        </p>
      </div>

      {recentSearches.length > 0 && !query && results.length === 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
            <button 
              onClick={function() { clearRecentSearches(); setRecentSearches([]); }} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(function(term, index) {
              return (
                <button 
                  key={index} 
                  onClick={function() { setQuery(term); handleSearch(term); }} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-sm"
                >
                  <Clock size={14} />
                  {term}
                </button>
              );
            })}
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
          {results.map(function(result, index) {
            return (
              <Link 
                key={index} 
                to={'/bible/' + result.bookId + '/' + result.chapter} 
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
            );
          })}
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
            {['love', 'faith', 'grace', 'peace', 'hope', 'joy', 'mercy'].map(function(term) {
              return (
                <button
                  key={term}
                  onClick={function() { setQuery(term); handleSearch(term); }}
                  className="px-3 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors text-sm"
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
