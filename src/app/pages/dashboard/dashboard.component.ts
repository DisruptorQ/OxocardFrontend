import { Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, delay, interval, map, throwError, catchError } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiService } from '../../services/api.service';
import { SENSOR_NAME_AIRQUALITY, SENSOR_NAME_HUMIDITY, SENSOR_NAME_PRESSURE, SENSOR_NAME_TEMPERATURE } from '../../common/sensor.model';
import { SensorValueCardComponent } from '../../components/molecules/sensor-value-card/sensor-value-card.component';
import { SNACKBAR_OPTIONS } from '../../common/snackbar';

import type { Observable, Unsubscribable } from 'rxjs';
import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import type { SensorDataModel } from '../../models/sensor-data.model';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [AsyncPipe, DecimalPipe, SensorValueCardComponent, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, FormsModule, ReactiveFormsModule],
})
export class DashboardComponent implements OnInit, OnDestroy {

  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  private _latestData$ = new BehaviorSubject<Array<SensorDataModel>>([]);
  private latestData$ = this._latestData$.asObservable();

  private _intervalSubscription?: Unsubscribable;
  private _intervalFormControlSubscription?: Unsubscribable;

  private $refreshInterval?: Observable<number>;

  @ViewChild('intervalSnackbarTemplate')
  intervalSnackbarTemplate?: TemplateRef<unknown>;

  @ViewChild('requestErrorTemplate')
  requestErrorTemplate?: TemplateRef<unknown>;

  loading = true;

  refreshIntervalOptions = [
    5,
    10,
    20,
    30,
    60
  ];

  intervalFormControl = new FormControl<number>(30);

  temperature$ = this.latestData$.pipe(
    map(data => {
      const temperature = data.find(d => d.sensorName === SENSOR_NAME_TEMPERATURE);
      return temperature?.value;
    })
  );

  pressure$ = this.latestData$.pipe(
    map(data => {
      const pressure = data.find(d => d.sensorName === SENSOR_NAME_PRESSURE);
      return pressure?.value;
    })
  );

  humidity$ = this.latestData$.pipe(
    map(data => {
      const humidity = data.find(d => d.sensorName === SENSOR_NAME_HUMIDITY);
      return humidity?.value;
    })
  );

  airQuality$ = this.latestData$.pipe(
    map(data => {
      const airQuality = data.find(d => d.sensorName === SENSOR_NAME_AIRQUALITY);
      if (!airQuality) {
        return;
      }

      return Number(airQuality.value);
    })
  );

  ngOnInit(): void {
    this.loadData();

    this._intervalFormControlSubscription = this.intervalFormControl.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }

      this.startRefreshInterval(value);
    })
  }

  ngOnDestroy(): void {
    this._intervalSubscription?.unsubscribe();
    this._intervalFormControlSubscription?.unsubscribe();
  }

  private startRefreshInterval(seconds: number) {
    this._intervalSubscription?.unsubscribe();
    this.$refreshInterval = interval(seconds * 1000);
    this._intervalSubscription = this.$refreshInterval.subscribe(() => {
      this.loadData();
    });

    if (!this.intervalSnackbarTemplate) {
      return;
    }

    this.snackBar.openFromTemplate(this.intervalSnackbarTemplate, SNACKBAR_OPTIONS);
  }

  private loadData() {
    this.loading = true;
    this.apiService.getLatestDataForAllSensors().pipe(
      delay(1000),
      catchError(err => {
        this.handleRequestError();
        return throwError(() => err);
      })
    ).subscribe(data => {
      this._latestData$.next(data);
      this.loading = false;
    });
  }

  private handleRequestError() {
    if (!this.requestErrorTemplate) {
      return;
    }

    this.snackBar.openFromTemplate(this.requestErrorTemplate, SNACKBAR_OPTIONS);
  }
}
