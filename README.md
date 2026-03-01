# Discord Claude Code

> Discord bot for Claude Code - Use Claude Code from Discord with session management

[English](README.md) | [日本語](README.ja.md)

## 🎯 Features (Phase 1)

- ✅ **Discord UI** - Use Discord as input/output interface for Claude Code
- ✅ **Parallel Sessions** - Multiple concurrent sessions (thread/channel-based)
- ✅ **Context Persistence** - Automatic conversation memory via Claude-Mem MCP
- ✅ **Resource Management** - Auto-close sessions after timeout
- ✅ **Conversation History** - `/history` command to view past conversations
- ✅ **Full-text Search** - `/search` command to search conversation history
- ✅ **Lightweight** - Minimal resource footprint (no Docker required)

### 🧠 Automatic Memory

Conversations are **automatically saved** and **restored** - no manual intervention required:

```
User: (Sends message in Discord)
   ↓
Bot: (Automatically retrieves past conversation context)
   ↓
Bot: (Sends context + message to Claude Code)
   ↓
Bot: (Automatically saves the conversation to memory)
```

**User experience**: Just chat normally. Your conversations are automatically remembered!

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

### Commands

| Command | Description |
|---------|-------------|
| `/history` | List all past conversations across channels/threads |
| `/search <query>` | Search conversation history |
| `/help` | Show help message |

### Chatting

Simply send a message in any channel/thread with the bot:

```
User: Hello, can you help me build a REST API?
Bot: Of course! Let's start by...
```

**No setup required** - conversations are automatically saved and restored!

### Memory Features

- **Automatic Persistence**: All conversations are automatically saved to Claude-Mem
- **Context Restoration**: When you return to a channel/thread, past context is automatically loaded
- **Cross-Session Search**: Use `/search` to find information from any past conversation
- **History View**: Use `/history` to see all your conversations

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
