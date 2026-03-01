# Setup Guide

Complete guide to set up Discord Claude Code bot.

## 📋 Prerequisites

- Node.js 20+ installed
- Claude Code CLI installed (`npm install -g @anthropic-ai/claude-code`)
- Discord account

---

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter application name (e.g., "Claude Code Bot")
4. Agree to terms and click **"Create"**

---

## Step 2: Create Discord Bot

1. In the left sidebar, click **"Bot"**
2. Click **"Add Bot"**
3. Confirm by clicking **"Yes, do it!"**

### Bot Configuration

1. Scroll down to **"Privileged Gateway Intents"**
2. Enable the following intents:
   - ✅ **Message Content Intent** (required for reading message content)
   - ✅ **Server Members Intent** (optional, for user whitelist)
   - ✅ **Presence Intent** (optional)

3. Click **"Save Changes"**

---

## Step 3: Get Bot Token

1. In the **"Bot"** section, click **"Reset Token"**
2. Copy the token (you won't be able to see it again!)
3. Save it securely - you'll need it for `.env`

> ⚠️ **Important**: Never share your bot token publicly or commit it to version control!

---

## Step 4: Invite Bot to Your Server

1. In the left sidebar, click **"OAuth2"** > **"URL Generator"**
2. Select the following scopes:
   - ✅ **bot**
   - ✅ **applications.commands** (for slash commands)

3. Under **"Bot Permissions"**, select:
   - ✅ **Read Messages/View Channels**
   - ✅ **Send Messages**
   - ✅ **Read Message History**
   - ✅ **Create Public Threads**
   - ✅ **Create Private Threads**
   - ✅ **Use External Emojis**
   - ✅ **Add Reactions**

4. Copy the generated URL
5. Paste it in your browser and select your server
6. Authorize the bot

---

## Step 5: (Optional) Configure Webhooks for Agent Display

> **Note**: This step is optional for Phase 2. For Phase 1 (simple implementation), you can skip this step.

### What are Webhooks?

Webhooks allow the bot to send messages with different usernames and avatars for visual distinction. Without webhooks, all messages will appear from the same bot user.

### Create Webhooks

For each channel where you want webhook support:

1. Open your Discord server
2. Go to the channel where you want to use Claude Code
3. Click **"⚙️"** (Channel Settings) next to the channel name
4. Select **"Integrations"** from the left sidebar
5. Click **"Webhooks"** > **"New Webhook"**
6. Enter webhook name (e.g., "Claude Code Agents")
7. Copy the **Webhook URL**
8. Click **"Save"**

> 💡 **Tip**: The webhook URL format is: `https://discord.com/api/webhooks/{WEBHOOK_ID}/{WEBHOOK_TOKEN}`

### Example Channel Setup

```
[Your Discord Server]
├── #general
│   └── Webhook URL: https://discord.com/api/webhooks/123/abc
├── #development
│   └── Webhook URL: https://discord.com/api/webhooks/456/def
└── #code-review
    └── Webhook URL: https://discord.com/api/webhooks/789/ghi
```

---

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```bash
   # Discord Bot Configuration
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_application_id_here

   # Session Configuration
   SESSION_TIMEOUT_MINUTES=30
   MAX_CONCURRENT_SESSIONS=5

   # Claude Code Configuration
   CLAUDE_CODE_PROJECT_DIR=/path/to/your/project

   # Webhook Configuration (one per channel)
   # Get Channel ID from Discord: right-click channel > Copy ID
   WEBHOOK_CHANNEL_123456789=https://discord.com/api/webhooks/.../...
   WEBHOOK_CHANNEL_987654321=https://discord.com/api/webhooks/.../...

   # Optional: User whitelist (comma-separated Discord user IDs)
   # ALLOWED_USER_IDS=123456789,987654321

   # Optional: Log level
   LOG_LEVEL=info
   ```

### How to Get Channel ID

1. Enable Developer Mode in Discord:
   - User Settings > Advanced > Enable Developer Mode
2. Right-click the channel > **"Copy ID"**
3. Paste into `.env` as `WEBHOOK_CHANNEL_{COPIED_ID}=...`

---

## Step 7: Install Dependencies

```bash
cd discord-claude-code
npm install
```

---

## Step 8: Build and Run

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

---

## Step 9: Verify Setup

1. Check bot is online:
   - Go to your Discord server
   - Look for the bot in the member list
   - It should show as "Online"

2. Test basic functionality (Phase 1):
   - Send a message in a channel with the bot (e.g., "Hello, can you help me?")
   - The bot should respond via Claude Code
   - Try asking a coding question to verify full functionality

3. Test webhook support (if configured in Step 5):
   - Send a message in a webhook-configured channel
   - The response should appear via webhook (different appearance if configured)

---

## 🎨 Phase 2 Features (Optional)

> **Note**: These features are planned for Phase 2 implementation.

### Agent Collaboration Display

When webhooks are configured in Phase 2, agents will appear with distinct identities:

| Agent | Username | Emoji | Color |
|-------|----------|-------|-------|
| Planner | 📋 Planner | 📋 | Blue |
| Architect | 🏗️ Architect | 🏗️ | Purple |
| TDD Guide | 🧪 TDD Guide | 🧪 | Green |
| Code Reviewer | 👁️ Code Reviewer | 👁️ | Orange |
| Security Reviewer | 🔒 Security Reviewer | 🔒 | Red |
| Build Resolver | 🔧 Build Resolver | 🔧 | Dark Orange |
| E2E Runner | 🎭 E2E Runner | 🎭 | Teal |
| Refactor Cleaner | 🧹 Refactor Cleaner | 🧹 | Gray |
| Doc Updater | 📚 Doc Updater | 📚 | Dark Blue |

### Example Discord Display

```
[Before - Without Webhook]
Claude Code Bot
I'll create a plan for the feature...

[After - With Webhook]
📋 Planner
I'll create a plan for the feature...
```

---

## 🔧 Troubleshooting

### Bot doesn't respond

1. Check bot token is correct in `.env`
2. Check bot has **"Read Messages/View Channels"** and **"Send Messages"** permissions
3. Check bot is online in Discord member list
4. Check console logs for errors

### Multi-agent not working

1. Verify webhook URLs are correct in `.env`
2. Verify channel IDs match your Discord channels
3. Check console logs for webhook registration messages
4. Try sending a manual message via webhook to test

### "Missing required environment variable"

1. Ensure you've created `.env` from `.env.example`
2. Ensure all required variables are set:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`

### "Claude Code is not installed"

1. Install Claude Code CLI:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. Verify installation:
   ```bash
   claude --version
   ```

---

## 📚 Advanced Configuration

### Session Timeout

Adjust `SESSION_TIMEOUT_MINUTES` in `.env`:
- **Shorter** (5-15 min): Saves resources, sessions close faster
- **Longer** (30-60 min): Keeps sessions active longer

### Max Concurrent Sessions

Adjust `MAX_CONCURRENT_SESSIONS` in `.env`:
- **Lower** (1-3): Fewer parallel sessions, more controlled
- **Higher** (5-10): More parallel sessions, more resource usage

### User Whitelist

Restrict bot to specific users:
```bash
ALLOWED_USER_IDS=123456789,987654321
```

To get your User ID:
1. Enable Developer Mode in Discord
2. Right-click your name > **"Copy ID"**

---

## 🎯 Next Steps

- [ ] Create custom agent avatars
- [ ] Set up slash commands (`/start`, `/stop`, `/status`)
- [ ] Configure additional channels
- [ ] Test with team members

---

## 📖 References

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Bot Documentation](https://discord.com/developers/docs/intro)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/quickstart)
