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

  // Check if user exists in local storage and redirect to home page if not
  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    if (!storedUser) {
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

  //Display Loading... if user is not set yet
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
        Back to Home
      </Link>
      <h2>Collaborative Notes</h2>
      <div className={styles.notesLayout}>
        <NotesList 
          onSelectNote={handleSelectNote} 
          onCreateNewNote={handleCreateNewNote}
          selectedNoteId={selectedNote?.id}
        />
        <NoteEditor 
          note={selectedNote} 
          onNoteCreated={handleSelectNote}
        />
      </div>
    </div>
  );
}