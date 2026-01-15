import type { Question, Trait } from '../types/test'

export const traitKeys: Trait[] = [
  'decisiveness',
  'creativity',
  'logic',
  'acceptance',
  'completeness',
]

export const questions: Question[] = [
  {
    text: '팀 회의 중 주제를 결정할 때, 나의 태도는?',
    options: [
      {
        label: 'A',
        text: '리스크가 있더라도 판을 흔들 수 있는 새로운 기획을 제안한다.',
        trait: 'creativity',
      },
      {
        label: 'B',
        text: '역대 수상작을 분석해 가장 승률이 높은 안정적인 기획을 제안한다.',
        trait: 'logic',
      },
    ],
  },
  {
    text: '단톡방에서 의견이 팽팽하게 갈려 진행이 멈췄다면?',
    options: [
      {
        label: 'A',
        text: '팀원들의 기분을 살피며 대화로 접점을 찾으려 노력한다.',
        trait: 'acceptance',
      },
      {
        label: 'B',
        text: '감정을 배제하고 현재 상황에서 가장 효율적인 결정 방식을 제시한다.',
        trait: 'decisiveness',
      },
    ],
  },
  {
    text: '벤치마킹을 위해 자료조사를 할 때, 내가 주로 찾는 곳은?',
    options: [
      {
        label: 'A',
        text: '최신 트렌드 리포트나 해외 아카이브 등 영감을 줄 수 있는 곳',
        trait: 'creativity',
      },
      {
        label: 'B',
        text: '공신력 있는 통계, 논문, 뉴스 등 팩트를 증명할 수 있는 곳',
        trait: 'logic',
      },
    ],
  },
  {
    text: '역할 분담 시간, 내가 가장 자신 있게 맡을 수 있는 영역은?',
    options: [
      {
        label: 'A',
        text: '전체적인 방향성을 설정하고 팀원들의 일정을 매니징하는 역할',
        trait: 'decisiveness',
      },
      {
        label: 'B',
        text: '아이디어를 구체화하고 결과물의 완성도를 높이는 실무 역할',
        trait: 'completeness',
      },
    ],
  },
  {
    text: '새로운 협업 툴이나 방법론을 도입하자는 의견에 대해 나는?',
    options: [
      {
        label: 'A',
        text: '더 효율적인 결과물을 위해 적극적으로 배우고 시도해본다.',
        trait: 'creativity',
      },
      {
        label: 'B',
        text: '익숙한 방식을 유지해 시행착오를 줄이고 속도를 높이는 데 집중한다.',
        trait: 'completeness',
      },
    ],
  },
  {
    text: '회의가 길어져 팀원들이 지쳐 보일 때, 나의 행동은?',
    options: [
      {
        label: 'A',
        text: '가벼운 농담이나 휴식을 제안해 팀 분위기를 환기시킨다.',
        trait: 'acceptance',
      },
      {
        label: 'B',
        text: '논의 사항을 빠르게 요약·정리해 집중력을 유지한다.',
        trait: 'completeness',
      },
    ],
  },
  {
    text: '중간 보고에서 예상치 못한 날카로운 피드백을 받았다면?',
    options: [
      {
        label: 'A',
        text: '즉시 대안(Plan B)을 도출해 빠르게 방향을 수정한다.',
        trait: 'decisiveness',
      },
      {
        label: 'B',
        text: '피드백의 근거를 분석해 논리의 부족 지점을 점검한다.',
        trait: 'logic',
      },
    ],
  },
  {
    text: '마감 직전, 담당 팀원의 작업이 늦어져 일정이 밀릴 것 같다면?',
    options: [
      {
        label: 'A',
        text: '팀원의 상황을 먼저 파악하고 부족한 부분을 함께 도와 마감한다.',
        trait: 'acceptance',
      },
      {
        label: 'B',
        text: '진행 상황을 냉정히 체크하고 마감 기한을 엄격히 독촉한다.',
        trait: 'decisiveness',
      },
    ],
  },
  {
    text: '기술적 한계로 원래 기획했던 기능을 구현할 수 없게 된다면?',
    options: [
      {
        label: 'A',
        text: '기획의 본질은 유지하되 전혀 다른 방식의 창의적 우회로를 찾는다.',
        trait: 'creativity',
      },
      {
        label: 'B',
        text: '구현 가능한 범위로 기획을 수정하고 완성도에 집중한다.',
        trait: 'logic',
      },
    ],
  },
  {
    text: '최종 제출 1시간 전, 내가 마지막까지 붙잡고 있는 것은?',
    options: [
      {
        label: 'A',
        text: '오타·정렬·픽셀 단위의 디자인 디테일과 문서 결점 보완',
        trait: 'completeness',
      },
      {
        label: 'B',
        text: '심사위원을 설득할 수 있는 전체 스토리텔링과 논리 흐름 점검',
        trait: 'decisiveness',
      },
    ],
  },
  {
    text: '프로젝트 종료 후, 팀원에게 들었을 때 가장 뿌듯한 말은?',
    options: [
      {
        label: 'A',
        text: '“너 덕분에 우리 팀 분위기가 끝까지 좋았어.”',
        trait: 'acceptance',
      },
      {
        label: 'B',
        text: '“너의 날카로운 분석이 없었으면 수상은 불가능했을 거야.”',
        trait: 'logic',
      },
    ],
  },
  {
    text: '다음 프로젝트를 위해 새로운 팀원을 구한다면, 누구와 함께할까?',
    options: [
      {
        label: 'A',
        text: '나를 믿고 방향성에 맞춰 묵묵히 결과물을 만들어줄 믿음직한 파트너',
        trait: 'decisiveness',
      },
      {
        label: 'B',
        text: '끊임없이 새로운 관점과 신선한 자극을 주는 아이디어 뱅크',
        trait: 'creativity',
      },
    ],
  },
]
