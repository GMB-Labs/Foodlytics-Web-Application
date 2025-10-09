import { Component, signal } from '@angular/core';
import { ToggleService } from './common/sidebar/toggle.service';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { CommonModule, NgClass, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { CustomizerSettingsService } from './core/customizer-settings/customizer-settings.service';
import { CustomizerSettingsComponent } from './core/customizer-settings/customizer-settings.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {}