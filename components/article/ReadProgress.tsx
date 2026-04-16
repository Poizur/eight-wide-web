'use client'

import { useEffect, useState } from 'react'

export function ReadProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0) setProgress((window.scrollY / h) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed left-0 right-0 z-[199] h-[2px]"
      style={{ top: 'calc(28px + var(--nav-h))' }}
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%`, background: 'var(--gold)' }}
      />
    </div>
  )
}
