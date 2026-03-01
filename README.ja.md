# Discord Claude Code

> Discordボット for Claude Code - Discordからセッション管理付きでClaude Codeを使う

## 🎯 機能（フェーズ1）

- ✅ **Discord UI** - DiscordをClaude Codeの入出力インターフェースとして使用
- ✅ **並行セッション** - 複数の同時セッション（スレッド/チャンネルベース）
- ✅ **コンテキスト永続化** - Claude-Mem MCPによる自動会話メモリ
- ✅ **リソース管理** - タイムアウト後の自動セッションクローズ
- ✅ **会話履歴** - `/history` コマンドで過去の会話を表示
- ✅ **全文検索** - `/search` コマンドで会話履歴を検索
- ✅ **軽量** - 最小限のリソース消費（Docker不要）

### 🧠 自動メモリ

会話は**自動的に保存・復元**されます - 手動操作は一切不要：

```
ユーザー: (Discordでメッセージ送信)
   ↓
ボット: (自動的に過去の会話コンテキストを取得)
   ↓
ボット: (コンテキスト + メッセージをClaude Codeに送信)
   ↓
ボット: (自動的に会話をメモリに保存)
```

**ユーザー体験**: 普通にチャットするだけ。会話は自動的に覚えています！

### 🚧 計画中の機能（フェーズ2）

- ⏳ **エージェント協業表示** - Discordでエージェントの相談進捗を可視化（オプション機能）
- ⏳ **スラッシュコマンド** - `/start`、`/stop`、`/status` コマンド
- ⏳ **ファイルアップロード** - Discord経由でClaudeとファイルを共有

## 🚀 クイックスタート

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envをDiscordトークンで編集

# 実行
npm run dev
```

> 📖 **詳細なセットアップ手順が必要ですか？** [SETUP.md](SETUP.md)で完全ガイドを確認してください（Discordボット作成、Webhook設定、トラブルシューティング含む）

## 📋 要件

1. **Discordボットトークン** - [Discord Developer Portal](https://discord.com/developers/applications)でボットを作成
2. **Node.js 20+** - 必要なランタイム
3. **Claude Code** - `npm install -g @anthropic-ai/claude-code` でインストール

## 🔧 Discordボットのセットアップ

1. [Discord Developer Portal](https://discord.com/developers/applications)でアプリケーションを作成
2. ボットを作成してトークンを取得
3. 必要なボット権限を有効化：
   - Read Messages/View Channels
   - Send Messages
   - Create Public Threads
   - Create Private Threads
   - Use External Emojis
4. 生成されたURLでボットをサーバーに招待

## 📖 使い方

### コマンド

| コマンド | 説明 |
|---------|-------------|
| `/history` | 全チャンネル/スレッドの過去の会話を一覧表示 |
| `/search <query>` | 会話履歴を検索 |
| `/help` | ヘルプメッセージを表示 |

### チャット

ボットがあるチャンネル/スレッドでメッセージを送るだけ：

```
ユーザー: Hello, REST APIの作成を手伝ってくれる？
ボット: もちろん！始めましょう...
```

**セットアップ不要** - 会話は自動的に保存・復元されます！

### メモリ機能

- **自動永続化**: 全ての会話が自動的にClaude-Memに保存されます
- **コンテキスト復元**: チャンネル/スレッドに戻ると、過去のコンテキストが自動的にロードされます
- **クロスセッション検索**: `/search` で任意の過去会話から情報を検索できます
- **履歴表示**: `/history` で全ての会話を確認できます

## 🏗️ アーキテクチャ

```
[Discord] ←→ [Discord Bot] ←→ [Session Manager] ←→ [Claude Code CLI]
                      ↓
                 [Claude-Mem MCP]
```

- **Discord Bot** - Discordイベントとメッセージを処理
- **Session Manager** - チャンネル/スレッドごとのClaude Codeセッションを管理
- **Claude Code CLI** - Claude Code実行用のサブプロセス
- **Claude-Mem** - 会話の永続化と検索

## 📝 プロジェクト構造

```
discord-claude-code/
├── src/
│   ├── index.ts      # エントリーポイント
│   ├── bot.ts        # Discordボットセットアップ
│   ├── claude.ts     # Claude Codeラッパー
│   ├── session.ts    # セッション管理
│   ├── memory.ts     # メモリ管理（Claude-Mem）
│   ├── agents.ts     # エージェント定義
│   ├── webhook.ts    # Webhook管理
│   └── config.ts     # 設定
├── SETUP.md          # セットアップガイド
├── README.md         # 英語README
├── README.ja.md      # 日本語README
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🤝 コントリビューション

コントリビューションを歓迎します！お気軽にPull Requestを提出してください。

## 📄 ライセンス

MIT License - 詳細はLICENSEファイルを参照してください

## 🙏 謝辞

- [chadingTV/claudecode-discord](https://github.com/chadingTV/claudecode-discord) - 参考実装
- [zebbern/claude-code-discord](https://github.com/zebbern/claude-code-discord) - 参考実装
