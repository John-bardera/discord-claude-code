import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';
import { config } from './config.js';

export interface SessionInfo {
  channelId: string;
  channelIdType: 'thread' | 'channel';
  startTime: number;
  lastActivityTime: number;
  process?: ChildProcess;
  isActive: boolean;
}

export class SessionManager {
  private sessions: Map<string, SessionInfo> = new Map();

  /**
   * Generate a unique session key for a channel/thread
   */
  private getSessionKey(channelId: string, channelIdType: 'thread' | 'channel'): string {
    return `${channelIdType}:${channelId}`;
  }

  /**
   * Create a new Claude Code session
   */
  createSession(channelId: string, channelIdType: 'thread' | 'channel' = 'channel'): SessionInfo {
    const key = this.getSessionKey(channelId, channelIdType);

    if (this.sessions.has(key)) {
      const existing = this.sessions.get(key)!;
      if (existing.isActive) {
        return existing;
      }
    }

    const session: SessionInfo = {
      channelId,
      channelIdType,
      startTime: Date.now(),
      lastActivityTime: Date.now(),
      isActive: true,
    };

    this.sessions.set(key, session);
    return session;
  }

  /**
   * Get a session by channel/thread ID
   */
  getSession(channelId: string, channelIdType: 'thread' | 'channel' = 'channel'): SessionInfo | undefined {
    const key = this.getSessionKey(channelId, channelIdType);
    return this.sessions.get(key);
  }

  /**
   * Update session activity time
   */
  updateActivity(channelId: string, channelIdType: 'thread' | 'channel' = 'channel'): void {
    const session = this.getSession(channelId, channelIdType);
    if (session) {
      session.lastActivityTime = Date.now();
    }
  }

  /**
   * Stop a session
   */
  stopSession(channelId: string, channelIdType: 'thread' | 'channel' = 'channel'): void {
    const key = this.getSessionKey(channelId, channelIdType);
    const session = this.sessions.get(key);

    if (session) {
      session.isActive = false;

      if (session.process) {
        session.process.kill();
        session.process = undefined;
      }

      this.sessions.delete(key);
    }
  }

  /**
   * Check for inactive sessions and stop them
   */
  cleanupInactiveSessions(): void {
    const now = Date.now();
    const timeoutMs = config.session.timeoutMinutes * 60 * 1000;

    for (const [key, session] of this.sessions.entries()) {
      if (now - session.lastActivityTime > timeoutMs) {
        console.log(`Cleaning up inactive session: ${key}`);
        this.stopSession(session.channelId, session.channelIdType);
      }
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.getActiveSessions().length;
  }
}

export const sessionManager = new SessionManager();
