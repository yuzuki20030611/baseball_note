'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/globals.css'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/Login')
  }, [router])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <p>ログインページにリダイレクト中...</p>
    </div>
  )
}
