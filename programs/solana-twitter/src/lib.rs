use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("U2RnGBbTxEmLF5VZuvDRbRzmEcg5uWxCrWS2ebNHAxo");

#[program]
pub mod solana_twitter {
    use super::*;

    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> Result<()> {
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into());
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into());
        }

        tweet.author = *author.key;
        tweet.timestamp = clock.unix_timestamp;
        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}

#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(init, payer = author, space = Tweet::LEN)]
    pub tweet: Account<'info, Tweet>,

    #[account(mut)]
    pub author: Signer<'info>,

    #[account(address = system_program::ID)]
    /// CHECK:
    pub system_program: AccountInfo<'info>,
}

#[account]
pub struct Tweet {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;

// Stores the size of the string.
const STRING_LENGTH_PREFIX: usize = 4;

// 50 chars max.
const MAX_TOPIC_LENGTH: usize = 50 * 4;

// 280 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4;

// 3. Add a constant on the Tweet account that provides its total size.
impl Tweet {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content.
}
