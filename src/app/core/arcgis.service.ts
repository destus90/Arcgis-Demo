import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as esri from 'esri-leaflet';
import { Observable } from 'rxjs/Observable';
import { tap, finalize, catchError, delay } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { Service, Layer } from './models';

interface Legend {
  label: string;
  url: string;
  imageData: string;
  contentType: string;
  width: number;
  height: number;
}

interface LegendLayerResponse {
  layerId: number;
  layerName: string;
  layerType: string;
  legend: Legend[]
}

export interface LegendResponse {
  layers: LegendLayerResponse[]
}

@Injectable()
export class ArcgisService {

  constructor(
    private http: HttpClient
  ) {}

  getLayersFromLegend(service: Service, legend: LegendResponse) {
    return (legend.layers as any).reduce((layers: Layer[], data: LegendLayerResponse) => {
      const layer = new Layer(data.layerId, data.layerName, service, data.legend);
      return [...layers, layer];
    }, []);
  }

  fetchLegend(service: Service): Observable<any> {
    const onLegendLoadedFail = e => ErrorObservable.create(new Error(`Ошибка загрузки легенды для сервиса ${service.name}`));
    return this.http.get<LegendResponse>(`${service.source.url}/${service.getNameWithoutFolder()}/${service.type}/legend`, {
      params: new HttpParams().set('f', 'pjson')
    })
      .pipe(
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
