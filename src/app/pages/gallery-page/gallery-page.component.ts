import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-gallery-page',
    imports: [MatCardModule, MatButtonModule, NgOptimizedImage],
    templateUrl: './gallery-page.component.html',
    styleUrl: './gallery-page.component.scss'
})
export class GalleryPageComponent {}