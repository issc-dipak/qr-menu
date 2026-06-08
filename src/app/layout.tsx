import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'QR-Menu — Digital Menu for Every Shop',
  description: 'Create a beautiful digital QR menu for your shop in 5 minutes. No printing. No hassle.',
  keywords: ['QR menu', 'digital menu', 'shop menu', 'QR-Menu', 'small business India'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#f0f0f5',
              border: '1px solid #2a2a38',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00e5a0', secondary: '#0a0a0f' } },
            error:   { iconTheme: { primary: '#ff4d6d', secondary: '#0a0a0f' } },
          }}
        />
      </body>
    </html>
  );
}
