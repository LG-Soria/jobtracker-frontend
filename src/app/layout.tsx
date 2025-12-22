import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata: Metadata = {
  title: 'JobTracker',
  description: 'Seguimiento simple de tus postulaciones laborales.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
