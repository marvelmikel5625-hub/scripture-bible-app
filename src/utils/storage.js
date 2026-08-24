var STORAGE_KEYS = {
  BOOKMARKS: 'scripture_bookmarks',
  NOTES: 'scripture_notes',
  READING_PROGRESS: 'scripture_reading_progress',
  SETTINGS: 'scripture_settings',
  RECENT_SEARCHES: 'scripture_recent_searches',
};

export function getItem(key, def) {
  if (def === undefined) def = null;
  try {
    var v = localStorage.getItem(key);
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
  var b = getBookmarks();
  var exists = false;
  for (var i = 0; i < b.length; i++) {
    if (b[i].bookId === bm.bookId && b[i].chapter === bm.chapter && b[i].verse === bm.verse) {
      exists = true;
      break;
    }
  }
  if (!exists) {
    b.push({ 
      bookId: bm.bookId, 
      bookName: bm.bookName, 
      chapter: bm.chapter, 
      verse: bm.verse, 
      text: bm.text,
      createdAt: new Date().toISOString() 
    });
    setItem(STORAGE_KEYS.BOOKMARKS, b);
  }
  return b;
}

export function removeBookmark(bookId, chapter, verse) {
  var b = getBookmarks();
  var newB = [];
  for (var i = 0; i < b.length; i++) {
    if (!(b[i].bookId === bookId && b[i].chapter === chapter && b[i].verse === verse)) {
      newB.push(b[i]);
    }
  }
  setItem(STORAGE_KEYS.BOOKMARKS, newB);
  return newB;
}

export function isBookmarked(bookId, chapter, verse) {
  var b = getBookmarks();
  for (var i = 0; i < b.length; i++) {
    if (b[i].bookId === bookId && b[i].chapter === chapter && b[i].verse === verse) {
      return true;
    }
  }
  return false;
}

// Notes
export function getNotes() {
  return getItem(STORAGE_KEYS.NOTES, []);
}

export function addNote(note) {
  var n = getNotes();
  var newNote = { 
    bookId: note.bookId, 
    bookName: note.bookName, 
    chapter: note.chapter, 
    verse: note.verse, 
    text: note.text,
    content: note.content,
    id: Date.now().toString(), 
    createdAt: new Date().toISOString() 
  };
  n.push(newNote);
  setItem(STORAGE_KEYS.NOTES, n);
  return n;
}

export function deleteNote(id) {
  var n = getNotes();
  var newN = [];
  for (var i = 0; i < n.length; i++) {
    if (n[i].id !== id) {
      newN.push(n[i]);
    }
  }
  setItem(STORAGE_KEYS.NOTES, newN);
  return newN;
}

export function updateNote(id, content) {
  var n = getNotes();
  for (var i = 0; i < n.length; i++) {
    if (n[i].id === id) {
      n[i].content = content;
      n[i].updatedAt = new Date().toISOString();
    }
  }
  setItem(STORAGE_KEYS.NOTES, n);
  return n;
}

// Reading Progress
export function getReadingProgress() {
  return getItem(STORAGE_KEYS.READING_PROGRESS, null);
}

export function saveReadingProgress(bookId, chapter) {
  var p = { bookId: bookId, chapter: chapter, timestamp: new Date().toISOString() };
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
  var s = getRecentSearches();
  var newS = [];
  for (var i = 0; i < s.length; i++) {
    if (s[i].toLowerCase() !== q.toLowerCase()) {
      newS.push(s[i]);
    }
  }
  newS.unshift(q);
  if (newS.length > 10) newS = newS.slice(0, 10);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, newS);
  return newS;
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
}
