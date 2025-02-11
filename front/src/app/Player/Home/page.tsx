import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { Buttons } from '../../../components/component/Button/Button'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const PlayerHome = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow container mx-auto p-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="flex justify-between gap-1">
              <div className="space-x-4">
                <LinkButtons href="/Player/LoginDetail" className="w-100px">
                  ログイン情報
                </LinkButtons>
                <LinkButtons href="/Player/CreateProfile" className="w-130px">
                  プロフィール登録
                </LinkButtons>
              </div>
            </div>
            <PageTitle>野球ノート一覧</PageTitle>

            <div className="flex flex-col space-y-10 items-end mb-6 pr-20">
              <p className="text-2xl">選手</p>
              <LinkButtons href="/Player/CreateNote" className="w-80px">
                新規作成
              </LinkButtons>
            </div>

            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">日付</th>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">本日のテーマ</th>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">課題</th>
                  <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2025-2-2</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">守備</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Player/NoteDetail" className="text-3xl">
                      📖⇨
                    </LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2025-2-2</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">守備</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Player/NoteDetail" className="text-3xl">
                      📖⇨
                    </LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2025-2-2</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">守備</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Player/NoteDetail" className="text-3xl">
                      📖⇨
                    </LinkButtons>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-center pt-10">
              <Buttons width="130px">さらに表示</Buttons>
            </div>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default PlayerHome
