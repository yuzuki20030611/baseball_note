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

import { profileApi } from '../../../api/client/profile/profileApi'
import { DominantHand, Position, ProfileResponse } from '../../../types/profile'
import Image from 'next/image'
import AlertMessage from '../../../components/component/Alert/AlertMessage'
import { validateImage, validateProfile, ValidationErrors } from '../../validation/useFormValidation'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const EditProfile = () => {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validateError, setValidateError] = useState<ValidationErrors>({})
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
  const [isCompleted, setIsCompleted] = useState<null | true>(null)
  const [alert, setAlert] = useState({
    status: 'success' as 'success' | 'error',
    message: '',
    isVisible: false,
  })

  const userId = user?.uid || ''

  // 未認証時のリダイレクト処理
  useEffect(() => {
    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user && !loading) {
      router.push('/Login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // ユーザーIDが取得できるまで待機
    if (!userId) return

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
    // 画像のエラーをクリア
    setValidateError((prev) => ({
      ...prev,
      image: undefined,
    }))
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageError = validateImage(file)
      if (imageError) {
        setValidateError((prev) => ({
          ...prev,
          image: imageError,
        }))
        return
      }
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
    // フォームデータを収集
    const formData = {
      name,
      birthday: new Date(birthday),
      team_name: teamName,
      player_dominant: playerDominant as DominantHand,
      player_position: playerPosition as Position,
      admired_player: admiredPlayer || '',
      introduction: introduction || '',
      image,
      // validateProfileの型に合わせるためにuser_idを追加
      user_id: userId,
    }
    const validationErrors = validateProfile(formData)
    if (image) {
      const imageError = validateImage(image)
      if (imageError) {
        validationErrors.image = imageError
      }
    }
    // エラーがある場合は処理を中止
    if (Object.keys(validationErrors).length > 0) {
      setValidateError(validationErrors)
      setError('入力内容に誤りがあります。各項目を確認してください')
      setAlert({ status: 'error', message: '入力内容に誤りがあります。再度確認してください', isVisible: true })
      return
    }
    // エラーがなければ送信
    try {
      setSubmitting(true) //送信中ということを表せている
      setError(null)
      setValidateError({})
      setAlert({ status: 'success', message: '', isVisible: false })
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
      setAlert({
        status: 'success',
        message: 'プロフィール編集に成功しました。',
        isVisible: true,
      })
      setTimeout(() => {
        setIsCompleted(true)
      }, 3000)
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      setError('プロフィール更新に失敗しました。')
      setAlert({ status: 'error', message: 'プロフィールの編集が失敗しました', isVisible: true })
    } finally {
      setSubmitting(false)
    }
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setName(e.target.value)
    setValidateError((prev) => ({ ...prev, name: undefined }))
  }
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBirthday(e.target.value)
    setValidateError((prev) => ({ ...prev, birthday: undefined }))
  }
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTeamName(e.target.value)
    setValidateError((prev) => ({ ...prev, team_name: undefined }))
  }
  const handlePlayerDominantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPlayerDominant(e.target.value)
    setValidateError((prev) => ({ ...prev, player_dominant: undefined }))
  }
  const handlePlayerPositionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPlayerPosition(e.target.value)
    setValidateError((prev) => ({ ...prev, player_position: undefined }))
  }
  const handleAdmiredPlayerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setAdmiredPlayer(e.target.value)
    setValidateError((prev) => ({ ...prev, admired_player: undefined }))
  }
  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setIntroduction(e.target.value)
    setValidateError((prev) => ({ ...prev, introduction: undefined }))
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
            {isCompleted ? (
              <div className="max-w-4xl mx-auto p-8 text-center">
                <h2 className="text-2xl mb-6">プロフィール編集が完了致しました</h2>
                <p className="mb-8">次にどちらに進みますか</p>
                <div className="flex justify-center space-x-4">
                  <LinkButtons href="/Player/ProfileDetail">プロフィール詳細画面をみる</LinkButtons>
                  <LinkButtons href="/Player/Home">ホームに戻る</LinkButtons>
                </div>
              </div>
            ) : (
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
                    {validateError.image && <p className="text-red-500 text-sm mt-1">{validateError.image}</p>}
                  </div>

                  <div className="space-y-2 mb-3">
                    <Label>
                      名前：
                      <RequiredBadge />
                    </Label>
                    <FullInput value={name} onChange={handleNameChange} />
                    {validateError.name && <p className="text-red-500 text-sm">{validateError.name}</p>}
                  </div>

                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      生年月日：
                      <RequiredBadge />
                    </Label>
                    <FullInput type="date" value={birthday} onChange={handleBirthdayChange} />
                    {validateError.birthday && <p className="text-red-500 text-sm">{validateError.birthday}</p>}
                  </div>

                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      チーム名：
                      <RequiredBadge />
                    </Label>
                    <FullInput value={teamName} onChange={handleTeamNameChange} />
                    {validateError.team_name && <p className="text-red-500 text-sm">{validateError.team_name}</p>}
                  </div>

                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      利き手：
                      <RequiredBadge />
                    </Label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      value={playerDominant}
                      onChange={handlePlayerDominantChange}
                    >
                      {Object.values(DominantHand).map((dominant) => (
                        <option key={dominant} value={dominant}>
                          {dominant}
                        </option>
                      ))}
                    </select>
                    {validateError.player_dominant && (
                      <p className="text-red-500 text-sm">{validateError.player_dominant}</p>
                    )}
                  </div>

                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      ポジション：
                      <RequiredBadge />
                    </Label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      value={playerPosition}
                      onChange={handlePlayerPositionChange}
                    >
                      {Object.values(Position).map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                    {validateError.player_position && (
                      <p className="text-red-500 text-sm">{validateError.player_position}</p>
                    )}
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      憧れの選手：
                      <RequiredBadge variant="optional" />
                    </Label>
                    <FullInput value={admiredPlayer ?? undefined} onChange={handleAdmiredPlayerChange} />
                    {validateError.admired_player && (
                      <p className="text-red-500 text-sm">{validateError.admired_player}</p>
                    )}
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
                      onChange={handleIntroductionChange}
                    />
                    {validateError.introduction && <p className="text-red-500 text-sm">{validateError.introduction}</p>}
                  </div>

                  <AlertMessage status={alert.status} message={alert.message} isVisible={alert.isVisible} />

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
            )}
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default EditProfile
