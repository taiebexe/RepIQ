import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RepIQ',
  description: 'AI-powered workout analytics for Hevy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
