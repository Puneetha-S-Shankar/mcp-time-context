#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// Store the timestamp of the last message
var lastMessageTime = null;
// Helper: get human friendly time gap description
function describeTimeGap(lastTime, now) {
    var diffMs = now.getTime() - lastTime.getTime();
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMins / 60);
    var diffDays = Math.floor(diffHours / 24);
    if (diffMins < 2)
        return "just now (continuing the same conversation)";
    if (diffMins < 60)
        return "".concat(diffMins, " minutes ago (same session)");
    if (diffHours < 24)
        return "".concat(diffHours, " hour(s) ago \u2014 treat this as a returning user, not a continuous conversation");
    if (diffDays === 1)
        return "about 1 day ago \u2014 this is a next-day continuation, reset conversational tone accordingly";
    return "".concat(diffDays, " days ago \u2014 user is returning after a significant gap, treat this as a fresh start with prior context");
}
// Create the MCP server
var server = new index_js_1.Server({
    name: "mcp-time-context",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                tools: [
                    {
                        name: "get_time_context",
                        description: "Returns the current date, time, timezone, and how long it has been since the user last sent a message. Use this at the start of every conversation turn to understand temporal context.",
                        inputSchema: {
                            type: "object",
                            properties: {},
                            required: [],
                        },
                    },
                ],
            }];
    });
}); });
// Handle tool calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var now, gapContext, context;
    return __generator(this, function (_a) {
        if (request.params.name === "get_time_context") {
            now = new Date();
            gapContext = "This is the first message in this session.";
            if (lastMessageTime) {
                gapContext = "User's last message was ".concat(describeTimeGap(lastMessageTime, now));
            }
            // Update last message time
            lastMessageTime = now;
            context = {
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
                instruction: "Use this temporal context to respond naturally. If the user is returning after hours or days, acknowledge the time gap subtly and don't assume conversation continuity.",
            };
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(context, null, 2),
                        },
                    ],
                }];
        }
        throw new Error("Unknown tool: ".concat(request.params.name));
    });
}); });
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("mcp-time-context server running...");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Fatal error:", error);
    process.exit(1);
});
