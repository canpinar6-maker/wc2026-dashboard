import { getFlag, findEspnEvent, getEspnStatus, getEspnScore, getEspnEvents } from '../utils.js';

export default function LiveTicker({ matches, espnById, onMatchClick }) {
  const liveItems = [];
  matches.forEach(m => {
    const ev = findEspnEvent(m, espnById);
    if (!ev) return;
    const status = getEspnStatus(ev);
    if (status.state !== 'in') return;
    liveItems.push({ m, ev, status, score: getEspnScore(ev, m), events: getEspnEvents(ev, m) });
  });

  if (liveItems.length === 0) return null;

  const feed = liveItems
    .flatMap(li => li.events.filter(e => e.important).map(e => ({ ...e, li })))
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 8);

  return (
    <div className="live-ticker">
      <div className="live-ticker-header">
        <span className="live-dot" style={{ background: 'var(--red)' }} />
        <span>{liveItems.length} CANLI MAÇ</span>
      </div>

      <div className="live-scores-row">
        {liveItems.map((li, i) => (
          <div key={i} className="live-score-chip" onClick={() => onMatchClick(li.m, li.ev.id)}>
            <span>{getFlag(li.m.team1)}</span>
            <span className="live-chip-score">{li.score?.g1 ?? 0}</span>
            <span className="live-chip-sep">–</span>
            <span className="live-chip-score">{li.score?.g2 ?? 0}</span>
            <span>{getFlag(li.m.team2)}</span>
            <span className="live-chip-clock">{li.status.clock || '●'}</span>
          </div>
        ))}
      </div>

      {feed.length > 0 && (
        <div className="live-feed">
          {feed.map((e, i) => (
            <div
              key={i}
              className={`live-feed-item${i === 0 ? ' newest' : ''}`}
              onClick={() => onMatchClick(e.li.m, e.li.ev.id)}
            >
              <span className="live-feed-min">{e.minute}</span>
              <span className="live-feed-icon">{e.icon}</span>
              <span className="live-feed-player">{e.player || e.label}</span>
              <span className="live-feed-team">
                {getFlag(e.side === 'team1' ? e.li.m.team1 : e.li.m.team2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
