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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUSerData] = useState<UserData>({
    user: null,
    role: undefined,
    loading: true,
  })

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
  console.log('完全なURL:', apiUrl)
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
  console.log('API_URL:', API_URL) // auth.tsの場合
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
