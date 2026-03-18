import NavBar from '@/components/NavBar'
import styles from './layout.module.css'

export default function MainLayout({ children }) {
  return (
    <>
      <NavBar />
      <div className={styles.mainBody}>
        {children}
      </div>
    </>
  )
}