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
