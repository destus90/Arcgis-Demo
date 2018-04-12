import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { WindowComponent, ModalDraggingDirective, WindowService, DomService } from './window';
import { LayerLegendComponent } from './layer-legend/layer-legend.component';

@NgModule({
    imports: [
      CommonModule,
      HttpClientModule,
      ReactiveFormsModule,
      FormsModule
    ],
    entryComponents: [
      WindowComponent
    ],
    exports: [
      CommonModule,
      HttpClientModule,
      ReactiveFormsModule,
      FormsModule,
      LayerLegendComponent,
      WindowComponent
    ],
    declarations: [
      WindowComponent,
      ModalDraggingDirective,
      LayerLegendComponent
    ],
  providers: [
    WindowService,
    DomService
  ]
})
export class SharedModule { }
