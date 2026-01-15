import type { Tag } from './tagPoolByAnimal'

export type Axis = 'decision' | 'creativity' | 'logic' | 'empathy' | 'completion'

export const axisTags: Record<Axis, Tag[]> = {
  decision: ['#빠른선택', '#결론내는힘', '#결정촉진', '#우선순위장악', '#바로실행'],
  creativity: ['#관점전환', '#발산형아이디어', '#큰그림설계', '#아이디어연쇄', '#브레인스토밍'],
  logic: ['#구조화', '#근거기반판단', '#리스크관리', '#기준제시', '#문제구조화'],
  empathy: ['#합의형소통', '#갈등중재', '#관계조율', '#공감리더십', '#팀케미'],
  completion: ['#실행플랜', '#체크리스트형', '#마감관리', '#오류포착', '#손에잡히는결과'],
}
