# mcp-time-context

An open-source MCP (Model Context Protocol) server that gives LLMs real-time awareness of the current date, time, and how long it has been since your last message.

## The Problem

When you use Claude (or any LLM) across multiple sessions, it has no sense of time passing between your messages. If you texted it yesterday and come back today, it treats your new message as if it was sent seconds after the last one — leading to awkward, context-unaware responses.

You end up having to manually say things like *"it's the next day"* or *"this is a new conversation"* just to get a natural response.

**mcp-time-context fixes this automatically.**

## What It Does

Every time Claude responds, it can call this MCP server to get:

- ✅ Current date and time (with timezone)
- ✅ How long it's been since your last message
- ✅ A natural language instruction to Claude on how to adjust its tone

**Example output Claude receives:**
```json
{
  "current_date": "Tuesday, March 17, 2026",
  "current_time": "09:45 AM IST",
  "iso_timestamp": "2026-03-17T04:15:00.000Z",
  "unix_timestamp": 1742184900,
  "conversation_gap": "User's last message was about 1 day ago — this is a next-day continuation, reset conversational tone accordingly",
  "instruction": "Use this temporal context to respond naturally. If the user is returning after hours or days, acknowledge the time gap subtly and don't assume conversation continuity."
}
```

## Gap Detection Logic

| Time Since Last Message | What Claude Is Told |
|---|---|
| < 2 minutes | Continuing same conversation |
| 2–60 minutes | Same session, X minutes ago |
| 1–24 hours | Returning user, don't assume continuity |
| 1 day | Next-day continuation, reset tone |
| 2+ days | Significant gap, treat as fresh start |

## Installation

### Prerequisites
- Node.js v16+
- Claude Desktop app

### Step 1 — Clone the repo
```bash
git clone https://github.com/puneethass/mcp-time-context.git
cd mcp-time-context
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Build
```bash
npm run build
```

### Step 4 — Add to Claude Desktop config

Open your Claude Desktop config file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following (update the path to match where you cloned the repo):
```json
{
  "mcpServers": {
    "mcp-time-context": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-time-context/dist/index.js"]
    }
  }
}
```

### Step 5 — Restart Claude Desktop

Fully quit and reopen Claude Desktop. You should see the 🔨 hammer icon in the chat input — that means the MCP server is connected.

## Usage

Once connected, Claude will automatically call `get_time_context` to understand the temporal context of your conversation. No extra steps needed on your end.

## Available Tool

### `get_time_context`

Returns current date, time, timezone, and conversation gap context. Takes no input parameters.

## Tech Stack

- TypeScript
- Node.js
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

## Compatibility

| Platform | Supported |
|---|---|
| Claude Desktop | ✅ |
| Claude Code | ✅ |
| Any MCP-enabled client | ✅ |
| claude.ai (browser) | ⏳ Coming soon (pending Anthropic rollout) |

## Why I Built This

I was using Claude as a thinking partner across multiple days. Every time I came back after a few hours or the next day, I had to manually tell it *"it's the next day"* to get a response that made sense in context. That friction was annoying — so I built a tool that handles it automatically.

## License

MIT
