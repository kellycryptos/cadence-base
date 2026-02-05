import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import './globals.css'

const lexend = Lexend({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Cadence Base - USDC Savings on Base',
  description: 'Save USDC consistently on Base with reminders and a non-custodial vault',
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://cadence-base.vercel.app/embed-image.png',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': 'Start Saving',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://cadence-base.vercel.app',
    'fc:frame:post_url': 'https://cadence-base.vercel.app/api/frame'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={lexend.className}>{children}</body>
    </html>
  )
}