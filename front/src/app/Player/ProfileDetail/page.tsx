'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { ProfileResponse } from '../../../types/profile'
import { profileApi } from '../../../api/client/profile/profileApi'
import { LinkButton } from '../../../components/component/Button/LoginPageButton'
import Image from 'next/image'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'

const ProfileDetail = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userId = user?.uid || ''

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await profileApi.get(userId)
        setProfile(data)
        setError(null)
      } catch (error: any) {
        console.error('プロフィール取得エラー：', error)
        setError(error.message || 'プロフィール取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const formatBirthday = (dateString: string | undefined) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="min-h-screen bg-white">
        <Header>ホーム画面</Header>

        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="pt-5">
              <PageTitle>プロフィール詳細</PageTitle>
            </div>
            {loading ? (
              <div className="max-w-4xl mx-auto p-8 flex justify-center">
                <p className="text-xl">読み込み中...</p>
              </div>
            ) : error ? (
              <div className="max-w-4xl mx-auto p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                <div className="text-center mt-4">
                  <LinkButton href="/Player/Home">ホームに戻る</LinkButton>
                </div>
              </div>
            ) : !profile ? (
              <div className="max-w-4xl mx-auto p-8">
                <p className="mb-4">プロフィールが登録されていません</p>
                <LinkButton href="/Player/CreateProfile">プロフィールを作成する</LinkButton>
              </div>
            ) : (
              <>
                {/* カード内 */}
                <div className="max-w-4xl mx-auto p-8">
                  <div className="text-right pb-1 pr-8 mr-8">
                    <p className="text-2xl">選手</p>
                  </div>
                  <div className="max-w-3xl bg-gray-100 mx-auto rounded-lg shadow p-8">
                    {/* ボタン */}
                    <div className="flex justify-end mb-6">
                      <LinkButtons href="/Player/EditProfile">編集</LinkButtons>
                    </div>
                    {/* プロフィールとメイン情報 */}
                    <div className="flex flex-col items-center mb-8">
                      {profile.image_url ? (
                        <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
                          <Image
                            src={profile.image_url}
                            alt="プロフィール画像"
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                      {/* 文字列で返ってくるのでDate型に変換する */}
                      <p className="text-gray-600">{formatBirthday(profile.birthday)}</p>
                    </div>
                    {/* プロフィール内容 */}
                    <div className="space-y-4">
                      <InfoItem label="ノート作成日時：" value={formatBirthday(profile.created_at)} type="text" />
                      <InfoItem label="生年月日：" value={formatBirthday(profile.birthday)} type="text" />
                      <InfoItem label="チーム名：" value={profile.team_name} type="text" />
                      <InfoItem label="利き手：" value={profile.player_dominant} type="text" />
                      <InfoItem label="ポジション：" value={profile.player_position} type="text" />
                      <InfoItem label="憧れの選手：" value={profile.admired_player || '-'} type="text" />
                      <InfoItem label="自己紹介：" value={profile.introduction || '-'} type="text" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default ProfileDetail
