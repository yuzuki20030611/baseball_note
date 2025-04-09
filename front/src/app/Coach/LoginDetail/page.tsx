import React from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AccountRole } from '@/types/account'

const LoginDetail = () => {
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
              <form className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md mt-6">
                <div className="mb-6">
                  <InfoItem label="現在のメールアドレス：" value="tatara@emai.com" className="md:w-96" />
                </div>

                <div className="mb-6">
                  <InfoItem label="現在のパスワード：" value="1212121212" className="md:w-96" />
                </div>

                <div className="text-right pt-5">
                  <LinkButtons href="/Coach/EditLogin">編集</LinkButtons>
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

export default LoginDetail
