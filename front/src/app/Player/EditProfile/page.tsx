'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Header } from '../../../components/component/Header/Header'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { profileApi } from '@/api/client/profile'
import { DominantHand, Position, ProfileResponse } from '@/components/component/type/profile'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const EditProfile = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [name, setName] = useState<string>('')
  const [birthday, setBirthday] = useState<string>('')
  const [teamName, setTeamName] = useState<string>('')
  const [playerDominant, setPlayerDominant] = useState<string>('')
  const [playerPosition, setPlayerPosition] = useState<string>('')
  const [admiredPlayer, setAdmiredPlayer] = useState<string | null>(null)
  const [introduction, setIntroduction] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const userId = '8ec182db-d09c-44d1-a6e9-cfbe1581896b'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await profileApi.get(userId)
        setProfile(data)

        setName(data.name)
        setTeamName(data.team_name)

        if (data.birthday) {
          const dateObj = new Date(data.birthday)
          const formattedDate = dateObj.toISOString().split('T')[0]
          setBirthday(formattedDate)
        }

        setPlayerDominant(data.player_dominant)
        setPlayerPosition(data.player_position)
        setAdmiredPlayer(data.admired_player)
        setIntroduction(data.introduction)

        if (data.image_path) {
          setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${data.image_path}`)
        }

        setError(null)
      } catch (error: any) {
        console.error('プロフィール取得エラー', error)
        setError(error.message || 'プロフィール取得に失敗しました。')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImage(file)

      const reader = new FileReader()

      //onloadendはファイル読み込みが完了したときに実行される関数
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    // nameが空または空白のみの場合　trim()で空の場合もerrorにする
    if (!name.trim()) {
      setError('名前を入力してください')
      return
    }
    if (!birthday) {
      setError('生年月日を入力してください')
      return
    }
    if (!teamName.trim()) {
      setError('生年月日を入力してください')
      return
    }
    if (!playerDominant) {
      setError('生年月日を入力してください')
      return
    }
    if (!playerPosition) {
      setError('生年月日を入力してください')
      return
    }

    try {
      setSubmitting(true) //送信中ということを表せている

      if (!profile) {
        throw new Error('プロフィールデータを取得できていません')
      }

      await profileApi.update(profile.id, {
        name: name,
        team_name: teamName,
        birthday: new Date(birthday),
        player_dominant: playerDominant as DominantHand,
        player_position: playerPosition as Position,
        admired_player: admiredPlayer ?? undefined,
        introduction: introduction ?? undefined,
        image: image,
      })
      router.push('/Player/ProfileDetail')
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      setError('プロフィール更新に失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="player">ホーム画面</Header>
          <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <PageTitle>プロフィール編集</PageTitle>
              <div className="max-w-4xl mx-auto p-8 flex justify-center">
                <p className="text-xl">読み込み中...</p>
              </div>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header>ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>プロフィール編集</PageTitle>
            <div className="max-w-4xl mx-auto p-8">
              <div className="max-w-4xl mx-auto p-8">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                )}
              </div>
              <div className="text-right pr-5 mr-5">
                <p className="text-2xl mt-3 pb-2">選手</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-20">
                {/* 写真 */}
                <div className="flex flex-col items-center mb-8">
                  <div
                    className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
                    onClick={handleImageClick}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="プロフィール画像"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400"
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
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Buttons width="100px" onClick={handleImageClick}>
                    写真を選ぶ
                  </Buttons>
                </div>

                <div className="space-y-2 mb-3">
                  <Label>
                    名前：
                    <RequiredBadge />
                  </Label>
                  <FullInput value={name} onChange={(e) => setName(e.target.value)}></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    生年月日：
                    <RequiredBadge />
                  </Label>
                  <FullInput type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    チーム名：
                    <RequiredBadge />
                  </Label>
                  <FullInput value={teamName} onChange={(e) => setTeamName(e.target.value)}></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    利き手：
                    <RequiredBadge />
                  </Label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={playerDominant}
                    onChange={(e) => setPlayerDominant(e.target.value)}
                  >
                    {Object.values(DominantHand).map((dominant) => (
                      <option key={dominant} value={dominant}>
                        {dominant}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    ポジション：
                    <RequiredBadge />
                  </Label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={playerPosition}
                    onChange={(e) => setPlayerPosition(e.target.value)}
                  >
                    {Object.values(Position).map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    憧れの選手：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput
                    value={admiredPlayer ?? undefined}
                    onChange={(e) => setAdmiredPlayer(e.target.value)}
                  ></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    自己紹介：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput
                    type="textarea"
                    height="300px"
                    value={introduction ?? undefined}
                    onChange={(e) => setIntroduction(e.target.value)}
                  ></FullInput>
                </div>
                <div className="text-center space-x-6 mt-5 pt-5">
                  <LinkButtons href="/Player/ProfileDetail" className="text-lg">
                    プロフィール詳細画面に戻る
                  </LinkButtons>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`px-3 py-2.5 rounded-md text-lg ${
                      submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {submitting ? '更新中...' : '決定'}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default EditProfile
