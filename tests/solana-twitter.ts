import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as assert from 'assert';

describe("solana-twitter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;

  it("can send a new tweet", async () => {
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet(
      'TOPIC HERE', 'CONTENT HERE',
      {
        accounts: {
          tweet: tweet.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [tweet],
      }
    )

    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'TOPIC HERE');
    assert.equal(tweetAccount.content, 'CONTENT HERE');
    assert.ok(tweetAccount.timestamp);
  });

  it("can send a new tweet without a topic", async () => {
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet(
      '', 'CONTENT HERE',
      {
        accounts: {
          tweet: tweet.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [tweet],
      }
    )



    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.topic, '');
    assert.equal(tweetAccount.content, 'CONTENT HERE');
    assert.ok(tweetAccount.timestamp);
  });

  it("can send a new tweet from a different author", async () => {

    // Generate another user and airdrop them some SOL.
    const otherUser = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);

    await program.provider.connection.confirmTransaction(signature);

    // Call the "SendTweet" instruction on behalf of this other user.
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet(
      'TOPIC HERE', 'CONTENT HERE',
      {
        accounts: {
          tweet: tweet.publicKey,
          author: otherUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [otherUser, tweet],
      }
    )

    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'TOPIC HERE');
    assert.equal(tweetAccount.content, 'CONTENT HERE');
    assert.ok(tweetAccount.timestamp);
  });

  it("cannot provide a topic with more than 50 characters", async () => {
    try {
      const tweet = anchor.web3.Keypair.generate();
      const topicWith51Chars = 'x'.repeat(51);
      await program.rpc.sendTweet(
        topicWith51Chars, 'CONTENT HERE',
        {
          accounts: {
            tweet: tweet.publicKey,
            author: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId
          },
          signers: [tweet],
        }
      );
    } catch (error) {
      assert.equal(error.msg, 'The provided topic should be 50 characters long maximum.');
      return;
    }

    assert.fail('The instruction should have failed with a 51-character topic.');
  });

  it('cannot provide a content with more than 280 characters', async () => {
    try {
        const tweet = anchor.web3.Keypair.generate();
        const contentWith281Chars = 'x'.repeat(281);
        await program.rpc.sendTweet('veganism', contentWith281Chars, {
            accounts: {
                tweet: tweet.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [tweet],
        });
    } catch (error) {
        assert.equal(error.msg, 'The provided content should be 280 characters long maximum.');
        return;
    }

    assert.fail('The instruction should have failed with a 281-character content.');
  });

});
