import { Component } from '@angular/core';
import { PypiService } from './pypi.service';
import { ClipboardService } from 'ngx-clipboard'
import { MatSnackBar } from '@angular/material';
import { forkJoin } from 'rxjs';
import { environment as env } from 'src/environments/environment';

import 'brace/index';
import 'brace/theme/chaos';
import 'brace/mode/python';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = `pypi-requirements ${ env.version }`;
  direction = 'horizontal';

  theme = 'chaos';
  mode = 'python';
  inputPackages = '';
  outputPackages = '';
  options: any = { maxLines: 1000, printMargin: false };

  packages = [];

  constructor(
    private clipboardService: ClipboardService,
    private pypiService: PypiService,
    private snackBar: MatSnackBar,
  ) {
    if (!env.production) {
      this.inputPackages = `Django==1.11.15\ndjango-allauth==0.38.0`;
    }
  }

  checkInputPackages() {
    this.onChange(this.inputPackages);
  }

  onChange(packages) {
    const input = (packages || '').trim();
    if (input) {
      this.updateOutputPackages(input);
    } else {
      this.outputPackages = '';
    }
  }

  updateOutputPackages(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line && line.trim());
    const packages = lines.map(line => {
      const info = line && line.indexOf('==') > 0 ? line.split('==') : [line, ''];
      return {
        name: info[0],
        version: info[1],
      };
    });
    forkJoin(packages.map(pypiPackage => this.pypiService.get(pypiPackage[`name`]))).subscribe(
      latestPackages => {
        this.packages = latestPackages;
        this.outputPackages = latestPackages.map((latestPackage: any) => {
          if (typeof(latestPackage) === 'string' && latestPackage.startsWith('#')) {
            return latestPackage;
          }
          return `${latestPackage.info.name}==${latestPackage.info.version}`;
        }).join('\n');
      },
      error => {
        console.error(error);
        this.snackBar.open(`Something bad happened; please try again later.`, 'OK', {
          duration: 10000,
        });
      }
    );
  }

  copyOutputPackages() {
    this.clipboardService.copyFromContent(this.outputPackages);
    this.snackBar.open('Copied!', 'OK', {
      duration: 2000,
    });
  }
}
