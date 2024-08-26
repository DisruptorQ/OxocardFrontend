import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { fetchWeatherApi } from 'openmeteo';
import { DateTime } from 'luxon';

import type { Observable } from 'rxjs';
import type { OpenMeteoWeatherModel } from '../common/openmeteo-weather.model';

const GRENCHEN_CORDS_LAT = 47.1921;
const GRENCHEN_CORDS_LON = 7.3959;

const WEATHER_API_ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  public fetchForDayOpenMeteo(start: DateTime, end: DateTime, latitude?: number, longitude?: number): Observable<OpenMeteoWeatherModel> {
    const params = {
      "latitude": GRENCHEN_CORDS_LAT,
      "longitude": GRENCHEN_CORDS_LON,
      "start_date": start.toISODate(),
      "end_date": end.toISODate(),
      "timezone": "Europe/Zurich",
      "hourly": ["temperature_2m", "relative_humidity_2m", "surface_pressure"],
    }

    return from(fetchWeatherApi(WEATHER_API_ARCHIVE_URL, params)).pipe(
      map(response => {
        const data = response[0];

        // Does not seem to work correctly. If we add this to the received time, we get UTC + 2, but the data returned appears to be in local time already
        // const utcOffsetSeconds = data.utcOffsetSeconds();

        const timezone = data.timezone();
        const hourly = data.hourly()!;

        const weatherModel: OpenMeteoWeatherModel = {
          timestamp: this.createRange(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
            (t) => {
              return DateTime.fromSeconds(t, {
                zone: timezone || 'Europe/Zurich'
              });
            }),
          temperature: [...hourly.variables(0)!.valuesArray()!].map(v => Number(v.toFixed(1))),
          relativeHumidity: [...hourly.variables(1)!.valuesArray()!].map(v => Number(Math.round(v))),
          surfacePressure: [...hourly.variables(2)!.valuesArray()!].map(v => Number(v.toFixed(1))),
        }

        return weatherModel;
      })
    );
  }

  private createRange(start: number, stop: number, step: number) {
    return Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
  }
}
