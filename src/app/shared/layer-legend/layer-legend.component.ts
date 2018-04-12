import { Component, OnInit, Input } from '@angular/core';

import { Layer } from '@app/core';

interface Legend {
  contentType: string;
  imageData: string;
}

@Component({
  selector: 'app-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.scss']
})
export class LayerLegendComponent implements OnInit {
  @Input() layer: Layer;

  constructor() { }

  ngOnInit() {
  }

  getLegendIcon(legend: Legend): string {
    return `data:${legend.contentType};base64,${legend.imageData}`;
  }

}
