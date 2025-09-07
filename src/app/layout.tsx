import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkTracker - Create and Track Your Links',
  description: 'Create tracking links and get detailed analytics about your visitors including location data.',
  keywords: 'link tracking, analytics, url shortener, location tracking, click tracking',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen bg-background')}>
        <div className="flex min-h-screen flex-col">
          {/* Navigation Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <div className="mr-4 flex">
                <a href="/" className="mr-6 flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">L</span>
                  </div>
                  <span className="hidden font-bold sm:inline-block">
                    LinkTracker
                  </span>
                </a>
              </div>
              
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a 
                    href="/" 
                    className="transition-colors hover:text-foreground/80 text-foreground"
                  >
                    Create Link
                  </a>
                  <a 
                    href="/dashboard" 
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="/analytics" 
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Analytics
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
              <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built for tracking and analytics. Privacy-focused location detection.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-xs text-muted-foreground">
                  © 2024 LinkTracker. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}