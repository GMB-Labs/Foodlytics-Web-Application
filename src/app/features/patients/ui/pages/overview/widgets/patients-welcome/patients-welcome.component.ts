import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { DatePipe } from "@angular/common";
import { WelcomeService } from "../../../../../data-access/services/patient-stats.service";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "patients-welcome",
  imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    DatePipe,
  ],
  templateUrl: "./patients-welcome.component.html",
  styleUrl: "./patients-welcome.component.scss",
  providers: [DatePipe],
})
export class PatientsWelcomeComponent {
  currentDate = signal(new Date());

  private readonly fallbackAvatar = "assets/images/users/user1.webp";
  public themeService = inject(CustomizerSettingsService);
  private welcomeService = inject(WelcomeService);
  private readonly patientDetailStore = inject(PatientDetailStore);
  private destroyRef = inject(DestroyRef);
  protected chartEl = viewChild<ElementRef<HTMLDivElement>>("chartEl");

  protected readonly headerInfo = computed(() =>
    this.patientDetailStore.viewModel(),
  );
  protected readonly photoSrc = computed(
    () => this.patientDetailStore.photoUrl() ?? this.fallbackAvatar,
  );

  constructor() {
    afterNextRender(async () => {
      const el = this.chartEl()?.nativeElement;
      if (el) {
        await this.welcomeService.renderRadial(el, 69);
      }
    });
    let id: number | undefined;
    if (typeof window !== "undefined") {
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
    });
  }
}
