import React, { useState } from 'react';
import { pluginLoader } from './PluginLoaderService';

interface PluginUploaderProps {
  onPluginLoaded: () => void;
}

/**
 * Komponente zum Hochladen und Installieren neuer Plugins
 */
export const PluginUploader: React.FC<PluginUploaderProps> = ({ onPluginLoaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [uploadTab, setUploadTab] = useState<'file' | 'github'>('file');

  /**
   * Verarbeitet den Upload einer Datei (ZIP oder JS/TS)
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setMessage({ text: "Plugin wird analysiert...", type: 'info' });
    setUploadProgress(0);
    
    try {
      const file = files[0];
      
      // Simuliere Upload-Fortschritt
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 90) return 90;
          return prev + 10;
        });
      }, 200);
      
      let plugin = null;
      
      // Entscheide basierend auf dem Dateityp, wie das Plugin geladen werden soll
      if (file.name.endsWith('.zip')) {
        setMessage({ text: "ZIP-Datei wird entpackt und Plugin wird registriert...", type: 'info' });
        // Verwende die neue Methode, die automatisch aus der ZIP-Datei extrahiert und registriert
        plugin = await pluginLoader.extractAndRegisterPlugin(file);
      } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
        setMessage({ text: "JavaScript-Modul wird geladen...", type: 'info' });
        // Hier würden wir das JS-Modul direkt importieren
        // Dies ist in einer Browser-Umgebung nicht so einfach und erfordert spezielle Webpack/Vite-Konfiguration
        // Für die Demo simulieren wir das Ergebnis mit einer ähnlichen Methode wie bei ZIP-Dateien
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuliere ein Plugin aus der JS-Datei
        const fileNameWithoutExtension = file.name.replace(/\.(js|ts|jsx|tsx)$/, '');
        plugin = pluginLoader.createPluginStructure(
          fileNameWithoutExtension, 
          { 
            name: `${fileNameWithoutExtension.charAt(0).toUpperCase() + fileNameWithoutExtension.slice(1)} Plugin`,
            description: `Plugin aus ${file.name}`,
            version: '1.0.0', 
            author: 'Benutzer'
          }
        );
        
        // Registriere das simulierte Plugin
        if (plugin) {
          await pluginLoader.registerPluginPackage(plugin);
        }
      } else {
        throw new Error(`Nicht unterstütztes Dateiformat: ${file.type}`);
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Kurze Verzögerung für UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (plugin) {
        setMessage({
          text: `Plugin "${plugin.name || file.name}" wurde erfolgreich installiert!`,
          type: 'success'
        });
      } else {
        setMessage({
          text: `Plugin konnte nicht aus "${file.name}" erstellt werden.`,
          type: 'error'
        });
      }
      
      // Benachrichtige die Elternkomponente über erfolgreiches Laden
      onPluginLoaded();
      
    } catch (error) {
      console.error('Fehler beim Hochladen des Plugins:', error);
      setMessage({
        text: `Fehler beim Hochladen des Plugins: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        type: 'error'
      });
    } finally {
      setIsUploading(false);
      // Upload-Eingabe zurücksetzen
      event.target.value = '';
      
      // Fortschrittsanzeige nach kurzer Zeit ausblenden
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);
    }
  };

  /**
   * Verarbeitet das Laden eines Plugins von GitHub
   */
  const handleGitHubImport = async () => {
    if (!githubUrl.trim()) {
      setMessage({
        text: 'Bitte gib eine gültige GitHub-URL ein',
        type: 'error'
      });
      return;
    }

    setIsUploading(true);
    setMessage({ text: "GitHub-Repository wird analysiert...", type: 'info' });
    setUploadProgress(0);

    // Simuliere Upload-Fortschritt
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 90) return 90;
        return prev + 10;
      });
    }, 200);

    try {
      // Lade das Plugin von GitHub
      const plugin = await pluginLoader.loadPluginFromGitHub(githubUrl);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Kurze Verzögerung für bessere UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (plugin) {
        setMessage({
          text: `Plugin "${plugin.name}" wurde erfolgreich von GitHub installiert!`,
          type: 'success'
        });
        setGithubUrl(''); // Reset input field
      } else {
        setMessage({
          text: 'Plugin konnte nicht von GitHub geladen werden',
          type: 'error'
        });
      }
      
      // Benachrichtige die Elternkomponente über erfolgreiches Laden
      onPluginLoaded();
    } catch (error) {
      console.error('Fehler beim Laden des Plugins von GitHub:', error);
      clearInterval(progressInterval);
      setUploadProgress(null);
      
      setMessage({
        text: `Fehler beim Laden des Plugins von GitHub: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        type: 'error'
      });
    } finally {
      setIsUploading(false);
      // Fortschrittsanzeige nach kurzer Zeit ausblenden
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);
    }
  };

  /**
   * Behandelt die Drag & Drop-Funktionalität
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      // Simuliere einen File-Input-Change-Event
      handleFileUpload({ target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };
  
  const styles = {
    container: {
      margin: '10px 0',
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: 'rgba(40, 40, 40, 0.6)',
      border: '1px solid rgba(184, 230, 255, 0.3)'
    },
    title: {
      fontSize: '1rem',
      fontWeight: 'bold' as const,
      marginBottom: '10px',
      color: '#b8e6ff'
    },
    tabContainer: {
      display: 'flex',
      marginBottom: '15px',
      borderBottom: '1px solid rgba(184, 230, 255, 0.3)'
    },
    tab: {
      padding: '8px 15px',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      color: '#e1e2e3',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      borderBottom: '2px solid #b8e6ff',
      color: '#b8e6ff',
      fontWeight: 'bold' as const
    },
    dropZone: {
      padding: '20px',
      border: '2px dashed rgba(184, 230, 255, 0.5)',
      borderRadius: '8px',
      backgroundColor: 'rgba(30, 30, 40, 0.4)',
      textAlign: 'center' as const,
      cursor: 'pointer',
      marginBottom: '15px'
    },
    fileInput: {
      display: 'none'
    },
    githubForm: {
      marginBottom: '15px'
    },
    input: {
      width: '100%',
      padding: '10px',
      backgroundColor: 'rgba(30, 30, 40, 0.6)',
      border: '1px solid rgba(184, 230, 255, 0.3)',
      borderRadius: '4px',
      color: '#e1e2e3',
      fontSize: '0.9rem',
      marginBottom: '10px'
    },
    button: {
      padding: '10px 15px',
      backgroundColor: 'rgba(33, 150, 243, 0.6)',
      border: '1px solid rgba(33, 150, 243, 0.8)',
      borderRadius: '4px',
      color: '#e1e2e3',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease'
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    message: (type: 'success' | 'error' | 'info') => ({
      padding: '8px',
      marginTop: '10px',
      borderRadius: '4px',
      backgroundColor: 
        type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 
        type === 'error' ? 'rgba(244, 67, 54, 0.2)' :
        'rgba(33, 150, 243, 0.2)',
      border: `1px solid ${
        type === 'success' ? 'rgba(76, 175, 80, 0.6)' : 
        type === 'error' ? 'rgba(244, 67, 54, 0.6)' :
        'rgba(33, 150, 243, 0.6)'}`,
      color: '#e1e2e3'
    }),
    progressContainer: {
      marginTop: '15px',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressBar: (progress: number) => ({
      height: '100%',
      width: `${progress}%`,
      backgroundColor: '#64b5f6',
      transition: 'width 0.2s ease-in-out'
    }),
    infoBox: {
      marginTop: '15px',
      padding: '10px',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      border: '1px solid rgba(33, 150, 243, 0.3)',
      borderRadius: '4px',
      fontSize: '0.9rem'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.title}>Plugin installieren</div>
      
      {/* Tab-Auswahl für Upload-Methode */}
      <div style={styles.tabContainer}>
        <div 
          style={{
            ...styles.tab,
            ...(uploadTab === 'file' ? styles.activeTab : {})
          }}
          onClick={() => setUploadTab('file')}
        >
          Datei hochladen
        </div>
        <div 
          style={{
            ...styles.tab,
            ...(uploadTab === 'github' ? styles.activeTab : {})
          }}
          onClick={() => setUploadTab('github')}
        >
          Von GitHub
        </div>
      </div>
      
      {/* Datei-Upload-Tab */}
      {uploadTab === 'file' && (
        <div 
          style={styles.dropZone} 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('plugin-upload')?.click()}
        >
          <p>
            <strong>Zieh eine Plugin-Datei hierher</strong> oder <strong>klicke zum Auswählen</strong>
          </p>
          <p style={{fontSize: '0.9rem', color: '#bbb'}}>
            Unterstützte Formate: .zip, .js, .ts
          </p>
        </div>
      )}
      
      <input 
        type="file"
        id="plugin-upload"
        onChange={handleFileUpload}
        style={styles.fileInput}
        accept=".zip,.js,.ts,.jsx,.tsx"
        disabled={isUploading}
      />
      
      {/* GitHub-Import-Tab */}
      {uploadTab === 'github' && (
        <div style={styles.githubForm}>
          <p>GitHub-Repository-URL eingeben:</p>
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/benutzer/plugin-repo"
            style={styles.input}
            disabled={isUploading}
          />
          <button
            onClick={handleGitHubImport}
            style={{
              ...styles.button,
              ...(isUploading ? styles.disabledButton : {})
            }}
            disabled={isUploading}
          >
            Plugin von GitHub importieren
          </button>
        </div>
      )}
      
      {/* Fortschrittsanzeige */}
      {uploadProgress !== null && (
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(uploadProgress)} />
        </div>
      )}
      
      {/* Statusmeldung */}
      {message && (
        <div style={styles.message(message.type)}>
          {message.text}
        </div>
      )}
      
      {/* Info-Box mit Hinweisen */}
      <div style={styles.infoBox}>
        <p><strong>Hinweis zur Plugin-Struktur:</strong></p>
        <p>Dein Plugin sollte folgendes beinhalten:</p>
        <ul>
          <li>Eine <code>register.ts</code> Datei mit der Plugin-Definition</li>
          <li>Eine React-Komponente für die UI</li>
          <li>Metadaten (id, name, version, etc.)</li>
          <li>Eine Funktionsdeklaration für AI Tool Calls</li>
        </ul>
        
        {uploadTab === 'github' && (
          <>
            <p><strong>GitHub-Struktur:</strong></p>
            <ul>
              <li>Das Plugin sollte im Root-Verzeichnis des Repositories liegen</li>
              <li>Es muss eine <code>register.ts</code> Datei im Hauptverzeichnis oder in einem <code>src</code>-Ordner geben</li>
              <li>Die Repository-URL sollte das Format <code>https://github.com/benutzer/repo</code> haben</li>
            </ul>
          </>
        )}
        
        <p>Mehr Details findest du in der Dokumentation.</p>
      </div>
    </div>
  );
};

export default PluginUploader;