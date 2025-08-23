export interface ReferencedTweet {
  type: "retweeted" | "quoted" | "replied_to";
  id: string;
}

export interface Tweet {
  created_at: string;
  edit_history_tweet_ids: string[];
  referenced_tweets?: ReferencedTweet[];
  text: string;
  id: string;
  author_id: string;
  in_reply_to_user_id?: string;
}

export interface TweetSearchArgs {
  query: string;
}

export interface TweetSearchResponse {
  matches: Tweet[];
  total: number;
}
