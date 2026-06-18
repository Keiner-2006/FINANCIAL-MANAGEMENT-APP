'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<Event | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setVisible(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as any).prompt()
    const result = await (deferredPrompt as any).userChoice
    if (result.outcome === 'accepted') {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  if (!visible) return null

  return (
    <Button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 z-50 h-12 gap-2 rounded-full px-5 shadow-lg"
      size="lg"
    >
      <Download className="h-5 w-5" />
      Instalar App
    </Button>
  )
}
