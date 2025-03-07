'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard, others to auth page
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  }, [user, router]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Loading...</h1>
    </div>
  );
}