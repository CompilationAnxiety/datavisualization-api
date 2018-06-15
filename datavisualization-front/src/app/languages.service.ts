import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { WorldEvent } from './models/WorldEvent';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class LanguagesService {

  constructor(private http: HttpClient) { }

  baseUrl: string = environment.apiUrl;

  languagesData() {
    return this.http.get<any>( this.baseUrl + 'languages/get_languages_data/?type=json');
  }

  saveEvents(events: WorldEvent[]): Observable<WorldEvent[]>  {
    console.log('events: ', JSON.stringify(events));
    return this.http.post<any>(this.baseUrl + 'events/send_events/', JSON.stringify(events), httpOptions);
  }

  getEvents(): Observable<WorldEvent[]> {
    return this.http.get<any>(this.baseUrl + 'events/');
  }
}
