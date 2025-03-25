/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";
import { loadPluginStates, getEnabledDeclarations } from "./plugins/PluginRegistry";
import PluginManager from './plugins/PluginManager';

function AltairComponent() {
  const [currentToolCall, setCurrentToolCall] = useState<ToolCall | null>(null);
  
  // Load plugin states from localStorage
  const [pluginStates] = useState(() => loadPluginStates());
  
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    // Create a dynamic system instruction that mentions available plugins
    const enabledPluginNames = Object.entries(pluginStates)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
    
    const availableTools = [...enabledPluginNames].join(", ");
    // Build plugin-specific instructions
    const pluginInstructions = Object.entries(pluginStates)
      .map(([key, enabled]) => {
        if (key === 'timer') {
          return enabled 
            ? "You can start timers when asked." 
            : "The timer functionality is currently disabled. If asked to create a timer, politely inform the user that the timer feature is currently disabled.";
        } else if (key === 'todo') {
          return enabled
            ? "You can generate or update a todo list (with items to check and edit) when asked."
            : "The todo list functionality is currently disabled. If asked to manage todos, politely inform the user that the todo list feature is currently disabled.";
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `Currently available tools: ${availableTools}.
            ${pluginInstructions}
            
            IMPORTANT INSTRUCTION: Never read aloud any technical information such as "codeExecutionResult", "OUTCOME_OK", "output", "success:True", or any JSON structures or function call results. These are internal messages meant only for the system.`,
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [
            ...getEnabledDeclarations(pluginStates)
          ]}
      ],
    });
  }, [setConfig, pluginStates]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      // Pass the tool call to the PluginManager by updating the state
      setCurrentToolCall(toolCall);
      
      if (toolCall.functionCalls.length) {
        // Create a delay to prevent the model from reading the response
        setTimeout(
          () => {
            try {
              client.sendToolResponse({
                functionResponses: toolCall.functionCalls.map((fc) => ({
                  response: { 
                    output: { success: true },
                    excludeFromResponse: true 
                  },
                  id: fc.id,
                }))
              });
            } catch (err) {
              console.error("Error sending tool response:", err);
            }
          },
          200
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, pluginStates]);

  // Styles für das verbesserte Layout
  const styles = {
    chartContainer: {
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      padding: '15px',
      margin: '20px 10px 0px 0px',
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      maxWidth: '100%',
      zIndex: 5,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },
    settingsLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: 'rgba(30, 30, 30, 0.7)',
      color: '#b8e6ff',
      textDecoration: 'none',
      fontSize: '14px',
      border: '1px solid rgba(184, 230, 255, 0.3)',
      marginBottom: '15px',
      alignSelf: 'flex-end',
      cursor: 'pointer'
    },
    sectionTitle: {
      color: '#b8e6ff',
      fontSize: '0.9rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginTop: '15px',
      marginBottom: '5px',
      paddingBottom: '3px',
      borderBottom: '1px solid rgba(184, 230, 255, 0.3)'
    },
  };

  return (
    <div style={styles.chartContainer} className="plugin-container">
      {/* Settings link with React Router */}
      <Link to="/settings" style={styles.settingsLink}>
        ⚙️ Plugin-Einstellungen
      </Link>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Use the PluginManager component */}
          <PluginManager toolCall={currentToolCall} />
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
export const Altair = memo(AltairComponent);
