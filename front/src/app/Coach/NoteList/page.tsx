'use client'

import React, { Suspense, useEffect, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useSearchParams } from 'next/navigation'
import { NoteListItem } from '../../../types/note'
import { noteApi } from '../../../api/Note/NoteApi'
import { profileApi } from '../../../api/client/profile/profileApi'
import DifyChatBot from '../../../components/component/ChatBot/DifyChatBot'
import { useAuth } from '../../../contexts/AuthContext'

function NoteListContent() {
  const { user } = useAuth()
  const firebase_uid = user?.uid
  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id')
  const [playerName, setPlayerName] = useState<string>('選手')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noteList, setNoteList] = useState<NoteListItem[] | null>(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 3
  const canGoBack = page > 1

  useEffect(() => {
    const fetchNoteList = async () => {
      if (!userId) {
        setError('ユーザーIDが指定されていません')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        // プロフィール情報の取得
        try {
          const profileData = await profileApi.getPlayerNameByUserId(userId)
          if (profileData && profileData.name) {
            setPlayerName(profileData.name)
          }
        } catch (profileError) {
          console.error('プロフィール情報の取得に失敗しました', profileError)
          // プロフィール取得失敗時もノート一覧は表示するため、エラーはスローしない
        }

        const noteListData = await noteApi.getNotesByUserId(userId)
        setNoteList(noteListData.items)
        setError(null)
      } catch (error: any) {
        console.error('ノート一覧の取得に失敗しました', error)
        if (error.response && error.response.status === 404) {
          setNoteList([]) // 404の場合は空の配列を設定
        } else {
          setError(error.message || 'ノート一覧の取得に失敗しました')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchNoteList()
  }, [userId])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (e) {
      console.error('日付変換エラー:', e)
      return dateString || ''
    }
  }

  const displayedNotes = noteList?.slice(0, page * ITEMS_PER_PAGE) || []

  const hasMore = (noteList?.length || 0) > page * ITEMS_PER_PAGE

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  const goBack = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1)
    }
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="coach">ホーム画面</Header>
          <p className="px-6 py-4 mt-10 text-center text-xl text-red-600">{error}</p>

          <main className="flex-grow container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <PageTitle>{`${playerName}のノート一覧`}</PageTitle>
              <div className="text-right px-5 py-2">
                <p className="text-2xl mt-3">指導者</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-100 bg-opacity-80 border border-b-2 border-gray-300">
                  <tr>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">日付</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">本日のテーマ</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">課題</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">ノート詳細</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                        読み込み中...
                      </td>
                    </tr>
                  ) : displayedNotes.length > 0 ? (
                    displayedNotes.map((note: any) => (
                      <tr key={note.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(note.created_at)}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          <div className="truncate mx-auto">{note.theme}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          <div className="truncate mx-auto" title={note.assignment || ''}>
                            {note.assignment || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <LinkButtons href={`/Coach/NoteDetail?note_id=${note.id}`} width="100px" className="text-md">
                            詳細
                          </LinkButtons>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                        ノートが見つかりません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-center pt-10 gap-10">
                {canGoBack && (
                  <Buttons width="130px" onClick={goBack}>
                    ←前のページ
                  </Buttons>
                )}
                {hasMore && (
                  <Buttons width="130px" onClick={loadMore}>
                    さらに表示→
                  </Buttons>
                )}
              </div>
            </Card>
          </main>
          <Footer />
          <div className="fixed right-3 top-28 z-50">
            <DifyChatBot firebase_uid={firebase_uid} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// 🔄 変更点7: Suspenseラッパーコンポーネント
const NoteList = () => {
  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <NoteListContent />
      </Suspense>
    </ProtectedRoute>
  )
}

export default NoteList
