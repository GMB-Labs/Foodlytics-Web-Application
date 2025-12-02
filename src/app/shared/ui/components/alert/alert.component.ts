import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from "@angular/core";
import { Alert, AlertType } from "../../../../core/services/alert.service";

@Component({
  selector: "app-alert",
  standalone: true,
  template: `
    <div
      [class]="alertClass()"
      role="alert"
      [attr.data-alert-id]="alert().id"
    >
      <div class="alert-content">
        @if (showIcon()) {
          <i class="material-symbols-outlined alert-icon">{{
            iconName()
          }}</i>
        }
        <span class="alert-message">{{ alert().message }}</span>
      </div>
      @if (alert().options.dismissible) {
        <button
          type="button"
          class="close"
          (click)="onDismiss()"
          aria-label="Cerrar alerta"
        >
          <i class="material-symbols-outlined">close</i>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      [role="alert"] {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .alert-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
      }

      .alert-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .alert-message {
        flex: 1;
      }

      .close {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: opacity 0.2s;
        flex-shrink: 0;
        color: inherit;

        &:hover {
          opacity: 1;
        }

        i {
          font-size: 18px;
        }
      }

      .component-dark-theme {
        .alert {
          &:not(.alert-secondary, .alert-light) {
            .close {
              color: var(--whiteColor);
            }
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  alert = input.required<Alert>();
  showIcon = input<boolean>(true);

  dismissed = output<string>();

  alertClass(): string {
    const type = this.alert().type;
    const baseClass = "alert";
    const typeClass = `alert-${type}`;
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
    return typeIconMap[this.alert().type] || "info";
  }

  onDismiss(): void {
    this.dismissed.emit(this.alert().id);
  }
}
