import { Component, AfterContentInit, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material';
import { PypiService } from './pypi.service';
import { ClipboardService } from 'ngx-clipboard';
import { forkJoin } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import AceDiff from 'ace-diff/src/index';

import 'brace/index';
import 'brace/theme/chaos';
import 'brace/mode/python';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentInit {
  title = `pypi-requirements ${ env.version }`;

  theme = 'chaos';
  mode = 'python';
  inputPackages = '';
  outputPackages = '';

  packages = [];

  aceInstance;

  constructor(
    private clipboardService: ClipboardService,
    private pypiService: PypiService,
    private snackBar: MatSnackBar,
    private swUpdate: SwUpdate,
  ) {
    if (!env.production) {
      this.inputPackages = `Django==1.11.15\nDjango==2.2.7\ndjango-allauth==0.38.0`;
    }
  }

  ngOnInit() {
    this.swUpdate.available.subscribe(event => {
      console.log('[App] Update available: current version is', event.current, 'available version is', event.available);
      setTimeout(() => {
        this.snackBar.open('Newer version is available!', 'Refresh').onAction().subscribe(() => {
          window.location.reload();
        });
      }, 100);
    });
  }

  ngAfterContentInit() {
    // init
    this.aceInstance = new AceDiff({
      mode: `ace/mode/${this.mode}`,
      theme: `ace/theme/${this.theme}`,
      diffGranularity: 'specific',
      element: '.acediff',
      left: {
        content: this.inputPackages,
        editable: true,
        copyLinkEnabled: true
      },
      right: {
        content: this.outputPackages,
        editable: true,
        copyLinkEnabled: true
      },
    });
    // update font
    const fontOptions = {
      // fontFamily: 'tahoma',
      fontSize: '12pt'
    };
    this.aceInstance.getEditors().left.setOptions(fontOptions);
    this.aceInstance.getEditors().right.setOptions(fontOptions);
  }

  checkInputPackages() {
    this.inputPackages = this.aceInstance.getEditors().left.getValue();
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
        // update value
        this.aceInstance.getEditors().left.setValue(this.inputPackages);
        this.aceInstance.getEditors().right.setValue(this.outputPackages);
        // detect diff change
        this.aceInstance.diff();
        // clear selection
        this.aceInstance.getEditors().left.getSession().selection.clearSelection();
        this.aceInstance.getEditors().right.getSession().selection.clearSelection();
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
