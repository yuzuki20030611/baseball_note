'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { validateCreateAccount } from '../../utils/validators/validateCreateAccount'
import { AccountRole, CreateAccountType } from '../../types/account'
import { createAccount } from '../services/auth'
import { PageTitle } from '../../components/component/Title/PageTitle'
import { Card } from '../../components/component/Card/Card'
import { Label } from '../../components/component/Label/Label'
import { FormInput } from '../../components/component/Input/FormInput'
import { Buttons } from '../../components/component/Button/Button'
import { Footer } from '../../components/component/Footer/Footer'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'
import { Header } from '../../components/component/Header/Header'
import ProtectedRoute from '../../components/ProtectedRoute'

const CreateAccountHome = () => {
  const router = useRouter()
  const { setUserRole } = useAuth()
  const [formData, setFormData] = useState<CreateAccountType>({
    email: '',
    password1: '',
    password2: '',
    account_role: AccountRole.PLAYER,
  })
  const [validateError, setValidateError] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChangeText = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const newValue = name === 'account_role' ? Number(value) : value
      return {
        ...prev,
        [name]: newValue,
      }
    })

    // 入力時にエラーをクリア
    if (validateError[name]) {
      setValidateError((prev: any) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationErrors = validateCreateAccount(formData)
    if (Object.keys(validationErrors).length > 0) {
      setValidateError(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      await createAccount(formData.email, formData.password1, formData.account_role)
      setUserRole(formData.account_role)
      alert('アカウント作成に成功しました')
      if (formData.account_role === AccountRole.PLAYER) {
        router.push('/Player/Home')
      } else {
        router.push('/Coach/Home')
      }
    } catch (error: any) {
      console.error('アカウント作成に失敗しました。', error)

      // エラーメッセージがある場合はそれを使用
      if (error.message) {
        setError(error.message)
      }
      // FirebaseのエラーコードがあればFirebaseエラーとして処理
      else if (error.code) {
        if (error.code === 'auth/email-already-in-use') {
          setError('このメールアドレスは既に使用されています。別のメールアドレスを使用するか、ログインしてください。')
        } else if (error.code === 'auth/invalid-email') {
          setError('メールアドレスの形式が正しくありません。')
        } else {
          setError('アカウント作成に失敗しました。入力内容を確認してください。')
        }
      }
      // それ以外のエラー
      else {
        setError('アカウント作成に失敗しました。入力内容を確認してください。')
      }
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
            <PageTitle>新規アカウント作成</PageTitle>
            <div className="w-full max-w-md mx-auto">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-sm w-full max-w-md mt-6">
              <div className="mb-6">
                <Label>メールアドレス：</Label>
                <FormInput
                  placeholder="メールアドレスを入力してください"
                  type="email"
                  value={formData.email}
                  onChange={onChangeText}
                  name="email"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    validateError.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validateError.email && <p className="text-red-500 text-sm">{validateError.email}</p>}
              </div>

              <div className="mb-6">
                <Label>パスワード：</Label>
                <FormInput
                  placeholder="パスワードを入力してください"
                  type="password"
                  value={formData.password1}
                  onChange={onChangeText}
                  name="password1"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    validateError.password1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-600 font-medium text-indigo-600 text-center mt-1">
                  8文字以上の英数字で設定してください
                </p>
                {validateError.password1 && <p className="text-red-500 text-sm">{validateError.password1}</p>}
              </div>

              <div className="mb-6">
                <Label>パスワード（再入力）：</Label>
                <FormInput
                  placeholder="確認用パスワードを入力してください"
                  type="password"
                  value={formData.password2}
                  onChange={onChangeText}
                  name="password2"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    validateError.password2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validateError.password2 && <p className="text-red-500 text-sm">{validateError.password2}</p>}
              </div>

              <div className="mb-6">
                <Label>アカウントタイプ：</Label>
                <select
                  name="account_role"
                  value={formData.account_role}
                  onChange={onChangeText}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    validateError.account_role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={AccountRole.PLAYER}>選手</option>
                  <option value={AccountRole.COACH}>コーチ</option>
                </select>
                {validateError.account_role && <p className="text-red-500 text-sm">{validateError.account_role}</p>}
              </div>

              <div className="text-center mt-6">
                <Buttons type="submit" disabled={isLoading} className="text-xl" w="90">
                  {isLoading ? '処理中' : 'アカウント作成'}
                </Buttons>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                既にアカウントをお持ちの方は{' '}
                <Link href="/Login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  こちらからログイン
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

export default CreateAccountHome
