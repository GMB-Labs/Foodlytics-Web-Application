import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: "app-invite-code-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: "./invite-code-dialog.component.html",
  styleUrl: "./invite-code-dialog.component.scss",
})
export class InviteCodeDialogComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<InviteCodeDialogComponent>);
  private readonly data = inject<{ code: string }>(MAT_DIALOG_DATA);

  protected readonly code = this.data.code;

  async copyCode(): Promise<void> {
    if (!this.hasClipboardSupport()) {
      this.snackBar.open("Clipboard access is not available.", "Close", {
        duration: 3000,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(this.code);
      this.snackBar.open("Invitation code copied.", "Close", {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open("Unable to copy the code. Please try again.", "Close", {
        duration: 4000,
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private hasClipboardSupport(): boolean {
    return typeof navigator !== "undefined" && !!navigator.clipboard;
  }
}

