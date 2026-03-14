import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import { msalInstance } from './auth/msalConfig';
import './index.css';

const rootElement = React.createElement(
  React.StrictMode,
  null,
  React.createElement(
    MsalProvider,
    { instance: msalInstance },
    React.createElement(BrowserRouter, null, React.createElement(App, null)),
  ),
);

createRoot(document.getElementById('root')).render(rootElement);
