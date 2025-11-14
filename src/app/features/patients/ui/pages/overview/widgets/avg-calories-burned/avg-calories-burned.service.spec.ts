import { TestBed } from "@angular/core/testing";

import { AvgCaloriesBurnedService } from "./avg-calories-burned.service";

describe("AvgCaloriesBurnedService", () => {
  let service: AvgCaloriesBurnedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvgCaloriesBurnedService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
