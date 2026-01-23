import type { Metadata } from 'next';
import { SessionProvider } from '@/app/providers/session-provider';
import { Navbar } from '@/components/layout/navbar';
import { CategoriesSidebar } from '@/components/layout/categories-sidebar';
import { AgeGateModal } from '@/components/compliance/age-gate-modal';
import './globals.css';

export const metadata: Metadata = {
  title: 'XStream - Adult Video Platform',
  description: 'Premium adult entertainment platform',
  other: {
    'rating': 'RTA-5042-1996-1400-1577-RTA',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <link rel="rating" href="https://www.rtalabel.org/index.php?content=icalp" />
      </head>
      <body>
        <SessionProvider>
          <AgeGateModal />
          <Navbar />
          <div className="flex">
            <CategoriesSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
