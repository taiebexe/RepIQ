import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RepIQ — AI-Powered Workout Analytics',
  description:
    'Log in with your Hevy account and get detailed training analytics, AI coaching insights, goal setting, and nutrition hints. Free and open source.',
  metadataBase: new URL('https://repiq.vercel.app'),
  openGraph: {
    title: 'RepIQ — AI-Powered Workout Analytics',
    description:
      'Training analytics, AI coaching, goal setting, and nutrition hints for your Hevy workouts.',
    siteName: 'RepIQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepIQ — AI-Powered Workout Analytics',
    description:
      'Training analytics, AI coaching, goal setting, and nutrition hints for your Hevy workouts.',
  },
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
