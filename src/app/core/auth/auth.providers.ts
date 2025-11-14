import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthHttpInterceptor, provideAuth0 } from "@auth0/auth0-angular";
import { AUTH0_CONFIG } from "./auth.config";

export function provideAuthWithRuntime() {
  return [
    provideAuth0(AUTH0_CONFIG),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
  ];
}
