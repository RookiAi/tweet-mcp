# YCombinator Tweet Search MCP Server

This Model Context Protocol (MCP) server provides a tool for searching through YCombinator tweets using natural language queries.

## Setup

1. **Environment Configuration**

   Create a `.env` file in the project root with:

   ```properties
   MCP_API_KEY=your_api_key_here
   ```

2. **Installation**

   Install dependencies:

   ```bash
   npm install
   ```

3. **Building the Server**

   Compile TypeScript:

   ```bash
   npm run build
   ```

4. **Running the Server**

   Start the server:

   ```bash
   npm start
   ```

   For development with stdio transport:

   ```bash
   npm run dev:stdio
   ```

## Using the Tweet Search Tool

The server provides a `search_tweets` tool that accepts natural language queries to search through YCombinator tweets.

### Tool Parameters

```json
{
  "name": "search_tweets",
  "params": {
    "query": "your search query here"
  }
}
```

### Example Queries

- "startup funding"
- "AI projects"
- "YC companies"
- "founder advice"
- "demo day"

### Response Format

The tool returns a formatted list of matching tweets with:

- Date
- Tweet type (RETWEETED, QUOTED, REPLIED_TO) if applicable
- Tweet content

### Integration with LLM Systems

This server implements the Model Context Protocol, making it compatible with:

- Anthropic Claude
- OpenAI models
- Custom MCP clients

## How It Works

1. Tweets are fetched from the configured GitHub URL
2. Each tweet is scored against the query using a relevance algorithm
3. Top 10 most relevant results are returned
4. Results include date, context (if it's a retweet, etc.), and content

## Development

To modify the search algorithm, look at the `calculateRelevanceScore` function in `src/client.ts`.

To change the tweet formatting, modify the `handleSearchTweets` function in `src/tools/tweets.ts`.
