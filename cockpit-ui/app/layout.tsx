import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BFSG-OS Jarvis Cockpit',
  description: 'Operations-Dashboard fuer BFSG-Check',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
