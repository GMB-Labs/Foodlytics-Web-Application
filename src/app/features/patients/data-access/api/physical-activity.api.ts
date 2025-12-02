import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

export interface PhysicalActivityDay {
  day: string; // YYYY-MM-DD
  activity_count: number;
}

export interface PhysicalActivityRangeResponse {
  user_id: string;
  start_date: string;
  end_date: string;
  days: PhysicalActivityDay[];
}

export interface DailyStepsResponse {
  user_id: string;
  day: string;
  step_activity_count: number;
  calories_burned: number;
}

@Injectable({ providedIn: "root" })
export class PhysicalActivityApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/physical-activity`;

  getWeeklyActivity(
    userId: string,
    startDate: string,
    endDate: string,
  ): Observable<PhysicalActivityRangeResponse> {
    const encodedId = encodeURIComponent(userId);
    return this.http.get<PhysicalActivityRangeResponse>(
      `${this.apiUrl}/${encodedId}/range`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      },
    );
  }

  getDailySteps(
    userId: string,
    date: string,
  ): Observable<DailyStepsResponse> {
    const encodedId = encodeURIComponent(userId);
    return this.http.get<DailyStepsResponse>(
      `${this.apiUrl}/${encodedId}/steps`,
      {
        params: {
          date: date,
        },
      },
    );
  }
}

