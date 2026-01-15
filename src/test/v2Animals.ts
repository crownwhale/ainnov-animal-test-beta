export const ANIMAL_IDS = [
  'lion',
  'cat',
  'elephant',
  'capybara',
  'meerkat',
  'fennec',
  'otter',
  'owl',
  'wolf',
  'turtle',
  'borderCollie',
  'dolphin',
] as const

export type AnimalId = (typeof ANIMAL_IDS)[number]

export type AnimalMeta = {
  id: AnimalId
  title: string
  name: string
  hashtags: string[]
  image: string
}

export const DEFAULT_ANIMAL: AnimalMeta = {
  id: 'meerkat',
  title: '디테일 추적자',
  name: '미어캣',
  hashtags: ['#완성도집착', '#체크리스트형', '#마감수호자'],
  image: '/assets/animals/미어캣.png',
}

export const ANIMALS_V2: Record<AnimalId, AnimalMeta> = {
  lion: {
    id: 'lion',
    name: '사자',
    title: '카리스마 리더',
    hashtags: ['#결단', '#추진', '#리드'],
    image: '/assets/animals/사자.png',
  },
  cat: {
    id: 'cat',
    name: '고양이',
    title: '예리한 분석가',
    hashtags: ['#논리', '#분석', '#정확'],
    image: '/assets/animals/고양이.png',
  },
  elephant: {
    id: 'elephant',
    name: '코끼리',
    title: '아이디어 거인',
    hashtags: ['#발상', '#확장', '#통찰'],
    image: '/assets/animals/코끼리.png',
  },
  capybara: {
    id: 'capybara',
    name: '카피바라',
    title: '소통의 왕',
    hashtags: ['#협업', '#신뢰', '#분위기'],
    image: '/assets/animals/카피바라.png',
  },
  meerkat: {
    id: 'meerkat',
    name: '미어캣',
    title: '디테일 추적자',
    hashtags: ['#완성도집착', '#체크리스트형', '#마감수호자'],
    image: '/assets/animals/미어캣.png',
  },
  fennec: {
    id: 'fennec',
    name: '사막여우',
    title: '전략적 조율자',
    hashtags: ['#전략', '#설계', '#판짜기'],
    image: '/assets/animals/사막여우.png',
  },
  otter: {
    id: 'otter',
    name: '수달',
    title: '도구형 실행가',
    hashtags: ['#실행', '#속도', '#실험'],
    image: '/assets/animals/수달.png',
  },
  owl: {
    id: 'owl',
    name: '부엉이',
    title: '냉랭한 중재자',
    hashtags: ['#중재', '#균형', '#정리'],
    image: '/assets/animals/부엉이.png',
  },
  wolf: {
    id: 'wolf',
    name: '늑대',
    title: '단단한 수호자',
    hashtags: ['#책임', '#안정', '#팀보호'],
    image: '/assets/animals/늑대.png',
  },
  turtle: {
    id: 'turtle',
    name: '거북이',
    title: '묵묵한 완주자',
    hashtags: ['#신뢰', '#꾸준', '#안정완수'],
    image: '/assets/animals/거북이.png',
  },
  borderCollie: {
    id: 'borderCollie',
    name: '보더콜리',
    title: '단호한 가이드',
    hashtags: ['#조율', '#리더십', '#질서'],
    image: '/assets/animals/보더콜리.png',
  },
  dolphin: {
    id: 'dolphin',
    name: '돌고래',
    title: '활기찬 소통가',
    hashtags: ['#네트워킹', '#긍정', '#분위기메이커'],
    image: '/assets/animals/돌고래.png',
  },
}
