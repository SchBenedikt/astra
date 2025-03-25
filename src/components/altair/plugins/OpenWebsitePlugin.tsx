import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { type FunctionDeclaration, SchemaType } from '@google/generative-ai';

interface PluginHandle {
	handleToolCall: (fc: any) => void;
}

export const webResearchDeclaration: FunctionDeclaration = {
	name: "research_website",
	description: "Researches a website before opening it to ensure it's the correct one.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			query: {
				type: SchemaType.STRING,
				description: "The search query to research the website."
			}
		},
		required: ["query"]
	},
};

export const openWebsiteDeclaration: FunctionDeclaration = {
	name: "open_website",
	description: "Opens the provided website in a new browser tab. Should only be called after researching with research_website.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			url: {
				type: SchemaType.STRING,
				description: "The URL of the website to open."
			}
		},
		required: ["url"]
	},
};

const OpenWebsitePlugin = forwardRef<PluginHandle>((props, ref) => {
	const [researchPerformed, setResearchPerformed] = useState<boolean>(false);
	
	useImperativeHandle(ref, () => ({
		handleToolCall: (fc: any) => {
			try {
				if (fc.name === "research_website") {
					const { query } = fc.args as any;
					console.log(`Research performed for: ${query}`);
					// In a real implementation, you would perform an actual web search here
					// For now, we'll just mark that research was performed
					setResearchPerformed(true);
					return `Research completed for "${query}". Now you can safely open the website.`;
				} else if (fc.name === "open_website") {
					let { url } = fc.args as any;
					// Falls URL nicht mit http:// oder https:// beginnt, füge https:// hinzu
					if (!/^https?:\/\//i.test(url)) {
						url = "https://" + url;
					}
					
					if (!researchPerformed) {
						return "Please perform research first using research_website before opening any website.";
					}
					
					if (url) {
						window.open(url, '_blank');
						setResearchPerformed(false); // Reset for next use
						return `Successfully opened ${url}`;
					}
				}
			} catch (error) {
				console.error("Error in website plugin:", error);
				return `Error: ${error}`;
			}
		}
	}));
	// Plugin requires no visible UI
	return null;
});

export default OpenWebsitePlugin;
