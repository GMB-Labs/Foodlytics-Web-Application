import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AuthService } from "@auth0/auth0-angular";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { combineLatest, take } from "rxjs";
import { filter, map } from "rxjs/operators";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";

@Component({
    selector: 'app-confirm-email',
    imports: [MatButtonModule, MatProgressSpinner],
    templateUrl: './callback.component.html',
    styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {

    public themeService = inject(CustomizerSettingsService);
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly auth = inject(AuthService);

    readonly isBrowser = isPlatformBrowser(this.platformId);
    readonly isLoading = signal(true);

    ngOnInit() {
        if (!this.isBrowser) return;

        combineLatest([this.auth.isLoading$, this.auth.isAuthenticated$])
            .pipe(
                filter(([loading]) => !loading),
                take(1),
                map(([, isAuth]) => isAuth)
            )
            .subscribe({
                next: (isAuth) => {
                    if (!isAuth) {
                        this.isLoading.set(false);
                        this.router.navigateByUrl('/auth').then(r => console.log('Navigate to auth'));
                        return;
                    }

                    setTimeout(() => {
                        this.isLoading.set(false);

                        this.auth.appState$
                            .pipe(take(1))
                            .subscribe((state: any) => {
                                const target = state?.target ?? '/dashboard';
                                this.router.navigateByUrl(target).then(r => console.log(`Navigate to ${target}`),
                                    () => console.error(`Failed to navigate to ${target}`));
                            });

                    }, 1000);
                },

                error: () => {
                    this.isLoading.set(false);
                    this.router.navigateByUrl('/auth').then(r => console.log('Navigate to auth'));
                }
            });
    }
}