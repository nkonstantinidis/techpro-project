'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../components/Login';
import SignUp from '../../components/SignUp';
import styles from './auth.module.css';

export default function Auth() {
  const [authType, setAuthType] = useState('login');
  const { user } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to dashboard
  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${authType === 'login' ? styles.active : ''}`}
          onClick={() => setAuthType('login')}
        >
          Log In
        </button>
        <button
          className={`${styles.tab} ${authType === 'signup' ? styles.active : ''}`}
          onClick={() => setAuthType('signup')}
        >
          Sign Up
        </button>
      </div>

      {authType === 'login' ? <Login /> : <SignUp />}
    </div>
  );
}