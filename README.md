# Discord Claude Code

> Discord bot for Claude Code - Use Claude Code from Discord with session management

## 🎯 Features (Phase 1)

- ✅ **Discord UI** - Use Discord as input/output interface for Claude Code
- ✅ **Parallel Sessions** - Multiple concurrent sessions (thread/channel-based)
- ✅ **Context Persistence** - Maintain context during active sessions
- ✅ **Resource Management** - Auto-close sessions after timeout
- ✅ **Lightweight** - Minimal resource footprint (no Docker required)

### 🚧 Planned Features (Phase 2)

- ⏳ **Agent Collaboration Display** - Visualize agent consultation progress in Discord (optional feature)
- ⏳ **Slash Commands** - `/start`, `/stop`, `/status` commands
- ⏳ **File Upload** - Share files with Claude via Discord

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Discord token

# Run
npm run dev
```

> 📖 **Need detailed setup instructions?** See [SETUP.md](SETUP.md) for a complete guide including Discord bot creation, webhook configuration, and troubleshooting.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Discord token

# Run
npm run dev
```

> 📖 **Need detailed setup instructions?** See [SETUP.md](SETUP.md) for a complete guide including Discord bot creation, webhook configuration, and troubleshooting.

## 📋 Requirements

1. **Discord Bot Token** - Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. **Node.js 20+** - Required runtime
3. **Claude Code** - Install via `npm install -g @anthropic-ai/claude-code`

## 🔧 Discord Bot Setup

1. Create a new application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot and get the token
3. Enable necessary bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Create Public Threads
   - Create Private Threads
   - Use External Emojis
4. Invite the bot to your server with the generated URL

## 📖 Usage

| Command | Description |
|---------|-------------|
| `/start` | Start a new Claude Code session in the current thread/channel |
| `/stop` | Stop the current session |
| `/status` | Check session status |
| `/help` | Show help message |

Simply send a message in a registered thread/channel to interact with Claude.

## 🏗️ Architecture

```
[Discord] ←→ [Discord Bot] ←→ [Session Manager] ←→ [Claude Code CLI]
                      ↓
                 [SQLite DB]
```

- **Discord Bot** - Handles Discord events and messages
- **Session Manager** - Manages Claude Code sessions per thread/channel
- **Claude Code CLI** - Subprocess for Claude Code execution

## 📝 Project Structure

```
discord-claude-code/
├── src/
│   ├── index.ts      # Entry point
│   ├── bot.ts        # Discord bot setup
│   ├── claude.ts     # Claude Code wrapper
│   ├── session.ts    # Session management
│   ├── agents.ts     # Agent definitions
│   ├── webhook.ts    # Webhook management
│   └── config.ts     # Configuration
├── SETUP.md          # Setup guide
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [chadingTV/claudecode-discord](https://github.com/chadingTV/claudecode-discord) - Reference implementation
- [zebbern/claude-code-discord](https://github.com/zebbern/claude-code-discord) - Reference implementation
