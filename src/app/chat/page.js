'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '../../components/Chat';
import Link from 'next/link';
import styles from './page.module.css';

export default function ChatPage() {
  const [user, setUser] = useState(null);
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
        <h2>Live Chat</h2>
        <Chat user={user} />
      </div>

  );
}