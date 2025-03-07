export const metadata = {
  title: 'Realtime Collaboration App',
  description: 'Built with Next.js and Supabase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Realtime Collaboration App</h1>
          </header>
          <main className="main">
            {children}
          </main>
          <footer className="footer">
            <p>Built with Next.js and Supabase</p>
          </footer>
        </div>
      </body>
    </html>
  );
}