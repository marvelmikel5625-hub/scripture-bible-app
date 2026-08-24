import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { BOOKS } from '../../data/books';

export default function BookSelector({ currentBookId, onClose }) {
  var [searchQuery, setSearchQuery] = useState('');
  var [testament, setTestament] = useState('all');

  var filteredBooks = BOOKS.filter(function(book) {
    var matchesTestament = testament === 'all' || book.testament === testament;
    var matchesSearch = book.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
    return matchesTestament && matchesSearch;
  });

  var oldBooks = filteredBooks.filter(function(b) { return b.testament === 'old'; });
  var newBooks = filteredBooks.filter(function(b) { return b.testament === 'new'; });

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="flex-1 relative">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={function(e) { setSearchQuery(e.target.value); }}
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
        ].map(function(item) {
          var value = item.value;
          var label = item.label;
          return (
            <button
              key={value}
              onClick={function() { setTestament(value); }}
              className={'flex-1 px-4 py-2.5 text-sm font-medium transition-colors ' + (testament === value ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-muted-foreground hover:text-foreground')}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
        {testament !== 'new' && oldBooks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Old Testament
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {oldBooks.map(function(book) {
                return (
                  <Link
                    key={book.id}
                    to={'/bible/' + book.id + '/1'}
                    onClick={onClose}
                    className={'px-3 py-2 rounded-lg text-sm text-center transition-all ' + (book.id === currentBookId ? 'bg-primary-500 text-white' : 'hover:bg-muted')}
                  >
                    {book.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {testament !== 'old' && newBooks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              New Testament
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newBooks.map(function(book) {
                return (
                  <Link
                    key={book.id}
                    to={'/bible/' + book.id + '/1'}
                    onClick={onClose}
                    className={'px-3 py-2 rounded-lg text-sm text-center transition-all ' + (book.id === currentBookId ? 'bg-primary-500 text-white' : 'hover:bg-muted')}
                  >
                    {book.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No books found
          </div>
        )}
      </div>
    </div>
  );
}
