import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/environment';

export interface RegistroAuditoria {
  id: number;
  usuario_rfc: string;
  usuario_nombre: string;
  accion: string;
  registro: string;
  resultado: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly apiUrl = `${enviroment.endpoint}api/auditoria`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodas() {
    return this.http.get<RegistroAuditoria[]>(this.apiUrl, { withCredentials: true });
  }
}
