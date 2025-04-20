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
