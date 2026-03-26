import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Button } from '../ui/button'

export function AppShell() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 300)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main className="container-p py-8 animate-in fade-in duration-200">
        <Outlet />
      </main>
      <Footer />

      {showTop ? (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

