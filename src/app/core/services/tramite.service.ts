import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tramite, TramiteFormValue } from '../models/tramite.model';

@Injectable({ providedIn: 'root' })
export class TramiteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/tramites`;

  getAll(search?: string): Observable<Tramite[]> {
    let params = new HttpParams();
    if (search) params = params.set('q', search);
    return this.http.get<Tramite[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Tramite> {
    return this.http.get<Tramite>(`${this.baseUrl}/${id}`);
  }

  getByDni(dni: string): Observable<Tramite[]> {
    return this.http.get<Tramite[]>(this.baseUrl, {
      params: new HttpParams().set('applicantDni', dni),
    });
  }

  create(tramite: TramiteFormValue): Observable<Tramite> {
    return this.http.post<Tramite>(this.baseUrl, {
      ...tramite,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  updateStatus(id: number, status: string, notes?: string): Observable<Tramite> {
    return this.http.patch<Tramite>(`${this.baseUrl}/${id}`, {
      status,
      notes,
      updatedAt: new Date().toISOString(),
    });
  }
}
