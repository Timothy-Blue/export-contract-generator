import React, { useRef, useState } from 'react';
import { importAPI } from '../services/api';

export default function ImportUploadZone({ onFileSelected, onFileError, disabled, selectedFile, fileError, onUpload }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }

  function handleInputChange(e) {
    const file = e.target.files[0];
    if (file) validateAndSelect(file);
    e.target.value = '';
  }

  function validateAndSelect(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'csv') {
      onFileError('Invalid file format. Please upload a CSV file.');
      return;
    }
    if (file.size === 0) {
      onFileError('File is empty. Please add at least one contract row.');
      return;
    }
    onFileSelected(file);
  }

  const canUpload = selectedFile && !disabled && !fileError;

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#1976d2' : disabled ? '#ccc' : '#90caf9'}`,
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragOver ? '#e3f2fd' : disabled ? '#fafafa' : '#fff',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
        <p style={{ margin: 0, color: disabled ? '#aaa' : '#555' }}>
          Drag & drop a CSV file here, or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>

      {/* File info */}
      {selectedFile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginTop: '8px', padding: '8px 12px',
          background: '#f5f5f5', borderRadius: '4px', fontSize: '13px'
        }}>
          <span>📄 {selectedFile.name}</span>
          <span style={{ color: '#888' }}>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          <button
            onClick={() => onFileSelected(null)}
            disabled={disabled}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Client-side file error */}
      {fileError && (
        <p style={{ color: '#f44336', fontSize: '13px', marginTop: '6px' }}>{fileError}</p>
      )}

      {/* Requirements hint + template link */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        CSV format · UTF-8 encoded · max 20 rows &nbsp;|&nbsp;
        <a
          href={importAPI.templateUrl}
          download
          style={{ color: '#1976d2', pointerEvents: disabled ? 'none' : 'auto' }}
        >
          Download CSV Template
        </a>
      </div>

      {/* Upload button */}
      <button
        onClick={onUpload}
        disabled={!canUpload}
        style={{
          marginTop: '16px',
          background: canUpload ? '#1976d2' : '#ccc',
          color: '#fff', border: 'none', borderRadius: '4px',
          padding: '10px 24px', cursor: canUpload ? 'pointer' : 'not-allowed',
          fontSize: '14px'
        }}
      >
        Upload &amp; Validate
      </button>
    </div>
  );
}
