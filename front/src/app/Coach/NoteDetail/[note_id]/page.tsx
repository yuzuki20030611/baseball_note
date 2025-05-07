'use client'
import React from 'react'

import { Header } from '../../../../components/component/Header/Header'
import { PageTitle } from '../../../../components/component/Title/PageTitle'
import { Footer } from '../../../../components/component/Footer/Footer'
import { Label } from '../../../../components/component/Label/Label'
import { FullInput } from '../../../../components/component/Input/FullInput'
import { InfoItem } from '../../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../../components/component/Card/Card'
import { LinkButtons } from '../../../../components/component/Button/LinkButtons'
import { LinkButton } from '../../../../components/component/Button/LoginPageButton'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { AccountRole } from '../../../../types/account'
import { useParams } from 'next/navigation'

const CoachNoteDetail = () => {
  const params = useParams()
  const note_id = params.note_id as string
  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="coach">ホーム画面</Header>

          <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <PageTitle>野球ノート詳細</PageTitle>
              <div className="max-w-4xl mx-auto p-8">
                <div className="text-right px-5 py-2">
                  <p className="text-2xl mb-3">指導者</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-10">
                    <div className="text-lg">2024-06-11</div>
                    <LinkButtons href="/Coach/NoteList">ノート一覧画面に戻る</LinkButtons>
                  </div>
                  <div className="space-y-2 mb-3">
                    <InfoItem label="1日のテーマ：" value="打撃でホームランを打つ" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="課題：" value="打撃でセンターに返す" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <Label>基礎トレーニング：</Label>
                    <InfoItem label="腕立て：" value="100回" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="腹筋：" value="100回" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="背筋：" value="100回" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="バットスイング：" value="100回" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="ランニング：" value="10キロ" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="体重：" value="70キロ" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="睡眠時間：" value="10時間" />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem
                      label="その他練習内容："
                      value="ンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンn"
                    />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="参考動画：" value={<FullInput type="textarea" height="400px" />} />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem label="練習動画：" value={<FullInput type="textarea" height="400px" />} />
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <InfoItem
                      label="1日の振り返り："
                      value="っっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっs"
                    />
                  </div>
                  <div className="text-center mt-6 flex justify-center space-x-4 py-1 my-2">
                    <LinkButtons href="/Player/Chat"> 💬 選手とチャットする</LinkButtons>
                    <LinkButtons href="/Player/Home">ノート一覧に戻る</LinkButtons>
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

export default CoachNoteDetail
