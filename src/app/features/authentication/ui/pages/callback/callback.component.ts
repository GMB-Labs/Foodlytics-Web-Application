import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {AuthService} from "@auth0/auth0-angular";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";
import {switchMap, take} from "rxjs";
import {filter} from "rxjs/operators";

@Component({
    selector: 'app-confirm-email',
    imports: [MatButtonModule, MatProgressSpinner],
    templateUrl: './callback.component.html',
    styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit{

    public themeService = inject(CustomizerSettingsService);
    private readonly auth = inject(AuthService, { optional: true });
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);

    readonly isLoading = signal(true)
    readonly isBrowser = isPlatformBrowser(this.platformId);

    ngOnInit() {
        if (!this.isBrowser || !this.auth) return;

        this.auth.isLoading$
            .pipe(
                filter((loading) => !loading),
                take(1),
                switchMap(() => this.auth!.isAuthenticated$.pipe(take(1)))
            )
            .subscribe({
                next: (logged) => {
                    this.isLoading.set(false);
                    this.router.navigateByUrl(logged ? '/dashboard' : '/auth').then(r => console.log('Navigate to dashboard'));
                },
                error: () => {
                    this.isLoading.set(false);
                    this.router.navigateByUrl('/auth').then(r => console.log('Navigate to auth'));
                },
            });

    }
}
