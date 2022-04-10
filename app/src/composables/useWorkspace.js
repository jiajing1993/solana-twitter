import { computed } from 'vue';
import { useAnchorWallet } from 'solana-wallets-vue';
import { Connection, PublicKey } from '@solana/web3.js';
import { Provider, Program } from '@project-serum/anchor';
import idl from '../../../target/idl/solana_twitter.json';
import idl from '@/idl/solana_twitter.json';

const preflightCommitment = 'processed';
const commitment = 'processed';
const programID = new PublicKey(idl.metadata.address);
let workspace = null;

const clusterURL = process.env.VUE_APP_CLUSTER_URL;

export const useWorkspace = () => workspace;

export const initWorkspace = () => {
  const wallet = useAnchorWallet();
  const connection = new Connection(clusterURL, commitment);
  const provider = computed(
    () =>
      new Provider(connection, wallet.value, {
        preflightCommitment,
        commitment,
      })
  );
  const program = computed(() => new Program(idl, programID, provider.value));

  workspace = { wallet, connection, provider, program };
};
