import {afterNextRender, Component, DestroyRef, inject, signal} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import { WelcomeService } from './welcome.service';
import {CustomizerSettingsService} from "../../../../../../core/customizer-settings/customizer-settings.service";

@Component({
    selector: 'app-welcome',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, NgOptimizedImage, DatePipe],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.scss',
    providers: [DatePipe]
})
export class WelcomeComponent {

    currentDate = signal(new Date());

    public themeService = inject(CustomizerSettingsService);
    private welcomeService = inject(WelcomeService);
    private destroyRef = inject(DestroyRef);

    constructor() {
        afterNextRender(async () => {
            await this.welcomeService.loadChart()
        });
        const id = window.setInterval(() => {
            this.currentDate.set(new Date());
        }, 1000);

        this.destroyRef.onDestroy(() => clearInterval(id));

    }
}