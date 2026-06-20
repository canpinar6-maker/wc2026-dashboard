import { getFlag, findEspnEvent, getEspnStatus, getEspnScore, getEspnEvents } from '../utils.js';
import AiChat from '../components/AiChat.jsx';

export function MatchCard({ m, espnById, onClick }) {
  const espnEv = findEspnEvent(m, espnById);
  const espnStatus = espnEv ? getEspnStatus(espnEv) : null;
  const isLive = espnStatus?.state === 'in';
  const done = (!!m.score || espnStatus?.state === 'post') && !isLive;
  const clickable = done || isLive;

  let g1 = null, g2 = null;
  if (isLive || (espnStatus?.state === 'post' && !m.score)) {
    const sc = getEspnScore(espnEv, m);
    g1 = sc?.g1 ?? null; g2 = sc?.g2 ?? null;
  } else if (m.score) {
    const s = m.score.ft || m.score;
    g1 = s[0]; g2 = s[1];
  }

  const today = new Date().toISOString().split('T')[0];
  const isToday = m.date === today;

  return (
    <div
      className={`match-card${clickable ? ' clickable' : ''}${isLive ? ' live' : ''}`}
      onClick={clickable ? () => onClick(m, espnEv?.id) : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', letterSpacing: .4 }}>{m.group || m.round || ''}</span>
        <span className={`match-status ${done ? 'status-ft' : isLive ? 'status-live' : isToday ? 'status-live' : 'status-up'}`}>
          {done ? 'BİTTİ' : isLive ? `● ${espnStatus.clock || 'CANLI'}` : isToday ? 'BUGÜN' : 'YAK.'}
        </span>
      </div>
      {[[m.team1, g1, g1 !== null && g2 !== null && g1 > g2], [m.team2, g2, g1 !== null && g2 !== null && g2 > g1]].map(([team, score, win], j) => (
        <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500 }}>
            <span>{getFlag(team)}</span><span>{team}</span>
          </div>
          {score !== null && <span style={{ fontSize: 15, fontWeight: 700, color: win ? 'var(--green)' : 'var(--gold)' }}>{score}</span>}
        </div>
      ))}
      <div style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'right' }}>{m.ground || ''}</div>
      {clickable && (
        <div style={{ fontSize: 9, color: isLive ? 'var(--red)' : 'var(--accent)', textAlign: 'center' }}>
          ↗ {isLive ? 'Canlı Takip & Olaylar' : 'Detay & AI Analiz'}
        </div>
      )}
    </div>
  );
}

export default function MatchesTab({ matches, espnById, onMatchClick }) {
  const byDate = {};
  matches.forEach(m => { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); });
  const sorted = Object.keys(byDate).sort();
  const playedDates = sorted.filter(d => byDate[d].some(m => m.score));
  const today = new Date().toISOString().split('T')[0];
  const upcomingDates = sorted.filter(d => !byDate[d].some(m => m.score) && d >= today).slice(0, 5);
  const display = [...new Set([...playedDates, ...upcomingDates])].sort();

  return (
    <div>
      <div className="banner">⚽ Biten maçlara tıkla → Detaylı istatistikler + AI analizi</div>
      {display.map(date => {
        const dStr = new Date(date + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
        return (
          <div key={date} style={{ marginBottom: 18 }}>
            <div className="day-title">{dStr.toUpperCase()}</div>
            <div className="matches-grid">
              {byDate[date].map((m, i) => (
                <MatchCard key={i} m={m} espnById={espnById} onClick={onMatchClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MatchDetailModal({ match, espnData, liveEvent, onClose }) {
  if (!match) return null;
  const espnStatus = liveEvent ? getEspnStatus(liveEvent) : null;
  const isLive = espnStatus?.state === 'in';

  const ofbScore = match.score?.ft || match.score || null;
  const liveScore = liveEvent ? getEspnScore(liveEvent, match) : null;
  const g1 = isLive ? (liveScore?.g1 ?? '-') : (ofbScore ? ofbScore[0] : (liveScore?.g1 ?? '-'));
  const g2 = isLive ? (liveScore?.g2 ?? '-') : (ofbScore ? ofbScore[1] : (liveScore?.g2 ?? '-'));
  const htScore = match.score?.ht;
  const venue = match.ground || espnData?.gameInfo?.venue?.fullName || '';
  const bsTeams = espnData?.boxscore?.teams || [];
  const hStats = {}, aStats = {};
  (bsTeams[0]?.statistics || []).forEach(s => { hStats[s.name] = s.displayValue; });
  (bsTeams[1]?.statistics || []).forEach(s => { aStats[s.name] = s.displayValue; });

  const statMap = {
    possessionPct: 'Topa Sahip %', totalShots: 'Toplam Şut', shotsOnTarget: 'İsabetli Şut',
    passingPct: 'Pas Başarı %', totalPasses: 'Toplam Pas', cornerKicks: 'Korner',
    fouls: 'Faul', yellowCards: 'Sarı Kart', saves: 'Kurtarış', expectedGoals: 'xG',
  };
  const statEntries = Object.entries(statMap).filter(([k]) => hStats[k] || aStats[k]);

  // ESPN event akışı varsa (canlı veya bitmiş maç) onu kullan — gol + kart + penaltı içerir.
  const espnEvents = liveEvent ? getEspnEvents(liveEvent, match) : [];
  const goals1 = match.goals1 || [], goals2 = match.goals2 || [];
  const allEvents = espnEvents.length > 0
    ? espnEvents.map(e => ({ minute: e.minute, name: e.player || e.label, team: e.side === 'team1' ? match.team1 : match.team2, side: e.side === 'team1' ? 'home' : 'away', icon: e.icon, isGoal: e.kind !== 'YELLOW' && e.kind !== 'RED' }))
    : [
        ...goals1.map(g => ({ ...g, team: match.team1, side: 'home', icon: '⚽', isGoal: true })),
        ...goals2.map(g => ({ ...g, team: match.team2, side: 'away', icon: '⚽', isGoal: true })),
      ].sort((a, b) => (parseInt(a.minute) || 0) - (parseInt(b.minute) || 0));

  const goalCount = allEvents.filter(e => e.isGoal).length;
  const matchSummary = `${match.team1} ${g1}-${g2} ${match.team2} (${match.date}, ${venue}).${isLive ? ` ŞU AN CANLI: ${espnStatus.clock}.` : ''} İY: ${htScore ? htScore.join('-') : '?'}. Sahip olma: ${hStats.possessionPct||'?'}% vs ${aStats.possessionPct||'?'}%. Şut: ${hStats.totalShots||'?'}/${aStats.totalShots||'?'}. xG: ${hStats.expectedGoals||'?'}/${aStats.expectedGoals||'?'}. Olaylar: ${allEvents.map(e => `${e.icon} ${e.name} ${e.minute}' (${e.team})`).join(', ')||'yok'}.`;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>
            {getFlag(match.team1)} {match.team1} — {match.team2} {getFlag(match.team2)}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: 26, height: 26, borderRadius: 5, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
        <div className="modal-body">
          {/* Scoreline */}
          <div className="scoreline">
            {isLive && (
              <div className="live-modal-banner">
                <span className="live-dot" style={{ background: 'var(--red)' }} /> CANLI · {espnStatus.clock || ''}
              </div>
            )}
            <div className="scoreline-teams">
              <div className="sl-team">
                <span className="sl-flag">{getFlag(match.team1)}</span>
                <span className="sl-name">{match.team1}</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="sl-score">{g1}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 18 }}>–</span>
                  <span className="sl-score">{g2}</span>
                </div>
                {htScore && <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>İY: {htScore.join('-')}</div>}
              </div>
              <div className="sl-team">
                <span className="sl-flag">{getFlag(match.team2)}</span>
                <span className="sl-name">{match.team2}</span>
              </div>
            </div>
            {venue && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>📍 {venue}</div>}
          </div>

          {/* Events */}
          {allEvents.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="stat-section-title">{goalCount > 0 ? '⚽' : '🕐'} MAÇ OLAYLARI</div>
              {allEvents.map((g, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                  borderRadius: 5, background: 'rgba(255,255,255,.02)',
                  borderLeft: `2px solid ${g.side === 'home' ? 'var(--green)' : 'var(--blue)'}`, marginBottom: 4
                }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--gold)', minWidth: 30 }}>{g.minute}'</span>
                  <span>{g.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{g.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>{getFlag(g.team)} {g.team}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {statEntries.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="stat-section-title">📈 MAÇ İSTATİSTİKLERİ</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 4, marginBottom: 8, fontSize: 10, fontWeight: 700 }}>
                <span style={{ color: 'var(--green)' }}>{getFlag(match.team1)} {match.team1}</span>
                <span style={{ color: 'var(--muted)' }}>İST.</span>
                <span style={{ color: 'var(--blue)', textAlign: 'right' }}>{match.team2} {getFlag(match.team2)}</span>
              </div>
              {statEntries.map(([k, label]) => {
                const hv = hStats[k] || '0', av = aStats[k] || '0';
                const hn = parseFloat(hv)||0, an = parseFloat(av)||0;
                const total = hn + an || 1, hp = Math.round(hn/total*100);
                return (
                  <div key={k} className="stat-bar-row">
                    <div className="stat-bar-vals">
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>{hv}</span>
                      <div className="stat-bar-track">
                        <div style={{ width: `${hp}%`, height: '100%', background: 'var(--green)' }} />
                        <div style={{ width: `${100-hp}%`, height: '100%', background: 'var(--blue)' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', textAlign: 'right' }}>{av}</span>
                    </div>
                    <div className="stat-bar-label">{label}</div>
                  </div>
                );
              })}
            </div>
          )}

          <AiChat
            systemPrompt={`Sen bir futbol analisti asistanısın. Türkçe kısa ve net cevaplar ver. Markdown kullanma.\n\nMAÇ VERİSİ:\n${matchSummary}`}
            placeholder="Bu maç hakkında bir şey sor..."
            initialMsg={isLive ? `${match.team1} ${g1}-${g2} ${match.team2} maçı şu an canlı (${espnStatus.clock}). Anlık durum, taktikler veya olaylar hakkında soru sor.` : `${match.team1} ${g1}-${g2} ${match.team2} maçı hazır. Taktikler, goller veya performans hakkında soru sor.`}
            suggestions={[
              `${match.team1} ve ${match.team2}'nin taktik farklarını analiz et`,
              isLive ? 'Şu ana kadarki en kritik an neydi?' : 'Maçın kilit anı neydi?',
              'En iyi oyuncu kimdi?',
              `${Number(g1) > Number(g2) ? match.team1 : Number(g2) > Number(g1) ? match.team2 : 'İki takım'} nasıl ${Number(g1) !== Number(g2) ? (isLive ? 'önde?' : 'kazandı?') : 'berabere?'}`,
            ]}
          />
        </div>
      </div>
    </div>
  );
}
