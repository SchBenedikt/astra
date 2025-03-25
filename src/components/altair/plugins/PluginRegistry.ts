// Plugin Registry to manage all available plugins
import { FunctionDeclaration } from '@google/generative-ai';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

// Import plugins from their register files
import timerPlugin from './timer/register';
import todoPlugin from './todo/register';
import openWebsitePlugin from './OpenWebsitePlugin/register';
import clockPlugin from './clock/register';

// Define the plugin component interface
export interface PluginComponentProps {
  isEnabled: boolean;
}

// Define the interface for plugin handle
export interface PluginHandle {
  handleToolCall: (fc: any) => void;
}

// Define a clear interface for plugins with proper typing for forwardRef components
export interface Plugin {
  component: ForwardRefExoticComponent<PluginComponentProps & RefAttributes<PluginHandle>>;
  declaration: FunctionDeclaration;
  id: string; // Unique identifier for the plugin
  name: string; // Display name for the plugin
  description?: string; // Optional description
  version?: string; // Optional version
  author?: string; // Optional author
}

// Static list of built-in plugins - diese würden in einer realen Implementierung auch dynamisch geladen
// und würden nicht direkt hier importiert werden
export const builtInPlugins: Record<string, Plugin> = {};

// Plugins aus ihren jeweiligen register.ts-Dateien hinzufügen
builtInPlugins['timer'] = timerPlugin;
builtInPlugins['todo'] = todoPlugin;
builtInPlugins['openWebsite'] = openWebsitePlugin;
builtInPlugins['clock'] = clockPlugin;

// Versuche, das Stoppuhr-Plugin zu laden, falls es existiert
// Diese Methode würde in einer echten Implementierung Teil des automatischen Plugin-Discovery sein
try {
  const stopwatchPlugin = require('../../../plugins/stopwatch').default;
  if (stopwatchPlugin) {
    builtInPlugins['stopwatch'] = stopwatchPlugin;
  }
} catch (e) {
  console.log('Stopwatch plugin not available:', e);
}

// Dynamic registry that can be updated at runtime
let dynamicPlugins: Record<string, Plugin> = {};

// Combined plugins (built-in + dynamic)
export const availablePlugins: Record<string, Plugin> = { ...builtInPlugins };

// Method to register a new plugin at runtime
export const registerPlugin = (plugin: Plugin): void => {
  if (!plugin?.id) {
    console.error('Cannot register plugin without ID');
    return;
  }
  
  // Prüfen, ob das Plugin bereits existiert
  if (availablePlugins[plugin.id]) {
    console.warn(`Plugin with ID ${plugin.id} already exists. Will be overwritten.`);
  }
  
  // Plugin registrieren
  dynamicPlugins[plugin.id] = plugin;
  
  // Combined plugins aktualisieren
  Object.assign(availablePlugins, { [plugin.id]: plugin });
  
  console.log(`Plugin ${plugin.id} registered successfully`);
};

// Method to unregister a plugin
export const unregisterPlugin = (pluginId: string): boolean => {
  const isBuiltIn = !!builtInPlugins[pluginId];
  const isDynamic = !!dynamicPlugins[pluginId];
  
  if (isBuiltIn) {
    console.warn(`Cannot unregister built-in plugin: ${pluginId}`);
    return false;
  }
  
  if (isDynamic) {
    delete dynamicPlugins[pluginId];
    delete availablePlugins[pluginId];
    console.log(`Plugin ${pluginId} unregistered successfully`);
    return true;
  }
  
  console.warn(`Plugin ${pluginId} not found for unregistration`);
  return false;
};

export type PluginKey = keyof typeof availablePlugins;

export interface PluginState {
  [key: string]: boolean;
}

// Helper function to load plugin states from localStorage
export const loadPluginStates = (): PluginState => {
  const states: PluginState = {};
  
  Object.keys(availablePlugins).forEach(key => {
    const saved = localStorage.getItem(`${key}PluginEnabled`);
    states[key] = saved !== null ? saved === 'true' : true; // Default to enabled
  });
  
  return states;
};

// Helper function to save plugin states to localStorage
export const savePluginState = (key: string, enabled: boolean): void => {
  localStorage.setItem(`${key}PluginEnabled`, enabled.toString());
};

// Helper function to get all declarations for enabled plugins
export const getEnabledDeclarations = (pluginState: PluginState): FunctionDeclaration[] => {
  return Object.entries(availablePlugins)
    .filter(([key]) => pluginState[key])
    .map(([_, plugin]) => plugin.declaration);
};
