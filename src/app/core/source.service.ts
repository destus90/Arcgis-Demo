import { Injectable } from '@angular/core';

import { Source } from './models';

@Injectable()
export class SourceService {
  sources: Source[] = [];

  constructor() { }

  /**
   * Получить источники из кэша
   * @returns {Source[]} - массив источников
   */
  getSources(): Source[] {
    return this.sources;
  }

  /**
   * Добавление нового источника в дерево
   * @param {Source} source
   */
  addSource(source: Source) {
    this.sources = [...this.sources, source];
  }

  /**
   * Получение активных источников
   */
  getActiveSource(): Source[] {
    const activeSource: Source[] = [];

    this.sources.forEach((source: Source) => {
      for (let i = 0; i < source.services.length; i++) {
        if (source.services[i].getCheckedLayers().length !== 0) {
          activeSource.push(source);
          return;
        }
      }
    });

    return activeSource;
  }
}
