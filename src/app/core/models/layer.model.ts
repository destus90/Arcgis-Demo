import { FormControl, Validators } from '@angular/forms';

import { RasterLayer } from './raster.model';
import { Service } from './service.model';

export class Layer extends RasterLayer {
  id: number;
  parentId: number;
  legend: any;
  featuresCount: number;
  featuresCountFetching: boolean;
  layerDef: FormControl;
  layerDefApplying: boolean;
  metadataFetching: boolean;
  editing = false;
  opacity: FormControl;

  constructor(id: number, name: string, parentId: number, parent: Layer | Service) {
    super(name, parent);
    this.id = id;
    this.parentId = parentId;
    this.legend = null;
    this.featuresCount = -1;
    this.featuresCountFetching = false;
    this.layerDef = new FormControl('', Validators.required);
    // 100 - 100% transparent
    this.opacity = new FormControl(0);
    this.layerDefApplying = false;
    this.metadataFetching = false;
  }

  clearOpacity() {
    this.opacity.reset(0);
  }

  setEditingState() {
    this.editing = true;
  }

  removeEditingState() {
    this.editing = false;
  }

  getDynamicLayer(layerDef = '1=1') {
    return {
      id: this.id,
      source: {
        type: 'mapLayer',
        mapLayerId: this.id
      },
      drawingInfo: {
        transparency: this.editing ? 100 : this.opacity.value
      },
      definitionExpression: layerDef
    };
  }

  getService(): Service {
    let service: RasterLayer;

    service = this;

    while (service.parent) {
      service = service.parent;
    }

    return service as Service;
  }

  isSingleLayer() {
    return this.layers.length === 0;
  }

}
