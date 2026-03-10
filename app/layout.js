import { ClerkProvider } from '@clerk/nextjs'
import NavBar from '@/components/NavBar'
import { headers } from 'next/headers'
import './globals.css'

export default async function RootLayout({ children }) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || ''
  
  const hideNav = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {!hideNav && <NavBar />}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}