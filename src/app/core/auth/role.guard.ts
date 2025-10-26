import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from './auth.facade';

// Protege features que requieren rol "nutritionist" (admin)
export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthFacade);
    const router = inject(Router);

    // Si ya está autenticado y es admin → OK
    if (auth.isAuthenticated() && auth.isAdmin()) return true;

    // Si autenticado pero sin rol → fuera
    if (auth.isAuthenticated() && !auth.isAdmin()) {
        router.navigateByUrl('/unauthorized');
        return false;
    }

    // Si no autenticado, deja que AuthGuard (del SDK) fuerce login.
    return true;
};