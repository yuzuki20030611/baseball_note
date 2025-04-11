'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Label } from '../../../components/component/Label/Label'
import { FormInput } from '../../../components/component/Input/FormInput'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { CreateAddMenu } from '../../../types/AddMenu'
import { Buttons } from '../../../components/component/Button/Button'
import { AddMenuValidationErrors, validateAddMenu } from '../../../app/validation/AddMenuValidation'
import { addMenuApi } from '../../../api/AddMenu/AddMenu'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useAuth } from '../../../contexts/AuthContext'

const AddMenu = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [validateError, setValidateError] = useState<AddMenuValidationErrors>({})
  const [error, setError] = useState<null | string>(null)
  const [formData, setFormData] = useState<CreateAddMenu>({
    firebase_uid: user?.uid || '',
    menu: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    const validationErrors = validateAddMenu(formData)

    // エラーがある場合は処理を中止
    if (Object.keys(validationErrors).length > 0) {
      setValidateError(validationErrors)
      setError('入力内容に誤りがあります。各項目を確認してください。')
      return
    }

    try {
      setIsSubmitting(true)
      await addMenuApi.create(formData)
      router.push('/Coach/TrainingList')
    } catch (error) {
      console.error('メニュー追加に失敗しました', error)
      setError('メニュー追加に失敗しました。後ほど再試行してください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value, name } = e.target

    // 再入力する際に、エラーを取り消す必要がある
    setValidateError((prev) => ({
      ...prev,
      [name]: undefined,
    }))

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen flex flex-col bg-white">
        <Header role="coach">ホーム画面</Header>

        <main className="max-w-4xl mx-auto p-6 w-full">
          <Card>
            <form onSubmit={handleSubmit}>
              <PageTitle>トレーニングメニュー追加</PageTitle>
              <div className="space-y-6">
                <div className="mt-14">
                  <Label fontSize="24px">トレーニング名： </Label>
                  {/* エラーメッセージの表示部分 */}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                      {error}
                    </div>
                  )}
                  <FormInput
                    type="text"
                    name="menu"
                    value={formData.menu}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2"
                  />
                  {validateError.menu && <p className="text-red-500 text-sm mt-1">{validateError.menu}</p>}
                  <div className="text-center pt-4 mt-3"></div>
                </div>
                <div className="flex justify-center space-x-4 pt-6 pb-4">
                  <LinkButtons href="/Coach/TrainingList">トレーニング一覧に戻る</LinkButtons>
                  <Buttons type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '送信中...' : '追加'}
                  </Buttons>
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

export default AddMenu
