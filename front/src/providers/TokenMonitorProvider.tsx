'use client'

import { useEffect } from 'react'
import { logout } from '../app/services/auth'
import { useAuth } from '../contexts/AuthContext'
import { usePathname } from 'next/navigation'

export const TokenMonitorProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  // 🟢 追加: Firebase Authのユーザー情報を取得
  const { user } = useAuth()

  useEffect(() => {
    if (pathname === '/login') return

    const checkAuth = setInterval(async () => {
      try {
        if (!user) {
          await logout()
          return
        }

        // 🟡 変更: Firebase Authのトークンを取得してバックエンドをチェック
        const token = await user.getIdToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // 🟡 変更: Firebase Authのlogout関数を使用
          await logout()
        }
      } catch (error) {
        console.error('認証確認エラー:', error)
        // 🟡 変更: Firebase Authのlogout関数を使用
        await logout()
      }
    }, 60 * 1000)

    return () => clearInterval(checkAuth)
  }, [pathname, user]) // 🟡 変更: userを依存配列に追加

  return <>{children}</>
}
