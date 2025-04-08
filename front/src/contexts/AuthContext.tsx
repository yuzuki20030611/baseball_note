'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

import { AccountRole } from '../types/account' // パスを適切に調整
import { auth } from '../app/firebase/config'
interface UserData {
  user: User | null
  role?: AccountRole
  loading: boolean
}

interface AuthContextType extends UserData {
  setUserRole: (role: AccountRole) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// こちらのファイルをproviders.tsxファイルでインポートすることで全てのページの認証状態を管理している
// 各ページの情報を取得し、ログイン状態に応じての処理をProtectRoute.tsxで記述してこちらの関数を各ファイルで
// インポートしてログイン状態に応じて詳細な対処をしている。

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUSerData] = useState<UserData>({
    user: null,
    role: undefined,
    loading: true,
  })

  // onAuthStateChangedについて、IDトークンの有効期限は1時間で、リフレッシュトークンの有効期限は二週間
  // ユーザーが1時間以上アプリを使用しなかった場合、アプリを再利用したとき、リフレッシュトークンを使って新しいIDトークンが取得する
  // 1時間使用しなかった場合、リフレッシュトークンを使用してIDトークンを取得できればログアウトはされないが、取得に失敗した場合はログアウトになる

  // Firebaseの認証状態変更を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ユーザーがログインしている場合はバックエンドからロール情報を取得
        try {
          const userRole = await fetchUserRole(user.uid)
          setUSerData({ user, role: userRole, loading: false })
        } catch (error) {
          console.error('ユーザーロール取得エラー', error)
          setUSerData({ user, loading: false })
        }
        // ここが実行される！トークンが期限切れになった場合
      } else {
        setUSerData({ user: null, loading: false })
      }
    })
    return () => unsubscribe()
  }, [])

  const setUserRole = (role: AccountRole) => {
    setUSerData((prev) => ({ ...prev, role }))
  }

  return <AuthContext.Provider value={{ ...userData, setUserRole }}>{children}</AuthContext.Provider>
}

const fetchUserRole = async (uid: string): Promise<AccountRole | undefined> => {
  const apiUrl = `${API_URL}/auth/users/firebase/${uid}/role`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error('ユーザーロール取得に失敗しました')
    }
    const data = await response.json()
    return data.role
  } catch (error) {
    console.error('ロール取得エラー', error)
    return undefined
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
