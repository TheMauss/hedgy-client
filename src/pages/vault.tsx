import Head from "next/head";
import { FC, useState, useEffect, useCallback } from "react";
import {
  Connection,
  SystemProgram,
  Transaction,
  TransactionSignature,
  PublicKey,
  LAMPORTS_PER_SOL,
  EpochSchedule,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { UserAccount } from "../out/accounts/UserAccount"; // Update with the correct path
import { LiquidityPoolAccount } from "../out/accounts/LiquidityPoolAccount";
import { LiquidityProviderAccount } from "../out/accounts/LiquidityProviderAccount";
import {
  initializeUserAcc,
  InitializeUserAccArgs,
  InitializeUserAccAccounts,
} from "../out/instructions/initializeUserAcc"; // Update with the correct path
import {
  WithdrawFromLiquidityPoolArgs,
  StakeAndMintTokensArgs,
  WithdrawFromLiquidityPoolAccounts,
  withdrawFromLiquidityPool,
  StakeAndMintTokensAccounts,
  stakeAndMintTokens,
} from "../out/instructions/"; // Update with the correct path
import { PROGRAM_ID } from "../out/programId";
import { notify } from "utils/notifications";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import { BN } from "@project-serum/anchor";
import moment from "moment-timezone";
import { token } from "@project-serum/anchor/dist/cjs/utils";
require('dotenv').config();


const HOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_HOUSE_WALLET);
const SIGNERWALLET = new PublicKey(process.env.NEXT_PUBLIC_SIGNER_WALLET);
const PDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_PDA_HOUSEWALLET);
const USDCMINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
const ASSOCIATEDTOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM);
const TOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM);
const PUSDCMINT = new PublicKey(process.env.NEXT_PUBLIC_PUSDC_MINT);
const PSOLMINT = new PublicKey(process.env.NEXT_PUBLIC_PSOL_MINT);
const USDCPDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_USDCPDA_HOUSEWALLET);




async function checkLPdata(
  lpAcc: PublicKey,
  connection: Connection
): Promise<{
  IsInitialized: boolean;
  locked: boolean;
  epoch: number;
  totalDeposits: number;
  usdcTotalDeposits: number;
  lpFees: number;
  pnl: number;
  usdcLpFees: number;
  usdcPnl: number;
  cumulativeFeeRate: number;
  cumulativePnlRate: number;
  psolValuation: number;
  pusdcValuation: number;
}> {
  const accountInfo = await connection.getAccountInfo(lpAcc);

  if (!accountInfo) {
    return {
      IsInitialized: false,
      locked: false,
      epoch: 0,
      totalDeposits: 0,
      usdcTotalDeposits: 0,
      lpFees: 0,
      pnl: 0,
      usdcLpFees: 0,
      usdcPnl: 0,
      cumulativeFeeRate: 0,
      cumulativePnlRate: 0,
      psolValuation: 0,
      pusdcValuation: 0,
    };
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let LpAccount;
  try {
    // Use the AffiliateAccount class to decode the data
    LpAccount = LiquidityPoolAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode affiliate account data:", error);
    throw error;
  }

  return {
    IsInitialized: LpAccount.isInitialized,
    locked: LpAccount.locked,
    epoch: LpAccount.epoch.toNumber(),
    usdcTotalDeposits: LpAccount.usdcTotalDeposits.toNumber(),
    totalDeposits: LpAccount.totalDeposits.toNumber(),
    lpFees: LpAccount.lpFees.toNumber(),
    pnl: LpAccount.pnl.toNumber(),
    usdcLpFees: LpAccount.usdcLpFees.toNumber(),
    usdcPnl: LpAccount.usdcPnl.toNumber(),
    cumulativeFeeRate: LpAccount.cumulativeFeeRate.toNumber(),
    cumulativePnlRate: LpAccount.cumulativePnlRate.toNumber(),
    psolValuation: LpAccount.psolValuation.toNumber(),
    pusdcValuation: LpAccount.pusdcValuation.toNumber(),
  };
}

async function isUserAccountInitialized(
  account: PublicKey,
  connection: Connection
): Promise<{
  isInitialized: boolean;
  usedAffiliate: Uint8Array;
  myAffiliate: Uint8Array;
}> {
  const accountInfo = await connection.getAccountInfo(account);

  if (!accountInfo) {
    console.error("Account not found or not fetched properly.");
    // You'll need to decide on an appropriate default return here.
    return {
      isInitialized: false,
      usedAffiliate: new Uint8Array(8).fill(0),
      myAffiliate: new Uint8Array(8).fill(0),
    };
  }

  const bufferData = Buffer.from(accountInfo.data);

  let userAcc;
  try {
    userAcc = UserAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode user account data:", error);
    return {
      isInitialized: false,
      usedAffiliate: new Uint8Array(8).fill(0),
      myAffiliate: new Uint8Array(8).fill(0),
    };
  }

  return {
    isInitialized: userAcc.isInitialized,
    usedAffiliate: userAcc.usedAffiliate,
    myAffiliate: userAcc.myAffiliate,
  };
}

async function checkLiquidiryProviderAcc(
  liqProviderAcc: PublicKey,
  connection: Connection
): Promise<{
  isInitialized: boolean;
  withdrawalRequestAmount: number;
  withdrawalRequestEpoch: number;
  usdcWithdrawalRequestAmount: number;
  usdcWithdrawalRequestEpoch: number;
}> {
  const accountInfo = await connection.getAccountInfo(liqProviderAcc);

  if (!accountInfo) {
    return {
      isInitialized: false,
      withdrawalRequestAmount: 0,
      withdrawalRequestEpoch: 0,
      usdcWithdrawalRequestAmount: 0,
      usdcWithdrawalRequestEpoch: 0,
    };
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let LiqProviderAcc;
  try {
    // Use the AffiliateAccount class to decode the data
    LiqProviderAcc = LiquidityProviderAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode affiliate account data:", error);
    throw error;
  }

  return {
    isInitialized: LiqProviderAcc.isInitialized,
    withdrawalRequestAmount: LiqProviderAcc.withdrawalRequestAmount.toNumber(),
    withdrawalRequestEpoch: LiqProviderAcc.withdrawalRequestEpoch.toNumber(),
    usdcWithdrawalRequestAmount: LiqProviderAcc.usdcWithdrawalRequestAmount.toNumber(),
    usdcWithdrawalRequestEpoch: LiqProviderAcc.usdcWithdrawalRequestEpoch.toNumber(),
  };
}

async function findSplTokenAccountSync(walletAddress, currency) {
  let mintAddress;

  if (currency === 'USDC') {
    mintAddress = PUSDCMINT;
  } else if (currency === 'SOL') {
    mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
  } else {
    throw new Error('Unsupported currency');
  }

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      TOKENPROGRAM.toBuffer(),
      mintAddress.toBuffer(),
    ],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function usdcSplTokenAccountSync(walletAddress) {
  let mintAddress = USDCMINT

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      TOKENPROGRAM.toBuffer(),
      mintAddress.toBuffer(),
    ],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function getSplTokenBalance(connection, walletAddress, selectedCurrency) {
  try {
    console.log('Wallet Address:', walletAddress);
    console.log('Selected Currency:', selectedCurrency);

    if (!walletAddress) {
      throw new Error('Wallet address is undefined');
    }

    if (!(walletAddress instanceof PublicKey)) {
      walletAddress = new PublicKey(walletAddress);
    }


    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress,   { programId: TOKENPROGRAM }
      );

    let mintAddress;

    if (selectedCurrency === 'USDC') {
      console.log('USDC Mint Address:', PUSDCMINT);
      mintAddress = new PublicKey(PUSDCMINT);
    } else if (selectedCurrency === 'SOL') {
      console.log('SOL Mint Address:', PSOLMINT);
      mintAddress = new PublicKey(PSOLMINT);
    } else {
      throw new Error(`Unsupported currency: ${selectedCurrency}`);
    }

    const specificTokenAccounts = tokenAccounts.value.filter(account => 
      account.account.data.parsed.info.mint === mintAddress.toString()
    );

    let totalBalance = 0;
    specificTokenAccounts.forEach(account => {
      totalBalance += account.account.data.parsed.info.tokenAmount.uiAmount;
    });

    return totalBalance;

  } catch (error) {
    console.error('Error fetching SPL token balance:', error);
    throw error;
  }
}




const Earn: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [LPdata, setLPdata] = useState<{
    IsInitialized: boolean;
    locked: boolean;
    epoch: number;
    totalDeposits: number;
    usdcTotalDeposits: number;
    lpFees: number;
    pnl: number;
    usdcLpFees: number;
    usdcPnl: number;
    cumulativeFeeRate: number;
    cumulativePnlRate: number;
    psolValuation: number;
    pusdcValuation: number;  
  } | null>(null);
  const [LProviderdata, setLProviderdata] = useState<{
    isInitialized: boolean;
    withdrawalRequestAmount: number;
    withdrawalRequestEpoch: number;
    usdcWithdrawalRequestAmount: number;
    usdcWithdrawalRequestEpoch: number;
  } | null>(null);
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const [depositValue, setdepositValue] = useState("");
  const [withdrawValue, setwithdrawValue] = useState("");
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const [isInit, setisInit] = useState<{
    isInitialized: boolean;
    usedAffiliate: Uint8Array;
    myAffiliate: Uint8Array;
  }>(null);

  const [leaderboard30Days, setLeaderboard30Days] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState<'SOL' | 'USDC'>('USDC');
  const [splTokenAccount, setSplTokenAccount] = useState<PublicKey | null>(null);
  const [usdcSplTokenAccount, setUsdcSplTokenAccount] = useState<PublicKey | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);


  


  const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT8;
  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const res30Days = await fetch(`${ENDPOINT}/api/leaderboard/30`);
        const leaderboard30Days = await res30Days.json();

        setLeaderboard30Days(leaderboard30Days);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      }
    };

    fetchLeaderboards();
  }, []);

  const calculateAPY = () => {
    let APY = 0;
    leaderboard30Days.forEach((item) => {
      APY += (item.Fees * 4) / 10 + -item.PnL;
    });
    return APY / LAMPORTS_PER_SOL;
  };

  const fetchcheckuserdata = async () => {
    if (!publicKey) {
      setisInit(null); // Reset the userAffiliateData if publicKey is not defined
      return;
    }

    const seedsUser = [Buffer.from(publicKey.toBytes())];
    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);

    // Check if the user has an affiliate code when the component mounts
    if (publicKey) {
      const result = await isUserAccountInitialized(userAcc, connection);
      setisInit(result);
    }
  };
  useEffect(() => {
    fetchcheckuserdata();
  }, [publicKey, connection]);

  useEffect(() => {
    const updateSplTokenAccounts = async () => {
      if (publicKey) {
        try {
          // Find SPL token account for the preferred currency
          const splAcc = await findSplTokenAccountSync(publicKey, selectedCurrency);
          setSplTokenAccount(splAcc);

          // Find SPL token account for USDC
          const usdcAcc = await usdcSplTokenAccountSync(publicKey);
          setUsdcSplTokenAccount(usdcAcc);
        } catch (error) {
          console.error('Error finding SPL token accounts:', error);
          // Handle errors, e.g., reset state or show notification
          setSplTokenAccount(null);
          setUsdcSplTokenAccount(null);
        }
      } else {
        // Reset state if no wallet is connected
        setSplTokenAccount(null);
        setUsdcSplTokenAccount(null);
      }
    };

    updateSplTokenAccounts();
  }, [publicKey, selectedCurrency]);

  useEffect(() => {
    const updateSplTokenAccounts = async () => {
      if (publicKey) {
        try {
          // Find SPL token account for the preferred currency
          const tokenBalance = await getSplTokenBalance(connection, publicKey, selectedCurrency);
          setTokenBalance(tokenBalance);

        } catch (error) {
          console.error('Error finding SPL token accounts:', error);
          // Handle errors, e.g., reset state or show notification
          setTokenBalance(0);

        }
      } else {
        // Reset state if no wallet is connected
        setTokenBalance(0);
      }
    };

    updateSplTokenAccounts();
  }, [publicKey, selectedCurrency, connection]);

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
    const preNumericValue = inputValue.replace(/,/g, ".");
    const numericValue = preNumericValue.replace(/[^0-9.]/g, "");

    // Count the occurrences of dot (.)
    const dotCount = (numericValue.match(/\./g) || []).length;

    // If there is more than one dot, keep only the portion before the second dot
    let sanitizedValue = numericValue;
    if (dotCount > 1) {
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.lastIndexOf(".")
      );
    }

    // Set the sanitized value as the amount value
    setdepositValue(sanitizedValue);
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
    const preNumericValue = inputValue.replace(/,/g, ".");
    const numericValue = preNumericValue.replace(/[^0-9.]/g, "");

    // Count the occurrences of dot (.)
    const dotCount = (numericValue.match(/\./g) || []).length;

    // If there is more than one dot, keep only the portion before the second dot
    let sanitizedValue = numericValue;
    if (dotCount > 1) {
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.lastIndexOf(".")
      );
    }

    // Set the sanitized value as the amount value
    setwithdrawValue(sanitizedValue);
  };

  const signature: TransactionSignature = "";

  const deposittoLP = useCallback(async () => {
    if (!publicKey) {
      notify({
        type: "error",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    const houseHarcodedkey = HOUSEWALLET;
    const signerWalletAccount = SIGNERWALLET;
    const seedsLpAcc = [
      Buffer.from(houseHarcodedkey.toBytes()),
      Buffer.from(signerWalletAccount.toBytes()),
    ];

    let mintAddress;
    let usdc;
    let deposit;
        if (selectedCurrency === 'USDC') {
      mintAddress = PUSDCMINT;
      usdc = 1;
      deposit = parseFloat(depositValue) * LAMPORTS_PER_SOL/1000;
    } else if (selectedCurrency === 'SOL') {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
      deposit = parseFloat(depositValue) * LAMPORTS_PER_SOL;

    } 
    const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);


    if (LPdata?.locked) {
      notify({ type: "info", message: `Vault is locked.` });
    } else if (parseFloat(depositValue) < 1) {
      notify({ type: "info", message: `Minimum deposit is 1 SOL.` });
    } else if (
      parseFloat(depositValue) + LPdata.totalDeposits / LAMPORTS_PER_SOL >
      1500
    ) {
      const remainingDeposit =
        1500 - Number(LPdata.totalDeposits) / Number(LAMPORTS_PER_SOL);
      notify({
        type: "info",
        message: `Vault is almost full, you can deposit ${remainingDeposit.toFixed(1)} SOL.`,
      });
    } else {
      try {
        const LPAccseeds = [
          Buffer.from(houseHarcodedkey.toBytes()),
          Buffer.from(publicKey.toBytes()),
        ];

        const [LProviderAcc] = await PublicKey.findProgramAddress(
          LPAccseeds,
          PROGRAM_ID
        );

        const args: StakeAndMintTokensArgs = {
          depositAmount: new BN(deposit),
          usdc: usdc,
        };
        const accounts: StakeAndMintTokensAccounts = {
          providersWallet: publicKey,
          lpAcc: lpAcc,
          signerWalletAccount: SIGNERWALLET,
          houseAcc: HOUSEWALLET,
          pdaHouseAcc: PDAHOUSEWALLET,
          mint: mintAddress,
          usdcMint: USDCMINT,
          providersSplTokenAccount: splTokenAccount,
          usdcProvidersWallet: usdcSplTokenAccount,
          usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
          tokenProgram: TOKENPROGRAM,
          systemProgram: SystemProgram.programId,
        };

        const initTransaction = new Transaction().add(
          stakeAndMintTokens(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        notify({
          type: "info",
          message: `Depositing into the vault.`,
          txid: signature,
        });
        await connection.confirmTransaction(initSignature, "confirmed");
        const result = await checkLiquidiryProviderAcc(
          LProviderAcc,
          connection
        );
        setLProviderdata(result);
        setLPdata((prevState) => ({
          ...prevState,
          totalDeposits: prevState.totalDeposits + deposit,
        }));
        notify({
          type: "success",
          message: `Successfully deposited into the Vault`,
        });
      } catch (error) {
        notify({
          type: "error",
          message: `Failed to deposit into the Vault`,
          description: error?.message,
        });
      }
    }
  }, [publicKey, depositValue, LPdata, LProviderdata, selectedCurrency, splTokenAccount, usdcSplTokenAccount]);

  const withdrawfromLP = useCallback(async () => {
    if (!publicKey) {
      notify({
        type: "error",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    let mintAddress;
    let usdc;
    if (selectedCurrency === 'USDC') {
      mintAddress = PUSDCMINT;
      usdc = 1;
    } else if (selectedCurrency === 'SOL') {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
    } 

    const houseHarcodedkey = HOUSEWALLET;
    const signerWalletAccount = SIGNERWALLET;
    const seedsLpAcc = [
      Buffer.from(houseHarcodedkey.toBytes()),
      Buffer.from(signerWalletAccount.toBytes()),
    ];
    const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);
    const LPAccseeds = [
      Buffer.from(houseHarcodedkey.toBytes()),
      Buffer.from(publicKey.toBytes()),
    ];

    const [LProviderAcc] = await PublicKey.findProgramAddress(
      LPAccseeds,
      PROGRAM_ID
    );

    const seedsRatio = [Buffer.from(houseHarcodedkey.toBytes())];

    const [ratioAcc] = await PublicKey.findProgramAddress(
      seedsRatio,
      PROGRAM_ID
    );

    

    let withdraw = 0; // Initializing withdraw as a number with an initial value of 0.
    if (
      LProviderdata?.withdrawalRequestAmount != 0 &&
      LProviderdata?.withdrawalRequestEpoch == LPdata?.epoch
    ) {
      withdraw = LProviderdata?.withdrawalRequestAmount;
    } else (withdraw = parseFloat(withdrawValue) * LAMPORTS_PER_SOL);
    console.log(withdraw);
    if (LPdata?.locked) {
      notify({ type: "info", message: `Vault is locked.` });
    } else {
      try {
        const args: WithdrawFromLiquidityPoolArgs = {
          withdrawAmount: new BN(withdraw),
          usdc: usdc,
        };

        const accounts: WithdrawFromLiquidityPoolAccounts = {
          liqProvider: LProviderAcc,
          providersWallet: publicKey,
          lpAcc: lpAcc,
          signerWalletAccount: SIGNERWALLET,
          houseAcc: HOUSEWALLET,
          pdaHouseAcc: PDAHOUSEWALLET,
          mint: mintAddress,
          usdcMint: USDCMINT,
          providersSplTokenAccount: splTokenAccount,
          usdcProvidersWallet: usdcSplTokenAccount,
          usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
          tokenProgram: TOKENPROGRAM,
          ratioAcc: ratioAcc,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
          systemProgram: SystemProgram.programId,
        };

        const initTransaction = new Transaction().add(
          withdrawFromLiquidityPool(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        notify({
          type: "info",
          message: `Requesting Withdrawal`,
          txid: signature,
        });
        await connection.confirmTransaction(initSignature, "confirmed");
        notify({
          type: "success",
          message: `Withdrawal Successful`,
        });
      } catch (error) {
        notify({
          type: "error",
          message: `Withdrawal Failed`,
          description: error?.message,
        });
      }
    }
  }, [publicKey, withdrawValue, LPdata, LProviderdata, selectedCurrency, splTokenAccount, usdcSplTokenAccount]);

  const [timeUntilNextEpoch, setTimeUntilNextEpoch] = useState("");
  const [timeUntilNextlockEpoch, setTimeUntillockNextEpoch] = useState("");

  useEffect(() => {
    const calculateTimeUntilMonday = () => {
      const now = moment().tz("Europe/London");
      let startOfNextWeek = moment()
        .tz("Europe/London")
        .startOf("week")
        .add(1, "day"); // This is the next Monday

      // If today is Sunday or any day after Monday, then find the next Monday.
      if (now.day() > 1) {
        startOfNextWeek = startOfNextWeek.add(1, "week");
      }

      const diffInHours = startOfNextWeek.diff(now, "hours");
      const diffInDays = startOfNextWeek.diff(now, "days");

      if (diffInDays >= 1) {
        return `${diffInDays} ${diffInDays > 1 ? "days" : "day"}`;
      } else {
        return `${diffInHours} ${diffInHours > 1 ? "hours" : "hour"}`;
      }
    };

    setTimeUntillockNextEpoch(calculateTimeUntilMonday());

    // Optional: Update the countdown every minute.
    const interval = setInterval(() => {
      setTimeUntillockNextEpoch(calculateTimeUntilMonday());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTimeUntilSaturday = () => {
      const now = moment().tz("Europe/London");
      let endOfWorkWeek = moment()
        .tz("Europe/London")
        .endOf("week")
        .subtract(1, "days"); // This is the next Friday

      // If today is after Friday, it should reset for the next Friday, so add 7 days.
      if (now.day() > 6) {
        endOfWorkWeek = endOfWorkWeek.add(1, "week");
      }

      const diffInHours = endOfWorkWeek.diff(now, "hours");
      const diffInDays = endOfWorkWeek.diff(now, "days");

      if (diffInDays >= 1) {
        return `${diffInDays} ${diffInDays > 1 ? "days" : "day"}`;
      } else {
        return `${diffInHours} ${diffInHours > 1 ? "hours" : "hour"}`;
      }
    };

    setTimeUntilNextEpoch(calculateTimeUntilSaturday());

    // Optional: Update the countdown every minute.
    const interval = setInterval(() => {
      setTimeUntilNextEpoch(calculateTimeUntilSaturday());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLpstatus = async () => {
      console.log('HOUSEWALLET:', HOUSEWALLET); // Check if it's undefined or not a valid input

      const houseHarcodedkey = new PublicKey(
        HOUSEWALLET
      );
      const signerWalletAccount = new PublicKey(
        SIGNERWALLET
      );
      const seedsLpAcc = [
        Buffer.from(houseHarcodedkey.toBytes()),
        Buffer.from(signerWalletAccount.toBytes()),
      ];
      const [lpAcc] = await PublicKey.findProgramAddress(
        seedsLpAcc,
        PROGRAM_ID
      );

      // Check if the user has an affiliate code when the component mounts
      if (lpAcc) {
        const results = await checkLPdata(lpAcc, connection);
        setLPdata(results);
      }
    };

    fetchLpstatus();
  }, [connection]);

  useEffect(() => {
    const fetchcheckLiquidiryProviderAcc = async () => {
      if (!publicKey) {
        setLProviderdata(null); // Reset the userAffiliateData if publicKey is not defined
        return;
      }

      const houseHarcodedkey = new PublicKey(
        HOUSEWALLET
      );

      const seedsUser = [
        Buffer.from(houseHarcodedkey.toBytes()),
        Buffer.from(publicKey.toBytes()),
      ];
      const [userAcc] = await PublicKey.findProgramAddress(
        seedsUser,
        PROGRAM_ID
      );

      // Check if the user has an affiliate code when the component mounts
      if (publicKey) {
        const result = await checkLiquidiryProviderAcc(userAcc, connection);
        setLProviderdata(result);
      }
    };

    fetchcheckLiquidiryProviderAcc();
  }, [publicKey, connection]);


  const [activeSection, setActiveSection] = useState("deposit");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showDeposit = () => setActiveSection("deposit");
  const showWithdraw = () => setActiveSection("withdraw");

  const result =
    LProviderdata?.withdrawalRequestAmount != 0 &&
    (LProviderdata?.withdrawalRequestEpoch == LPdata?.epoch ||
      LProviderdata?.withdrawalRequestEpoch == LPdata?.epoch + 1)
      ? (
          (LProviderdata?.withdrawalRequestAmount || 0) / LAMPORTS_PER_SOL
        ).toFixed(2)
      : "0 SOL";

      const usdcresult =
    LProviderdata?.usdcWithdrawalRequestAmount != 0 &&
    (LProviderdata?.usdcWithdrawalRequestEpoch == LPdata?.epoch ||
      LProviderdata?.usdcWithdrawalRequestEpoch == LPdata?.epoch + 1)
      ? (
          (LProviderdata?.usdcWithdrawalRequestAmount || 0) / LAMPORTS_PER_SOL
        ).toFixed(2)
      : "0 USDC";

  return (
    <div>
      <Head>
        <title>PopFi | Vault</title>
        <meta name="description" content="PopFi" />
      </Head>

      <div className="bg-base flex justify-center items-top md:pt-2 min-h-[calc(100vh-78px)]">
        <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] ">
          <div className="w-full bankGothic flex md:flex-row flex-col  gap-[8px] text-4xl mt-2 lg:text-5xl text-white md:justify-between items-center justify-center">
            <h1 className="bankGothic md:text-start text-center text-4xl mt-2 lg:text-5xl text-transparent bg-clip-text bg-white">
              Vault
            </h1>
            <div className="w-[300px] flex flex-row items-center justify-center text-lg text-primary font-bankgothic-md-bt border-b-[1px] border-solid border-layer-3">
        <button
          className={`flex-1   h-10 flex flex-row  items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
            selectedCurrency === "SOL"
              ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-b-[2px] border-solid border-primary"
              : "text-grey long-short-button"
          }`}
          onClick={() => setSelectedCurrency('SOL')} 
        >
          <div
            className={`flex justify-center items-center h-full w-full rounded-lg ${
              selectedCurrency === "SOL" ? "" : ""
            }`}
          >
            <div
              className={`bankGothic uppercase  ${
                selectedCurrency === "SOL" ? "" : ""
              }`}
            >
              SOL
            </div>
          </div>
        </button>
        <button
          className={`flex-1   h-10 flex flex-row items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
            selectedCurrency === "USDC"
            ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-b-[2px] border-solid border-primary"
            : "text-grey long-short-button"
          }`}
          onClick={() => setSelectedCurrency('USDC')} // Set selectedCurrency to 'USDC'
        >
          <div
            className={`bankGothic  uppercase ${
              selectedCurrency === "USDC" ? "" : ""
            }`}
          >
            USDC
          </div>
        </button>
      </div>

          </div>
          <img
            className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/sheesh/abstract06.svg"
          />
          <div className="pt-2 bankGothic text-grey-text flex md:flex-row flex-col items-center justify-center gap-[16px] text-base  w-full px-2 md:px-0">
            <div className="z-10 md:w-[55%] w-full flex flex-col items-center justify-center relative gap-[8px] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
              <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-end justify-center">
                <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-row items-center justify-center md:px-8 sm:gap-[16px]">
                <img
  className="my-0 mx-[!important] top-[20px] left-[calc(50%_-_143px)] sm:w-1/2 sm:min-w-[100px] w-1/3 min-w-[75px] sm:max-w-[150px] max-w-[100] z-[1] sm:p-0 p-3"
  alt={selectedCurrency}
  src={selectedCurrency === "SOL" ? "/coins/SOLLP.png" : "/coins/USDCLP.png"}
/>
                  <div className="flex flex-col w-2/3 text-left h-[62px] flex flex-col items-start justify-center gap-[8px] z-[0] text-[18px]">
                    <div className="relative leading-[100%] font-medium">
                    {selectedCurrency === "SOL" ? 
    (
      `SOLANA VAULT`
    ) : 
    (
      `USDC VAULT`
    )
  }
                    </div>
                    <div className="relative text-[36px] leading-[100%] font-semibold font-poppins bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] text-left">
                      {(
                        (calculateAPY() /
                          (LPdata?.totalDeposits / LAMPORTS_PER_SOL)) *
                        100 *
                        12
                      ).toFixed(1)}
                      % APY
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="z-10 bankGothic text-grey-text md:rounded-2xl rounded-lg bg-layer-1 box-border w-full flex sm:flex-row flex-col sm:items-center sm:justify-start items-start justify-center md:p-8 p-4 gap-[32px] text-sm border-[1px] border-solid border-layer-3">
              <div className="w-1/2 flex flex-col items-start justify-center gap-[32px]">
                <div className="flex flex-row items-center justify-start gap-[8px]">
                  <img
                    className="relative rounded-lg w-[42px] h-[42px]"
                    alt=""
                    src="/sheesh/icons.svg"
                  />
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className=" relative leading-[100%] font-medium">
                      EPOCH
                    </div>
                    <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                      {LPdata?.epoch || 0}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-start gap-[8px]">
                  <img
                    className="relative rounded-lg w-[42px] h-[42px]"
                    alt=""
                    src="/sheesh/icons1.svg"
                  />
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="relative leading-[100%] font-medium">
                      TOKEN RATIO
                    </div>
                    <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                    {selectedCurrency === "SOL" ? 
    (
      `${(
        (LPdata?.psolValuation || 0) / LAMPORTS_PER_SOL
      ).toFixed(2)} pSOL/SOL`
    ) : 
    (
      `${(
        (LPdata?.pusdcValuation || 0) / LAMPORTS_PER_SOL
      ).toFixed(2)} pUSDC/USD`
    )
  }

                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start justify-center gap-[32px]">
                <div className="flex flex-row items-center justify-start gap-[8px]">
                  <img
                    className="relative rounded-lg w-[42px] h-[42px]"
                    alt=""
                    src="/sheesh/icons2.svg"
                  />
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="relative leading-[100%] font-medium">
                      TVL
                    </div>
                    <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                    {selectedCurrency === "SOL" ? 
    (
      `${((LPdata?.totalDeposits || 0) / LAMPORTS_PER_SOL).toFixed(2)} SOL`
    ) : 
    (
      `${((LPdata?.usdcTotalDeposits || 0) / LAMPORTS_PER_SOL*1000).toFixed(0)} USDC`
    )
  }
                    </div>
                  </div>
                </div>
                {LPdata?.locked ? (
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons3.svg"
                    />

                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] font-medium">
                        UNLOCKING IN
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {timeUntilNextEpoch}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons4.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] font-medium">
                        LOCKING IN
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {timeUntilNextlockEpoch}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:hidden flex justify-center items-center gap-4 my-4">
            <button
              onClick={showDeposit}
              className={`text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                activeSection === "deposit"
                  ? " cursor-pointer border-b-2 border-gradient"
                  : "cursor-pointer text-grey-text "
              } ${activeSection === "withdraw" ? "" : "text-gray-text"} `}
            >
              Deposit
            </button>
            <button
              onClick={showWithdraw}
              className={`text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                activeSection === "withdraw"
                  ? "cursor-pointer border-b-2 border-gradient"
                  : "cursor-pointer text-grey-text "
              } ${activeSection === "deposit" ? "" : "text-gray-text"} `}
            >
              Withdraw
            </button>
          </div>
          <div className="z-10 mt-4 text-grey-text bankGothic w-full flex md:flex-row flex-col items-start justify-start gap-[16px] text-sm px-2 md:px-0">
            {(activeSection === "deposit" || !isMobile) && (
              <div className="md:w-1/2 self-stretch flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[24px] border-[1px] border-solid border-layer-3">
                <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl text-white">
                  <div className="hidden md:flex relative leading-[100%] text-[30px] font-medium">
                    DEPOSIT
                  </div>
                  <div className="self-stretch relative text-base leading-[140%] font-light font-poppins text-grey-text">
                    <p className="m-0">
                      Stake your SOL in the vault and earn fees from every trade
                      carried out on our platform. As a staker, you stand as the
                      counterparty for these trades, allowing the accumulated
                      fees to boost your stake constantly.
                    </p>
                    <p className="m-0">&nbsp;</p>
                    <p className="m-0">
                      A heads up: You can&apos;t directly pull out your assets
                      once they&apos;re in. Our withdrawal system is
                      epoch-oriented, as elaborated on the Withdraw panel.
                    </p>
                  </div>
                </div>
                <div className="self-stretch flex flex-col gap-[12px] sm:gap-[0px] items-start justify-center sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons7.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] font-medium">
                        DEPOSITED
            
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">

                      {selectedCurrency === "SOL" ? 
    (
      `${(
        (tokenBalance * LPdata?.psolValuation || 0) / LAMPORTS_PER_SOL
      ).toFixed(2)} SOL`
    ) : 
    (
      `${(
        (tokenBalance * LPdata?.pusdcValuation || 0) / LAMPORTS_PER_SOL
      ).toFixed(0)} USDC`
    )
  }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-[62px] flex flex-col items-start justify-start gap-[8px] font-poppins">
                  <div className="self-stretch flex flex-col items-start justify-start">
                    <div className="relative leading-[14px] inline-block max-w-[131px]">
                      Enter Amount
                    </div>
                  </div>
                  <div className="hover:bg-[#484c6d5b] self-stretch rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey border-[1px] border-solid border-layer-3">
                    <input
                      type="text"
                      className="w-full h-full input3-capsule__input relative leading-[14px] "
                      id="affiliateCode"
                      placeholder="0.00"
                      value={depositValue}
                      onChange={handleInputChange}
                      min={0.05}
                      step={0.05}
                      max={balance}
                    />
                    <button
                      onClick={() => {
                        // Assuming 'balance' is a numeric state or prop
                        const maxValue = (Number(balance) - 1 / 100)
                          .toFixed(2)
                          .toString();
                        setdepositValue(maxValue); // Update the state, which will update the input value reactively
                      }}
                      className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]  w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={deposittoLP}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] hover:bg-opacity-60 bg-opacity-80 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      DEPOSIT
                    </button>
                </div>
              </div>
            )}
            {(activeSection === "withdraw" || !isMobile) && (
              <div className="self-stretch md:w-1/2 z-10 flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[12px] border-[1px] border-solid border-layer-3">
                <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl text-white">
                  <div className="hidden md:flex  relative leading-[100%] font-medium  text-[30px]">
                    WITHDRAW
                  </div>
                  <div className="self-stretch relative text-base leading-[140%] font-light font-poppins text-grey-text">
                    Throughout the week, your staked SOL earns trade fees.
                    Withdrawals, processed on an epoch basis, can be initiated
                    only during weekends and are available for claiming the
                    following weekend. This schedule ensures the system&apos;s
                    stability and security. Consider the benefits of ongoing
                    staking before withdrawing.
                  </div>
                </div>
                <div className=" self-stretch relative box-border h-px " />
                <div className="self-stretch flex flex-col gap-[12px] items-start justify-start  sm:justify-between">
                  <div className=" flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px]"
                      alt=""
                      src="/sheesh/icons6.svg"
                    />
                    <div className="flex flex-col items-start justify-start gap-[4px]">
                      <div className="relative leading-[100%] font-medium">
                        WITHDRAWABLE
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
  
                      {selectedCurrency === "SOL" ? 
    (
      `${(
        (tokenBalance  || 0)
      ).toFixed(2)} pSOL`
    ) : 
    (
      `${(
        (tokenBalance  || 0)
      ).toFixed(0)} pUSDC`
    )
  }
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px]"
                      alt=""
                      src="/sheesh/icons1.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] font-medium">
                        PENDING WITHDRAWAL
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {selectedCurrency === "SOL" ? 
    (
      `${result}`
    ) : 
    (
      `${usdcresult}`
    )
  }
                      </div>
                    </div>
                  </div>
                </div>
                {LProviderdata?.withdrawalRequestAmount != 0 &&
                LProviderdata?.withdrawalRequestEpoch == LPdata?.epoch ? (
                  <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]   w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={withdrawfromLP}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      CLAIM WITHDRAWALS
                    </button>
                  </div>
                ) : (
                  <div className="w-full pt-3">
                    <div className="self-stretch h-[62px] flex flex-col items-start justify-start gap-[8px] font-poppins">
                      <div className="self-stretch flex flex-col items-start justify-start">
                        <div className="relative leading-[14px] inline-block max-w-[131px]">
                          Enter Amount
                        </div>
                      </div>
                      <div className=" hover:bg-[#484c6d5b] self-stretch rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey border-[1px] border-solid border-layer-3">
                        <input
                          type="text"
                          className="w-full h-full input3-capsule__input relative leading-[14px] "
                          id="affiliateCode"
                          placeholder="0.00"
                          value={withdrawValue}
                          onChange={handleInputChange2}
                          min={0.05}
                          max="100"
                        />
                        <button
                          onClick={() => {
                            if (
                           0
                            ) {
                              const maxValue = (
                              0
                              ).toString();
                              setwithdrawValue(maxValue);
                            }
                          }}
                          className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]  w-full h-10   box-border text-center text-lg">
                        <button
                          onClick={withdrawfromLP}
                          className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                        >
                          WITHDRAW
                        </button>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earn;
