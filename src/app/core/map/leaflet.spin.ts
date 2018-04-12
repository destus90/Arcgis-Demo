import * as L from 'leaflet';

export class Spinner {

  constructor(private el: HTMLDivElement) { }

  start() {
    this.el.style.display = 'block';
  }

  stop() {
    this.el.style.display = 'none';
  }

  toggleOpacity(val: number) {
    this.el.style.opacity = `${val}`;
  }

}

const SpinMapMixin = {
  spin: function (state: Boolean) {
    if (state) {
      // start spinning !
      this._spinner.start();
      if (!this._spinning) {
        this._spinning = 0;
      }
      this._spinning++;
    } else {
      this._spinning--;
      if (this._spinning <= 0) {
        // end spinning !
        this._spinner.stop();
      }
    }
  },
  toggleOpacity: function(val: number) {
    this._spinner.toggleOpacity(val);
  }
};

const SpinMapInitHook = function () {
  this.on('layeradd', function (e) {
    // If added layer is currently loading, spin !
    if (e.layer.loading) {
      this.spin(true);
    }
    if (typeof e.layer.on !== 'function') {
      return;
    }
    e.layer.on('data:loading', function () {
      this.spin(true);
    }, this);
    e.layer.on('data:loaded',  function () {
      this.spin(false);
    }, this);
  }, this);
  this.on('layerremove', function (e) {
    // Clean-up
    if (e.layer.loading) {
      this.spin(false);
    }
    if (typeof e.layer.on !== 'function') {
      return;
    }
    e.layer.off('data:loaded');
    e.layer.off('data:loading');
  }, this);
};

L.Map.include(SpinMapMixin);
L.Map.addInitHook(SpinMapInitHook);
