'use client'

import React, { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { Header } from '../../../components/component/Header/Header'
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { CreateProfileRequest, DominantHand, Position } from '../../../types/profile'
import { profileApi } from '../../../api/client/profile/profileApi'
import Image from 'next/image'
import { validateImage, validateProfile, ProfilleValidationErrors } from '../../validation/useFormValidation'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { AccountRole } from '../../../types/account'

const CreateProfile = () => {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<true | null>(null)
  const [deleteImage, setDeleteImage] = useState<boolean>(false)
  const [formData, setFormData] = useState<CreateProfileRequest>({
    firebase_uid: user?.uid || '', // Firebaseのユーザーuid
    name: '',
    birthday: new Date(),
    team_name: '',
    player_dominant: DominantHand.RIGHT_RIGHT,
    player_position: Position.PITCHER,
    admired_player: '',
    introduction: '',
    image: null,
  })
  const [validateError, setValidateError] = useState<ProfilleValidationErrors>({})
  const [error, setError] = useState<string | null>(null)

  //この型定義で3種類のHTML要素からの変更イベントを処理できる
  // イベントオブジェクト e から name, value, type を抽出
  // 入力変更ハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    // 入力フィールド変更時に対応するエラーをクリア
    setValidateError((prev) => ({
      ...prev,
      [name]: null,
    }))
    if (name === 'birthday' && type === 'date') {
      setFormData((prev) => ({
        ...prev, //更新される前の値
        [name]: new Date(value), //HTML の date 入力フィールドは "YYYY-MM-DD" 形式の文字列を返すので、Date型に変換する
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    // プロフィールデータのバリデーション
    const validationErrors = validateProfile(formData)
    // 画像バリデーション
    const imageError = validateImage(formData.image)
    if (imageError) {
      validationErrors.image = imageError
    }
    // エラーがある場合は処理を中止
    if (Object.keys(validationErrors).length > 0) {
      setValidateError(validationErrors)
      setError('入力内容に誤りがあります。各項目を確認してください。')
      return
    }

    if (!formData.firebase_uid) {
      setError('ログインが必要です。再度ログインしてください。')
      return
    }

    // ここでUUID形式として有効になっているかについての検証
    if (!formData.firebase_uid || !/^[A-Za-z0-9]{28}$/.test(formData.firebase_uid)) {
      console.error('無効なFirebase UID形式:', formData.firebase_uid)
      setError('ユーザーIDの形式が正しくありません。再度ログインしてください。')
      return
    }
    const birthdayValue =
      formData.birthday instanceof Date ? formData.birthday.toISOString().split('T')[0] : formData.birthday
    const dataToSubmit = {
      ...formData,
      birthday: birthdayValue,
      image: formData.image || null,
    }
    // リクエストする型定義に問題がなければリクエストを開始
    try {
      await profileApi.create(dataToSubmit, dataToSubmit.firebase_uid)
      alert('プロフィール作成が成功しました')
      setIsCompleted(true)
    } catch (error: any) {
      // エラーメッセージを設定する処理
      console.error('エラー：', error)
      setError('プロフィール作成に失敗しました。入力内容を確認してください。')
    }
  }
  //このコードで作成された fileInputRef は、オブジェクトであり、
  // その current プロパティを通して実際の DOM 要素（今回の場合は input 要素）にアクセスします。　ref={fileInputRef}
  //見えないファイル入力欄に対して「クリック」イベントを発生させ、ブラウザのファイル選択ダイアログを開きます。
  const handleImageSelect = () => {
    // 画面上のファイル選択入力欄を参照するための変数
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    // 画像関連のエラーをクリア
    setValidateError((prev) => ({
      ...prev,
      image: null,
    }))
    if (files && files.length > 0) {
      //files の中に少なくとも1つのファイルがある
      const file = files[0]
      const imageError = validateImage(file)
      if (imageError) {
        setValidateError((prev) => ({ ...prev, image: imageError }))
        return
      }
      // フォームデータ更新
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
      // プレビュー用のURLを作成
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
    }
  }

  const handleDeleteImage = () => {
    if (window.confirm('プロフィールを削除しますか？')) {
      setDeleteImage(true)
      setImagePreview(null)
      const fileInput = document.getElementById('profileImageInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  // instanceof を使って、Dateであった場合に文字列に変換
  const formatDateForInput = (dateValue: Date | string): string => {
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0]
    }
    return String(dateValue)
  }
  return (
    <ProtectedRoute requiredRole={AccountRole.PLAYER} authRequired={true}>
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Header role="player">ホーム画面</Header>

          <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
            <Card>
              <PageTitle>プロフィール登録</PageTitle>
              {isCompleted ? (
                <div className="max-w-4xl mx-auto p-8 text-center">
                  <h2 className="text-2xl mb-6">プロフィール作成が完了致しました</h2>
                  <p className="mb-8">次にどちらに進みますか</p>
                  <div className="flex justify-center space-x-4">
                    <LinkButtons href="/Player/ProfileDetail">プロフィール詳細画面をみる</LinkButtons>
                    <LinkButtons href="/Player/Home">ホームに戻る</LinkButtons>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="max-w-4xl mx-auto p-8">
                    <div className="text-right pb-1 pr-5 mr-5">
                      <p className="text-3xl mt-3 mb-3">選手</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-20">
                      {/* 写真 */}
                      <div className="flex flex-col items-center mb-8">
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="プロフィール画像"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg" //これはSVG名前空間を定義します。ブラウザにこの要素がSVG形式であることを伝える
                              className="h-12 w-12 text-gray-400"
                              fill="none" //SVGの塗りつぶしを無しに設定（透明）このアイコンはアウトラインのみで描画
                              viewBox="0 0 24 24" //SVGの座標システムを定義
                              stroke="currentColor" //アイコンの線（ストローク）の色を、text-gray-400で設定した現在のテキスト色（薄いグレー）にする
                            >
                              <path
                                strokeLinecap="round" //線の端を丸くする
                                strokeLinejoin="round" //線の接続部分を丸くする
                                strokeWidth={2} //線の太さを2に設定
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" //アイコンの形状を定義
                              />{' '}
                              {/*M16 7a4 4 0 11-8 0 4 4 0 018 0z - 頭の円形部分（人の頭）M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z - 体の部分（人の上半身） */}
                            </svg>
                          )}
                        </div>
                        <input
                          type="file" //type="file": このタイプの input 要素は、ブラウザのファイル選択ダイアログを開く機能を持っています
                          ref={fileInputRef}
                          accept="image/*" //選択できるファイルを画像ファイルのみに制限
                          onChange={handleImageChange}
                          className="hidden"
                          id="profileImageInput"
                        />
                        <div className="flex flex-justify-center space-x-3">
                          <Buttons width="120px" type="button" onClick={handleImageSelect}>
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
                        <FullInput name="name" value={formData.name} onChange={handleChange} />
                        {validateError.name && <p className="text-red-500 text-sm">{validateError.name}</p>}
                        {/*ここでのnameとはkeyのこと */}
                      </div>

                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          生年月日：
                          <RequiredBadge />
                        </Label>
                        <FullInput
                          name="birthday" //ユーザーが日付を入力すると → 文字列形式 "YYYY-MM-DD" が入力される
                          type="date"
                          value={formatDateForInput(formData.birthday)} //画面に表示する際はormatDateForInput で再びHTML inputが理解できる文字列形式に変換
                          onChange={handleChange} //handleChange 関数がそれを Date オブジェクトに変換し formData に保存
                        />
                        {validateError.birthday && <p className="text-red-500 text-sm">{validateError.birthday}</p>}
                      </div>

                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          チーム名：
                          <RequiredBadge />
                        </Label>
                        <FullInput name="team_name" value={formData.team_name} onChange={handleChange} />
                        {validateError.team_name && <p className="text-red-500 text-sm">{validateError.team_name}</p>}
                      </div>

                      <div className="space-y-2 my-3 py-3">
                        <Label>
                          利き手：
                          <RequiredBadge />
                        </Label>
                        <select
                          name="player_dominant"
                          value={formData.player_dominant}
                          onChange={handleChange}
                          className="w-full p-2 border-2 border-black bg-white"
                        >
                          {Object.entries(DominantHand).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value}
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
                          name="player_position"
                          value={formData.player_position}
                          onChange={handleChange}
                          className="w-full p-2 border-2 border-black bg-white"
                        >
                          {/* Object.entries JavaScript の標準メソッド。オブジェクトの列挙可能なプロパティの [key, value] ペアの配列を返します */}
                          {Object.entries(Position).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value}
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
                        <FullInput name="admired_player" value={formData.admired_player} onChange={handleChange} />
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
                          name="introduction"
                          type="textarea"
                          height="300px"
                          value={formData.introduction}
                          onChange={handleChange}
                        />
                        {validateError.introduction && (
                          <p className="text-red-500 text-sm">{validateError.introduction}</p>
                        )}
                      </div>
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                          {error}
                        </div>
                      )}
                      <div className="text-center mt-6">
                        <Buttons type="submit" fontSize="xl">
                          登録
                        </Buttons>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </Card>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default CreateProfile
