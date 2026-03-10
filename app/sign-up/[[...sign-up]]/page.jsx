import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <SignUp
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
                display: 'none',
              },
          }
        }}
      />
    </div>
  )
}