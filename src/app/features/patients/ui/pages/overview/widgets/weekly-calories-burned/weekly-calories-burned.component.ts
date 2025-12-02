import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect,
  inject,
  computed,
} from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { WeeklyCaloriesBurnedService } from "./weekly-calories-burned.service";
import { UserStore } from "../../../../../../../core/user/user.store";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-weekly-calories-burned",
  imports: [MatCardModule, MatMenuModule, MatButtonModule],
  templateUrl: "./weekly-calories-burned.component.html",
  styleUrl: "./weekly-calories-burned.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyCaloriesBurnedComponent
  implements OnInit, AfterViewInit
{
  private readonly complaintsService = inject(WeeklyCaloriesBurnedService);
  private readonly userStore = inject(UserStore);
  readonly themeService = inject(CustomizerSettingsService);

  @ViewChild("chartContainer", { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  protected readonly userId = computed(() => this.userStore.userId());

  constructor() {
    effect(() => {
      const userId = this.userId();
      const isDark = this.themeService.isDarkSignal();
      if (this.chartContainer?.nativeElement) {
        this.complaintsService.loadChart(
          this.chartContainer.nativeElement,
          userId,
          isDark,
        );
      }
    });
  }

  ngOnInit(): void {
    // Effect will handle loading
  }

  ngAfterViewInit(): void {
    const userId = this.userId();
    const isDark = this.themeService.isDarkSignal();
    if (this.chartContainer?.nativeElement) {
      this.complaintsService.loadChart(
        this.chartContainer.nativeElement,
        userId,
        isDark,
      );
    }
  }
}
