import { TestBed } from "@angular/core/testing";

import { WeeklyCaloriesBurnedService } from "./weekly-calories-burned.service";

describe("ComplaintsService", () => {
  let service: WeeklyCaloriesBurnedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyCaloriesBurnedService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
