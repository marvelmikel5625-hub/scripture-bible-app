import { useState, useEffect } from 'react';
import { Copy, Share2, Bookmark, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addBookmark, removeBookmark, isBookmarked } from '../utils/storage';

export default function DailyVerse() {
  const [verse, setVerse] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynth = window.speechSynthesis;

  useEffect(() => {
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const idx = day % 5;
    const verses = [
      { 
        bookId: 19, bookName: 'Psalms', chapter: 23, verse: 4, 
        text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
        context: 'Psalm 23 offers comfort and assurance of God\'s presence even in the darkest valleys.' 
      },
      { 
        bookId: 43, bookName: 'John', chapter: 3, verse: 16, 
        text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        context: 'The heart of the Gospel - God\'s love expressed through the gift of his Son.' 
      },
      { 
        bookId: 20, bookName: 'Proverbs', chapter: 3, verse: 5, 
        text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
        context: 'Surrendering our understanding and placing complete trust in God.' 
      },
      { 
        bookId: 40, bookName: 'Matthew', chapter: 5, verse: 16, 
        text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
        context: 'Living authentically and letting good deeds point others to God.' 
      },
      { 
        bookId: 45, bookName: 'Romans', chapter: 8, verse: 28, 
        text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
        context: 'God works in all circumstances for the ultimate good of those who love him.' 
      },
    ];
    const v = verses[idx % verses.length];
    setVerse(v);
    setBookmarked(isBookmarked(v.bookId, v.chapter, v.verse));
  }, []);

  const handleCopy = () => {
    if (!verse) return;
    navigator.clipboard.writeText(`${verse.text} — ${verse.bookName} ${verse.chapter}:${verse.verse} (KJV)`);
  };

  const handleShare = async () => {
    if (!verse) return;
    try { 
      await navigator.share({ 
        text: `${verse.text} — ${verse.bookName} ${verse.chapter}:${verse.verse} (KJV)` 
      }); 
    } catch { 
      handleCopy(); 
    }
  };

  const handleBookmark = () => {
    if (!verse) return;
    if (bookmarked) {
      removeBookmark(verse.bookId, verse.chapter, verse.verse);
      setBookmarked(false);
    } else {
      addBookmark({ 
        bookId: verse.bookId, 
        bookName: verse.bookName, 
        chapter: verse.chapter, 
        verse: verse.verse, 
        text: verse.text 
      });
      setBookmarked(true);
    }
  };

  const readAloud = () => {
    if (!verse) return;
    if (isSpeaking) {
      speechSynth.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(verse.text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynth.speak(utterance);
    setIsSpeaking(true);
  };

  if (!verse) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold">Daily Verse</h1>
        <p className="text-muted-foreground mt-1">A verse for today from the KJV</p>
      </div>
      
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-8 md:p-12 border border-primary-200 dark:border-primary-800/30">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-sm bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            {verse.bookName} {verse.chapter}:{verse.verse}
          </span>
        </div>
        
        <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-center">
          "{verse.text}"
        </blockquote>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          — {verse.bookName} {verse.chapter}:{verse.verse} (KJV)
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-colors"
          >
            <Copy size={18} />
            <span>Copy</span>
          </button>
          <button 
            onClick={handleShare} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-colors"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
          <button 
            onClick={readAloud} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isSpeaking 
                ? 'bg-primary-500 text-white hover:bg-primary-600' 
                : 'bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30'
            }`}
          >
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>
          <button 
            onClick={handleBookmark} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              bookmarked 
                ? 'bg-primary-500 text-white hover:bg-primary-600' 
                : 'bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30'
            }`}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>
      
      {verse.context && (
        <div className="mt-8 p-6 bg-card rounded-xl border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Reflection</h3>
          <p className="text-sm leading-relaxed">{verse.context}</p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link 
          to={`/bible/${verse.bookId}/${verse.chapter}`} 
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >
          Read Full Chapter <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
