import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { WindowComponent, ModalDraggingDirective, WindowService, DomService } from './window';

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
      WindowComponent
    ],
    declarations: [
      WindowComponent,
      ModalDraggingDirective
    ],
  providers: [
    WindowService,
    DomService
  ]
})
export class SharedModule { }
