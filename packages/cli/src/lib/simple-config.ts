import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.sdlc-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class SimpleConfigStore {
  private config: any = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        this.config = JSON.parse(data);
      } else {
        this.config = this.getDefaults();
        this.save();
      }
    } catch (error) {
      this.config = this.getDefaults();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  private getDefaults() {
    return {
      apiUrl: process.env.SDLC_API_URL || 'http://localhost:3000',  // Default to local development
      aiProvider: 'auto',
      outputDir: './sdlc-docs',
      defaultFormat: 'markdown',
      profile: 'default',
      profiles: {}
    };
  }

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any): void {
    this.config[key] = value;
    this.save();
  }

  getAll(): any {
    return { ...this.config };
  }

  reset(): void {
    this.config = this.getDefaults();
    this.save();
  }
}

export const configStore = new SimpleConfigStore();