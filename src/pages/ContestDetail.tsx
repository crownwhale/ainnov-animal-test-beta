import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { contests } from '../data/contests'
import { getCosineSimilarity } from '../lib/recommend'
import type { ScoreMap } from '../types/test'

function ContestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  const contest = useMemo(() => contests.find((item) => item.id === id), [id])

  const insight = useMemo(() => {
    const resultRaw = localStorage.getItem('ainnov_result_v1')
    if (!resultRaw || !contest) return ''

    try {
      const parsed = JSON.parse(resultRaw) as { scoresNormalized?: ScoreMap }
      if (!parsed.scoresNormalized) return ''
      const similarity = getCosineSimilarity(parsed.scoresNormalized, contest.requiredTraits)
      const topTraits = Object.entries(parsed.scoresNormalized)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 2)
        .map(([key]) => key)
      return `강점(${topTraits.join(
        ', ',
      )})이 공모전의 핵심 역량과 ${(similarity.score * 100).toFixed(0)}% 일치합니다.`
    } catch {
      return ''
    }
  }, [contest])

  const handleScrap = () => {
    if (!contest) return
    const raw = localStorage.getItem('ainnov_scraps_v1')
    const current = raw ? (JSON.parse(raw) as string[]) : []
    const next = current.includes(contest.id) ? current : [...current, contest.id]
    localStorage.setItem('ainnov_scraps_v1', JSON.stringify(next))
    setMessage('스크랩에 저장되었습니다.')
    window.setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="page">
      <div className="container card detail-card">
        <button type="button" className="link-button" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        {contest ? (
          <>
            <div
              className="detail-hero"
              style={{ backgroundImage: `url(${contest.thumbUrl})` }}
            >
              <span className="detail-dday">{contest.dDay}</span>
            </div>
            <h1>{contest.title}</h1>
            <p className="subtitle">{contest.period}</p>
            <div className="insight-card">
              <strong>왜 추천됐는지</strong>
              <p>{insight || '당신의 강점이 공모전의 요구 역량과 잘 맞습니다.'}</p>
            </div>
            <div className="detail-tags">
              {contest.tags.map((tag) => (
                <span key={`${contest.id}-${tag}`} className="chip chip-light">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="detail-meta">
              <div>
                <span>상금</span>
                <strong>{contest.prize}</strong>
              </div>
              <div>
                <span>접수 마감</span>
                <strong>{contest.deadline}</strong>
              </div>
            </div>
            {message ? <p className="toast">{message}</p> : null}
            <div className="detail-actions">
              <button type="button" className="primary-button">
                팀원 모집 공고 보기
              </button>
              <button type="button" className="secondary-button" onClick={handleScrap}>
                스크랩
              </button>
            </div>
          </>
        ) : (
          <p className="subtitle">공모전을 찾을 수 없습니다.</p>
        )}
      </div>
    </div>
  )
}

export default ContestDetail
