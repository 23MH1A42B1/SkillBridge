import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '8af09ceb-0fbf-4619-af7e-e46998b8c497',
    authority: 'https://login.microsoftonline.com/7359f896-71e2-4dae-b8a3-15cdf97f2f10',
    redirectUri: 'http://localhost:3000',
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
