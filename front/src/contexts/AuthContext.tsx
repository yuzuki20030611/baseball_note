'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

import { AccountRole } from '../types/account'
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

// メール変更検知と同期のための関数
const syncEmailWithBackend = async (user: User): Promise<void> => {
  try {
    // バックエンドからユーザー情報を取得（メールアドレスを含む）
    const response = await fetch(`${API_URL}/auth/users/firebase/${user.uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('バックエンドからユーザー情報の取得に失敗しました')
      return
    }

    const userBackData = await response.json()
    // ユーザーIDが一致し、現在のメールが新しいメール（変更後）と一致する場合
    // firebseのコンソールで保存しているメールアドレスとデータベースで保存しているメールアドレスを比較している
    if (user.email && userBackData.email && user.email !== userBackData.email) {
      // メールアドレスが異なる場合、バックエンドを更新
      const updateResponse = await fetch(`${API_URL}/auth/users/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          new_email: user.email,
        }),
      })

      if (!updateResponse.ok) {
        console.error('バックエンドのメールアドレス更新に失敗しました')
      } else {
        // 成功したら保存していた情報を削除
        localStorage.removeItem('pendingEmailChange')
      }
    }
  } catch (error) {
    console.error('メールアドレス同期エラー:', error)
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
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
        // ユーザーがログインしている場合
        try {
          // メールアドレス変更の検知と同期処理
          await syncEmailWithBackend(user)

          // バックエンドからロール情報を取得
          const userRole = await fetchUserRole(user.uid)
          setUserData({ user, role: userRole, loading: false })
        } catch (error) {
          console.error('ユーザー情報取得エラー:', error)
          setUserData({ user, loading: false })
        }
      } else {
        // ログアウト状態
        setUserData({ user: null, loading: false })
      }
    })

    return () => unsubscribe()
  }, [])

  const setUserRole = (role: AccountRole) => {
    setUserData((prev) => ({ ...prev, role }))
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
    console.error('ロール取得エラー:', error)
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
