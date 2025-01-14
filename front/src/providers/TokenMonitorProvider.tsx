'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export const TokenMonitorProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/login') return

    const checkAuth = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        })

        if (!response.ok) {
          signOut()
        }
      } catch (error) {
        console.error('認証確認エラー:', error)
        signOut()
      }
    }, 60 * 1000)

    return () => clearInterval(checkAuth)
  }, [pathname])

  return <>{children}</>
}
