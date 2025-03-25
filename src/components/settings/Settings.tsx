import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  availablePlugins, 
  loadPluginStates, 
  savePluginState, 
  builtInPlugins, 
  unregisterPlugin 
} from '../altair/plugins/PluginRegistry';
import PluginUploader from '../altair/plugins/PluginUploader';

export function Settings() {
  const [pluginStates, setPluginStates] = useState(loadPluginStates());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  // Track which plugins are custom (not built-in)
  const isCustomPlugin = (pluginId: string) => {
    return !builtInPlugins[pluginId];
  };

  // Handle plugin state toggle
  const togglePlugin = (key: string) => {
    const newStates = {
      ...pluginStates,
      [key]: !pluginStates[key]
    };
    
    setPluginStates(newStates);
    savePluginState(key, !pluginStates[key]);
    
    // Show saved message
    setSavedMessage(`${key.charAt(0).toUpperCase() + key.slice(1)} Plugin ${!pluginStates[key] ? 'aktiviert' : 'deaktiviert'}`);
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setSavedMessage(null);
    }, 2000);
  };

  // Handle plugin uninstall (only for custom plugins)
  const handleUninstallPlugin = (pluginId: string) => {
    if (isCustomPlugin(pluginId)) {
      const success = unregisterPlugin(pluginId);
      
      if (success) {
        // Remove from plugin states
        const newPluginStates = { ...pluginStates };
        delete newPluginStates[pluginId];
        setPluginStates(newPluginStates);
        
        setSavedMessage(`${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)} Plugin deinstalliert`);
        
        // Clear message after 2 seconds
        setTimeout(() => {
          setSavedMessage(null);
        }, 2000);
      } else {
        setSavedMessage(`Fehler beim Deinstallieren von ${pluginId}`);
        
        // Clear message after 2 seconds
        setTimeout(() => {
          setSavedMessage(null);
        }, 2000);
      }
    }
  };
  
  // Handle plugin upload completion
  const handlePluginLoaded = () => {
    // Refresh plugin states
    setPluginStates(loadPluginStates());
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#e1e2e3',
      backgroundColor: '#1e1e1e',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '30px',
      borderBottom: '1px solid #444',
      paddingBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#b8e6ff',
      margin: '0',
    },
    section: {
      marginBottom: '30px',
    },
    heading: {
      fontSize: '18px', 
      marginBottom: '15px',
      color: '#b8e6ff',
      borderBottom: '1px solid rgba(184, 230, 255, 0.3)',
      paddingBottom: '5px'
    },
    pluginGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '30px',
    },
    pluginCard: (enabled: boolean, isCustom: boolean) => ({
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: enabled 
        ? isCustom ? 'rgba(33, 150, 243, 0.2)' : 'rgba(76, 175, 80, 0.2)' 
        : 'rgba(40, 40, 40, 0.7)',
      border: `1px solid ${enabled 
        ? isCustom ? '#2196f3' : '#4caf50' 
        : '#444'}`,
      position: 'relative' as const,
    }),
    pluginName: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    pluginInfo: {
      fontSize: '12px',
      color: '#bbb',
      marginTop: '5px',
    },
    pluginControls: {
      display: 'flex',
      marginTop: '10px',
      gap: '8px',
    },
    pluginButton: (color: string) => ({
      backgroundColor: color,
      border: 'none',
      borderRadius: '4px',
      padding: '6px 10px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      opacity: 0.8,
      transition: 'opacity 0.2s',
      fontWeight: 'bold' as const,
      ':hover': {
        opacity: 1
      }
    }),
    link: {
      display: 'inline-block',
      padding: '10px 20px',
      backgroundColor: '#2a2a2a',
      color: '#b8e6ff',
      textDecoration: 'none',
      borderRadius: '4px',
      border: '1px solid #444',
    },
    notification: {
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    },
    pluginBadge: (isCustom: boolean) => ({
      position: 'absolute' as const,
      top: '10px',
      right: '10px',
      padding: '3px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 'bold' as const,
      backgroundColor: isCustom ? 'rgba(33, 150, 243, 0.8)' : 'rgba(76, 175, 80, 0.8)',
      color: 'white',
    }),
    divider: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      margin: '30px 0 20px',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Plugin-Einstellungen</h1>
        <Link to="/" style={styles.link}>← Zurück zum Chat</Link>
      </header>
      
      <section style={styles.section}>
        <h2 style={styles.heading}>Plugin-Upload</h2>
        <p>Hier können Sie neue Plugins hochladen und installieren.</p>
        
        <PluginUploader onPluginLoaded={handlePluginLoaded} />
      </section>
      
      <div style={styles.divider}></div>
      
      <section style={styles.section}>
        <h2 style={styles.heading}>Installierte Plugins</h2>
        <p>Verwalten Sie Ihre Plugins und deren Status.</p>
        
        <div style={styles.pluginGrid}>
          {Object.entries(availablePlugins).map(([key, plugin]) => {
            const isCustom = isCustomPlugin(key);
            
            return (
              <div 
                key={key}
                style={styles.pluginCard(pluginStates[key], isCustom)}
              >
                {isCustom && (
                  <span style={styles.pluginBadge(isCustom)}>
                    Benutzerdefiniert
                  </span>
                )}
                
                <div style={styles.pluginName}>
                  {plugin.name || key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                
                {plugin.description && (
                  <div style={{color: '#ddd', fontSize: '14px', marginBottom: '10px'}}>
                    {plugin.description}
                  </div>
                )}
                
                <div>
                  Status: <strong>{pluginStates[key] ? 'Aktiviert' : 'Deaktiviert'}</strong>
                </div>
                
                {(plugin.author || plugin.version) && (
                  <div style={styles.pluginInfo}>
                    {plugin.author && <>Autor: {plugin.author}</>}
                    {plugin.author && plugin.version && <> | </>}
                    {plugin.version && <>Version: {plugin.version}</>}
                  </div>
                )}
                
                <div style={styles.pluginControls}>
                  <button 
                    onClick={() => togglePlugin(key)}
                    style={{
                      backgroundColor: pluginStates[key] ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {pluginStates[key] ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                  
                  {isCustom && (
                    <button 
                      onClick={() => handleUninstallPlugin(key)}
                      style={{
                        backgroundColor: 'rgba(97, 97, 97, 0.7)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Deinstallieren
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <p>
          <strong>Hinweis:</strong> Die Änderungen werden sofort gespeichert. 
          Die Plugins werden beim nächsten Starten einer neuen Unterhaltung mit der KI automatisch 
          mit der aktualisierten Konfiguration verwendet.
        </p>
      </section>
      
      {savedMessage && (
        <div style={styles.notification}>
          {savedMessage}
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
