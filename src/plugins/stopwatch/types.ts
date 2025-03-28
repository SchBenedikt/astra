// Typen für das Stoppuhr-Plugin

/**
 * Status einer einzelnen Stoppuhr
 */
export interface StopwatchState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  laps: number[];
}

/**
 * Argumente für den Stoppuhr-Funktionsaufruf
 */
export interface StopwatchArgs {
  action: 'start' | 'stop' | 'reset' | 'lap';
  label?: string;
}