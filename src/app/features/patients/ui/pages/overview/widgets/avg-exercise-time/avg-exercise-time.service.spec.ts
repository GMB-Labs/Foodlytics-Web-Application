import { TestBed } from "@angular/core/testing";

import { AvgExerciseTimeService } from "./avg-exercise-time.service";

describe("AvgExerciseTimeService", () => {
  let service: AvgExerciseTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvgExerciseTimeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
