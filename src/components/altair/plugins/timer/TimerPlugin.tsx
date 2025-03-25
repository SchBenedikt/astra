import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { PluginComponentProps, PluginHandle } from '../PluginRegistry';

// Timer-Typen
export interface Timer {
  id: string;
  label: string;
  durationSeconds: number;
  startTime: number;
  remainingSeconds: number;
  isActive: boolean;
}

// Timer Tool Deklaration
export const timerDeclaration: FunctionDeclaration = {
  name: "start_timer",
  description: "Starts a countdown timer for a specified number of seconds.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      seconds: {
        type: SchemaType.INTEGER,
        description: "Duration of the timer in seconds. Maximum allowed is 3600 (1 hour).",
      },
      label: {
        type: SchemaType.STRING,
        description: "Optional label for the timer. Default is 'Timer'.",
      },
    },
    required: ["seconds"],
  },
};

// Use forwardRef and useImperativeHandle to expose methods to parent component
export const TimerPlugin = forwardRef<PluginHandle, PluginComponentProps>(({ isEnabled }, ref) => {
  const [activeTimers, setActiveTimers] = useState<Timer[]>([]);
  const timerSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerRingIntervalRef = useRef<number | null>(null);

  // Expose the handleToolCall method to parent components
  useImperativeHandle(ref, () => ({
    handleToolCall: (fc: any) => {
      if (fc.name === timerDeclaration.name && isEnabled) {
        try {
          const seconds = Number(fc.args.seconds);
          const label = fc.args.label || "Timer";
          
          console.log(`TimerPlugin received tool call: ${seconds} seconds, label: ${label}`);
          
          if (isNaN(seconds) || seconds <= 0 || seconds > 3600) {
            console.error("Invalid timer duration", seconds);
            return;
          }
          
          // Create new timer
          const newTimer: Timer = {
            id: Date.now().toString(),
            label,
            durationSeconds: seconds,
            startTime: Date.now(),
            remainingSeconds: seconds,
            isActive: true
          };
          
          // Add timer to list
          setActiveTimers(prev => [...prev, newTimer]);
          console.log(`Timer started: ${label}, ${seconds} seconds`);
        } catch (e) {
          console.error("Error processing timer tool call:", e);
        }
      }
    }
  }));

  // Timer Sound beim ersten Rendern erstellen
  useEffect(() => {
    // Lauterer, klarerer Alarm-Sound für Timer-Ende
    timerSoundRef.current = new Audio("data:audio/wav;base64,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");
    
    // Event-Listener für Timer-Updates hinzufügen
    const timerInterval = setInterval(() => {
      setActiveTimers(prevTimers => {
        if (prevTimers.length === 0) return prevTimers;
        
        const updatedTimers = prevTimers.map(timer => {
          if (!timer.isActive) return timer;
          
          const elapsedSeconds = Math.floor((Date.now() - timer.startTime) / 1000);
          const newRemainingSeconds = Math.max(0, timer.durationSeconds - elapsedSeconds);
          
          // Wenn der Timer gerade abgelaufen ist, Alarm auslösen
          if (newRemainingSeconds === 0 && timer.remainingSeconds > 0) {
            playAlarmSound();
          }
          
          return {
            ...timer,
            remainingSeconds: newRemainingSeconds,
            isActive: newRemainingSeconds > 0
          };
        });
        
        return updatedTimers;
      });
    }, 1000);
    
    return () => {
      clearInterval(timerInterval);
      if (timerRingIntervalRef.current !== null) {
        clearInterval(timerRingIntervalRef.current);
      }
    };
  }, []);

  // Funktion zum Abspielen des Alarm-Sounds mit Wiederholungen
  const playAlarmSound = () => {
    // Bestehenden Alarm-Interval löschen, falls vorhanden
    if (timerRingIntervalRef.current !== null) {
      clearInterval(timerRingIntervalRef.current);
    }
    
    // Sound sofort abspielen
    if (timerSoundRef.current) {
      timerSoundRef.current.currentTime = 0;
      timerSoundRef.current.play().catch(e => console.log("Sound play error:", e));
    }
    
    // Sound mehrmals wiederholen (3 Mal im Abstand von 1 Sekunde)
    let ringCount = 0;
    timerRingIntervalRef.current = window.setInterval(() => {
      ringCount++;
      if (ringCount >= 3) {
        clearInterval(timerRingIntervalRef.current as number);
        timerRingIntervalRef.current = null;
        return;
      }
      
      if (timerSoundRef.current) {
        timerSoundRef.current.currentTime = 0;
        timerSoundRef.current.play().catch(e => console.log("Sound play error:", e));
      }
    }, 1000);
  };

  // Hilfsfunktion zum Formatieren der Timer-Zeit
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer-Fortschritt in Prozent
  const getTimerProgress = (timer: Timer) => {
    return ((timer.durationSeconds - timer.remainingSeconds) / timer.durationSeconds) * 100;
  };

  // Aktive Timer filtern
  const timersToShow = activeTimers.filter(timer => timer.isActive || 
    (Date.now() - timer.startTime < 5000 && timer.remainingSeconds === 0)); // Zeige abgelaufene Timer für 5 Sekunden

  // Don't render anything if disabled or no timers to show
  if (!isEnabled) return null;

  const styles = {
    sectionTitle: {
      color: '#b8e6ff',
      fontSize: '0.9rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginTop: '15px',
      marginBottom: '5px',
      paddingBottom: '3px',
      borderBottom: '1px solid rgba(184, 230, 255, 0.3)'
    },
    timersContainer: {
      marginTop: '15px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    timerItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: 'rgba(40, 40, 80, 0.6)',
      borderRadius: '6px',
      border: '1px solid rgba(100, 149, 237, 0.3)'
    },
    timerIcon: {
      fontSize: '1.3rem',
      marginRight: '10px',
      color: '#b8e6ff'
    },
    timerLabel: {
      flex: 1,
      fontWeight: 'bold',
      color: '#e1e2e3'
    },
    timerTime: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#b8e6ff'
    },
    timerProgress: {
      flex: 2,
      height: '8px',
      margin: '0 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '4px',
      overflow: 'hidden'
    },
  };

  return (
    <>
      {timersToShow.length > 0 && (
        <>
          <div style={{
            color: '#b8e6ff',
            fontSize: '0.9rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            marginTop: '15px',
            marginBottom: '5px',
            paddingBottom: '3px',
            borderBottom: '1px solid rgba(184, 230, 255, 0.3)'
          }}>Aktive Timer</div>
          <div style={{
            marginTop: '15px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '8px',
          }}>
            {timersToShow.map((timer) => (
              <div 
                key={timer.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: timer.remainingSeconds === 0 ? 'rgba(76, 175, 80, 0.7)' : 'rgba(40, 40, 80, 0.6)',
                  borderRadius: '6px',
                  border: '1px solid rgba(100, 149, 237, 0.3)',
                  animation: timer.remainingSeconds === 0 ? 'pulse 1s infinite' : 'none'
                }}
              >
                <span style={{
                  fontSize: '1.3rem',
                  marginRight: '10px',
                  color: '#b8e6ff'
                }}>⏱️</span>
                <span style={{
                  flex: 1,
                  fontWeight: 'bold',
                  color: '#e1e2e3'
                }}>{timer.label}</span>
                <div style={{
                  flex: 2,
                  height: '8px',
                  margin: '0 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      width: `${getTimerProgress(timer)}%`,
                      height: '100%',
                      backgroundColor: timer.remainingSeconds === 0 ? '#4caf50' : '#64b5f6',
                      borderRadius: '4px',
                      transition: 'width 1s linear'
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: timer.remainingSeconds === 0 ? '#4caf50' : '#b8e6ff'
                }}>
                  {timer.remainingSeconds === 0 ? 'Fertig!' : formatTime(timer.remainingSeconds)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
});

export default TimerPlugin;
