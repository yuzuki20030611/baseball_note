'use client'

import React from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useAuth } from '../../../contexts/AuthContext'
import DifyChatBot from '../../../components/component/ChatBot/DifyChatBot'

const LoginDetail = () => {
  const { user } = useAuth()
  const firebaseUser = user

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen flex flex-col">
        <Header role="coach">ホーム画面</Header>

        <main className="flex-1 flex flex-col items-center p-4 w-full">
          <Card>
            <PageTitle>ログイン情報詳細</PageTitle>
            <div className="max-w-4xl mx-auto p-5">
              <div className="text-right pr-5 mr-5">
                <p className="text-2xl">指導者</p>
              </div>
              <form className="bg-gray-200 p-8 rounded-lg shadow-md w-full max-w-md mt-6">
                <div className="mb-6">
                  <InfoItem
                    label="現在のメールアドレス："
                    value={firebaseUser?.email || '(読み込み中...)'}
                    className="md:w-96"
                  />
                </div>

                <div className="mb-6">
                  <InfoItem label="現在のパスワード：" value="・・・・" className="md:w-96" type="number" />
                  <p className="text-sum text-gray-500 mt-1">セキュリティ上の理由により表示されません</p>
                </div>

                <div className="text-right pt-5">
                  <LinkButtons href="/Coach/EditLogin">ログイン情報を変更</LinkButtons>
                </div>
              </form>
            </div>
          </Card>
        </main>
        <Footer />
        <div className="fixed right-3 top-28 z-50">
          <DifyChatBot firebase_uid={user?.uid} />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default LoginDetail
