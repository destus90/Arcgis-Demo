import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { MapComponent } from './map/map.component';
import { ArcgisService } from './arcgis.service';
import { MapService } from './map.service';
import { SourceService } from './source.service';
import { InterceptorsService } from './interceptors.service';
import { HeaderComponent } from './header/header.component';
import { ServicePrintComponent } from './service-print/service-print.component';
import { SharedModule } from '@app/shared';
import { ControlsModule } from './controls';

@NgModule({
    imports: [
      CommonModule,
      HttpClientModule,
      SharedModule,
      ControlsModule
    ],
    exports: [MapComponent, HeaderComponent],
    declarations: [
      MapComponent,
      HeaderComponent,
      ServicePrintComponent
    ],
    providers: [
      ArcgisService,
      MapService,
      SourceService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: InterceptorsService,
        multi: true
      }
    ]
})
export class CoreModule {

  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

}
