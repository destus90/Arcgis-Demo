import { ApplicationRef, Injectable, ComponentRef, EmbeddedViewRef } from '@angular/core';
const isEmpty = require('lodash/isEmpty');
const isNaN = require('lodash/isNaN');

@Injectable()
export class DomService {

  constructor(
    private applicationRef: ApplicationRef
  ) { }

  get rootViewContainer(): ComponentRef<any> {
    // https://github.com/angular/angular/blob/4.0.x/packages/core/src/application_ref.ts#L571
    const rootComponents = this.applicationRef.components || [];

    if (rootComponents[0]) {
      return rootComponents[0];
    }

    throw new Error(`View Container not found!`);
  }

  get rootViewContainerNode(): HTMLElement {
    return this.getComponentRootNode(this.rootViewContainer);
  }

  /**
   * Gets the HTML element for a component reference.
   *
   * @param {ComponentRef<any>} componentRef
   * @returns {HTMLElement}
   */
  getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }

  getZIndexForWindow() {
    const arr = Array.from(this.rootViewContainerNode.querySelectorAll('app-window'))
      .map((window: HTMLElement) => +getComputedStyle(window).zIndex)
      .filter((val: any) => !isNaN(val));

    if (isEmpty(arr)) {
      return 1050;
    }
    return Math.max(...arr) + 1;
  }

}
