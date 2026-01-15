export type Trait = 'decisiveness' | 'creativity' | 'logic' | 'acceptance' | 'completeness'

export type Answer = {
  q: number
  choice: 'A' | 'B' | 'C'
  trait: Trait
}

export type ScoreMap = Record<Trait, number>

export type Question = {
  text: string
  options: {
    label: 'A' | 'B' | 'C'
    text: string
    trait: Trait
  }[]
}
