'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { Buttons } from '../../../components/component/Button/Button'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

import { profileApi } from '../../../api/client/profile/profileApi'

import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { useAuth } from '../../../contexts/AuthContext'
import { noteApi } from '../../../api/Note/NoteApi'
import { NoteListItem } from '../../../types/note'

const PlayerHome = () => {
  const { user } = useAuth()
  const [hasProfile, setHasProfile] = useState(false)
  const [notes, setNotes] = useState<NoteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 3
  const canGoBack = page > 1

  const firebase_uid = user?.uid || ''

  // プロフィール情報の取得
  useEffect(() => {
    const checkProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const profileData = await profileApi.get(firebase_uid)
        // プロフィールの存在チェックを改善
        if (profileData && profileData.id) {
          setHasProfile(true)
        } else {
          setHasProfile(false)
        }
      } catch (error: any) {
        console.error('プロフィール取得エラー:', error)

        // エラーの種類を確認
        if (error.response && error.response.status === 404) {
          setHasProfile(false)
        } else {
          // その他のエラー
          setHasProfile(false)
        }
      } finally {
        setLoading(false)
      }
    }
    checkProfile()
  }, [firebase_uid])

  // ノート一覧の取得
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (!firebase_uid) return

        setNotesLoading(true)
        const response = await noteApi.getUserNote(firebase_uid)

        // response.itemsが配列であることを確認
        if (response && response.items && Array.isArray(response.items)) {
          setNotes(response.items)
        } else {
          console.error('APIレスポンスの形式が不正です:', response)
          setNotes([])
        }
      } catch (error) {
        console.error('ノート取得エラー:', error)
        setError('ノート一覧の取得に失敗しました。')
        setNotes([])
      } finally {
        setNotesLoading(false)
      }
    }
    if (firebase_uid) {
      fetchNotes()
    }
  }, [firebase_uid])

  // ノート削除の関数
  const handleDelete = async (noteId: string) => {
    if (window.confirm('このノートを削除してもよろしいでしょうか？')) {
      try {
        setNotesLoading(true)
        await noteApi.deleteNote(noteId)
        // 削除したいノートと一致しないノートのみを残すように更新する
        setNotes(notes.filter((note) => note.id !== noteId))

        alert('削除に成功しました')
      } catch (error) {
        console.error('削除に失敗しました')
        setError('ノートの削除に失敗しました')
      } finally {
        setNotesLoading(false)
      }
    }
  }

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0] // YYYY-MM-DD形式
    } catch (e) {
      console.error('日付変換エラー:', e)
      return dateString || ''
    }
  }

  // さらに表示をクリックした時の処理
  const loadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  const goBack = () => {
    setPage((prevPage) => prevPage - 1)
  }

  // 表示するノートのリスト（取得したノートを何個表示するのかについての関数）
  const displayedNotes = notes.slice(0, page * ITEMS_PER_PAGE)
  // さらに表示ボタンを表示するか、しないかを決める変数
  const hasMore = notes.length > page * ITEMS_PER_PAGE

  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="player" />
          <p className="px-6 py-4 mt-10 text-center text-xl text-red-600">{error}</p>

          <main className="flex-grow container mx-auto p-6 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <div className="flex justify-between gap-1">
                <div className="space-x-4">
                  <LinkButtons href="/Player/LoginDetail" className="w-100px">
                    ログイン情報
                  </LinkButtons>
                  {/* プロフィール状態に応じてボタンを変更 */}
                  {loading ? (
                    <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded w-130px">
                      読み込み中...
                    </button>
                  ) : hasProfile ? (
                    <LinkButtons href="/Player/ProfileDetail" className="w-130px">
                      プロフィール詳細
                    </LinkButtons>
                  ) : (
                    <LinkButtons href="/Player/CreateProfile" className="w-130px">
                      プロフィール登録
                    </LinkButtons>
                  )}
                </div>
              </div>
              <PageTitle>野球ノート一覧</PageTitle>
              <div className="text-center">
                {loading ? null : !hasProfile ? (
                  <div className="bg-pink-100 border border-red-400 text-blue-5000 px-4 py-3 rounded relative mb-4">
                    最初にプロフィール登録を行なってください
                    <br />
                    プロフィール登録を完了しなければ、作成したノートを指導者が閲覧することができません
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col space-y-10 items-end mb-6 pr-20">
                <p className="text-3xl mt-3">選手</p>
                <LinkButtons href="/Player/CreateNote">新規作成</LinkButtons>
              </div>

              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[15%]" /> {/* 日付 */}
                  <col className="w-[30%]" /> {/* 本日のテーマ */}
                  <col className="w-[30%]" /> {/* 課題 */}
                  <col className="w-[12.5%]" /> {/* 詳細 */}
                  <col className="w-[12.5%]" /> {/* 削除 */}
                </colgroup>
                <thead className="bg-gray-100 bg-opacity-80 border border-b-2 border-gray-300">
                  <tr>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">日付</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">本日のテーマ</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">課題</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">ノート詳細</th>
                    <th className="px-1 py-3 text-center text-xl font-semibold text-gray-700">ノート削除</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notesLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                        読み込み中...
                      </td>
                    </tr>
                  ) : displayedNotes.length > 0 ? (
                    displayedNotes.map((note) => (
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
                          <LinkButtons href={`/Player/NoteDetail?id=${note.id}`} className="text-md">
                            詳細
                          </LinkButtons>
                        </td>
                        <td className="px-6 py-4 text-center w-[100px]">
                          <Buttons width={85} onClick={() => handleDelete(note.id)}>
                            削除
                          </Buttons>
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
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default PlayerHome
