import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
<<<<<<< HEAD
import { useRouter } from 'next/navigation'
import { CreateProfileRequest, DominantHand, Position } from '../../../components/component/type/profile'
import { profileApi } from '../../../api/client/profile'
import Image from 'next/image'
import AlertMessage from '../../../components/component/Alert/AlertMessage'
import { validateImage, validateProfile, ValidationErrors } from '../../../hooks/useFormValidation'

const CreateProfile = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateProfileRequest>({
    //現在、ログイン機能を作成していないので現在はこちらのダミーデータを使用して進めております
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

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)

  const [alert, setAlert] = useState({
    status: 'success' as 'success' | 'error',
    message: '',
    isVisible: false,
  })

  //この型定義で3種類のHTML要素からの変更イベントを処理できる
  // イベントオブジェクト e から name, value, type を抽出
  // 入力変更ハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    // 入力フィールド変更時に対応するエラーをクリア
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
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
    setAlert({ status: 'success', message: '', isVisible: false })

    // プロフィールデータのバリデーション
    const validationErrors = validateProfile(formData)

    // 画像バリデーション
    const imageError = validateImage(formData.image)
    if (imageError) {
      validationErrors.image = imageError
    }

    // エラーがある場合は処理を中止
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setError('入力内容に誤りがあります。各項目を確認してください。')
      setAlert({ status: 'error', message: '入力内容に誤りがあります', isVisible: true })
      return
    }

    // エラーがなければエラー状態をクリア
    setErrors({})

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
      image: formData.image || null,
    }

    console.log('最終送信データ:', dataToSubmit)

    // リクエストする型定義に問題がなければリクエストを開始
    try {
      await profileApi.create(dataToSubmit, dataToSubmit.user_id)
      router.push('/Player/ProfileDetail?success=true')
    } catch (error: any) {
      // エラーメッセージを設定する処理
      console.error('エラー：', error)
      setError('プロフィール作成に失敗しました。入力内容を確認してください。')
      setAlert({ status: 'error', message: 'プロフィール作成に失敗しました', isVisible: true })
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
    setErrors((prev) => ({
      ...prev,
      image: undefined,
    }))

    if (files && files.length > 0) {
      //files の中に少なくとも1つのファイルがある
      const file = files[0]

      const imageError = validateImage(file)
      if (imageError) {
        setErrors((prev) => ({ ...prev, image: imageError }))
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

  // instanceof を使って、Dateであった場合に文字列に変換
  const formatDateForInput = (dateValue: Date | string): string => {
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0]
    }
    return String(dateValue)
  }

=======
import { LinkButtons } from '../../../components/component/Button/LinkButtons'

const CreateProfile = () => {
>>>>>>> main
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header>ホーム画面</Header>

        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>プロフィール登録</PageTitle>
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-right pb-1 pr-5 mr-5">
                <p className="text-2xl">選手</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-20">
                {/* 写真 */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4"></div>
                  <Buttons width="100px">写真を選ぶ</Buttons>
                </div>

                <div className="space-y-2 mb-3">
                  <Label>
                    名前：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="名前"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    生年月日：
                    <RequiredBadge />
                  </Label>
                  <FullInput type="date" value="2003年6月11日"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    チーム名：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="斉美高校"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    利き手：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="右投げ・右打ち"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    ポジション：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="レフト"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    憧れの選手：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput value="大谷翔平"></FullInput>
                </div>
                <div className="space-y-2 my-3 py-3">
                  <Label>
                    自己紹介：
                    <RequiredBadge variant="optional" />
                  </Label>
                  <FullInput type="textarea" height="300px"></FullInput>
                </div>
                <div className="text-center mt-6">
                  <LinkButtons href="/Player/Home" className="text-xl">
                    登録
                  </LinkButtons>
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

export default CreateProfile
