import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';
import { config } from './config.js';

export interface ClaudeResponse {
  content: string;
  isError?: boolean;
}

/**
 * Claude Code wrapper - handles Claude Code CLI execution
 */
export class ClaudeCode {
  private process?: ChildProcess;
  private projectDir: string;

  constructor(projectDir?: string) {
    this.projectDir = projectDir || config.claude.projectDir;
  }

  /**
   * Send a message to Claude Code and get response
   */
  async sendMessage(message: string, onChunk?: (chunk: string) => void): Promise<ClaudeResponse> {
    return new Promise((resolve, reject) => {
      const args = ['code', '--no-prompt', '--message', message];

      this.process = spawn('claude', args, {
        cwd: this.projectDir,
        env: {
          ...process.env,
          CLAUDE_PROJECT_DIR: this.projectDir,
        },
      });

      let output = '';
      let errorOutput = '';

      this.process.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        output += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      this.process.on('close', (code) => {
        if (code === 0 || output) {
          resolve({ content: output });
        } else {
          resolve({ content: errorOutput || `Claude Code exited with code ${code}`, isError: true });
        }
      });

      this.process.on('error', (err) => {
        reject(new Error(`Failed to start Claude Code: ${err.message}`));
      });
    });
  }

  /**
   * Stop the Claude Code process
   */
  stop(): void {
    if (this.process) {
      this.process.kill();
      this.process = undefined;
    }
  }

  /**
   * Check if Claude Code is installed
   */
  static async isInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const process = spawn('claude', ['--version'], { stdio: 'ignore' });
      process.on('close', (code) => resolve(code === 0));
      process.on('error', () => resolve(false));
    });
  }
}
