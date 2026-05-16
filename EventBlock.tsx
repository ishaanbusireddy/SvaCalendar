import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SvaCalendar — AI Calendar',
  description: 'Natural language AI-powered calendar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
