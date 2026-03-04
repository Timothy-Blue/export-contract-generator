import React from 'react';

export default function ImportConfirmDialog({ rowCount, onConfirm, onCancel }) {
  return (
    <div style={{
      background: '#e8f5e9', border: '1px solid #4caf50',
      borderRadius: '6px', padding: '24px', marginTop: '16px', textAlign: 'center'
    }}>
      <p style={{ fontSize: '16px', marginBottom: '20px' }}>
        All <strong>{rowCount}</strong> rows are valid. Import <strong>{rowCount}</strong> contracts?
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onConfirm} style={{
          background: '#4caf50', color: '#fff', border: 'none',
          borderRadius: '4px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px'
        }}>
          Import
        </button>
        <button onClick={onCancel} style={{
          background: '#fff', color: '#555', border: '1px solid #ccc',
          borderRadius: '4px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px'
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
