import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
} catch (err) {
  console.error('Fatal: React failed to mount:', err);
  const el = document.getElementById('app-error');
  const msg = document.getElementById('app-error-msg');
  if (el) el.style.display = 'block';
  if (msg) msg.textContent = err.message || 'Unknown error';
}
