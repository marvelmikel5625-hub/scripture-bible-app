import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/storage';

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

  // Sample KJV data - key chapters
  var sampleData = {
    'Genesis': {
      1: {
        1: 'In the beginning God created the heaven and the earth.',
        2: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
        3: 'And God said, Let there be light: and there was light.',
        4: 'And God saw the light, that it was good: and God divided the light from the darkness.',
        5: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
        6: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.',
        7: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.',
        8: 'And God called the firmament Heaven. And the evening and the morning were the second day.',
        9: 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.',
        10: 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.'
      },
      2: {
        1: 'Thus the heavens and the earth were finished, and all the host of them.',
        2: 'And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.',
        3: 'And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.'
      }
    },
    'Psalms': {
      23: {
        1: 'The LORD is my shepherd; I shall not want.',
        2: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
        3: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
        4: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
        5: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
        6: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.'
      }
    },
    'John': {
      3: {
        1: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
        2: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.',
        3: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.',
        4: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother\'s womb, and be born?',
        5: 'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.',
        6: 'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.',
        7: 'Marvel not that I said unto thee, Ye must be born again.',
        8: 'The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.',
        9: 'Nicodemus answered and said unto him, How can these things be?',
        10: 'Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?',
        11: 'Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.',
        12: 'If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?',
        13: 'And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.',
        14: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:',
        15: 'That whosoever believeth in him should not perish, but have eternal life.',
        16: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        17: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
        18: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
        19: 'And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.',
        20: 'For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.',
        21: 'But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.'
      }
    },
    'Proverbs': {
      3: {
        5: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
        6: 'In all thy ways acknowledge him, and he shall direct thy paths.'
      }
    },
    'Matthew': {
      5: {
        3: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.',
        4: 'Blessed are they that mourn: for they shall be comforted.',
        5: 'Blessed are the meek: for they shall inherit the earth.',
        6: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.',
        7: 'Blessed are the merciful: for they shall obtain mercy.',
        8: 'Blessed are the pure in heart: for they shall see God.',
        9: 'Blessed are the peacemakers: for they shall be called the children of God.',
        10: 'Blessed are they which are persecuted for righteousness\' sake: for theirs is the kingdom of heaven.',
        16: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.'
      }
    },
    'Romans': {
      8: {
        28: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.'
      }
    }
  };

  // Load all verses once when component mounts
  useEffect(function() {
    setRecentSearches(getRecentSearches());
    
    // Build complete verse index from sample data
    var verses = [];
    
    try {
      Object.entries(sampleData).forEach(function(entry) {
        var bookName = entry[0];
        var book = entry[1];
        
        Object.entries(book).forEach(function(chapterEntry) {
          var chapter = chapterEntry[0];
          var chapterData = chapterEntry[1];
          
          Object.entries(chapterData).forEach(function(verseEntry) {
            var verse = verseEntry[0];
            var text = verseEntry[1];
            
            var bookId = bookIdMap[bookName];
            if (bookId) {
              verses.push({
                bookName: bookName,
                chapter: parseInt(chapter),
                verse: parseInt(verse),
                text: text,
                bookId: bookId
              });
            }
          });
        });
      });

      setAllVerses(verses);
      setLoadingError(null);
    } catch (error) {
      console.error('Error loading Bible data:', error);
      setLoadingError('Failed to load Bible data. Please try again later.');
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
      var textMatch = verse.text.toLowerCase().indexOf(q) !== -1;
      var bookMatch = verse.bookName.toLowerCase().indexOf(q) !== -1;
      if (textMatch || bookMatch) {
        searchResults.push(verse);
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
