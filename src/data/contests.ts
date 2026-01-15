import { traitKeys } from '../lib/questions'
import type { ScoreMap, Trait } from '../types/test'

export type Contest = {
  id: string
  title: string
  tags: string[]
  requiredTraits: ScoreMap
  deadline: string
  dDay: string
  thumbUrl: string
  prize: string
  period: string
}

const withTraits = (traits: Partial<Record<Trait, number>>): ScoreMap =>
  traitKeys.reduce((acc, trait) => {
    acc[trait] = traits[trait] ?? 0
    return acc
  }, {} as ScoreMap)

export const contests: Contest[] = [
  {
    id: 'ct-001',
    title: '브랜드 리브랜딩 크리에이티브 챌린지',
    tags: ['브랜딩', '기획', '디자인'],
    requiredTraits: withTraits({ creativity: 90, decisiveness: 70, completeness: 60 }),
    deadline: '2026-03-12',
    dDay: 'D-28',
    thumbUrl: 'https://placehold.co/600x400?text=Branding',
    prize: '상금 300만원',
    period: '2026.02.01 ~ 2026.03.12',
  },
  {
    id: 'ct-002',
    title: '데이터 기반 서비스 개선 아이디어톤',
    tags: ['데이터', '서비스', '전략'],
    requiredTraits: withTraits({ logic: 92, decisiveness: 60, completeness: 65 }),
    deadline: '2026-02-25',
    dDay: 'D-11',
    thumbUrl: 'https://placehold.co/600x400?text=Data',
    prize: '상금 500만원',
    period: '2026.01.20 ~ 2026.02.25',
  },
  {
    id: 'ct-003',
    title: '글로벌 UX 리서치 공모전',
    tags: ['UX', '리서치', '기획'],
    requiredTraits: withTraits({ logic: 80, acceptance: 70, completeness: 70 }),
    deadline: '2026-04-02',
    dDay: 'D-49',
    thumbUrl: 'https://placehold.co/600x400?text=UX',
    prize: '상금 250만원',
    period: '2026.02.15 ~ 2026.04.02',
  },
  {
    id: 'ct-004',
    title: '임팩트 프로젝트 아이디어 랩',
    tags: ['사회혁신', '아이디어', '팀빌딩'],
    requiredTraits: withTraits({ creativity: 85, acceptance: 80, decisiveness: 65 }),
    deadline: '2026-03-05',
    dDay: 'D-21',
    thumbUrl: 'https://placehold.co/600x400?text=Impact',
    prize: '지원금 400만원',
    period: '2026.02.10 ~ 2026.03.05',
  },
  {
    id: 'ct-005',
    title: '도시 문제 해결 솔루션 해커톤',
    tags: ['솔루션', '테크', '문제해결'],
    requiredTraits: withTraits({ decisiveness: 85, completeness: 75, creativity: 60 }),
    deadline: '2026-03-22',
    dDay: 'D-38',
    thumbUrl: 'https://placehold.co/600x400?text=Hackathon',
    prize: '상금 600만원',
    period: '2026.02.20 ~ 2026.03.22',
  },
  {
    id: 'ct-006',
    title: '미디어 콘텐츠 기획 공모전',
    tags: ['콘텐츠', '스토리텔링', '기획'],
    requiredTraits: withTraits({ creativity: 88, decisiveness: 65, acceptance: 55 }),
    deadline: '2026-04-10',
    dDay: 'D-57',
    thumbUrl: 'https://placehold.co/600x400?text=Content',
    prize: '상금 200만원',
    period: '2026.03.01 ~ 2026.04.10',
  },
  {
    id: 'ct-007',
    title: '논문 기반 정책 제안 공모전',
    tags: ['정책', '논문', '리서치'],
    requiredTraits: withTraits({ logic: 95, completeness: 80, acceptance: 50 }),
    deadline: '2026-03-30',
    dDay: 'D-46',
    thumbUrl: 'https://placehold.co/600x400?text=Policy',
    prize: '상금 450만원',
    period: '2026.02.25 ~ 2026.03.30',
  },
  {
    id: 'ct-008',
    title: '지역 상생 마케팅 캠페인',
    tags: ['마케팅', '브랜딩', '협업'],
    requiredTraits: withTraits({ acceptance: 90, creativity: 70, decisiveness: 55 }),
    deadline: '2026-03-18',
    dDay: 'D-34',
    thumbUrl: 'https://placehold.co/600x400?text=Marketing',
    prize: '상금 350만원',
    period: '2026.02.12 ~ 2026.03.18',
  },
  {
    id: 'ct-009',
    title: '프로덕트 개선 실행형 공모전',
    tags: ['실행', '프로덕트', '개선'],
    requiredTraits: withTraits({ completeness: 90, decisiveness: 70, logic: 60 }),
    deadline: '2026-02-28',
    dDay: 'D-14',
    thumbUrl: 'https://placehold.co/600x400?text=Product',
    prize: '상금 280만원',
    period: '2026.01.25 ~ 2026.02.28',
  },
  {
    id: 'ct-010',
    title: '창업 아이디어 실전 피치',
    tags: ['창업', '피치', '전략'],
    requiredTraits: withTraits({ decisiveness: 88, creativity: 75, logic: 55 }),
    deadline: '2026-03-26',
    dDay: 'D-42',
    thumbUrl: 'https://placehold.co/600x400?text=Pitch',
    prize: '상금 700만원',
    period: '2026.02.18 ~ 2026.03.26',
  },
  {
    id: 'ct-011',
    title: '지속가능성 프로젝트 챌린지',
    tags: ['ESG', '협업', '기획'],
    requiredTraits: withTraits({ acceptance: 85, logic: 65, completeness: 60 }),
    deadline: '2026-04-05',
    dDay: 'D-52',
    thumbUrl: 'https://placehold.co/600x400?text=ESG',
    prize: '상금 320만원',
    period: '2026.03.05 ~ 2026.04.05',
  },
  {
    id: 'ct-012',
    title: 'AI 서비스 프로토타입 경진대회',
    tags: ['AI', '프로토타입', '기획'],
    requiredTraits: withTraits({ creativity: 82, completeness: 78, logic: 70 }),
    deadline: '2026-03-15',
    dDay: 'D-31',
    thumbUrl: 'https://placehold.co/600x400?text=AI',
    prize: '상금 550만원',
    period: '2026.02.08 ~ 2026.03.15',
  },
]
