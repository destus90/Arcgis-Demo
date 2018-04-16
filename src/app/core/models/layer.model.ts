import { RasterLayer } from './raster.model';
import { Service } from './service.model';

export class Layer extends RasterLayer {
  id: number;
  legend: any;

  constructor(id: number, name: string, parent: Service, legend) {
    super(name, parent);
    this.id = id;
    this.legend = legend;
  }

  getService(): Service {
    let service: RasterLayer;

    service = this;

    while (service.parent) {
      service = service.parent;
    }

    return service as Service;
  }

}
