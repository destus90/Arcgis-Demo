import { ApplicationRef, Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef,
        Injector, EmbeddedViewRef } from '@angular/core';
const isEmpty = require('lodash/isEmpty');

import { WindowComponent } from './window.component';
import { DomService } from './dom.service';

@Injectable()
export class WindowService {

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private applicationRef: ApplicationRef,
    private domService: DomService
  ) { }

  getWindowWithMaxZIndex() {
    const windows = Array.from(this.domService.rootViewContainerNode.querySelectorAll('app-window'));
    if (isEmpty(windows)) {
      return;
    }
    return windows.reduce((maxWindow: HTMLElement, currWindow: HTMLElement) => {
      const zIndexForMaxWindow = +getComputedStyle(maxWindow).zIndex;
      const zIndexForCurrWindow = +getComputedStyle(currWindow).zIndex;
      return zIndexForCurrWindow > zIndexForMaxWindow ? currWindow : maxWindow;
    });
  }

  createWindow(projectableNodes: any[][], vcr?: ViewContainerRef): ComponentRef<WindowComponent> {
    return this.appendWindow(projectableNodes, vcr);
  }

  appendWindow(nodes: any[][], container?: ViewContainerRef): ComponentRef<WindowComponent> {
    const appRef: any = this.applicationRef;
    const windowComponentRef = this.createComponent(WindowComponent, nodes, container);

    if (!container) {
      appRef.attachView(windowComponentRef.hostView);
      this.domService.rootViewContainerNode.appendChild(this.domService.getComponentRootNode(windowComponentRef));
    }

    return windowComponentRef;
  }

  /**
   * Gets the `ComponentFactory` instance by its type.
   *
   * @param {*} componentClass
   * @returns {ComponentRef<any>}
   */
  getComponentFactory(componentClass: any): ComponentFactory<any> {
    return this.componentFactoryResolver.resolveComponentFactory(componentClass);
  }

  /**
   * Creates a component reference from a `Component` type class.
   *
   * @param {*} componentClass
   * @param {*} nodes
   * @param {ViewContainerRef} container?
   * @returns {ComponentRef<any>}
   */
  createComponent(componentClass: any, nodes?: any, container?: ViewContainerRef): ComponentRef<WindowComponent> {
    const factory = this.getComponentFactory(componentClass);

    return container ?
      container.createComponent(factory, undefined, this.injector, nodes) :
      factory.create(this.injector, nodes);
  }

}
