import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import ClockComponent from './ClockComponent';

// Die ToolCall-Deklaration für das Clock-Plugin
export const clockDeclaration: FunctionDeclaration = {
  name: "get_current_time",
  description: "Gibt die aktuelle Uhrzeit, das Datum und die Zeitzone zurück.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      format: {
        type: SchemaType.STRING,
        description: "Format für die Zeitangabe ('12h' oder '24h')",
        enum: ['12h', '24h']
      },
      timezone: {
        type: SchemaType.STRING,
        description: "Gewünschte Zeitzone (z.B. 'Europe/Berlin', 'America/New_York'). Wenn nicht angegeben, wird die lokale Zeitzone verwendet.",
      }
    }
  }
};

// Funktion, die die aktuelle Zeit zurückgibt
export const getCurrentTime = (format: string = '24h', timezone?: string) => {
  const now = new Date();
  
  // Zeitzonenoption
  let timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: format === '12h',
  };
  
  // Datesoption
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  // Füge Zeitzone hinzu, wenn angegeben
  if (timezone) {
    timeOptions.timeZone = timezone;
    dateOptions.timeZone = timezone;
  }
  
  // Aktuelle Zeitzone ermitteln
  const currentTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Formatierte Werte zurückgeben
  return {
    time: now.toLocaleTimeString('de-DE', timeOptions),
    date: now.toLocaleDateString('de-DE', dateOptions),
    timezone: currentTimezone,
    timestamp: now.getTime()
  };
};

export { ClockComponent };
export * from './types';

// README für das Plugin
const README = `
# Clock Plugin

Ein Plugin, das der KI Zugriff auf die aktuelle Uhrzeit ermöglicht.

## Beschreibung

Das Clock-Plugin ermöglicht dem Gemini-Assistenten, die aktuelle Zeit und das Datum abzufragen.
Es unterstützt verschiedene Zeitzonen und Zeitformate (12h/24h).

## Verwendung

Der Assistent kann die \`get_current_time\`-Funktion aufrufen, um die aktuelle Zeit abzurufen.
Beispielanfrage: "Welche Uhrzeit ist es jetzt?"
`;

export default README;