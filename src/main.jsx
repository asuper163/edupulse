import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { initializeStorage } from './storage/storageInitializer';
import './styles/index.css';

// Seed demo data on first run (idempotent, schema-versioned)
try {
  initializeStorage();
} catch (err) {
  console.error('[EDUPULSE] Storage initialization failed:', err);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
