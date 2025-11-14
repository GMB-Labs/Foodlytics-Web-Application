import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { map, filter, take, combineLatest } from "rxjs";

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return combineLatest([
    auth.isLoading$,
    auth.user$,
    auth.isAuthenticated$,
  ]).pipe(
    filter(([loading]) => !loading),
    take(1),
    map(([, user, authed]) => {
      if (!authed) return router.createUrlTree(["/auth"]);
      const roles = (user as any)?.["https://foodlytics.app/roles"] ?? [];
      return roles.includes("nutritionist")
        ? true
        : router.createUrlTree(["/unauthorized"]);
    }),
  );
};
