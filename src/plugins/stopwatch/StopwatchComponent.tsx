import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { PluginComponentProps, PluginHandle } from '../../components/altair/plugins/PluginRegistry';
import { StopwatchArgs, StopwatchState } from './types';

/**
 * Stoppuhr-Komponente, die Start, Stopp, Reset und Runden-Funktionalität bietet
 */
const StopwatchComponent = forwardRef<PluginHandle, PluginComponentProps>(({ isEnabled }, ref) => {
  // Stoppuhr-Zustand mit Unterstützung für mehrere benannte Stoppuhren
  const [stopwatches, setStopwatches] = useState<{[key: string]: StopwatchState}>({
    default: {
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      laps: []
    }
  });

  // Referenz für das Interval zum Aktualisieren der Stoppuhr
  const intervalRef = useRef<number | null>(null);
  
  // Stoppuhr starten
  const startStopwatch = (label: string = 'default') => {
    setStopwatches(prev => {
      const watch = prev[label] || {
        isRunning: false,
        startTime: null,
        elapsedTime: 0,
        laps: []
      };
      
      return {
        ...prev,
        [label]: {
          ...watch,
          isRunning: true,
          startTime: Date.now() - watch.elapsedTime
        }
      };
    });
  };
  
  // Stoppuhr anhalten
  const stopStopwatch = (label: string = 'default') => {
    setStopwatches(prev => {
      const watch = prev[label];
      if (!watch) return prev;

      return {
        ...prev,
        [label]: {
          ...watch,
          isRunning: false,
          elapsedTime: watch.startTime ? Date.now() - watch.startTime : watch.elapsedTime
        }
      };
    });
  };
  
  // Stoppuhr zurücksetzen
  const resetStopwatch = (label: string = 'default') => {
    setStopwatches(prev => {
      const watch = prev[label];
      if (!watch) return prev;

      return {
        ...prev,
        [label]: {
          ...watch,
          isRunning: false,
          startTime: null,
          elapsedTime: 0,
          laps: []
        }
      };
    });
  };
  
  // Runde/Zwischenzeit erfassen
  const lapStopwatch = (label: string = 'default') => {
    setStopwatches(prev => {
      const watch = prev[label];
      if (!watch) return prev;
      
      const currentTime = watch.startTime ? Date.now() - watch.startTime : watch.elapsedTime;
      
      return {
        ...prev,
        [label]: {
          ...watch,
          laps: [...watch.laps, currentTime]
        }
      };
    });
  };

  // Handlers für die AI Tool Calls
  useImperativeHandle(ref, () => ({
    handleToolCall: (fc: any) => {
      if (fc.name === 'stopwatch' && isEnabled) {
        try {
          const args = fc.args as StopwatchArgs;
          const label = args.label || 'default';
          
          console.log(`StopwatchPlugin received tool call: ${args.action}, label: ${label}`);
          
          switch (args.action) {
            case 'start':
              startStopwatch(label);
              break;
            case 'stop':
              stopStopwatch(label);
              break;
            case 'reset':
              resetStopwatch(label);
              break;
            case 'lap':
              lapStopwatch(label);
              break;
            default:
              console.error('Unbekannte Aktion:', args.action);
          }
        } catch (e) {
          console.error("Fehler beim Verarbeiten des Stoppuhr-Befehls:", e);
        }
      }
    }
  }));

  // Update aktiver Stoppuhren in einem Interval
  useEffect(() => {
    const hasRunningStopwatch = Object.values(stopwatches).some(watch => watch.isRunning);
    
    if (hasRunningStopwatch && !intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        setStopwatches(prev => {
          const updated = { ...prev };
          let hasChanges = false;
          
          Object.entries(updated).forEach(([key, watch]) => {
            if (watch.isRunning && watch.startTime) {
              updated[key] = {
                ...watch,
                elapsedTime: Date.now() - watch.startTime
              };
              hasChanges = true;
            }
          });
          
          return hasChanges ? updated : prev;
        });
      }, 10); // Update alle 10ms für eine flüssige Anzeige
    } else if (!hasRunningStopwatch && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Cleanup beim Unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stopwatches]);

  // Zeit in Millisekunden formatieren zu mm:ss.ms
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  // Prüfe, ob mindestens eine Stoppuhr aktiv ist oder sichtbar sein sollte
  const shouldShowStopwatch = Object.values(stopwatches).some(
    watch => watch.isRunning || watch.elapsedTime > 0 || watch.laps.length > 0
  );
  
  // Gib leere Komponente zurück, wenn deaktiviert oder keine aktiven Stoppuhren
  if (!isEnabled || !shouldShowStopwatch) return null;
  
  // Benutzeroberfläche der Stoppuhr
  return (
    <div className="stopwatch-container" style={{ 
      marginTop: '15px',
      padding: '15px',
      backgroundColor: 'rgba(40, 40, 80, 0.6)',
      borderRadius: '8px',
      border: '1px solid rgba(100, 149, 237, 0.3)'
    }}>
      <div style={{
        color: '#b8e6ff',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '10px',
        paddingBottom: '3px',
        borderBottom: '1px solid rgba(184, 230, 255, 0.3)'
      }}>
        Stoppuhr
      </div>

      {Object.entries(stopwatches).map(([label, watch]) => {
        // Prüfe, ob diese spezifische Stoppuhr angezeigt werden soll
        if (!watch.isRunning && watch.elapsedTime === 0 && watch.laps.length === 0) {
          return null;
        }

        return (
          <div key={label} style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '15px'
          }}>
            {label !== 'default' && (
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#ddd'
              }}>
                {label}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Stoppuhr-Anzeige */}
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: watch.isRunning ? '#64b5f6' : '#e1e2e3',
                textAlign: 'center'
              }}>
                {formatTime(watch.elapsedTime)}
              </div>
              
              {/* Steuerungsbuttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => watch.isRunning ? stopStopwatch(label) : startStopwatch(label)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    backgroundColor: watch.isRunning ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {watch.isRunning ? 'Stop' : 'Start'}
                </button>

                <button
                  onClick={() => lapStopwatch(label)}
                  disabled={!watch.isRunning}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    backgroundColor: watch.isRunning ? 'rgba(33, 150, 243, 0.7)' : 'rgba(33, 150, 243, 0.3)',
                    border: 'none',
                    color: 'white',
                    cursor: watch.isRunning ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    opacity: watch.isRunning ? 1 : 0.6,
                  }}
                >
                  Lap
                </button>

                <button
                  onClick={() => resetStopwatch(label)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(97, 97, 97, 0.7)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  Reset
                </button>
              </div>
              
              {/* Runden-Liste */}
              {watch.laps.length > 0 && (
                <div style={{
                  marginTop: '10px',
                  borderTop: '1px solid rgba(184, 230, 255, 0.2)',
                  paddingTop: '10px'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#b8e6ff',
                    marginBottom: '5px'
                  }}>
                    Runden
                  </div>
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {watch.laps.map((lapTime, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.9rem'
                      }}>
                        <span>Runde {index + 1}</span>
                        <span style={{ fontFamily: 'monospace' }}>
                          {formatTime(lapTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default StopwatchComponent;