import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

export interface CalorieTargetsResponse {
  patient_id: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  bmi: number;
  updated_at: string;
}

@Injectable({ providedIn: "root" })
export class CalorieTargetsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/calorie-targets`;

  getCalorieTargets(patientId: string): Observable<CalorieTargetsResponse> {
    const encodedId = encodeURIComponent(patientId);
    return this.http.get<CalorieTargetsResponse>(`${this.apiUrl}/${encodedId}`);
  }
}

