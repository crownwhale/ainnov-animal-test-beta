import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <p className="eyebrow">EV-01</p>
          <h1>나에게 맞는 대외활동 유형 테스트</h1>
          <p className="subtitle">
            12문항으로 나의 활동 성향을 확인하고 추천 결과를 받아보세요.
          </p>
        </header>
        <Link className="primary-button" to="/test/start">
          테스트 시작
        </Link>
      </div>
    </div>
  )
}

export default Home
