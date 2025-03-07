import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './NotesList.module.css';

export default function NotesList({ onSelectNote, onCreateNewNote, selectedNoteId, user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
    
    // Subscribe to changes in the notes table
    const subscription = supabase
      .channel('public:notes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotes(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotes(prev => 
            prev.map(note => 
              note.id === payload.new.id ? payload.new : note
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setNotes(prev => 
            prev.filter(note => note.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Notes</h3>
        <button 
          onClick={onCreateNewNote}
          className={styles.newButton}
        >
          New Note
        </button>
      </div>
      
      <div className={styles.notesList}>
        {loading ? (
          <div className={styles.loading}>Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className={styles.empty}>No notes yet. Create your first note!</div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id}
              className={`${styles.noteItem} ${note.id === selectedNoteId ? styles.selected : ''}`}
              onClick={() => onSelectNote(note)}
            >
              <h4 className={styles.noteTitle}>{note.title || 'Untitled Note'}</h4>
              <p className={styles.notePreview}>
                {note.content 
                  ? (note.content.length > 60 
                      ? note.content.substring(0, 60) + '...' 
                      : note.content)
                  : 'No content'}
              </p>
              <div className={styles.noteDate}>
                {new Date(note.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}