import React, { useState } from 'react';
import { importAPI } from '../services/api';
import ImportUploadZone from './ImportUploadZone';
import ImportLoadingSpinner from './ImportLoadingSpinner';
import ImportConfirmDialog from './ImportConfirmDialog';
import ImportResultsSummary from './ImportResultsSummary';
import ImportErrorBanner from './ImportErrorBanner';

/**
 * ContractImportPage
 * Top-level page for the CSV contract import workflow.
 * Owns all state; child components are purely presentational.
 *
 * Phases: idle → loading → confirm | results | error
 */
export default function ContractImportPage({ onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | loading | confirm | results | error
  const [apiResponse, setApiResponse] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [systemError, setSystemError] = useState(null);

  function handleFileSelected(file) {
    setSelectedFile(file);
    setFileError(null);
  }

  function handleFileError(msg) {
    setFileError(msg);
    setSelectedFile(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setPhase('loading');
    try {
      const res = await importAPI.uploadCsv(selectedFile, false);
      const data = res.data;
      setApiResponse(data);

      if (data.summary && data.summary.invalidRows > 0) {
        setPhase('results');
      } else if (data.importResults === null) {
        setPhase('confirm');
      } else {
        setPhase('results');
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || 'Unable to connect to the server. Please check your connection and try again.';
      setSystemError(msg);
      setPhase('error');
    }
  }

  async function handleConfirm() {
    setPhase('loading');
    try {
      const res = await importAPI.uploadCsv(selectedFile, true);
      setApiResponse(res.data);
      setPhase('results');
    } catch (err) {
      const msg = err.response?.data?.message
        || 'Import failed due to a server error. Please contact your administrator.';
      setSystemError(msg);
      setPhase('error');
    }
  }

  function handleCancel() {
    setPhase('idle');
    setSelectedFile(null);
    setApiResponse(null);
  }

  function handleReset() {
    setSelectedFile(null);
    setPhase('idle');
    setApiResponse(null);
    setFileError(null);
    setSystemError(null);
  }

  const isLoading = phase === 'loading';

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#1976d2', fontSize: '14px'
        }}>
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Import Contracts</h2>
      </div>

      {/* Upload zone — shown in idle and error phases */}
      {(phase === 'idle' || phase === 'error') && (
        <ImportUploadZone
          onFileSelected={handleFileSelected}
          onFileError={handleFileError}
          disabled={isLoading}
          selectedFile={selectedFile}
          fileError={fileError}
          onUpload={handleUpload}
        />
      )}

      {/* Loading spinner */}
      {phase === 'loading' && <ImportLoadingSpinner />}

      {/* Confirm dialog */}
      {phase === 'confirm' && apiResponse && (
        <ImportConfirmDialog
          rowCount={apiResponse.summary.validRows}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Results summary */}
      {phase === 'results' && apiResponse && (
        <ImportResultsSummary response={apiResponse} onReset={handleReset} />
      )}

      {/* Error banner */}
      {phase === 'error' && systemError && (
        <ImportErrorBanner message={systemError} onDismiss={handleReset} />
      )}
    </div>
  );
}
