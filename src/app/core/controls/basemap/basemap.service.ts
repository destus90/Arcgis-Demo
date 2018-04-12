import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Map, TileLayer, tileLayer, DomEvent } from 'leaflet';
import * as esri from 'esri-leaflet';
import { Observable } from 'rxjs/Observable';
import { tap, switchMap, map  } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
const isEmpty = require('lodash/isEmpty');

import { MapService } from 'app/core/index';

export class BASEMAP {
  errorMsg: string;
  imageFetching = false;

  constructor(
    public name: string,
    public layer: TileLayer | esri.DynamicMapLayer,
    public image?: string
  ) {};

  showImageFetchingSpinner() {
    this.imageFetching = true;
  }

  hideImageFetchingSpinner() {
    this.imageFetching = false;
  }

  hasImage() {
    return !!this.image;
  }

  setImage(image: string) {
    this.image = image;
  }

  setError(msg) {
    this.errorMsg = msg;
  }

}

@Injectable()
export class BasemapService {
  baseMaps: BASEMAP[] = [];
  arcgisBase: BASEMAP[] = [];

  constructor(private http: HttpClient,
              private mapService: MapService) {

    const osm = new BASEMAP('OpenStreetMap', tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; Участники <a href="http://osm.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }), 'assets/base-map/osm.png');

    const googleStreets = new BASEMAP('Google maps', tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Картографические данные &copy; Google',
      maxZoom: 19
    }), 'assets/base-map/google-maps.png');

    const googleSat = new BASEMAP('Google спутник', tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Картографические данные &copy; Google',
      maxZoom: 19
    }), 'assets/base-map/google-sat.png');

    this.baseMaps = [osm, googleSat, googleStreets];
  }

  get map(): Map {
    return this.mapService.map;
  }

  get maps() {
    return [...this.baseMaps, ...this.arcgisBase];
  }

  switchOffAll() {
    this.maps.forEach((basemap: BASEMAP) => this.map.removeLayer(basemap.layer));
  }

  switchOnByName(name: string) {
    const baseMap = this.maps.find((l: any) => l.name === name);
    if (!baseMap) {
      throw new Error(`Couldn't find base map ${name}`);
    }
    const { layer } = baseMap;
    if (this.map.hasLayer(layer)) {
      return;
    }
    this.switchOffAll();
    this.map.addLayer(layer);
  }

}
