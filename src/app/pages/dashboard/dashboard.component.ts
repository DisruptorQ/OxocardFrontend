import { Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, delay, interval, map, throwError, catchError } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ApiService } from '../../services/api.service';
import { SENSOR_NAME_AIRQUALITY, SENSOR_NAME_HUMIDITY, SENSOR_NAME_PRESSURE, SENSOR_NAME_TEMPERATURE } from '../../common/sensor.model';
import { SensorValueCardComponent } from '../../components/molecules/sensor-value-card/sensor-value-card.component';

import type { Observable, Unsubscribable } from 'rxjs';
import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import type { SensorDataModel } from '../../models/sensor-data.model';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MessageService],
  imports: [FormsModule, ReactiveFormsModule, DropdownModule, ProgressSpinnerModule,
    ToastModule, AsyncPipe, DecimalPipe, SensorValueCardComponent],
})
export class DashboardComponent implements OnInit, OnDestroy {

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);

  private _latestData$ = new BehaviorSubject<Array<SensorDataModel>>([]);
  private latestData$ = this._latestData$.asObservable();

  private _intervalSubscription?: Unsubscribable;
  private _intervalFormControlSubscription?: Unsubscribable;

  private $refreshInterval?: Observable<number>;

  @ViewChild('intervalSnackbarTemplate')
  intervalSnackbarTemplate?: TemplateRef<unknown>;

  @ViewChild('requestErrorTemplate')
  requestErrorTemplate?: TemplateRef<unknown>;

  @ViewChild('dataRefreshedTemplate')
  dataRefreshedTemplate?: TemplateRef<unknown>;

  loading = true;

  refreshIntervalOptions: Array<unknown> = [
    {
      optionlabel: '5 Sekunden',
      optionValue: 5
    },
    {
      optionlabel: '10 Sekunden',
      optionValue: 10
    },
    {
      optionlabel: '20 Sekunden',
      optionValue: 20
    },
    {
      optionlabel: '30 Sekunden',
      optionValue: 30
    }, {
      optionlabel: '60 Sekunden',
      optionValue: 60
    }
  ];

  intervalFormControl = new FormControl<number>(30);

  measureTimestamp$ = this.latestData$.pipe(
    map(data => {
      return DateTime.fromISO(data[0].timeStamp).setLocale('de').toFormat('dd LLL yyyy HH:mm');
    })
  );

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
    });

    this.startRefreshInterval(this.intervalFormControl.value ?? 30);
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

    this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Intervall aktualisiert.' });
  }

  private loadData() {
    this.apiService.getLatestDataForAllSensors().pipe(
      delay(1000),
      catchError(err => {
        this.handleRequestError();
        return throwError(() => err);
      })
    ).subscribe(data => {
      this._latestData$.next(data);
      this.loading = false;

      this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Daten aktualisiert.' });
    });
  }

  private handleRequestError() {
    if (!this.requestErrorTemplate) {
      return;
    }

    this.messageService.clear();
    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim laden der Daten!' });
  }
}
