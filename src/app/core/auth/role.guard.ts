// core/auth/admin.guard.ts
import { inject } from "@angular/core";
import { CanMatchFn, Router, UrlSegment, Route } from "@angular/router";
import { AuthFacade } from "./auth.facade";

export const adminGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[],
) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(["/auth"]);
  }

  if (!auth.isAdmin()) {
    return router.createUrlTree(["/starter"]); // o "/not-authorized" si creas esa vista
  }

  return true;
};
