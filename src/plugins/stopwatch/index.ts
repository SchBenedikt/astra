import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import StopwatchComponent from './StopwatchComponent';
import { Plugin } from '../../components/altair/plugins/PluginRegistry';

/**
 * Funktionsdeklaration für die KI, um die Stoppuhr zu steuern
 */
export const stopwatchDeclaration: FunctionDeclaration = {
  name: "stopwatch",
  description: "Steuert eine Stoppuhr zum Messen von Zeiten mit Start, Stopp, Runden und Zurücksetzen.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: {
        type: SchemaType.STRING,
        description: "Die auszuführende Aktion: 'start' zum Starten, 'stop' zum Anhalten, 'lap' für eine neue Runde, oder 'reset' zum Zurücksetzen.",
        enum: ["start", "stop", "reset", "lap"]
      },
      label: {
        type: SchemaType.STRING,
        description: "Optionale Bezeichnung für die Stoppuhr, falls mehrere gleichzeitig laufen sollen."
      }
    },
    required: ["action"],
  }
};

/**
 * Plugin-Definition, die von der PluginRegistry beim dynamischen Laden verwendet wird
 */
const stopwatchPlugin: Plugin = {
  component: StopwatchComponent,
  declaration: stopwatchDeclaration,
  id: 'stopwatch',
  name: 'Stoppuhr',
  description: 'Stoppuhr mit Rundenzählung und mehreren Instanzen',
  version: '1.0.0',
  author: 'GitHub Copilot'
};

export default stopwatchPlugin;