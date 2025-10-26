import {Location, NgClass} from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import {Component, HostListener, inject} from '@angular/core';
import { ToggleService } from '../sidebar/toggle.service';
import { MatButtonModule } from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import { CustomizerSettingsService } from '../../core/customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-header',
    imports: [NgClass, MatMenuModule, MatButtonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {

    private router = inject(Router);
    private location = inject(Location);

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService
    ) {
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Navbar Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll')
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigate(['/dashboard']).then(r => console.log('Navigate to dashboard'));
        }
    }
}