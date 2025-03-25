import React, { useState, useEffect } from 'react';
import { ClockSettings, ClockState } from './types';

// Standard-Zeitformate
const DEFAULT_FORMAT = '24h'; // Alternativen: '12h'
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface ClockComponentProps {
  settings?: ClockSettings;
}

// Formatierungsfunktionen
const formatTime = (date: Date, format: string): string => {
  if (format === '12h') {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  }
  // Standard: 24h Format
  return date.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ClockComponent: React.FC<ClockComponentProps> = ({ settings }) => {
  const [clockState, setClockState] = useState<ClockState>({
    currentTime: '',
    currentDate: '',
    timezone: settings?.timezone || DEFAULT_TIMEZONE
  });
  
  useEffect(() => {
    // Uhrzeit bei Komponentenmontage aktualisieren
    updateTime();
    
    // Timer für die Aktualisierung erstellen (jede Sekunde)
    const timerId = setInterval(() => {
      updateTime();
    }, 1000);
    
    // Timer aufräumen, wenn die Komponente entfernt wird
    return () => clearInterval(timerId);
  }, [settings]);
  
  // Aktualisiert die Uhrzeit je nach den gewählten Einstellungen
  const updateTime = () => {
    const now = new Date();
    
    setClockState({
      currentTime: formatTime(now, settings?.format || DEFAULT_FORMAT),
      currentDate: formatDate(now),
      timezone: settings?.timezone || DEFAULT_TIMEZONE
    });
  };
  
  // Stil für die Uhr-Komponente
  const styles = {
    container: {
      textAlign: 'center' as const,
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      width: '100%',
      color: '#e1e2e3',
    },
    time: {
      fontSize: '2rem',
      fontWeight: 'bold' as const,
      margin: '5px 0',
      color: '#b8e6ff',
    },
    date: {
      fontSize: '1.2rem',
      margin: '5px 0',
    },
    timezone: {
      fontSize: '0.9rem',
      color: '#b8e6ff',
      opacity: 0.7,
      marginTop: '5px',
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.time}>{clockState.currentTime}</div>
      <div style={styles.date}>{clockState.currentDate}</div>
      <div style={styles.timezone}>Zeitzone: {clockState.timezone}</div>
    </div>
  );
};

export default ClockComponent;