import { Injectable, signal, effect, inject, Injector } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CustomizerSettingsService {
  private readonly injector = inject(Injector);

  // Signals privados para cada flag
  private readonly isDarkThemeSig = signal<boolean>(false);
  private readonly isSidebarDarkThemeSig = signal<boolean>(false);
  private readonly isRightSidebarThemeSig = signal<boolean>(false);
  private readonly isHideSidebarThemeSig = signal<boolean>(false);
  private readonly isHeaderDarkThemeSig = signal<boolean>(false);
  private readonly isCardBorderThemeSig = signal<boolean>(false);
  private readonly isCardBorderRadiusThemeSig = signal<boolean>(false);
  private readonly isRTLEnabledThemeSig = signal<boolean>(false);
  private readonly isToggledSig = signal<boolean>(false);

  // Signals readonly públicos
  readonly isDarkSignal = this.isDarkThemeSig.asReadonly();
  readonly isSidebarDarkSignal = this.isSidebarDarkThemeSig.asReadonly();
  readonly isRightSidebarSignal = this.isRightSidebarThemeSig.asReadonly();
  readonly isHideSidebarSignal = this.isHideSidebarThemeSig.asReadonly();
  readonly isHeaderDarkSignal = this.isHeaderDarkThemeSig.asReadonly();
  readonly isCardBorderSignal = this.isCardBorderThemeSig.asReadonly();
  readonly isCardBorderRadiusSignal = this.isCardBorderRadiusThemeSig.asReadonly();
  readonly isRTLEnabledSignal = this.isRTLEnabledThemeSig.asReadonly();
  readonly isToggled = this.isToggledSig.asReadonly();

  constructor() {
    this.restoreFromStorage();

    // Effects para sincronizar con el DOM
    effect(
      () => {
        const isDark = this.isDarkThemeSig();
        if (typeof document === "undefined") return;
        if (isDark) {
          document.body.classList.add("dark-theme");
        } else {
          document.body.classList.remove("dark-theme");
        }
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const isRTL = this.isRTLEnabledThemeSig();
        if (typeof document === "undefined") return;
        if (isRTL) {
          document.body.classList.add("rtl-enabled");
        } else {
          document.body.classList.remove("rtl-enabled");
        }
      },
      { injector: this.injector },
    );
  }

  private restoreFromStorage(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    // Dark Mode
    const isDarkTheme = JSON.parse(
      localStorage.getItem("isDarkTheme") || "false",
    );
    this.isDarkThemeSig.set(isDarkTheme);

    // Sidebar Dark Mode
    const isSidebarDarkTheme = JSON.parse(
      localStorage.getItem("isSidebarDarkTheme") || "false",
    );
    this.isSidebarDarkThemeSig.set(isSidebarDarkTheme);

    // Right Sidebar
    const isRightSidebarTheme = JSON.parse(
      localStorage.getItem("isRightSidebarTheme") || "false",
    );
    this.isRightSidebarThemeSig.set(isRightSidebarTheme);

    // Hide Sidebar
    const isHideSidebarTheme = JSON.parse(
      localStorage.getItem("isHideSidebarTheme") || "false",
    );
    this.isHideSidebarThemeSig.set(isHideSidebarTheme);

    // Header Dark
    const isHeaderDarkTheme = JSON.parse(
      localStorage.getItem("isHeaderDarkTheme") || "false",
    );
    this.isHeaderDarkThemeSig.set(isHeaderDarkTheme);

    // Card Border
    const isCardBorderTheme = JSON.parse(
      localStorage.getItem("isCardBorderTheme") || "false",
    );
    this.isCardBorderThemeSig.set(isCardBorderTheme);

    // Card Border Radius
    const isCardBorderRadiusTheme = JSON.parse(
      localStorage.getItem("isCardBorderRadiusTheme") || "false",
    );
    this.isCardBorderRadiusThemeSig.set(isCardBorderRadiusTheme);

    // RTL Mode
    const isRTLEnabledTheme = JSON.parse(
      localStorage.getItem("isRTLEnabledTheme") || "false",
    );
    this.isRTLEnabledThemeSig.set(isRTLEnabledTheme);
  }

  // Dark Mode
  toggleTheme(): void {
    const newValue = !this.isDarkThemeSig();
    this.isDarkThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isDarkTheme", JSON.stringify(newValue));
    }
  }
  isDark(): boolean {
    return this.isDarkThemeSig();
  }

  // Sidebar Dark
  toggleSidebarTheme(): void {
    const newValue = !this.isSidebarDarkThemeSig();
    this.isSidebarDarkThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isSidebarDarkTheme", JSON.stringify(newValue));
    }
  }
  isSidebarDark(): boolean {
    return this.isSidebarDarkThemeSig();
  }

  // Right Sidebar
  toggleRightSidebarTheme(): void {
    const newValue = !this.isRightSidebarThemeSig();
    this.isRightSidebarThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isRightSidebarTheme", JSON.stringify(newValue));
    }
  }
  isRightSidebar(): boolean {
    return this.isRightSidebarThemeSig();
  }

  // Hide Sidebar
  toggleHideSidebarTheme(): void {
    const newValue = !this.isHideSidebarThemeSig();
    this.isHideSidebarThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isHideSidebarTheme", JSON.stringify(newValue));
    }
  }
  isHideSidebar(): boolean {
    return this.isHideSidebarThemeSig();
  }

  // Header Dark Mode
  toggleHeaderTheme(): void {
    const newValue = !this.isHeaderDarkThemeSig();
    this.isHeaderDarkThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isHeaderDarkTheme", JSON.stringify(newValue));
    }
  }
  isHeaderDark(): boolean {
    return this.isHeaderDarkThemeSig();
  }

  // Card Border
  toggleCardBorderTheme(): void {
    const newValue = !this.isCardBorderThemeSig();
    this.isCardBorderThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isCardBorderTheme", JSON.stringify(newValue));
    }
  }
  isCardBorder(): boolean {
    return this.isCardBorderThemeSig();
  }

  // Card Border Radius
  toggleCardBorderRadiusTheme(): void {
    const newValue = !this.isCardBorderRadiusThemeSig();
    this.isCardBorderRadiusThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isCardBorderRadiusTheme", JSON.stringify(newValue));
    }
  }
  isCardBorderRadius(): boolean {
    return this.isCardBorderRadiusThemeSig();
  }

  // RTL Mode
  toggleRTLEnabledTheme(): void {
    const newValue = !this.isRTLEnabledThemeSig();
    this.isRTLEnabledThemeSig.set(newValue);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("isRTLEnabledTheme", JSON.stringify(newValue));
    }
  }
  isRTLEnabled(): boolean {
    return this.isRTLEnabledThemeSig();
  }

  // isToggled (customizer panel)
  toggle(): void {
    this.isToggledSig.update((v) => !v);
  }
}
