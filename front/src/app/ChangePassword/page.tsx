'use client'

import React, { ChangeEvent, useState } from 'react'

import { Card } from '../../components/component/Card/Card'
import { Header } from '../../components/component/Header/Header'
import { PageTitle } from '../../components/component/Title/PageTitle'
import { Label } from '../../components/component/Label/Label'
import { FormInput } from '../../components/component/Input/FormInput'
import { Footer } from '../../components/component/Footer/Footer'
import { resetPassword } from '../services/auth'
import { Buttons } from '../../components/component/Button/Button'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useRouter } from 'next/navigation'

const ChangePassword = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target
    setError(null)
    setEmail(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(email)
      alert('パスワードリセット用のメールを送信しました。メールのリンクからパスワードを再設定してください。')
      setEmail('')
      router.push('/')
    } catch (error) {
      console.error('パスワードの再設定に失敗しました。')
      setError('パスワードリセットメールの送信に失敗しました。メールアドレスを確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute authRequired={false}>
      <div className="min-h-screen flex flex-col bg-white">
        <Header>ログアウト</Header>
        <main className="bg-white flex-1 flex flex-col items-center p-8 w-full">
          <Card>
            <PageTitle>パスワードをリセット</PageTitle>
            <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-lg mt-6">
              <div className="mb-6">
                <Label>メールアドレス：</Label>
                <FormInput name="email" type="email" value={email} onChange={handleChange} />
                <p className="mt-2 text-center text-sm text-gray-600">登録したメールアドレスを入力してください</p>
              </div>

              <div>
                {error && (
                  <div className={`px-4 py-3 rounded relative mb-4 bg-red-100 text-red-700 border border-red-400`}>
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Buttons type="submit" disabled={isLoading} className="text-xl" w="90">
                  {isLoading ? 'リセットメール送信中...' : 'リセットメールを送信'}
                </Buttons>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                <Link href="/Login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ログイン画面に戻る
                </Link>
              </p>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default ChangePassword
