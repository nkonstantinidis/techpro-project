import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Next.js & Supabase App',
  description: 'A collaborative platform with real-time features',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}