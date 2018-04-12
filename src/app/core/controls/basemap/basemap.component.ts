import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { Map } from 'leaflet';
import { Subscription } from 'rxjs/Subscription';

import { BasemapService, BASEMAP } from './basemap.service';
import { MapService } from 'app/core/index';

@Component({
  selector: 'app-basemap',
  templateUrl: './basemap.component.html',
  styleUrls: ['./basemap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('previewAnimation', [
      transition(':enter', [
        style({opacity: 0}),
        animate(300, style({opacity: 1}))
      ])
    ])
  ]
})
export class BasemapComponent implements OnInit, OnDestroy {
  arcgisBaseFetching = false;
  subscriptions: Subscription[] = [];

  constructor(
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private basemapService: BasemapService,
    private mapService: MapService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  get baseIsActive() {
    const baseMaps = [...this.baseMaps, ...this.arcgisBaseMaps];
    return baseMaps.some((basemap: BASEMAP) => this.map.hasLayer(basemap.layer));
  }

  get map(): Map {
    return this.mapService.map;
  }

  get baseMaps(): BASEMAP[] {
    return this.basemapService.baseMaps;
  }

  get arcgisBaseMaps(): BASEMAP[] {
    return this.basemapService.arcgisBase;
  }

  isActive(basemap: BASEMAP) {
    return this.map.hasLayer(basemap.layer);
  }

  switchOffBaseMap() {
    if (this.baseIsActive) {
      this.basemapService.switchOffAll();
    }
  }

  toggleBaseMap(name: string) {
    this.basemapService.switchOnByName(name);
  }

}
