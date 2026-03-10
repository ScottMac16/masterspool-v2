import { SignIn } from '@clerk/nextjs'
import styles from './sign-in.module.css'

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#1a4731',
            colorText: '#1a1a1a',
            colorBackground: '#ffffff',
            colorInputBackground: '#f9f9f9',
            borderRadius: '10px',
            fontFamily: 'inherit',
          },
          elements: {
            card: {
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              border: 'none',
              backdropFilter: 'blur(40px)',
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
        Don't have an account? <a href="/sign-up">Sign up</a>
      </p>
    </div>
  )
}