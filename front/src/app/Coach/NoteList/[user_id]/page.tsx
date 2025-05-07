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
import { NoteListItem } from '../../../../types/note'
import { noteApi } from '../../../../api/Note/NoteApi'

const NoteList = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params.user_id ? String(params.user_id) : null
  const playerName = searchParams.get('name') || '選手'

  console.log('NoteList Params:', {
    userId,
    playerName,
    params,
    paramsType: typeof params,
    userIdType: typeof userId,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noteList, setNoteList] = useState<NoteListItem[] | null>(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 3
  const canGoBack = page > 1

  useEffect(() => {
    const fetchNoteList = async () => {
      if (!userId) {
        setError('ユーザーIDが存在しないです')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
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
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[20%]" /> {/* 日付 - 幅を増やす */}
                  <col className="w-[35%]" /> {/* 本日のテーマ - 幅を増やす */}
                  <col className="w-[35%]" /> {/* 課題 - 幅を増やす */}
                  <col className="w-[10%]" /> {/* 詳細 */}
                </colgroup>
                <thead className="bg-gray-100 border-b-2 border-gray-200">
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
                          <div className="truncate mx-auto" title={note.theme}>
                            {note.theme}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          <div className="truncate mx-auto" title={note.assignment || ''}>
                            {note.assignment || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center w-[100px]">
                          <LinkButtons
                            href={`/Coach/NoteDetail/${note.id}?name=${encodeURIComponent(playerName)}`}
                            width="100px"
                            className="text-md"
                          >
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
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default NoteList
