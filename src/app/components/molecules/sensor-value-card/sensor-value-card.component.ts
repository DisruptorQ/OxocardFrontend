import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-sensor-value-card',
  templateUrl: './sensor-value-card.component.html',
  styleUrl: './sensor-value-card.component.scss',
  imports: [],
})
export class SensorValueCardComponent {

  @Input()
  name?: string;

}
