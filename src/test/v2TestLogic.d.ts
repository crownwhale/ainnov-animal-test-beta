export type RoleKey = 'thinker' | 'doer' | 'connector'
export type DiscKey = 'D' | 'I' | 'S' | 'C'

export type ScoreInput = {
  role_thinker: number
  role_doer: number
  role_connector: number
  disc_D: number
  disc_I: number
  disc_S: number
  disc_C: number
}

export type QuestionV2 = {
  id: string
  text: string
  A: { text: string; delta: Partial<ScoreInput> }
  B: { text: string; delta: Partial<ScoreInput> }
  C?: { text: string; delta: Partial<ScoreInput> }
}

export const QUESTIONS_V2: QuestionV2[]
export function initScores(): ScoreInput
export function applyAnswer(scores: ScoreInput, qIndex: number, choice: 'A' | 'B' | 'C'): ScoreInput
export function computeRoleTop(scores: ScoreInput): {
  top: RoleKey
  topScore: number
  ordered: Array<[RoleKey, number]>
}
export function computeDiscTop(scores: ScoreInput): {
  top: DiscKey
  topScore: number
  ordered: Array<[DiscKey, number]>
}
export function decideAnimalId(scores: ScoreInput): string
export function calcRadar(scores: ScoreInput): {
  raw: Record<string, number>
  pct: Record<string, number>
  max: Record<string, number>
}
