import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const EditChat = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header href="/Player/Home">ホーム画面</Header>
        <div className="max-w-4xl mx-auto p-6 w-full">
          <Card>
            <PageTitle>コメント編集</PageTitle>
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-10 h-80 overflow-y-auto space-y-6">
                  {/* メッセージ */}
                  <div className="flex gap-3">
                    <div className="w-full max-w-3xl">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start gap-4">
                          <p>練習で逆方向に強い打球を打てるようにしよう</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ボタングループ */}
                <div className="flex justify-center gap-4 mt-6">
                  <LinkButtons href="/Player/NoteDetail" className="text-lg">
                    ノート詳細画面に戻る
                  </LinkButtons>
                  <LinkButtons href="/Player/NoteDetail" className="text-lg">
                    決定
                  </LinkButtons>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default EditChat
