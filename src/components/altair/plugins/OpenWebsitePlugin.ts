import React, { forwardRef, useImperativeHandle } from 'react';
import { PluginComponentProps, PluginHandle } from './PluginRegistry';
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const openWebsiteDeclaration: FunctionDeclaration = {
  name: "open_website",
  description: "Opens a website in a new tab.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      url: {
        type: SchemaType.STRING,
        description: "URL of the website to open."
      }
    },
    required: ["url"],
  },
};

const OpenWebsitePlugin = forwardRef<PluginHandle, PluginComponentProps>(({ isEnabled }, ref) => {
  useImperativeHandle(ref, () => ({
    handleToolCall: (fc: any) => {
      if (fc.name === openWebsiteDeclaration.name && isEnabled) {
        try {
          let url = fc.args.url;
          if (!url) {
            console.error("No URL provided");
            return;
          }
          // Replace 'http://localhost:3000/' with 'https://'
          url = url.replace(/^http:\/\/localhost:3000\//, "https://");
          window.open(url, '_blank');
          console.log(`Opening website: ${url}`);
        } catch (e) {
          console.error("Error opening website:", e);
        }
      }
    }
  }));
  
  return null; // No visual UI required for this plugin
});

export default OpenWebsitePlugin;
