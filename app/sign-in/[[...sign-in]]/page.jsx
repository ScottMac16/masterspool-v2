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
            colorBackground: '#ffffff95',
            colorInputBackground: '#f9f9f9',
            borderRadius: '10px',
            fontFamily: 'inherit',

          },
          elements: {
    
            card: {
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              border: '2px solid white',
              backdropFilter: 'blur(5px)',
              
            },
            headerTitle: {
              color: '#1a4731',
              fontWeight: '800',
            },
            formButtonPrimary: {
              backgroundColor: '#1a4731',
              '&:hover': { backgroundColor: '#2d6a4f' },
            },
            footerActionLink: {
              color: '#1a4731',
            },
             footer: {

              },

              footerPagesLink__signUp: {
                display: 'block',
              },
              internal__clerk_branding: {
                display: 'none',
              },
              'footer > div > div': {
                display: 'none',
              },
          }
        }}
      />
    </div>
  )
}