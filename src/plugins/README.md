# Plugin System

This directory contains plugin implementations that can be loaded dynamically by the application. The plugin system allows for extending the application's functionality without modifying the core code.

## Plugin Structure

Each plugin should be organized in its own directory with at least the following files:

- `index.ts` - Main entry point for the plugin
- A main component file (e.g., `MyPluginComponent.tsx`)
- `types.ts` - TypeScript interfaces and types for the plugin

## Creating a New Plugin

To create a new plugin, follow these steps:

1. Create a new directory for your plugin in the `plugins` directory
2. Create an `index.ts` file that exports:
   - Plugin metadata (name, version, author, description)
   - Plugin component
   - Function declaration for any tool calls

### Example Plugin Structure

```
plugins/
  my-plugin/
    index.ts
    MyPluginComponent.tsx
    types.ts
    README.md (optional)
```

### Example `index.ts`

```typescript
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import MyPluginComponent from './MyPluginComponent';

// Define the function declaration for the AI model
export const myPluginDeclaration: FunctionDeclaration = {
  name: "my_plugin_function",
  description: "Description of what the function does",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      // Define parameters here
      param1: {
        type: SchemaType.STRING,
        description: "Description of parameter 1",
      },
    },
    required: ["param1"],
  },
};

// Export the component and metadata
export default {
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'Description of what my plugin does',
  version: '1.0.0',
  author: 'Your Name',
  component: MyPluginComponent,
  declaration: myPluginDeclaration
};
```

### Example Component

```typescript
import React, { forwardRef, useImperativeHandle } from 'react';
import { PluginComponentProps, PluginHandle } from '../../components/altair/plugins/PluginRegistry';

const MyPluginComponent = forwardRef<PluginHandle, PluginComponentProps>(
  ({ isEnabled }, ref) => {
    
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      handleToolCall: (fc: any) => {
        if (fc.name === 'my_plugin_function' && isEnabled) {
          // Handle the tool call here
          console.log('Tool call received:', fc);
        }
      }
    }));
    
    // Don't render if not enabled
    if (!isEnabled) return null;
    
    // Render your plugin UI
    return (
      <div className="my-plugin">
        {/* Plugin UI */}
      </div>
    );
  }
);

export default MyPluginComponent;
```

## Plugin Loading

Plugins are loaded dynamically by the application when it starts. The application will:

1. Scan the plugins directory
2. Load each plugin's metadata
3. Register the plugins with the system

## Plugin API

Your plugin component receives the following props:

- `isEnabled` (boolean): Whether the plugin is currently enabled

Your plugin component should expose the following methods through `useImperativeHandle`:

- `handleToolCall(fc: any)`: Handle function calls from the AI model

## Plugin Settings

Users can enable/disable plugins through the Settings page. Plugin state is stored in localStorage.