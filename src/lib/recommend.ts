import { traitKeys } from './questions'
import type { ScoreMap } from '../types/test'

export type SimilarityResult = {
  score: number
}

const toVector = (scores: ScoreMap) => traitKeys.map((trait) => scores[trait])

// Cosine similarity captures direction similarity between user scores and contest needs.
export const getCosineSimilarity = (a: ScoreMap, b: ScoreMap): SimilarityResult => {
  const vecA = toVector(a)
  const vecB = toVector(b)
  const dot = vecA.reduce((sum, value, index) => sum + value * vecB[index], 0)
  const normA = Math.sqrt(vecA.reduce((sum, value) => sum + value * value, 0))
  const normB = Math.sqrt(vecB.reduce((sum, value) => sum + value * value, 0))

  if (normA === 0 || normB === 0) {
    return { score: 0 }
  }

  return { score: dot / (normA * normB) }
}
