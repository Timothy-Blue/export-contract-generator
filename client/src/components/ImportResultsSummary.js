import React, { useState } from 'react';

const STATUS_COLORS = {
  valid: '#4caf50',
  invalid: '#f44336',
  warning: '#ff9800',
  imported: '#1976d2'
};

function RowResultItem({ row, importResult }) {
  const [expanded, setExpanded] = useState(false);
  const status = importResult
    ? importResult.status === 'imported' ? 'imported' : 'invalid'
    : row.status;

  return (
    <div style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <span style={{ minWidth: '60px', color: '#888', fontSize: '13px' }}>Row {row.rowNumber}</span>
        <span style={{ flex: 1, fontSize: '14px' }}>{row.contractNumber || '—'}</span>
        <span style={{
          background: STATUS_COLORS[status] || '#888',
          color: '#fff', borderRadius: '12px',
          padding: '2px 10px', fontSize: '12px', textTransform: 'capitalize'
        }}>
          {status}
        </span>
        <span style={{ color: '#aaa', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: '8px', paddingLeft: '72px', fontSize: '13px' }}>
          {row.errors && row.errors.map((e, i) => (
            <div key={i} style={{ color: '#c62828', marginBottom: '4px' }}>
              <strong>{e.field}:</strong> {e.message}
            </div>
          ))}
          {row.warnings && row.warnings.map((w, i) => (
            <div key={i} style={{ color: '#e65100', marginBottom: '4px' }}>
              <strong>{w.field}:</strong> {w.message}
            </div>
          ))}
          {importResult && importResult.status === 'imported' && (
            <div style={{ color: '#1976d2' }}>Imported — Contract ID: {importResult.contractId}</div>
          )}
          {importResult && importResult.status === 'failed' && (
            <div style={{ color: '#c62828' }}>Not imported: {importResult.error}</div>
          )}
          {!importResult && row.status === 'valid' && (
            <div style={{ color: '#4caf50' }}>Valid — not yet imported</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImportResultsSummary({ response, onReset }) {
  const { summary, validationResults, importResults } = response;
  const importMap = importResults
    ? Object.fromEntries(importResults.map(r => [r.rowNumber, r]))
    : {};

  const cardColor = summary.invalidRows > 0 ? '#fdecea' : '#e8f5e9';
  const cardBorder = summary.invalidRows > 0 ? '#f44336' : '#4caf50';

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Summary card */}
      <div style={{
        background: cardColor, border: `1px solid ${cardBorder}`,
        borderRadius: '6px', padding: '16px 20px', marginBottom: '16px',
        display: 'flex', gap: '24px', flexWrap: 'wrap'
      }}>
        {[
          ['Total Rows', summary.totalRows],
          ['Valid', summary.validRows],
          ['Invalid', summary.invalidRows],
          ['Imported', summary.importedRows]
        ].map(([label, value]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#555' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Row results */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '8px 16px' }}>
        {[...validationResults]
          .sort((a, b) => a.rowNumber - b.rowNumber)
          .map(row => (
            <RowResultItem
              key={row.rowNumber}
              row={row}
              importResult={importMap[row.rowNumber]}
            />
          ))}
      </div>

      <button onClick={onReset} style={{
        marginTop: '16px', background: '#1976d2', color: '#fff',
        border: 'none', borderRadius: '4px', padding: '10px 20px',
        cursor: 'pointer', fontSize: '14px'
      }}>
        Upload Another File
      </button>
    </div>
  );
}
