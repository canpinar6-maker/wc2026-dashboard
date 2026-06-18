import { useState } from 'react';
import { askClaude, getFlag } from '../utils.js';
import HeatMap from '../components/HeatMap.jsx';
import AiChat from '../components/AiChat.jsx';

export default function PlayerTab({ matches }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);

  const scorers = {};
  matches.forEach(m => {
    if (!m.score) return;
    (m.goals1||[]).forEach(g => { if (!scorers[g.name]) scorers[g.name] = { name: g.name, team: m.team1, count: 0 }; scorers[g.name].count++; });
    (m.goals2||[]).forEach(g => { if (!scorers[g.name]) scorers[g.name] = { name: g.name, team: m.team2, count: 0 }; scorers[g.name].count++; });
  });
  const topScorers = Object.values(scorers).sort((a, b) => b.count - a.count).slice(0, 8);

  async function search(name) {
    const q = (name || query).trim();
    if (!q) return;
    setLoading(true); setError(null); setPlayer(null);
    const playerGoals = [];
    matches.forEach(m => {
      const last = q.toLowerCase().split(' ').pop();
      (m.goals1||[]).forEach(g => { if (g.name.toLowerCase().includes(last)) playerGoals.push(`${g.minute}' - ${m.team1} vs ${m.team2} (${m.date})`); });
      (m.goals2||[]).forEach(g => { if (g.name.toLowerCase().includes(last)) playerGoals.push(`${g.minute}' - ${m.team1} vs ${m.team2} (${m.date})`); });
    });
    try {
      const system = `Sen futbol analisti asistanısın. 2026 FIFA Dünya Kupası (Haziran-Temmuz 2026, USA/Kanada/Meksika). SADECE JSON döndür. Markdown yok, açıklama yok.

JSON şeması (tam olarak bu yapıda döndür):
{"found":true,"name":"","country":"","flag":"","position":"","age":0,"club":"","tournament_goals":0,"tournament_assists":0,"tournament_matches":0,"summary":"2-3 cümle TR","stats":{"shots_pg":0.0,"pass_acc":0,"key_passes_pg":0.0,"dribbles_pg":0.0,"duel_win":0,"aerial_win":0,"ground_win":0,"tackles_pg":0.0,"distance_pg":0.0},"heatmap":[{"x":50,"y":50,"intensity":0.8,"label":"Orta Saha"}],"heatmap_desc":"kısa açıklama","strengths":["s1","s2"],"weaknesses":["w1"],"rating":7.5}

${playerGoals.length ? `Turnuva gol verisi: ${playerGoals.join(', ')}` : ''}`;
      const raw = await askClaude(system, `${q} için 2026 WC verisi döndür.`);
      const clean = raw.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);
      if (!data.found) { setError(`"${q}" bulunamadı. Daha tam bir isim deneyin.`); }
      else { setPlayer(data); }
    } catch (e) { setError('Hata: ' + e.message); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Herhangi bir oyuncuyu ara — turnuva istatistikleri, heat map ve birebir mücadele analizi
        </p>
        <div style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Örn: Lionel Messi, Mbappé, Harry Kane..."
            disabled={loading} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => search()} disabled={loading || !query.trim()}>
            {loading ? '⏳' : '🔍'} Ara
          </button>
        </div>
        {topScorers.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', alignSelf: 'center' }}>Hızlı arama:</span>
            {topScorers.map(s => (
              <button key={s.name} onClick={() => { setQuery(s.name); search(s.name); }}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '3px 8px', borderRadius: 12, fontSize: 10, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {getFlag(s.team)} {s.name} ({s.count}⚽)
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="err-box">{error}</div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 10px' }} />
          Oyuncu verisi analiz ediliyor...
        </div>
      )}

      {player && <PlayerProfile player={player} />}

      {!player && !loading && !error && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚽</div>
          <div style={{ fontSize: 13 }}>Bir oyuncu adı girerek detaylı analiz başlat</div>
          <div style={{ fontSize: 11, marginTop: 6, color: 'var(--border)' }}>Heat map · Birebir mücadele · Pas istatistikleri</div>
        </div>
      )}
    </div>
  );
}

function PlayerProfile({ player: p }) {
  const miniStats = [
    { v: p.tournament_goals, l: 'Gol' }, { v: p.tournament_assists, l: 'Asist' },
    { v: p.tournament_matches, l: 'Maç' }, { v: p.stats.shots_pg, l: 'Şut/Maç' },
    { v: p.stats.key_passes_pg, l: 'Kilit Pas/Maç' }, { v: p.stats.dribbles_pg, l: 'Dribling/Maç' },
    { v: p.stats.tackles_pg, l: 'Top Kapma/Maç' }, { v: p.stats.distance_pg, l: 'Km/Maç' },
    { v: `${p.rating}/10`, l: 'WC Puanı' },
  ];
  const duels = [
    { l: 'Birebir Mücadele', v: p.stats.duel_win },
    { l: 'Zemin Mücadelesi', v: p.stats.ground_win },
    { l: 'Hava Topu', v: p.stats.aerial_win },
    { l: 'Pas Başarı %', v: p.stats.pass_acc },
  ];

  return (
    <div>
      <div className="player-overview">
        <div className="player-avatar">{p.flag || '🏃'}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.flag} {p.country} · {p.position} · {p.age} yaş · {p.club}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            {(p.strengths||[]).map((s, i) => <span key={i} className="player-tag">{s}</span>)}
          </div>
        </div>
      </div>

      <div className="stat-mini-grid">
        {miniStats.map(({ v, l }, i) => (
          <div key={i} className="stat-mini-card">
            <div className="stat-mini-val">{v}</div>
            <div className="stat-mini-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="player-detail-grid">
        <div>
          <div className="section-title">🗺️ HEAT MAP</div>
          <HeatMap zones={p.heatmap || []} />
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>{p.heatmap_desc}</div>
        </div>
        <div>
          <div className="section-title">⚔️ MÜCADELE ANALİZİ</div>
          {duels.map(({ l, v }, i) => (
            <div key={i} className="duel-row">
              <span className="duel-label">{l}</span>
              <div className="duel-bar-track">
                <div className="duel-bar-fill" style={{ width: `${v||0}%` }} />
              </div>
              <span className="duel-val">{v||0}%</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div className="section-title">📝 ÖZET</div>
            <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{p.summary}</p>
            {(p.weaknesses||[]).length > 0 && (
              <div style={{ marginTop: 6, fontSize: 10, color: 'var(--red)' }}>⚠️ {p.weaknesses.join(' · ')}</div>
            )}
          </div>
        </div>
      </div>

      <AiChat
        systemPrompt={`Sen futbol analisti asistanısın. Türkçe, kısa, spesifik cevaplar ver. Markdown kullanma.\n\nOYUNCU VERİSİ:\n${JSON.stringify(p)}`}
        placeholder={`${p.name} hakkında soru sor...`}
        initialMsg={`${p.name} verisi yüklendi. Performans, taktiksel rol veya karşılaştırma için soru sor.`}
        suggestions={[
          `${p.name}'in en güçlü yönlerini analiz et`,
          'Mevkisindeki diğer oyuncularla karşılaştır',
          'Takımına taktiksel katkısı nedir?',
          'Bu turnuvadaki en kritik maçı hangisiydi?',
        ]}
      />
    </div>
  );
}
