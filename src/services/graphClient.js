import { Client } from '@microsoft/microsoft-graph-client';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { loginRequest, msalInstance } from '../auth/msalConfig';

function getActiveAccount() {
  const existing = msalInstance.getActiveAccount();
  if (existing) {
    return existing;
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
    return accounts[0];
  }

  return null;
}

async function getAccessToken() {
  const account = getActiveAccount();
  if (!account) {
    throw new Error('No authenticated account available. Please sign in first.');
  }

  try {
    const token = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return token.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const token = await msalInstance.acquireTokenPopup({
        ...loginRequest,
        account,
      });
      return token.accessToken;
    }
    throw error;
  }
}

export const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken,
  },
});

export default graphClient;
