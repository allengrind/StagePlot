// backline.jsx — editable backline (equipment) list.

const OWNER_OPTIONS = ['Band', 'House', 'Venue', 'Rented'];

function buildBacklineList(musicians) {
  const order = ['drums', 'bass', 'guitar', 'rguitar', 'keys', 'dj', 'horns',
                 'perc', 'vocal', 'bgv'];
  const sorted = [...musicians].sort((a, b) =>
    order.indexOf(a.role) - order.indexOf(b.role));
  const rows = [];
  for (const m of sorted) {
    const items = backlineForRole(m.role, m.name);
    for (const it of items) {
      rows.push({
        id: uid('bl'),
        actor: m.name, role: m.role, ...it,
      });
    }
  }
  return rows;
}

function BacklineList({ backline, setBackline, musicians, show, accent }) {
  const update = (id, patch) => {
    setBackline(backline.map((b) => b.id === id ? { ...b, ...patch } : b));
  };
  const remove = (id) => {
    setBackline(backline.filter((b) => b.id !== id));
  };
  const add = () => {
    setBackline([...backline, {
      id: uid('bl'),
      item: 'New item', detail: '', owner: 'Band', note: '',
      actor: '', role: 'other',
    }]);
  };
  const regenerate = () => {
    if (!confirm('Regenerate backline from current lineup? This discards your edits.'))
      return;
    setBackline(buildBacklineList(musicians));
  };
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= backline.length) return;
    const next = [...backline];
    [next[idx], next[j]] = [next[j], next[idx]];
    setBackline(next);
  };

  const actorOptions = musicians.map((m) => m.name).filter(Boolean);

  // Owner totals for footer summary.
  const owners = backline.reduce((acc, r) => {
    const k = r.owner || '—';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="sp-il">
      <BacklineDatalists />
      <header className="sp-il-head">
        <div>
          <div className="sp-il-eyebrow">BACKLINE · EQUIPMENT LIST</div>
          <h2 className="sp-il-title">{show.band}</h2>
          <div className="sp-il-meta">
            {show.venue} · {show.date}
          </div>
        </div>
        <div className="sp-il-totals">
          <div className="sp-il-totals-row">
            <span className="sp-il-totals-num" style={{ color: accent }}>
              {backline.length}
            </span>
            <span className="sp-il-totals-lbl">items</span>
          </div>
          <div className="sp-il-totals-row">
            <span className="sp-il-totals-num">{musicians.length}</span>
            <span className="sp-il-totals-lbl">performers</span>
          </div>
        </div>
      </header>

      <div className="sp-il-toolbar">
        <button className="sp-btn-ghost sp-btn-tiny" onClick={regenerate}>
          ↻ Regenerate from lineup
        </button>
        <div className="sp-il-toolbar-spacer" />
        <button className="sp-btn-add" onClick={add}>+ Item</button>
      </div>

      <table className="sp-il-table sp-il-table-editable">
        <thead>
          <tr>
            <th style={{ width: 32 }}></th>
            <th>ITEM</th>
            <th>BRAND / MODEL</th>
            <th style={{ width: 96 }}>OWNER</th>
            <th>FOR</th>
            <th>NOTES</th>
            <th style={{ width: 28 }}></th>
          </tr>
        </thead>
        <tbody>
          {backline.map((r, idx) => {
            const roleColor = ROLES[r.role]?.color || '#888';
            return (
              <tr key={r.id}>
                <td className="sp-il-handle">
                  <button className="sp-il-arr" onClick={() => move(idx, -1)}
                          title="Move up" disabled={idx === 0}>▲</button>
                  <button className="sp-il-arr" onClick={() => move(idx, 1)}
                          title="Move down"
                          disabled={idx === backline.length - 1}>▼</button>
                </td>
                <td>
                  <div className="sp-bl-item-cell">
                    <span className="sp-bl-dot" style={{ background: roleColor }} />
                    <input className="sp-il-input sp-il-src" value={r.item}
                           list="sp-bldb-items" placeholder="Item"
                           onChange={(e) => update(r.id, { item: e.target.value })} />
                  </div>
                </td>
                <td>
                  <input className="sp-il-input sp-il-mic" value={r.detail || ''}
                         list={`sp-bldb-${backlineCategoryFor(r.item)}`}
                         placeholder="brand / model / size"
                         onChange={(e) => update(r.id, { detail: e.target.value })} />
                </td>
                <td>
                  <select className={`sp-il-input sp-il-stand sp-bl-owner sp-bl-owner-${(r.owner || '').toLowerCase()}`}
                          value={r.owner || ''}
                          onChange={(e) => update(r.id, { owner: e.target.value })}>
                    {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
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
                          title="Remove item">×</button>
                </td>
              </tr>
            );
          })}
          {backline.length === 0 && (
            <tr>
              <td colSpan="7" className="sp-il-empty">
                No backline items. Click + Item or ↻ Regenerate from lineup.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <footer className="sp-il-foot">
        <div className="sp-il-summary">
          <div className="sp-il-sum-h">PROVIDED BY</div>
          <div className="sp-il-sum-grid">
            {Object.entries(owners).map(([k, v]) => (
              <div key={k} className="sp-il-sum-cell">
                <span className="sp-il-sum-num">{v}</span>
                <span className="sp-il-sum-lbl">{k.toLowerCase()}</span>
              </div>
            ))}
            {Object.keys(owners).length === 0 && (
              <span className="sp-il-sum-lbl">no items</span>
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

Object.assign(window, { BacklineList, buildBacklineList });
