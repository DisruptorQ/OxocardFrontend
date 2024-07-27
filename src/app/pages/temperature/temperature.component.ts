import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { tap } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { SENSOR_NAME_TEMPERATURE } from '../../common/sensor.model';

import type { OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrl: './temperature.component.scss',
  imports: [AsyncPipe]
})
export class TemperatureComponent implements OnInit {

  private apiService = inject(ApiService);

  currentTemp$ = this.apiService.loadCurrentSensorData(SENSOR_NAME_TEMPERATURE).pipe(
    tap(data => {
      console.log(data)
    })
  );

  ngOnInit(): void {
    console.log('init');
  }
}
