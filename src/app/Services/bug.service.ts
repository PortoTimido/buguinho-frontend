import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { bugField } from '../Interfaces/bugField';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BugService {

  apiUrl = "http://localhost:8080/bugs"

  constructor(private http:HttpClient) { }

  getAll(): Observable<bugField[]> {
    return this.http.get<bugField[]>(this.apiUrl);
  }

  selectById(bugs: bugField): Observable<bugField> {
    return this.http.get<bugField>(`${this.apiUrl}/${bugs.id}`);
  }

  save(bugs: bugField): Observable<bugField>{
    return this.http.post<bugField>(this.apiUrl, bugs);
  }

  delete(bugs:bugField): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${bugs.id}`)
  }

  update(bugs:bugField): Observable<bugField>{
    return this.http.patch<bugField>(`${this.apiUrl}/${bugs.id}`, bugs)
  }
}
