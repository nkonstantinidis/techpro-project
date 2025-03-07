'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // If user is not logged in, redirect to auth page
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <button onClick={handleSignOut} className={styles.signOutButton}>
          Sign Out
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h2>Welcome, {user.email}!</h2>
          <p>You re now signed in to the application.</p>
        </div>

        {/* We'll add chat and notes components here later */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>Live Chat</h3>
            <p>Coming soon</p>
          </div>
          <div className={styles.feature}>
            <h3>Collaborative Notes</h3>
            <p>Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}