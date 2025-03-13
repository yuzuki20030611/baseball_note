import React from 'react'

import { Header } from '../../../components/component/Header/Header'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { LinkButton } from '../../../components/component/Button/LoginPageButton'
import { Comment } from '../../../components/component/Chat/Comment'

const PlayerNoteDetail = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header role="player">ホーム画面</Header>

        <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>野球ノート詳細</PageTitle>
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-right pr-5 mr-5">
                <p className="text-2xl mt-3">選手</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="flex justify-between items-center mb-10">
                  <div className="text-lg">2024-06-11</div>
                  <div className="space-x-3">
                    <Buttons fontSize="18px">削除</Buttons>
                    <LinkButtons href="/Player/EditNote" className="text-lg">
                      編集
                    </LinkButtons>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <InfoItem label="1日のテーマ：" value="打撃でホームランを打つ" type="text" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="課題：" value="打撃でセンターに返す" type="text" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>基礎トレーニング：</Label>
                  <InfoItem label="腕立て：" value="100回" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="腹筋：" value="100回" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="背筋：" value="100回" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="バットスイング：" value="100回" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="ランニング：" value="10キロ" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="体重：" value="70キロ" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="睡眠時間：" value="10時間" type="number" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem
                    label="その他練習内容："
                    value="ンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンンn"
                    type="text"
                  />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="参考動画：" value={<FullInput type="textarea" height="400px" />} type="textarea" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem label="練習動画：" value={<FullInput type="textarea" height="400px" />} type="textarea" />
                </div>
                <div className="space-y-2 my-3 py-3">
                  <InfoItem
                    label="1日の振り返り："
                    value="aaあああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ"
                    type="text"
                  />
                </div>
              </div>
            </div>
            <div className="max-w-4xl mx-auto p-8">
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="space-y-4">
                  <h1 className="text-center font-semibold">指導者</h1>
                  <div className="bg-white rounded-lg p-4 h-80 overflow-y-auto space-y-4">
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
                            <LinkButton href="/Player/EditChat">[編集]</LinkButton>
                            <LinkButton>[削除]</LinkButton>
                          </div>
                          <p className="text-sm text-gray-500">12:07</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-300" />
                    </div>
                  </div>
                  <Comment />
                </div>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default PlayerNoteDetail
