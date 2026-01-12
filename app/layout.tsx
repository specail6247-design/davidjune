import { AuthProvider } from '../lib/AuthContext';
import { Footer } from './components/Footer';
import './globals.css'; // We will create this file next

export const metadata = {
  title: 'EmojiWorld',
  description: 'A social platform for expressing emotions with only emojis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* The main content for each page */}
          <main className="main-content">{children}</main>
          {/* A consistent footer for all pages */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
