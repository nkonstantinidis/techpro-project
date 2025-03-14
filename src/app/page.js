'use client';

import { useState } from 'react';
import UserProfile from '../components/UserProfile';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);

  const handleProfileCreated = (userData) => {
    setUser(userData);
  };

  return (

      <div className={styles.container}>
        {!user ? (
          <UserProfile onProfileCreated={handleProfileCreated} />
        ) : (
          <div className={styles.welcome}>
            <h2>Welcome, {user.username}!</h2>
            <p>Choose what you would like to do:</p>
            <div className={styles.options}>
            <Link href="/chat" className={styles.optionCard}>
                <h3>Live Chat</h3>
                <p>Join the conversation in real-time</p>
              </Link>
              <Link href="/notes" className={styles.optionCard}>
                <h3>Collaborative Notes</h3>
                <p>Create and edit notes with others</p>
              </Link>
            </div>
          </div>
        )}
      </div>

  );
}