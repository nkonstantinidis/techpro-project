import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabaseClient';
import styles from './NoteEditor.module.css';

export default function NoteEditor({ note, user, onNoteCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
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