// scripts/exhaustive_v2.mjs
// 실행: node scripts/exhaustive_v2.mjs

import { QUESTIONS_V2, initScores, applyAnswer, decideAnimalId } from '../src/test/v2TestLogic.js'

function choicesOf(q) {
  return q.C ? ['A', 'B', 'C'] : ['A', 'B']
}

function countAnimals() {
  const totalQ = QUESTIONS_V2.length
  const counts = new Map()
  let totalCombos = 0

  function dfs(i, scores) {
    if (i === totalQ) {
      const animal = decideAnimalId(scores)
      counts.set(animal, (counts.get(animal) || 0) + 1)
      totalCombos += 1
      return
    }

    const q = QUESTIONS_V2[i]
    for (const ch of choicesOf(q)) {
      const next = { ...scores }
      applyAnswer(next, i, ch)
      dfs(i + 1, next)
    }
  }

  dfs(0, initScores())
  return { counts, totalCombos }
}

function printResult(result) {
  const { counts, totalCombos } = result
  const rows = [...counts.entries()]
    .map(([animal, c]) => ({ animal, c, pct: (c / totalCombos) * 100 }))
    .sort((a, b) => b.pct - a.pct)

  console.log('\n== V2 decideAnimalId (mixed exhaustive) ==')
  for (const r of rows) {
    console.log(
      String(r.animal).padEnd(10),
      String(r.c).padStart(6),
      r.pct.toFixed(2) + '%',
    )
  }

  const min = rows[rows.length - 1]
  const max = rows[0]
  console.log('\nTotal:', totalCombos)
  console.log('Max:', max.animal, max.pct.toFixed(2) + '%')
  console.log('Min:', min.animal, min.pct.toFixed(2) + '%')
}

printResult(countAnimals())
