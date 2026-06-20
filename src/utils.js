import { FLAGS, STRENGTH, GROUP_TEAMS } from './constants.js';

export const getFlag = n => FLAGS[n] || "🏳️";
export const getStr = n => STRENGTH[n] || 55;

export function winProb(a, b) {
  const sa = Math.pow(10, getStr(a)/20), sb = Math.pow(10, getStr(b)/20);
  return sa / (sa + sb);
}

export async function askClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export function computeStandings(matches) {
  const st = {};
  Object.values(GROUP_TEAMS).flat().forEach(t => { st[t] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }; });
  matches.forEach(m => {
    if (!m.score || !m.group) return;
    const s = m.score.ft || m.score;
    if (!Array.isArray(s) || s.length !== 2) return;
    const [g1, g2] = s, t1 = m.team1, t2 = m.team2;
    [t1, t2].forEach(t => { if (!st[t]) st[t] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }; });
    st[t1].p++; st[t2].p++;
    st[t1].gf += g1; st[t1].ga += g2; st[t2].gf += g2; st[t2].ga += g1;
    if (g1 > g2) { st[t1].w++; st[t1].pts += 3; st[t2].l++; }
    else if (g1 < g2) { st[t2].w++; st[t2].pts += 3; st[t1].l++; }
    else { st[t1].d++; st[t1].pts++; st[t2].d++; st[t2].pts++; }
  });
  return st;
}

// ───────────────────────────────────────────────────────────
// CANLI SKOR & ÖNEMLİ ANLAR (ESPN scoreboard "details" akışı)
// ───────────────────────────────────────────────────────────

const norm = s => (s || '').toLowerCase().replace(/[-&\s]/g, '');

/** OFB maçını (m) ilgili ESPN scoreboard event'ine eşler. */
export function findEspnEvent(m, espnById) {
  const t1 = norm(m.team1), t2 = norm(m.team2);
  for (const ev of Object.values(espnById || {})) {
    if ((ev.date || '').split('T')[0] !== m.date) continue;
    const comps = ((ev.competitions || [])[0] || {}).competitors || [];
    if (comps.length < 2) continue;
    const et1 = norm(comps[0].team?.displayName), et2 = norm(comps[1].team?.displayName);
    if ((et1.includes(t1) || t1.includes(et1.slice(0, 4))) && (et2.includes(t2) || t2.includes(et2.slice(0, 4)))) return ev;
    if ((et1.includes(t2) || t2.includes(et1.slice(0, 4))) && (et2.includes(t1) || t1.includes(et2.slice(0, 4)))) return ev;
  }
  return null;
}

/** ESPN event'inin maç durumu: 'pre' | 'in' | 'post' + canlı dakika göstergesi. */
export function getEspnStatus(ev) {
  const status = ev?.competitions?.[0]?.status;
  return {
    state: status?.type?.state || 'pre',
    clock: status?.displayClock || '',
    completed: !!status?.type?.completed,
    detail: status?.type?.shortDetail || '',
  };
}

/** ev.competitions[0].competitors[] içindeki skoru m.team1/m.team2 sırasına göre döndürür. */
export function getEspnScore(ev, m) {
  const comps = ev?.competitions?.[0]?.competitors || [];
  if (comps.length < 2 || !m) return null;
  const t1 = norm(m.team1);
  const c0Name = norm(comps[0].team?.displayName);
  const c0IsTeam1 = c0Name.includes(t1) || t1.includes(c0Name.slice(0, 4));
  const c1 = c0IsTeam1 ? comps[0] : comps[1];
  const c2 = c0IsTeam1 ? comps[1] : comps[0];
  return { g1: Number(c1.score) || 0, g2: Number(c2.score) || 0 };
}

export const EVENT_TYPE_META = {
  GOAL: { icon: '⚽', label: 'Gol', important: true },
  PEN_SCORED: { icon: '🎯', label: 'Penaltı Golü', important: true },
  PEN_MISSED: { icon: '🚫', label: 'Kaçan Penaltı', important: true },
  OWN_GOAL: { icon: '😬', label: 'Kendi Kalesine Gol', important: true },
  RED: { icon: '🟥', label: 'Kırmızı Kart', important: true },
  YELLOW: { icon: '🟨', label: 'Sarı Kart', important: false },
};

function classifyDetail(d) {
  if (d.ownGoal) return 'OWN_GOAL';
  if (d.penaltyKick && d.scoringPlay) return 'PEN_SCORED';
  if (d.penaltyKick && !d.scoringPlay) return 'PEN_MISSED';
  if (d.redCard) return 'RED';
  if (d.yellowCard) return 'YELLOW';
  if (d.scoringPlay) return 'GOAL';
  return null;
}

/** Bir ESPN event'inin ham "details" akışını normalize eder (m bağımsız, takım adı ESPN'den). Toast/diff için. */
export function getEspnEventsRaw(ev) {
  const comp = ev?.competitions?.[0];
  const details = comp?.details || [];
  const competitors = comp?.competitors || [];
  const idToName = {};
  competitors.forEach(c => { idToName[c.team?.id] = c.team?.displayName; });
  return details.map(d => {
    const kind = classifyDetail(d);
    if (!kind) return null;
    const meta = EVENT_TYPE_META[kind];
    const athlete = (d.athletesInvolved || [])[0];
    return {
      kind, icon: meta.icon, label: meta.label, important: meta.important,
      minute: d.clock?.displayValue || '', sortVal: d.clock?.value || 0,
      player: athlete?.displayName || '',
      team: idToName[d.team?.id] || '',
      key: `${ev.id}-${d.type?.id}-${d.clock?.value}-${d.team?.id}-${athlete?.id || ''}`,
    };
  }).filter(Boolean);
}

/** Aynı akışı, OFB maçındaki team1/team2 isimlerine göre 'side' ataması yaparak döndürür (modal/ticker için). */
export function getEspnEvents(ev, m) {
  const comp = ev?.competitions?.[0];
  const details = comp?.details || [];
  const comps = comp?.competitors || [];
  if (comps.length < 2 || !m) return [];
  const t1 = norm(m.team1);
  const c0Name = norm(comps[0].team?.displayName);
  const c0IsTeam1 = c0Name.includes(t1) || t1.includes(c0Name.slice(0, 4));
  const idToSide = {};
  idToSide[comps[0].team?.id] = c0IsTeam1 ? 'team1' : 'team2';
  idToSide[comps[1].team?.id] = c0IsTeam1 ? 'team2' : 'team1';

  return details.map(d => {
    const kind = classifyDetail(d);
    if (!kind) return null;
    const meta = EVENT_TYPE_META[kind];
    const athlete = (d.athletesInvolved || [])[0];
    return {
      kind, icon: meta.icon, label: meta.label, important: meta.important,
      minute: d.clock?.displayValue || '', sortVal: d.clock?.value || 0,
      player: athlete?.displayName || '',
      side: idToSide[d.team?.id] || 'team1',
    };
  }).filter(Boolean).sort((a, b) => a.sortVal - b.sortVal);
}

export function simulateGroup(teams, st, matches) {
  const N = 2000, counts = {};
  teams.forEach(t => { counts[t] = { p1:0, p2:0, p3:0 }; });
  const remaining = matches.filter(m => m.group && teams.includes(m.team1) && teams.includes(m.team2) && !m.score);
  for (let i = 0; i < N; i++) {
    const pts = {}, gd = {}, gf = {};
    teams.forEach(t => { pts[t] = st[t]?.pts||0; gd[t] = (st[t]?.gf||0)-(st[t]?.ga||0); gf[t] = st[t]?.gf||0; });
    remaining.forEach(m => {
      const p = winProb(m.team1, m.team2), r = Math.random();
      if (r < p*.72) { pts[m.team1]+=3; gd[m.team1]+=2; gd[m.team2]-=2; gf[m.team1]+=2; }
      else if (r < p*.72+.21) { pts[m.team1]++; pts[m.team2]++; }
      else { pts[m.team2]+=3; gd[m.team2]+=2; gd[m.team1]-=2; gf[m.team2]+=2; }
    });
    const ranked = [...teams].sort((a,b) => pts[b]-pts[a] || gd[b]-gd[a] || gf[b]-gf[a] || getStr(b)-getStr(a));
    counts[ranked[0]].p1++; counts[ranked[1]].p2++; if (ranked[2]) counts[ranked[2]].p3++;
  }
  const res = {};
  teams.forEach(t => { res[t] = { p1: Math.round(counts[t].p1/N*100), p2: Math.round(counts[t].p2/N*100), p3: Math.round(counts[t].p3/N*100) }; });
  return res;
}
