import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID ?? "common";
const scopes = ["Files.ReadWrite", "User.Read", "offline_access"];

const pca = new PublicClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await pca.initialize();
    isInitialized = true;
  }
}

export async function acquireGraphToken(customScopes: string[] = scopes) {
  await ensureInitialized();

  let account = pca.getActiveAccount() ?? pca.getAllAccounts()[0];

  if (!account) {
    const result = await pca.loginPopup({ scopes: customScopes });
    account = result.account;
  }

  if (!account) {
    throw new Error("MSAL login did not return an account record.");
  }

  pca.setActiveAccount(account);

  try {
    const result = await pca.acquireTokenSilent({ account, scopes: customScopes });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const result = await pca.acquireTokenPopup({ account, scopes: customScopes });
      return result.accessToken;
    }

    throw error;
  }
}
