import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as L from 'leaflet';
import 'leaflet-graphicscale';

import { Spinner } from './leaflet.spin';
import { BasemapService } from '@app/core/controls';
import { ArcgisService, MapService, SourceService, Service, Source } from '@app/core';

const IMAGE_PATH = 'https://unpkg.com/leaflet@1.0.3/dist/images/';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map: L.Map;
  baseMapWindowShowed = false;
  legendWindowShowed = false;
  printWindowShowed = false;

  @ViewChild('spinner') private spinner: ElementRef;

  constructor(
    private toastr: ToastrService,
    private mapService: MapService,
    private baseMapService: BasemapService,
    private arcgisService: ArcgisService,
    private sourceService: SourceService
  ) { }

  get regionBounds(): L.LatLngBounds {
    return L.latLngBounds(L.latLng([65.82978, 58.99658]), L.latLng([58.47072, 86.61621]));
  }

  ngOnInit() {
    L.Icon.Default.prototype.options.imagePath = IMAGE_PATH;

    const map = L.map('map', {
      zoomControl: false,
      center: this.regionBounds.getCenter(),
      zoom: 6,
      doubleClickZoom: false
    });

    // remove 'Powered by esri'
    (map as any).attributionControl._esriAttributionAdded = true;

    map._spinner = new Spinner(this.spinner.nativeElement);

    this.map = map;

    this.addZoomControl();
    this.addExtentControl();
    this.addScaleControl();

    this.addLegendControl();
    this.addPrintControl();
    this.addBaseControl();

    this.mapService.mapSubject.next(map);
    try {
      this.baseMapService.switchOnByName('OpenStreetMap');
    } catch (e) {
      this.toastr.error(e.message, 'Ошибка');
    }
    this.createService();
  }

  createService() {
    const source = new Source('http://pubweb.admhmao.ru:6080/arcgis/rest/services/PUBLIC');
    const service = new Service('PUBLIC/MAP_SAF_TOWN', 'MapServer', source);
    this.sourceService.addSource(source);
    this.mapService.addActiveService(service);
    this.fetchLegend(service);
  }

  fetchLegend(service: Service) {

    const onLegendLoadSuccess = legend => {
      // this.cd.markForCheck();
    };

    const onLegendLoadFail = e => {
      this.toastr.error(e.message);
      // this.cd.markForCheck();
    };

    this.arcgisService.setLegend(service)
      .subscribe(onLegendLoadSuccess, onLegendLoadFail);
  }

  addZoomControl() {
    L.control.zoom({
      position: 'topright',
      zoomInTitle: 'Приблизить',
      zoomOutTitle: 'Уменьшить',
      zoomInText: '<img src="assets/map/map__zoom-in.png" />',
      zoomOutText: '<img src="assets/map/map__zoom-out.png" />'
    }).addTo(this.map);
  }

  addExtentControl() {
    const ExtentControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: () => {
        // create the control container with a particular class name
        const container = L.DomUtil.create('div', 'leaflet-control_custom leaflet-control__fullextent');

        container.title = 'Полный масштаб';

        // ... initialize other DOM elements, add listeners, etc.
        L.DomEvent.on(container, 'click dblclick', this.setFullExtent, this);

        return container;
      }
    });

    this.map.addControl(new ExtentControl());
  }

  addBaseControl() {
    const BaseControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-control_custom leaflet-control__layers');

        container.title = 'Базовые карты';

        L.DomEvent.on(container, 'click dblclick', this.showBaseMapWindow, this);

        return container;
      }
    });

    this.map.addControl(new BaseControl());
  }

  addLegendControl() {
    const LegendControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-control_custom leaflet-control__legend');

        container.title = 'Управление картой';

        L.DomEvent.on(container, 'click dblclick', this.showLegendWindow, this);

        return container;
      }
    });

    this.map.addControl(new LegendControl());
  }

  addPrintControl() {
    const PrintControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-control_custom leaflet-control__print');

        container.title = 'Печать карты';

        L.DomEvent.on(container, 'click dblclick', this.showPrintWindow, this);

        return container;
      }
    });

    this.map.addControl(new PrintControl());
  }

  addScaleControl() {
    // this.map.addControl(L.control.scale({imperial: false}));
    this.map.addControl(L.control['graphicScale']({fill: 'hollow', position: 'bottomright'}));
  }

  setFullExtent(e: L.LeafletEvent) {
    (L.DomEvent as any).stop(e);
    this.map.fitBounds(this.regionBounds);
  }

  showLegendWindow() {
    if (this.legendWindowShowed) {
      return;
    }
    this.legendWindowShowed = true;
  }

  showPrintWindow() {
    if (this.printWindowShowed) {
      return;
    }
    this.printWindowShowed = true;
  }

  showBaseMapWindow() {
    if (this.baseMapWindowShowed) {
      return;
    }
    this.baseMapWindowShowed = true;
  }

  onCloseBaseMapWindow() {
    this.baseMapWindowShowed = false;
  }

  onCloseLegendWindow() {
    this.legendWindowShowed = false;
  }

  onClosePrintWindow() {
    this.printWindowShowed = false;
  }

}
