import { CreateProfileRequest } from "@/components/component/type/profile"

export type ValidationErrors = {
    name?: string, 
    birthday?: string, 
    team_name?: string, 
    player_dominant?: string, 
    player_position?: string,
    admired_player?: string, 
    introduction?: string, 
    image?: string
}

/**
 * プロフィールデータのバリデーション
 * @param data バリデーション対象のデータ
 * @returns エラーメッセージの連想配列。問題なければ空のオブジェクト
 */

export const validateProfile = (data: CreateProfileRequest): ValidationErrors => {
    const errors: ValidationErrors = {}

    // 名前のバリデーション
    if(!data.name || data.name.trim() === "") {
        errors.name = "名前は必須です💢"
    } else if (data.name.length >= 50) {
        errors.name = "名前は50字以内で入力してください"
    }

    // 生年月日のバリデーション
    if(!data.birthday) {
        errors.birthday = "生年月日は必須です"
    } else {
        const birthDate = new Date(data.birthday)
        const today = new Date()
        const minDate = new Date('1900-01-01')

        if(isNaN(birthDate.getTime())) {
            errors.birthday = "有効な日付を入力してください"
        } else if(birthDate > today) {
            errors.birthday = "生年月日は今日よりも前の日付を入力してください"
        } else if (birthDate < minDate) {
            errors.birthday = "生年月日は1900年代以降の日付を入力してください"
        }
    }

    //チーム名のバリデーション
    if(!data.team_name || data.team_name.trim() === "") {
        errors.team_name = "チーム名は必須です💢"
    } else if (data.team_name.length > 50) {
        errors.team_name = "チーム名は50字以内で入力してください"
    }

    // 利き手のバリデーション
    if(!data.player_dominant) {
        errors.player_dominant = "利き手を入力してください"
    }

    //ポジションバリデーション
    if(!data.player_dominant) {
        errors.player_position = "ポジションを入力してください"
    }

    // 憧れの選手
    if(data.admired_player && data.admired_player.length > 50) {
        errors.admired_player = "憧れの選手は50字以内で入力してください"
    }

    //自己紹介
    if(data.introduction && data.introduction.length > 500) {
        errors.introduction = "自己紹介は500字以内で入力してください"
    }

    return errors

}

/**
 * 画像ファイルのバリデーション
 * @param file バリデーション対象のファイル
 * @returns エラーメッセージ。問題なければnull
 */

export const validateImage = (file: File | null | undefined): string | null => {
    if(!file) return null

    if(file.size > 5 * 1024 * 1024) {
        return "画像のサイズは5MB以下を返してください"
    }

    if(!file.type.startsWith('image/')) {
        return "画像ファイルを選択してください"
    }
    return null
}