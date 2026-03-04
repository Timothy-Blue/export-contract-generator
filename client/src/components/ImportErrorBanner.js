import React from 'react';

export default function ImportErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      background: '#fdecea', border: '1px solid #f44336',
      borderRadius: '6px', padding: '16px 20px', marginTop: '16px'
    }}>
      <p style={{ margin: '0 0 12px', color: '#c62828' }}>{message}</p>
      <button onClick={onDismiss} style={{
        background: '#f44336', color: '#fff', border: 'none',
        borderRadius: '4px', padding: '8px 16px', cursor: 'pointer'
      }}>
        Try Again
      </button>
    </div>
  );
}
