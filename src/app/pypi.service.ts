import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PypiService {
  constructor(private httpClient: HttpClient) { }

  get(packageName: string) {
    return this.httpClient.get(`https://pypi.org/pypi/${packageName}/json`);
  }
}
