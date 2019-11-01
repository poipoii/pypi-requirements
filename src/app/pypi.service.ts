import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PypiService {
  constructor(private httpClient: HttpClient) { }

  get(packageName: string) {
    if (packageName && packageName.startsWith('#')) {
      return of(packageName);
    }
    return this.httpClient.get(`https://pypi.org/pypi/${packageName}/json`);
  }
}
