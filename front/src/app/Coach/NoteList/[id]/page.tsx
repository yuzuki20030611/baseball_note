'use client'

import React, { useEffect, useState } from 'react'

import { Header } from '../../../../components/component/Header/Header'
import { Footer } from '../../../../components/component/Footer/Footer'
import { PageTitle } from '../../../../components/component/Title/PageTitle'
import { Buttons } from '../../../../components/component/Button/Button'
import { Card } from '../../../../components/component/Card/Card'
import { LinkButtons } from '../../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { AccountRole } from '../../../../types/account'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'

const NoteList = () => {
  const params = useParams()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const userId = params.userId as string
  const playerName = searchParams.get('name') || '選手'
  const firebase_uid = user?.uid || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [noteList, setNoteList] = useState<NoteListResponse | null>(null)

  useEffect(() => {
    const fetchNoteList = async () => {
      try {
        setLoading(true)
        // const noteListData = await noteApi.noteList(userId)
        // setNoteList(noteListData)
        setError(null)
      } catch (error: any) {
        console.error('ノート一覧の取得に失敗しました', error)
        setError(error.message || 'プロフィール取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    if (!firebase_uid) {
      setLoading(false)
      return
    } else {
      fetchNoteList()
    }
  }, [firebase_uid])

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="coach">ホーム画面</Header>

          <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <PageTitle>{`${playerName}のノート一覧`}</PageTitle>
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
                    <td className="px-6 py-4 text-sm text-gray-600">2025-02-03</td>
                    <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                    <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                    <td className="px-6 py-4 text-right">
                      <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">2025-02-03</td>
                    <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                    <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                    <td className="px-6 py-4 text-right">
                      <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">2025-02-03</td>
                    <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                    <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                    <td className="px-6 py-4 text-right">
                      <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">2025-02-03</td>
                    <td className="px-6 py-4 text-sm text-gray-600">三振をとる</td>
                    <td className="px-6 py-4 text-sm text-gray-600">変化球のコントロール</td>
                    <td className="px-6 py-4 text-right">
                      <LinkButtons href="/Coach/NoteDetail">詳細</LinkButtons>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">2025-02-03</td>
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
    </ProtectedRoute>
  )
}

export default NoteList
