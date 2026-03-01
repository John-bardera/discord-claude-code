import { DiscordClaudeBot } from './bot.js';
import { config } from './config.js';

/**
 * Entry point for Discord Claude Code bot
 */
async function main(): Promise<void> {
  console.log('🤖 Discord Claude Code Bot');
  console.log('============================');
  console.log('');

  try {
    const bot = new DiscordClaudeBot();
    await bot.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
