import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { map, catchError } from 'rxjs/operators';

const has = require('lodash/has');

@Injectable()
export class InterceptorsService implements HttpInterceptor {

  constructor() {
    this.handleArcgisError = this.handleArcgisError.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // TESTING

    // if (req.url.includes('shape')) {
    //   return Observable.of(new HttpResponse({ status: 200 })).delay(2000);
    // }

    // if (req.url.includes('layer')) {
    //   const response = {ID: 2471};
    //   return Observable.of(new HttpResponse({ status: 200, body: response })).delay(2000);
    // }

    return next.handle(req)
      .pipe(
        map(this.handleArcgisError),
        catchError(this.handleError)
      );
  }

  handleArcgisError(event) {
    if (event instanceof HttpResponse) {
      const { body } = event;
      if (has(body, 'error')) {
        throw new Error(`${body.error.code} ${body.error.message}`);
      }
    }
    return event;
  }

  handleError (err: HttpErrorResponse) {
    let errMsg: string;
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errMsg = `Ошибка ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errMsg = `Ошибка на сервере ${err.message}`;
    }
    return ErrorObservable.create(new Error(errMsg));
  }

}
