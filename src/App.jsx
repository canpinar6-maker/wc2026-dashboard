import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { OFB_URL, ESPN_BASE, GROUP_TEAMS } from './constants.js';
import { computeStandings, simulateGroup, getFlag } from './utils.js';
import GroupsTab from './tabs/GroupsTab.jsx';
import MatchesTab, { MatchDetailModal } from './tabs/MatchesTab.jsx';
import BracketTab from './tabs/BracketTab.jsx';
import PlayerTab from './tabs/PlayerTab.jsx';

const TABS = [
  { id: 'groups', label: '📊 PUAN' },
  { id: 'matches', label: '⚽ MAÇLAR' },
  { id: 'bracket', label: '🗓️ BRACKET' },
  { id: 'player', label: '🔍 OYUNCU' },
];

export default function App() {
  const [tab, setTab] = useState('groups');
  const [matches, setMatches] = useState([]);
  const [espnById, setEspnById] = useState({});
  const [standings, setStandings] = useState({});
  const [groupRank, setGroupRank] = useState({});
  const [lastUpdated, setLastUpdated] = useState('Yükleniyor...');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedEspnData, setSelectedEspnData] = useState(null);

  const buildGroupRank = useCallback((newMatches, st) => {
    const gr = {};
    Object.entries(GROUP_TEAMS).forEach(([letter, teams]) => {
      const probs = simulateGroup(teams, st, newMatches);
      gr[letter] = [...teams].map(t => ({
        name: t,
        pts: st[t]?.pts||0,
        gd: (st[t]?.gf||0) - (st[t]?.ga||0),
        gf: st[t]?.gf||0,
        p1: probs[t]?.p1||0,
        p2: probs[t]?.p2||0,
        p3: probs[t]?.p3||0,
      })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    });
    return gr;
  }, []);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    const [ofbRes, espnRes] = await Promise.allSettled([
      fetch(OFB_URL + '?_=' + Date.now()).then(r => r.json()),
      fetch(`${ESPN_BASE}/scoreboard?limit=200&dates=20260611-20260719&_=${Date.now()}`).then(r => r.json()),
    ]);
    let newMatches = matches;
    if (ofbRes.status === 'fulfilled') newMatches = ofbRes.value.matches || [];
    const newEspn = {};
    if (espnRes.status === 'fulfilled') (espnRes.value.events||[]).forEach(e => { newEspn[e.id] = e; });
    const st = computeStandings(newMatches);
    const gr = buildGroupRank(newMatches, st);
    setMatches(newMatches); setEspnById(newEspn); setStandings(st); setGroupRank(gr);
    setLastUpdated('Son güncelleme: ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, [buildGroupRank]);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 120000);
    return () => clearInterval(iv);
  }, []);

  async function handleMatchClick(m, espnId) {
    setSelectedMatch(m); setSelectedEspnData(null);
    if (espnId) {
      try {
        const r = await fetch(`${ESPN_BASE}/summary?event=${espnId}&_=${Date.now()}`);
        if (r.ok) setSelectedEspnData(await r.json());
      } catch (e) {}
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="header">
        <div className="header-left">
          <span className="header-trophy">🏆</span>
          <div>
            <div className="header-title">2026 FIFA DÜNYA KUPASI</div>
            <div className="header-sub">Canlı Puan · Maç Detayları · AI Analiz</div>
          </div>
        </div>
        <div className="header-right">
          <div className="live-dot" />
          <span className="header-updated">{lastUpdated}</span>
          <button className="btn btn-ghost" onClick={fetchAll} disabled={refreshing}>
            {refreshing ? '⏳' : '⟳'} Güncelle
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <div key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className="content">
        {tab === 'groups' && <GroupsTab matches={matches} standings={standings} groupRank={groupRank} />}
        {tab === 'matches' && <MatchesTab matches={matches} espnById={espnById} onMatchClick={handleMatchClick} />}
        {tab === 'bracket' && <BracketTab groupRank={groupRank} />}
        {tab === 'player' && <PlayerTab matches={matches} />}
      </div>

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          espnData={selectedEspnData}
          onClose={() => { setSelectedMatch(null); setSelectedEspnData(null); }}
        />
      )}
    </div>
  );
}
