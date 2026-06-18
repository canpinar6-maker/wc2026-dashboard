import { useState, useRef, useEffect } from 'react';
import { askClaude } from '../utils.js';

export default function AiChat({ systemPrompt, placeholder, suggestions, initialMsg }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: initialMsg }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(q) {
    const question = q || input.trim();
    if (!question || loading) return;
    setInput('');
    setMessages(prev => [...prev,
      { role: 'user', text: question },
      { role: 'thinking', text: 'Analiz ediliyor...' }
    ]);
    setLoading(true);
    try {
      const reply = await askClaude(systemPrompt, question);
      setMessages(prev => prev.filter(m => m.role !== 'thinking').concat({ role: 'assistant', text: reply }));
    } catch (e) {
      setMessages(prev => prev.filter(m => m.role !== 'thinking').concat({ role: 'error', text: 'Hata: ' + e.message }));
    }
    setLoading(false);
  }

  return (
    <div className="ai-section">
      <div className="ai-header">
        <span>🤖</span>
        <span style={{ fontSize: 11, fontWeight: 700 }}>AI ANALİZ</span>
        <span className="ai-badge">Claude Sonnet</span>
      </div>
      {suggestions?.length > 0 && (
        <div className="ai-suggestions">
          {suggestions.map((q, i) => (
            <button key={i} className="ai-suggestion-btn" onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      )}
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            {m.text.split('\n').map((line, j) => (
              <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
            ))}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="ai-input-row">
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={placeholder}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}>
          Sor →
        </button>
      </div>
    </div>
  );
}
