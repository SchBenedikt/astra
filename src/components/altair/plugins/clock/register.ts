// clock/register.ts
import { Plugin } from '../PluginRegistry';
import { ClockPlugin, clockDeclaration } from './ClockPlugin';

// Plugin-Definition in eigenständiger Datei
export const clockPlugin: Plugin = {
  component: ClockPlugin,
  declaration: clockDeclaration,
  id: 'clock',
  name: 'Clock Plugin',
  description: 'Display current time',
  version: '1.0.0',
  author: 'Default'
};

export default clockPlugin;