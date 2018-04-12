/* SystemJS module definition */
import * as L from 'leaflet';
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module 'leaflet' {
  export interface Map {
    _spinner: any;
    spin(state: boolean): void;
  }
}

