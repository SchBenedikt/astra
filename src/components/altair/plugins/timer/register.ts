// timer/register.ts
import { Plugin } from '../PluginRegistry';
import { TimerPlugin, timerDeclaration } from './TimerPlugin';

// Plugin-Definition in eigenständiger Datei
export const timerPlugin: Plugin = {
  component: TimerPlugin,
  declaration: timerDeclaration,
  id: 'timer',
  name: 'Timer Plugin',
  description: 'Create countdown timers',
  version: '1.0.0',
  author: 'Default'
};

export default timerPlugin;