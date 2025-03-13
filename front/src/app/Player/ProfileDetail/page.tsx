'use client'

import React, { useEffect, useState } from 'react'

import { Header } from '../../../components/component/Header/Header'
import { Footer } from '../../../components/component/Footer/Footer'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { InfoItem } from '../../../components/component/InfoItem/InfoItem'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { ProfileResponse } from '../../../components/component/type/profile'
import { profileApi } from '../../../api/client/profile'
import { LinkButton } from '../../../components/component/Button/LoginPageButton'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import AlertMessage from '../../../components/component/Alert/AlertMessage'

const ProfileDetail = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [alert, setAlert] = useState({
    status: 'success' as 'success' | 'error',
    message: '',
    isVisible: false,
  })

  // URLパラメータを取得
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  //現在、ログイン機能を作成していないので現在はこちらのダミーデータを使用して進めております
  const userId = '8ec182db-d09c-44d1-a6e9-cfbe1581896b'

  useEffect(() => {
    if (success === 'true') {
      const action = searchParams.get('action')
      const message = action === 'edit' ? 'プロフィールの編集が成功しました!!' : 'プロフィール作成に成功しました!!'

      setAlert({
        status: 'success',
        message: message,
        isVisible: true,
      })

      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, isVisible: false }))
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [success, searchParams])

  useEffect(() => {
    const fetchProfile = async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        console.error('無効なUUID形式:', userId)
        throw new Error('ユーザーIDの形式が正しくありません')
      }
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
    fetchProfile()
  }, [userId])

  const formatBirthday = (dateString: string | undefined) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header href="/Player/Home">ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="pt-5">
              <PageTitle>プロフィール詳細</PageTitle>
            </div>
            <div className="max-w-4xl mx-auto p-8 flex justify-center">
              <p className="text-xl">読み込み中...</p>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header href="/Player/Home">ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="pt-5">
              <PageTitle>プロフィール詳細</PageTitle>
            </div>
            <div className="max-w-4xl mx-auto p-8">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              <div className="text-center mt-4">
                <LinkButton href="/Player/Home">ホームに戻る</LinkButton>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header role="player">ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <div className="pt-5">
              <PageTitle>プロフィール詳細</PageTitle>
            </div>
            <div className="max-w-4xl mx-auto p-8">
              <p className="mb-4">プロフィールが登録されていません</p>
              <LinkButton href="/Player/CreateProfile">プロフィールを作成する</LinkButton>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header>ホーム画面</Header>

      <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
        <Card>
          <div className="pt-5">
            <PageTitle>プロフィール詳細</PageTitle>
          </div>
          {/* アラートメッセージを追加 */}
          <div className="max-w-4xl mx-auto">
            <AlertMessage status={alert.status} message={alert.message} isVisible={alert.isVisible} />
          </div>
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
                {profile.image_path ? (
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${profile.image_path}`}
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
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default ProfileDetail
