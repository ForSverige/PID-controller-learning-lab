
import { SetpointProfile, SimulationResult } from '../types';

const clip = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const simulateSystem = (
  Kp: number,
  Ki: number,
  Kd: number,
  setpointProfile: SetpointProfile,
  initial: number,
  duration: number
): SimulationResult => {
  const dt = 0.05;
  const steps = Math.floor(duration / dt);
  const t = Array.from({ length: steps }, (_, i) => i * dt);

  // Plant parameters
  const wn = 0.8;
  const zeta = 0.15;
  const Kp_process = 0.75;

  let y = initial;
  let y_dot = 0;
  let integral = 0;
  let prev_error = 0;

  const temps: number[] = [];
  const controls: number[] = [];
  const errors: number[] = [];
  const setpoints: number[] = [];

  for (let i = 0; i < steps; i++) {
    const setpoint = setpointProfile(t[i]);
    setpoints.push(setpoint);

    const error = setpoint - y;
    integral += error * dt;
    const derivative = i > 0 ? (error - prev_error) / dt : 0;

    const u = Kp * error + Ki * integral + Kd * derivative;
    const clipped_u = clip(u, -100, 100);

    const y_ddot = Kp_process * (wn ** 2) * clipped_u - 2 * zeta * wn * y_dot - (wn ** 2) * y;

    y_dot += y_ddot * dt;
    y += y_dot * dt;

    temps.push(y);
    controls.push(clipped_u);
    errors.push(error);
    prev_error = error;
  }

  return { t, temp: temps, control: controls, error: errors, setpoint: setpoints };
};

export const simulateBaseline = (
  setpointProfile: SetpointProfile,
  initial: number,
  duration: number
): Omit<SimulationResult, 'error'> => {
  const dt = 0.05;
  const steps = Math.floor(duration / dt);
  const t = Array.from({ length: steps }, (_, i) => i * dt);

  const wn = 0.8;
  const zeta = 0.15;
  const Kp_process = 0.75;

  let y = initial;
  let y_dot = 0;
  const temps: number[] = [];
  const controls: number[] = [];
  const setpoints: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    const setpoint = setpointProfile(t[i]);
    setpoints.push(setpoint);

    let u = 0;
    if (y < setpoint - 1.5) {
      u = 50;
    } else if (y > setpoint + 1.5) {
      u = -20;
    }

    const y_ddot = Kp_process * (wn ** 2) * u - 2 * zeta * wn * y_dot - (wn ** 2) * y;
    y_dot += y_ddot * dt;
    y += y_dot * dt;
    
    temps.push(y);
    controls.push(u);
  }

  return { t, temp: temps, control: controls, setpoint: setpoints };
};
