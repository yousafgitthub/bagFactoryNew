import type { Metadata } from 'next';
import './globals.css';
import { ERPProvider } from '../context/ERPContext';

export const metadata: Metadata = {
  title: 'BagFactory ERP — Shopping Bag Manufacturing & Business Management',
  description: 'Enterprise ERP for shopping bag manufacturing, recycling, inventory, Khata, and financial reporting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] text-[#1E293B] antialiased">
        <ERPProvider>{children}</ERPProvider>
      </body>
    </html>
  );
}
