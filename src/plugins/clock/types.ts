export interface ClockSettings {
  format: string;
  timezone?: string;
}

export interface ClockState {
  currentTime: string;
  currentDate: string;
  timezone: string;
}