import {afterNextRender, Component, DestroyRef, ElementRef, inject, NgZone, signal, viewChild} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import { WelcomeService } from './welcome.service';
import {CustomizerSettingsService} from "../../../../../../../core/customizer-settings/customizer-settings.service";

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
    protected chartEl = viewChild<ElementRef<HTMLDivElement>>('chartEl');

    constructor() {
        afterNextRender(async () => {
            const el = this.chartEl()?.nativeElement;
            if (el) {
                await this.welcomeService.renderRadial(el,69);
            }
        });
        let id: number | undefined;
        if (typeof window !== 'undefined') {
            id = window.setInterval(() => {
                this.currentDate.set(new Date());
            }, 1000);
        }
        this.destroyRef.onDestroy(() => {
            if (id) {
                clearInterval(id);
                const el = this.chartEl()?.nativeElement;
                if (el) this.welcomeService.destroy(el);
            }

        })
    }
}