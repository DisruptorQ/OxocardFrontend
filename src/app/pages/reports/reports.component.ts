/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, Renderer2 } from '@angular/core';
import { DateTime } from 'luxon';
import { Chart, registerables } from 'chart.js';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';


import { ApiService } from '../../services/api.service';
import { GeoService } from '../../services/geo.service';
import { WeatherService } from '../../services/weather.service';
import { SENSOR_NAME_AIRQUALITY, SENSOR_NAME_HUMIDITY, SENSOR_NAME_PRESSURE, SENSOR_NAME_TEMPERATURE } from '../../common/sensor.model';

import type { Observable, Unsubscribable } from 'rxjs';
import type { OnDestroy, OnInit } from '@angular/core';

export interface ChartDataModel {
  timestamps: Array<DateTime>
  temperature: Array<number>;
  pressure: Array<number>;
  humidity: Array<number>;
  airQuality: Array<number>;
}

@Component({
  standalone: true,
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  imports: [FormsModule, ReactiveFormsModule, CalendarModule]
})
export class ReportsComponent implements OnInit, OnDestroy {

  private renderer2 = inject(Renderer2);
  private geoService = inject(GeoService);
  private apiService = inject(ApiService);
  private weatherService = inject(WeatherService);

  private chart?: Chart;

  isOxocardData = true;
  dateToday = DateTime.now().startOf('day').toJSDate();
  dateFormControl = new FormControl<Date>(this.dateToday);

  private _chartData$ = new BehaviorSubject<ChartDataModel | null>(null);
  private chartDataSubscription?: Unsubscribable;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.dateFormControl.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }

      this.loadDataForDay(DateTime.fromJSDate(value));
    });

    if (this.dateFormControl.value) {
      this.loadDataForDay(DateTime.fromJSDate(this.dateFormControl.value));
    }

    this.chartDataSubscription = this._chartData$.asObservable().subscribe(data => {
      if (!data) {
        return;
      }

      this.createChartFromModel(data);
    })
  }

  private loadDataForDay(dateTime: DateTime): void {
    this.apiService.getAggregatedDataForDay(dateTime).subscribe({
      next: data => {
        if (data && Object.keys(data).length) {
          const chartDataModel: ChartDataModel = {
            timestamps: data[SENSOR_NAME_TEMPERATURE].map(d => DateTime.fromISO(d.time_stamp)),
            temperature: data[SENSOR_NAME_TEMPERATURE].map(d => d.value),
            pressure: data[SENSOR_NAME_PRESSURE].map(d => d.value),
            humidity: data[SENSOR_NAME_HUMIDITY].map(d => d.value),
            airQuality: data[SENSOR_NAME_AIRQUALITY].map(d => d.value),
          }

          this.isOxocardData = true;
          this._chartData$.next(chartDataModel);
        } else {
          this.loadOpenMeteoWeatherData(dateTime).subscribe({
            next: chartDataModel => {
              this.isOxocardData = false;
              this._chartData$.next(chartDataModel);
            }
          })
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }

  private loadOpenMeteoWeatherData(dateTime: DateTime): Observable<ChartDataModel> {
    return this.geoService.getPosition().pipe(
      switchMap(pos => {
        return this.weatherService.fetchForDayOpenMeteo(dateTime, dateTime, pos.coords.latitude, pos.coords.longitude);
      }),
      map(openMeteoData => {
        return {
          timestamps: openMeteoData.timestamp,
          temperature: openMeteoData.temperature,
          pressure: openMeteoData.surfacePressure,
          humidity: openMeteoData.relativeHumidity,
          airQuality: openMeteoData.timestamp.map(() => 1)
        } as ChartDataModel;
      })
    );
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chartDataSubscription?.unsubscribe();
  }

  private createChartFromModel(chartDataModel: ChartDataModel) {
    const element = this.renderer2.selectRootElement('#multiAxisChart');
    if (!element) {
      return;
    }

    const renderingContext = (element as HTMLCanvasElement).getContext('2d');
    if (!renderingContext) {
      return;
    }

    const minTemperature = Math.min(...chartDataModel.temperature);
    const maxTemperature = Math.max(...chartDataModel.temperature);

    const chartData: Chart['data'] = {
      labels: chartDataModel.timestamps.map(time => time.toFormat('HH:mm')), // Example labels for time intervals
      datasets: [{
        order: 1,
        label: 'Temperature (°C)',
        data: chartDataModel.temperature,
        borderColor: '#a8385d',
        yAxisID: 'y1',
      },
      {
        order: 2,
        label: 'Pressure (mbar)',
        data: chartDataModel.pressure,
        borderColor: '#7aa3e5',
        yAxisID: 'y2',
      },
      {
        order: 3,
        label: 'Humidity (%)',
        data: chartDataModel.humidity,
        borderColor: '#a27ea8',
        yAxisID: 'y3',
      },
      {
        order: 4,
        label: 'Air Quality (AQI)',
        data: chartDataModel.airQuality,
        borderColor: '#adcded',
        yAxisID: 'y4'
      }]
    };

    const chartOptions: Chart['options'] = {
      scales: {
        y1: {
          type: 'linear',
          display: true,
          position: 'left',
          // Flatten the curve a bit
          min: Math.floor(minTemperature - 10),
          max: Math.ceil(maxTemperature + 10),
          grid: {
            display: false
          }
        },
        y2: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            display: false
          }
        },
        y3: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            display: false
          },
          // Ensure this axis is a bit further away from the second axis
          ticks: {
            align: 'start'
          },
          min: 0,
          max: 100
        },
        y4: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 1,
          max: 5,
          beginAtZero: false,
          reverse: true,
          // Ensure this axis is a bit further away from the second axis
          ticks: {
            align: 'start'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        tooltip: {
          mode: 'point'
        }
      }
    };

    if (!this.chart) {
      this.chart = new Chart(renderingContext, {
        type: 'line',
        data: chartData,
        options: chartOptions
      });
    } else {
      this.chart.data = chartData;
      this.chart.options = chartOptions;
      this.chart.update();
    }
  }
}
