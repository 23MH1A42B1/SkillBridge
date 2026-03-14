// src/auth/msalConfig.js
// FIX: redirectUri now uses window.location.origin so it works on
// both http://localhost:5173 (Vite dev) and your production URL.

import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '8af09ceb-0fbf-4619-af7e-e46998b8c497',
    authority: 'https://login.microsoftonline.com/7359f896-71e2-4dae-b8a3-15cdf97f2f10',
    redirectUri: window.location.origin,   // ← was hardcoded to :3000, now dynamic
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const graphScopes = [
  'User.Read',
  'Sites.ReadWrite.All',
  'Files.ReadWrite.All',
  'Mail.Send',
];

export const loginRequest = {
  scopes: graphScopes,
};

export const msalInstance = new PublicClientApplication(msalConfig);
