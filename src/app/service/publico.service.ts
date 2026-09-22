import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/environment';

export interface IniciativaPublica {
  id: number;
  numero: string;
  fecha_presentacion: string;
  titulo: string;
  resumen: string | null;
  subtema: string | null;
  enlace: string | null;
  palabras_clave: string | null;
  problema: string | null;
  objetivo: string | null;
  beneficios: string | null;
  estatus: string | null;
  legislatura: string | null;
  legisladores: string[];
  partidos: string[];
  temas: string[];
  comisiones: string[];
}

@Injectable({ providedIn: 'root' })
export class PublicoService {
  private readonly apiUrl = `${enviroment.endpoint}api/publico`;

  constructor(private readonly http: HttpClient) {}

  obtenerIniciativas() {
    return this.http.get<IniciativaPublica[]>(`${this.apiUrl}/iniciativas`);
  }
}
