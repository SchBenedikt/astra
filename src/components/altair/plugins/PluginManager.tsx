import React, { useRef, useEffect, useState } from 'react';
import { ToolCall } from "../../../multimodal-live-types";
import { PluginHandle, availablePlugins, loadPluginStates } from './PluginRegistry';

interface PluginManagerProps {
  toolCall: ToolCall | null;
}

/**
 * A component that manages all plugins, their rendering, and forwarding tool calls
 */
export const PluginManager: React.FC<PluginManagerProps> = ({ toolCall }) => {
  // Load plugin states from localStorage
  const [pluginStates] = useState(() => loadPluginStates());
  
  // Create refs for plugin instances to access their methods
  const pluginRefs = useRef<{[key: string]: PluginHandle | null}>({});

  // Process tool calls for plugins when they arrive
  useEffect(() => {
    if (!toolCall) return;
    
    // Process tool calls for plugins
    toolCall.functionCalls.forEach(fc => {
      // Loop through plugins to find the right handler
      Object.entries(availablePlugins).forEach(([key, plugin]) => {
        if (fc.name === plugin.declaration.name && pluginStates[key]) {
          // Get the plugin ref and call its handler method if it exists
          const pluginRef = pluginRefs.current[key];
          if (pluginRef && pluginRef.handleToolCall) {
            console.log(`Dispatching tool call ${fc.name} to plugin ${key}`);
            pluginRef.handleToolCall(fc);
          } else {
            console.error(`Plugin ${key} doesn't have a handleToolCall method or is not properly registered`);
          }
        }
      });
    });
  }, [toolCall, pluginStates]);

  // Create plugin components dynamically based on their state
  const renderPlugins = () => {
    return Object.entries(availablePlugins).map(([key, plugin]) => {
      const Component = plugin.component;
      // Return the component with ref
      return (
        <Component 
          key={key}
          ref={(instance) => {
            pluginRefs.current[key] = instance;
          }}
          isEnabled={pluginStates[key]} 
        />
      );
    });
  };
  
  return (
    <div className="plugin-container" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px',
      maxHeight: '100%',
      overflowY: 'auto'
    }}>
      {renderPlugins()}
    </div>
  );
};

export default PluginManager;