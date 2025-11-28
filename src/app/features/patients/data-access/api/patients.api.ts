import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { Patient } from "../../domain/models";

export interface PatientCalorieTargets {
  patient_id: string;
  calories: number | null;
  protein_grams: number | null;
  carb_grams: number | null;
  fat_grams: number | null;
  bmi: number | null;
  updated_at: string | null;
}

export interface DailyMacroBreakdown {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
}

export type DailySummaryStatus =
  | "under_target"
  | "on_target"
  | "over_target"
  | string;

export interface PatientDailySummary {
  day: string;
  patient_id: string;
  target: DailyMacroBreakdown;
  consumed: DailyMacroBreakdown;
  difference: DailyMacroBreakdown;
  status: DailySummaryStatus | null;
  activity_burned: number | null;
  net_calories: number | null;
}

@Injectable({ providedIn: "root" })
export class PatientsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/profiles/patients`;
  private readonly calorieTargetsUrl = `${environment.apiUrl}/api/v1/calorie-targets`;

  getPatientsByNutritionist(nutritionistId: string): Observable<Patient[]> {
    const encodedId = encodeURIComponent(nutritionistId);
    return this.http.get<Patient[]>(`${this.apiUrl}/${encodedId}`);
  }

  getCalorieTargets(patientId: string): Observable<PatientCalorieTargets> {
    const encodedId = encodeURIComponent(patientId);
    return this.http.get<PatientCalorieTargets>(
      `${this.calorieTargetsUrl}/${encodedId}`,
    );
  }

  getDailyCalorieSummary(
    patientId: string,
    day: string,
  ): Observable<PatientDailySummary> {
    const encodedId = encodeURIComponent(patientId);
    return this.http.get<PatientDailySummary>(
      `${this.calorieTargetsUrl}/${encodedId}/daily-summary`,
      { params: { day } },
    );
  }
}
