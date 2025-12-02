import {
  Component,
  input,
  ChangeDetectionStrategy,
} from "@angular/core";
import { AlertType } from "../../../../core/services/alert.service";

@Component({
  selector: "app-inline-alert",
  standalone: true,
  template: `
    <div [class]="alertClass()" role="alert">
      <div class="alert-content">
        @if (showIcon()) {
          <i class="material-symbols-outlined alert-icon">{{
            iconName()
          }}</i>
        }
        <span class="alert-message">
          <ng-content />
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      [role="alert"] {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .alert-content {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        flex: 1;
      }

      .alert-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .alert-message {
        flex: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineAlertComponent {
  type = input.required<AlertType>();
  showIcon = input<boolean>(true);

  alertClass(): string {
    const baseClass = "alert";
    const typeClass = `alert-${this.type()}`;
    return `${baseClass} ${typeClass}`;
  }

  iconName(): string {
    const typeIconMap: Record<AlertType, string> = {
      success: "check_circle",
      danger: "error",
      warning: "warning",
      info: "info",
      primary: "info",
      secondary: "info",
      daxa: "info",
    };
    return typeIconMap[this.type()] || "info";
  }
}
