import React from 'react'

import { Header } from '../../../components/component/Header/Header '
import { PageTitle } from '../../../components/component/Title/PageTitle'
import { Buttons } from '../../../components/component/Button/Button'
import { Footer } from '../../../components/component/Footer/Footer'
import { Label } from '../../../components/component/Label/Label'
import { FullInput } from '../../../components/component/Input/FullInput'
import { RequiredBadge } from '../../../components/component/Label/RequiredBadge'
import { Card } from '../../../components/component/Card/Card'
import { LinkButtons } from '../../../components/component/Button/LinkButtons'
<<<<<<< HEAD
import { profileApi } from '../../../api/client/profile'
import { DominantHand, Position, ProfileResponse } from '../../../components/component/type/profile'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AlertMessage from '../../../components/component/Alert/AlertMessage'
import { validateImage, validateProfile, ValidationErrors } from '../../../hooks/useFormValidation'

const EditProfile = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

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

  const [alert, setAlert] = useState({
    status: 'success' as 'success' | 'error',
    message: '',
    isvVisible: false,
  })

  //現在、ログイン機能を作成していないので現在はこちらのダミーデータを使用して進めております
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
    // 画像のエラーをクリア
    setErrors((prev) => ({
      ...prev,
      image: undefined,
    }))

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      const imageError = validateImage(file)
      if (imageError) {
        setErrors((prev) => ({
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
      setErrors(validationErrors)
      setError('入力内容に誤りがあります。各項目を確認してください')
      setAlert({ status: 'error', message: '入力内容に誤りがあります。再度確認してください', isvVisible: true })
      return
    }

    // エラーがなければ送信
    try {
      setSubmitting(true) //送信中ということを表せている
      setError(null)
      setErrors({})
      setAlert({ status: 'success', message: '', isvVisible: false })

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

      router.push('/Player/ProfileDetail?success=true&action=edit')
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      setError('プロフィール更新に失敗しました。')
      setAlert({ status: 'error', message: 'プロフィールの編集が失敗しました', isvVisible: true })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setName(e.target.value)
    setErrors((prev) => ({ ...prev, name: undefined }))
  }

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBirthday(e.target.value)
    setErrors((prev) => ({ ...prev, birthday: undefined }))
  }

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTeamName(e.target.value)
    setErrors((prev) => ({ ...prev, team_name: undefined }))
  }

  const handlePlayerDominantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPlayerDominant(e.target.value)
    setErrors((prev) => ({ ...prev, player_dominant: undefined }))
  }

  const handlePlayerPositionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPlayerPosition(e.target.value)
    setErrors((prev) => ({ ...prev, player_position: undefined }))
  }

  const handleAdmiredPlayerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setAdmiredPlayer(e.target.value)
    setErrors((prev) => ({ ...prev, admired_player: undefined }))
  }

  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setIntroduction(e.target.value)
    setErrors((prev) => ({ ...prev, introduction: undefined }))
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

=======

const EditProfile = () => {
>>>>>>> main
  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Header>ホーム画面</Header>
        <main className="flex-grow container mx-auto px-6 py-6 overflow-y-auto h-[calc(100vh-200px)]">
          <Card>
            <PageTitle>プロフィール編集</PageTitle>
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-right pr-5 mr-5">
                <p className="text-2xl mt-3 pb-2">選手</p>
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
                    腹筋：
                    <RequiredBadge />
                  </Label>
                  <FullInput value="100回"></FullInput>
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
                <div className="text-center space-x-5 mt-10 pt-5">
                  <LinkButtons href="/Player/ProfileDetail" className="text-lg">
                    プロフィール詳細画面に戻る
                  </LinkButtons>
                  <LinkButtons href="/Player/ProfileDetail" className="text-lg">
                    決定
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

export default EditProfile
