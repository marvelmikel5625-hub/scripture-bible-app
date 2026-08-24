import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Bookmark, StickyNote, Copy, Share2, X, BookOpen,
  Shuffle, Volume2, VolumeX, RotateCcw
} from 'lucide-react';
import { BOOKS } from '../data/books';
import { getKJVChapter } from '../data/bibleLoader';
import { 
  getBookmarks, addBookmark, removeBookmark, isBookmarked,
  addNote, saveReadingProgress, getSettings 
} from '../utils/storage';
import BookSelector from '../components/bible/BookSelector';
import LoadingState from '../components/ui/LoadingState';

export default function Bible() {
  const { bookId, chapter } = useParams();
  const [book, setBook] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [settings, setSettings] = useState(getSettings());
  const [showContext, setShowContext] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [contextVerse, setContextVerse] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const speechSynth = window.speechSynthesis;

  useEffect(() => {
    if (bookId) {
      const id = parseInt(bookId);
      const found = BOOKS.find(b => b.id === id);
      if (found) {
        setBook(found);
        setLoading(true);
        const chapterNum = parseInt(chapter) || 1;
        const data = getKJVChapter(id, chapterNum);
        setVerses(data);
        setBookmarks(getBookmarks());
        saveReadingProgress(id, chapterNum);
        setLoading(false);
        setHighlightedVerse(null);
      } else {
        setBook(null);
        setVerses([]);
        setLoading(false);
      }
    }
  }, [bookId, chapter]);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Stop speech when changing chapters
  useEffect(() => {
    if (isSpeaking) {
      speechSynth.cancel();
      setIsSpeaking(false);
    }
  }, [bookId, chapter]);

  if (!bookId) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-6">Select a Book</h1>
        <BookSelector />
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-semibold text-muted-foreground">Book not found</h2>
          <button onClick={() => setShowBookSelector(true)} className="inline-block mt-4 text-primary-600 hover:underline">Browse all books</button>
        </div>
      </div>
    );
  }

  const currentChapter = parseInt(chapter) || 1;
  const progressPercentage = Math.round((currentChapter / book.chapters) * 100);

  const handleVerseClick = (verse, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setContextVerse(verse);
    setContextPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
    setShowContext(true);
    setHighlightedVerse(verse.verse);
  };

  const handleBookmark = (verse) => {
    const existing = isBookmarked(book.id, currentChapter, verse.verse);
    if (existing) {
      removeBookmark(book.id, currentChapter, verse.verse);
    } else {
      addBookmark({ bookId: book.id, bookName: book.name, chapter: currentChapter, verse: verse.verse, text: verse.text });
    }
    setBookmarks(getBookmarks());
    setShowContext(false);
  };

  const handleAddNote = (verse) => {
    setContextVerse(verse);
    setNoteContent('');
    setShowNoteModal(true);
    setShowContext(false);
  };

  const handleSaveNote = () => {
    if (!contextVerse || !noteContent.trim()) return;
    addNote({ bookId: book.id, bookName: book.name, chapter: currentChapter, verse: contextVerse.verse, text: contextVerse.text, content: noteContent.trim() });
    setShowNoteModal(false);
    setNoteContent('');
  };

  const handleCopy = (verse) => {
    navigator.clipboard.writeText(`${verse.text} — ${book.name} ${currentChapter}:${verse.verse} (KJV)`);
    setShowContext(false);
  };

  const handleShare = async (verse) => {
    const text = `${verse.text} — ${book.name} ${currentChapter}:${verse.verse} (KJV)`;
    try { await navigator.share({ text }); } catch { handleCopy(verse); }
    setShowContext(false);
  };

  const goToChapter = (c) => {
    if (c >= 1 && c <= book.chapters) {
      window.location.href = `/bible/${book.id}/${c}`;
    }
  };

  const randomVerse = () => {
    const randomBook = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
    window.location.href = `/bible/${randomBook.id}/${randomChapter}`;
  };

  const readAloud = () => {
    if (isSpeaking) {
      speechSynth.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const text = verses.map(v => v.text).join(' ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynth.speak(utterance);
    setIsSpeaking(true);
  };

  const shareChapter = () => {
    const chapterText = verses.map(v => `${v.verse} ${v.text}`).join('\n');
    const shareText = `${book.name} ${currentChapter}\n\n${chapterText}\n\n— King James Version (KJV)`;
    navigator.clipboard.writeText(shareText);
    // Show feedback
    const btn = document.getElementById('shareChapterBtn');
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Share Chapter'; }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button onClick={() => setShowBookSelector(true)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen size={14} />
              <span className="capitalize">{book.testament} Testament</span>
              <span>•</span>
              <span className="font-medium text-foreground">{book.name}</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold mt-1">Chapter {currentChapter}</h1>
            <span className="text-xs text-muted-foreground">King James Version (KJV)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={randomVerse}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
              title="Random Verse"
            >
              <Shuffle size={20} />
            </button>
            <button
              onClick={readAloud}
              className={`p-2 rounded-lg border transition-colors ${
                isSpeaking ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'border-border hover:bg-muted'
              }`}
              title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            >
              {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={() => goToChapter(currentChapter - 1)}
              disabled={currentChapter <= 1}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-muted">
              {currentChapter} / {book.chapters}
            </span>
            <button
              onClick={() => goToChapter(currentChapter + 1)}
              disabled={currentChapter >= book.chapters}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Reading Progress</span>
            <span>{progressPercentage}% of {book.name}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Share Chapter Button */}
        <button
          id="shareChapterBtn"
          onClick={shareChapter}
          className="mt-3 text-xs text-muted-foreground hover:text-primary-600 transition-colors flex items-center gap-1"
        >
          <Share2 size={12} /> Share Chapter
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {Array.from({ length: Math.min(book.chapters, 30) }, (_, i) => i + 1).map(n => (
          <button 
            key={n} 
            onClick={() => goToChapter(n)} 
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              n === currentChapter ? 'bg-primary-500 text-white' : 'hover:bg-muted'
            }`}
          >
            {n}
          </button>
        ))}
        {book.chapters > 30 && (
          <button 
            onClick={() => setShowBookSelector(true)} 
            className="w-9 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            …
          </button>
        )}
      </div>

      <div 
        className="font-serif space-y-1"
        style={{ fontSize: settings.fontSize, lineHeight: settings.lineHeight, maxWidth: settings.maxWidth }}
      >
        {verses.map(v => {
          const marked = bookmarks.some(b => b.bookId === book.id && b.chapter === currentChapter && b.verse === v.verse);
          const isHighlighted = highlightedVerse === v.verse;
          
          return (
            <div 
              key={v.verse} 
              className={`verse-item relative py-1.5 px-4 -mx-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
              }`}
              onClick={e => handleVerseClick(v, e)}
            >
              <div className="flex items-start gap-3">
                {settings.showVerseNumbers && (
                  <span className="text-xs font-sans font-medium text-muted-foreground mt-0.5 min-w-[2rem] select-none">
                    {v.verse}
                  </span>
                )}
                <p className="leading-relaxed flex-1">{v.text}</p>
                {marked && (
                  <Bookmark size={14} className="text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
        <button 
          onClick={() => goToChapter(currentChapter - 1)} 
          disabled={currentChapter <= 1} 
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          <span>Previous Chapter</span>
        </button>
        <button 
          onClick={() => goToChapter(currentChapter + 1)} 
          disabled={currentChapter >= book.chapters} 
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next Chapter</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {showContext && contextVerse && (
        <>
          <div 
            className="fixed z-50 bg-card rounded-xl shadow-lg border border-border p-1.5 min-w-[180px]"
            style={{ top: Math.min(contextPos.y, window.innerHeight - 200), left: Math.min(contextPos.x - 90, window.innerWidth - 190) }}
          >
            <button 
              onClick={() => handleBookmark(contextVerse)} 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <Bookmark size={16} />
              <span>{isBookmarked(book.id, currentChapter, contextVerse.verse) ? 'Remove Bookmark' : 'Add Bookmark'}</span>
            </button>
            <button 
              onClick={() => handleAddNote(contextVerse)} 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <StickyNote size={16} />
              <span>Add Note</span>
            </button>
            <button 
              onClick={() => handleCopy(contextVerse)} 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <Copy size={16} />
              <span>Copy</span>
            </button>
            <button 
              onClick={() => handleShare(contextVerse)} 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setShowContext(false)} />
        </>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Add Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="text-sm text-muted-foreground mb-3">
                {book.name} {currentChapter}:{contextVerse?.verse}
              </div>
              <textarea 
                value={noteContent} 
                onChange={e => setNoteContent(e.target.value)} 
                placeholder="Write your note here..." 
                className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveNote} 
                disabled={!noteContent.trim()} 
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <BookSelector currentBookId={book.id} onClose={() => setShowBookSelector(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
