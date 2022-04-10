import { useWorkspace } from '@/composables';
import { Tweet } from '@/models';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

export const fetchTweets = async (filters = []) => {
  const { program } = useWorkspace();
  const tweets = await program.value.account.tweet.all(filters);
  return tweets.map((tweet) => new Tweet(tweet.publicKey, tweet.account));
};

export const authorFilter = (authorBase58PublicKey) => ({
  memcmp: {
    offset: 8,
    bytes: authorBase58PublicKey,
  },
});

export const topicFilter = (topic) => ({
  memcmp: {
    offset: 8 + 32 + 8 + 4,
    bytes: bs58.encode(Buffer.from(topic)),
  },
});
