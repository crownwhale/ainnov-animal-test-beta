import type { ScoreMap, Trait } from '../types/test'

export type Tag = string
export type AnswerTagHit = Record<Tag, number>

export const tagPoolByAnimal: Record<string, Tag[]> = {
  사자: [
    '#결단형리더',
    '#판을여는사람',
    '#속도와추진력',
    '#우선순위장악',
    '#주도권확보',
    '#결론내는힘',
    '#리스크감수',
    '#강한드라이브',
    '#빠른선택',
    '#방향제시',
    '#승부수',
    '#전략보다실행',
    '#팀페이스상향',
    '#정면돌파',
    '#결정피로줄이기',
  ],
  고양이: [
    '#논리적사고',
    '#리스크관리',
    '#팩트중심',
    '#근거기반판단',
    '#허점포착',
    '#데이터중심',
    '#기준제시',
    '#냉정한피드백',
    '#문제구조화',
    '#검증루프',
    '#가설점검',
    '#예외처리',
    '#불확실성차단',
    '#설득력강화',
    '#정확도우선',
  ],
  코끼리: [
    '#발산형아이디어',
    '#큰그림설계',
    '#확장적사고',
    '#관점전환',
    '#컨셉메이커',
    '#창의폭발',
    '#가능성탐색',
    '#새판짜기',
    '#연결의천재',
    '#브레인스토밍',
    '#미래지향',
    '#상한선상승',
    '#틀깨기',
    '#영감제공',
    '#아이디어연쇄',
  ],
  카피바라: [
    '#팀분위기메이커',
    '#갈등중재',
    '#협업중심',
    '#공감리더십',
    '#대화유도',
    '#심리안정',
    '#관계조율',
    '#합의형소통',
    '#포용력',
    '#팀케미',
    '#분위기회복',
    '#말걸기장인',
    '#부드러운설득',
    '#협력촉진',
    '#마찰완충',
  ],
  미어캣: [
    '#완성도집착',
    '#체크리스트형',
    '#마감수호자',
    '#오류포착',
    '#품질관리',
    '#디테일강박',
    '#리뷰장인',
    '#버그헌터',
    '#예외추적',
    '#정리정돈',
    '#누락제로',
    '#프로세스준수',
    '#마감관리',
    '#작업검증',
    '#정확한마무리',
  ],
  사막여우: [
    '#전략적사고',
    '#균형형플레이어',
    '#아이디어실행연결',
    '#판짜기',
    '#구조화',
    '#우선순위정리',
    '#리스크밸런스',
    '#실행플랜',
    '#의사결정보조',
    '#로드맵설계',
    '#관점정리',
    '#타협안제시',
    '#중간관리',
    '#현실화조율',
    '#전략번역기',
  ],
  수달: [
    '#실행력끝판왕',
    '#툴활용능력',
    '#현실화전문',
    '#바로실행',
    '#손에잡히는결과',
    '#프로토타이핑',
    '#빠른학습',
    '#문제해결러',
    '#실무최적화',
    '#생산성상승',
    '#작업속도',
    '#현장대응',
    '#해보면안다',
    '#실행우선',
    '#결과물메이커',
  ],
  부엉이: [
    '#냉철한판단',
    '#논리중재',
    '#안정적결정',
    '#균형감각',
    '#감정배제',
    '#구조적분석',
    '#리스크체크',
    '#객관적시선',
    '#과열진정',
    '#논점정리',
    '#합리적결론',
    '#신중한선택',
    '#극단방지',
    '#기준수립',
    '#차분한진행',
  ],
  늑대: [
    '#팀플추진',
    '#안정적실행',
    '#지속가능페이스',
    '#완주력',
    '#리듬유지',
    '#책임감',
    '#꾸준함',
    '#운영감각',
    '#변수대응',
    '#팀중심실행',
    '#루틴메이커',
    '#장기전강함',
    '#페이스조절',
    '#현실적계획',
    '#끝까지간다',
  ],
  거북이: [
    '#안정형완주',
    '#품질수호',
    '#리스크관리',
    '#프로세스중심',
    '#기준중시',
    '#지속가능',
    '#차분한진행',
    '#검증우선',
    '#튼튼한설계',
    '#무너지지않는팀',
    '#안정성최우선',
    '#단단한기초',
    '#신뢰형플로우',
    '#꾸준한관리',
    '#리스크최소화',
  ],
  보더콜리: [
    '#명확한가이드',
    '#단호한중재자',
    '#효율적조율',
    '#스마트워커',
    '#역할정렬',
    '#규칙설정',
    '#우선순위정리',
    '#회의정리',
    '#목표집중',
    '#군더더기제거',
    '#긴장감유지',
    '#성과집착',
    '#결정촉진',
    '#실행정렬',
    '#정확한지시',
  ],
  돌고래: [
    '#긍정시너지',
    '#활기찬소통',
    '#팀에너지업',
    '#공감능력자',
    '#분위기전환',
    '#칭찬장인',
    '#네트워킹',
    '#소통촉진',
    '#아이디어응원',
    '#심리적안정',
    '#유연한대화',
    '#팀결속',
    '#리액션빠름',
    '#열정전파',
    '#대화물꼬',
  ],
}

export const axisTags: Record<Trait, Tag[]> = {
  decisiveness: ['#결단형리더', '#우선순위장악', '#결론내는힘', '#결정촉진'],
  creativity: ['#관점전환', '#컨셉메이커', '#발산형아이디어', '#아이디어연쇄'],
  logic: ['#구조화', '#근거기반판단', '#리스크관리', '#기준제시'],
  acceptance: ['#공감리더십', '#합의형소통', '#팀케미', '#관계조율'],
  completeness: ['#실행플랜', '#체크리스트형', '#마감관리', '#결과물메이커'],
}

const sortByPoolOrder = (pool: Tag[], tag: Tag) => {
  const index = pool.indexOf(tag)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

export const pickTop3Tags = (params: {
  animalType: string
  scores: ScoreMap
  answerHits?: AnswerTagHit
}): Tag[] => {
  const { animalType, scores, answerHits = {} } = params
  const pool = tagPoolByAnimal[animalType] ?? []
  const poolSet = new Set(pool)
  const picked: Tag[] = []

  const orderedAxes = (Object.entries(scores) as [Trait, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([axis]) => axis)

  for (const axis of orderedAxes.slice(0, 2)) {
    const candidates = axisTags[axis].filter((tag) => poolSet.has(tag))
    const candidate = candidates.find((tag) => !picked.includes(tag))
    if (candidate) picked.push(candidate)
  }

  const answerTop = Object.entries(answerHits)
    .filter(([tag]) => poolSet.has(tag) && !picked.includes(tag))
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return sortByPoolOrder(pool, a[0]) - sortByPoolOrder(pool, b[0])
    })[0]?.[0]

  if (answerTop) picked.push(answerTop)

  for (const tag of pool) {
    if (picked.length >= 3) break
    if (!picked.includes(tag)) picked.push(tag)
  }

  const representative = pool.slice(0, 3)
  const hasRepresentative = picked.some((tag) => representative.includes(tag))
  if (!hasRepresentative && representative[0]) {
    if (picked.length >= 3) {
      picked[2] = representative[0]
    } else {
      picked.push(representative[0])
    }
  }

  return picked.slice(0, 3)
}
