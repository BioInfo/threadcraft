import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PerformanceOptimizer } from '../components/PerformanceOptimizer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'ThreadCraft - Transform Links into Viral Social Content',
  description: 'Transform any article link into platform-optimized social content for X (Twitter) and LinkedIn. Generate engaging threads and professional posts in seconds.',
  keywords: ['social media', 'content creation', 'twitter threads', 'linkedin posts', 'content marketing'],
  authors: [{ name: 'ThreadCraft' }],
  openGraph: {
    title: 'ThreadCraft - Transform Links into Viral Social Content',
    description: 'Transform any article link into platform-optimized social content for X (Twitter) and LinkedIn.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreadCraft - Transform Links into Viral Social Content',
    description: 'Transform any article link into platform-optimized social content for X (Twitter) and LinkedIn.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9'
};

export default function RootLayout(props: { children: import('react').ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <PerformanceOptimizer>
          {props.children}
        </PerformanceOptimizer>
      </body>
    </html>
  );
}