import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const path = window.location.pathname;
const search = window.location.search;
const isDirectCallback = path.endsWith('/linkedin-callback') || path.includes('/leadgen-ai/linkedin-callback');
const isGithubPagesRedirect = search.includes('/linkedin-callback') || search.includes('linkedin-callback');

if ((isDirectCallback || isGithubPagesRedirect) && (search.includes('code=') || search.includes('&code='))) {
  const allParams = new URLSearchParams(search.includes('/linkedin-callback') ? search.substring(search.indexOf('/linkedin-callback')) : search);
  const code = allParams.get('code');
  const error = allParams.get('error');
  const state = allParams.get('state');
  if (code || error) {
    const newHash = error
      ? `#/linkedin-callback?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(allParams.get('error_description') || '')}`
      : `#/linkedin-callback?code=${encodeURIComponent(code || '')}${state ? `&state=${state}` : ''}`;
    window.history.replaceState({}, '', newHash);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
