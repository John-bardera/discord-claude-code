import { WebhookClient } from 'discord.js';
import { config } from './config.js';
import { AgentIdentity, getAgent } from './agents.js';

/**
 * Webhook manager for multi-agent support
 */
export class WebhookManager {
  private webhooks: Map<string, WebhookClient> = new Map();
  private channelIdToWebhookUrl: Map<string, string> = new Map();

  /**
   * Register a webhook URL for a channel
   */
  registerWebhook(channelId: string, webhookUrl: string): void {
    this.channelIdToWebhookUrl.set(channelId, webhookUrl);

    // Create webhook client if not exists
    if (!this.webhooks.has(webhookUrl)) {
      // Extract webhook ID and token from URL
      // URL format: https://discord.com/api/webhooks/{id}/{token}
      const match = webhookUrl.match(/\/webhooks\/(\d+)\/([^\/]+)/);
      if (match) {
        const [, id, token] = match;
        this.webhooks.set(webhookUrl, new WebhookClient({ id, token }));
      } else {
        throw new Error(`Invalid webhook URL: ${webhookUrl}`);
      }
    }
  }

  /**
   * Get webhook URL for a channel
   */
  getWebhookUrl(channelId: string): string | undefined {
    return this.channelIdToWebhookUrl.get(channelId);
  }

  /**
   * Send a message as an agent via webhook
   */
  async sendAsAgent(
    channelId: string,
    agentId: string,
    content: string,
    options?: {
      embedTitle?: string;
      embedDescription?: string;
      embedFields?: Array<{ name: string; value: string; inline?: boolean }>;
    }
  ): Promise<void> {
    const webhookUrl = this.getWebhookUrl(channelId);
    if (!webhookUrl) {
      throw new Error(`No webhook configured for channel ${channelId}`);
    }

    const webhook = this.webhooks.get(webhookUrl);
    if (!webhook) {
      throw new Error(`Webhook client not found for ${webhookUrl}`);
    }

    const agent = getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Prepare message
    const message: {
      username: string;
      avatarURL?: string;
      content?: string;
      embeds?: Array<{
        title?: string;
        description?: string;
        color?: number;
        fields?: Array<{ name: string; value: string; inline?: boolean }>;
      }>;
    } = {
      username: `${agent.emoji} ${agent.name}`,
      content,
    };

    // Add avatar if configured
    if (agent.avatar) {
      message.avatarURL = agent.avatar;
    }

    // Add embed if options provided
    if (options?.embedTitle || options?.embedDescription || options?.embedFields) {
      message.embeds = [{
        title: options.embedTitle,
        description: options.embedDescription,
        color: agent.color,
        fields: options.embedFields,
      }];
    }

    await webhook.send(message);
  }

  /**
   * Send a regular message via webhook (no agent)
   */
  async sendAsBot(
    channelId: string,
    content: string
  ): Promise<void> {
    const webhookUrl = this.getWebhookUrl(channelId);
    if (!webhookUrl) {
      throw new Error(`No webhook configured for channel ${channelId}`);
    }

    const webhook = this.webhooks.get(webhookUrl);
    if (!webhook) {
      throw new Error(`Webhook client not found for ${webhookUrl}`);
    }

    await webhook.send({ content });
  }

  /**
   * Check if webhook is configured for a channel
   */
  hasWebhook(channelId: string): boolean {
    return this.channelIdToWebhookUrl.has(channelId);
  }
}

export const webhookManager = new WebhookManager();
