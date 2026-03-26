import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './auth/AuthContext.jsx'

import { auth } from './lib/firebase.js';

const root = document.getElementById('root');

if (!auth) {
  root.innerHTML = `
    <div style="font-family: system-ui, sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; text-align: center;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #ef4444; margin-top: 0; font-size: 24px;">Configuration Missing</h1>
        <p style="color: #475569; line-height: 1.6;">The application cannot start because Firebase Environment Variables are missing.</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: left; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 14px; color: #334155;">How to fix this on Vercel:</h3>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.5;">
            <li>Go to your Vercel Project Dashboard</li>
            <li>Click Settings > Environment Variables</li>
            <li>Copy everything from your local <code>.env</code> file</li>
            <li>Paste it directly into the first Key input field (Vercel will auto-parse them all)</li>
            <li>Click Save, then go to Deployments and trigger a new deployment.</li>
          </ol>
        </div>
      </div>
    </div>
  `;
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}
