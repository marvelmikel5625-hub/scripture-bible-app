import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StickyNote, Trash2, Edit2, ArrowRight, Calendar } from 'lucide-react';
import { getNotes, deleteNote, updateNote } from '../utils/storage';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleDelete = (id) => {
    setNotes(deleteNote(id));
  };

  const handleEdit = (note) => {
    setEditing(note);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editing || !editContent.trim()) return;
    setNotes(updateNote(editing.id, editContent.trim()));
    setEditing(null);
    setEditContent('');
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center"><StickyNote size={32} className="text-muted-foreground" /></div>
          <h2 className="text-2xl font-serif font-semibold mb-2">No Notes Yet</h2>
          <p className="text-muted-foreground mb-6">Take notes on verses as you read to save your thoughts here.</p>
          <Link to="/bible" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">Start Reading <ArrowRight size={18} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold">Notes <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">({notes.length})</span></h1>
      </div>
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 text-sm mb-1">
                  <Link to={`/bible/${note.bookId}/${note.chapter}`} className="font-medium hover:text-primary-600 transition-colors">{note.bookName}</Link>
                  <span className="text-muted-foreground">{note.chapter}:{note.verse}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} />{formatDate(note.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">"{note.text}"</p>
                {editing?.id === note.id ? (
                  <div className="mt-2">
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20" rows={3} />
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">Save</button>
                      <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="font-serif leading-relaxed">{note.content}</p>
                )}
              </div>
            </div>
            {editing?.id !== note.id && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                <Link to={`/bible/${note.bookId}/${note.chapter}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm">Open <ArrowRight size={14} /></Link>
                <button onClick={() => handleEdit(note)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
