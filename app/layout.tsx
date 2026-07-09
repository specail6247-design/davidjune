import type { Metadata, Viewport } from 'next';
import { Providers } from './components/Providers';
import './globals.css';

const SITE_URL = 'https://emojiworld-195a0.web.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Picto — No Words. Just Emoji. 🌍✨',
    template: '%s | Picto',
  },
  description:
    'The social network where the whole world speaks one language: emoji. Post feelings, react with hearts, and unlock photo posts by earning likes. 언어의 장벽 없이 이모지로만 소통하는 글로벌 SNS.',
  keywords: [
    'emoji',
    'social network',
    'emoji only',
    'no language barrier',
    'Picto',
    '이모지',
    '소셜 네트워크',
    'SNS',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Picto',
    title: 'Picto — No Words. Just Emoji. 🌍✨',
    description:
      'One planet, one language: emoji. Earn likes to unlock photo posting. Join the emoji-first social network.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Picto' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Picto — No Words. Just Emoji. 🌍✨',
    description: 'One planet, one language: emoji. Earn likes to unlock photo posting.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#6b5bff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <main className="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
