import Conf from 'conf';

interface ConfigData {
  provider: 'ollama' | 'openai';
  model?: string;
  apiKey?: string;
  template?: string;
  conventionalCommits?: boolean;
}

export class Config {
  private conf: Conf<ConfigData>;

  constructor() {
    this.conf = new Conf<ConfigData>({
      projectName: 'commit-genius-js',
      defaults: {
        provider: 'ollama',
        model: 'codellama',
        conventionalCommits: true,
        template: '{type}: {description}'
      }
    });
  }

  get(key: keyof ConfigData): any {
    return this.conf.get(key);
  }

  set(config: Partial<ConfigData>): void {
    for (const [key, value] of Object.entries(config)) {
      this.conf.set(key as keyof ConfigData, value);
    }
  }
}
