'use client'

import { AccountRole, LoginGetAccout } from '../../types/account'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useState } from 'react'
import { loginWithRoleCheck } from '../services/auth'
import { Header } from '../../components/component/Header/Header'
import { Card } from '../../components/component/Card/Card'
import { PageTitle } from '../../components/component/Title/PageTitle'
import { Label } from '../../components/component/Label/Label'
import { FormInput } from '../../components/component/Input/FormInput'
import { Buttons } from '../../components/component/Button/Button'
import Link from 'next/link'
import { Footer } from '../../components/component/Footer/Footer'
import ProtectedRoute from '../../components/ProtectedRoute'

const LoginPage = () => {
  const router = useRouter()

  const [formData, setFormData] = useState<LoginGetAccout>({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onChangeText = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError('登録したメールアドレスとパスワードを入力してください')
      return
    }

    setIsLoading(true)

    try {
      // Firebaseでログイン
      const { user, role } = await loginWithRoleCheck(formData.email, formData.password)

      if (role === AccountRole.PLAYER) {
        router.push('/Player/Home')
      } else if (role === AccountRole.COACH) {
        router.push('/Coach/Home')
      } else {
        // ロールが不明な場合は汎用ページへ
        router.push('/')
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else if (error.code === 'auth/invalid-email') {
        setError('メールアドレスの形式を修正してください')
      } else {
        setError('ログインに失敗しました。再度お試しください')
      }
      console.error('エラーコード:', error.code)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute authRequired={false}>
      <div className="min-h-screen flex flex-col">
        <Header>ログアウト</Header>
        <main className="bg-white flex-1 flex flex-col items-center p-8 w-full">
          <Card>
            <PageTitle>野球ノート</PageTitle>
            <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-sm w-full max-w-xl mt-6">
              <div className="mb-6">
                <Label>メールアドレス：</Label>
                <FormInput
                  value={formData.email}
                  onChange={onChangeText}
                  placeholder="メールアドレスを入力してください"
                  type="email"
                  name="email"
                />
              </div>

              <div className="mb-6">
                <Label>パスワード：</Label>
                <FormInput
                  value={formData.password}
                  onChange={onChangeText}
                  placeholder="パスワードを入力してください"
                  type="password"
                  name="password"
                />
              </div>

              <div className="w-full max-w-xl mx-auto">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
                )}
              </div>
              <div className="text-center mt-6">
                <Buttons type="submit" className="w-full text-2xl mt-3" disabled={isLoading}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Buttons>
              </div>

              <div className="text-center mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  アカウントをお持ちでない方は{' '}
                  <Link href="/CreateAccount" className="font-medium text-indigo-600 hover:text-indigo-500">
                    新規登録
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  <Link href="/ChangePassword" className="font-medium text-indigo-600 hover:text-indigo-500">
                    パスワードをお忘れの方
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default LoginPage
