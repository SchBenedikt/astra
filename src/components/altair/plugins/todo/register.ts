// todo/register.ts
import { Plugin } from '../PluginRegistry';
import { TodoPlugin, todoDeclaration } from './TodoPlugin';

// Plugin-Definition in eigenständiger Datei
export const todoPlugin: Plugin = {
  component: TodoPlugin,
  declaration: todoDeclaration,
  id: 'todo',
  name: 'Todo List Plugin',
  description: 'Create and manage todo lists',
  version: '1.0.0',
  author: 'Default'
};

export default todoPlugin;