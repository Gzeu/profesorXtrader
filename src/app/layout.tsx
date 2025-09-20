import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: {
    default: 'ProfesorXTrader - Professional Trading Dashboard',
    template: '%s | ProfesorXTrader'
  },
  description: 'Professional trading dashboard for Binance balance monitoring with AI-powered market analysis and real-time portfolio management.',
  keywords: ['trading', 'binance', 'dashboard', 'ai', 'cryptocurrency', 'portfolio'],
  authors: [{ name: 'George Pricop (Gzeu)', url: 'https://github.com/Gzeu' }],
  creator: 'George Pricop (Gzeu)',
  publisher: 'ProfesorXTrader',
  robots: {
    index: false, // Nu indexăm în faza de dezvoltare
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body 
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
