import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';

import {
  MatButtonModule,
  MatIconModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from '@angular/material';
import { AceEditorModule } from 'ng2-ace-editor';
import { ClipboardModule } from 'ngx-clipboard';

import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,

    AceEditorModule,
    ClipboardModule,

    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
