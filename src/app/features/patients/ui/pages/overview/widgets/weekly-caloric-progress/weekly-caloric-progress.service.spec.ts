import { TestBed } from "@angular/core/testing";

import { WeeklyCaloricProgressService } from "./weekly-caloric-progress.service";

describe("WeeklyCaloricProgressService", () => {
  let service: WeeklyCaloricProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyCaloricProgressService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
