// input-list.jsx — editable channel list table.

function buildChannelList(musicians) {
  const order = ['drums', 'bass', 'guitar', 'rguitar', 'keys', 'dj', 'horns',
                 'perc', 'vocal', 'bgv'];
  const sorted = [...musicians].sort((a, b) =>
    order.indexOf(a.role) - order.indexOf(b.role));
  const rows = [];
  let ch = 1;
  for (const m of sorted) {
    const chs = channelsForRole(m.role, m.name);
    for (const c of chs) {
      rows.push({
        id: uid('ch'), ch: ch++, ...c, role: m.role,
      });
    }
  }
  return rows;
}

const STAND_OPTIONS = ['tall', 'short', 'clip', '—'];

function InputList({ channels, setChannels, musicians, show, accent, theme }) {
  const update = (id, patch) => {
    setChannels(channels.map((c) => c.id === id ? { ...c, ...patch } : c));
  };
  const remove = (id) => {
    setChannels(channels.filter((c) => c.id !== id));
  };
  const add = () => {
    const ch = (channels[channels.length - 1]?.ch || 0) + 1;
    setChannels([...channels, {
      id: uid('row'), ch, src: 'New source', mic: 'SM58', stand: 'tall',
      actor: '', note: '', role: 'other',
    }]);
  };
  const renumber = () => {
    setChannels(channels.map((c, i) => ({ ...c, ch: i + 1 })));
  };
  const regenerate = () => {
    if (!confirm('Regenerate channel list from current lineup? This discards your edits.'))
      return;
    setChannels(buildChannelList(musicians));
  };
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= channels.length) return;
    const next = [...channels];
    [next[idx], next[j]] = [next[j], next[idx]];
    setChannels(next);
  };

  const actorOptions = musicians.map((m) => m.name).filter(Boolean);

  // Stand totals for footer summary — auto-updates as user edits.
  const stands = channels.reduce((acc, r) => {
    if (r.stand && r.stand !== '—') acc[r.stand] = (acc[r.stand] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="sp-il">
      <header className="sp-il-head">
        <div>
          <div className="sp-il-eyebrow">INPUT LIST · STAGE LEFT TO RIGHT</div>
          <h2 className="sp-il-title">{show.band}</h2>
          <div className="sp-il-meta">
            {show.venue} · {show.date}
          </div>
        </div>
        <div className="sp-il-totals">
          <div className="sp-il-totals-row">
            <span className="sp-il-totals-num" style={{ color: accent }}>
              {channels.length}
            </span>
            <span className="sp-il-totals-lbl">channels</span>
          </div>
          <div className="sp-il-totals-row">
            <span className="sp-il-totals-num">{musicians.length}</span>
            <span className="sp-il-totals-lbl">performers</span>
          </div>
        </div>
      </header>

      <div className="sp-il-toolbar">
        <button className="sp-btn-ghost sp-btn-tiny" onClick={renumber}>
          Renumber 01…{String(channels.length).padStart(2, '0')}
        </button>
        <button className="sp-btn-ghost sp-btn-tiny" onClick={regenerate}>
          ↻ Regenerate from lineup
        </button>
        <div className="sp-il-toolbar-spacer" />
        <button className="sp-btn-add" onClick={add}>+ Channel</button>
      </div>

      <MicDatalists />

      <table className="sp-il-table sp-il-table-editable">
        <thead>
          <tr>
            <th style={{ width: 32 }}></th>
            <th style={{ width: 56 }}>CH</th>
            <th>SOURCE</th>
            <th>MIC / DI</th>
            <th style={{ width: 86 }}>STAND</th>
            <th>ACTOR</th>
            <th>NOTES</th>
            <th style={{ width: 28 }}></th>
          </tr>
        </thead>
        <tbody>
          {channels.map((r, idx) => {
            const roleColor = ROLES[r.role]?.color || '#888';
            return (
              <tr key={r.id}>
                <td className="sp-il-handle">
                  <button className="sp-il-arr" onClick={() => move(idx, -1)}
                          title="Move up" disabled={idx === 0}>▲</button>
                  <button className="sp-il-arr" onClick={() => move(idx, 1)}
                          title="Move down"
                          disabled={idx === channels.length - 1}>▼</button>
                </td>
                <td>
                  <input className="sp-il-input sp-il-ch-input"
                         style={{ borderColor: roleColor }}
                         type="number" min="1" max="999"
                         value={r.ch}
                         onChange={(e) => update(r.id, { ch: Number(e.target.value) })} />
                </td>
                <td>
                  <input className="sp-il-input sp-il-src" value={r.src}
                         list="sp-micdb-sources" placeholder="Source"
                         onChange={(e) => update(r.id, { src: e.target.value })} />
                </td>
                <td>
                  <input className="sp-il-input sp-il-mic"
                         list={`sp-micdb-${micCategoryFor(r.src)}`} value={r.mic}
                         placeholder="Mic / DI"
                         onChange={(e) => update(r.id, { mic: e.target.value })} />
                </td>
                <td>
                  <select className="sp-il-input sp-il-stand"
                          value={r.stand || '—'}
                          onChange={(e) => update(r.id, { stand: e.target.value })}>
                    {STAND_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <select className="sp-il-input sp-il-actor"
                          value={r.actor || ''}
                          onChange={(e) => update(r.id, { actor: e.target.value })}>
                    <option value="">—</option>
                    {actorOptions.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    {r.actor && !actorOptions.includes(r.actor) && (
                      <option value={r.actor}>{r.actor} (not in lineup)</option>
                    )}
                  </select>
                </td>
                <td>
                  <input className="sp-il-input sp-il-note"
                         value={r.note || ''} placeholder="—"
                         onChange={(e) => update(r.id, { note: e.target.value })} />
                </td>
                <td>
                  <button className="sp-pill-x" onClick={() => remove(r.id)}
                          title="Remove channel">×</button>
                </td>
              </tr>
            );
          })}
          {channels.length === 0 && (
            <tr>
              <td colSpan="8" className="sp-il-empty">
                No channels. Click + Channel above to add one, or ↻ Regenerate
                to pull from the current lineup.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <footer className="sp-il-foot">
        <div className="sp-il-summary">
          <div className="sp-il-sum-h">STAND COUNT</div>
          <div className="sp-il-sum-grid">
            {Object.entries(stands).map(([k, v]) => (
              <div key={k} className="sp-il-sum-cell">
                <span className="sp-il-sum-num">{v}</span>
                <span className="sp-il-sum-lbl">{k}</span>
              </div>
            ))}
            {Object.keys(stands).length === 0 && (
              <span className="sp-il-sum-lbl">no stands</span>
            )}
          </div>
        </div>
        <div className="sp-il-summary">
          <div className="sp-il-sum-h">CONTACT</div>
          <div className="sp-il-sum-text">
            <div>{show.contact}</div>
            <div className="sp-il-sum-muted">{show.engineer}</div>
          </div>
        </div>
        <div className="sp-il-summary">
          <div className="sp-il-sum-h">POWER</div>
          <div className="sp-il-sum-text">{show.power}</div>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { InputList, buildChannelList });
