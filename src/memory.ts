import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';

/**
 * Memory Manager - Interface to Claude-Mem MCP server
 * Provides automatic conversation persistence and retrieval
 */
export class MemoryManager {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private initialized = false;

  /**
   * Extract text from MCP content
   */
  private extractText(content: any): string {
    if (Array.isArray(content)) {
      return content
        .filter((item) => item.type === 'text')
        .map((item: TextContent) => item.text)
        .join('');
    }
    if (content?.type === 'text') {
      return content.text;
    }
    return '';
  }

  /**
   * Initialize MCP connection to memory server
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create MCP client
      this.client = new Client(
        {
          name: 'discord-claude-code',
          version: '0.1.0',
        },
        {
          capabilities: {},
        }
      );

      // Create stdio transport to memory server
      // This assumes claude-mem is available as an MCP server
      this.transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@thedotmack/claude-mem'],
      });

      // Connect to the memory server
      await this.client.connect(this.transport);
      this.initialized = true;

      console.log('✓ Connected to Claude-Mem MCP server');
    } catch (error) {
      console.warn('⚠ Failed to connect to Claude-Mem:', error);
      console.warn('⚠ Memory features will be disabled');
      this.initialized = false;
    }
  }

  /**
   * Ensure client is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.client || !this.initialized) {
      throw new Error('Memory server not available');
    }
  }

  /**
   * Save conversation to memory
   */
  async saveConversation(
    channelId: string,
    channelType: 'channel' | 'thread',
    userMessage: string,
    assistantMessage: string
  ): Promise<void> {
    try {
      await this.ensureInitialized();

      const entityName = `${channelType}:${channelId}`;
      const timestamp = new Date().toISOString();

      // Add observations to memory
      const result = await this.client!.callTool({
        name: 'add_observations',
        arguments: {
          observations: [
            {
              entityName,
              contents: [
                `[${timestamp}] User: ${userMessage}`,
                `[${timestamp}] Assistant: ${assistantMessage}`,
              ],
            },
          ],
        },
      }) as CallToolResult;

      if (result.isError) {
        throw new Error(this.extractText(result.content) || 'Unknown error');
      }

      console.log(`✓ Saved conversation to ${entityName}`);
    } catch (error) {
      console.warn('⚠ Failed to save conversation:', error);
      // Don't throw - memory is optional
    }
  }

  /**
   * Get past conversation context
   */
  async getPastContext(
    channelId: string,
    channelType: 'channel' | 'thread',
    maxObservations: number = 50
  ): Promise<string> {
    try {
      await this.ensureInitialized();

      const entityName = `${channelType}:${channelId}`;

      // Open the entity to get observations
      const result = await this.client!.callTool({
        name: 'open_nodes',
        arguments: {
          names: [entityName],
        },
      }) as CallToolResult;

      if (result.isError) {
        // Entity doesn't exist yet, return empty context
        return '';
      }

      // Extract observations from result
      const textContent = this.extractText(result.content);
      const nodes = JSON.parse(textContent || '{}');
      if (!nodes || nodes.length === 0) {
        return '';
      }

      const node = nodes[0];
      const observations = node.observations || [];

      // Get last N observations
      const recentObservations = observations.slice(-maxObservations);

      return recentObservations
        .map((obs: any) => obs.content)
        .join('\n');
    } catch (error) {
      console.warn('⚠ Failed to retrieve past context:', error);
      return '';
    }
  }

  /**
   * Search conversations
   */
  async search(query: string, limit: number = 10): Promise<string[]> {
    try {
      await this.ensureInitialized();

      const result = await this.client!.callTool({
        name: 'search_nodes',
        arguments: {
          query,
        },
      }) as CallToolResult;

      if (result.isError) {
        return [];
      }

      // Extract search results
      const textContent = this.extractText(result.content);
      const searchResults = JSON.parse(textContent || '[]');

      return searchResults
        .slice(0, limit)
        .map((result: any) => {
          const observations = result.observations || [];
          const snippet = observations
            .slice(-3)
            .map((o: any) => o.content)
            .join('\n');
          return `[${result.name}] ${snippet}`;
        });
    } catch (error) {
      console.warn('⚠ Failed to search memory:', error);
      return [];
    }
  }

  /**
   * Get all conversation entities (for /history command)
   */
  async getAllConversations(): Promise<
    Array<{ name: string; type: string; lastActivity: string }>
  > {
    try {
      await this.ensureInitialized();

      const result = await this.client!.callTool({
        name: 'read_graph',
        arguments: {},
      }) as CallToolResult;

      if (result.isError) {
        return [];
      }

      // Extract all nodes from graph
      const textContent = this.extractText(result.content);
      const graph = JSON.parse(textContent || '{}');
      const nodes = graph.nodes || [];

      return nodes
        .filter((node: any) => node.entityType === 'DiscordChannel')
        .map((node: any) => {
          const observations = node.observations || [];
          const lastObs = observations[observations.length - 1];
          const lastActivity = lastObs
            ? lastObs.content.match(/\[(.*?)\]/)?.[1] || 'Unknown'
            : 'Unknown';

          return {
            name: node.name,
            type: node.name.startsWith('channel:') ? 'channel' : 'thread',
            lastActivity,
          };
        });
    } catch (error) {
      console.warn('⚠ Failed to get conversations:', error);
      return [];
    }
  }

  /**
   * Check if memory is available
   */
  isAvailable(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Close connection to memory server
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
      this.initialized = false;
    }
  }
}

export const memoryManager = new MemoryManager();
