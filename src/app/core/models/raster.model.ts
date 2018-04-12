import { Layer } from './layer.model';
import { Service } from './service.model';

export abstract class RasterLayer {
  expanded = false;
  legendExpanded = false;
  checked = false;
  checkedChild = false;
  layers: Layer[] = [];
  name: string;
  parent: Service | Layer;

  constructor(name: string, parent: Service | Layer = null) {
    this.name = name;
    this.parent = parent;
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  toggleLegendExpanded() {
    this.legendExpanded = !this.legendExpanded;
  }

  check() {
    if (this.layers.length !== 0) {
      this.checked = !this.checkedChild;
    } else {
      // single layer
      this.checked = !this.checked;
      if (!this.checked) {
        (this as any).clearOpacity();
      }
    }

    // Если checked у parent ,то проставляет checked всем child
    this.checkRecursive(this.checked);

    // Если checked у child ,то ставит checkedChild parent
    this.checkChildRecursive(this);

    // Если checked у всех child ,то ставит checked у parent
    this.checkChildIdenRecursive(this);
  }

  checkChildIdenRecursive(rl: RasterLayer) {
    if (rl.parent) {
      rl.parent.checked = rl.parent.layers.every((layer: Layer) =>  layer.checked);
      rl.parent.checkedChild = rl.parent.layers.some((layer: Layer) =>  layer.checkedChild) ? true : false;
      this.checkChildIdenRecursive(rl.parent);
    }
  }

  checkChildRecursive(rl: RasterLayer) {
    rl.checkedChild = rl.checked ? true : !rl.checkedChild;

    if (rl.parent) {
      if (rl.checkedChild && rl.parent.checkedChild) {
        return;
      }
      if (rl.parent.layers.some((layer: Layer) => layer.checkedChild || layer.checked) && rl.parent.checkedChild) {
        return;
      }
      this.checkChildRecursive(rl.parent);
    }
  }

  checkRecursive(state) {
    this.layers.forEach((layer: Layer) => {
      layer.checkedChild = state;
      layer.checked = state;
      layer.checkRecursive(state);
    });
  }

  hasLayers(): boolean {
    return this.layers.length !== 0;
  }

  setLegendRecursive(legendService: any[]) {
    this.layers.forEach((layer: Layer) => {
      layer.legend = this.searchLegendForLayer(layer.id, legendService);
      if (layer.hasLayers()) {
        layer.setLegendRecursive(legendService);
      }
    });
  }

  searchLegendForLayer(idLayer: number, legendService: any[]) {
    let legendForLayer =  legendService.find( (legendLayer) => legendLayer.layerId === idLayer);
    if (!legendForLayer || !legendForLayer.legend) {
      return;
    }
    return legendForLayer.legend;
  }

}
