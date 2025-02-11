import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const NoteList = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header href="/Coach/Home">ホーム画面</Header>

        <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>多田羅 柚希のノート一覧</PageTitle>
            <div className="text-right px-5 py-2">
              <p className="text-2xl mt-3">指導者</p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">本日のテーマ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">課題</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">2025-2-3</td>
                  <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                  <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                  <td className="px-6 py-4 text-right">
                    <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">2025-2-3</td>
                  <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                  <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                  <td className="px-6 py-4 text-right">
                    <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">2025-2-3</td>
                  <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                  <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                  <td className="px-6 py-4 text-right">
                    <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">2025-2-3</td>
                  <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                  <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                  <td className="px-6 py-4 text-right">
                    <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">2025-2-3</td>
                  <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                  <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                  <td className="px-6 py-4 text-right">
                    <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-center pt-10">
              <Buttons width="100px">さらに表示</Buttons>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default NoteList
