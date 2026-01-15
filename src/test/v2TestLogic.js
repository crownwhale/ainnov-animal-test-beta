/**
 * V2 Neutral Test Logic
 * - 16 questions (Role/DISC mix, see QUESTIONS_V2)
 * - Animals: 10 (8 existing + wolf + turtle)
 * - Radar: 5-axis kept (decision/creativity/logic/empathy/completion)
 *   decision   = role_doer * disc_D
 *   creativity = role_thinker * disc_I
 *   logic      = role_thinker * disc_C
 *   empathy    = role_connector * disc_S
 *   completion = role_doer * disc_C
 *   percent = raw/max*100 (max is computed from QUESTIONS_V2)
 */
console.log("[LOADED] V2TestLogic.js");
export const QUESTIONS_V2 = [
  // =========================
  // ROLE (4) — 3지선다
  // A=thinker, B=doer, C=connector
  // =========================
  {
    id: "Q1",
    text: "프로젝트를 시작할 때, 나는?",
    A: { text: "전체 구조와 방향부터 먼저 그린다", delta: { role_thinker: 1 } },
    B: { text: "당장 실행 가능한 일부터 바로 움직인다", delta: { role_doer: 1 } },
    C: { text: "사람과 역할을 정리해 흐름을 만든다", delta: { role_connector: 1 } },
  },
  {
    id: "Q2",
    text: "회의가 막혔을 때, 나는?",
    A: { text: "다른 관점이나 대안을 꺼내 돌파구를 만든다", delta: { role_thinker: 1 } },
    B: { text: "다음 액션을 정해 회의를 앞으로 밀어준다", delta: { role_doer: 1 } },
    C: { text: "의견을 정리해 공통된 방향으로 묶는다", delta: { role_connector: 1 } },
  },
  {
    id: "Q3",
    text: "마감이 촉박할 때, 나는?",
    A: { text: "핵심만 남기고 구조를 다시 짠다", delta: { role_thinker: 1 } },
    B: { text: "우선순위를 정해 처리부터 한다", delta: { role_doer: 1 } },
    C: { text: "팀 부담을 나눠서 페이스를 맞춘다", delta: { role_connector: 1 } },
  },
  {
    id: "Q4",
    text: "협업할 때, 나는?",
    A: { text: "기획·구조·기준을 세워 방향을 잡는다", delta: { role_thinker: 1 } },
    B: { text: "실행을 주도해 결과를 만든다", delta: { role_doer: 1 } },
    C: { text: "조율과 소통으로 팀을 굴린다", delta: { role_connector: 1 } },
  },

  // =========================
  // DISC (8) — 2지선다
  // =========================
  {
    id: "Q5",
    text: "중요한 결정을 내려야 할 때, 나는?",
    A: { text: "빠르게 결론을 내리고 밀고 간다", delta: { disc_D: 1 } },
    B: { text: "근거를 더 확인하고 리스크를 줄인다", delta: { disc_C: 1 } },
  },
  {
    id: "Q6",
    text: "새 일을 시작할 때, 나는?",
    A: { text: "완벽하지 않아도 먼저 시작하고 보며 고친다", delta: { disc_D: 1 } },
    B: { text: "시간이 걸려도 정확하게 맞추고 시작한다", delta: { disc_C: 1 } },
  },
  {
    id: "Q7",
    text: "새 팀에 합류했을 때, 나는?",
    A: { text: "먼저 다가가 말을 걸고 분위기를 연다", delta: { disc_I: 1 } },
    B: { text: "상황을 보며 자연스럽게 맞춘다", delta: { disc_S: 1 } },
  },
  {
    id: "Q8",
    text: "팀 분위기가 필요할 때, 나는?",
    A: { text: "에너지를 끌어올리고 참여를 유도한다", delta: { disc_I: 1 } },
    B: { text: "편안한 분위기를 만들어 안정시킨다", delta: { disc_S: 1 } },
  },
  {
    id: "Q9",
    text: "팀 내 갈등이 생겼을 때, 나는?",
    A: { text: "쟁점을 좁혀 결론을 빠르게 낸다", delta: { disc_D: 1 } },
    B: { text: "관계를 해치지 않게 중간을 맞춘다", delta: { disc_S: 1 } },
  },
  {
    id: "Q10",
    text: "예상치 못한 변수가 생겼을 때, 나는?",
    A: { text: "일단 움직이며 상황에 맞게 조정한다", delta: { disc_D: 1 } },
    B: { text: "흐름을 지키며 안정적으로 조정한다", delta: { disc_S: 1 } },
  },
  {
    id: "Q11",
    text: "누군가를 설득해야 할 때, 나는?",
    A: { text: "이야기나 사례로 공감을 끌어낸다", delta: { disc_I: 1 } },
    B: { text: "데이터와 근거로 논리를 세운다", delta: { disc_C: 1 } },
  },
  {
    id: "Q12",
    text: "결과물을 마무리할 때, 나는?",
    A: { text: "전달력과 인상을 다듬어 반응을 만든다", delta: { disc_I: 1 } },
    B: { text: "오류와 누락을 끝까지 잡아 완성도를 높인다", delta: { disc_C: 1 } },
  },
];


export function initScores() {
  return {
    role_thinker: 0,
    role_doer: 0,
    role_connector: 0,
    disc_D: 0,
    disc_I: 0,
    disc_S: 0,
    disc_C: 0,
  };
}

function applyDelta(scores, delta) {
  for (const [k, v] of Object.entries(delta)) {
    if (typeof scores[k] !== "number") scores[k] = 0;
    scores[k] += v;
  }
}

export function applyAnswer(scores, qIndex, choice /* "A" | "B" | "C" */) {
  const q = QUESTIONS_V2[qIndex];
  if (!q) return scores;
  const key = choice === "B" ? "B" : choice === "C" ? "C" : "A";
  applyDelta(scores, q[key].delta);
  return scores;
}

export function computeRoleTop(scores) {
  const entries = [
    ["thinker", scores.role_thinker],
    ["doer", scores.role_doer],
    ["connector", scores.role_connector],
  ];

  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const priority = { thinker: 3, connector: 2, doer: 1 };
    return priority[b[0]] - priority[a[0]];
  });

  return { top: entries[0][0], topScore: entries[0][1], ordered: entries };
}

export function computeDiscTop(scores) {
  const entries = [
    ["D", scores.disc_D],
    ["I", scores.disc_I],
    ["S", scores.disc_S],
    ["C", scores.disc_C],
  ];

  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const priority = { C: 4, D: 3, S: 2, I: 1 };
    return priority[b[0]] - priority[a[0]];
  });

  return { top: entries[0][0], topScore: entries[0][1], ordered: entries };
}

/**
 * Animal decision (10 types)
 * Mapping by (role_top, disc_top) with minimal special-casing.
 *
 * doer + D => lion
 * doer + S => wolf
 * doer + I => otter
 * doer + C => meerkat
 *
 * thinker + C => cat
 * thinker + I => elephant
 * thinker + D => fennec (strategy)
 * thinker + S => owl (balanced mediator)
 *
 * connector + S => capybara
 * connector + C => turtle
 * connector + I => capybara (more social/positive)
 * connector + D => lion (rare connector-D, treated as action driver)
 */
function top2Keys(ordered, gap = 1) {
  const [first, second] = ordered;
  const keys = [first[0]];
  if (second && first[1] - second[1] <= gap) keys.push(second[0]);
  return keys;
}

function mapAnimal(roleTop, discTop) {
  const mapping = {
    doer: { D: "lion", I: "otter", S: "wolf", C: "meerkat" },
    thinker: { D: "fennec", I: "elephant", S: "owl", C: "cat" },
    connector: { D: "borderCollie", I: "dolphin", S: "capybara", C: "turtle" },
  };
  return mapping[roleTop][discTop];
}

function pickCandidate(scores, candidates, roleTop, discTop) {
  return candidates
    .map((c) => {
      const roleScore = scores[`role_${c.r}`] || 0;
      const discScore = scores[`disc_${c.d}`] || 0;

      return {
        ...c,
        match: (c.r === roleTop ? 2 : 0) + (c.d === discTop ? 1 : 0),
        pairScore: roleScore * discScore,
      };
    })
    .sort(
      (a, b) =>
        b.match - a.match ||
        b.pairScore - a.pairScore ||
        a.animal.localeCompare(b.animal),
    )[0].animal;
}

export function decideAnimalId(scores) {
  const role = computeRoleTop(scores);
  const disc = computeDiscTop(scores);

  const roleTop = role.ordered[0][0];
  const discTop = disc.ordered[0][0];
  const roleTop2 = top2Keys(role.ordered, 1);
  const discTop2 = top2Keys(disc.ordered, 1);

  const candPairs = roleTop2.flatMap((r) =>
    discTop2.map((d) => ({ r, d, animal: mapAnimal(r, d) })),
  );

  const seen = new Set();
  const candidates = candPairs.filter((x) =>
    seen.has(x.animal) ? false : (seen.add(x.animal), true),
  );

  if (candidates.length === 1) return candidates[0].animal;
  return pickCandidate(scores, candidates, roleTop, discTop);
}

function choicesOf(q) {
  return q.C ? ["A", "B", "C"] : ["A", "B"];
}

const RADAR_DIST = (() => {
  const total = QUESTIONS_V2.length;
  const counts = {
    decision: new Map(),
    creativity: new Map(),
    logic: new Map(),
    empathy: new Map(),
    completion: new Map(),
  };
  let n = 0;

  function bump(axis, v) {
    const m = counts[axis];
    m.set(v, (m.get(v) || 0) + 1);
  }

  function dfs(i, scores) {
    if (i === total) {
      const raw = {
        decision: scores.role_doer * scores.disc_D,
        creativity: scores.role_thinker * scores.disc_I,
        logic: scores.role_thinker * scores.disc_C,
        empathy: scores.role_connector * scores.disc_S,
        completion: scores.role_doer * scores.disc_C,
      };

      for (const [k, v] of Object.entries(raw)) bump(k, v);
      n += 1;
      return;
    }

    const q = QUESTIONS_V2[i];
    for (const ch of choicesOf(q)) {
      const next = { ...scores };
      applyDelta(next, q[ch].delta);
      dfs(i + 1, next);
    }
  }

  dfs(0, initScores());

  const cdf = {};
  for (const [axis, m] of Object.entries(counts)) {
    const keys = [...m.keys()].sort((a, b) => a - b);
    let cum = 0;
    cdf[axis] = {};
    for (const k of keys) {
      cum += m.get(k);
      cdf[axis][k] = cum / n;
    }
  }

  return { n, counts, cdf };
})();

export function calcRadar(scores) {
  // raw values
  const raw = {
    decision: scores.role_doer * scores.disc_D,
    creativity: scores.role_thinker * scores.disc_I,
    logic: scores.role_thinker * scores.disc_C,
    empathy: scores.role_connector * scores.disc_S,
    completion: scores.role_doer * scores.disc_C,
  };

  // normalize to 0~100 by max 12 (4*3)
  const BASE = 20;
  const SPAN = 80;
  const pct = {};
  for (const [k, v] of Object.entries(raw)) {
    const c = RADAR_DIST.cdf[k]?.[v] ?? 0;
    pct[k] = Math.max(BASE, Math.min(100, Math.round(BASE + SPAN * c)));
  }

  return { raw, pct, dist: RADAR_DIST };
}
