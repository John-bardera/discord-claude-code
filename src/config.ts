import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  discord: {
    token: string;
    clientId: string;
  };
  session: {
    timeoutMinutes: number;
    maxConcurrentSessions: number;
  };
  claude: {
    projectDir: string;
  };
  webhooks: Record<string, string>;  // channelId -> webhookUrl
  allowedUserIds?: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export function loadConfig(): Config {
  const allowedUserIds = getEnvVar('ALLOWED_USER_IDS', false);

  // Load webhook configuration
  const webhooks: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('WEBHOOK_CHANNEL_') && value) {
      const channelId = key.replace('WEBHOOK_CHANNEL_', '');
      webhooks[channelId] = value;
    }
  }

  return {
    discord: {
      token: getEnvVar('DISCORD_TOKEN'),
      clientId: getEnvVar('DISCORD_CLIENT_ID'),
    },
    session: {
      timeoutMinutes: parseInt(getEnvVar('SESSION_TIMEOUT_MINUTES', false) || '30', 10),
      maxConcurrentSessions: parseInt(getEnvVar('MAX_CONCURRENT_SESSIONS', false) || '5', 10),
    },
    claude: {
      projectDir: getEnvVar('CLAUDE_CODE_PROJECT_DIR', false) || process.cwd(),
    },
    webhooks,
    allowedUserIds: allowedUserIds ? allowedUserIds.split(',').map(id => id.trim()) : undefined,
    logLevel: (getEnvVar('LOG_LEVEL', false) || 'info') as Config['logLevel'],
  };
}

export const config = loadConfig();
