import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookOpen, Search, Bookmark, StickyNote, Copy, Share2 } from 'lucide-react';
import { getReadingProgress, getBookmarks, getNotes } from '../utils/storage';
import { BOOKS } from '../data/books';

export default function Home() {
  const [progress, setProgress] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [dailyVerse, setDailyVerse] = useState(null);

  useEffect(() => {
    setProgress(getReadingProgress());
    setBookmarks(getBookmarks());
    setNotes(getNotes());

    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const idx = day % 5;
    const verses = [
      { bookId: 19, bookName: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { bookId: 43, bookName: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { bookId: 20, bookName: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
      { bookId: 40, bookName: 'Matthew', chapter: 5, verse: 16, text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.' },
      { bookId: 45, bookName: 'Romans', chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
    ];
    setDailyVerse(verses[idx % verses.length]);
  }, []);

  const popularBooks = [
    { id: 1, name: 'Genesis', desc: 'The beginning of all things' },
    { id: 19, name: 'Psalms', desc: 'Songs of praise and prayer' },
    { id: 20, name: 'Proverbs', desc: 'Wisdom for daily living' },
    { id: 40, name: 'Matthew', desc: 'The life of Jesus' },
    { id: 43, name: 'John', desc: 'The Gospel of love' },
    { id: 45, name: 'Romans', desc: 'The Gospel explained' },
    { id: 66, name: 'Revelation', desc: 'The final victory' },
  ];

  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const handleShare = async (text) => {
    try { await navigator.share({ text }); } catch { handleCopy(text); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Continue your journey through Scripture.</p>
        <p className="text-xs text-muted-foreground mt-1">King James Version (KJV)</p>
      </section>

      {dailyVerse && (
        <section className="mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-6 md:p-8 border border-primary-200 dark:border-primary-800/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-primary-600 dark:text-primary-400">Verse of the Day</h2>
              <span className="text-sm text-muted-foreground">{dailyVerse.bookName} {dailyVerse.chapter}:{dailyVerse.verse}</span>
            </div>
            <blockquote className="font-serif text-xl md:text-2xl leading-relaxed">"{dailyVerse.text}"</blockquote>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => handleCopy(`${dailyVerse.text} — ${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse} (KJV)`)} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"><Copy size={18} /></button>
              <button onClick={() => handleShare(`${dailyVerse.text} — ${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse} (KJV)`)} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"><Share2 size={18} /></button>
              <Link to={`/bible/${dailyVerse.bookId}/${dailyVerse.chapter}`} className="ml-auto text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Read Full Chapter →</Link>
            </div>
          </div>
        </section>
      )}

      {progress && (
        <section className="mb-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Continue Reading</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg font-semibold">{BOOKS.find(b => b.id === progress.bookId)?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">Chapter {progress.chapter}</p>
              </div>
              <Link to={`/bible/${progress.bookId}/${progress.chapter}`} className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium hover:underline">Continue reading →</Link>
            </div>
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Read Bible', path: '/bible' },
            { icon: Search, label: 'Search', path: '/search' },
            { icon: Bookmark, label: `Bookmarks (${bookmarks.length})`, path: '/bookmarks' },
            { icon: StickyNote, label: `Notes (${notes.length})`, path: '/notes' },
          ].map(({ icon: Icon, label, path }) => (
            <Link key={path} to={path} className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary-300 hover:shadow-md transition-all">
              <Icon size={24} className="text-primary-500" />
              <span className="text-sm font-medium text-center">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Popular Books</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {popularBooks.map((book) => (
            <Link key={book.id} to={`/bible/${book.id}/1`} className="p-4 bg-card rounded-xl border border-border hover:border-primary-300 hover:shadow-md transition-all group">
              <h3 className="font-serif font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{book.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{book.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
