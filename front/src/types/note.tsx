export type CreateNoteRequest = {
  firebase_uid: string
  theme: string
  assignment: string
  practice_video?: string
  my_video?: File | null
  weight: number
  sleep: number
  looked_day: string
  practice?: string
  trainings: TrainingInput[]
}

export type TrainingInput = {
  training_id: string
  count: number
}

export type NoteListItem = {
  id: string
  created_at: string
  theme: string
  assignment: string
}

export type NoteListResponse = {
  items: NoteListItem[]
}

export type NoteDetailResponse = {
  id: string
  user_id: string
  theme: string
  assignment: string
  practice_video: string | null
  my_video: string | null
  my_video_url: string | null // 追加：閲覧用URL
  weight: number
  sleep: number
  looked_day: string
  practice: string | null
  created_at: string
  updated_at: string
  training_notes: {
    id: string
    training_id: string
    note_id: string
    count: number
    created_at: string
    updated_at: string
    training: {
      id: string
      menu: string
    } | null
  }[]
}

export type UpdateNoteRequest = {
  firebase_uid: string
  theme: string
  assignment: string
  practice_video?: string
  my_video?: File | null
  delete_video?: boolean
  weight: number | string
  sleep: number | string
  looked_day: string
  practice?: string
  trainings: {
    training_id: string
    count: number
  }[]
}
