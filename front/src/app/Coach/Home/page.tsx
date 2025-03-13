import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { Buttons } from '../../../components/component/Button/Button'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const CoachHome = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow container mx-auto p-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="text-lefht">
              <LinkButtons href="/Coach/LoginDetail" className="text-lg">
                ログイン情報
              </LinkButtons>
            </div>
            <PageTitle>選手一覧</PageTitle>

            <div className="flex flex-col space-y-10 items-end mb-6 pr-20">
              <p className="text-2xl mt-3">指導者</p>
              <LinkButtons href="/Coach/TrainingList" className="text-lg">
                トレーニングメニュー詳細
              </LinkButtons>
            </div>

            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">名前</th>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">利き手</th>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">ポジション</th>
                  <th className="pr-1 py-3 text-center text-xl font-semibold text-gray-700">野球ノート</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">多田羅</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">右投げ・右打ち</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Coach/NoteDetail">開く⇨</LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">多田羅</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">右投げ・右打ち</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Coach/NoteDetail">開く⇨</LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">多田羅</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">右投げ・右打ち</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Coach/NoteDetail">開く⇨</LinkButtons>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-center pt-10">
              <Buttons width="100px">さらに表示</Buttons>
            </div>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default CoachHome
