import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import NavigationWrapper from '@/components/NavigationWrapper';

export const metadata: Metadata = {
  title: 'Feedlot Manager',
  description: 'Cattle feedlot management application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <NavigationWrapper />
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
