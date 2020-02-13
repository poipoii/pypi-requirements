import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PypiService {
  constructor(private httpClient: HttpClient) { }

  static isIgnoreLine(line: string) {
    return typeof(line) === 'string' && (line.startsWith('#') || line.startsWith('-e'));
  }

  get(packageName: string) {
    if (PypiService.isIgnoreLine(packageName)) {
      return of(packageName);
    }
    return this.httpClient.get(`https://pypi.org/pypi/${packageName}/json`);
  }
}
