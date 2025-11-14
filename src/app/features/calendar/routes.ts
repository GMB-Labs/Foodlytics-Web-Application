import { Routes } from "@angular/router";

export const CALENDAR_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./feature.component").then((m) => m.CalendarFeature),
    children: [
      {
        path: "",
        title: "Calendario",
        data: { breadcrumb: "Calendario" },
        loadComponent: () =>
          import("./ui/pages/calendar.component").then(
            (m) => m.CalendarComponent,
          ),
      },
    ],
  },
];
