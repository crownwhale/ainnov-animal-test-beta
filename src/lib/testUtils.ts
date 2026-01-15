import { questions, traitKeys } from './questions'
import type { ScoreMap } from '../types/test'

export const createEmptyScores = (): ScoreMap =>
  traitKeys.reduce((acc, trait) => {
    acc[trait] = 0
    return acc
  }, {} as ScoreMap)

export const getTraitCounts = () =>
  questions.reduce((acc, question) => {
    question.options.forEach((option) => {
      acc[option.trait] += 1
    })
    return acc
  }, createEmptyScores())
