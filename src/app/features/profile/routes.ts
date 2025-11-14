import { Routes } from "@angular/router";

export const PROFILE_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./feature.component").then((m) => m.ProfileFeature),
    children: [
      {
        path: "",
        title: "Profile",
        data: { breadcrumb: "Profile" },
        loadComponent: () =>
          import("./ui/pages/my-profile.component").then(
            (m) => m.MyProfileComponent,
          ),
      },
    ],
  },
];
