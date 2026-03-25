'use client'
import { useSearchParams } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import styles from '../../sign-in/[[...sign-in]]/sign-in.module.css'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || ''

  return (
    <div className={styles.container}>
      <SignUp
        afterSignUpUrl={redirectUrl || '/join'}
        forceRedirectUrl={redirectUrl || '/join'}
        
        appearance={{
          variables: {
            colorPrimary: '#1a4731',
            colorText: '#1a1a1a',
            colorBackground: '#ffffff84',
            colorInputBackground: '#f9f9f9',
            borderRadius: '10px',
            fontFamily: 'inherit',
          },
          elements: {
            card: {
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              border: 'none',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.75)',
            },
            headerTitle: {
              color: '#1a4731',
              fontWeight: '800',
            },
            formButtonPrimary: {
              backgroundColor: '#1a4731',
            },
            footer: {
              display: 'none',
            },
          }
        }}
      />
      <p className={styles.switchLink}>
        Already have an account?{' '}
        <a href={`/sign-in${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`}>
          Sign in
        </a>
      </p>
    </div>
  )
}