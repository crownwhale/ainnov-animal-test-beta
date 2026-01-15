import { supabase } from '../supabaseClient'
import type { Answer, ScoreMap } from '../../types/test'

export type TestSessionInsertPayload = {
  id: string
  nickname: string
  major_group: string
  major_detail: string | null
  consent: boolean
  created_at: string
  answers: Answer[]
  scores: ScoreMap
  animal_type: string
  hashtags: string[]
  temperature: 'HOT' | 'WARM' | 'COOL'
  team_guide: string
  client_meta: {
    ua: string
    lang: string
    screen: { w: number; h: number }
  }
}

export const createTestSession = async (payload: TestSessionInsertPayload) => {
  const row = {
    id: payload.id,
    nickname: payload.nickname,
    major_group: payload.major_group,
    major_detail: payload.major_detail,
    consent: payload.consent,
    created_at: payload.created_at,
    answers: payload.answers,
    scores: payload.scores,
    animal_type: payload.animal_type,
    hashtags: payload.hashtags,
    temperature: payload.temperature,
    team_guide: payload.team_guide,
    client_meta: payload.client_meta,
  }

  const { data, error } = await supabase
    .from('test_sessions')
    .insert(row)
    .select('id')
    .single()

  if (error) {
    console.error('createTestSession error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: (error as { code?: string }).code,
    })
  }

  return { data, error }
}
