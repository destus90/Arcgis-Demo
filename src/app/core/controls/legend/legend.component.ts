import { Component, OnInit, OnDestroy, OnChanges, ChangeDetectorRef, SimpleChanges, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operators';

import { ArcgisService, MapService, Service, Layer } from '@app/core';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})

export class LegendComponent implements OnInit, OnDestroy, OnChanges {
  subscriptions: Subscription[] = [];
  layers: Layer[];

  @Input() service: Service;

  constructor(
    private arcgisService: ArcgisService,
    private mapService: MapService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.service.currentValue.legendLoading);
  }

  hasError() {
    return !this.service.legendLoading && !this.service.legendLoaded;
  }

  spinnerIsVisible(layer: Layer): boolean {
    const service = layer.getService();
    return service.legendLoading;
  }

  errNtfIsVisible(layer: Layer): boolean {
    const service = layer.getService();
    return !service.legendLoading && !service.legendLoaded;
  }

  isService(rs) {
    return rs instanceof Service;
  }

  isLayer(rs) {
    return rs instanceof Layer;
  }

}
