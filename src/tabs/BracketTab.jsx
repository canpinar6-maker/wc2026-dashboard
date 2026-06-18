import { R32, R16, QF, SF, FINAL } from '../constants.js';
import { getFlag, winProb } from '../utils.js';

export default function BracketTab({ groupRank }) {
  const cache = {};

  function resolveSlot(slot, depth = 0) {
    if (depth > 5) return {};
    if (slot.startsWith('W')) return resolveMatch(parseInt(slot.slice(1)), depth);
    if (slot.startsWith('1') || slot.startsWith('2')) {
      const idx = parseInt(slot[0]) - 1, letter = slot[1];
      const r = groupRank[letter] || [];
      const res = {};
      r.forEach(t => { res[t.name] = (idx === 0 ? t.p1 : t.p2||0) / 100; });
      return res;
    }
    const res = {};
    Object.values(groupRank).forEach(ranks => {
      if (ranks[2]) res[ranks[2].name] = (res[ranks[2].name]||0) + (ranks[2].p3||0) / 100 / 12;
    });
    return res;
  }

  function resolveMatch(num, depth = 0) {
    if (cache[num]) return cache[num];
    const all = [...R32, ...R16, ...QF, ...SF, FINAL];
    const m = all.find(x => x.n === num);
    if (!m) return {};
    const d1 = resolveSlot(m.t1, depth + 1), d2 = resolveSlot(m.t2, depth + 1);
    const result = {};
    Object.entries(d1).forEach(([t1, p1]) => {
      Object.entries(d2).forEach(([t2, p2]) => {
        if (t1 === t2) return;
        const j = p1 * p2, w = winProb(t1, t2);
        result[t1] = (result[t1]||0) + j * w;
        result[t2] = (result[t2]||0) + j * (1 - w);
      });
    });
    const tot = Object.values(result).reduce((a, b) => a + b, 0) || 1;
    Object.keys(result).forEach(k => result[k] /= tot);
    cache[num] = result;
    return result;
  }

  function topN(slot, n = 2) {
    return Object.entries(resolveSlot(slot))
      .filter(([k]) => k !== 'Loser')
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, prob]) => ({ name, prob: Math.round(prob * 100) }));
  }

  function MatchCard({ m }) {
    const t1s = topN(m.t1), t2s = topN(m.t2);
    return (
      <div className="bracket-match">
        <div className="bracket-match-label">
          <span>M{m.n}</span><span>{m.d || ''}</span>
        </div>
        {[t1s, t2s].map((candidates, i) => {
          const top = candidates[0] || { name: 'TBD', prob: 0 };
          const high = top.prob >= 65;
          return (
            <div key={i} className={`bracket-team${high ? ' highlight' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500 }}>
                <span style={{ fontSize: 12 }}>{getFlag(top.name)}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 95, color: top.prob < 30 ? 'var(--muted)' : 'var(--text)' }}>{top.name}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: high ? 'var(--green)' : top.prob < 35 ? 'var(--muted)' : 'var(--gold)', minWidth: 28, textAlign: 'right' }}>
                {top.prob > 0 ? top.prob + '%' : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const finalT1 = topN(FINAL.t1, 4), finalT2 = topN(FINAL.t2, 4);
  const rounds = [
    { title: 'ROUND OF 32', sub: '28 Haz–3 Tem', matches: R32 },
    { title: 'SON 16', sub: '4–7 Tem', matches: R16 },
    { title: 'ÇEYREK', sub: '9–11 Tem', matches: QF },
    { title: 'YARI', sub: '14–15 Tem', matches: SF },
  ];

  return (
    <div>
      <div className="banner">🗓️ Monte Carlo (2000 sim) + Bradley-Terry modeli — güncel puana göre hesaplanır</div>
      <div className="bracket-scroll">
        <div className="bracket-grid">
          {rounds.map(({ title, sub, matches: ms }) => (
            <div key={title} className="bracket-round">
              <div className="bracket-round-title">
                {title}<br /><span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 400 }}>{sub}</span>
              </div>
              {ms.map(m => <MatchCard key={m.n} m={m} />)}
            </div>
          ))}
          <div className="bracket-round" style={{ minWidth: 180 }}>
            <div className="bracket-round-title">
              FİNAL 🏆<br /><span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 400 }}>19 Tem</span>
            </div>
            <div style={{ background: 'linear-gradient(135deg,rgba(240,180,41,.12),rgba(99,102,241,.08))', border: '1px solid rgba(240,180,41,.4)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--gold)', textAlign: 'center', marginBottom: 4 }}>🏆 FİNAL</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center', marginBottom: 10 }}>MetLife Stadium, NJ</div>
              {[['Sol bracket', finalT1], ['Sağ bracket', finalT2]].map(([label, teams], gi) => (
                <div key={gi}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4, marginTop: gi > 0 ? 10 : 0, paddingTop: gi > 0 ? 10 : 0, borderTop: gi > 0 ? '1px solid var(--border)' : 'none' }}>{label}:</div>
                  {teams.map(({ name, prob }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(42,53,80,.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <span>{getFlag(name)}</span><span>{name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)' }}>{prob}%</div>
                        <div style={{ height: 3, width: 44, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginTop: 1 }}>
                          <div style={{ height: '100%', width: `${Math.min(prob*2, 100)}%`, background: 'var(--gold)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
