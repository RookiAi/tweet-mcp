import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { TweetClient } from "../client.js";
import { TweetSearchArgs } from "../types.js";

export const searchTweetsTool: Tool = {
  name: "search_tweets",
  description:
    "Search YCombinator tweets using natural language queries. Returns tweets that best match the query.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Natural language query to search tweets",
      },
    },
    required: ["query"],
  },
};

function isTweetSearchArgs(args: unknown): args is TweetSearchArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as TweetSearchArgs).query === "string"
  );
}

export async function handleSearchTweets(
  client: TweetClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (!isTweetSearchArgs(args)) {
      throw new Error("Invalid arguments for search_tweets");
    }

    const result = await client.searchTweets(args.query);

    // Format the results in a readable way
    const formattedResults = result.matches
      .map((tweet) => {
        const date = new Date(tweet.created_at).toLocaleDateString();

        // Determine tweet type (retweet, quote, reply)
        let tweetType = "";
        if (tweet.referenced_tweets?.length) {
          const refType = tweet.referenced_tweets[0].type;
          switch (refType) {
            case "retweeted":
              tweetType = "🔄 ";
              break;
            case "quoted":
              tweetType = "💬 ";
              break;
            case "replied_to":
              tweetType = "↩️ ";
              break;
            default:
              tweetType = "";
          }
        }

        // Highlight any text that matches query terms
        let highlightedText = tweet.text;

        // Format tweet ID
        const tweetId = `ID: ${tweet.id}`;

        // Build the formatted tweet
        return `📅 ${date}\n${tweetType}${highlightedText}\n${tweetId}`;
      })
      .join("\n\n---\n\n");

    const summary = `📊 Found ${result.total} matching tweets. Showing top ${result.matches.length}:\n\n`;

    return {
      content: [
        {
          type: "text",
          text: summary + formattedResults,
        },
      ],
      isError: false,
    };
    return {
      content: [
        {
          type: "text",
          text: summary + formattedResults,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}
