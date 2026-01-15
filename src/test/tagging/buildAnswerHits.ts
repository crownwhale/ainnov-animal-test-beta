import { answerTagMap, type AnswerTagMap } from './answerTagMap'
import type { Tag } from './tagPoolByAnimal'

export type Answer = { id: string; choice: 'A' | 'B' | 'C' }
export type AnswerTagHit = Record<Tag, number>

export function buildAnswerHits(
  answers: Answer[],
  map: AnswerTagMap = answerTagMap,
): AnswerTagHit {
  const hits = {} as AnswerTagHit

  for (const answer of answers) {
    const key = `${answer.id}-${answer.choice}`
    const weights = map[key] ?? []
    for (const { tag, w } of weights) {
      hits[tag] = (hits[tag] ?? 0) + w
    }
  }

  return hits
}
