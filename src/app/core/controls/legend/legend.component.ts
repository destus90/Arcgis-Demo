import { Component, OnInit, OnDestroy, OnChanges, ChangeDetectorRef, SimpleChanges, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';

import { ArcgisService, MapService, Service, Layer, Legend } from '@app/core';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  animations: [

    trigger('layersAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateX(-100%)'}),
        animate(250, style({opacity: 1, transform: 'translateX(0)'}))
      ])
    ])

  ]
})

export class LegendComponent implements OnInit, OnDestroy, OnChanges {
  subscriptions: Subscription[] = [];

  @Input() service: Service;

  constructor(
    private arcgisService: ArcgisService,
    private mapService: MapService
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  hasError() {
    return !this.service.legendLoading && !this.service.legendLoaded;
  }

  getImageIcon(layer: Layer) {
    const legend: Legend = layer.legend[0];
    return `data:${legend.contentType};base64,${legend.imageData}`;
  }

  getWidthForIcon(layer: Layer) {
    const legend: Legend = layer.legend[0];
    return legend.width;
  }

  getHeightForIcon(layer: Layer) {
    const legend: Legend = layer.legend[0];
    return legend.height;
  }

  toggleLayer(layer: Layer) {
    Object.assign(layer, {checked: !layer.checked});
    this.mapService.activeServices.next(
      this.mapService.activeServices.getValue()
    )
  }

}
