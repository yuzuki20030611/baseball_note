'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Header } from '../../../components/component/Header/Header '
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { useRouter } from 'next/navigation'
import { CreateProfileRequest, DominantHand, Position } from '../../../components/component/type/profile'
import { profileApi } from '../../../api/client/profile'

const CreateProfile = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProfileRequest>({
    user_id: '8ec182db-d09c-44d1-a6e9-cfbe1581896b',
    name: '',
    birthday: new Date(),
    team_name: '',
    player_dominant: DominantHand.RIGHT_RIGHT,
    player_position: Position.PITCHER,
    admired_player: '',
    introduction: '',
  })
  // instanceof を使って、Dateであった場合に文字列に変換
  const formatDateForInput = (dateValue: Date | string): string => {
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0]
    }
    return String(dateValue)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    console.log('送信直前のフォームデータ:', formData)
    console.log('player_dominant型:', typeof formData.player_dominant)
    console.log('player_position型:', typeof formData.player_position)

    // ここでUUID形式として有効になっているかについての検証
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(formData.user_id)) {
      console.error('無効なUUID形式:', formData.user_id)
      throw new Error('ユーザーIDの形式が正しくありません')
    }

    const birthdayValue =
      formData.birthday instanceof Date ? formData.birthday.toISOString().split('T')[0] : formData.birthday

    const dataToSubmit = {
      ...formData,
      birthday: birthdayValue,
    }

    console.log('最終送信データ:', dataToSubmit)

    // リクエストする型定義に問題がなければリクエストを開始
    try {
      await profileApi.create(dataToSubmit, dataToSubmit.user_id)
      router.push('/Player/Home')
    } catch (error: any) {
      // エラーメッセージを設定する処理
      console.error('エラー：', error)
      setError('プロフィール作成に失敗しました。入力内容を確認してください。')
    }
  }
  //この型定義で3種類のHTML要素からの変更イベントを処理できる
  // イベントオブジェクト e から name, value, type を抽出
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (name === 'birthday' && type === 'date') {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header>ホーム画面</Header>

        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>プロフィール登録</PageTitle>
            {/* エラーメッセージの表示部分 */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="max-w-4xl mx-auto p-8">
                <div className="text-right pb-1 pr-5 mr-5">
                  <p className="text-2xl">選手</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-20">
                  {/* 写真 */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4"></div>
                    <Buttons width="100px" type="button">
                      写真を選ぶ
                    </Buttons>
                  </div>

                  <div className="space-y-2 mb-3">
                    <Label>
                      名前：
                      <RequiredBadge />
                    </Label>
                    <FullInput name="name" value={formData.name} onChange={handleChange}></FullInput>
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      生年月日：
                      <RequiredBadge />
                    </Label>
                    <FullInput
                      name="birthday"
                      type="date"
                      value={formatDateForInput(formData.birthday)} //Dateの値を文字列に変換
                      onChange={handleChange}
                    ></FullInput>
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      チーム名：
                      <RequiredBadge />
                    </Label>
                    <FullInput name="team_name" value={formData.team_name} onChange={handleChange}></FullInput>
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
                  </div>
                  <div className="space-y-2 my-3 py-3">
                    <Label>
                      憧れの選手：
                      <RequiredBadge variant="optional" />
                    </Label>
                    <FullInput
                      name="admired_player"
                      value={formData.admired_player}
                      onChange={handleChange}
                    ></FullInput>
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
                    ></FullInput>
                  </div>
                  <div className="text-center mt-6">
                    <Buttons type="submit" fontSize="xl">
                      登録
                    </Buttons>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default CreateProfile
