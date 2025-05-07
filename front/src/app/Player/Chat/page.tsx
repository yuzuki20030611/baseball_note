'use client'

import React from 'react'
import { LinkButton } from '../../../components/component/Button/LoginPageButton'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { Header } from '../../../components/component/Header/Header'

import { Buttons } from '../../../components/component/Button/Button'
import { Textarea } from '@chakra-ui/react'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'

const chatPage = () => {
  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="flex flex-col min-h-screen">
        <Header role="player">ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <form>
              <PageTitle>チャット</PageTitle>
              <div className="max-w-4xl mx-auto p-8">
                <div className="bg-gray-100 rounded-lg p-6">
                  <div className="space-y-4">
                    <h1 className="text-center font-semibold">指導者</h1>
                    <div className="relative bg-white rounded-lg p-4 h-80 overflow-y-auto space-y-4">
                      {/* 相手のメッセージ */}
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                        <div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p>頑張りました。</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">12:07</p>
                        </div>
                      </div>

                      {/* 自分のメッセージ */}
                      <div className="flex gap-3 justify-end">
                        <div className="flex-grow">
                          <div className="bg-blue-50 p-3 rounded-lg relative group">
                            <p>明日も同じような感じで頑張りますよろしく</p>
                          </div>
                          <div className="flex justify-end items-center gap-4 mt-1">
                            <div className="space-x-4">
                              <div className="absolute bottom-2 right-4 flex gap-2">
                                <LinkButton href="/Player/EditChat">[編集]</LinkButton>
                                <LinkButton>[削除]</LinkButton>
                                <LinkButton href="/Player/NoteDetail">詳細画面に戻る</LinkButton>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">12:07</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="bg-white rounded-lg p-2 flex items-end gap-2">
                        <Textarea placeholder="コメント入力" className="bg-white resize-none flex-1" rows={1} />
                        <Buttons fontSize="18px" height="43px" width="75px">
                          送信
                        </Buttons>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default chatPage
