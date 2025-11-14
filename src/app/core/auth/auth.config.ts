import { environment } from "../../../environments/environment";
import type { AuthConfig } from "@auth0/auth0-angular";

const isBrowser: boolean = typeof window !== "undefined";

const redirectUri: string = isBrowser
  ? `${window.location.origin}/auth/callback`
  : "https://foodlytics.onrender.com/auth/callback"; // fallback para SSR

export const AUTH0_CONFIG: AuthConfig = {
  domain: environment.auth0Domain,
  clientId: environment.auth0ClientId,
  authorizationParams: {
    redirect_uri: redirectUri,
    scope: "openid profile email offline_access",
  },
  cacheLocation: "localstorage",
  useRefreshTokens: true,
  useRefreshTokensFallback: true,
  httpInterceptor: {
    allowedList: ["/api/*"],
  },
};
