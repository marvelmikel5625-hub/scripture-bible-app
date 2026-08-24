import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { BOOKS } from '../../data/books';

export default function BookSelector({ currentBookId, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [testament, setTestament] = useState('all');

  const filteredBooks = BOOKS.filter(book => {
    const matchesTestament = testament === 'all' || book.testament === testament;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  const oldBooks = filteredBooks.filter(b => b.testament === 'old');
  const newBooks = filteredBooks.filter(b => b.testament === 'new');

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="flex-1 relative">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex border-b border-border">
        {[
          { value: 'all', label: 'All Books' },
          { value: 'old', label: 'Old Testament' },
          { value: 'new', label: 'New Testament' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTestament(value)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              testament === value
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
        {testament !== 'new' && oldBooks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Old Testament
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {oldBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/bible/${book.id}/1`}
                  onClick={onClose}
                  className={`px-3 py-2 rounded-lg text-sm text-center transition-all ${
                    book.id === currentBookId
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-muted'
                  }`}
                >
                  {book.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {testament !== 'old' && newBooks.length > 
