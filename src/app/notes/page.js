'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import NotesList from '../../components/NotesList';
import NoteEditor from '../../components/NoteEditor';
import Link from 'next/link';



export default function NotesPage() {
  const [user, setUser] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user exists in local storage
    const storedUser = localStorage.getItem('chatUser');
    if (!storedUser) {
      // Redirect to home page if no user
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
  };

  const handleCreateNewNote = () => {
    setSelectedNote(null);
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
  &larr; Back to Home
</Link>
      <h2 className={styles.pageTitle}>Collaborative Notes</h2>
      <div className={styles.notesLayout}>
        <NotesList 
          onSelectNote={handleSelectNote} 
          onCreateNewNote={handleCreateNewNote}
          selectedNoteId={selectedNote?.id}
          user={user}
        />
        <NoteEditor 
          note={selectedNote} 
          user={user} 
          onNoteCreated={handleSelectNote}
        />
      </div>
    </div>
  );
}