#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Store the timestamp of the last message
let lastMessageTime: Date | null = null;

// Helper: get human friendly time gap description
function describeTimeGap(lastTime: Date, now: Date): string {
  const diffMs = now.getTime() - lastTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return "just now (continuing the same conversation)";
  if (diffMins < 60) return `${diffMins} minutes ago (same session)`;
  if (diffHours < 24) return `${diffHours} hour(s) ago — treat this as a returning user, not a continuous conversation`;
  if (diffDays === 1) return `about 1 day ago — this is a next-day continuation, reset conversational tone accordingly`;
  return `${diffDays} days ago — user is returning after a significant gap, treat this as a fresh start with prior context`;
}

// Create the MCP server
const server = new Server(
  {
    name: "mcp-time-context",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_time_context",
        description:
          "Returns the current date, time, timezone, and how long it has been since the user last sent a message. Use this at the start of every conversation turn to understand temporal context.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_time_context") {
    const now = new Date();

    // Build time gap context
    let gapContext = "This is the first message in this session.";
    if (lastMessageTime) {
      gapContext = `User's last message was ${describeTimeGap(lastMessageTime, now)}`;
    }

    // Update last message time
    lastMessageTime = now;

    const context = {
      current_date: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      current_time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      iso_timestamp: now.toISOString(),
      unix_timestamp: Math.floor(now.getTime() / 1000),
      conversation_gap: gapContext,
      instruction:
        "Use this temporal context to respond naturally. If the user is returning after hours or days, acknowledge the time gap subtly and don't assume conversation continuity.",
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(context, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-time-context server running...");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});