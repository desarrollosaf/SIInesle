import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/environment';

export type TipoCatalogo =
  | 'legisladores'
  | 'partidos'
  | 'temas'
  | 'legislaturas'
  | 'comisiones'
  | 'estatus';

export interface CatalogoItem {
  id: number;
  nombre: string;
  status: number;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly apiUrl = `${enviroment.endpoint}api/catalogos`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodos(tipo: TipoCatalogo) {
    return this.http.get<CatalogoItem[]>(`${this.apiUrl}/${tipo}`, { withCredentials: true });
  }

  obtenerPorId(tipo: TipoCatalogo, id: number) {
    return this.http.get<CatalogoItem>(`${this.apiUrl}/${tipo}/${id}`, { withCredentials: true });
  }

  crear(tipo: TipoCatalogo, nombre: string) {
    return this.http.post<CatalogoItem>(`${this.apiUrl}/${tipo}`, { nombre }, { withCredentials: true });
  }

  actualizar(tipo: TipoCatalogo, id: number, data: { nombre?: string; status?: number }) {
    return this.http.put<CatalogoItem>(`${this.apiUrl}/${tipo}/${id}`, data, { withCredentials: true });
  }

  eliminar(tipo: TipoCatalogo, id: number) {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${tipo}/${id}`, { withCredentials: true });
  }
}
