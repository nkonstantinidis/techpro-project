import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabaseClient';
import styles from './NoteEditor.module.css';

export default function NoteEditor({ note, user, onNoteCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState(null);
  
  // Initialize editor with note data or empty values
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    
    setError(null);
  }, [note]);
  
  // Track active users on this note
  useEffect(() => {
    if (!note || !user) return;
    
    const trackUserEditing = async () => {
      try {
        // Register this user as editing the note
        const { error } = await supabase
          .from('note_editors')
          .upsert({ 
            note_id: note.id, 
            user_id: user.id 
          });
          
        if (error) throw error;
        
      } catch (error) {
        console.error('Error registering as editor:', error);
      }
    };
    
    trackUserEditing();
    
    // Fetch active editors
    const fetchEditors = async () => {
      try {
        const { data, error } = await supabase
          .from('note_editors')
          .select(`
            user_id,
            users (id, username)
          `)
          .eq('note_id', note.id);
          
        if (error) throw error;
        
        setActiveUsers(data.map(item => item.users) || []);
      } catch (error) {
        console.error('Error fetching active editors:', error);
      }
    };
    
    fetchEditors();
    
    // Subscribe to changes in editors
    const subscription = supabase
      .channel(`note-editors-${note.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'note_editors',
        filter: `note_id=eq.${note.id}`
      }, (payload) => {
        fetchEditors();
      })
      .subscribe();
      
    // Cleanup
    return () => {
      subscription.unsubscribe();
      
      // Unregister this user when leaving
      const unregisterUser = async () => {
        try {
          await supabase
            .from('note_editors')
            .delete()
            .match({ 
              note_id: note.id, 
              user_id: user.id 
            });
        } catch (error) {
          console.error('Error unregistering as editor:', error);
        }
      };
      
      unregisterUser();
    };
  }, [note, user]);
  
  // Auto-save functionality
  useEffect(() => {
    if (!note) return;
    
    const timer = setTimeout(() => {
      saveNote();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [title, content]);
  
  const saveNote = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      setError(null);
      
      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({ 
            title: title.trim() || 'Untitled Note', 
            content, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', note.id);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const createNewNote = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const noteId = uuidv4();
      
      // Create new note
      const { data, error } = await supabase
        .from('notes')
        .insert([{ 
          id: noteId,
          title: title.trim() || 'Untitled Note', 
          content 
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Register as editor for this note
      await supabase
        .from('note_editors')
        .insert([{ 
          note_id: noteId, 
          user_id: user.id 
        }]);
      
      // Update parent component with new note
      onNoteCreated(data);
      
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (note) {
      saveNote();
    } else {
      createNewNote();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{note ? 'Edit Note' : 'Create New Note'}</h3>
        {saving && <span className={styles.savingLabel}>Saving...</span>}
        {note && activeUsers.length > 0 && (
          <div className={styles.activeUsers}>
            <span>Active users: </span>
            {activeUsers
              .filter(u => u.id !== user.id)
              .map(u => u.username)
              .join(', ')}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className={styles.titleInput}
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note..."
          className={styles.contentInput}
        />
        
        {error && <p className={styles.error}>{error}</p>}
        
        {!note && (
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={saving}
          >
            Create Note
          </button>
        )}
      </form>
    </div>
  );
}