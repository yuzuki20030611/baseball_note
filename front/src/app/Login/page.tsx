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

  // デモアカウント自動入力機能
  const fillDemoAccount = (email: string, password: string) => {
    setFormData({
      email: email,
      password: password,
    })
    setError(null) // エラーをクリア
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
                {/* デモアカウント情報 */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">⚾ デモアカウント</h3>

                  <div className="space-y-3">
                    {/* 選手用アカウント */}
                    <div
                      className="bg-white p-3 rounded-md shadow-sm border border-blue-100 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => fillDemoAccount('tatarayuzuki@icloud.com', 'aaaa1111')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            選手
                          </span>
                          <span className="font-medium text-gray-700">選手用アカウント</span>
                        </div>
                        <span className="text-xs text-blue-500 font-medium">クリックで入力</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">
                          <span className="font-medium">メール:</span>
                          <span className="ml-1 text-blue-600 font-mono">tatarayuzuki@icloud.com</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">パスワード:</span>
                          <span className="ml-1 text-blue-600 font-mono">aaaa1111</span>
                        </p>
                      </div>
                    </div>

                    {/* 監督用アカウント */}
                    <div
                      className="bg-white p-3 rounded-md shadow-sm border border-blue-100 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => fillDemoAccount('tatarayuzuki1113@gmail.com', 'aaaa1111')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                            監督
                          </span>
                          <span className="font-medium text-gray-700">監督用アカウント</span>
                        </div>
                        <span className="text-xs text-blue-500 font-medium">クリックで入力</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">
                          <span className="font-medium">メール:</span>
                          <span className="ml-1 text-blue-600 font-mono">tatarayuzuki1113@gmail.com</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">パスワード:</span>
                          <span className="ml-1 text-blue-600 font-mono">aaaa1111</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-blue-600 mt-3 italic text-center">
                    💡 アカウントをクリックすると自動入力されます
                  </p>
                </div>
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
