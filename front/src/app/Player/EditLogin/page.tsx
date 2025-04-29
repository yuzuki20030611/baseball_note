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
import { updateUserPassword } from '../../../app/services/auth'
import { FullInput } from '../../../components/component/Input/FullInput'
import { Buttons } from '../../../components/component/Button/Button'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { formDataValidationErrors, validateLoginEdit } from '../../../app/validation/loginValidation'

const EditLogin = () => {
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [validateErrors, setValidateError] = useState<formDataValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validate = validateLoginEdit(formData)
    if (Object.keys(validate).length > 0) {
      setValidateError(validate)
      return
    }

    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      await updateUserPassword(formData.currentPassword, formData.newPassword)

      setMessage({
        type: 'success',
        text: 'パスワードが正常に更新されました',
      })
      alert('パスワードの変更に成功しました')
      router.push('/Player/LoginDetail')
    } catch (error: any) {
      console.error('更新エラー', error)
      setMessage({
        type: 'error',
        text: error.message || '更新中にエラーが発生しました',
      })
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
            <PageTitle>パスワード変更画面</PageTitle>
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
                  {message.text && <div className="text-red-500 text-sm mt-1">{message.text}</div>}
                </div>

                <div className="mb-6">
                  <InfoItem
                    label="現在のメールアドレス"
                    value={user?.email || '(読み込み中...)'}
                    className="md:w-96"
                    type="text"
                  />
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
