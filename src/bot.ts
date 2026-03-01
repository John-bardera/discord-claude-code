import {
  Client,
  GatewayIntentBits,
  Partials,
  Message,
  ThreadChannel,
  ChannelType,
} from 'discord.js';
import { config } from './config.js';
import { sessionManager, SessionInfo } from './session.js';
import { ClaudeCode } from './claude.js';

/**
 * Discord Bot for Claude Code
 */
export class DiscordClaudeBot {
  private client: Client;
  private claudeInstances: Map<string, ClaudeCode> = new Map();

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      console.log(`✓ Bot logged in as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', async (message) => {
      await this.handleMessage(message);
    });

    // Cleanup inactive sessions every 5 minutes
    setInterval(() => {
      sessionManager.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  private async handleMessage(message: Message): Promise<void> {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check user whitelist if configured
    if (config.allowedUserIds && !config.allowedUserIds.includes(message.author.id)) {
      return;
    }

    // Ignore commands (start with /)
    if (message.content.startsWith('/')) return;

    // Get channel type
    const channelIdType = message.channel.isThread() ? 'thread' : 'channel';
    const channelId = message.channel.id;

    // Get or create session
    let session = sessionManager.getSession(channelId, channelIdType);

    if (!session || !session.isActive) {
      // Check max concurrent sessions
      if (sessionManager.getSessionCount() >= config.session.maxConcurrentSessions) {
        await message.reply('⚠️ Maximum concurrent sessions reached. Please try again later.');
        return;
      }

      session = sessionManager.createSession(channelId, channelIdType);
    }

    // Update activity
    sessionManager.updateActivity(channelId, channelIdType);

    // Send typing indicator (only for TextChannel and ThreadChannel)
    if ('sendTyping' in message.channel) {
      await message.channel.sendTyping();
    }

    // Get or create Claude instance
    let claude = this.claudeInstances.get(channelId);

    if (!claude) {
      claude = new ClaudeCode();
      this.claudeInstances.set(channelId, claude);
    }

    // Send message to Claude
    try {
      const response = await claude.sendMessage(message.content, (chunk) => {
        // Stream chunks to Discord (optional - can be implemented later)
      });

      // Send response to Discord
      if (response.content) {
        // Split long messages
        const maxLength = 2000;
        const chunks = response.content.match(new RegExp('.{1,' + maxLength + '}', 'g')) || [];

        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      } else if (response.isError) {
        await message.reply(`❌ Error: ${response.content}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await message.reply(`❌ Failed to process message: ${error}`);
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    console.log('Starting Discord Claude Code bot...');
    console.log(`- Project directory: ${config.claude.projectDir}`);
    console.log(`- Session timeout: ${config.session.timeoutMinutes} minutes`);
    console.log(`- Max concurrent sessions: ${config.session.maxConcurrentSessions}`);

    // Check if Claude Code is installed
    const isInstalled = await ClaudeCode.isInstalled();
    if (!isInstalled) {
      console.error('❌ Claude Code is not installed. Install with: npm install -g @anthropic-ai/claude-code');
      throw new Error('Claude Code not installed');
    }

    console.log('✓ Claude Code is installed');

    await this.client.login(config.discord.token);
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    // Stop all Claude instances
    for (const claude of this.claudeInstances.values()) {
      claude.stop();
    }
    this.claudeInstances.clear();

    // Destroy Discord client
    this.client.destroy();
  }

  /**
   * Get the Discord client
   */
  getClient(): Client {
    return this.client;
  }
}
