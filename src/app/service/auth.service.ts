import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/environment';

export interface Usuario {
  id: number;
  rfc: string;
  name: string;
  email: string;
  foto: string | null;
  nombre_completo: string;
  puesto: string | null;
  rango: number | null;
  id_Dependencia: number | null;
  id_Direccion: number | null;
  id_Departamento: number | null;
  modulos: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${enviroment.endpoint}api/auth`;
  private readonly STORAGE_KEY = 'ini_usuario';

  usuario = signal<Usuario | null>(this.loadFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(rfc: string, password: string): Observable<{ ok: boolean; usuario: Usuario }> {
    return this.http
      .post<{ ok: boolean; usuario: Usuario }>(
        `${this.API}/login`,
        { rfc, password },
        { withCredentials: true },
      )
      .pipe(
        tap(({ usuario }) => {
          this.usuario.set(usuario);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
        }),
      );
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => {
        this.clearSession();
        this.usuario.set(null);
        this.router.navigate(['/login']);
      },
    });
  }

  verificarBfcache(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.router.navigate(['/login']);
    }
  }

  verificarSesion(): Observable<Usuario> {
    return this.http
      .get<Usuario>(`${this.API}/me`, { withCredentials: true })
      .pipe(
        tap((u) => {
          this.usuario.set(u);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(u));
        }),
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): Usuario | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
