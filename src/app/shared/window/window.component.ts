import { Component, OnInit, ChangeDetectionStrategy, Input, Output, ElementRef, EventEmitter, HostListener,
        Renderer2 } from '@angular/core';
import { animate, trigger, transition, state, style } from '@angular/animations';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DomService } from './dom.service';

@Component({
  selector: 'app-window',
  templateUrl: 'window.component.html',
  styleUrls: ['window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('windowAnimation', [
      state('*', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0, transform: 'scale(0)'}),
        animate(200)
      ])
    ])
  ]
})
export class WindowComponent implements OnInit {
  minimize: BehaviorSubject<boolean> = new BehaviorSubject(false);
  maximize: BehaviorSubject<boolean> = new BehaviorSubject(false);
  pageWidth: number;
  pageHeight: number;
  minWidth: number;
  minHeight: number;
  type: string;
  firstTimeResize = true;
  lastWidth: number;
  lastHeight: number;
  resizing = false;
  startLeft: number;
  startTop: number;
  startRight: number;
  startBottom: number;
  mousemoveListener: any;
  previousZIndex: number;
  overlayZIndex: number;

  @Input() caption: string;
  @Input() modal: boolean;

  @Output() close = new EventEmitter();

  onMouseMove(event: MouseEvent): void {
    if (this.resizing) {
      this.cancelSelect();
      this.manageMove(event.x, event.y);
    }
  }

  @HostListener('document:mouseup') stopEvents() {
    if (this.resizing) {
      this.restoreSelect();
      this.resizing = false;
      // off mousemove event
      this.mousemoveListener();
    }
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private domService: DomService
  ) { }

  ngOnInit() {
    // Page width and height
    this.pageWidth = window.innerWidth
      || document.documentElement.offsetWidth
      || document.body.offsetWidth;
    this.pageHeight = window.innerHeight
      || document.documentElement.offsetHeight
      || document.body.offsetHeight;
    const zIndex = this.domService.getZIndexForWindow();
    this.renderer.setStyle(this.el.nativeElement, 'zIndex', zIndex);
    if (this.modal) {
      this.overlayZIndex = zIndex - 1;
    }
  }

  get container(): HTMLElement {
    return this.el.nativeElement.children[0];
  }

  get position(): ClientRect {
    return this.container.getBoundingClientRect();
  }

  minimizeWindow(): void {
    const container = this.container;
    this.lastHeight = +container.style.height;
    this.lastWidth = +container.style.width;
    this.renderer.setStyle(container, 'height', '');
    this.minimize.next(true);
  }

  maximizeWindow(): void {
    this.renderer.addClass(this.el.nativeElement, 'maximize');
    this.maximize.next(true);
    this.previousZIndex = +getComputedStyle(this.el.nativeElement).zIndex;
    this.renderer.setStyle(this.el.nativeElement, 'zIndex', 10000);
  }

  rollWindow(): void {
    this.renderer.removeClass(this.el.nativeElement, 'maximize');
    this.maximize.next(false);
    this.renderer.setStyle(this.el.nativeElement, 'zIndex', this.previousZIndex || 1050);
  }

  restoreWindow(): void {
    const container = this.container;
    this.minimize.next(false);
    if (this.lastHeight) {
      this.renderer.setStyle(container, 'height', this.lastHeight + 'px');
    }
    if (this.lastWidth) {
      this.renderer.setStyle(container, 'width', this.lastWidth + 'px');
    }
  }



  onClose(): void {
    this.close.emit();
  }

  getCurrSize(): number[] {
    const { top, right, bottom, left } = this.position;
    const width = right - left;
    const height = bottom - top;
    return [width, height];
  }

  /**
   * onMouseResize
   * Manages the resize of the window with mouse events
   */
  onMouseResize(event: MouseEvent, type: string): void {
    this.startResize(event.x, event.y, type);
  }

  startResize(x: number, y: number, type: string) {
    if (this.minimize.value || this.maximize.value) {
      return;
    }
    const { left, top, right, bottom } = this.position;
    this.startLeft = left;
    this.startTop = top;
    this.startRight = right;
    this.startBottom = bottom;
    this.type = type;
    if (this.firstTimeResize) {
      [this.minWidth, this.minHeight] = this.getCurrSize();
      this.firstTimeResize = false;
    }
    [this.lastWidth, this.lastHeight] = this.getCurrSize();
    this.resizing = true;
    this.cancelSelect();
    this.mousemoveListener = this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
  }

  manageMove(x: number, y: number) {
    this.resize(x, y);
  }

  resize(x: number, y: number) {
    if (!this.resizing) {
      return;
    }
    const [ minWidth, minHeight ] = [ this.minWidth, this.minHeight ];
    const [ maxWidth, maxHeight ] = [ this.pageWidth, this.pageHeight ];
    const container = this.container;

    if (this.type.includes('top')) {
      const height = this.lastHeight - y + this.startTop;
      if (height < minHeight) {
        this.renderer.setStyle(container, 'top', this.startBottom - minHeight + 'px');
        this.renderer.setStyle(container, 'height', minHeight + 'px');
      } else if (y >= 0) {
        this.renderer.setStyle(container, 'top', y + 'px');
        this.renderer.setStyle(container, 'height', height + 'px');
      }
    }

    if (this.type.includes('bottom')) {
      const height = this.lastHeight + y - this.startBottom;
      if (height < minHeight) {
        this.renderer.setStyle(container, 'height', minHeight + 'px');
      } else if (y <= maxHeight) {
        this.renderer.setStyle(container, 'height', height + 'px');
      }
    }

    if (this.type.includes('right')) {
      const width = this.lastWidth + x - this.startRight;
      if (width < minWidth) {
        this.renderer.setStyle(container, 'width', minWidth + 'px');
      } else if (x <= maxWidth) {
        this.renderer.setStyle(container, 'width', width + 'px');
      }
    }

    if (this.type.includes('left')) {
      const width = this.lastWidth - x + this.startLeft;
      if (width < minWidth) {
        this.renderer.setStyle(container, 'left', this.startRight - minWidth + 'px');
        this.renderer.setStyle(container, 'width', minWidth + 'px');
      } else if (x >= 0) {
        this.renderer.setStyle(container, 'left', x + 'px');
        this.renderer.setStyle(container, 'width', width + 'px');
      }
    }

  }

  cancelSelect(): void {
    this.renderer.setStyle(document.body, 'user-select', 'none');
    this.renderer.setStyle(document.body, '-webkit-user-select', 'none');
    this.renderer.setStyle(document.body, '-ms-user-select', 'none');
    this.renderer.setStyle(document.body, '-moz-user-select', 'none');
  }

  restoreSelect() {
    this.renderer.setStyle(document.body, 'user-select', 'auto');
    this.renderer.setStyle(document.body, '-webkit-user-select', 'auto');
    this.renderer.setStyle(document.body, '-ms-user-select', 'auto');
    this.renderer.setStyle(document.body, '-moz-user-select', 'auto');
  }

}
