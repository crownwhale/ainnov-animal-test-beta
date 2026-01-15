import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeResultMeta } from '../lib/resultLogic'
import { createTestSession } from '../lib/api/sessions'
import { pickTop3Tags } from '../test/tagging/pickTop3Tags'
import {
  QUESTIONS_V2,
  applyAnswer,
  calcRadar,
  decideAnimalId,
  initScores,
} from '../test/v2TestLogic'
import { ANIMALS_V2, ANIMAL_IDS, DEFAULT_ANIMAL } from '../test/v2Animals'
import type { Answer, ScoreMap, Trait } from '../types/test'

type V2Answer = Answer & {
  choice: 'A' | 'B' | 'C'
}

const mapTraitFromDelta = (delta: Record<string, number>): Trait => {
  if (delta.disc_D) return 'decisiveness'
  if (delta.disc_I) return 'creativity'
  if (delta.disc_S) return 'acceptance'
  if (delta.disc_C && delta.role_thinker) return 'logic'
  if (delta.disc_C) return 'completeness'
  if (delta.role_connector) return 'acceptance'
  if (delta.role_thinker) return 'logic'
  if (delta.role_doer) return 'decisiveness'
  return 'creativity'
}

const buildScoresFromAnswers = (answers: Array<V2Answer | undefined>) => {
  const scores = initScores()
  answers.forEach((answer, index) => {
    if (!answer) return
    applyAnswer(scores, index, answer.choice)
  })
  return scores
}

const mapRadarToScoreMap = (pct: Record<string, number>): ScoreMap => ({
  decisiveness: pct.decision ?? 0,
  creativity: pct.creativity ?? 0,
  logic: pct.logic ?? 0,
  acceptance: pct.empathy ?? 0,
  completeness: pct.completion ?? 0,
})

const isAnimalId = (value: unknown): value is (typeof ANIMAL_IDS)[number] =>
  typeof value === 'string' && ANIMAL_IDS.includes(value as (typeof ANIMAL_IDS)[number])

const resolveAnimalMeta = (animalType?: string | null) => {
  if (isAnimalId(animalType)) return ANIMALS_V2[animalType]
  if (animalType) {
    const matched = Object.values(ANIMALS_V2).find((animal) => animal.name === animalType)
    if (matched) return matched
  }
  return DEFAULT_ANIMAL
}

function Test() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<V2Answer | undefined>>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const totalQuestions = QUESTIONS_V2.length
  const currentQuestion = QUESTIONS_V2[currentIndex]
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100

  const handleChoice = async (choice: 'A' | 'B' | 'C') => {
    if (saving) return

    const current = currentQuestion[choice]
    if (!current) return
    const delta = current.delta
    const trait = mapTraitFromDelta(delta)

    const nextAnswer: V2Answer = {
      q: currentIndex + 1,
      choice,
      trait,
    }

    const nextAnswers = [...answers]
    nextAnswers[currentIndex] = nextAnswer

    const nextScores = buildScoresFromAnswers(nextAnswers)

    setAnswers(nextAnswers)

    if (currentIndex !== totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }

    const sessionRaw = localStorage.getItem('ainnov_session_v2')
    if (!sessionRaw) {
      navigate('/test/start')
      return
    }

    let profile: {
      nickname?: string
      majorGroup?: string
      majorDetail?: string | null
      consent?: boolean
    } = {}

    try {
      profile = JSON.parse(sessionRaw) as typeof profile
    } catch {
      navigate('/test/start')
      return
    }

    if (!profile.nickname || !profile.majorGroup || !profile.consent) {
      navigate('/test/start')
      return
    }

    const radar = calcRadar(nextScores)
    const scoresForDb = mapRadarToScoreMap(radar.pct)
    const animalId = decideAnimalId(nextScores)
    const animalMeta = resolveAnimalMeta(animalId)
    const resultMeta = computeResultMeta(scoresForDb)

    const clientMeta = {
      ua: navigator.userAgent,
      lang: navigator.language,
      screen: {
        w: Number(window.innerWidth),
        h: Number(window.innerHeight),
      },
    }

    setSaving(true)
    setSaveError('')

    const answersForDb = nextAnswers.filter((answer): answer is V2Answer => Boolean(answer))

    const sessionId = crypto.randomUUID()
    const payload = {
      id: sessionId,
      nickname: profile.nickname,
      major_group: profile.majorGroup,
      major_detail: profile.majorDetail ?? null,
      consent: profile.consent === true,
      created_at: new Date().toISOString(),
      answers: answersForDb,
      scores: scoresForDb,
      animal_type: animalId,
      temperature: resultMeta.temperature,
      team_guide: resultMeta.teamGuide,
      client_meta: clientMeta,
    }

    // ✅ hashtags를 "세션 생성 시점"에 한 번만 확정해서 DB에 저장
    const computedHashtags =
      animalId && answersForDb.length
        ? pickTop3Tags({
            animalName: animalMeta.name,
            answers: answersForDb.map((answer) => ({
              id: `Q${answer.q}`,
              choice: answer.choice,
            })),
          })
        : []

    const payloadFinal = {
      ...payload,
      hashtags: computedHashtags,
    }

    console.log('[SAVE] animalId:', animalId)
    console.log('[SAVE] hashtags:', computedHashtags, 'len=', computedHashtags.length)
    console.log(
      '[SAVE] payload.hashtags:',
      payloadFinal.hashtags,
      'len=',
      payloadFinal.hashtags.length,
    )
    console.log('[INSERT payload]', payloadFinal)

    const { error } = await createTestSession(payloadFinal)

    if (error) {
      setSaveError('저장 실패. 네트워크 상태를 확인해주세요.')
      setSaving(false)
      return
    }

    localStorage.setItem('sessionId', sessionId)
    navigate(`/result/${sessionId}`)
    setSaving(false)
  }

  if (!currentQuestion) return null

  const choiceKeys = currentQuestion.C ? (['A', 'B', 'C'] as const) : (['A', 'B'] as const)

  return (
    <div className="page">
      <div className="container card">
        <div className="question-nav">
          {currentIndex > 0 ? (
            <button
              type="button"
              className="back-button"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={saving}
            >
              ←
            </button>
          ) : (
            <span className="back-placeholder" />
          )}
        </div>
        <div className="progress">
          <div className="progress-meta">
            QUESTION {currentIndex + 1} / {totalQuestions}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="question">
          <h1>{currentQuestion.text}</h1>
        </div>
        <div className="choices">
          {choiceKeys.map((key) => {
            const option = currentQuestion[key]
            if (!option) return null
            return (
              <button
                key={key}
                type="button"
                className={`choice-button${answers[currentIndex]?.choice === key ? ' selected' : ''}`}
                onClick={() => void handleChoice(key)}
                disabled={saving}
              >
                <span className="choice-label">{key}.</span> {option.text}
              </button>
            )
          })}
        </div>
        {saveError ? <p className="error">{saveError}</p> : null}
      </div>
    </div>
  )
}

export default Test
