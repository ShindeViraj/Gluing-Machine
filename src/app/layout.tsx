'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) +
          '  •  ' +
          now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ── Top Title Bar ── */}
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
          style={{ height: 80, background: '#0f172a' }}
        >
          {/* Left – logo & title */}
          <div className="flex items-center gap-5">
            <Image
              src="/dana_logo.webp"
              alt="Dana Logo"
              width={200}
              height={60}
              className="object-contain"
              style={{ height: 60, width: 'auto' }}
              priority
            />
            <div className="h-10 w-px bg-slate-600" />
            <span className="text-white text-lg font-semibold tracking-wide">
              Dana Anand&nbsp;&nbsp;|&nbsp;&nbsp;Gluing Machine Report
            </span>
          </div>

          {/* Right – date/time */}
          <span className="text-slate-300 text-sm font-mono">{currentTime}</span>
        </header>

        {/* ── Left Sidebar ── */}
        <aside
          className="fixed left-0 bottom-0 z-40 flex flex-col justify-between"
          style={{ top: 80, width: 300, background: '#0f172a' }}
        >
          {/* Nav links */}
          <nav className="flex flex-col gap-3 px-5 pt-8">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-4 rounded-lg px-5 py-4 text-lg font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon
                    size={28}
                    className={
                      isActive
                        ? 'text-blue-400'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }
                  />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-2.5 w-2.5 rounded-full bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-5 pb-5">
            <div className="border-t border-slate-700/60 pt-4">
              <p className="text-sm text-slate-500 text-center">
                © 2026 Dana Anand
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main
          className="min-h-screen bg-slate-50"
          style={{ marginLeft: 300, marginTop: 80 }}
        >
          <div className="p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
