import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const ProfileDetail = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header>ホーム画面</Header>

      <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
        <Card>
          <div className="pt-5">
            <PageTitle>プロフィール詳細</PageTitle>
          </div>
          {/* カード内 */}
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-right pb-1 pr-8 mr-8">
              <p className="text-2xl">選手</p>
            </div>
            <div className="max-w-3xl bg-gray-100 mx-auto rounded-lg shadow p-8">
              {/* ボタン */}
              <div className="flex justify-end mb-6">
                <LinkButtons href="/Player/EditProfile">編集</LinkButtons>
              </div>
              {/* プロフィールとメイン情報 */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center mb-4"></div>
                <h2 className="text-2xl font-bold mb-2">多田羅抱希</h2>
                <p className="text-gray-600">2003年 6月11日</p>
              </div>
              {/* プロフィール内容 */}
              <div className="space-y-4">
                <InfoItem label="野球歴：" value="今年の6月からノートを使っています！！" type="text" />
                <InfoItem label="チーム名：" value="斉美高校" type="text" />
                <InfoItem label="利き手：" value="右投げ・右打ち" type="text" />
                <InfoItem label="ポジション：" value="レフト" type="text" />
                <InfoItem label="憧れの選手：" value="大谷翔平" type="text" />
                <InfoItem label="自己紹介：" value="多田羅です！甲子園優勝を目指しています。" type="text" />
              </div>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default ProfileDetail
