import { Injectable, computed, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AuthService } from "@auth0/auth0-angular";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, EMPTY } from "rxjs";
import { ADMIN_ROLE, ROLES_CLAIM } from "./auth.tokens";

type UserProfile = Record<string, unknown> & {
  name?: string;
  email?: string;
  picture?: string;
  [ROLES_CLAIM]?: string[];
};

@Injectable({ providedIn: "root" })
export class AuthFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth0?: AuthService;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth0 = inject(AuthService);
    }
  }

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private baseUrl(): string {
    if (!this.isBrowser) {
      return "https://foodlytics.onrender.com";
    }

    return window.location.origin;
  }

  private buildReturnTo(fallbackPath = "/auth/logged-out"): string {
    return this.baseUrl() + fallbackPath;
  }

  // ------- Signals del SDK -------
  readonly isLoading = toSignal(this.auth0?.isLoading$ ?? EMPTY, {
    initialValue: true,
  });

  readonly isAuthenticated = toSignal(this.auth0?.isAuthenticated$ ?? EMPTY, {
    initialValue: false,
  });

  readonly user = toSignal<UserProfile | null>(
    (this.auth0?.user$ ?? EMPTY).pipe(map((u) => u ?? null)),
    { initialValue: null },
  );

  // ------- Derivados -------
  readonly roles = computed<string[]>(() => this.user()?.[ROLES_CLAIM] ?? []);
  readonly isAdmin = computed<boolean>(() => this.roles().includes(ADMIN_ROLE));
  readonly displayName = computed(() => this.user()?.name ?? "");
  readonly email = computed(() => this.user()?.email ?? "");
  readonly avatar = computed(() => this.user()?.picture ?? "");

  // ------- Acciones -------
  login(redirectTo = "/dashboard"): void {
    if (!this.isBrowser || !this.auth0) return;
    this.auth0.loginWithRedirect({
      authorizationParams: {
        redirect_uri: this.baseUrl() + "/auth/callback",
      },
      appState: { target: redirectTo },
    });
  }

  signup(redirectTo = "/dashboard"): void {
    if (!this.isBrowser || !this.auth0) return;
    this.auth0.loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        redirect_uri: this.baseUrl() + "/auth/callback",
      },
      appState: { target: redirectTo },
    });
  }

  forgotPassword(redirectTo = "/auth/callback"): void {
    if (!this.isBrowser || !this.auth0) return;
    this.auth0.loginWithRedirect({
      authorizationParams: {
        redirect_uri: this.baseUrl() + redirectTo,
      },
    });
  }

  logout(redirectPath = "/auth/logout"): void {
    if (!this.isBrowser || !this.auth0) return;
    this.defensiveLocalCleanup();
    const returnTo = this.baseUrl() + redirectPath;
    this.auth0.logout({
      logoutParams: { returnTo },
    });
  }

  logoutAll(returnTo?: string): void {
    if (!this.isBrowser || !this.auth0) return;
    this.defensiveLocalCleanup();
    this.auth0.logout({
      logoutParams: {
        returnTo: returnTo ?? this.buildReturnTo(),
        federated: true,
      },
    });
  }

  private defensiveLocalCleanup(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("@@auth0spajs") || k.startsWith("auth0."))
        .forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("auth0.expiresAt");
      sessionStorage.removeItem("auth0.expiresAt");
    } catch {
      /* no-op */
    }
  }

  getAccessTokenSilently(
    options?: Parameters<AuthService["getAccessTokenSilently"]>[0],
  ) {
    if (!this.auth0) return EMPTY;
    return this.auth0.getAccessTokenSilently(options);
  }
}
