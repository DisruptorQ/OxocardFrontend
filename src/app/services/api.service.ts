import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, type Observable } from 'rxjs';

import type { DateTime } from 'luxon';
import type { SensorDataModel } from '../models/sensor-data.model';

const ROOT_URL = 'http://192.168.1.104:8000';

// Define the ValuePerHour interface
interface ValuePerHour {
  value: number;
  time_stamp: string;
}

// Define the dictionary type
export type AggregatedData = Record<string, ValuePerHour[]>;

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

  public getAggregatedDataForDay(date: DateTime): Observable<AggregatedData> {
    const isoDate = date.toLocal().toISODate();
    if (!isoDate) {
      return EMPTY;
    }

    return this.httpClient.get<AggregatedData>(`${ROOT_URL}/sensor/data/day/aggregated`, {
      params: {
        day: isoDate
      }
    })
  }
}
