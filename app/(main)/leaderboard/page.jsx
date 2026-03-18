'use client'

import GolfLeaderboard from './GolfLeaderboard'
import PoolLeaderboard from './PoolLeaderboard'
import styles from './combined.module.css'
import { useState, useRef } from 'react'

export default function LeaderboardPage() {
  const [activePanel, setActivePanel] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [tabsVisible, setTabsVisible] = useState(true)
  const touchStartY = useRef(null)
  const hideTimer = useRef(null)

  function onTouchStart(e) {
    setTouchStart(e.targetTouches[0].clientX)
    touchStartY.current = e.targetTouches[0].clientY
    setTouchEnd(null)
  }

  function onTouchMove(e) {
    setTouchEnd(e.targetTouches[0].clientX)
    
    // Hide while scrolling
    setTabsVisible(false)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    
    // Reappear 500ms after scroll stops
    hideTimer.current = setTimeout(() => setTabsVisible(true), 500)
  }

  function onTouchEnd() {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) setActivePanel(1)
    if (distance < -50) setActivePanel(0)
  }

  function onMouseDown(e) {
    setTouchStart(e.clientX)
    setTouchEnd(null)
  }

  function onMouseMove(e) {
    if (touchStart) setTouchEnd(e.clientX)
  }

  function onMouseUp() {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) setActivePanel(1)
    if (distance < -50) setActivePanel(0)
    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div className={styles.container}>

      {/* Mobile tab switcher */}
      <div className={`${styles.mobileTabs} ${tabsVisible ? styles.tabsVisible : styles.tabsHidden}`}>
        <button
          className={`${styles.mobileTab} ${activePanel === 0 ? styles.activeMobileTab : ''}`}
          onClick={() => setActivePanel(0)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 530 407.6">
            <path fill="currentColor" d="M256.2,312.1V39.1c0-4.8,3.9-8.8,8.8-8.8c4.9,0,8.8,4,8.8,8.8v273.1c0,4.8-4,8.8-8.8,8.8C260.2,320.9,256.2,317,256.2,312.1z"/>
            <path fill="currentColor" d="M469.2,312.1c0,19.9-22.7,36.8-65.6,48.8c-37.2,10.4-87.7,16.4-138.6,16.4c-50.9,0-101.4-6-138.6-16.4c-42.9-12-65.6-28.9-65.6-48.8c0-18.2,19.3-34.1,55.9-45.9c32-10.3,75.7-16.9,122.9-18.7l1.6-0.1v17.6l-1.4,0.1c-44.6,1.7-85.7,7.9-115.8,17.5c-27.1,8.7-43.3,19.7-43.3,29.5c0,10.8,19,22.7,50.7,31.8c35.6,10.2,83,15.8,133.6,15.8c50.5,0,98-5.6,133.5-15.8c31.8-9.1,50.8-21,50.8-31.8c0-9.8-16.2-20.8-43.3-29.5c-30.1-9.6-71.2-15.8-115.8-17.5l-1.4-0.1v-17.6l1.6,0.1c47.2,1.8,90.8,8.4,122.8,18.7C449.9,278,469.2,293.9,469.2,312.1z"/>
            <path fill="currentColor" d="M290.8,168.7l-2.4,1.9v-118l1.5,0c24,0.4,47.1,19.7,67.6,36.7l0.1,0.1c26,21.7,50.6,42.2,73,27.5l0.2-0.1c3.7-2.4,8.4-1.9,11.3,1.2c2.9,3.1,3.2,7.9,0.7,11.3c-31.2,41.5-63.7,36.1-92.4,31.3C328.7,157,309.9,153.8,290.8,168.7z"/>
          </svg>
        </button>
        <button
          className={`${styles.mobileTab} ${activePanel === 1 ? styles.activeMobileTab : ''}`}
          onClick={() => setActivePanel(1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 530 407.6">
            <path fill="currentColor" d="M503.1,48.6H27c-4.4,0-7.9,3.5-7.9,7.9v298.2c0,4.4,3.5,7.9,7.9,7.9h476.1c4.4,0,7.9-3.5,7.9-7.9V56.6C511,52.2,507.5,48.6,503.1,48.6L503.1,48.6z M34.9,152h460.2v89.5H34.9L34.9,152z M495.1,136.1H352.3l0-71.6h142.8L495.1,136.1z M336.4,136.1H193.6l0-71.6h142.8L336.4,136.1z M34.9,64.5h142.8v71.6H34.9L34.9,64.5z M495.1,346.8H34.9l0-89.5h460.2L495.1,346.8z"/>
            <path fill="currentColor" d="M224.6,167.8h-38.9c-4.4,0-7.9,3.5-7.9,7.9v38.9c0,4.4,3.5,7.9,7.9,7.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9C232.5,171.3,229,167.8,224.6,167.8z M216.6,206.7h-23v-23h23L216.6,206.7z"/>
            <path fill="currentColor" d="M300.8,167.8h-38.9c-4.4,0-7.9,3.5-7.9,7.9v38.9c0,4.4,3.5,7.9,7.9,7.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9C308.8,171.3,305.2,167.8,300.8,167.8z M292.9,206.7h-23v-23h23V206.7z"/>
            <path fill="currentColor" d="M377.1,167.8h-38.9c-4.4,0-7.9,3.5-7.9,7.9v38.9c0,4.4,3.5,7.9,7.9,7.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9C385.1,171.3,381.5,167.8,377.1,167.8z M369.2,206.7h-23v-23h23V206.7z"/>
            <path fill="currentColor" d="M453.4,167.8h-38.9c-4.4,0-7.9,3.5-7.9,7.9v38.9c0,4.4,3.5,7.9,7.9,7.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9C461.3,171.3,457.8,167.8,453.4,167.8z M445.5,206.7h-23v-23h23V206.7z"/>
            <path fill="currentColor" d="M135.8,167.8H65.1c-4.4,0-7.9,3.5-7.9,7.9c0,4.4,3.5,7.9,7.9,7.9h70.6c4.4,0,7.9-3.5,7.9-7.9C143.7,171.3,140.1,167.8,135.8,167.8L135.8,167.8z"/>
            <path fill="currentColor" d="M135.8,204.6H65.1c-4.4,0-7.9,3.5-7.9,7.9c0,4.4,3.5,7.9,7.9,7.9h70.6c4.4,0,7.9-3.5,7.9-7.9C143.7,208.2,140.1,204.6,135.8,204.6L135.8,204.6z"/>
            <path fill="currentColor" d="M185.7,327.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9c0-4.4-3.5-7.9-7.9-7.9l-38.9,0c-4.4,0-7.9,3.5-7.9,7.9V320C177.7,324.4,181.3,327.9,185.7,327.9z M193.6,289h23v23h-23V289z"/>
            <path fill="currentColor" d="M261.9,327.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9c0-4.4-3.5-7.9-7.9-7.9h-38.9c-4.4,0-7.9,3.5-7.9,7.9V320C254,324.4,257.6,327.9,261.9,327.9z M269.9,289h23v23h-23V289z"/>
            <path fill="currentColor" d="M338.2,327.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9c0-4.4-3.5-7.9-7.9-7.9h-38.9c-4.4,0-7.9,3.5-7.9,7.9V320C330.3,324.4,333.8,327.9,338.2,327.9z M346.2,289h23v23h-23V289z"/>
            <path fill="currentColor" d="M414.5,327.9h38.9c4.4,0,7.9-3.5,7.9-7.9v-38.9c0-4.4-3.5-7.9-7.9-7.9h-38.9c-4.4,0-7.9,3.5-7.9,7.9V320C406.6,324.4,410.1,327.9,414.5,327.9z M422.4,289h23v23h-23V289z"/>
            <path fill="currentColor" d="M65.1,289h70.6c4.4,0,7.9-3.5,7.9-7.9c0-4.4-3.5-7.9-7.9-7.9l-70.6,0c-4.4,0-7.9,3.5-7.9,7.9C57.2,285.5,60.7,289,65.1,289z"/>
            <path fill="currentColor" d="M65.1,325.8h70.6c4.4,0,7.9-3.5,7.9-7.9c0-4.4-3.5-7.9-7.9-7.9l-70.6,0c-4.4,0-7.9,3.5-7.9,7.9C57.2,322.3,60.7,325.8,65.1,325.8z"/>
          </svg>
        </button>
      </div>

      {/* Swipe container */}
      <div
        className={styles.swipeContainer}
        style={{ transform: `translateX(-${activePanel * 50}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className={styles.panel}>
          <GolfLeaderboard />
        </div>
        <div className={styles.panel}>
          <PoolLeaderboard />
        </div>
      </div>

    </div>
  )
}