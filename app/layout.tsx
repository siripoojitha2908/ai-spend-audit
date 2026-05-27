import type { Metadata } from 'next';
import type React from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'AI Spend Audit — Optimize AI tool budgets',
  description: 'AI Spend Audit helps founders and engineering managers uncover overspend, recommend smarter plans, and generate shareable savings audits.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'AI Spend Audit',
    description: 'AI Spend Audit helps founders and engineering managers uncover AI tool overspend and capture high-value leads.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Spend Audit',
    description: 'Launch-ready AI spend auditing for startup teams.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#020817_100%)]">
          <Navbar />
          <ToastProvider>
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
