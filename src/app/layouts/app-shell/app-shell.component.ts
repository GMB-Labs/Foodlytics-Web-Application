import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {SidebarComponent} from "../../common/sidebar/sidebar.component";
import {HeaderComponent} from "../../common/header/header.component";
import {Event, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {FooterComponent} from "../../common/footer/footer.component";
import {CustomizerSettingsComponent} from "../../customizer-settings/customizer-settings.component";
import {ToggleService} from "../../common/sidebar/toggle.service";
import {NgClass, ViewportScroller} from "@angular/common";
import {CustomizerSettingsService} from "../../customizer-settings/customizer-settings.service";

@Component({
    selector: 'app-app-shell',
    template: `
        <div
                [class.card-borderd-theme]="themeService.isCardBorder()"
                [class.card-border-radius]="themeService.isCardBorderRadius()"
                [class.rtl-enabled]="themeService.isRTLEnabled()"
        >

            <!-- Sidebar -->
            <app-sidebar />

            <!-- Main Content -->
            <div
                    class="main-content transition d-flex flex-column"
                    [ngClass]="{'active': isSidebarToggled}"
                    [class.right-sidebar]="themeService.isRightSidebar()"
                    [class.hide-sidebar]="themeService.isHideSidebar()"
            >
                <app-header />
                <router-outlet />
                <div class="flex-grow-1"></div>
                <app-footer />
            </div>

            <!-- Customizer Settings -->
            <app-customizer-settings />

        </div>
    `,
    styleUrl: './app-shell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        SidebarComponent,
        HeaderComponent,
        RouterOutlet,
        FooterComponent,
        CustomizerSettingsComponent,
        NgClass
    ],
    host: {class: 'block'}
})
export class AppShellComponent {
    protected readonly title = signal('Daxa - Angular 20 Material Design Admin Dashboard Template');

    // isSidebarToggled
    isSidebarToggled = false;

    private previousUrl: string | null = null;

    constructor(
        public router: Router,
        private toggleService: ToggleService,
        private viewportScroller: ViewportScroller,
        public themeService: CustomizerSettingsService
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                const currentUrl = event.urlAfterRedirects;
                // Scroll to top ONLY if navigating to a different route (not on refresh)
                if (this.previousUrl && this.previousUrl !== currentUrl) {
                    this.viewportScroller.scrollToPosition([0, 0]);
                }
                this.previousUrl = currentUrl;
            }
        });
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
    }
}