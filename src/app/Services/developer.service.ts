import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { devField } from '../Interfaces/devField';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {

  apiUrl = "http://localhost:8080/desenvolvedores"

  constructor(private http:HttpClient) { }

  getAll(): Observable<devField[]> {
    return this.http.get<devField[]>(this.apiUrl);
  }

  selectById(developers: devField): Observable<devField> {
    return this.http.get<devField>(`${this.apiUrl}/${developers.id}`);
  }

  save(developers: devField): Observable<devField>{
    return this.http.post<devField>(this.apiUrl, developers);
  }

  delete(developers:devField): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${developers.id}`)
  }

  update(developers:devField): Observable<devField>{
    return this.http.put<devField>(`${this.apiUrl}/${developers.id}`, developers)
  }
}
