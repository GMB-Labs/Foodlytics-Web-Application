import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { Patient } from "../../domain/models";

@Injectable({ providedIn: "root" })
export class PatientsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/profiles/patients`;

  getPatientsByNutritionist(nutritionistId: string): Observable<Patient[]> {
    const encodedId = encodeURIComponent(nutritionistId);
    return this.http.get<Patient[]>(`${this.apiUrl}/${encodedId}`);
  }
}
