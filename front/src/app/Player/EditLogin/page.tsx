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
      [name]: null,
    }))

    // 関連するエラーメッセージをクリア
    if (name === 'newPassword' || name === 'confirmPassword') {
      setPasswordMessage({ type: '', text: '' })
    }

    if (name === 'newEmail' || name === 'confirmEmail') {
      setEmailMessage({ type: '', text: '' })
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // バリデーションチェック
    const validate = validateLoginEdit(formData)
    if (Object.keys(validate).length > 0) {
      setValidateError(validate)
      return
    }

    setIsSubmitting(true)
    setPasswordMessage({ type: '', text: '' })
    setEmailMessage({ type: '', text: '' })

    try {
      // メールアドレスとパスワードの両方を変更する場合
      if (formData.newEmail && formData.newPassword) {
        // 一連の処理として実行
        await updateUserEmail(formData.currentPassword, formData.newEmail)
        await updateUserPassword(formData.currentPassword, formData.newPassword)

        // 両方成功した場合のメッセージ設定
        setEmailMessage({
          type: 'success',
          text: '新しいメールアドレス宛に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください',
        })
        setPasswordMessage({
          type: 'success',
          text: 'パスワードが正常に更新されました',
        })

        // フォームリセットとページ遷移
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          newEmail: '',
          confirmEmail: '',
        })

        router.push('/')
      }
      // メールアドレスのみ変更
      else if (formData.newEmail) {
        await updateUserEmail(formData.currentPassword, formData.newEmail)

        setEmailMessage({
          type: 'success',
          text: '新しいメールアドレス宛に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください',
        })

        // フォームリセットとページ遷移
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          newEmail: '',
          confirmEmail: '',
        })

        router.push('/')
      }
      // パスワードのみ変更
      else if (formData.newPassword) {
        await updateUserPassword(formData.currentPassword, formData.newPassword)

        setPasswordMessage({
          type: 'success',
          text: 'パスワードが正常に更新されました',
        })

        // フォームリセットとページ遷移
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          newEmail: '',
          confirmEmail: '',
        })

        router.push('/Player/LoginDetail')
      }
    } catch (error: any) {
      console.error('更新エラー:', error)

      // エラーメッセージの設定
      if (error.message && error.message.includes('メールアドレス')) {
        setEmailMessage({
          type: 'error',
          text: error.message || 'メールアドレス更新中にエラーが発生しました',
        })
      } else if (error.message && error.message.includes('パスワード')) {
        setPasswordMessage({
          type: 'error',
          text: error.message || 'パスワード更新中にエラーが発生しました',
        })
      } else {
        // エラーの種類が特定できない場合
        if (formData.newEmail && formData.newPassword) {
          // 両方変更しようとしていた場合は両方にエラーメッセージを表示
          setEmailMessage({
            type: 'error',
            text: '更新処理中にエラーが発生しました',
          })
          setPasswordMessage({
            type: 'error',
            text: '更新処理中にエラーが発生しました',
          })
        } else if (formData.newEmail) {
          setEmailMessage({
            type: 'error',
            text: error.message || 'メールアドレス更新中にエラーが発生しました',
          })
        } else if (formData.newPassword) {
          setPasswordMessage({
            type: 'error',
            text: error.message || 'パスワード更新中にエラーが発生しました',
          })
        }
      }
    } finally {
      setIsSubmitting(false)
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

                  {validateErrors.noEditForm && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {validateErrors.noEditForm}
                    </div>
                  )}
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
