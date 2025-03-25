// OpenWebsitePlugin/register.ts
import { Plugin } from '../PluginRegistry';
import OpenWebsitePlugin, { openWebsiteDeclaration } from '../OpenWebsitePlugin';

// Plugin-Definition in eigenständiger Datei
export const openWebsitePlugin: Plugin = {
  component: OpenWebsitePlugin,
  declaration: openWebsiteDeclaration,
  id: 'openWebsite',
  name: 'Open Website Plugin',
  description: 'Open websites from the chat',
  version: '1.0.0',
  author: 'Default'
};

export default openWebsitePlugin;