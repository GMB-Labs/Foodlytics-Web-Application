import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
} from "@angular/core";
import { AlertService } from "../../../../core/services/alert.service";
import { AlertComponent } from "../alert/alert.component";

@Component({
  selector: "app-alert-container",
  standalone: true,
  template: `
    <div class="alert-container" [class.has-alerts]="alertService.hasAlerts()">
      @for (alert of alertService.alerts(); track alert.id) {
        <app-alert
          [alert]="alert"
          [showIcon]="true"
          (dismissed)="onDismiss($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .alert-container {
        position: fixed;
        top: 20px;
        right: 25px;
        z-index: 9999;
        max-width: 400px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;

        &.has-alerts {
          pointer-events: auto;
        }

        app-alert {
          pointer-events: auto;
          animation: slideInRight 0.3s ease-out;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Responsive */
      @media only screen and (max-width: 767px) {
        .alert-container {
          right: 15px;
          left: 15px;
          max-width: none;
        }
      }
    `,
  ],
  imports: [AlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertContainerComponent {
  readonly alertService = inject(AlertService);

  onDismiss(id: string): void {
    this.alertService.dismiss(id);
  }
}
