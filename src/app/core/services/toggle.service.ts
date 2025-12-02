import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ToggleService {
  private readonly isSidebarToggledSig = signal<boolean>(false);
  
  readonly isSidebarToggled = this.isSidebarToggledSig.asReadonly();
  
  toggle(): void {
    this.isSidebarToggledSig.update((v) => !v);
  }
}
