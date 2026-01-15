import { traitKeys } from './questions'
import { getTraitCounts } from './testUtils'
import type { ScoreMap, Trait } from '../types/test'

type AnimalProfile = {
  name: string
  traits: [Trait, Trait]
  defaultTemp: 'HOT' | 'WARM' | 'COOL'
}

const traitPriority: Trait[] = [
  'decisiveness',
  'creativity',
  'logic',
  'completeness',
  'acceptance',
]

const animalProfiles: AnimalProfile[] = [
  { name: '사자', traits: ['decisiveness', 'creativity'], defaultTemp: 'HOT' },
  { name: '고양이', traits: ['logic', 'completeness'], defaultTemp: 'COOL' },
  { name: '코끼리', traits: ['creativity', 'acceptance'], defaultTemp: 'WARM' },
  { name: '카피바라', traits: ['acceptance', 'decisiveness'], defaultTemp: 'WARM' },
  { name: '미어캣', traits: ['completeness', 'logic'], defaultTemp: 'COOL' },
  { name: '사막여우', traits: ['creativity', 'logic'], defaultTemp: 'WARM' },
  { name: '수달', traits: ['completeness', 'creativity'], defaultTemp: 'WARM' },
  { name: '부엉이', traits: ['logic', 'acceptance'], defaultTemp: 'COOL' },
]

const isNormalizedScores = (scores: ScoreMap) =>
  Object.values(scores).some((value) => value > 12)

export const getTraitOrder = (scores: ScoreMap) =>
  [...traitKeys].sort((a, b) => {
    const diff = scores[b] - scores[a]
    if (diff !== 0) return diff
    return traitPriority.indexOf(a) - traitPriority.indexOf(b)
  })

export const normalizeScores = (scores: ScoreMap) => {
  if (isNormalizedScores(scores)) {
    return scores
  }

  const counts = getTraitCounts()
  return traitKeys.reduce((acc, trait) => {
    const total = counts[trait] || 1
    acc[trait] = Math.round((scores[trait] / total) * 100)
    return acc
  }, {} as ScoreMap)
}

const findAnimalByPair = (primary: Trait, secondary: Trait, scores: ScoreMap) => {
  const matched = animalProfiles.find((profile) => {
    return (
      (profile.traits[0] === primary && profile.traits[1] === secondary) ||
      (profile.traits[0] === secondary && profile.traits[1] === primary)
    )
  })

  if (matched) return matched

  return animalProfiles
    .map((profile) => ({
      profile,
      sum: scores[profile.traits[0]] + scores[profile.traits[1]],
    }))
    .sort((a, b) => b.sum - a.sum)[0].profile
}

const getTemperature = (scores: ScoreMap, animal: AnimalProfile): 'HOT' | 'WARM' | 'COOL' => {
  const hotScore = scores.decisiveness + scores.creativity
  const coolScore = scores.logic + scores.completeness

  if (hotScore > coolScore) {
    return animal.defaultTemp === 'HOT' ? 'HOT' : 'WARM'
  }

  if (coolScore > hotScore) {
    return 'COOL'
  }

  return animal.defaultTemp
}

const getTeamGuide = (scoresNormalized: ScoreMap) => {
  const acceptanceScore = scoresNormalized.acceptance
  const completenessScore = scoresNormalized.completeness

  if (acceptanceScore >= 80) {
    return '6인 이상'
  }

  if (acceptanceScore > completenessScore) {
    return '5인 이상'
  }

  if (completenessScore > acceptanceScore) {
    return '2~3인'
  }

  return '3~4인'
}

export const computeResultMeta = (scoresRaw: ScoreMap) => {
  const orderedTraits = getTraitOrder(scoresRaw)
  const primaryTrait = orderedTraits[0]
  const secondaryTrait = orderedTraits[1]
  const scoreGap = scoresRaw[primaryTrait] - scoresRaw[secondaryTrait]
  const isHybrid = scoreGap <= 1
  const animal = findAnimalByPair(primaryTrait, secondaryTrait, scoresRaw)
  const scoresNormalized = normalizeScores(scoresRaw)
  const temperature = getTemperature(scoresRaw, animal)
  const teamGuide = getTeamGuide(scoresNormalized)

  return {
    primaryTrait,
    secondaryTrait,
    isHybrid,
    animalType: animal.name,
    temperature,
    teamGuide,
    scoresNormalized,
  }
}
