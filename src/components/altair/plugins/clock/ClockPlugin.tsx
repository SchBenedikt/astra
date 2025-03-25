import React, { forwardRef, useImperativeHandle, useState } from "react";
import { PluginComponentProps, PluginHandle } from '../PluginRegistry';
import { getCurrentTime, clockDeclaration } from "../../../../plugins/clock";

export { clockDeclaration };

export const ClockPlugin = forwardRef<PluginHandle, PluginComponentProps>(({ isEnabled }, ref) => {
  const [lastQuery, setLastQuery] = useState<{ format?: string; timezone?: string } | null>(null);
  const [showClock, setShowClock] = useState(false);

  // Handler für Tool-Aufrufe
  const handleToolCall = (fc: any) => {
    if (fc.name === clockDeclaration.name && isEnabled) {
      const { format, timezone } = fc.args || {};
      setLastQuery({ format, timezone });
      setShowClock(true);
      
      // Aktuelle Zeit abrufen
      return getCurrentTime(format, timezone);
    }
  };

  // Plugin-Funktionen nach außen verfügbar machen
  useImperativeHandle(ref, () => ({
    handleToolCall
  }));

  // Wenn das Plugin nicht aktiviert ist, nichts anzeigen
  if (!isEnabled || !showClock) {
    return null;
  }

  // Stile für die Anzeige
  const styles = {
    container: {
      backgroundColor: 'rgba(30, 30, 30, 0.7)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '10px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    header: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: '10px'
    },
    title: {
      fontSize: '16px',
      fontWeight: 'bold' as const,
      color: '#b8e6ff'
    },
    time: {
      fontSize: '1.5rem',
      textAlign: 'center' as const,
      margin: '10px 0',
      color: '#e1e2e3'
    },
    date: {
      fontSize: '1rem',
      textAlign: 'center' as const,
      margin: '5px 0',
      color: '#b8e6ff'
    },
    timezone: {
      fontSize: '0.8rem',
      textAlign: 'center' as const,
      color: '#a0a0a0',
      marginTop: '5px'
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      color: '#b8e6ff',
      cursor: 'pointer'
    }
  };

  // Aktuelle Zeit basierend auf dem letzten Query abrufen
  const currentTime = getCurrentTime(lastQuery?.format, lastQuery?.timezone);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🕒 Uhrzeit</div>
        <button 
          style={styles.closeButton}
          onClick={() => setShowClock(false)}
        >
          ✕
        </button>
      </div>
      
      <div style={styles.time}>{currentTime.time}</div>
      <div style={styles.date}>{currentTime.date}</div>
      <div style={styles.timezone}>Zeitzone: {currentTime.timezone}</div>
    </div>
  );
});

export default ClockPlugin;