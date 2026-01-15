import { Navigate, Route, Routes } from 'react-router-dom'
import ContestDetail from '../pages/ContestDetail'
import ResultPage from '../pages/ResultPage'
import StartPage from '../pages/StartPage'
import TeamFinder from '../pages/TeamFinder'
import Test from '../pages/Test'
import TestStart from '../pages/TestStart'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/test/start" element={<TestStart />} />
      <Route path="/test" element={<Test />} />
      <Route path="/result/:sessionId" element={<ResultPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/team-finder" element={<TeamFinder />} />
      <Route path="/contest/:id" element={<ContestDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
