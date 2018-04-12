import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasemapComponent, BasemapService, BasemapSourceDataComponent } from './basemap/index';
import { SharedModule } from 'app/shared/index';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    BasemapComponent
  ],
  entryComponents: [BasemapComponent],
  declarations: [BasemapComponent, BasemapSourceDataComponent],
  providers: [BasemapService]
})
export class ControlsModule { }
