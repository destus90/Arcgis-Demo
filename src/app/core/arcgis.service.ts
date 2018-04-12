import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as esri from 'esri-leaflet';
import { Observable } from 'rxjs/Observable';
import { tap, finalize, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { Service } from './models';

@Injectable()
export class ArcgisService {

  constructor(
    private http: HttpClient
  ) {}

  setLegend(service: Service): Observable<any> {
    service.legendLoading = true;

    const onLegendLoadedSuccess = (legend: any) => {
      service.setLegendRecursive(legend.layers);
      service.legendLoaded = true;
      return legend;
    };

    const onLegendLoadedFail = e => {
      service.legendLoaded = false;
      return ErrorObservable.create(new Error(`Ошибка загрузки легенды для сервиса ${service.name}`));
    };

    return this.http.get(`${service.source.url}/${service.getNameWithoutFolder()}/${service.type}/legend`, {
      params: new HttpParams().set('f', 'pjson')
    })
      .pipe(
        tap(onLegendLoadedSuccess),
        finalize(() => service.legendLoading = false),
        catchError(onLegendLoadedFail)
      );
  }

  createDynamicMapLayer(service: Service): any {
    const paneName = service.name;
    const dynamicMapLayerOptions = {
      url: `${service.source.url}/${service.getNameWithoutFolder()}/${service.type}`,
      pane: paneName,
      format: 'png32',
      layers: []
    };
    return esri.dynamicMapLayer(dynamicMapLayerOptions);
  }

}
