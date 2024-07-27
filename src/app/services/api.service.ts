import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type { SensorDataModel } from '../models/sensor-data.model';
import type { Observable } from 'rxjs';

const ROOT_URL = 'http://192.168.1.104:8000';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private httpClient = inject(HttpClient);

  public loadCurrentSensorData(sensorName: string): Observable<SensorDataModel> {
    return this.httpClient.get<SensorDataModel>(`${ROOT_URL}/sensor/data/current`, {
      params: {
        sensor_name: sensorName
      }
    });
  }

  public getLatestDataForAllSensors(): Observable<Array<SensorDataModel>> {
    return this.httpClient.get<Array<SensorDataModel>>(`${ROOT_URL}/sensor/data/current`);
  }
}
