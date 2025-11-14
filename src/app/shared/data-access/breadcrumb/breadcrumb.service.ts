// shared/data-access/breadcrumb.service.ts
import { Injectable, computed, signal } from "@angular/core";

export interface Crumb {
  label: string;
  link?: any[];
}

@Injectable({ providedIn: "root" })
export class BreadcrumbService {
  private _trail = signal<Crumb[]>([]);
  readonly trail = this._trail.asReadonly();
  readonly title = computed(() => {
    const t = this._trail();
    return t.length ? t[t.length - 1].label : "";
  });

  set(trail: Crumb[]) {
    this._trail.set(trail);
  }
  push(crumb: Crumb) {
    this._trail.update((t) => [...t, crumb]);
  }
  replaceLast(label: string) {
    this._trail.update((t) =>
      t.length ? [...t.slice(0, -1), { ...t[t.length - 1], label }] : t,
    );
  }
  clear() {
    this._trail.set([]);
  }
}
