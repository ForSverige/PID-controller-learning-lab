
export interface SimulationResult {
  t: number[];
  temp: number[];
  control: number[];
  error: number[];
  setpoint: number[];
}

export type SetpointProfile = (t: number) => number;
