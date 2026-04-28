import { useState } from 'react'

const FIELDS = {
  date:     { label: 'Date',         desc: 'When the job was done',           required: true  },
  client:   { label: 'Client',       desc: 'Customer or business name',       required: true  },
  address:  { label: 'Address',      desc: 'Job location',                    required: true  },
  service:  { label: 'Service type', desc: 'Type of work performed',          required: true  },
  revenue:  { label: 'Revenue ($)',  desc: 'Amount charged',                  required: true  },
  duration: { label: 'Duration',     desc: 'Time spent on the job',           required: true  },
  employee: { label: 'Employee',     desc: 'Who did the work',                required: false },
  notes:    { label: 'Notes',        desc: 'Any extra details',               required: false },
  status:   { label: 'Status',       desc: 'Job outcome',                     required: false },
}

export default function ColumnMapper({ mappingData, onConfirm, onBack }) {
  const {
    suggested = {}, confidence = {}, all_columns = [],
    sample_rows = [], needs_review = [], filename = '',
    total_rows = 0, csv_content = '',
  } = mappingData

  const [mapping, setMapping] = useState(() => {
    const m = {}
    Object.keys(FIELDS).forEach(f => { m[f] = suggested[f] || '' })
    return m
  })
  const [submitting, setSubmitting] = useState(false)

  const missingRequired = Object.entries(FIELDS)
    .filter(([f, meta]) => meta.required && !mapping[f])
    .map(([f]) => f)

  const handleConfirm = async () => {
    if (missingRequired.length > 0) return
    setSubmitting(true)
    try { await onConfirm({ csv_data: csv_content, mapping }) }
    finally { setSubmitting(false) }
  }

  const getConf = (field) => {
    if (!mapping[field] || mapping[field] !== suggested[field]) return null
    return confidence[field] || 0
  }

  const confLabel = (score) => {
    if (score >= 0.9) return { text: 'Auto-matched', color: '#22c55e', bg: '#22c55e14' }
    if (score >= 0.7) return { text: 'Review', color: '#f59e0b', bg: '#f59e0b14' }
    return { text: 'Low confidence', color: '#ef4444', bg: '#ef444414' }
  }

  const borderColor = (field) => {
    const meta = FIELDS[field]
    if (!mapping[field] && meta.required) return '#ef4444'
    if (needs_review.includes(field) && mapping[field]) return '#f59e0b'
    if (mapping[field]) return '#22c55e'
    return '#2a2a2a'
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#6b7280', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>← Back</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f9fafb' }}>Match your columns</h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>
            <strong style={{ color: '#9ca3af' }}>{filename}</strong> · {total_rows} jobs · We auto-matched your columns below
          </p>
        </div>
      </div>

      {/* Missing required alert */}
      {missingRequired.length > 0 && (
        <div style={{ background: '#ef444412', border: '1px solid #ef444430', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          Assign a column for: <strong>{missingRequired.map(f => FIELDS[f].label).join(', ')}</strong>
        </div>
      )}

      {/* Field rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {Object.entries(FIELDS).map(([field, meta]) => {
          const conf = getConf(field)
          const cl = conf !== null ? confLabel(conf) : null
          const samples = sample_rows.slice(0, 3).map(row => {
            const idx = all_columns.indexOf(mapping[field])
            return idx >= 0 ? row[idx] : ''
          }).filter(Boolean)

          return (
            <div key={field} style={{
              display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center',
              gap: 16, background: '#141414', borderRadius: 10, padding: '12px 16px',
              borderLeft: `3px solid ${borderColor(field)}`,
            }}>
              {/* Left: label */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#f3f4f6' }}>{meta.label}</span>
                  {meta.required && <span style={{ color: '#ef4444', fontSize: 13 }}>*</span>}
                  {!meta.required && <span style={{ fontSize: 11, color: '#4b5563', background: '#1f2937', padding: '1px 6px', borderRadius: 4 }}>optional</span>}
                </div>
                <div style={{ fontSize: 12, color: '#4b5563' }}>{meta.desc}</div>
                {cl && (
                  <div style={{ display: 'inline-block', marginTop: 5, fontSize: 11, fontWeight: 600, color: cl.color, background: cl.bg, padding: '2px 7px', borderRadius: 4 }}>
                    {cl.text}
                  </div>
                )}
              </div>

              {/* Right: dropdown + samples */}
              <div>
                <select value={mapping[field]} onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
                  style={{ width: '100%', background: '#0f0f0f', color: '#f3f4f6', border: `1px solid ${!mapping[field] && meta.required ? '#ef444466' : '#2a2a2a'}`, borderRadius: 7, padding: '8px 10px', fontSize: 13, cursor: 'pointer', marginBottom: samples.length ? 7 : 0 }}>
                  <option value="">— not used —</option>
                  {all_columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
                {samples.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {samples.map((v, i) => (
                      <span key={i} style={{ background: '#1f2937', color: '#9ca3af', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview table */}
      {sample_rows.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>First {sample_rows.length} rows of your file</p>
          <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #1f2937' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>{all_columns.map(col => <th key={col} style={{ background: '#0f0f0f', color: '#6b7280', padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #1f2937', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {sample_rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#0a0a0a' : '#0f0f0f' }}>
                    {all_columns.map((col, j) => <td key={col} style={{ color: '#9ca3af', padding: '7px 12px', borderBottom: '1px solid #141414', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[j] || ''}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #1f2937' }}>
        <p style={{ fontSize: 13, color: '#4b5563', margin: 0 }}>
          {missingRequired.length === 0
            ? <span style={{ color: '#22c55e' }}>✓ Ready to analyze {total_rows} jobs</span>
            : `${missingRequired.length} required field${missingRequired.length > 1 ? 's' : ''} need attention`}
        </p>
        <button onClick={handleConfirm} disabled={missingRequired.length > 0 || submitting}
          style={{ background: missingRequired.length > 0 || submitting ? '#1f2937' : '#6366f1', color: missingRequired.length > 0 || submitting ? '#4b5563' : '#fff', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: missingRequired.length > 0 || submitting ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
          {submitting ? 'Running analysis…' : `Analyze ${total_rows} jobs →`}
        </button>
      </div>
    </div>
  )
}
