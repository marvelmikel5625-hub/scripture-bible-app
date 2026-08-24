const STORAGE_KEYS = {
  BOOKMARKS: 'scripture_bookmarks',
  NOTES: 'scripture_notes',
  READING_PROGRESS: 'scripture_reading_progress',
  SETTINGS: 'scripture_settings',
  RECENT_SEARCHES: 'scripture_recent_searches',
};

export function getItem(key, def = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

export function setItem(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

// Bookmarks
export function getBookmarks() {
  return getItem(STORAGE_KEYS.BOOKMARKS, []);
}

export function addBookmark(bm) {
  const b = getBookmarks();
  if (!b.some(x => x.bookId === bm.bookId && x.chapter === bm.chapter && x.verse === bm.verse)) {
    b.push({ ...bm, createdAt: new Date().toISOString() });
    setItem(STORAGE_KEYS.BOOKMARKS, b);
  }
  return b;
}

export function removeBookmark(bookId, chapter, verse) {
  let b = getBookmarks();
  b = b.filter(x => !(x.bookId === bookId && x.chapter === chapter && x.verse === verse));
  setItem(STORAGE_KEYS.BOOKMARKS, b);
  return b;
}

export function isBookmarked(bookId, chapter, verse) {
  return getBookmarks().some(x => x.bookId === bookId && x.chapter === chapter && x.verse === verse);
}

// Notes
export function getNotes() {
  return getItem(STORAGE_KEYS.NOTES, []);
}

export function addNote(note) {
  const n = getNotes();
  const newNote = { ...note, id: Date.now().toString(), createdAt: new Date().toISOString() };
  n.push(newNote);
  setItem(STORAGE_KEYS.NOTES, n);
  return n;
}

export function deleteNote(id) {
  let n = getNotes();
  n = n.filter(x => x.id !== id);
  setItem(STORAGE_KEYS.NOTES, n);
  return n;
}

export function updateNote(id, content) {
  let n = getNotes();
  n = n.map(x => x.id === id ? { ...x, content, updatedAt: new Date().toISOString() } : x);
  setItem(STORAGE_KEYS.NOTES, n);
  return n;
}

// Reading Progress
export function getReadingProgress() {
  return getItem(STORAGE_KEYS.READING_PROGRESS, null);
}

export function saveReadingProgress(bookId, chapter) {
  const p = { bookId, chapter, timestamp: new Date().toISOString() };
  setItem(STORAGE_KEYS.READING_PROGRESS, p);
  return p;
}

// Settings
export function getSettings() {
  return getItem(STORAGE_KEYS.SETTINGS, {
    theme: 'light',
    fontSize: 16,
    lineHeight: 1.8,
    maxWidth: '65ch',
    showVerseNumbers: true
  });
}

export function saveSettings(s) {
  setItem(STORAGE_KEYS.SETTINGS, s);
}

// Recent Searches
export function getRecentSearches() {
  return getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
}

export function addRecentSearch(q) {
  let s = getRecentSearches();
  s = s.filter(x => x.toLowerCase() !== q.toLowerCase());
  s.unshift(q);
  if (s.length > 10) s = s.slice(0, 10);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, s);
  return s;
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
}
