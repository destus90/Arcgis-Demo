import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasemapComponent, BasemapService, BasemapSourceDataComponent } from './basemap/index';
import { SharedModule } from '@app/shared';
import { LegendComponent } from './legend';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    BasemapComponent,
    LegendComponent
  ],
  declarations: [BasemapComponent, BasemapSourceDataComponent, LegendComponent],
  providers: [BasemapService]
})
export class ControlsModule { }
