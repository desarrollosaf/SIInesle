import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/environment';
import { CatalogoItem } from './catalogos.service';

export type NivelViabilidad = 'Alta' | 'Media' | 'Baja';

export interface Iniciativa {
  id: number;
  numero: string;
  fecha_presentacion: string;
  legislatura_id: number | null;
  titulo: string;
  subtema: string | null;
  resumen: string | null;
  estatus_id: number | null;
  enlace: string | null;
  palabras_clave: string | null;
  nivel_viabilidad_tecnica: NivelViabilidad | null;
  nivel_viabilidad_juridica: NivelViabilidad | null;
  problema: string | null;
  objetivo: string | null;
  resumen_general: string | null;
  beneficios: string | null;
  riesgos: string | null;
  justificacion_tecnica: string | null;
  justificacion_juridica: string | null;
  que_funcionaria: string | null;
  que_podria_fracasar: string | null;
  recomendacion: string | null;
  legislatura?: CatalogoItem | null;
  estatus?: CatalogoItem | null;
  legisladores?: CatalogoItem[];
  partidos?: CatalogoItem[];
  temas?: CatalogoItem[];
  comisiones?: CatalogoItem[];
  created_at: string;
  updated_at: string;
}

export interface IniciativaPayload {
  numero: string;
  fecha_presentacion: string;
  legislatura_id?: number | null;
  titulo: string;
  subtema?: string | null;
  resumen?: string | null;
  estatus_id?: number | null;
  enlace?: string | null;
  palabras_clave?: string | null;
  nivel_viabilidad_tecnica?: NivelViabilidad | null;
  nivel_viabilidad_juridica?: NivelViabilidad | null;
  problema?: string | null;
  objetivo?: string | null;
  resumen_general?: string | null;
  beneficios?: string | null;
  riesgos?: string | null;
  justificacion_tecnica?: string | null;
  justificacion_juridica?: string | null;
  que_funcionaria?: string | null;
  que_podria_fracasar?: string | null;
  recomendacion?: string | null;
  legislador_ids?: number[];
  partido_ids?: number[];
  tema_ids?: number[];
  comision_ids?: number[];
}

export interface EstadisticasIniciativas {
  total: number;
  enEstudio: number;
  aprobadas: number;
  pendientesAnalisis: number;
  porEstatus: { estatus: string; total: number }[];
}

export interface ImportarIniciativaFila {
  numero: string;
  fecha_presentacion: string;
  titulo: string;
  promotores: string[];
  partidos: string[];
  temas: string[];
  comisiones: string[];
  legislatura?: string;
  subtema?: string;
  resumen?: string;
  estatus?: string;
  enlace?: string;
  palabras_clave?: string;
  problema?: string;
  objetivo?: string;
  resumen_general?: string;
  beneficios?: string;
  riesgos?: string;
  nivel_viabilidad_tecnica?: string;
  nivel_viabilidad_juridica?: string;
  que_funcionaria?: string;
  que_podria_fracasar?: string;
  recomendacion?: string;
}

export interface ImportarIniciativasPayload {
  filas: ImportarIniciativaFila[];
  agregarCatalogos?: boolean;
  siExiste?: 'omitir' | 'actualizar';
  nombreArchivo?: string;
}

export interface ImportarIniciativasResultado {
  total: number;
  creadas: number;
  actualizadas: number;
  omitidas: number;
  catalogosCreados: Record<string, string[]>;
  errores: { fila: number; numero: string; motivo: string }[];
}

@Injectable({ providedIn: 'root' })
export class IniciativasService {
  private readonly apiUrl = `${enviroment.endpoint}api/iniciativas`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodas(filtros?: Record<string, string>) {
    return this.http.get<Iniciativa[]>(this.apiUrl, { params: filtros, withCredentials: true });
  }

  obtenerPorId(id: number) {
    return this.http.get<Iniciativa>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  obtenerPendientes() {
    return this.http.get<Iniciativa[]>(`${this.apiUrl}/pendientes`, { withCredentials: true });
  }

  obtenerEstadisticas() {
    return this.http.get<EstadisticasIniciativas>(`${this.apiUrl}/estadisticas`, { withCredentials: true });
  }

  crear(data: IniciativaPayload) {
    return this.http.post<Iniciativa>(this.apiUrl, data, { withCredentials: true });
  }

  actualizar(id: number, data: Partial<IniciativaPayload>) {
    return this.http.put<Iniciativa>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  importar(data: ImportarIniciativasPayload) {
    return this.http.post<ImportarIniciativasResultado>(`${this.apiUrl}/importar`, data, { withCredentials: true });
  }
}
