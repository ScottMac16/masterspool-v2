import { SignIn } from '@clerk/nextjs'
import styles from './sign-in.module.css'

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <SignIn />
      </div>
    </div>
  )
}