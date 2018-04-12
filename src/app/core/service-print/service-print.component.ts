import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject }    from 'rxjs/Subject';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ToastrService } from 'ngx-toastr';
const isEmpty = require('lodash/isEmpty');

import { ArcgisService, MapService, Service } from 'app/core/index';
const leafletCss = require('leaflet/dist/leaflet.css');
const graphicScaleCss = require('leaflet-graphicscale/dist/Leaflet.GraphicScale.min.css');
const printCss = require('./print.css');

@Component({
  selector: 'app-service-print',
  templateUrl: './service-print.component.html',
  styleUrls: ['./service-print.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicePrintComponent implements OnInit {

  @ViewChild('printLegend') printLegend: ElementRef;
  @ViewChild('printScaleBar') printScaleBar: ElementRef;
  @ViewChild('mapName') mapName: ElementRef;

  heightCanvas = new Subject<number>();
  heightCanvas$ = this.heightCanvas.asObservable();
  subscription: Subscription;
  hiddenScaleBar;
  arrayCanvas = [];  // Массив canvas из которых состоит легенда
  currentCanvas;     // Canvas в котором на текущий момент рисуется легенда
  widthCanvas = 400; // Ширина canvas
  maxHeightCanvas = 1100; // Максимальная высота canvas
  numberLegend = 1;      // Номер canvas в легенде

  constructor(
    private arcgisService: ArcgisService,
    private mapService: MapService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {}

  /**
   * Печать карты
   */
  printMap() {
    // Показывать/не показывать при печати масштабную линейку
    this.hiddenScaleBar = (this.printScaleBar.nativeElement.checked) ? '' : '.leaflet-bottom.leaflet-left {display: none}';

    const activeServices = this.mapService.getActiveServices();

    // Если легенда печатается
    if (this.printLegend.nativeElement.checked && activeServices.length !== 0) {
      const inside = 5;                                             // Отступ от левого края по умолчанию
      let heightLegend = 40;                                        // Текущая высота легенды (20 - начальный отступ от верхнего края)

      this.createCanvasElement();

      this.subscription = this.heightCanvas$.subscribe(
        () => {
          activeServices.forEach((service) => {
            let ctx = this.currentCanvas.getContext('2d');
            if (heightLegend + 10 > this.maxHeightCanvas) {
              heightLegend = 40;
              ctx = this.createCanvasElement();
            }

            ctx.font = 'bold 16px sans-serif';
            heightLegend += 5;
            heightLegend = this.paintTextCanvas(ctx, service.mapName, inside, heightLegend);
            ctx.font = '14px sans-serif';
            heightLegend += 10;
            heightLegend = this.paintLegend(service.layers, heightLegend, inside);
          });
          setTimeout(this.createWindowForPrint.bind(this), 1000);
          this.subscription.unsubscribe();
        },
        (error) => {
          this.toastr.error(error.message, 'Ошибка');
          this.subscription.unsubscribe();
        }
      );
      this.loadLegendService();
    } else {
      this.createWindowForPrint();
    }
  }

  updateHeightCanvas(): Subject<Number> {
    return this.heightCanvas;
  }

  /**
   * Отрисовка легенды одного сервиса
   * @param layers - слой, легенду которого рисуем
   * @param heightLegend - текущая высота легенды на момент начала рисования
   * @param inside - отступ слева для легенды
   */
  paintLegend(layers, heightLegend, inside) {
    layers.forEach(
      layer => {
        if (layer.checked || layer.checkedChild) {
          // Если нету легенды - значит это наименование слоя
          if (layer.legend) {
            if (layer.legend.length === 1) {
              if (heightLegend + 10 + layer.legend[0].height > this.maxHeightCanvas) {
                heightLegend = 40;
                this.createCanvasElement();
              }

              this.paintElementLegend(this.currentCanvas.getContext('2d'), layer.name, heightLegend, layer.legend[0], inside);
              heightLegend += 10 + layer.legend[0].height;
            }

            if (layer.legend.length > 1) {
              if (heightLegend + 20 <= this.maxHeightCanvas) {
                heightLegend += 10;
              } else {
                heightLegend = 40;
                this.createCanvasElement();
              }

              heightLegend = this.paintTextCanvas(this.currentCanvas.getContext('2d'), layer.name, inside, heightLegend);
              heightLegend += 10;

              layer.legend.forEach(legendVal => {
                  if (heightLegend + 10 + layer.legend[0].height > this.maxHeightCanvas) {
                    heightLegend = 40;
                    this.createCanvasElement();
                  }

                  this.paintElementLegend(this.currentCanvas.getContext('2d'), legendVal.label, heightLegend, legendVal, inside + 10);
                  heightLegend += 10 + legendVal.height;
                }
              );
            }
          } else {
            if (heightLegend + 20 > this.maxHeightCanvas) {
              heightLegend = 40;
              this.createCanvasElement();
            }

            heightLegend += 10;
            heightLegend = this.paintTextCanvas(this.currentCanvas.getContext('2d'), layer.name, inside, heightLegend);
            heightLegend += 10;
            heightLegend = this.paintLegend(layer.layers, heightLegend, inside + 10);
          }
        }
      }
    );
    return heightLegend + 10;
  }

  /**
   * Создание нового элемента canvas для части легенды
   */
  createCanvasElement() {
    this.currentCanvas = document.createElement('canvas');
    this.arrayCanvas.push(this.currentCanvas);
    this.currentCanvas.width = this.widthCanvas;
    this.currentCanvas.height = this.maxHeightCanvas;

    let  ctx = this.currentCanvas.getContext('2d');
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(this.numberLegend, 5, 15);
    ctx.font = '14px sans-serif';
    this.numberLegend++;
  }

  /**
   * Пририсовывает новый элемент легенды к уже существующей легенде
   *
   * @param ctx - контекст canvas для рисования
   * @param heightLegend - текущая высота легенды на момент начала рисования
   * @param textLegend - наименование текущей иконки
   * @param {object} legendVal - содержит данные иконки (data, height ,width)
   * @param {boolean} inside - true-легенда вложенная, false-не вложенная
   * @returns {any} - возвращает текущую высоту легенды
   */
  paintElementLegend(ctx, textLegend, heightLegend, legendVal, inside) {
    // Если легенда вложенная, то отступы от левого края добавить
    const indentIcon = inside,
      indentLabel = inside + 5,
      img = new Image();

    img.onload = () => {
      ctx.drawImage(img, indentIcon, heightLegend);
      heightLegend = this.paintTextCanvas(ctx, textLegend, legendVal.width + indentLabel, heightLegend + legendVal.height / 2);
    };

    img.src = `data:image/png;base64,${legendVal.imageData}`;
  }

  /**
   * Рисование текста в canvas, в зависимости от ширины canvas текст переносится
   * @param ctx - контекст для рисования canvas
   * @param text - текст для рисования
   * @param insideWidth - отступ от левого края
   * @param heightLegend - высота легенды
   * @returns {any} - возвращает высоту легенды
   */
  paintTextCanvas (ctx, text, insideWidth, heightLegend) {
    let arrayText = text.split(' '),
        phrase = '';

    arrayText.forEach(word => {
      if (ctx.measureText(phrase + ' ' + word).width < this.widthCanvas - insideWidth) {
        phrase += ' ' + word;
      } else {
        ctx.fillText(phrase, insideWidth, heightLegend);
        heightLegend += 15;
        phrase = word;
      }
    });

    ctx.fillText(phrase, insideWidth, heightLegend);

    return heightLegend;
  }

  /**
   * Построение шаблона легенды состоящей из элементов canvas
   * @returns {string} - шаблон легенды из canvas
   */
  createCanvas() {
    let templateCanvas = '';
    this.arrayCanvas.forEach(canva => {
      templateCanvas += `<div style="display: inline-block"><img src="${canva.toDataURL()}"></div>`;
    });
    return templateCanvas;
  }

  /**
   * Загрузка легенды для сервисов у которых она еще не загружена
   */
  loadLegendService() {
    const observables = this.mapService.getActiveServices()
      .filter((service: Service) => !service.legendLoaded)
      .map((service: Service) => this.fetchLegend(service));

    if (isEmpty(observables)) {
      this.updateHeightCanvas().next();
      return;
    }

    forkJoin(observables)
      .subscribe(
        () => this.updateHeightCanvas().next(),
        error => {
          this.toastr.error(error.message, 'Ошибка');
          this.updateHeightCanvas().next();
        }
      );
  }

  fetchLegend(service: Service) {
    return this.arcgisService.setLegend(service);
  }


  createWindowForPrint() {
    const today = new Date().toLocaleDateString(),
      watermarkHTML = `<div class="watermark">
                             <img src="assets/watermark.png">
                             <br><br>
                             <span>${today}___________/ГИС</span>
                           </div>`,
      mapName = this.mapName.nativeElement.value;
    let popupWin, containerMapName = '';

    if (mapName) {
      containerMapName = `<span>${mapName}</span>`;
    }

    let templateCanvasLegend = this.createCanvas();
    this.arrayCanvas.length = 0;
    this.numberLegend = 1;
    try {
      popupWin = window.open('', '_blank', 'top=0,left=0,height=800px,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
      <html>
        <head>
          <style>
            ${leafletCss}
            ${graphicScaleCss}
            ${printCss}
            ${this.hiddenScaleBar}
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="print-mapName">${containerMapName}</div>
          <div class="print-map" 
               style="height: ${this.mapService.map.getSize().y}px;width: ${this.mapService.map.getSize().x}px;">
            ${watermarkHTML + this.mapService.map.getContainer().innerHTML}
          </div>
          <div>
            ${templateCanvasLegend}
          </div>
        </body>
      </html>`
      );
     popupWin.document.close();
    } catch (error) {
      this.toastr.error('Возможно у вас заблокированы всплывающие окна', 'Ошибка');
    }
  }
}
