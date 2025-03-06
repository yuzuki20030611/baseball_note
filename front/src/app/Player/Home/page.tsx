'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { Buttons } from '../../../components/component/Button/Button'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { profileApi } from '../../../api/client/profile'

const PlayerHome = () => {
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  const userId = '8ec182db-d09c-44d1-a6e9-cfbe1581896b'

  //ホームページを開いたらまずここの処理が動く。
  //userIdでこちらのIdのプロフィール情報を取得する。
  //setHasProfile(!!profileData)でプロフィール情報が存在するかどうかの真偽を判定
  //存在する場合と存在しない場合を作成し、最終的にsetLoadingをfalseにする
  useEffect(() => {
    const checkProfile = async () => {
      try {
        setLoading(true)
        const profileData = await profileApi.get(userId)
        //プロフィールデータが入っているかいないかを真偽で決める
        setHasProfile(!!profileData)
      } catch (error) {
        setHasProfile(false)
      } finally {
        setLoading(false)
      }
    }
    checkProfile()
  }, [userId])

  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header>ログアウト</Header>
        <main className="flex-grow container mx-auto p-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="flex justify-between gap-1">
              <div className="space-x-4">
                <LinkButtons href="/Player/LoginDetail" className="w-100px">
                  ログイン情報
                </LinkButtons>
                {/* loadingがtrueの時はuseEffectが処理をしている最中です
                loadingがfalseになった場合, 次はhasProfleがtrueの場合とfalseの場合で分けて作成していく */}
                {loading ? (
                  <span className="inline-block w-130px"></span>
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
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2025-02-02</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">守備</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Player/NoteDetail" className="text-3xl">
                      📖⇨
                    </LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2025-02-02</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">バッティング</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">守備</td>
                  <td className="px-6 py-4 text-center">
                    <LinkButtons href="/Player/NoteDetail" className="text-3xl">
                      📖⇨
                    </LinkButtons>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2025-02-02</td>
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
