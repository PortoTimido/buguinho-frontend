import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { projetoField } from '../Interfaces/projectField';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  apiUrl = "http://localhost:8080/projetos";

  constructor(private http: HttpClient) { }

  getAll(): Observable<projetoField[]> {
    return this.http.get<projetoField[]>(this.apiUrl);
  }

  selectById(project: projetoField): Observable<projetoField> {
    return this.http.get<projetoField>(`${this.apiUrl}/${project.id}`);
  }

  save(project: projetoField): Observable<projetoField> {
    return this.http.post<projetoField>(this.apiUrl, project);
  }

  delete(project: projetoField): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${project.id}`);
  }

  update(project: projetoField): Observable<projetoField> {
    return this.http.put<projetoField>(`${this.apiUrl}/${project.id}`, project);
  }
}
