import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const path = window.location.pathname;
const isCallbackPath = path.endsWith('/linkedin-callback') || path.includes('/leadgen-ai/linkedin-callback');

if (isCallbackPath && window.location.search.includes('code=')) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  const state = params.get('state');
  const newHash = error
    ? `#/linkedin-callback?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(params.get('error_description') || '')}`
    : `#/linkedin-callback?code=${encodeURIComponent(code || '')}${state ? `&state=${state}` : ''}`;
  window.history.replaceState({}, '', newHash);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
