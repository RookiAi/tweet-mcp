import { Tweet, TweetSearchResponse } from "./types.js";

export class TweetClient {
  private tweets: Tweet[] = [];
  private dataUrl =
    "https://raw.githubusercontent.com/RookiAi/rooki-app/refs/heads/main/public/tweets/Ycombinator.json";

  constructor() {
    this.loadTweets().catch(console.error);
  }

  private async loadTweets(): Promise<void> {
    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch tweets: ${response.statusText}`);
      }
      this.tweets = await response.json();
    } catch (error) {
      console.error("Error loading tweets:", error);
      this.tweets = [];
    }
  }

  private calculateRelevanceScore(tweet: Tweet, query: string): number {
    // Clean and prepare the text and query
    const tweetText = tweet.text.toLowerCase();
    const queryText = query.toLowerCase();

    // Split query into individual terms
    const queryTerms = queryText.split(/\s+/).filter((term) => term.length > 2);

    // If no valid terms, return 0 score
    if (queryTerms.length === 0) {
      return 0;
    }

    let score = 0;

    // Term matching score
    for (const term of queryTerms) {
      if (tweetText.includes(term)) {
        // Base score for term match
        score += 1;

        // Bonus points for exact word matches (with word boundaries)
        if (tweetText.match(new RegExp(`\\b${term}\\b`, "i"))) {
          score += 0.5;
        }

        // Extra bonus for terms at the beginning of tweet
        if (tweetText.indexOf(term) < 30) {
          score += 0.3;
        }
      }
    }

    // Whole phrase matching gives big bonus
    if (tweetText.includes(queryText)) {
      score += 2;
    }

    // Normalize by query length to avoid bias towards longer queries
    score = score / Math.max(1, queryTerms.length);

    // Recent tweets get slight boost (if created_at is available)
    try {
      const tweetDate = new Date(tweet.created_at);
      const now = new Date();
      const daysSincePosted =
        (now.getTime() - tweetDate.getTime()) / (1000 * 3600 * 24);
      if (daysSincePosted < 30) {
        score *= 1 + 0.2 * (1 - daysSincePosted / 30);
      }
    } catch (e) {
      // Skip date boosting if error
    }

    return score;
  }

  async searchTweets(query: string): Promise<TweetSearchResponse> {
    if (this.tweets.length === 0) {
      await this.loadTweets();
    }

    const results = this.tweets
      .map((tweet) => ({
        tweet,
        score: this.calculateRelevanceScore(tweet, query),
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.tweet);

    return {
      matches: results.slice(0, 10), // Return top 10 matches
      total: results.length,
    };
  }
}
