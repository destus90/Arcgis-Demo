import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      closeButton: true,
      positionClass: 'toast-bottom-right',
    }),
    CoreModule,
    SharedModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'ru' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
