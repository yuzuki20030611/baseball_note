import React from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { DeleteButton } from '../../../components/component/Button/Delete'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AccountRole } from '@/types/account'

const TrainingList = () => {
  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div>
        <div className="flex flex-col min-h-screen">
          <Header role="coach">ホーム画面</Header>
          <main className="bg-white">
            <Card>
              <PageTitle>トレーニングメニュー詳細</PageTitle>
              <div className="max-w-4xl mx-auto p-9">
                <div className="flex justify-between px-5 py-2">
                  <h2 className="text-2xl mt-3">[チーム全体]</h2>
                  <p className="text-2xl mt-3">指導者</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="border-b border-black text-2xl text-center font-bold py-3 my-6">基礎トレーニング</h3>
                  <div className="max-h-[500px] overflow-y-auto pr-4">
                    <div className="space-y-6 mt-5">
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-lg">・腕立て</span>
                        <DeleteButton>[削除]</DeleteButton>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 mr-4 text-right">
                    <LinkButtons href="/Coach/AddMenu">追加</LinkButtons>
                  </div>
                </div>
              </div>
            </Card>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default TrainingList
