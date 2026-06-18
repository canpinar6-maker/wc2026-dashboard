import { GROUP_TEAMS } from '../constants.js';
import { getFlag } from '../utils.js';

export default function GroupsTab({ matches, standings, groupRank }) {
  const finished = matches.filter(m => m.score).length;

  return (
    <div>
      <div className="banner">
        📡 openfootball/worldcup.json — Oynanan: <strong>{finished}</strong>/104
      </div>
      <div className="groups-grid">
        {Object.entries(GROUP_TEAMS).map(([letter, teams]) => {
          const ranked = groupRank[letter] || teams.map(t => ({ name: t, pts: 0 }));
          return (
            <div key={letter} className="card">
              <div className="card-header">
                <span className="card-title">GRUP {letter}</span>
                <span style={{ fontSize: 9, color: 'var(--muted)' }}>{teams.length} takım</span>
              </div>
              <table className="group-table">
                <thead>
                  <tr>
                    {['TAKIM','O','G','B','M','AG','YG','AV','P'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => {
                    const s = standings[r.name] || {};
                    const gd = (s.gf||0) - (s.ga||0);
                    return (
                      <tr key={r.name} className={`row-${i+1}`}>
                        <td>
                          <div className="team-cell">
                            <div className="pos-dot" style={{
                              background: i < 2 ? 'var(--green)' : i === 2 ? 'var(--gold)' : '#374151'
                            }} />
                            <span style={{ fontSize: 13 }}>{getFlag(r.name)}</span>
                            <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 82 }}>{r.name}</span>
                          </div>
                        </td>
                        {[s.p||0, s.w||0, s.d||0, s.l||0, s.gf||0, s.ga||0].map((v, j) => (
                          <td key={j}>{v}</td>
                        ))}
                        <td style={{ color: gd >= 0 ? 'var(--green)' : 'var(--red)' }}>{gd > 0 ? '+' : ''}{gd}</td>
                        <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{s.pts||0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        {[['var(--green)', 'Elemeye geçer (1-2)'], ['var(--gold)', 'En iyi 3. olabilir'], ['#374151', 'Elenme riski']].map(([c, l]) => (
          <div key={l} className="legend-item">
            <div className="legend-dot" style={{ background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  );
}
