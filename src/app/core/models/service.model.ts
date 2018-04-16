import { RasterLayer } from './raster.model';
import { Layer } from './layer.model';
import { Source } from './source.model';

interface MapLayer {
  pane: string;
  layer: any;
}

export class Service extends RasterLayer {
  mapName: string;
  type: string;
  supportsDynamicLayers: boolean;
  supportedExtensions: string;
  legendLoaded = false;
  legendLoading = false;
  mapLayer: MapLayer = {layer: null, pane: ''};
  source: Source;

  constructor(name: string, type: string, source: Source) {
    super(name);
    this.type = type;
    this.source = source;
  }

  getLayers(): Layer[] {
    const layers: Layer[] = [];
    this.checkRecursiveLayers(this.layers, layers, 'all');
    return layers;
  }

  getCheckedLayers(): Layer[] {
    const checkedLayers: Layer[] = [];
    this.checkRecursiveLayers(this.layers, checkedLayers, 'checked');
    return checkedLayers;
  }

  getCheckedLayerIds(): number[] {
    return this.getCheckedLayers()
      .map((layer: Layer) => layer.id);
  }

  checkRecursiveLayers(layers, checkedLayers: Layer[], state: string) {
    layers.forEach((layer: Layer) => {
      if (state === 'checked') {
        if (layer.checked) {
          checkedLayers.push(layer);
        }
      } else if (state === 'all') {
        checkedLayers.push(layer);
      }
      if (layer.hasLayers()) {
        this.checkRecursiveLayers(layer.layers, checkedLayers, state);
      }
    });
  }

  getLayerById(id: number) {
    return this.findLayerById(this.layers, id);
  }

  findLayerById(layers: Layer[], id: number) {
    if (!layers) { return; }

    for (const layer of layers) {
      // Test current object
      if (layer.id === id) { return layer; }

      // Test children recursively
      const child = this.findLayerById(layer.layers, id);
      if (child) { return child; }
    }
  }

  getLayerByName(layers: Layer[], layerName: string): Layer {
    let findedLayer: Layer;
    layers.forEach((layer: Layer) => {
      if (findedLayer) {
        return findedLayer;
      }
      if (layer.layers.length !== 0) {
        findedLayer = this.getLayerByName(layer.layers, layerName);
        if (findedLayer) {
          return findedLayer;
        }
      }
      if (layer.name.toLowerCase() === layerName.toLowerCase()) {
        findedLayer = layer;
      }
    });
    return findedLayer;
  }

  getNameWithoutFolder(): string {
    return this.name.split('/')[1];
  }
}


