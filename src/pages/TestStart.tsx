import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function TestStart() {
  const navigate = useNavigate()
  const didInitAuth = useRef(false)
  const [nickname, setNickname] = useState('')
  const [majorGroup, setMajorGroup] = useState('')
  const [majorDetail, setMajorDetail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const nicknameTrimmed = nickname.trim()
  const majorDetailTrimmed = majorDetail.trim()

  const isNicknameValid = nicknameTrimmed.length >= 2 && nicknameTrimmed.length <= 12
  const isMajorGroupValid = Boolean(majorGroup)
  const isFormValid = isNicknameValid && isMajorGroupValid && consent

  const helperText = useMemo(() => {
    if (!nicknameTrimmed && !majorDetailTrimmed) return ''
    if (!isNicknameValid) return '닉네임은 2~12자로 입력해주세요.'
    return ''
  }, [isNicknameValid, majorDetailTrimmed, nicknameTrimmed])

  useEffect(() => {
    if (didInitAuth.current) return
    didInitAuth.current = true

    const ensureAnonymousSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('getSession error:', error)
        return
      }

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError) {
          console.error('anonymous sign-in failed:', signInError)
          return
        }

        const { data: afterSignIn } = await supabase.auth.getSession()
        console.log('anonymous session exists:', Boolean(afterSignIn.session))
      }
    }

    ensureAnonymousSession()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (!isFormValid || loading) return

    setLoading(true)

    const sessionPayload = {
      nickname: nicknameTrimmed,
      majorGroup,
      majorDetail: majorDetailTrimmed ? majorDetailTrimmed : null,
      consent: consent === true,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('ainnov_session_v2', JSON.stringify(sessionPayload))
    navigate('/test')
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="container card">
        <header className="section">
          <p className="eyebrow">Step 0</p>
          <h1>프로필 정보를 입력해주세요</h1>
          <p className="subtitle">
            닉네임과 전공을 입력하고 동의 후 테스트를 시작합니다.
          </p>
        </header>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            닉네임
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="2~12자"
              maxLength={12}
              required
            />
          </label>
          <label className="field">
            전공 계열
            <select
              value={majorGroup}
              onChange={(event) => setMajorGroup(event.target.value)}
              required
            >
              <option value="" disabled>
                전공 계열 선택
              </option>
              <option value="인문">인문</option>
              <option value="사회">사회</option>
              <option value="교육">교육</option>
              <option value="자연">자연</option>
              <option value="공학">공학</option>
              <option value="의약">의약</option>
              <option value="예체능">예체능</option>
              <option value="기타">기타</option>
            </select>
          </label>
          <label className="field">
            세부 전공
            <input
              value={majorDetail}
              onChange={(event) => setMajorDetail(event.target.value)}
              placeholder="예: 경영학"
              maxLength={30}
            />
            <span className="hint">세부 전공은 선택 입력입니다.</span>
          </label>
          {helperText ? <p className="helper">{helperText}</p> : null}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            데이터 저장 및 분석에 동의합니다
          </label>
          {errorMessage ? <p className="error">{errorMessage}</p> : null}
          <button className="primary-button" type="submit" disabled={!isFormValid || loading}>
            {loading ? '저장 중...' : '테스트 시작'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TestStart
