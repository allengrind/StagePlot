// form.jsx — input forms for show details, musicians list, extras.

function Field({ label, hint, children }) {
  return (
    <label className="sp-field">
      <div className="sp-field-lbl">
        <span>{label}</span>
        {hint && <span className="sp-field-hint">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ShowForm({ show, setShow }) {
  const u = (k) => (e) => setShow({ ...show, [k]: e.target.value });
  const onLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setShow({ ...show, logoDataUrl: reader.result });
    reader.readAsDataURL(f);
  };
  return (
    <section className="sp-form-section">
      <header className="sp-form-h">
        <span className="sp-form-num">01</span>
        <h3>Show Details</h3>
      </header>
      <div className="sp-grid-2">
        <Field label="Band / Artist">
          <input className="sp-input" value={show.band} onChange={u('band')} />
        </Field>
        <Field label="Show / Tour">
          <input className="sp-input" value={show.show} onChange={u('show')} />
        </Field>
        <Field label="Date">
          <input className="sp-input" type="date" value={show.date}
                 onChange={u('date')} />
        </Field>
        <Field label="Venue">
          <input className="sp-input" value={show.venue} onChange={u('venue')} />
        </Field>
        <Field label="Contact" hint="tour mgr · phone">
          <input className="sp-input" value={show.contact} onChange={u('contact')} />
        </Field>
        <Field label="Engineer" hint="FOH / monitors">
          <input className="sp-input" value={show.engineer}
                 onChange={u('engineer')} />
        </Field>
        <Field label="Power Spec" hint="AC requirements">
          <input className="sp-input sp-span-2" value={show.power}
                 onChange={u('power')} />
        </Field>
        <div className="sp-span-2 sp-logo-row">
          <div className="sp-logo-preview">
            {show.logoDataUrl
              ? <img src={show.logoDataUrl} alt="logo" />
              : <span>LOGO</span>}
          </div>
          <div className="sp-logo-actions">
            <label className="sp-btn-ghost sp-btn-upload">
              <input type="file" accept="image/*" onChange={onLogo}
                     style={{ display: 'none' }} />
              {show.logoDataUrl ? 'Replace logo' : 'Upload logo'}
            </label>
            {show.logoDataUrl && (
              <button className="sp-btn-ghost"
                      onClick={() => setShow({ ...show, logoDataUrl: null })}>
                Remove
              </button>
            )}
            <div className="sp-logo-hint">PNG or SVG, appears in plot &amp; export</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MusicianRow = React.memo(function MusicianRow({ m, idx, update, remove }) {
  const u = (k) => (e) => update({ ...m, [k]: e.target.value });
  const ug = (k) => (v) => update({ ...m, gear: { ...m.gear, [k]: v } });
  const role = ROLES[m.role];

  return (
    <div className="sp-mus-row">
      <div className="sp-mus-head">
        <span className="sp-mus-num" style={{ background: role.color }}>
          {idx + 1}
        </span>
        <input className="sp-input sp-mus-name" value={m.name}
               placeholder="Name" onChange={u('name')} />
        <button className="sp-btn-ghost sp-btn-x" onClick={remove} title="Remove">
          ×
        </button>
      </div>
      <div className="sp-mus-grid">
        <Field label="Role">
          <select className="sp-input" value={m.role} onChange={u('role')}>
            {ROLE_KEYS.map((k) => (
              <option key={k} value={k}>{ROLES[k].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Position">
          <select className="sp-input" value={m.pos} onChange={u('pos')}>
            {POSITION_KEYS.map((k) => (
              <option key={k} value={k}>{POSITIONS[k].label}</option>
            ))}
            {m.pos === 'custom' && (
              <option value="custom">
                Custom ({Math.round(m.x || 0)}, {Math.round(m.y || 0)})
              </option>
            )}
          </select>
        </Field>
        <Field label="Wedges">
          <select className="sp-input" value={m.gear.wedges}
                  onChange={(e) => ug('wedges')(Number(e.target.value))}>
            {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      </div>
      <div className="sp-chips">
        {['amp', 'pedalboard', 'di', 'iem'].map((k) => (
          <label key={k} className={`sp-chip ${m.gear[k] ? 'on' : ''}`}>
            <input type="checkbox" checked={!!m.gear[k]}
                   onChange={(e) => ug(k)(e.target.checked)} />
            <span>{k === 'iem' ? 'IEM' : k === 'di' ? 'DI' :
                   k === 'amp' ? 'Amp' : 'Pedals'}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

function MusiciansForm({ musicians, setMusicians }) {
  const update = (i, m) => {
    const next = [...musicians];
    next[i] = m;
    setMusicians(next);
  };
  const remove = (i) => {
    setMusicians(musicians.filter((_, j) => j !== i));
  };
  const add = () => {
    const id = 'm' + (Math.max(0, ...musicians.map((m) => +m.id.slice(1))) + 1);
    setMusicians([...musicians, {
      id, role: 'guitar', name: 'New Member', pos: 'CSC',
      gear: { wedges: 1, iem: false, amp: false, pedalboard: false, di: false },
    }]);
  };

  return (
    <section className="sp-form-section">
      <header className="sp-form-h">
        <span className="sp-form-num">02</span>
        <h3>Lineup <span className="sp-count">{musicians.length}</span></h3>
        <button className="sp-btn-add" onClick={add}>+ Add</button>
      </header>
      <div className="sp-mus-list">
        {musicians.map((m, i) => (
          <MusicianRow key={m.id} m={m} idx={i}
                       update={(nm) => update(i, nm)}
                       remove={() => remove(i)} />
        ))}
      </div>
    </section>
  );
}

function ExtrasForm({ extras, setExtras }) {
  const u = (k, v) => setExtras({ ...extras, [k]: v });

  const addPower = () => {
    const list = extras.powerDropList || [];
    const id = 'p' + (Math.max(0, ...list.map((p) => +p.id.slice(1))) + 1);
    // Stagger new drops slightly so they don't all stack.
    const x = 100 + (list.length * 50) % (STAGE_W - 200);
    u('powerDropList', [...list, { id, x, y: 38 }]);
  };
  const removePower = (id) => {
    u('powerDropList', (extras.powerDropList || []).filter((p) => p.id !== id));
  };
  const resetPower = () => {
    const n = (extras.powerDropList || []).length || 4;
    const list = Array.from({ length: n }, (_, i) => ({
      id: 'p' + (i + 1),
      x: 100 + (i * (STAGE_W - 200)) / Math.max(1, n - 1),
      y: 38,
    }));
    u('powerDropList', list);
  };

  const addRiser = () => {
    const list = extras.risers || [];
    const id = 'r' + (Math.max(0, ...list.map((r) => +r.id.slice(1))) + 1);
    u('risers', [...list, {
      id, x: STAGE_W / 2, y: 320, w: 128, h: 96,
      label: 'Riser ' + (list.length + 1), heightIn: 12,
    }]);
  };
  const updateRiser = (id, patch) => {
    u('risers', (extras.risers || []).map((r) =>
      r.id === id ? { ...r, ...patch } : r));
  };
  const removeRiser = (id) => {
    u('risers', (extras.risers || []).filter((r) => r.id !== id));
  };

  return (
    <section className="sp-form-section">
      <header className="sp-form-h">
        <span className="sp-form-num">03</span>
        <h3>Extras &amp; Notes</h3>
      </header>
      <div className="sp-grid-2">
        <label className={`sp-toggle-row ${extras.sidefills ? 'on' : ''}`}>
          <input type="checkbox" checked={extras.sidefills}
                 onChange={(e) => u('sidefills', e.target.checked)} />
          <div>
            <div className="sp-toggle-h">Sidefills</div>
            <div className="sp-toggle-sub">Wing-mounted house monitors</div>
          </div>
        </label>
        <label className={`sp-toggle-row ${extras.drumfill ? 'on' : ''}`}>
          <input type="checkbox" checked={extras.drumfill}
                 onChange={(e) => u('drumfill', e.target.checked)} />
          <div>
            <div className="sp-toggle-h">Drumfill</div>
            <div className="sp-toggle-sub">Wedge upstage of drummer</div>
          </div>
        </label>
      </div>

      {/* Power drops */}
      <div className="sp-sublist">
        <div className="sp-sublist-h">
          <span>AC DROPS <span className="sp-count">{(extras.powerDropList || []).length}</span></span>
          <div className="sp-sublist-actions">
            <button className="sp-btn-ghost sp-btn-tiny" onClick={resetPower}>Reset</button>
            <button className="sp-btn-add" onClick={addPower}>+ Drop</button>
          </div>
        </div>
        <div className="sp-sublist-hint">Drag each AC drop on stage to position.</div>
        <div className="sp-pill-list">
          {(extras.powerDropList || []).map((p, i) => (
            <div key={p.id} className="sp-pill">
              <span className="sp-pill-dot sp-pill-power" />
              <span className="sp-pill-label">AC {String(i + 1).padStart(2, '0')}</span>
              <span className="sp-pill-coord">{Math.round(p.x)},{Math.round(p.y)}</span>
              <button className="sp-pill-x" onClick={() => removePower(p.id)}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Risers */}
      <div className="sp-sublist">
        <div className="sp-sublist-h">
          <span>RISERS <span className="sp-count">{(extras.risers || []).length}</span></span>
          <button className="sp-btn-add" onClick={addRiser}>+ Riser</button>
        </div>
        <div className="sp-sublist-hint">Drag each riser on stage to position.</div>
        <div className="sp-riser-list">
          {(extras.risers || []).map((r) => (
            <div key={r.id} className="sp-riser-row">
              <input className="sp-input sp-riser-label" value={r.label}
                     onChange={(e) => updateRiser(r.id, { label: e.target.value })} />
              <div className="sp-riser-dims">
                <label>
                  <span>W</span>
                  <input className="sp-input" type="number" min="32" max="400"
                         value={r.w}
                         onChange={(e) => updateRiser(r.id, { w: Number(e.target.value) })} />
                </label>
                <label>
                  <span>H</span>
                  <input className="sp-input" type="number" min="32" max="300"
                         value={r.h}
                         onChange={(e) => updateRiser(r.id, { h: Number(e.target.value) })} />
                </label>
                <label>
                  <span>↑″</span>
                  <input className="sp-input" type="number" min="0" max="60"
                         value={r.heightIn}
                         onChange={(e) => updateRiser(r.id, { heightIn: Number(e.target.value) })} />
                </label>
              </div>
              <button className="sp-pill-x" onClick={() => removeRiser(r.id)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Production notes" hint="anything FOH should know">
        <textarea className="sp-input sp-textarea" value={extras.notes}
                  rows="4" onChange={(e) => u('notes', e.target.value)} />
      </Field>
    </section>
  );
}

Object.assign(window, { ShowForm, MusiciansForm, ExtrasForm });
