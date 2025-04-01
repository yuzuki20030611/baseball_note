'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { logout } from '../../../app/services/auth'
import Link from 'next/link'

type HeaderProps = {
  children?: string
  href?: string
  role?: 'coach' | 'player'
}

export const Header = ({ children, href, role }: HeaderProps) => {
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/Login')
    } catch (error) {
      console.log('ログアウトエラー', error)
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] shadow-lg">
      <div className="max-w-[80rem] mx-auto p-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 pt-7 ">
            <h1 className="text-2xl font-bold text-white">野球ノート⚾️</h1>
          </div>
          <div className="flex flex-end">
            {user ? (
              <div className="flex gap-4">
                <Link
                  href={role === 'coach' ? '/Coach/Home' : '/Player/Home'}
                  className="inline-block px-6 py-4 h-12 rounded-md text-xl bg-white text-blue-700 mt-2 pt-3 cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  ホーム画面
                </Link>
                {/* ログアウトボタン */}
                <button
                  onClick={handleLogout}
                  className="inline-block px-6 py-4 h-12 rounded-md text-xl bg-white text-blue-700 mt-2 pt-3 cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              // ログインしていない場合はログインリンクを表示
              <Link
                href="/Login"
                className="inline-block px-6 py-4 h-12 rounded-md text-xl bg-white text-blue-700 mt-2 pt-3 cursor-pointer hover:bg-blue-600 transition-colors"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
