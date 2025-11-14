import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-auth-feature",
  template: ` <router-outlet /> `,
  imports: [RouterOutlet],
})
export class AuthenticationFeature {}
