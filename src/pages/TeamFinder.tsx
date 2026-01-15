import { useNavigate } from 'react-router-dom'

function TeamFinder() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="container card">
        <h1>준비중입니다</h1>
        <p className="subtitle">팀원 찾기 기능은 현재 준비 중입니다.</p>
        <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    </div>
  )
}

export default TeamFinder
