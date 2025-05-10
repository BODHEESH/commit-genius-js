import simpleGit, { SimpleGit } from 'simple-git';

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async stageFiles(files: string[]): Promise<void> {
    await this.git.add(files);
  }

  async getStagedDiff(): Promise<string> {
    const diff = await this.git.diff(['--staged']);
    if (!diff) {
      throw new Error('No staged changes found');
    }
    return diff;
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  async installHooks(): Promise<void> {
    // TODO: Implement git hooks installation
    // This will be used to automatically run commit-genius-js
    // when the user tries to commit
  }
}
