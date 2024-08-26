import type { DateTime } from "luxon";

export interface OpenMeteoWeatherModel {
  temperature: Array<number>;
  relativeHumidity: Array<number>;
  surfacePressure: Array<number>;
  timestamp: Array<DateTime>;
}
