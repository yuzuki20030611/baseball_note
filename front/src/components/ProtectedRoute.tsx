'use client'

import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AccountRole } from '../types/account'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: AccountRole
  authRequired?: boolean
}

export default function ProtectedRoute({ children, requiredRole, authRequired = true }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  // 各ページで、AuthContext.tsxで認証管理をして、こちらのファイルでローディング状態、
  // ユーザーの状態に対しての処理を記述している
  useEffect(() => {
    if (!loading) {
      if (authRequired && !user) {
        // ここが実行される！user = null になったため
        router.push('/Login')
      } else if (user && requiredRole !== undefined && role !== requiredRole) {
        // ユーザーはログインしているが、必要なロールがない場合
        // 適切なホームページへリダイレクト
        if (role === AccountRole.PLAYER) {
          router.push('/Player/Home')
        } else if (role === AccountRole.COACH) {
          router.push('/Coach/Home')
        } else {
          router.push('/')
        }
      }
    }
  }, [user, loading, authRequired, router])

  if (loading) {
    return <div>Loading...</div>
  }

  // 認証チェックに通過した場合のみコンテンツを表示
  if (!authRequired || (user && (requiredRole === undefined || role === requiredRole))) {
    return <>{children}</>
  }

  return null
}
