'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Label } from '../../../components/component/Label/Label'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { updateUserEmail, updateUserPassword } from '../../../app/services/auth'
import { FullInput } from '../../../components/component/Input/FullInput'
import { Buttons } from '../../../components/component/Button/Button'
import {
  LoginInfoFormData,
  LoginInfoValidationErrors,
  validateLoginEdit,
} from '../../../app/validation/loginValidation'

const EditLogin = () => {
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<LoginInfoFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
    confirmEmail: '',
  })
  const [validateErrors, setValidateError] = useState<LoginInfoValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // エラーをクリア
    setValidateError((prev) => ({
      ...prev,
      [name]: undefined,
    }))

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validate = validateLoginEdit(formData)
    if (Object.keys(validate).length > 0) {
      setValidateError(validate)
      return
    }

    // 何も変更がない場合
    if (!formData.newPassword && !formData.newEmail) {
      alert('変更する項目がありません')
      return
    }

    setIsSubmitting(true)

    // 成功フラグ
    let passwordSuccess = false
    let emailSuccess = false

    // メールアドレス変更処理
    if (formData.newEmail) {
      try {
        // sendEmailChangeVerification の代わりに updateUserEmail を使用
        await updateUserEmail(formData.currentPassword, formData.newEmail)

        setEmailMessage({
          type: 'success',
          text: '現在のメールアドレス宛に確認メールを送信しました。メール内のリンクをクリックして変更プロセスを続けてください',
        })
        // ユーザーに明示的な確認を促す
        alert(`
          新しいメールアドレス(${formData.newEmail})宛に確認メールを送信しました。
          数分以内にメールが届かない場合は、再度お試しいただくか、別のメールアドレスをお試しください。
          迷惑メールフォルダも確認してください。
          メールをクリックした後、再度ローディングを行なってから、新しいメールアドレスでログインをしてください
        `)
        emailSuccess = true
      } catch (error: any) {
        console.error('メールアドレス更新エラー', error)
        setEmailMessage({
          type: 'error',
          text: error.message || 'メール送信中にエラーが発生しました',
        })
      }
    }

    // パスワード変更処理
    if (formData.newPassword) {
      try {
        await updateUserPassword(formData.currentPassword, formData.newPassword)
        setPasswordMessage({
          type: 'success',
          text: 'パスワードが正常に更新されました',
        })
        passwordSuccess = true
      } catch (error: any) {
        console.error('パスワード更新エラー', error)
        setPasswordMessage({
          type: 'error',
          text: error.message || 'パスワード更新中にエラーが発生しました',
        })
      }
    }

    // 全ての処理が完了したら
    setIsSubmitting(false)

    if (passwordSuccess || emailSuccess) {
      let message = ''

      if (passwordSuccess) {
        message += 'パスワードの変更に成功しました。'
      }

      if (emailSuccess) {
        message +=
          'メールアドレス変更のため、新しいメールアドレス宛に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。'
      }

      alert(message)

      // フォームをリセット
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        newEmail: '',
        confirmEmail: '',
      })

      // 明示的にタイムアウトを設定してページ遷移
      setTimeout(() => {
        router.push('/Player/LoginDetail')
      }, 1000)
    }
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="min-h-screen flex flex-col">
        <Header role="player">ホーム画面</Header>
        <main className="flex-1 flex flex-col items-center p-6 w-full">
          <Card>
            <PageTitle>ログイン情報変更画面</PageTitle>
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-right pr-5 mr-5">
                <p className="text-2xl mt-3">選手</p>
              </div>

              <form className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md mt-6" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Label>現在のパスワード（必須）</Label>
                  <FullInput
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  {validateErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{validateErrors.currentPassword}</p>
                  )}
                </div>

                <div className="mb-6">
                  <Label>新しいパスワード</Label>
                  <FullInput name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} />
                  {validateErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{validateErrors.newPassword}</p>
                  )}
                </div>

                <div className="mb-6">
                  <Label>新しいパスワード（確認）</Label>
                  <FullInput
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {validateErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{validateErrors.confirmPassword}</p>
                  )}
                  {passwordMessage.text && (
                    <div
                      className={`p-3 mb-4 rounded ${
                        passwordMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {passwordMessage.text}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-300 my-6 pt-6">
                  <h3 className="text-lg font-semibold mb-4">メールアドレス変更</h3>

                  <div className="mb-6">
                    <Label>現在のメールアドレス</Label>
                    <p className="py-2 px-3 bg-gray-200 rounded">{user?.email || '(読み込み中...)'}</p>
                  </div>

                  <div className="mb-6">
                    <Label>新しいメールアドレス</Label>
                    <FullInput name="newEmail" type="email" value={formData.newEmail} onChange={handleChange} />
                    {validateErrors.newEmail && <p className="text-red-500 text-sm mt-1">{validateErrors.newEmail}</p>}
                  </div>
                  <div className="mb-6">
                    <Label>新しいメールアドレス（確認）</Label>
                    <FullInput name="confirmEmail" type="email" value={formData.confirmEmail} onChange={handleChange} />
                    {validateErrors.confirmEmail && (
                      <p className="text-red-500 text-sm mt-1">{validateErrors.confirmEmail}</p>
                    )}
                  </div>

                  {emailMessage.text && (
                    <div
                      className={`p-3 mb-4 rounded ${
                        emailMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {emailMessage.text}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4">
                    ※メールアドレスの変更は、新しいメールアドレス宛に確認メールが送信されます。
                    メール内のリンクをクリックして変更を完了してください。
                  </p>
                </div>

                <div className="flex justify-center gap-4 mt-10">
                  <LinkButtons href="/Player/LoginDetail">ログイン情報詳細画面に戻る</LinkButtons>
                  <Buttons type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '更新中...' : '更新する'}
                  </Buttons>
                </div>
              </form>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default EditLogin
