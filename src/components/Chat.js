import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './Chat.module.css';

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            users (id, username)
          `)
          .order('created_at')
          .limit(50);
          
        if (error) throw error;
        
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        // Fetch the username for this new message
        const updateMessages = async () => {
          try {
            const { data, error } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                created_at,
                users (id, username)
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (error) throw error;
            
            setMessages(prev => [...prev, data]);
          } catch (error) {
            console.error('Error fetching complete message data:', error);
          }
        };
        
        updateMessages();
      })
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            user_id: user.id, 
            content: newMessage.trim() 
          }
        ]);
        
      if (error) throw error;
      
      // Clear input field after sending
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {loading ? (
          <div className={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>No messages yet. Be the first to say hello!</div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.message} ${message.users.id === user.id ? styles.self : ''}`}
            >
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.username}>{message.users.username}</span>
                  <span className={styles.time}>{formatTime(message.created_at)}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Send</button>
      </form>
    </div>
  );
}