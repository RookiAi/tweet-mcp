import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchTweetsTool, handleSearchTweets } from "./tools/index.js";
import { TweetClient } from "./client.js";

export function createStandaloneServer(apiKey: string): Server {
  const serverInstance = new Server(
    {
      name: "mcp-server",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const tweetClient = new TweetClient();

  serverInstance.setNotificationHandler(
    InitializedNotificationSchema,
    async () => {
      console.log("MCP client initialized");
    }
  );

  serverInstance.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [searchTweetsTool],
  }));

  serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "search_tweets":
        return await handleSearchTweets(tweetClient, args);
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  });

  return serverInstance;
}

export class MCPServer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getServer(): Server {
    return createStandaloneServer(this.apiKey);
  }
}
