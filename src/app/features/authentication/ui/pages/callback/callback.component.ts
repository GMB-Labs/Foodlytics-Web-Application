import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {AuthService} from "@auth0/auth0-angular";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";
import {combineLatest, switchMap, take} from "rxjs";
import {filter, map} from "rxjs/operators";

@Component({
    selector: 'app-confirm-email',
    imports: [MatButtonModule, MatProgressSpinner],
    templateUrl: './callback.component.html',
    styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {

    public themeService = inject(CustomizerSettingsService);
    private auth? = inject(AuthService);
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);

    readonly isLoading = signal(true)
    readonly isBrowser = isPlatformBrowser(this.platformId);

    ngOnInit() {
        if (!this.isBrowser) return;
        this.auth = inject(AuthService);

        combineLatest([this.auth.isLoading$, this.auth.isAuthenticated$])
            .pipe(
                filter(([loading]) => !loading),
                take(1),
                map(([, isAuth]) => isAuth)
            )
            .subscribe({
                next: (isAuth) => {
                    this.isLoading.set(false);
                    if (isAuth) {
                        this.auth!.appState$
                            .pipe(take(1))
                            .subscribe((state: any) => {
                                const target = state?.target ?? '/dashboard';
                                this.router.navigateByUrl(target).then(r => console.log('Navigate to dashboard') );
                            });
                    } else {
                        this.router.navigateByUrl('/auth').then(r => console.log('Navigate to auth') );
                    }
                },
                error: () => {
                    this.isLoading.set(false);
                    this.router.navigateByUrl('/auth').then(r => console.log('Navigate to auth') );
                },
            });
    }
}
