import { ClerkProvider } from '@clerk/nextjs'
import NavBar from '@/components/NavBar'
import './globals.css'

export const metadata = {
  title: 'Masters Pool',
  description: 'Masters Golf Pool App',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}