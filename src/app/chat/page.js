'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '../../components/Chat';
import styles from './page.module.css';

export default function ChatPage() {
  const [user, setUser] = useState(null);
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

  if (!user) {
    return (

        <div className={styles.loading}>
          <p>Loading...</p>
        </div>

    );
  }

  return (

      <div className={styles.container}>
        <h2>Live Chat</h2>
        <Chat user={user} />
      </div>

  );
}