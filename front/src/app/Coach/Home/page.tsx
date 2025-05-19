'use client'

import React, { useEffect, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'
import { profileApi } from '../../../api/client/profile/profileApi'
import { ProfileResponse } from '../../../types/profile'
import DifyChatBot from '../../../components/component/ChatBot/DifyChatBot'
import { useAuth } from '../../../contexts/AuthContext'

const CoachHome = () => {
  const { user } = useAuth()
  const firebase_uid = user?.uid
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [playersDataList, setPlayersDataList] = useState<ProfileResponse[]>([])

  useEffect(() => {
    const getPlayerList = async () => {
      try {
        setLoading(true)
        setError(null)
        // ここで前プレイヤーのプロフィール情報を取得して取得した情報でリストを作成、開くボタンの遷移先でノートの情報をリストで表示させる
        const response = await profileApi.getAll()
        // 配列であることを確認
        if (response && Array.isArray(response.items) && response.items.length > 0) {
          setPlayersDataList(response.items)
        } else {
          // 空のレスポンスの場合は正常だが空の配列
          setPlayersDataList([])
        }
      } catch (error: any) {
        console.error('ノート一覧の取得に失敗しました', error)
        if (error.response && error.response.status === 404) {
          setPlayersDataList([]) // 404の場合は空の配列を設定
          setError(null) // エラーメッセージをクリア
        } else {
          setError(error.message || 'ノート一覧の取得に失敗しました')
        }
      } finally {
        setLoading(false)
      }
    }
    getPlayerList()
  }, [])

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
                    <thead className="bg-gray-100 bg-opacity-80 border border-b-2 border-gray-300">
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
                      ) : playersDataList.length > 0 ? (
                        playersDataList.map((data, index) => (
                          <tr className="hover:bg-gray-50" key={index}>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{data.name}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{data.player_dominant}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{data.player_position}</td>
                            <td className="px-6 py-4 text-center">
                              <LinkButtons href={`/Coach/NoteList/${data.user_id}?`}>開く⇨</LinkButtons>
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
                </div>
              )}
            </Card>
          </main>
        </div>
        <Footer />
        <div className="fixed right-3 top-28 z-50">
          <DifyChatBot firebase_uid={firebase_uid} />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default CoachHome
