import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/environment';

export interface Comparativa {
  id: number;
  iniciativa_id: number;
  pais: string;
  estado_region: string | null;
  anio: number;
  nombre_ley: string;
  tema: string | null;
  resumen: string | null;
  impacto: string | null;
  que_funciono: string | null;
  que_no_funciono: string | null;
  relevancia_edomex: string | null;
  created_at: string;
  updated_at: string;
  iniciativa?: { id: number; numero: string; titulo: string };
}

export interface ComparativaPayload {
  iniciativa_id: number;
  pais: string;
  estado_region?: string | null;
  anio: number;
  nombre_ley: string;
  tema?: string | null;
  resumen?: string | null;
  impacto?: string | null;
  que_funciono?: string | null;
  que_no_funciono?: string | null;
  relevancia_edomex?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ComparativasService {
  private readonly apiUrl = `${enviroment.endpoint}api/comparativas`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodas() {
    return this.http.get<Comparativa[]>(this.apiUrl, { withCredentials: true });
  }

  crear(data: ComparativaPayload) {
    return this.http.post<Comparativa>(this.apiUrl, data, { withCredentials: true });
  }

  actualizar(id: number, data: Partial<ComparativaPayload>) {
    return this.http.put<Comparativa>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
