import { answerTagMap, type AnswerTagMap, type TagWeight } from './answerTagMap'
import { tagPoolByAnimal, type Tag } from './tagPoolByAnimal'

type Answer = { id: string; choice: 'A' | 'B' | 'C' }

// answerTagMap의 태그를 각 동물 pool 태그로 매핑
const tagAliasByAnimal: Record<string, Record<string, string>> = {
  사자: {
    '#기준제시': '#방향제시',
    '#팀에너지업': '#팀페이스상향',
    '#구조화': '#판을여는사람',
  },
  고양이: {
    '#리스크체크': '#리스크관리',
    '#오류포착': '#허점포착',
    '#검증우선': '#검증루프',
  },
  코끼리: {
    '#구조화': '#큰그림설계',
    '#문제구조화': '#큰그림설계',
    '#관점전환': '#확장적사고',
  },
  카피바라: {
    '#관계조율': '#협업중심',
    '#유연한대화': '#공감리더십',
    '#소통촉진': '#대화유도',
  },
  미어캣: {
    '#검증우선': '#품질관리',
    '#리스크체크': '#예외추적',
    '#지속가능페이스': '#프로세스준수',
  },
  사막여우: {
    '#문제구조화': '#구조화',
    '#우선순위장악': '#우선순위정리',
    '#결정촉진': '#의사결정보조',
    '#판짜기': '#전략적사고',
  },
  수달: {
    '#프로토타이핑': '#해보면안다',
    '#작업속도': '#실행력끝판왕',
    '#현실화전문': '#실무최적화',
  },
  부엉이: {
    '#리스크관리': '#리스크체크',
    '#기준제시': '#기준수립',
    '#결론내는힘': '#합리적결론',
  },
  늑대: {
    '#안정적실행': '#꾸준함',
    '#루틴메이커': '#지속가능페이스',
    '#결론내는힘': '#책임감',
  },
  거북이: {
    '#누락제로': '#품질수호',
    '#리스크관리': '#리스크최소화',
    '#정확도우선': '#검증우선',
  },
  보더콜리: {
    '#우선순위장악': '#우선순위정리',
    '#논점정리': '#회의정리',
    '#합의형소통': '#효율적조율',
  },
  돌고래: {
    '#팀에너지업': '#열정전파',
    '#분위기회복': '#분위기전환',
    '#팀케미': '#팀결속',
  },
}

const normalizeAnswerKey = (answer: Answer) =>
  `${String(answer.id).trim().toUpperCase()}-${String(answer.choice).trim().toUpperCase()}`

export function pickTop3Tags(params: {
  animalName: string
  answers: Answer[]
  answerMap?: AnswerTagMap
}): Tag[] {
  const { animalName, answers, answerMap = answerTagMap } = params
  const pool = tagPoolByAnimal[animalName] ?? []
  const poolSet = new Set(pool)

  const score = new Map<Tag, number>()
  const freq = new Map<Tag, number>()

  const accumulate = (tag: Tag, weight: number) => {
    score.set(tag, (score.get(tag) ?? 0) + weight)
    freq.set(tag, (freq.get(tag) ?? 0) + 1)
  }

  const answerWeights: TagWeight[] = []
  for (const answer of answers) {
    const key = normalizeAnswerKey(answer)
    const weights = answerMap[key] ?? []
    answerWeights.push(...weights)
  }

  // 1) 답변 태그 중 pool 내부 태그만 점수 반영
  for (const { tag, w } of answerWeights) {
    if (!poolSet.has(tag)) continue
    accumulate(tag, Number.isFinite(w) ? w : 1)
  }

  // 2) 부족하면 alias 매핑으로 점수 반영
  if (score.size < 3) {
    for (const { tag, w } of answerWeights) {
      if (poolSet.has(tag)) continue
      const mapped = tagAliasByAnimal[animalName]?.[tag]
      if (!mapped || !poolSet.has(mapped)) continue
      accumulate(mapped, Number.isFinite(w) ? w : 1)
    }
  }

  const ranked = Array.from(score.entries()).sort((a, b) => {
    const diff = b[1] - a[1]
    if (diff !== 0) return diff
    const fa = freq.get(a[0]) ?? 0
    const fb = freq.get(b[0]) ?? 0
    if (fb !== fa) return fb - fa
    return Math.random() - 0.5
  })

  const picked: Tag[] = []
  for (const [tag] of ranked) {
    if (picked.includes(tag)) continue
    picked.push(tag)
    if (picked.length >= 3) break
  }

  // 3) 그래도 부족하면 최후 랜덤
  if (picked.length < 3) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    for (const tag of shuffled) {
      if (picked.length >= 3) break
      if (!picked.includes(tag)) picked.push(tag)
    }
  }

  return picked.slice(0, 3)
}
