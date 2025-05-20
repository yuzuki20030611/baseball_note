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
import { validateImage, validateProfile, ProfilleValidationErrors } from '../../validation/useFormValidation'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AccountRole } from '../../../types/account'
import ProtectedRoute from '../../../components/ProtectedRoute'

const EditProfile = () => {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validateError, setValidateError] = useState<ProfilleValidationErrors>({})
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
  const [deleteImage, setDeleteImage] = useState<boolean>(false)
  const firebase_uid = user?.uid || ''

  // 未認証時のリダイレクト処理
  useEffect(() => {
    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user && !loading) {
      router.push('/Login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // ユーザーIDが取得できるまで待機
    if (!firebase_uid) return

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await profileApi.get(firebase_uid)
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
        if (data.image_url) {
          setImagePreview(data.image_url)
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
  }, [firebase_uid])
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDeleteImage = () => {
    if (window.confirm('プロフィールを削除しますか？')) {
      setDeleteImage(true)
      setImagePreview(null)
      setImage(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 画像のエラーをクリア
    setValidateError((prev) => ({
      ...prev,
      image: null,
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
      firebase_uid: firebase_uid,
      birthday: new Date(birthday),
      team_name: teamName,
      player_dominant: playerDominant as DominantHand,
      player_position: playerPosition as Position,
      admired_player: admiredPlayer || '',
      introduction: introduction || '',
      image,
      delete_image: deleteImage,
      // validateProfileの型に合わせるためにuser_idを追加
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
      return
    }
    // エラーがなければ送信
    try {
      setSubmitting(true) //送信中ということを表せている
      setError(null)
      setValidateError({})
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
        delete_image: deleteImage,
      })
      alert('プロフィールの編集が成功しました')
      setIsCompleted(true)
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      setError('プロフィール更新に失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setName(e.target.value)
    setValidateError((prev) => ({ ...prev, name: null }))
  }
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBirthday(e.target.value)
    setValidateError((prev) => ({ ...prev, birthday: null }))
  }
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTeamName(e.target.value)
    setValidateError((prev) => ({ ...prev, team_name: null }))
  }
  const handlePlayerDominantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPlayerDominant(e.target.value)
    setValidateError((prev) => ({ ...prev, player_dominant: null }))
  }
  const handlePlayerPositionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPlayerPosition(e.target.value)
    setValidateError((prev) => ({ ...prev, player_position: null }))
  }
  const handleAdmiredPlayerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setAdmiredPlayer(e.target.value)
    setValidateError((prev) => ({ ...prev, admired_player: null }))
  }
  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setIntroduction(e.target.value)
    setValidateError((prev) => ({ ...prev, introduction: null }))
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
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
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
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
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                      </div>
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
                      <div className="flex flex-justify-center space-x-3">
                        <Buttons width="120px" onClick={handleImageClick}>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            写真を選ぶ
                          </span>
                        </Buttons>
                        {imagePreview && (
                          <Buttons width="90px" onClick={handleDeleteImage}>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              削除
                            </span>
                          </Buttons>
                        )}
                      </div>
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
                      {validateError.introduction && (
                        <p className="text-red-500 text-sm">{validateError.introduction}</p>
                      )}
                    </div>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                      </div>
                    )}

                    <div className="text-center space-x-6 mt-5 pt-5">
                      <LinkButtons href="/Player/ProfileDetail" className="text-lg">
                        プロフィール詳細画面に戻る
                      </LinkButtons>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`w-20 px-3 py-2.5 rounded-md text-lg ${
                          submitting
                            ? 'bg-gray-400 cursor-not-allowed w-40'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
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
    </ProtectedRoute>
  )
}

export default EditProfile
