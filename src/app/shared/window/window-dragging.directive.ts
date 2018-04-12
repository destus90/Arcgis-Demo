import { Directive, ElementRef, Renderer2, HostListener, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { WindowService } from './window.service';

@Directive({
  selector: '[appWindowDragging]'
})
export class ModalDraggingDirective implements OnInit, OnChanges {
  _maximize: boolean;
  // listenFunc will hold the function returned by "renderer.listen"
  listenFuncMove: Function;
  listenFuncUp: Function;

  @Input() set maximize(state: boolean) {
    this._maximize = state;
    if (state) {
      this.bringToFront();
    }
  };

  get maximize() {
    return this._maximize;
  }

  @Input() minimize: boolean;

  private dragging = false;
  private shiftX: number;
  private shiftY: number;

  private elemWidth: number;
  private elemHeight: number;

  @HostListener('mouseover', ['$event']) onMouseOver(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('mouseout', ['$event']) onMouseOut(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('mousedown', ['$event']) onDragStart(event: MouseEvent) {

    if ((event.target as HTMLElement).classList.contains('icon-control')) {
      return;
    }

    if (this.maximize) {
      return;
    }

    if (event.button === 2) {
      return; // prevent right-click
    }

    // when click on a header bringToFront curr window
    this.bringToFront();

    if (!(event.target as HTMLElement).closest('.window__header')) {
      return;
    }

    this.cancelSelect();

    const elem = this.el.nativeElement;
    const coords = this.getCoords();

    // offsetWidth / 2 due to translateX(-50%)
    // this.shiftX = event.clientX - coords.left - elem.offsetWidth / 2;
    this.shiftX = event.clientX - coords.left;
    this.shiftY = event.clientY - coords.top;

    this.renderer2.setStyle(elem, 'position', 'fixed');
    this.moveAt(event);
    this.listenFuncMove = this.renderer2.listen('document', 'mousemove', this.onDrag.bind(this));
    this.listenFuncUp = this.renderer2.listen('document', 'mouseup', this.onDragEnd.bind(this));

    this.dragging = true;


  }

  constructor(private el: ElementRef,
              private renderer2: Renderer2,
              private windowService: WindowService
  ) { }

  get host() {
    return this.el.nativeElement.parentNode;
  }

  ngOnInit() {
    this.calculateMaxHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    const minimize = changes.minimize;
    const visible = changes.visible;

    if (visible) {
      if (visible.currentValue === true && visible.previousValue === false) {
        this.elemWidth = this.el.nativeElement.offsetWidth;
        this.elemHeight = this.el.nativeElement.offsetHeight;
      }
    }

    if (minimize) {
      if (minimize.currentValue === false && minimize.previousValue === true) {
        if (this.windowScrollDocument()) {
          const elem = this.el.nativeElement;
          const buffer = 5;

          this.renderer2.setStyle(elem, 'top', document.body.clientHeight - this.elemHeight - buffer + 'px');
        }
      }
    }
  }

  bringToFront() {
    const windowWithMaxZIndex = this.windowService.getWindowWithMaxZIndex();
    const currWindow = this.host;
    if (windowWithMaxZIndex === currWindow) {
      return;
    }
    const zIndexForMaxWindow = +getComputedStyle(windowWithMaxZIndex).zIndex;
    this.renderer2.setStyle(currWindow, 'z-index', zIndexForMaxWindow + 1);
  }

  getCoords() {
    const box = this.el.nativeElement.getBoundingClientRect();
    return {
      top: box.top,
      left: box.left
    };
  }

  moveAt(e: MouseEvent) {

    const elem = this.el.nativeElement;

    let newLeft = e.clientX - this.shiftX,
      newTop = e.clientY - this.shiftY;

    const elemOffsetWidth = elem.offsetWidth;
    const elemOffsetHeight = elem.offsetHeight;
    const documentClientWidth = document.body.clientWidth;
    const documentClientHeight = document.body.clientHeight;

    // const rightEdge = documentClientWidth - elemOffsetWidth / 2;
    const rightEdge = documentClientWidth - elemOffsetWidth - 1;
    const bottomEdge = documentClientHeight - elemOffsetHeight ;

    // if ( newLeft - elemOffsetWidth / 2  < 0) {
    //   newLeft = elemOffsetWidth / 2;
    // }
    if ( newLeft < 0) {
        newLeft = 0;
    }

    if (newTop < 0) {
      newTop = 0;
    }

    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }

    if (newTop > bottomEdge) {
      newTop = bottomEdge;
    }
    this.renderer2.setStyle(elem, 'left', newLeft + 'px');
    this.renderer2.setStyle(elem, 'top', newTop + 'px');
  }

  onDrag(event: MouseEvent) {
    this.moveAt(event);
  }

  onDragEnd() {
    if (this.dragging) {
      if (this.listenFuncMove) {
        this.listenFuncMove();
      }
      if (this.listenFuncUp) {
        this.listenFuncUp();
      }
      this.restoreSelect();
      this.dragging = false;
      this.calculateMaxHeight();
    }
  }

  windowScrollDocument(): boolean {
    const coords = this.getCoords();

    return this.elemHeight + coords.top > document.body.clientHeight;
  }

  calculateMaxHeight() {
    const el = this.el.nativeElement;
    const { top } = el.getBoundingClientRect();
    this.renderer2.setStyle(el, 'max-height', `${document.body.clientHeight - top}px`);
  }

  cancelSelect() {
    this.renderer2.setStyle(document.body, 'user-select', 'none');
    this.renderer2.setStyle(document.body, '-webkit-user-select', 'none');
    this.renderer2.setStyle(document.body, '-ms-user-select', 'none');
    this.renderer2.setStyle(document.body, '-moz-user-select', 'none');
  }

  restoreSelect() {
    this.renderer2.setStyle(document.body, 'user-select', 'auto');
    this.renderer2.setStyle(document.body, '-webkit-user-select', 'auto');
    this.renderer2.setStyle(document.body, '-ms-user-select', 'auto');
    this.renderer2.setStyle(document.body, '-moz-user-select', 'auto');
  }

}
