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
import { useRouter } from 'next/navigation'
import { CreateProfileRequest, DominantHand, Position } from '../../../components/component/type/profile'
import { profileApi } from '../../../api/client/profile'
import Image from 'next/image'

const CreateProfile = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProfileRequest>({
    user_id: '8ec182db-d09c-44d1-a6e9-cfbe1581896b',
    name: '',
    birthday: new Date(),
    team_name: '',
    player_dominant: DominantHand.RIGHT_RIGHT,
    player_position: Position.PITCHER,
    admired_player: '',
    introduction: '',
    image: null,
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
    if (files && files.length > 0) {
      //files の中に少なくとも1つのファイルがある
      const file = files[0]

      //5MB以下のサイズに
      if (file.size > 5 * 1024 * 1024) {
        setError('画像サイズは5MB以下にしてください')
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください')
        return
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
      // プレビュー用のURLを作成
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header role="player">ホーム画面</Header>

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
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
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
                    />
                    <Buttons width="100px" type="button" onClick={handleImageSelect}>
                      写真を選ぶ
                    </Buttons>
                  </div>

                  <div className="space-y-2 mb-3">
                    <Label>
                      名前：
                      <RequiredBadge />
                    </Label>
                    <FullInput name="name" value={formData.name} onChange={handleChange}></FullInput>
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
