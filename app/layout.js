import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  title: 'SMAC Golf Pool',
  description: 'Compete with friends in the SMAC Golf Pool. Pick your 8-man roster and track your score live.',
  openGraph: {
    title: 'SMAC Golf Pool',
    description: 'Compete with friends in the SMAC Golf Pool. Pick your 8-man roster and track your score live.',
    url: 'https://smacgolfpool.com',
    siteName: 'SMAC Golf Pool',
    images: [
      {
        url: 'https://smacgolfpool.com/smac-preview-img.jpg',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMAC Golf Pool',
    description: 'Compete with friends in the SMAC Golf Pool. Pick your 8-man roster and track your score live.',
    images: ['https://smacgolfpool.com/smac-preview-img.jpg'],
  }
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}