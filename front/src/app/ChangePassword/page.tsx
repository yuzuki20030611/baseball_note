'use client'

import React, { useState } from 'react'

import { Card } from '../../components/component/Card/Card'
import { Header } from '../../components/component/Header/Header'
import { PageTitle } from '../../components/component/Title/PageTitle'
import { Label } from '../../components/component/Label/Label'
import { FormInput } from '../../components/component/Input/FormInput'
import { Footer } from '../../components/component/Footer/Footer'
import { resetPassword } from '../services/auth'
import { Buttons } from '../../components/component/Button/Button'
import Link from 'next/link'

const ChangePassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email) {
      setMessage({ type: 'error', text: 'メールアドレスを入力してください' })
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(email)
      setMessage({
        type: 'success',
        text: 'パスワードリセット用のメールを送信しました。メールのリンクからパスワードを再設定してください。',
      })
      setEmail('')
    } catch (error) {
      console.error('パスワードの再設定に失敗しました。')
      setMessage({
        type: 'error',
        text: 'パスワードリセットメールの送信に失敗しました。メールアドレスを確認してください。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header>ログアウト</Header>
      <main className="bg-white flex-1 flex flex-col items-center p-8 w-full">
        <Card>
          <PageTitle>パスワードをリセット</PageTitle>
          <p className="mt-2 text-center text-sm text-gray-600">登録したメールアドレスを入力してください</p>

          {message && (
            <div className={`p-4 round ${message.type ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-lg mt-6">
            <div className="mb-6">
              <Label>メールアドレス：</Label>
              <FormInput name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
  )
}

export default ChangePassword
