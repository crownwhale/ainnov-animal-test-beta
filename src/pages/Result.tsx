import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  type ChartEvent,
  type ActiveElement,
  type ChartOptions,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import { toPng } from 'html-to-image'
import { contests } from '../data/contests'
import { traitKeys } from '../lib/questions'
import { getCosineSimilarity } from '../lib/recommend'
import { getTraitOrder, normalizeScores } from '../lib/resultLogic'
import { supabase } from '../lib/supabaseClient'
import { ANIMALS_V2, ANIMAL_IDS, DEFAULT_ANIMAL } from '../test/v2Animals'
import type { AnimalId } from '../test/v2Animals'
import type { Answer, ScoreMap, Trait } from '../types/test'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

type ResultPayload = {
  sessionId: string
  answers: Answer[]
  scoresRaw: ScoreMap
  scoresNormalized: ScoreMap
  primaryTrait: Trait
  secondaryTrait: Trait
  animalId: string
  animalName: string
  isHybrid: boolean
  temperature: 'HOT' | 'WARM' | 'COOL'
  teamGuide: string
  hashtags: string[]
  updatedAt: string
}

type Match = { name: string; description: string }

type AnimalCopy = {
  hashtags: string[]
  report: string[]
  bestMatches: Match[]
  worstMatches: Match[]
  normalMatches: Match[]
}

type TestSessionRow = {
  id: string
  answers: Answer[]
  scores: ScoreMap
  animal_type: string | null
  hashtags: string[] | null
  temperature: 'HOT' | 'WARM' | 'COOL' | null
  team_guide: string | null
  created_at: string
}

export const normalMatchesByAnimal: Record<string, Match[]> = {
  // ===== 사자 =====
  // best: 고양이, 사막여우 / worst: 보더콜리
  사자: [
    {
      name: '사자',
      description:
        '주도권이 겹칠 수 있어, 역할과 최종 결정권을 미리 정하면 충돌을 줄일 수 있습니다.',
    },
    {
      name: '코끼리',
      description:
        '아이디어를 빠르게 실행으로 옮기려면 우선순위를 함께 정리하면 좋습니다.',
    },
    {
      name: '카피바라',
      description: '합의 과정이 길어질 수 있어 결론 기준을 먼저 공유하면 협업이 매끄럽습니다.',
    },
    {
      name: '미어캣',
      description:
        '디테일 검증이 강점이라 리뷰 타이밍을 정해두면 추진력과 완성도가 함께 올라갑니다.',
    },
    {
      name: '수달',
      description: '실행 속도가 빨라 방향만 명확히 맞추면 빠르게 성과를 만들 수 있습니다.',
    },
    {
      name: '부엉이',
      description:
        '신중한 판단을 존중하되 결론 시점을 정하면 균형 잡힌 결정이 가능합니다.',
    },
    {
      name: '늑대',
      description:
        '꾸준한 페이스형이라 목표와 역할을 분명히 하면 안정적으로 밀어붙일 수 있습니다.',
    },
    {
      name: '거북이',
      description: '품질 기준을 합의한 뒤 속도를 조절하면 결과가 단단해집니다.',
    },
    {
      name: '돌고래',
      description:
        '에너지가 높아 논의가 산만해질 수 있어 대화의 목적을 먼저 잡아주면 효과적입니다.',
    },
  ],

  // ===== 고양이 =====
  // best: 사자, 보더콜리 / worst: 돌고래
  고양이: [
    {
      name: '고양이',
      description:
        '분석과 검증에 집중하다 결정이 늦어질 수 있어, 결론 시점을 정해두면 좋습니다.',
    },
    {
      name: '코끼리',
      description:
        '아이디어를 살리려면 초반엔 발산을 열어두고 후반에 기준으로 수렴하면 좋습니다.',
    },
    {
      name: '카피바라',
      description: '피드백 톤을 부드럽게 맞추면 소통이 안정적으로 이어집니다.',
    },
    {
      name: '미어캣',
      description: '디테일이 강점이라 기준만 합의되면 품질이 빠르게 올라갑니다.',
    },
    {
      name: '사막여우',
      description: '논리를 실행 전략으로 정리해 주어 판단이 설계로 이어지기 쉽습니다.',
    },
    {
      name: '수달',
      description: '실행력이 강하니 체크포인트를 두면 속도와 리스크 관리가 함께 됩니다.',
    },
    {
      name: '부엉이',
      description: '신중함이 비슷해 결론이 밀릴 수 있어 판단 기준을 명확히 두면 좋습니다.',
    },
    {
      name: '늑대',
      description:
        '책임감 있는 실행가라 요구사항과 품질 기준을 공유하면 안정적으로 굴러갑니다.',
    },
    {
      name: '거북이',
      description:
        '프로세스를 중시하니 기준 문서만 잡아두면 흔들림 없는 협업이 가능합니다.',
    },
  ],

  // ===== 코끼리 =====
  // best: 사자, 수달 / worst: 거북이
  코끼리: [
    {
      name: '코끼리',
      description: '아이디어가 계속 확장될 수 있어, 실행 기준을 함께 잡아주는 장치가 필요합니다.',
    },
    {
      name: '고양이',
      description:
        '현실성 점검을 받되 초반 발산 시간을 보장하면 아이디어가 더 잘 살아납니다.',
    },
    {
      name: '카피바라',
      description: '의견을 넓게 모을 수 있어 아이디어 수집 단계에서 특히 협업이 편합니다.',
    },
    {
      name: '미어캣',
      description: '구체화 과정에서 디테일을 채워주니 산출물 형태를 먼저 합의하면 좋습니다.',
    },
    {
      name: '사막여우',
      description: '발상을 실행 전략으로 정리해 주어 아이디어가 계획으로 이어지기 쉽습니다.',
    },
    {
      name: '부엉이',
      description:
        '냉정한 기준이 도움이 되니 우선순위와 보류 기준을 함께 정하면 효율이 올라갑니다.',
    },
    {
      name: '늑대',
      description:
        '페이스 조절이 강점이라 아이디어를 단계별로 쪼개면 꾸준히 전진할 수 있습니다.',
    },
    {
      name: '보더콜리',
      description:
        '범위를 정리해 주니 아이디어 확장 단계의 룰을 맞추면 시너지가 납니다.',
    },
    {
      name: '돌고래',
      description:
        '반응이 빠르니 아이디어를 짧게 공유하고 피드백을 즉시 받으면 좋습니다.',
    },
  ],

  // ===== 카피바라 =====
  // best: 고양이, 거북이 / worst: 사막여우
  카피바라: [
    {
      name: '카피바라',
      description:
        '합의 과정이 길어질 수 있어, 논의 범위와 마감선을 명확히 하면 협업이 안정됩니다.',
    },
    {
      name: '사자',
      description: '쟁점을 정리해 결론으로 이어지게 돕는 방식이 맞으면 추진력이 좋아집니다.',
    },
    {
      name: '코끼리',
      description: '아이디어가 많아질 수 있어 핵심을 묶어주는 역할을 하면 협업이 편해집니다.',
    },
    {
      name: '미어캣',
      description:
        '피드백이 강할 수 있어 전달 톤만 조율하면 분위기와 품질을 함께 지킬 수 있습니다.',
    },
    {
      name: '수달',
      description:
        '바로 실행하는 편이라 공유 타이밍만 맞추면 팀워크가 자연스럽게 유지됩니다.',
    },
    {
      name: '부엉이',
      description: '중재 방식이 잘 맞아 회의 규칙을 세우면 안정적으로 운영됩니다.',
    },
    {
      name: '늑대',
      description: '꾸준한 실행가라 소통 채널만 열어두면 역할 수행이 안정적으로 유지됩니다.',
    },
    {
      name: '보더콜리',
      description: '조율이 단호할 수 있어 의사소통 톤을 맞추면 협업이 매끄럽습니다.',
    },
    {
      name: '돌고래',
      description:
        '분위기는 좋아지지만 산만해질 수 있어 대화의 목적을 먼저 합의하면 좋습니다.',
    },
  ],

  // ===== 미어캣 =====
  // best: 사자, 코끼리 / worst: 수달
  미어캣: [
    {
      name: '미어캣',
      description:
        '디테일 검토가 반복될 수 있어, 품질 기준을 한 번에 합의하면 효율이 올라갑니다.',
    },
    {
      name: '고양이',
      description:
        '기준이 명확해지면 디테일이 강점으로 이어지니 체크리스트를 함께 잡으면 좋습니다.',
    },
    {
      name: '카피바라',
      description:
        '피드백이 부담이 될 수 있어 전달 톤만 조율하면 분위기와 품질을 함께 지킬 수 있습니다.',
    },
    {
      name: '사막여우',
      description: '전략 정리에 강점이 있어 디테일의 방향이 분명해집니다.',
    },
    {
      name: '부엉이',
      description:
        '신중함이 비슷해 결론이 늦어질 수 있어 리뷰 타이밍을 정해두면 좋습니다.',
    },
    {
      name: '늑대',
      description:
        '꾸준히 밀어붙이는 편이라 역할 범위를 분명히 하면 안정적으로 완성도를 올릴 수 있습니다.',
    },
    {
      name: '거북이',
      description:
        '프로세스를 중시하니 기준을 먼저 맞추면 품질을 안정적으로 끌어올릴 수 있습니다.',
    },
    {
      name: '보더콜리',
      description: '정리와 조율이 강해 우선순위를 잡아주면 디테일이 더 빠르게 성과로 이어집니다.',
    },
    {
      name: '돌고래',
      description:
        '분위기는 좋아지지만 산만해질 수 있어 체크 항목을 짧게 공유하면 집중도가 올라갑니다.',
    },
  ],

  // ===== 사막여우 =====
  // best: 사자, 고양이 / worst: 카피바라
  사막여우: [
    {
      name: '사막여우',
      description:
        '전략 논의에 치중되면 실행이 늦어질 수 있어, 실행 담당을 분명히 나누는 것이 좋습니다.',
    },
    {
      name: '코끼리',
      description:
        '아이디어를 전략으로 묶는 역할이 잘 맞아, 범위와 우선순위를 함께 잡으면 좋습니다.',
    },
    {
      name: '미어캣',
      description: '디테일이 강해 전략의 빈틈을 메우니 마감 기준을 공유하면 완성도가 올라갑니다.',
    },
    {
      name: '수달',
      description:
        '실행이 빨라 설계가 흐트러질 수 있어 체크포인트를 두면 안정적으로 굴러갑니다.',
    },
    {
      name: '부엉이',
      description: '신중한 검토가 도움이 되니 결정 시점을 정하면 전략 품질이 좋아집니다.',
    },
    {
      name: '늑대',
      description: '지속 가능한 페이스가 강점이라 단계별 목표를 나누면 운영이 안정됩니다.',
    },
    {
      name: '거북이',
      description: '프로세스가 탄탄해지니 기준 문서를 먼저 맞추면 충돌이 줄어듭니다.',
    },
    {
      name: '보더콜리',
      description: '조율과 정리가 강해 전략을 실행 계획으로 고정시키기 좋습니다.',
    },
    {
      name: '돌고래',
      description: '소통 에너지가 높아 아이디어 확산에 좋으니 논의 범위만 잡아주면 효과적입니다.',
    },
  ],

  // ===== 수달 =====
  // best: 고양이, 코끼리 / worst: 미어캣
  수달: [
    {
      name: '수달',
      description: '각자 바로 실행에 들어갈 수 있어, 작업 우선순위를 맞추면 중복을 줄일 수 있습니다.',
    },
    {
      name: '사자',
      description: '결정이 빠르니 실행 방향이 선명해져 속도감 있게 결과를 만들 수 있습니다.',
    },
    {
      name: '카피바라',
      description: '팀 분위기를 안정시켜 실행이 거칠어지지 않게 도와줍니다.',
    },
    {
      name: '사막여우',
      description: '전략을 정리해 주니 실행이 방향을 잃지 않게 잡아줄 수 있습니다.',
    },
    {
      name: '부엉이',
      description: '신중한 판단이 보완이 되니 검증 단계를 짧게 합의하면 효율이 올라갑니다.',
    },
    {
      name: '늑대',
      description: '페이스가 안정적이라 일정만 맞추면 꾸준히 결과를 쌓을 수 있습니다.',
    },
    {
      name: '거북이',
      description: '품질 기준이 강해 안정적으로 완성도를 올리되, 속도 조율을 해두면 좋습니다.',
    },
    {
      name: '보더콜리',
      description: '역할 정리가 명확해 실행이 산으로 가지 않도록 가이드가 잡힙니다.',
    },
    {
      name: '돌고래',
      description: '에너지가 좋지만 산만해질 수 있어 짧은 실행 목표를 공유하면 집중도가 올라갑니다.',
    },
  ],

  // ===== 부엉이 =====
  // best: 수달, 카피바라 / worst: 돌고래
  부엉이: [
    {
      name: '부엉이',
      description:
        '신중함이 겹치면 의사결정이 지연될 수 있어, 판단 기준과 타이밍을 정하면 좋습니다.',
    },
    {
      name: '사자',
      description: '추진력과 균형이 맞아지니 검토 범위와 결론 시점을 합의하면 좋습니다.',
    },
    {
      name: '고양이',
      description:
        '논리 기반이 비슷해 설득력이 강해지되, 결론을 내는 역할을 분담하면 좋습니다.',
    },
    {
      name: '코끼리',
      description: '아이디어의 현실성 점검에 강점이 있어 우선순위만 맞추면 효율이 올라갑니다.',
    },
    {
      name: '미어캣',
      description: '품질 지향이 잘 맞아 산출물이 단단해지니 마감 기준을 공유하면 좋습니다.',
    },
    {
      name: '사막여우',
      description: '전략 정리가 강점이라 판단이 실행 계획으로 연결되기 쉽습니다.',
    },
    {
      name: '늑대',
      description: '안정적인 실행가라 목표와 역할을 명확히 하면 꾸준히 성과를 만들 수 있습니다.',
    },
    {
      name: '거북이',
      description:
        '프로세스가 비슷해 안정적이니 전환 시점을 정해두면 변화 대응이 쉬워집니다.',
    },
    {
      name: '보더콜리',
      description: '질서와 조율이 강해 결정 구조를 세워두면 팀이 흔들리지 않습니다.',
    },
  ],

  // ===== 늑대 =====
  // best: 고양이, 카피바라 / worst: 수달
  늑대: [
    {
      name: '늑대',
      description:
        '안정적인 페이스가 유지되지만 변화 대응이 늦어질 수 있어, 전환 시점을 합의하면 좋습니다.',
    },
    {
      name: '사자',
      description: '추진력을 보완받되 페이스가 깨질 수 있어 일정 리듬을 함께 맞추면 좋습니다.',
    },
    {
      name: '코끼리',
      description: '아이디어를 단계로 나누면 꾸준한 실행 페이스로 현실화하기 쉽습니다.',
    },
    {
      name: '미어캣',
      description: '완성도가 올라가니 역할 범위를 나눠 디테일 과부하를 줄이면 좋습니다.',
    },
    {
      name: '사막여우',
      description:
        '전략과 운영이 맞물려 프로젝트를 ‘완주 가능한 속도’로 끌고 갈 수 있습니다.',
    },
    {
      name: '부엉이',
      description: '판단이 안정적이라 리스크를 줄이되, 결론 타이밍을 정하면 더 효율적입니다.',
    },
    {
      name: '거북이',
      description: '지속성이 강해 장기 프로젝트에 유리하니 중간 점검 지점을 두면 좋습니다.',
    },
    {
      name: '보더콜리',
      description: '조율이 명확해 역할이 깔끔해지니 책임 구간을 정하면 흔들림이 줄어듭니다.',
    },
    {
      name: '돌고래',
      description: '에너지가 올라가지만 산만해질 수 있어 회의 목적을 명확히 잡으면 좋습니다.',
    },
  ],

  // ===== 거북이 =====
  // best: 사자, 카피바라 / worst: 코끼리
  거북이: [
    {
      name: '거북이',
      description: '속도가 느려질 수 있어, 중간 점검 지점을 두면 일정 관리에 도움이 됩니다.',
    },
    {
      name: '고양이',
      description: '기준과 프로세스가 잘 맞아 품질이 안정되니 결정 시점만 정하면 좋습니다.',
    },
    {
      name: '미어캣',
      description: '디테일과 품질이 강해지니 체크리스트를 공유하면 효율이 올라갑니다.',
    },
    {
      name: '사막여우',
      description: '전략을 정리해 주니 기준이 흐트러지지 않게 유지하기 쉽습니다.',
    },
    {
      name: '수달',
      description: '속도가 빠르니 품질 기준을 먼저 합의하면 안정적으로 실행할 수 있습니다.',
    },
    {
      name: '부엉이',
      description: '신중함이 비슷해 안정적이니 결론 타이밍을 정해 지연을 줄이면 좋습니다.',
    },
    {
      name: '늑대',
      description: '꾸준한 페이스가 잘 맞아 장기 프로젝트에서 안정적으로 완주할 수 있습니다.',
    },
    {
      name: '보더콜리',
      description: '가이드가 명확해 프로세스를 세우기 쉬우니 역할을 분담하면 좋습니다.',
    },
    {
      name: '돌고래',
      description: '분위기는 좋아지지만 집중이 흐트러질 수 있어 회의 산출물을 정하면 좋습니다.',
    },
  ],

  // ===== 보더콜리 =====
  // best: 사막여우, 부엉이 / worst: 코끼리
  보더콜리: [
    {
      name: '보더콜리',
      description: '기준 제시가 겹칠 수 있어, 조율 역할을 분담하면 팀 긴장이 줄어듭니다.',
    },
    {
      name: '사자',
      description: '추진력이 강해 실행이 빨라지니 목표와 기준을 먼저 맞추면 효율이 올라갑니다.',
    },
    {
      name: '고양이',
      description: '논리와 기준이 단단해지니 결정 구조를 정해 지연을 줄이면 좋습니다.',
    },
    {
      name: '카피바라',
      description: '소통 톤을 부드럽게 잡아주니 단호함이 마찰로 번지지 않게 도와줍니다.',
    },
    {
      name: '미어캣',
      description: '우선순위를 잡아주면 디테일이 성과로 이어지기 쉬워집니다.',
    },
    {
      name: '사막여우',
      description: '전략 설계가 명확해져 조율이 실행 계획으로 빠르게 고정됩니다.',
    },
    {
      name: '수달',
      description: '실행이 빠르니 체크포인트를 두면 기준 안에서 속도를 살릴 수 있습니다.',
    },
    {
      name: '늑대',
      description: '책임감 있는 실행가라 역할 경계를 정하면 안정적으로 굴러갑니다.',
    },
    {
      name: '거북이',
      description: '프로세스가 탄탄해지니 기준 문서를 합의하면 품질이 흔들리지 않습니다.',
    },
    {
      name: '돌고래',
      description: '분위기는 좋아지지만 산만해질 수 있어 회의 목적을 명확히 잡으면 좋습니다.',
    },
  ].filter((match) => !['사막여우', '부엉이', '코끼리'].includes(match.name)),

  // ===== 돌고래 =====
  // best: 사자, 수달 / worst: 고양이
  돌고래: [
    {
      name: '돌고래',
      description: '에너지가 분산될 수 있어, 대화의 목적과 결과물을 명확히 하면 집중도가 올라갑니다.',
    },
    {
      name: '코끼리',
      description: '아이디어를 즐겁게 확장할 수 있어 초반 브레인스토밍에서 특히 잘 맞습니다.',
    },
    {
      name: '카피바라',
      description: '공감과 소통이 잘 맞아 팀 분위기를 긍정적으로 유지하는 데 도움이 됩니다.',
    },
    {
      name: '미어캣',
      description: '디테일을 보완해 주니 체크 항목을 짧게 공유하면 산출물이 단단해집니다.',
    },
    {
      name: '사막여우',
      description: '아이디어를 정리해 주어 대화가 실행 계획으로 이어지기 쉽습니다.',
    },
    {
      name: '부엉이',
      description: '균형 잡힌 판단이 도움이 되니 감정 톤과 결론 타이밍만 맞추면 좋습니다.',
    },
    {
      name: '늑대',
      description: '페이스가 안정적이라 역할만 명확하면 꾸준히 협업을 이어갈 수 있습니다.',
    },
    {
      name: '거북이',
      description: '속도는 느릴 수 있어 회의 산출물을 정해두면 안정적으로 진행됩니다.',
    },
    {
      name: '보더콜리',
      description: '가이드가 명확해 방향이 잡히니 자유로운 아이디어를 범위 안에서 정리하면 좋습니다.',
    },
  ],
}

const animalCopy: Record<string, AnimalCopy> = {
  사자: {
    hashtags: ['#결단형리더', '#판을여는사람', '#속도와추진력'],
    report: [
      '당신은 팀에서 의사결정의 속도를 책임지는 사람입니다.',
      '모두가 고민할 때 먼저 방향을 제시하며, 프로젝트의 추진력을 끌어올립니다.',
      '불확실한 상황에서도 주저하지 않고 선택하는 편이라 팀이 앞으로 나아가게 만듭니다.',
      '다만, 속도가 중요한 만큼 세부 검토를 도와줄 파트너와 함께할 때 가장 강력해집니다.',
    ],
    bestMatches: [
      {
        name: '고양이',
        description: '논리적인 판단과 기준을 제시해 사자의 빠른 결정을 안정적으로 뒷받침해 줍니다.',
      },
      {
        name: '사막여우',
        description: '전략과 기획으로 방향을 잡아주어 사자의 추진력이 성과로 이어지게 합니다.',
      },
    ],
    worstMatches: [
      {
        name: '보더콜리',
        description: '주도권 조율이 필요한 조합입니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['사자'],
  },
  고양이: {
    hashtags: ['#논리적사고', '#리스크관리', '#팩트중심'],
    report: [
      '당신은 감정보다 데이터와 근거를 신뢰하는 전략가입니다.',
      '아이디어의 허점을 빠르게 발견하고, 리스크를 미리 차단하는 역할을 합니다.',
      '팀이 흥분하거나 방향을 잃을 때, 냉정한 기준점이 되어줍니다.',
      '기획의 안정성과 설득력을 높이는 데 핵심적인 존재입니다.',
    ],
    bestMatches: [
      {
        name: '사자',
        description: '결정을 내려 주는 역할을 맡아 분석이 실제 실행으로 이어지게 합니다.',
      },
      {
        name: '보더콜리',
        description: '현장에서의 실행과 지원을 담당해 고양이의 판단을 현실화합니다.',
      },
    ],
    worstMatches: [
      {
        name: '돌고래',
        description: '소통 방식의 균형을 맞추면 더 좋아집니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['고양이'],
  },
  코끼리: {
    hashtags: ['#발산형아이디어', '#큰그림설계', '#확장적사고'],
    report: [
      '당신은 프로젝트 초반에 가장 많은 아이디어를 만들어내는 원천입니다.',
      '기존의 틀에 얽매이지 않고 큰 그림을 그리며 새로운 가능성을 제시합니다.',
      '팀에 자극과 영감을 주는 역할을 하지만, 실행을 구체화해 줄 동료가 있으면 더 빛납니다.',
      '아이디어 단계에서 팀의 상한선을 끌어올리는 타입입니다.',
    ],
    bestMatches: [
      {
        name: '사자',
        description: '큰 그림과 아이디어를 결단력 있는 실행으로 연결해 줍니다.',
      },
      {
        name: '수달',
        description: '아이디어를 빠르게 실험하고 실행해 현실적인 결과를 만듭니다.',
      },
    ],
    worstMatches: [
      {
        name: '거북이',
        description: '변화와 기준의 속도를 맞추면 안정적입니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['코끼리'],
  },
  카피바라: {
    hashtags: ['#팀분위기메이커', '#갈등중재', '#협업중심'],
    report: [
      '당신은 팀의 분위기와 관계를 관리하는 허브입니다.',
      '의견 충돌 상황에서도 감정을 조율하며 대화를 이어가게 만듭니다.',
      '모두가 편하게 의견을 낼 수 있는 환경을 조성해 협업 효율을 높입니다.',
      '팀워크가 중요한 프로젝트에서 특히 큰 힘을 발휘합니다.',
    ],
    bestMatches: [
      {
        name: '고양이',
        description: '명확한 기준과 판단을 제공해 소통이 안정적으로 이루어지게 합니다.',
      },
      {
        name: '거북이',
        description: '차분한 진행과 꾸준함으로 팀의 지속력을 높여 줍니다.',
      },
    ],
    worstMatches: [
      {
        name: '사막여우',
        description: '감정과 논리의 결을 조율하면 시너지가 납니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['카피바라'],
  },
  미어캣: {
    hashtags: ['#완성도집착', '#체크리스트형', '#마감수호자'],
    report: [
      '당신은 결과물의 완성도를 끝까지 책임지는 사람입니다.',
      '사소해 보이는 오류나 빠진 요소도 놓치지 않고 점검합니다.',
      '마감 직전까지 집중력을 유지하며 품질을 끌어올립니다.',
      '팀의 신뢰를 받는 ‘마지막 안전장치’ 역할을 합니다.',
    ],
    bestMatches: [
      {
        name: '사자',
        description: '방향과 우선순위를 제시해 미어캣의 디테일이 성과로 이어지게 합니다.',
      },
      {
        name: '코끼리',
        description: '아이디어를 구체화할 재료를 제공해 디테일을 살릴 수 있게 합니다.',
      },
    ],
    worstMatches: [
      {
        name: '수달',
        description: '속도와 절차의 균형을 맞추면 강점이 살아납니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['미어캣'],
  },
  사막여우: {
    hashtags: ['#전략적사고', '#균형형플레이어', '#아이디어실행연결'],
    report: [
      '당신은 아이디어와 현실 사이를 연결하는 조율자입니다.',
      '창의적인 발상과 논리적인 구조를 동시에 고려합니다.',
      '팀 내 다양한 의견을 정리해 실행 가능한 전략으로 바꾸는 데 능숙합니다.',
      '리더를 보조하며 프로젝트의 균형을 잡아주는 타입입니다.',
    ],
    bestMatches: [
      {
        name: '사자',
        description: '사막여우의 전략을 빠르게 실행에 옮겨 결과로 만들어 줍니다.',
      },
      {
        name: '고양이',
        description: '논리와 기준을 함께 세워 전략의 완성도를 높여 줍니다.',
      },
    ],
    worstMatches: [
      {
        name: '카피바라',
        description: '합의 중심 소통이 많아 전략 결정 속도가 느려질 수 있습니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['사막여우'],
  },
  수달: {
    hashtags: ['#실행력끝판왕', '#툴활용능력', '#현실화전문'],
    report: [
      '당신은 생각을 실제 결과물로 바꾸는 실행 전문가입니다.',
      '툴, 기술, 방법을 빠르게 습득해 문제 해결에 적용합니다.',
      '아이디어가 멈춰 있을 때, 손에 잡히는 결과를 만들어냅니다.',
      '실무 중심 프로젝트에서 팀의 생산성을 크게 높입니다.',
    ],
    bestMatches: [
      {
        name: '고양이',
        description: '구조와 판단을 보완해 실행 속도가 방향을 잃지 않게 합니다.',
      },
      {
        name: '코끼리',
        description: '풍부한 아이디어를 실행으로 빠르게 옮길 수 있게 합니다.',
      },
    ],
    worstMatches: [
      {
        name: '미어캣',
        description: '속도와 기준의 조율이 중요합니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['수달'],
  },
  부엉이: {
    hashtags: ['#냉철한판단', '#논리중재', '#안정적결정'],
    report: [
      '당신은 감정에 휘둘리지 않는 이성적 판단자입니다.',
      '갈등 상황에서도 한 발 떨어져 구조적으로 문제를 분석합니다.',
      '팀이 극단적인 선택으로 치우치지 않도록 균형을 맞춥니다.',
      '안정성과 지속성이 중요한 프로젝트에서 강점을 가집니다.',
    ],
    bestMatches: [
      {
        name: '수달',
        description: '실행력을 보완해 신중함이 지연으로 이어지지 않게 합니다.',
      },
      {
        name: '카피바라',
        description: '갈등을 줄이고 조율 중심의 협업을 가능하게 합니다.',
      },
    ],
    worstMatches: [
      {
        name: '돌고래',
        description: '에너지와 집중의 균형을 맞추면 좋습니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['부엉이'],
  },
  늑대: {
    hashtags: ['#팀플추진', '#안정적실행', '#지속가능페이스'],
    report: [
      '당신은 팀의 리듬을 지키면서도 결과를 끝까지 밀어붙이는 사람입니다.',
      '혼자 튀기보다 협업 속에서 실행력을 꾸준히 발휘합니다.',
      '급변하는 상황에서도 팀이 흔들리지 않게 중심을 잡아줍니다.',
      '프로젝트를 “완주 가능한 속도”로 운영하는 안정형 실행가입니다.',
    ],
    bestMatches: [
      {
        name: '고양이',
        description: '판단과 기준을 제공해 책임 있는 실행이 흔들리지 않게 합니다.',
      },
      {
        name: '카피바라',
        description: '소통과 중재로 팀 내 역할 수행이 안정적으로 유지됩니다.',
      },
    ],
    worstMatches: [
      {
        name: '수달',
        description: '페이스 조율이 필요합니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['늑대'],
  },
  거북이: {
    hashtags: ['#안정형완주', '#품질수호', '#리스크관리'],
    report: [
      '당신은 프로젝트의 품질과 안정성을 책임지는 사람입니다.',
      '속도보다 “지속 가능하고 확실한 방식”을 선호합니다.',
      '기준과 프로세스를 세워 결과물이 흔들리지 않게 만듭니다.',
      '팀이 급하게 가도 마지막에 무너지지 않도록 버팀목이 됩니다.',
    ],
    bestMatches: [
      {
        name: '사자',
        description: '추진력을 더해 완성도 높은 결과를 제시간에 만들어 줍니다.',
      },
      {
        name: '카피바라',
        description: '편안한 협업 분위기로 장기적인 안정성을 높여 줍니다.',
      },
    ],
    worstMatches: [
      {
        name: '코끼리',
        description: '아이디어 확장 속도를 맞추면 좋습니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['거북이'],
  },
  보더콜리: {
    hashtags: ['#명확한가이드', '#단호한중재자', '#효율적조율', '#스마트워커'],
    report: [
      '당신은 팀의 방향이 모호할 때 질서를 잡고 목표를 향해 사람들을 정렬시키는 능력이 탁월합니다.',
      '사람들 사이의 갈등을 해결할 때 감정에 치우치기보다, 전체의 이익과 효율을 고려해 단호한 중재안을 내놓습니다.',
      '협업 시 각자의 역할이 무엇인지 명확히 규정해주며, 팀원들이 본인의 몫을 다할 수 있도록 적절한 긴장감을 유지시킵니다.',
      '똑똑하게 일하는 것을 선호하며, 불필요한 감정 소모보다는 목표 달성을 위한 생산적인 소통을 지향합니다.',
    ],
    bestMatches: [
      {
        name: '사막여우',
        description: '전략적 설계와 단호한 조율이 만나 빈틈없는 실행력을 만듭니다.',
      },
      {
        name: '부엉이',
        description: '질서와 균형의 조화를 이룹니다.',
      },
    ],
    worstMatches: [
      {
        name: '코끼리',
        description: '아이디어 확장 속도를 조율하면 시너지가 납니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['보더콜리'],
  },
  돌고래: {
    hashtags: ['#긍정시너지', '#활기찬소통', '#팀에너지업', '#공감능력자'],
    report: [
      '당신은 팀원들 사이를 자유롭게 오가며 긍정적인 에너지를 전파하고 소통의 물꼬를 트는 전문가입니다.',
      '딱딱하고 경직된 회의 분위기를 유연하게 바꾸며, 모두가 자신의 의견을 편하게 말할 수 있는 환경을 조성합니다.',
      '타인의 장점을 발견하고 칭찬하는 데 인색하지 않아, 당신과 함께 일하는 동료들은 심리적 안정감과 자신감을 얻습니다.',
      '사람 중심의 사고를 하기에 팀의 결속력을 다지는 데 핵심적인 역할을 하며, 외부와의 협조를 이끌어내는 네트워킹에도 능숙합니다.',
    ],
    bestMatches: [
      {
        name: '사자',
        description: '결정과 추진을 맡아 팀의 에너지가 실제 성과로 연결됩니다.',
      },
      {
        name: '수달',
        description: '활력 있는 실행으로 팀 분위기를 행동으로 이어 줍니다.',
      },
    ],
    worstMatches: [
      {
        name: '고양이',
        description: '팩트와 감정의 톤을 맞추면 잘 맞습니다.',
      },
    ],
    normalMatches: normalMatchesByAnimal['돌고래'],
  },
}

const fallbackReport = ['결과 리포트 준비 중입니다.']

const animalImages = import.meta.glob('../assets/animals/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const getAnimalImage = (animalName: string) => {
  const key = `../assets/animals/${animalName}.png`
  if (animalImages[key]) return animalImages[key]
  return animalImages['../assets/animals/default.png']
}

const traitLabels: Record<Trait, string> = {
  decisiveness: '결단력',
  creativity: '창의성',
  logic: '논리력',
  acceptance: '수용력',
  completeness: '완결성',
}

const isNormalizedScores = (scores: ScoreMap) => {
  const values = Object.values(scores)
  return values.some((value) => value > 12)
}

const isAnimalId = (value: unknown): value is AnimalId =>
  typeof value === 'string' && ANIMAL_IDS.includes(value as AnimalId)

const resolveAnimalMeta = (animalType?: string | null) => {
  if (isAnimalId(animalType)) return ANIMALS_V2[animalType]

  if (animalType) {
    const matched = Object.values(ANIMALS_V2).find((animal) => animal.name === animalType)
    if (matched) return matched
  }

  return DEFAULT_ANIMAL
}

const getAnimalLabel = (name: string) => {
  const matched = Object.values(ANIMALS_V2).find((animal) => animal.name === name)
  if (!matched) return name
  return `${matched.title}, ${matched.name}`
}

const getTemperatureMeta = (temperature?: ResultPayload['temperature']) => {
  if (temperature === 'HOT') return { icon: '🔥', label: 'HOT', className: 'temp-hot' }
  if (temperature === 'COOL') return { icon: '❄', label: 'COOL', className: 'temp-cool' }
  return { icon: '🌤', label: 'WARM', className: 'temp-warm' }
}

const getTemperatureTooltip = (temperature?: ResultPayload['temperature']) => {
  if (temperature === 'HOT') return '빠른 실행과 강한 추진력으로 팀을 이끕니다.'
  if (temperature === 'COOL') return '신중한 판단과 분석으로 리스크를 줄입니다.'
  return '팀 분위기를 살피며 안정적으로 협업을 이끕니다.'
}

const getTraitSummary = (scores: ScoreMap) => {
  const ordered = [...traitKeys].sort((a, b) => scores[b] - scores[a])
  const top1 = ordered[0]
  const top2 = ordered[1]
  const bottom = ordered[ordered.length - 1]

  const labels: Record<Trait, string> = {
    decisiveness: '결정력',
    creativity: '창의성',
    logic: '논리력',
    acceptance: '수용력',
    completeness: '완결성',
  }

  const lowPhrases: Record<Trait, string> = {
    decisiveness: '속도보다는 안정적인 방향을 선호합니다',
    creativity: '새로운 시도보다는 검증된 방식을 선호합니다',
    logic: '논리보다는 관계 중심으로 움직이는 타입입니다',
    acceptance: '수용보다는 기준과 결과에 집중합니다',
    completeness: '완결성보다는 실행 속도에 무게를 둡니다',
  }

  return `${labels[top1]}과 ${labels[top2]}이 높고, ${lowPhrases[bottom]}.`
}

const getTraitReason = (scores: ScoreMap) => {
  const ordered = [...traitKeys].sort((a, b) => scores[b] - scores[a])
  const top1 = ordered[0]
  const top2 = ordered[1]
  const phrases: Record<Trait, string> = {
    decisiveness: '결정/추진력',
    creativity: '아이디어 도출',
    logic: '기획/분석',
    acceptance: '소통/협업',
    completeness: '완성도 관리',
  }
  return `${phrases[top1]}과 ${phrases[top2]}이 중요한 프로젝트에 적합`
}

function Result() {
  const navigate = useNavigate()
  const { sessionId: routeSessionId } = useParams<{ sessionId?: string }>()
  const [result, setResult] = useState<ResultPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isNormalOpen, setIsNormalOpen] = useState(false)
  const [expandedNormalMatches, setExpandedNormalMatches] = useState<string[]>([])
  const resultRef = useRef<HTMLDivElement | null>(null)
  const shareUrl = useMemo(() => {
    const sessionId = routeSessionId ?? localStorage.getItem('sessionId')
    return sessionId ? `${window.location.origin}/result/${sessionId}` : window.location.href
  }, [routeSessionId])

  useEffect(() => {
    const run = async () => {
      const storedSessionId = localStorage.getItem('sessionId')
      const sessionId = routeSessionId ?? storedSessionId
      if (!sessionId) {
        navigate('/test/start')
        return
      }
      if (routeSessionId) {
        localStorage.setItem('sessionId', routeSessionId)
      }

      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle()

      if (error || !data) {
        setErrorMessage('결과를 불러오지 못했습니다. 다시 시도해주세요.')
        setLoading(false)
        return
      }

      const row = data as TestSessionRow
      const scoresAreNormalized = isNormalizedScores(row.scores)
      const scoresNormalized = scoresAreNormalized ? row.scores : normalizeScores(row.scores)
      const orderedTraits = getTraitOrder(row.scores)
      const primaryTrait = orderedTraits[0]
      const secondaryTrait = orderedTraits[1]
      const scoreGap = row.scores[primaryTrait] - row.scores[secondaryTrait]
      const isHybrid = scoreGap <= 1
      const animalMeta = resolveAnimalMeta(row.animal_type)

      const payload: ResultPayload = {
        sessionId: row.id,
        answers: row.answers,
        scoresRaw: row.scores,
        scoresNormalized,
        primaryTrait,
        secondaryTrait,
        animalId: animalMeta.id,
        animalName: animalMeta.name,
        isHybrid,
        temperature: row.temperature ?? 'WARM',
        teamGuide: row.team_guide ?? '-',
        hashtags: row.hashtags ?? [],
        updatedAt: row.created_at,
      }

      setResult(payload)
      setLoading(false)
    }

    run()
  }, [navigate, routeSessionId])

  useEffect(() => {
    if (!copyMessage) return
    const timer = window.setTimeout(() => setCopyMessage(''), 2000)
    return () => window.clearTimeout(timer)
  }, [copyMessage])

  useEffect(() => {
    if (!isShareOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShareOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isShareOpen])

  useEffect(() => {
    setIsNormalOpen(false)
    setExpandedNormalMatches([])
  }, [result?.animalId])

  const chartData = useMemo(() => {
    if (!result) return null
    const data = traitKeys.map((trait) => result.scoresNormalized[trait])
    return {
      labels: traitKeys.map((trait) => traitLabels[trait]),
      datasets: [
        {
          label: '성향 점수',
          data,
          backgroundColor: 'rgba(30, 64, 175, 0.18)',
          borderColor: 'rgba(30, 64, 175, 0.9)',
          pointBackgroundColor: '#1e40af',
          borderWidth: 2,
          tension: 0,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    }
  }, [result])

  const chartOptions = useMemo<ChartOptions<'radar'>>(
    () => ({
      responsive: true,
      layout: {
        padding: 12,
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: '#7b8794',
            backdropColor: 'transparent',
          },
          grid: {
            color: '#e4e7eb',
          },
          angleLines: {
            color: '#e4e7eb',
          },
          pointLabels: {
            color: '#1f2933',
            font: {
              size: 12,
              weight: 600,
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
      onClick: (event: ChartEvent, _elements: ActiveElement[], chart: ChartJS) => {
        if (!chart?.tooltip) return
        const points = chart.getElementsAtEventForMode(
          (event.native ?? event) as unknown as Event,
          'nearest',
          { intersect: true },
          true,
        )
        if (points.length === 0) return
        chart.tooltip.setActiveElements(points, { x: event.x, y: event.y })
        chart.update()
      },
    }),
    [],
  )

  const topMatches = useMemo(() => {
    if (!result) return []
    return contests
      .map((contest) => {
        const similarity = getCosineSimilarity(result.scoresNormalized, contest.requiredTraits)
        return { contest, similarity: similarity.score }
      })
      .filter((item) => item.similarity >= 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
  }, [result])

  const toggleNormalMatch = (name: string) => {
    setExpandedNormalMatches((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      console.info('[SHARE] copied')
      setCopyMessage('링크가 복사되었습니다!')
    } catch {
      console.info('[SHARE] copy failed')
      setCopyMessage('복사에 실패했습니다.')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '대외활동 유형 테스트 결과',
          url: shareUrl,
        })
        return
      } catch {
        setCopyMessage('공유에 실패했습니다.')
        return
      }
    }

    setCopyMessage('공유 기능을 지원하지 않는 브라우저입니다.')
  }

  const handleShareOpen = () => {
    console.info('[UI] open share sheet')
    setIsShareOpen(true)
  }

  const handleSaveImage = async () => {
    if (!resultRef.current) return

    try {
      const dataUrl = await toPng(resultRef.current, {
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = 'result.png'
      link.href = dataUrl
      link.click()
      console.info('[SAVE] result.png downloaded')
    } catch {
      setCopyMessage('이미지 저장에 실패했습니다.')
    }
  }

  const handleRestart = () => {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('ainnov_session_v1')
    navigate('/test/start')
  }


  if (loading) {
    return (
      <div className="page">
        <div className="container card">
          <h1>결과를 계산 중입니다...</h1>
        </div>
      </div>
    )
  }

  const animalMeta = resolveAnimalMeta(result?.animalId)
  const animalInfo = result ? animalCopy[animalMeta.name] : undefined
  const animalReport = animalInfo?.report ?? fallbackReport
  const animalBestMatches =
    animalInfo?.bestMatches ?? [{ name: '준비 중', description: '궁합 정보가 없습니다.' }]
  const animalWorstMatches =
    animalInfo?.worstMatches ?? [{ name: '준비 중', description: '궁합 정보가 없습니다.' }]
  const normalMatches =
    animalInfo?.normalMatches ?? normalMatchesByAnimal[animalMeta.name] ?? []
  const animalHashtags =
    result?.hashtags?.length ? result.hashtags : animalInfo?.hashtags ?? animalMeta.hashtags ?? []
  const animalTitle = animalMeta.title ? `${animalMeta.title}, ${animalMeta.name}` : result?.animalName ?? '결과 요약'
const animalSummary: Partial<Record<string, string>> = {
  사자: '빠른 결단과 추진으로 팀의 방향을 선명하게 잡아주는 핵심 리더형입니다.',
  고양이: '논리와 기준으로 리스크를 줄이며 판단의 정확도를 높이는 분석 중심형입니다.',
  코끼리: '큰 그림과 아이디어로 프로젝트의 가능 상한선을 끌어올리는 발상가형입니다.',
  카피바라: '분위기와 관계를 조율해 협업의 흐름을 안정적으로 이어주는 조율자형입니다.',
  미어캣: '디테일 점검과 마감 관리를 통해 결과물의 완성도를 끌어올리는 품질 관리형입니다.',
  사막여우: '전략을 실행으로 연결하며 팀의 균형을 잡아주는 서포트 리더형입니다.',
  수달: '툴과 실행력을 기반으로 아이디어를 결과로 전환시키는 실행 중심형입니다.',
  부엉이: '냉철한 판단과 균형 감각으로 팀의 리스크를 낮추는 중재자형입니다.',
  늑대: '꾸준한 페이스로 팀의 진행을 안정적으로 유지하는 지속 실행형입니다.',
  거북이: '프로세스와 기준을 지키며 장기적인 완주와 안정성을 이끄는 안정 관리형입니다.',
  보더콜리: '역할과 우선순위를 정리해 팀의 효율을 체계적으로 끌어올리는 운영 가이드형입니다.',
  돌고래: '활기찬 소통으로 팀의 에너지와 참여도를 높이는 커뮤니케이터형입니다.',
}

  const summaryText = animalSummary[animalMeta.name]
  const tempMeta = getTemperatureMeta(result?.temperature)
  const tempTooltip = getTemperatureTooltip(result?.temperature)
  const traitSummary = result ? getTraitSummary(result.scoresNormalized) : ''
  const contestReason = result ? getTraitReason(result.scoresNormalized) : ''

  return (
    <div className="page result-shell">
      <div className="container result-page" ref={resultRef}>
        <div className="result-grid">
          <div className="result-left">
            <section className="card">
              <p className="eyebrow">EV-03 RESULT</p>
              <h1>{animalTitle}</h1>
              <div className="hashtags">
                {animalHashtags.map((tag: string) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="animal-hero">
                <div className="animal-visual">
                  <img
                    src={getAnimalImage(animalMeta.name)}
                    alt={result?.animalName ?? '동물 이미지'}
                  />
                </div>
                <div className="result-summary result-summary-compact">
                  <div className="result-item">
                    <span>동물 타입</span>
                    <strong>{result?.animalName ?? '-'}</strong>
                  </div>
                  <div className="result-item">
                    <span>협업 온도</span>
                    <div className="temp-wrap">
                      <strong className={`temp-chip ${tempMeta.className}`}>
                        <span aria-hidden="true">{tempMeta.icon}</span> {tempMeta.label}
                      </strong>
                      <span className="tooltip tooltip-right">
                        <button type="button" className="tooltip-icon" aria-label={tempTooltip}>
                          ?
                        </button>
                        <span className="tooltip-content">{tempTooltip}</span>
                      </span>
                    </div>
                  </div>
                  <div className="result-item">
                    <span>팀 규모 가이드</span>
                    <strong>{result?.teamGuide ?? '-'}</strong>
                  </div>
                </div>
              </div>
              {summaryText ? <p className="result-summary-text">{summaryText}</p> : null}
              {errorMessage ? <p className="error">{errorMessage}</p> : null}
            </section>

            <section className="card">
              <div className="section-head">
                <h2>
                  성향 레이더
                  <span className="tooltip tooltip-left">
                    <button type="button" className="tooltip-icon" aria-label="협업 성향 지표 설명">
                      ?
                    </button>
                    <span className="tooltip-content">
                      팀 내 의사결정과 실행 속도를 기준으로 한 협업 성향 지표입니다.
                    </span>
                  </span>
                </h2>
              </div>
              {chartData ? <Radar data={chartData} options={chartOptions} /> : null}
              {result ? (
                <div className="chart-values">
                  {traitKeys.map((trait) => (
                    <div key={`trait-${trait}`} className="chart-value">
                      <span>{traitLabels[trait]}</span>
                      <strong>{Math.round(result.scoresNormalized[trait])}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
              {traitSummary ? <p className="chart-summary">{traitSummary}</p> : null}
              <div className="report">
                {animalReport.map((line, index) => (
                  <p key={`${animalMeta.id}-report-${index}`}>{line}</p>
                ))}
              </div>
            </section>
          </div>

          <div className="result-right">
            <section className="card">
              <div className="section-head">
                <h2>궁합</h2>
              </div>
              <div className="match-box match-good">
                <p className="subtitle match-title">
                  <span className="match-title-bar" aria-hidden="true" />
                  👍 찰떡인 궁합 {animalBestMatches.length}
                </p>
                <div className="match-grid">
                  {animalBestMatches.map((match) => (
                    <div key={`${match.name}-best`} className="match-row">
                      <span className="match-icon">
                        <img src={getAnimalImage(match.name)} alt={match.name} className="match-avatar" />
                      </span>
                      <div className="match-content">
                        <strong>{getAnimalLabel(match.name)}</strong>
                        <span>{match.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="match-box match-caution">
                <p className="subtitle match-title">
                  <span className="match-title-bar" aria-hidden="true" />
                  ⚠️ 조율이 필요한 궁합 {animalWorstMatches.length}
                </p>
                <div className="match-grid">
                  {animalWorstMatches.map((match) => (
                    <div key={`${match.name}-worst`} className="match-row">
                      <span className="match-icon">
                        <img src={getAnimalImage(match.name)} alt={match.name} className="match-avatar" />
                      </span>
                      <div className="match-content">
                        <strong>{getAnimalLabel(match.name)}</strong>
                        <span>{match.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="match-toggle"
                onClick={() => setIsNormalOpen((prev) => !prev)}
              >
                {isNormalOpen ? '다른 동물들과의 궁합 접기 ▴' : '다른 동물들과의 궁합 더보기 ▾'}
              </button>
              {isNormalOpen ? (
                <div className="match-box match-normal">
                  <p className="subtitle match-title">
                    <span className="match-title-bar" aria-hidden="true" />
                    무난한 궁합
                  </p>
                  <p className="match-description">
                    역할에 따라 안정적으로 협업할 수 있는 관계입니다.
                  </p>
                  <div className="normal-grid">
                    {normalMatches.map((match) => {
                      const isOpen = expandedNormalMatches.includes(match.name)
                      return (
                        <button
                          key={`${match.name}-normal`}
                          type="button"
                          className={`normal-row${isOpen ? ' is-open' : ''}`}
                          onClick={() => toggleNormalMatch(match.name)}
                          aria-expanded={isOpen}
                        >
                          <span className="match-icon">
                            <img
                              src={getAnimalImage(match.name)}
                              alt={match.name}
                              className="match-avatar"
                            />
                          </span>
                          <div className="match-content">
                            <strong>{getAnimalLabel(match.name)}</strong>
                            {isOpen ? (
                              <span className="normal-description">{match.description}</span>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="card">
              <div className="section-head">
                <h2>결과 공유하기</h2>
              </div>
              <div className="cta-inline">
                <button type="button" className="primary-button" onClick={handleShareOpen}>
                  결과 공유하기
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate('/team-finder')}
                >
                  팀원 찾기
                </button>
              </div>
            </section>

            <section className="card">
              <div className="section-head">
                <h2>추천 공모전</h2>
                <span className="subtitle">유사도 70% 이상</span>
              </div>
              <div className="contest-list">
                {topMatches.length === 0 ? (
                  <p className="subtitle">현재 조건에 맞는 공모전이 없습니다.</p>
                ) : (
                  topMatches.map(({ contest, similarity }) => (
                    <button
                      key={contest.id}
                      type="button"
                      className="contest-card"
                      onClick={() => navigate(`/contest/${contest.id}`)}
                    >
                      <div
                        className="contest-thumb"
                        style={{ backgroundImage: `url(${contest.thumbUrl})` }}
                      />
                      <div className="contest-body">
                        <h3>{contest.title}</h3>
                        <p className="contest-meta">{contest.dDay}</p>
                        <div className="contest-tags">
                          {contest.tags.map((tag: string) => (
                            <span key={`${contest.id}-${tag}`} className="chip chip-light">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <p className="contest-meta">유사도 {(similarity * 100).toFixed(0)}%</p>
                        <p className="contest-reason">{contestReason}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <a
                className="secondary-button contest-more"
                href="https://ainnov.co.kr/"
                target="_blank"
                rel="noreferrer"
              >
                더 보러가기
              </a>
            </section>

          </div>
        </div>

        <div className="result-actions">
          <button type="button" className="primary-button" onClick={handleSaveImage}>
            결과 저장하기
          </button>
          <button type="button" className="secondary-button" onClick={handleRestart}>
            다시하기
          </button>
        </div>
      </div>

      {isShareOpen ? (
        <div className="share-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="share-backdrop"
            onClick={() => setIsShareOpen(false)}
            aria-label="공유 닫기"
          />
          <div className="share-sheet">
            <div className="share-header">
              <strong>공유하기</strong>
              <button type="button" className="share-close" onClick={() => setIsShareOpen(false)}>
                닫기
              </button>
            </div>
            <div className="share-actions">
              <button type="button" className="share-card" onClick={handleCopy}>
                링크 복사
              </button>
              <button type="button" className="share-card" onClick={handleShare}>
                공유하기
              </button>
            </div>
            {copyMessage ? <p className="toast">{copyMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Result
