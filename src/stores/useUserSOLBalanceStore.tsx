import create, { State } from 'zustand';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UserSOLBalanceStore extends State {
  balance: number;
  getUserSOLBalance: (publicKey: PublicKey, connection: Connection) => void;
  subscribeToBalanceChanges: (publicKey: PublicKey, connection: Connection) => void;
}

const useUserSOLBalanceStore = create<UserSOLBalanceStore>((set) => ({
  balance: 0,
  getUserSOLBalance: async (publicKey, connection) => {
    let balance = 0;
    try {
      balance = await connection.getBalance(publicKey, 'confirmed');
      balance = balance / LAMPORTS_PER_SOL;
    } catch (e) {
      console.log(`Error getting balance: `, e);
    }
    set((state) => {
      state.balance = balance;
      console.log(`Balance updated: `, balance);
    });
  },
  subscribeToBalanceChanges: (publicKey, connection) => {
    const subscriptionId = connection.onAccountChange(publicKey, (accountInfo) => {
      const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
      set((state) => {
        state.balance = balance;
        console.log(`Balance updated: `, balance);
      });
    });
    
    // Unsubscribe from balance changes when the component unmounts
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  },
}));

export default useUserSOLBalanceStore;
