import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const EditProfile = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header>ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>プロフィール編集</PageTitle>
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-right pr-5 mr-5">
                <p className="text-2xl mt-3 pb-2">選手</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-20">
                {/* 写真 */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4"></div>
                  <Buttons width="100px">写真を選ぶ</Buttons>
                </div>

                <div className="space-y-2 mb-3">
                  <Label>
                    名前：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="名前"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    生年月日：
                    <RequiredBadge />
                  </Label>
                  <FullInput type="date" value="2003年6月11日"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    チーム名：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="斉美高校"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    腹筋：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="100回"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    利き手：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="右投げ・右打ち"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    ポジション：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="レフト"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    憧れの選手：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput value="大谷翔平"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    自己紹介：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput type="textarea" height="300px"></FullInput>
                </div>
                <div className="text-center space-x-5 mt-10 pt-5">
                  <LinkButtons href="/Player/ProfileDetail" className="text-lg">
                    プロフィール詳細画面に戻る
                  </LinkButtons>
                  <LinkButtons href="/Player/ProfileDetail" className="text-lg">
                    決定
                  </LinkButtons>
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

export default EditProfile
