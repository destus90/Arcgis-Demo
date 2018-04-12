import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { tap, switchMap, concatMap, toArray, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';

const difference = require('lodash/difference');
const isEqual = require('lodash/isEqual');
const values = require('lodash/values');
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');
const omit = require('lodash/omit');
const omitBy = require('lodash/omitBy');
const sortBy = require('lodash/sortBy');

import { ArcgisService } from './arcgis.service';
import { SourceService } from './source.service';
import { Service, Layer, Source  } from './models';

@Injectable()
export class MapService {
  mapSubject: BehaviorSubject<L.Map> = new BehaviorSubject(null);
  activeServices: BehaviorSubject<Service[]> = new BehaviorSubject([]);

  constructor(
    private toastr: ToastrService,
    private arcgis: ArcgisService,
    private sourceService: SourceService
  ) {
    this.showSpinner = this.showSpinner.bind(this);
    this.hideSpinner = this.hideSpinner.bind(this);
    // this.removeServiceLayer = this.removeServiceLayer.bind(this);
    this.activeServices.subscribe(this.activeServiceChanged.bind(this));
  }

  get map() {
    return this.mapSubject.value;
  }

  showSpinner() {
    this.map.spin(true);
  }

  hideSpinner() {
    this.map.spin(false);
  }

  activeServiceChanged(services: Service[]) {
    const map = this.map;

    if (!map) {
      return;
    }

    // this.removeUncheckedServices(services);

    services.forEach((checkedService: Service) => {
      const dynamicMapLayer = checkedService.mapLayer.layer;
      if (map.hasLayer(dynamicMapLayer)) {
        const checkedLayerIds: number[] = checkedService.getCheckedLayerIds();
        dynamicMapLayer.setLayers(checkedLayerIds)
      } else {
        this.createDynamicMapLayer(checkedService).addTo(map);
      }
    });
  }

  createDynamicMapLayer(service: Service): any {
    const paneName = service.name;

    this.map.createPane(service.name,  this.map.getPane('overlayPane'));

    const mapLayer = this.arcgis.createDynamicMapLayer(service);

    mapLayer.on('requeststart loading', this.showSpinner);
    mapLayer.on('requestend load', this.hideSpinner);
    mapLayer.on('requesterror error', e => {
      this.toastr.error(`${e.code} ${e.message}`, 'Ошибка');
      this.hideSpinner();
    });

    service.mapLayer.layer = mapLayer;
    service.mapLayer.pane = paneName;
    return mapLayer;
  }

  // removeUncheckedServices(checkedServices: Service[]) {
  //   const services = this.getServicesFromAllSources();
  //   difference(services, checkedServices).forEach(this.removeServiceLayer);
  //   // difference(this.services.value, checkedServices).forEach(this.removeServiceLayer);
  // }
  //
  // removeServiceLayer(unchekedService: Service) {
  //   if (this.map.hasLayer(unchekedService.mapLayer.layer)) {
  //     this.map.removeLayer(unchekedService.mapLayer.layer);
  //     L.DomUtil.remove(this.map.getPane(unchekedService.name));
  //     unchekedService.getLayers().forEach((layer: Layer) => layer.clearOpacity());
  //   }
  // }

  // getServices(source: Source): Observable<Service[]> {
  //   return this.arcgis.getServices(source)
  //     .pipe(
  //       tap((services: Service[]) => {
  //         source.services = sortBy(services, ['mapName']);
  //         source.loadingSource = false;
  //         source.loadError = false;
  //         source.textError = '';
  //       }),
  //       catchError((e: Error) => {
  //         source.loadingSource = false;
  //         source.loadError = true;
  //         source.textError = e.message;
  //         return ErrorObservable.create(new Error(`Ошибка при загрузке сервиса и сточника ${source.url}`))
  //       })
  //     );
  // }

  /**
   * get services from all sources
   * @returns {Service[]}
   */
  // getServicesFromAllSources(): Service[] {
  //   const sources = this.sourceService.getSources();
  //   return sources.reduce((accServices: Service[], source: Source) => {
  //     return [...accServices, ...source.services];
  //   }, []);
  // }

  getActiveServices() {
    return (this.activeServices.value.length !== 0) ? this.activeServices.getValue() : [];
  }

  // getActiveLayers(): Layer[] {
  //   return this.activeServices.value
  //     .reduce((layers: Layer[], service: Service) => [...layers, ...service.getCheckedLayers()], [])
  //     .filter((layer: Layer) => layer.isSingleLayer());
  // }

  setActiveServices(activeServices: Service[]) {
    this.activeServices.next(activeServices);
  }

  addActiveService(service: Service) {
    let value = this.activeServices.value;
    if (!value.includes(service)) {
      value = [service, ...value];
    }
    this.setActiveServices(value);
  }

  // deleteActiveService(unactiveService: Service) {
  //   let value = this.activeServices.value;
  //   if (value.includes(unactiveService)) {
  //     value = value.filter((service: Service) => service !== unactiveService);
  //   }
  //   this.setActiveServices(value);
  // }

}
