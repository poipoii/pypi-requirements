import { Component } from '@angular/core';
import { PypiService } from './pypi.service';

import 'brace/index';
import 'brace/theme/chaos';
import 'brace/mode/python';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = `pypi-requirements ${ environment.version }`;
  direction = 'horizontal';

  theme = 'chaos';
  mode = 'python';
  inputPackages = '';
  outputPackages = '';
  options: any = { maxLines: 1000, printMargin: false };

  packages = [];

  constructor(private pypiService: PypiService) {
    if (!environment.production) {
      this.inputPackages = `Django==1.11.15\ndjango-allauth==0.38.0`;
    }
  }

  checkInputPackages() {
    this.onChange(this.inputPackages);
  }

  onChange(packages) {
    console.log('check', packages);
    const input = (packages || '').trim();
    if (input) {
      this.updateOutputPackages(input);
    } else {
      this.outputPackages = '';
    }
  }

  updateOutputPackages(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.indexOf('==') > 0);
    const packages = lines.map(line => {
      const info = line.split('==');
      return {
        name: info[0],
        version: info[1],
      };
    });
    console.log(packages);
    forkJoin(packages.map(pypiPackage => this.pypiService.get(pypiPackage[`name`]))).subscribe(
      latestPackages => {
        this.packages = latestPackages;
        this.outputPackages = latestPackages.map((latestPackage: any) =>
          `${latestPackage.info.name}==${latestPackage.info.version}`).join('\n');
      }
    );
  }
}
