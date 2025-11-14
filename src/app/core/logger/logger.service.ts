import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class LoggerService {
  private readonly isProd = environment.production;

  log(message?: unknown, ...optional: unknown[]): void {
    if (!this.isProd) {
      console.log(message, ...optional);
    }
  }

  warn(message?: unknown, ...optional: unknown[]): void {
    if (!this.isProd) {
      console.warn(message, ...optional);
    }
  }

  error(message?: unknown, ...optional: unknown[]): void {
    console.error(message, ...optional);
  }

  debug(message?: unknown, ...optional: unknown[]): void {
    if (!this.isProd) {
      console.debug(message, ...optional);
    }
  }
}
