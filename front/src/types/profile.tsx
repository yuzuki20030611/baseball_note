export enum Position {
  PITCHER = '投手',
  CATCHER = '捕手',
  FIRST = '一塁手',
  SECOND = '二塁手',
  THIRD = '三塁手',
  SHORT = '遊撃手',
  LEFT = '左翼手',
  CENTER = '中堅手',
  RIGHT = '右翼手',
}

export enum DominantHand {
  RIGHT_RIGHT = '右投げ右打ち',
  RIGHT_LEFT = '右投げ左打ち',
  LEFT_RIGHT = '左投げ右打ち',
  LEFT_LEFT = '左投げ左打ち',
  BOTH_RIGHT = '両投げ右打ち',
  BOTH_LEFT = '両投げ左打ち',
  RIGHT_BOTH = '右投げ両打ち',
  LEFT_BOTH = '左投げ両打ち',
  BOTH_BOTH = '両投げ両打ち',
}

export type CreateProfileRequest = {
  firebase_uid: string
  name: string
  team_name: string
  birthday: Date | string
  player_dominant: DominantHand
  player_position: Position
  admired_player?: string
  introduction?: string
  image?: File | null
}

export type ProfileResponse = {
  id: string // プロフィールID
  user_id: string // ユーザーID
  name: string
  team_name: string
  birthday: string // APIからは文字列として返ってくる
  player_dominant: string // APIからは文字列として返ってくる
  player_position: string // APIからは文字列として返ってくる
  admired_player: string | null
  introduction: string | null
  image_path: string | null
  created_at: string
  updated_at: string
}
