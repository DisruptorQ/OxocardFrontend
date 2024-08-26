import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  public getPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      navigator.geolocation.getCurrentPosition(
        position => {
          observer.next(position);
          observer.complete();
        },
        error => {
          observer.error(error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }
}
