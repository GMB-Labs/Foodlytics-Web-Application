import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { UserStore, UserProfile } from "../../../../../core/user/user.store";
import { AuthFacade } from "../../../../../core/auth/auth.facade";

@Component({
  selector: "app-profile-information",
  imports: [MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: "./profile-information.component.html",
  styleUrl: "./profile-information.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInformationComponent {
  private readonly userStore = inject(UserStore);
  private readonly authFacade = inject(AuthFacade);

  readonly userId = this.userStore.userId;

  readonly firstName = computed(() => this.extractValue("first_name"));
  readonly lastName = computed(() => this.extractValue("last_name"));
  readonly age = computed(() => this.extractValue("age"));
  readonly gender = computed(() => this.extractValue("gender"));
  readonly email = computed(() => this.authFacade.email() ?? "—");
  readonly role = computed(() => {
    const profileRole = this.extractValue("role");
    if (profileRole && profileRole !== "—") {
      return profileRole;
    }
    const roles = this.authFacade.roles();
    return roles[0] ?? "—";
  });

  private extractValue<K extends keyof UserProfile>(key: K): string {
    const profile = this.getProfileObject();
    if (!profile) {
      return "—";
    }
    const value = profile[key];
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    return String(value);
  }

  private getProfileObject(): UserProfile | null {
    const profile = this.userStore.profile();
    if (profile && typeof profile === "object") {
      return profile as UserProfile;
    }
    return null;
  }
}
