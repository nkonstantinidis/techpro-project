import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabaseClient';
import styles from './UserProfile.module.css';

export default function UserProfile({ onProfileCreated }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user profile exists in local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      onProfileCreated(user);
    }
  }, [onProfileCreated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First, check if the username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username.trim())
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // An error occurred that's not "No rows returned"
        throw checkError;
      }
      
      let user;
      
      if (existingUser) {
        // User exists, use this user
        user = existingUser;
      } else {
        // User doesn't exist, create a new one
        const userId = uuidv4();
        
        const { error } = await supabase
          .from('users')
          .insert([
            { id: userId, username: username.trim() }
          ]);
          
        if (error) throw error;
        
        user = { 
          id: userId, 
          username: username.trim() 
        };
      }
      
      // Save to local storage
      localStorage.setItem('chatUser', JSON.stringify(user));
      
      // Notify parent component
      onProfileCreated(user);
      
    } catch (error) {
      console.error('Error creating/retrieving profile:', error);
      setError(error.message || 'Failed to create/retrieve profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create a Temporary Profile</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="Enter a username"
            className={styles.input}
          />
        </div>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading} 
          className={styles.button}
        >
          {loading ? 'Creating...' : 'Start Chatting'}
        </button>
      </form>
    </div>
  );
}