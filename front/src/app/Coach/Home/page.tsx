'use client'

import React, { useEffect, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { Buttons } from '../../../components/component/Button/Button'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { profileApi } from '../../../api/client/profile/profileApi'
import { useAuth } from '../../../contexts/AuthContext'
import { ProfileResponse } from '../../../types/profile'

const CoachHome = () => {
  const { user } = useAuth()
  const firebase_uid = user?.uid
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [hasPlayersData, setHasPlayersData] = useState<ProfileResponse[] | null>(null) //複数なのでリスト形式で取得する
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 3
  const canGoBack = page > 1

  useEffect(() => {
    const getPlayerList = async (firebase_uid: string) => {
      try {
        setLoading(true)
        setError(null)
        // ここで前プレイヤーのプロフィール情報を取得して取得した情報でリストを作成、開くボタンの遷移先でノートの情報をリストで表示させる
        const response = await profileApi.getAll(firebase_uid)
        // 配列であることを確認
        if (response && Array.isArray(response.items) && response.items.length > 0) {
          setHasPlayersData(response.items)
        }
      } catch (error: any) {
        console.error('全選手のプロフィール情報の取得に失敗しました', error)

        if (error.message && error.message.includes('プロフィールが存在')) {
          setHasPlayersData(null)
          setError('選手のプロフィールが存在しないです')
        } else {
          setError('全選手のプロフィール取得中にエラーが発生しました')
          setHasPlayersData(null)
        }
      } finally {
        setLoading(false)
      }
    }
    if (firebase_uid) {
      getPlayerList(firebase_uid)
    } else {
      console.error('firebase_uidが存在しないです')
    }
  }, [firebase_uid])

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  const goBack = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1)
    }
  }

  const displayPage = hasPlayersData ? hasPlayersData.slice(0, page * ITEMS_PER_PAGE) : []
  const hasMore = hasPlayersData ? hasPlayersData.length > page * ITEMS_PER_PAGE : false

  return (
    <ProtectedRoute requiredRole={AccountRole.COACH} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-grow container mx-auto p-6 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              {loading ? (
                <p className="text-2xl mt-3 text-center">ロード中...</p>
              ) : (
                <div>
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
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                            読み込み中...
                          </td>
                        </tr>
                      ) : displayPage.length > 0 ? (
                        displayPage.map((data, index) => (
                          <tr className="hover:bg-gray-50" key={index}>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{data.name}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{data.player_dominant}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{data.player_position}</td>
                            <td className="px-6 py-4 text-center">
                              <LinkButtons href={`/Coach/NoteList/${data.id}`}>開く⇨</LinkButtons>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-gray-50">
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                            {error || '選手データがありません'}
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
                </div>
              )}
            </Card>
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default CoachHome
