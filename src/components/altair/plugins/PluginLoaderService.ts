import { Plugin, registerPlugin, availablePlugins } from './PluginRegistry';

// Interface für ein Plugin-Paket mit Metadaten und Funktionen
interface PluginPackage {
  plugin: Plugin;
  load: () => Promise<void>;
  unload: () => Promise<void>;
}

// Interface für Plugin-Module
interface PluginModule {
  default?: Plugin;
}

// Simuliertes Plugin aus ZIP-Datei
interface SimulatedPluginFromZip {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
}

/**
 * Service für das dynamische Laden von Plugins
 */
export class PluginLoaderService {
  private loadedPackages: Map<string, PluginPackage> = new Map();
  private pluginDirectories: string[] = [
    // Standardverzeichnis für Plugins
    '/plugins',
    // Verzeichnis für die Altair-Plugins
    '/components/altair/plugins'
  ];
  
  // Für die Demo haben wir ein Mapping von ZIP-Dateinamen zu simulierten Plugins
  private simulatedZipPlugins: Record<string, SimulatedPluginFromZip> = {
    "stopwatch.zip": {
      id: 'zipStopwatch',
      name: 'Stoppuhr (aus ZIP)',
      description: 'Stoppuhr mit Rundenzählung und mehreren Instanzen',
      version: '1.0.0',
      author: 'GitHub Copilot'
    },
    "calculator.zip": {
      id: 'calculator',
      name: 'Taschenrechner',
      description: 'Einfacher Taschenrechner für Grundrechenarten',
      version: '1.0.0',
      author: 'GitHub Copilot'
    },
    "notes.zip": {
      id: 'notes',
      name: 'Notizen',
      description: 'Einfache Notiz-App',
      version: '1.1.0',
      author: 'GitHub Copilot'
    }
  };

  /**
   * Initialisiert den Plugin-Loader und lädt alle verfügbaren Plugins
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Plugin Loader');
      
      // Durchsuche Standard-Plugin-Verzeichnisse
      await this.loadAllPlugins();
      
      console.log(`Successfully loaded ${this.loadedPackages.size} plugins`);
    } catch (error) {
      console.error('Failed to initialize plugin loader:', error);
    }
  }

  /**
   * Fügt ein Verzeichnis zur Plugin-Suche hinzu
   * @param path Pfad zum Verzeichnis
   */
  public addPluginDirectory(path: string): void {
    if (!this.pluginDirectories.includes(path)) {
      this.pluginDirectories.push(path);
      console.log(`Added plugin directory: ${path}`);
    }
  }

  /**
   * Lädt alle Plugins aus allen registrierten Verzeichnissen
   */
  public async loadAllPlugins(): Promise<void> {
    try {
      // Direktes Laden der Plugins aus allen registrierten Verzeichnissen
      const pluginModules = await this.importAllPlugins();
      
      for (const module of pluginModules) {
        if (module && module.default) {
          const plugin = module.default;
          
          // Überprüfe, ob das Plugin die erforderliche Struktur hat
          if (this.validatePlugin(plugin)) {
            await this.registerPluginPackage(plugin);
          }
        }
      }

      // Scannt auch nach Plugins in Unterordnern mit register.ts-Dateien
      await this.scanForPluginRegistrations();
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  /**
   * Sucht nach Plugin-Registrierungsdateien (register.ts) in Unterordnern
   */
  private async scanForPluginRegistrations(): Promise<void> {
    try {
      console.log('Scanning for plugin registrations in subfolders...');
      
      // In einer realen Implementierung würde hier das Dateisystem nach register.ts-Dateien durchsucht
      // Da wir im Browser sind, können wir nicht direkt das Dateisystem scannen
      // Stattdessen verwenden wir dynamische Imports für bekannte Pfade
      
      // Wir simulieren hier die Erkennung von register.ts in Unterordnern
      const knownPluginPaths = [
        '/components/altair/plugins/timer/register',
        '/components/altair/plugins/todo/register',
        '/components/altair/plugins/OpenWebsitePlugin/register',
        '/components/altair/plugins/clock/register',
      ];

      for (const path of knownPluginPaths) {
        try {
          // In einer realen Implementierung würde hier ein dynamischer Import erfolgen
          // const pluginModule = await import(path);
          
          // Hier simulieren wir den Import, indem wir das Plugin aus dem availablePlugins holen
          // (In einer echten Implementierung würde der dynamische Import das Plugin laden)
          
          // Extrahiere den Plugin-Namen aus dem Pfad
          const pluginName = path.split('/').slice(-2)[0];
          
          console.log(`Detected plugin registration for ${pluginName}`);
        } catch (importError) {
          console.warn(`Could not load plugin registration from ${path}:`, importError);
        }
      }
    } catch (error) {
      console.error('Error scanning for plugin registrations:', error);
    }
  }

  /**
   * Importiert alle Plugin-Module dynamisch
   * In einer echten Implementierung würde dies das Dateisystem scannen
   */
  private async importAllPlugins(): Promise<PluginModule[]> {
    const modules: PluginModule[] = [];
    
    try {
      // In einer echten Implementierung würde dies das Dateisystem scannen
      // und alle Plugin-Ordner dynamisch importieren
      
      console.log('Dynamically importing plugins from registered directories');
      
      // In einer echten Browserumgebung könnten wir webpack.context oder 
      // andere Mechanismen für dynamische Imports verwenden
      
    } catch (error) {
      console.error('Error importing plugins:', error);
    }
    
    return modules;
  }

  /**
   * Prüft, ob ein Plugin die erforderliche Struktur hat
   * @param plugin Das zu überprüfende Plugin
   */
  private validatePlugin(plugin: any): boolean {
    if (!plugin) return false;
    
    const requiredFields = ['id', 'name', 'component', 'declaration'];
    for (const field of requiredFields) {
      if (!plugin[field]) {
        console.error(`Plugin missing required field: ${field}`, plugin);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Registriert ein Plugin im System und erstellt ein Plugin-Paket
   * @param plugin Das zu registrierende Plugin
   */
  public async registerPluginPackage(plugin: Plugin): Promise<void> {
    try {
      // Prüfen, ob das Plugin bereits registriert ist
      if (this.isPluginLoaded(plugin.id)) {
        console.log(`Plugin ${plugin.id} is already registered, skipping`);
        return;
      }
      
      // Plugin-Paket erstellen
      const pluginPackage: PluginPackage = {
        plugin,
        load: async () => {
          registerPlugin(plugin);
          console.log(`Plugin ${plugin.id} loaded successfully`);
        },
        unload: async () => {
          console.log(`Plugin ${plugin.id} unloaded successfully`);
        }
      };
      
      // Plugin laden
      await pluginPackage.load();
      
      // Plugin-Paket speichern
      this.loadedPackages.set(plugin.id, pluginPackage);
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error);
    }
  }

  /**
   * Extrahiert Plugin aus einer ZIP-Datei und registriert es automatisch
   * @param zipFile Die ZIP-Datei mit dem Plugin
   */
  public async extractAndRegisterPlugin(zipFile: File): Promise<Plugin | null> {
    try {
      console.log(`Extracting and registering plugin from: ${zipFile.name}`);
      
      // In einer echten Implementierung würden wir:
      // 1. Die ZIP-Datei entpacken
      // 2. Die Inhalte in einen temporären Ordner schreiben
      // 3. Nach einer register.ts Datei suchen
      // 4. Die register.ts dynamisch importieren
      
      // Da wir das in der Browser-Umgebung nicht direkt tun können,
      // simulieren wir den Prozess mit dem loadPluginFromZip
      return await this.loadPluginFromZip(zipFile);
    } catch (error) {
      console.error('Error extracting and registering plugin:', error);
      return null;
    }
  }

  /**
   * Lädt ein Plugin aus einer ZIP-Datei
   * @param zipFile Die ZIP-Datei mit dem Plugin
   */
  public async loadPluginFromZip(zipFile: File): Promise<Plugin | null> {
    try {
      console.log(`Loading plugin from zip: ${zipFile.name}`);
      
      // Simuliere Verarbeitungszeit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prüfen, ob wir ein simuliertes Plugin für diese ZIP-Datei haben
      const simulatedInfo = this.simulatedZipPlugins[zipFile.name];
      
      // Wir verwenden ein vorhandenes Plugin als Basis für unsere Simulation
      // Priorität: clock > timer > todo > erstes verfügbare Plugin
      const basePlugin = 
        availablePlugins['clock'] || 
        availablePlugins['timer'] || 
        availablePlugins['todo'] || 
        Object.values(availablePlugins)[0];
      
      if (!basePlugin) {
        console.error('No base plugin available for simulation');
        return null;
      }
      
      if (!simulatedInfo) {
        console.log(`No simulated plugin data for ${zipFile.name}, using default simulation`);
        
        // Erstelle ein neues Default-Plugin basierend auf dem Dateinamen
        const fileNameWithoutExtension = zipFile.name.replace('.zip', '');
        
        // Erstelle ein neues Plugin basierend auf einem vorhandenen Plugin
        const simulatedPlugin: Plugin = {
          ...basePlugin,
          id: fileNameWithoutExtension,
          name: `${fileNameWithoutExtension.charAt(0).toUpperCase() + fileNameWithoutExtension.slice(1)} Plugin`,
          description: `${fileNameWithoutExtension.charAt(0).toUpperCase() + fileNameWithoutExtension.slice(1)} Plugin (aus ZIP installiert)`,
          version: '1.0.0',
          author: 'GitHub Copilot'
        };
        
        // Simuliere das Extrahieren und Finden einer register.ts Datei
        console.log(`Simulating extraction of ${zipFile.name} and finding register.ts`);
        
        // Registriere das simulierte Plugin automatisch
        await this.registerPluginPackage(simulatedPlugin);
        return simulatedPlugin;
      } else {
        // Verwende die vorgefertigten Plugin-Informationen
        console.log(`Using simulated plugin data for ${zipFile.name}`);
        
        // Erstelle ein neues Plugin basierend auf einem vorhandenen Plugin mit den simulierten Infos
        const simulatedPlugin: Plugin = {
          ...basePlugin,
          id: simulatedInfo.id,
          name: simulatedInfo.name,
          description: simulatedInfo.description || `${simulatedInfo.name} Plugin`,
          version: simulatedInfo.version || '1.0.0',
          author: simulatedInfo.author || 'GitHub Copilot'
        };
        
        // Registriere das simulierte Plugin automatisch
        await this.registerPluginPackage(simulatedPlugin);
        return simulatedPlugin;
      }
    } catch (error) {
      console.error('Failed to load plugin from ZIP:', error);
      return null;
    }
  }

  /**
   * Lädt ein Plugin aus einer GitHub-Repository-URL
   * @param repoUrl Die GitHub-Repository-URL (Format: https://github.com/benutzer/repo)
   */
  public async loadPluginFromGitHub(repoUrl: string): Promise<Plugin | null> {
    try {
      console.log(`Loading plugin from GitHub: ${repoUrl}`);
      
      // Simuliere Verarbeitungszeit
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extrahiere Benutzer- und Repository-Namen aus der URL
      const urlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/?.*)$/;
      const match = repoUrl.match(urlPattern);
      
      if (!match) {
        throw new Error('Ungültige GitHub-URL. Format: https://github.com/benutzer/repo');
      }
      
      const [, username, repo] = match;
      console.log(`Extracted GitHub repo: ${username}/${repo}`);
      
      // In einer echten Implementierung würden wir:
      // 1. Das GitHub-Repo über die GitHub API oder mit einem Fetch herunterladen
      // 2. Die ZIP-Datei entpacken
      // 3. Nach der register.ts-Datei suchen und verarbeiten
      
      // Da wir das im Browser simulieren, generieren wir ein simuliertes Plugin
      // basierend auf dem Repo-Namen
      
      // Basis-Plugin als Vorlage verwenden
      const basePlugin = 
        availablePlugins['clock'] || 
        availablePlugins['timer'] || 
        availablePlugins['todo'] || 
        Object.values(availablePlugins)[0];
      
      if (!basePlugin) {
        throw new Error('Kein Basis-Plugin für die Simulation verfügbar');
      }
      
      // Erstelle ein neues Plugin basierend auf dem GitHub-Repo
      const pluginId = repo.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const pluginName = repo
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const simulatedPlugin: Plugin = {
        ...basePlugin,
        id: pluginId,
        name: `${pluginName} Plugin`,
        description: `Plugin from GitHub: ${username}/${repo}`,
        version: '1.0.0',
        author: username
      };
      
      // Registriere das simulierte Plugin
      await this.registerPluginPackage(simulatedPlugin);
      return simulatedPlugin;
      
    } catch (error) {
      console.error('Fehler beim Laden des Plugins von GitHub:', error);
      throw error;
    }
  }

  /**
   * Entlädt ein Plugin anhand seiner ID
   * @param pluginId Die ID des zu entladenden Plugins
   */
  public async unloadPlugin(pluginId: string): Promise<boolean> {
    const pluginPackage = this.loadedPackages.get(pluginId);
    if (!pluginPackage) {
      console.warn(`Plugin ${pluginId} not found for unloading`);
      return false;
    }
    
    try {
      await pluginPackage.unload();
      this.loadedPackages.delete(pluginId);
      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Gibt zurück, ob ein Plugin mit der angegebenen ID bereits geladen ist
   * @param pluginId Die zu überprüfende Plugin-ID
   */
  public isPluginLoaded(pluginId: string): boolean {
    return this.loadedPackages.has(pluginId) || !!availablePlugins[pluginId];
  }

  /**
   * Gibt eine Liste aller geladenen Plugin-IDs zurück
   */
  public getLoadedPluginIds(): string[] {
    return Array.from(this.loadedPackages.keys());
  }
  
  /**
   * Erstellt die Ordnerstruktur für ein neues Plugin
   * @param pluginId Die ID des neuen Plugins
   * @param metadata Metadaten für das neue Plugin
   */
  public createPluginStructure(pluginId: string, metadata: {
    name: string;
    description?: string;
    version?: string;
    author?: string;
  }): Plugin | null {
    try {
      // In einer echten Implementierung würden wir hier:
      // 1. Einen neuen Ordner für das Plugin erstellen
      // 2. Die Grundstruktur (Plugin-Datei, register.ts) erstellen
      // 3. Das Plugin registrieren
      
      // Da wir im Browser sind, können wir keine Dateien erzeugen
      // Wir simulieren das Ergebnis
      
      console.log(`Creating plugin structure for ${pluginId}`);
      
      // Basis-Plugin für die Simulation
      const basePlugin = 
        availablePlugins['clock'] || 
        availablePlugins['timer'] || 
        Object.values(availablePlugins)[0];
        
      if (!basePlugin) {
        console.error('No base plugin available for simulation');
        return null;
      }
      
      // Erstelle ein neues Plugin basierend auf einem vorhandenen Plugin
      const newPlugin: Plugin = {
        ...basePlugin,
        id: pluginId,
        name: metadata.name || `${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)} Plugin`,
        description: metadata.description || `New ${pluginId} plugin`,
        version: metadata.version || '1.0.0',
        author: metadata.author || 'User Created'
      };
      
      return newPlugin;
    } catch (error) {
      console.error(`Failed to create plugin structure for ${pluginId}:`, error);
      return null;
    }
  }
}

// Singleton-Instanz für die gesamte Anwendung
export const pluginLoader = new PluginLoaderService();