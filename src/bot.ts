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
import { webhookManager } from './webhook.js';
import { parseAgentFromMessage } from './agents.js';
import { memoryManager } from './memory.js';

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
    this.client.once('ready', async () => {
      console.log(`✓ Bot logged in as ${this.client.user?.tag}`);

      // Initialize memory manager
      await memoryManager.initialize();
      if (memoryManager.isAvailable()) {
        console.log(`✓ Memory persistence enabled`);
      } else {
        console.log(`⚠ Memory persistence unavailable`);
      }

      // Register webhooks from config
      const webhookCount = Object.keys(config.webhooks).length;
      if (webhookCount > 0) {
        console.log(`✓ Registering ${webhookCount} webhook(s)...`);

        for (const [channelId, webhookUrl] of Object.entries(config.webhooks)) {
          webhookManager.registerWebhook(channelId, webhookUrl);
          console.log(`  - Channel ${channelId}: ${webhookUrl.substring(0, 30)}...`);
        }

        console.log(`✓ Webhooks registered successfully`);
      } else {
        console.log(`⚠ No webhooks configured (multi-agent identity disabled)`);
      }
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

    // Handle commands
    if (message.content.startsWith('/')) {
      await this.handleCommand(message);
      return;
    }

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
      // Retrieve past conversation context (automatic, user doesn't need to know)
      const pastContext = await memoryManager.getPastContext(channelId, channelIdType);

      // Build full prompt with context
      const fullPrompt = pastContext
        ? `[Previous conversation context]\n${pastContext}\n\n[Current message]\n${message.content}`
        : message.content;

      const response = await claude.sendMessage(fullPrompt, (chunk) => {
        // Stream chunks to Discord (optional - can be implemented later)
      });

      // Send response to Discord
      if (response.content) {
        // Check if webhook is configured for this channel
        const hasWebhook = webhookManager.hasWebhook(channelId);

        if (hasWebhook) {
          // Parse agent from response
          const agent = parseAgentFromMessage(response.content);

          if (agent) {
            // Send as agent via webhook
            await webhookManager.sendAsAgent(channelId, agent.id, response.content);
          } else {
            // Send as regular bot via webhook
            await webhookManager.sendAsBot(channelId, response.content);
          }
        } else {
          // No webhook configured, use regular bot reply
          // Split long messages
          const maxLength = 2000;
          const chunks = response.content.match(new RegExp('.{1,' + maxLength + '}', 'g')) || [];

          for (const chunk of chunks) {
            await message.reply(chunk);
          }
        }

        // Save conversation to memory (automatic, user doesn't need to know)
        await memoryManager.saveConversation(channelId, channelIdType, message.content, response.content);
      } else if (response.isError) {
        await message.reply(`❌ Error: ${response.content}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await message.reply(`❌ Failed to process message: ${error}`);
    }
  }

  /**
   * Handle slash commands
   */
  private async handleCommand(message: Message): Promise<void> {
    const content = message.content.trim();
    const parts = content.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case '/history':
        await this.handleHistoryCommand(message);
        break;

      case '/search':
        await this.handleSearchCommand(message, args.join(' '));
        break;

      case '/help':
        await this.handleHelpCommand(message);
        break;

      default:
        await message.reply(`❌ Unknown command: ${command}\nTry /help for available commands.`);
    }
  }

  /**
   * Handle /history command - List past conversations
   */
  private async handleHistoryCommand(message: Message): Promise<void> {
    if (!memoryManager.isAvailable()) {
      await message.reply('⚠️ Memory feature is not available.');
      return;
    }

    try {
      const conversations = await memoryManager.getAllConversations();

      if (conversations.length === 0) {
        await message.reply('📝 No past conversations found.');
        return;
      }

      const maxLength = 2000;
      let response = `📝 **Past Conversations** (${conversations.length} total)\n\n`;

      for (const conv of conversations.slice(0, 20)) {
        // Format: channel:123456789 → #123456789
        const displayName = conv.name.replace(/^(channel|thread):/, conv.type === 'channel' ? '#' : '🧵 ');
        response += `• **${displayName}** - Last activity: ${conv.lastActivity}\n`;
      }

      if (conversations.length > 20) {
        response += `\n... and ${conversations.length - 20} more`;
      }

      // Split if too long
      if (response.length > maxLength) {
        const chunks = response.match(new RegExp('.{1,' + maxLength + '}', 'g')) || [];
        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      } else {
        await message.reply(response);
      }
    } catch (error) {
      console.error('Error handling /history:', error);
      await message.reply(`❌ Failed to retrieve history: ${error}`);
    }
  }

  /**
   * Handle /search command - Search conversations
   */
  private async handleSearchCommand(message: Message, query: string): Promise<void> {
    if (!memoryManager.isAvailable()) {
      await message.reply('⚠️ Memory feature is not available.');
      return;
    }

    if (!query.trim()) {
      await message.reply('❌ Usage: /search <query>');
      return;
    }

    try {
      const results = await memoryManager.search(query, 10);

      if (results.length === 0) {
        await message.reply(`🔍 No results found for "${query}"`);
        return;
      }

      const maxLength = 2000;
      let response = `🔍 **Search Results for "${query}"** (${results.length} found)\n\n`;

      for (const result of results) {
        response += `• ${result.substring(0, 200)}\n\n`;
      }

      // Split if too long
      if (response.length > maxLength) {
        const chunks = response.match(new RegExp('.{1,' + maxLength + '}', 'g')) || [];
        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      } else {
        await message.reply(response);
      }
    } catch (error) {
      console.error('Error handling /search:', error);
      await message.reply(`❌ Failed to search: ${error}`);
    }
  }

  /**
   * Handle /help command - Show help message
   */
  private async handleHelpCommand(message: Message): Promise<void> {
    const help = `
📖 **Discord Claude Code - Help**

**Commands:**
• /history - List all past conversations
• /search <query> - Search conversation history
• /help - Show this help message

**Features:**
✨ Automatic conversation memory
✨ Multi-session support (channels & threads)
✨ Context persistence across sessions

**Usage:**
Simply send a message to chat with Claude!
Your conversation is automatically saved and restored.

Need more help? Check the documentation.
`.trim();

    await message.reply(help);
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
