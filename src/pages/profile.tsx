import Head from "next/head";
import { FC, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Modal from "react-modal";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import {
  initializeUserAcc,
  InitializeUserAccArgs,
  InitializeUserAccAccounts,
} from "../out/instructions/initializeUserAcc"; // Update with the correct path
import { PROGRAM_ID } from "../out/programId";
import { UserAccount } from "../out/accounts/UserAccount"; // Update with the correct path
import { notify } from "utils/notifications";
import { AffiliateAccount } from "../out/accounts/AffiliateAccount";
import { initializeAffilAcc } from "../out/instructions/initializeAffilAcc"; // Update with the correct path
import {
  withdrawAffiliateEarnings,
  WithdrawAffiliateEarningsArgs,
} from "../out/instructions/withdrawAffiliateEarnings"; // Update with the correct path
import {
  setAffilAcc,
  SetAffilAccArgs,
  SetAffilAccAccounts,
} from "../out/instructions/setAffilAcc"; // Update with the correct path
import {
  Connection,
  SystemProgram,
  Transaction,
  TransactionSignature,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import SimpleLineChart from "../components/SimpleLineChart";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const USDCMINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
const ASSOCIATEDTOKENPROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM
);
const TOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM);
const PDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_PDA_HOUSEWALLET);
const USDCPDAHOUSEWALLET = new PublicKey(
  process.env.NEXT_PUBLIC_USDCPDA_HOUSEWALLET
);

type UserStatsType = {
  playerAcc: string;
  totalTrades: number;
  totalVolume: number;
  winRate: number;
  creationTime: number;
  PnL: number;
  ROI: number;
  // other fields...
};

async function usdcSplTokenAccountSync(walletAddress) {
  let mintAddress = USDCMINT;

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [walletAddress.toBuffer(), TOKENPROGRAM.toBuffer(), mintAddress.toBuffer()],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function doesUserhaveAffiliateCode(
  account: PublicKey,
  connection: Connection
): Promise<{
  hasCode: boolean;
  hasReferralCode: boolean;
  myAffiliate: Uint8Array;
  usedAffiliate: Uint8Array;
  creationTime: number;
  isInitialized: boolean;
  currentEpochVolume: number;
  prevTradingVolume: number;
  rebateTier: number;
}> {
  const accountInfo = await connection.getAccountInfo(account);

  if (!accountInfo) {
    console.error("Account not found or not fetched properly.");
    return {
      hasCode: false,
      hasReferralCode: false,
      myAffiliate: new Uint8Array(8),
      usedAffiliate: new Uint8Array(8),
      creationTime: 0,
      isInitialized: false,
      currentEpochVolume: 0,
      prevTradingVolume: 0,
      rebateTier: 0,
    }; // default value
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let userAccount;
  try {
    // Use the UserAccount class to decode the data
    userAccount = UserAccount.decode(bufferData);
    console.log("Decoded user account:", userAccount);
  } catch (error) {
    console.error("Failed to decode user account data:", error);
    return {
      hasCode: false,
      hasReferralCode: false,
      myAffiliate: new Uint8Array(8),
      usedAffiliate: new Uint8Array(8),
      creationTime: 0,
      isInitialized: false,
      currentEpochVolume: 0,
      prevTradingVolume: 0,
      rebateTier: 0,
    }; // default value
  }

  // Convert BN to number
  const creationTimeNumber = userAccount.creationTime.toNumber();
  const usercurrentEpochVolume = userAccount.currentEpochVolume.toNumber();
  const userprevTradingVolume = userAccount.prevTradingVolume.toNumber();
  const userrebateTier = userAccount.rebateTier.toNumber();

  const hasCode = userAccount.usedAffiliate.some((value) => value !== 0);
  const hasReferralCode = userAccount.myAffiliate.some((value) => value !== 0);

  console.log("My Affiliate:", userAccount.myAffiliate);

  return {
    hasCode,
    hasReferralCode,
    myAffiliate: userAccount.myAffiliate,
    usedAffiliate: userAccount.usedAffiliate,
    creationTime: creationTimeNumber,
    isInitialized: userAccount.isInitialized, // Assuming userAccount has an isInitialized property
    currentEpochVolume: usercurrentEpochVolume,
    prevTradingVolume: userprevTradingVolume,
    rebateTier: userrebateTier,
  };
}

async function checkAffiliateInitialization(
  affiliatePublicKey: PublicKey,
  connection: Connection
): Promise<{ IsInitialized: boolean }> {
  const accountInfo = await connection.getAccountInfo(affiliatePublicKey);

  if (!accountInfo) {
    return { IsInitialized: false };
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let affiliateAccount;
  try {
    // Use the AffiliateAccount class to decode the data
    affiliateAccount = AffiliateAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode affiliate account data:", error);
    throw error;
  }

  return {
    IsInitialized: affiliateAccount.isInitialized, // assuming isInitialized is a method
  };
}

function affiliateCodeToUint8Array(input: string): Uint8Array {
  const byteArray = new Uint8Array(8).fill(0);
  for (let i = 0; i < 8 && i < input.length; i++) {
    byteArray[i] = input.charCodeAt(i);
  }
  return byteArray;
}

const Stats: FC = () => {
  const [leaderboardallDays, setLeaderboardallDays] = useState([]);
  const [userData, setUserData] = useState<UserStatsType | null>(null);
  const [hasAffiliate, setHasAffiliate] = useState<boolean | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [usedAffiliate, setusedAffiliate] = useState<Uint8Array>(
    new Uint8Array()
  );

  const [userAffiliateData, setUserAffiliateData] = useState<{
    hasCode: boolean;
    hasReferralCode: boolean;
    myAffiliate: Uint8Array;
    usedAffiliate: Uint8Array;
    creationTime: number;
    isInitialized: boolean;
    currentEpochVolume: number;
    prevTradingVolume: number;
    rebateTier: number;
  } | null>(null);

  const [accOld, setaccOld] = useState<number>(null);
  const [issInt, setissInt] = useState<boolean>(null);
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const [rebateTier, setrebateTier] = useState<number>(null);
  const [totalVolumepast4Epoch, settotalVolumepast4Epoch] =
    useState<number>(null);
  const [UserData1Day, setUserData1Day] = useState([]);
  const [UserData7Days, setUserData7Days] = useState([]);
  const [UserData30Days, setUserData30Days] = useState([]);

  const [currentLeaderboard, setCurrentLeaderboard] = useState([]);
  const [latestPnL, setLatestPnL] = useState(null);
  const [latestRoi, setLatestRoi] = useState(null);
  const [tradesSum, setTradesSum] = useState(null);

  const [toggleState, setToggleState] = useState("LONG");

  const setToggleChangeLong = () => {
    setToggleState("LONG");
  };

  const setToggleChangeShort = () => {
    setToggleState("SHORT");
  };

  async function getAffiliateData(
    affiliatePublicKey: PublicKey,
    connection: Connection
  ): Promise<{ account: AffiliateAccount }> {
    const accountInfo = await connection.getAccountInfo(affiliatePublicKey);

    if (!accountInfo) {
      throw new Error("Account not found or not fetched properly.");
    }

    // Convert the buffer from Solana into a Buffer type that's used by Borsh
    const bufferData = Buffer.from(accountInfo.data);

    let affiliateAccount;
    try {
      // Use the AffiliateAccount class to decode the data
      affiliateAccount = AffiliateAccount.decode(bufferData);
    } catch (error) {
      console.error("Failed to decode affiliate account data:", error);
      throw error;
    }

    return {
      account: affiliateAccount.toJSON(),
    };
  }

  const LAMPORTS_PER_SOL = 1_000_000_000;
  const wallet = useWallet();
  const userPublicKey = wallet.publicKey?.toBase58();

  const ENDPOINT8 = process.env.NEXT_PUBLIC_ENDPOINT8;

  const preprocessData = (data, timeframe) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Sort data by the 'hour' field
    const sortedData = data.sort((a, b) => a.hour - b.hour);

    // Calculate the interval based on timeframe
    const interval =
      timeframe === "1D"
        ? 3600
        : timeframe === "7D"
          ? 4 * 3600
          : timeframe === "30D"
            ? 24 * 3600
            : 1; // Default interval for ALL

    // Assuming the first entry should start with 0 PnL
    const initialPoint = {
      ...sortedData[0],
      PnL: 0,
      Roi: 0,
      hour: sortedData[0].hour - interval, // setting to one interval before the first
    };

    return [initialPoint, ...sortedData];
  };

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection]);

  const createDefaultZeroLineData = (timeframe) => {
    const data = [];
    let startTime;

    switch (timeframe) {
      case "1D": // 1 Day - 24 hourly points
        startTime = Date.now() / 1000 - 24 * 3600; // 24 hours ago
        for (let i = 0; i < 24; i++) {
          data.push({ hour: new Date(startTime + i * 3600), PnL: 0, Roi: 0 });
        }
        break;
      case "7D": // 7 Days - 7 * 24 hourly points
        startTime = Date.now() / 1000 - 7 * 24 * 3600; // 7 days ago
        for (let i = 0; i < 7 * 24; i++) {
          data.push({ hour: new Date(startTime + i * 3600), PnL: 0, Roi: 0 });
        }
        break;

      case "30D": // 30 Days - 30 daily points
        startTime = Date.now() / 1000 - 30 * 24 * 3600; // 30 days ago
        for (let i = 0; i < 30; i++) {
          data.push({
            hour: new Date(startTime + i * 24 * 3600),
            PnL: 0,
            Roi: 0,
          });
        }
        break;
      // Add more cases as needed
    }

    return data;
  };

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const res1Day = await fetch(`${ENDPOINT8}/api/userstats/${publicKey}`);
        const leaderboard1Day = await res1Day.json();

        // Preprocess data for different timeframes
        const processedData1Day =
          leaderboard1Day.hourly && leaderboard1Day.hourly.length > 0
            ? preprocessData(leaderboard1Day.hourly, "1D")
            : createDefaultZeroLineData("1D");
        const processedData7Days =
          leaderboard1Day.sevenDay && leaderboard1Day.sevenDay.length > 0
            ? preprocessData(leaderboard1Day.sevenDay, "7D")
            : createDefaultZeroLineData("7D");
        const processedData30Days =
          leaderboard1Day.thirtyDay && leaderboard1Day.thirtyDay.length > 0
            ? preprocessData(leaderboard1Day.thirtyDay, "30D")
            : createDefaultZeroLineData("30D");

        // Set state for each timeframe
        setUserData1Day(processedData1Day);
        setUserData7Days(processedData7Days);
        setUserData30Days(processedData30Days);
        setCurrentLeaderboard(processedData1Day);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      }
    };

    fetchLeaderboards();
  }, [publicKey]);

  const [affiliateData, setAffiliateData] = useState<AffiliateAccount | null>(
    null
  );

  useEffect(() => {
    if (
      userAffiliateData?.myAffiliate &&
      userAffiliateData.myAffiliate.length > 0
    ) {
      const affiliateCodeByteArray = userAffiliateData.myAffiliate;
      // Your logic here to derive the affiliatePublicKey using the affiliateCodeByteArray
      // This could be similar to how you derived the 'AffilAcc' in the 'onClick' function.

      const fetchAffiliateData = async () => {
        const seedsAffil = [affiliateCodeByteArray];
        const [affiliatePublicKey] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );
        try {
          const data = await getAffiliateData(affiliatePublicKey, connection);
          setAffiliateData(data.account);
        } catch (error) {
          console.error("Error fetching affiliate data:", error);
        }
      };

      fetchAffiliateData();
    }
  }, [userAffiliateData, connection]);

  useEffect(() => {
    if (currentLeaderboard.length > 0) {
      const lastItem = currentLeaderboard[currentLeaderboard.length - 1];
      setLatestPnL(lastItem.PnL);
      setLatestRoi(lastItem.Roi);
      setTradesSum(lastItem.totalTrades);
    }
  }, [currentLeaderboard]);

  useEffect(() => {
    const fetchUserAcc = async () => {
      if (!publicKey) {
        return; // Exit if publicKey is not defined
      }

      try {
        const seedsUser = [Buffer.from(publicKey.toBytes())];

        const [userAcc] = await PublicKey.findProgramAddress(
          seedsUser,
          PROGRAM_ID
        );
        const result = await doesUserhaveAffiliateCode(userAcc, connection);

        setHasAffiliate(result.hasCode);
        setusedAffiliate(result.usedAffiliate);
        setUserAffiliateData(result);
        setrebateTier(result.rebateTier);
        settotalVolumepast4Epoch(
          result.prevTradingVolume + result.currentEpochVolume
        );

        if (!result.hasCode) {
          setusedAffiliate(result.usedAffiliate);
          setUserAffiliateData(result);
          setaccOld(result.creationTime);

          setissInt(result.isInitialized);
          setrebateTier(result.rebateTier);

          settotalVolumepast4Epoch(
            result.prevTradingVolume + result.currentEpochVolume
          );
        }
      } catch (error) {
        console.error("Error fetching user account or affiliate code:", error);
      }
    };

    fetchUserAcc();
  }, [publicKey, connection]);

  const onClick = useCallback(async () => {
    // Create the instruction to initialize the user account    const handleAffiliateTransaction = async () => {
    const seedsUser = [Buffer.from(publicKey.toBytes())];

    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);

    // Prompt the user for input or whatever logic you want here

    const seedsAffil = [affiliateCodeToUint8Array(affiliateCode)];

    const [AffilAcc] = await PublicKey.findProgramAddress(
      seedsAffil,
      PROGRAM_ID
    );

    const result = await checkAffiliateInitialization(AffilAcc, connection);
    const IsInitialized = result.IsInitialized;
    const isIntUser = issInt;
    const creationTime = accOld;
    const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const timeDifference = currentTime - creationTime;
    const usdcAcc = await usdcSplTokenAccountSync(publicKey);

    if (!IsInitialized) {
      notify({ type: "error", message: "Referral code does not exist." });
    } else if (!isIntUser) {
      try {
        // Create the instruction to initialize the user account
        const accounts: InitializeUserAccAccounts = {
          userAcc: userAcc,
          playerAcc: publicKey,
          affilAcc: AffilAcc,
          systemProgram: SystemProgram.programId,
          clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
          usdcMint: USDCMINT,
          usdcPlayerAcc: usdcAcc,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
          tokenProgram: TOKENPROGRAM,
        };

        const args: InitializeUserAccArgs = {
          usedAffiliate: Array.from(affiliateCodeToUint8Array(affiliateCode)),
        };

        // Create a new transaction to initialize the user account and send it
        const initTransaction = new Transaction().add(
          initializeUserAcc(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        // Wait for transaction confirmation
        notify({ type: "info", message: `Trying to create Trading Account` });
        await connection.confirmTransaction(initSignature, "confirmed");
        setissInt(true);
        setaccOld(currentTime - 1);
        notify({
          type: "success",
          message: `Trading account successfully created, now enter the Referral.`,
        });
      } catch (error) {
        notify({
          type: "error",
          message: `Creating Trading account failed`,
          description: error?.message,
        });
      }
    } else if (timeDifference >= 24 * 60 * 60) {
      notify({
        type: "error",
        message:
          "Referrals can only be used on accounts created within less than 24 hours.",
      });
    } else {
      const setAffiliateArgs: SetAffilAccArgs = {
        usedAffiliate: Array.from(affiliateCodeToUint8Array(affiliateCode)), // This is just an example; you will replace with actual data
      };

      const setAffilAccs: SetAffilAccAccounts = {
        userAcc: userAcc, // Just a placeholder; replace with actual account
        affilAcc: AffilAcc, // Placeholder
        playerAcc: publicKey, // Placeholder
        systemProgram: SystemProgram.programId, // Using the SystemProgram's programId
        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
      };

      const initTransaction = new Transaction().add(
        setAffilAcc(setAffiliateArgs, setAffilAccs)
      );

      try {
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );
        // Notify user that the transaction was sent
        notify({
          type: "info",
          message: `Trying to use the referral code...`,
          txid: initSignature,
        });
        // Wait for transaction confirmation
        await connection.confirmTransaction(initSignature, "confirmed");
        setHasAffiliate(true);
        setusedAffiliate(affiliateCodeToUint8Array(affiliateCode));
        notify({
          type: "success",
          message: `Referral code has been used.`,
          txid: initSignature,
        });
      } catch (error: any) {
        // In case of an error, show only the 'error' notification
        notify({
          type: "error",
          message: `Using the Referral code failed`,
          description: error?.message,
        });
        return;
      }
      // Now, you can send this instruction in a transaction using Solana's web3.js library.
    }
  }, [
    issInt,
    ,
    accOld,
    affiliateCode,
    publicKey,
    connection,
    sendTransaction,
    notify,
  ]);

  const onClick1 = useCallback(async () => {
    // Create the instruction to initialize the user account
    if (!publicKey) {
      notify({
        type: "error",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    const seedsUser = [Buffer.from(publicKey.toBytes())];

    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);

    const seedsAffil = [affiliateCodeToUint8Array(affiliateCode)];
    const usdcAcc = await usdcSplTokenAccountSync(publicKey);

    if (userAffiliateData && !userAffiliateData.isInitialized) {
      try {
        const seedsAffil = [userAffiliateData.usedAffiliate];

        const [AffilAcc] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );

        const accounts: InitializeUserAccAccounts = {
          userAcc: userAcc,
          playerAcc: publicKey,
          affilAcc: AffilAcc,
          systemProgram: SystemProgram.programId,
          clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
          usdcMint: USDCMINT,
          usdcPlayerAcc: usdcAcc,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
          tokenProgram: TOKENPROGRAM,
        };

        const args: InitializeUserAccArgs = {
          usedAffiliate: Array.from(userAffiliateData.usedAffiliate),
        };

        // Create a new transaction to initialize the user account and send it
        const initTransaction = new Transaction().add(
          initializeUserAcc(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        // Wait for transaction confirmation
        notify({ type: "info", message: `Trying to create Trading Account` });
        await connection.confirmTransaction(initSignature, "confirmed");
        setUserAffiliateData((prevState) => ({ ...prevState, hasCode: false }));
        setUserAffiliateData((prevState) => ({ ...prevState, isInt: true }));
        notify({
          type: "success",
          message: `Trading account created, now create the Referral.`,
          description: `Now create the Referral.`,
        });
      } catch (error) {
        notify({
          type: "error",
          message: `Creation Failed`,
          description: error?.message,
        });
      }
    } else {
      const [AffilAcc] = await PublicKey.findProgramAddress(
        seedsAffil,
        PROGRAM_ID
      );

      const result = await checkAffiliateInitialization(AffilAcc, connection);
      const IsInitialized = result.IsInitialized;

      if (IsInitialized) {
        notify({ type: "error", message: "Referral code is already used." });
      } else {
        const args = {
          affiliateCode: Array.from(affiliateCodeToUint8Array(affiliateCode)),
        };

        // Create the instruction to initialize the user account
        const accounts = {
          affilAcc: AffilAcc,
          userAcc: userAcc,
          playerAcc: publicKey,
          systemProgram: SystemProgram.programId,
          clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        };
        // Create a new transaction to initialize the user account and send it
        const initTransaction = new Transaction().add(
          initializeAffilAcc(args, accounts)
        );

        try {
          const initSignature = await sendTransaction(
            initTransaction,
            connection
          );
          // Notify user that the transaction was sent
          notify({
            type: "info",
            message: `Creating Referral Code`,
            txid: initSignature,
          });
          // Wait for transaction confirmation
          await connection.confirmTransaction(initSignature, "confirmed");
          setUserAffiliateData((prevState) => ({
            ...prevState,
            hasReferralCode: true,
          }));
          setUserAffiliateData((prevState) => ({ ...prevState, isInt: true }));
          setUserAffiliateData((prevState) => ({
            ...prevState,
            myAffiliate: affiliateCodeToUint8Array(affiliateCode),
          }));
          notify({
            type: "success",
            message: `Your referral code has been created.`,
            txid: initSignature,
          });
        } catch (error: any) {
          // In case of an error, show only the 'error' notification
          notify({
            type: "error",
            message: `Referral code was not created`,
            description: error?.message,
          });
          return;
        }
      }
    }
  }, [
    userAffiliateData,
    affiliateCode,
    publicKey,
    connection,
    sendTransaction,
    notify,
  ]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const resallDays = await fetch(`${ENDPOINT8}/api/leaderboard/all`);
        const leaderboardallDaysData = await resallDays.json();
        const leaderboardallDays = leaderboardallDaysData.slice();

        setLeaderboardallDays(leaderboardallDays);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      }
    };

    fetchLeaderboards();
  }, []);

  useEffect(() => {
    // fetch leaderboard data...

    if (userPublicKey) {
      const userStats = leaderboardallDays.find(
        (user) => user.playerAcc === userPublicKey
      );
      setUserData(userStats);
    }
  }, [userPublicKey, leaderboardallDays]);

  const [decodedString, setDecodedString] = useState("");
  const [MydecodedString, MysetDecodedString] = useState("");

  useEffect(() => {
    if (usedAffiliate && usedAffiliate.length > 0) {
      const decoded = Array.from(usedAffiliate)
        .filter((byte) => byte !== 0)
        .map((byte) => String.fromCharCode(byte))
        .join("");

      setDecodedString(decoded);
    } else {
      setDecodedString("");
    }
  }, [usedAffiliate]);

  useEffect(() => {
    if (
      userAffiliateData?.myAffiliate &&
      userAffiliateData?.myAffiliate.length > 0
    ) {
      const decoded = Array.from(userAffiliateData?.myAffiliate)
        .filter((byte) => byte !== 0)
        .map((byte) => String.fromCharCode(byte))
        .join("");

      MysetDecodedString(decoded);
    } else {
      MysetDecodedString("");
    }
  }, [userAffiliateData]);

  const onClick2 = useCallback(
    async (usdc: number) => {
      // Create the instruction to initialize the user account
      // if (affiliateData.totalEarned <= 0.1 * LAMPORTS_PER_SOL) {
      //   notify({
      //     type: "error",
      //     message: `Rewards are less than 0.1 SOL`,
      //     description: "Try again later.",
      //   });
      //   return;
      // }
      if (!publicKey) {
        notify({
          type: "error",
          message: `Wallet not connected`,
          description: "Connect the wallet in the top panel",
        });
        return;
      }

      const usdcAcc = await usdcSplTokenAccountSync(publicKey);
      const seedsAffil = [userAffiliateData.myAffiliate];

      const [AffilAcc] = await PublicKey.findProgramAddress(
        seedsAffil,
        PROGRAM_ID
      );

      // Create the instruction to to withdrawaffilearnings
      const accounts = {
        affilAcc: AffilAcc,
        playerAcc: publicKey,
        pdaHouseAcc: PDAHOUSEWALLET,
        systemProgram: SystemProgram.programId,
        usdcMint: USDCMINT,
        usdcPlayerAcc: usdcAcc,
        usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
        tokenProgram: TOKENPROGRAM,
        associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
      };

      const args: WithdrawAffiliateEarningsArgs = {
        usdc: usdc,
      };

      // Create a new transaction to initialize the user account and send it
      const initTransaction = new Transaction().add(
        withdrawAffiliateEarnings(args, accounts)
      );

      try {
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );
        // Notify user that the transaction was sent
        notify({
          type: "info",
          message: `Trying to withdraw earnings...`,
          txid: initSignature,
        });
        // Wait for transaction confirmation
        await connection.confirmTransaction(initSignature, "confirmed");
        notify({
          type: "success",
          message: `Your referral earnings has been claimed.`,
          txid: initSignature,
        });
        if (affiliateData) {
          const updatedAffiliateData = new AffiliateAccount({
            ...affiliateData,
            totalEarned: 0,
            usdcTotalEarned: 0,
          });
          setAffiliateData(updatedAffiliateData);
        }
      } catch (error: any) {
        // In case of an error, show only the 'error' notification
        notify({
          type: "error",
          message: `Could not withdraw the Affiliate Earnings`,
          description: error?.message,
        });
        return;
      }
    },
    [
      userAffiliateData,
      publicKey,
      connection,
      sendTransaction,
      notify,
      affiliateData,
    ]
  );

  const copyToClipboard = () => {
    // Ensure decodedString exists and is not empty
    if (MydecodedString) {
      const urlToCopy = `http://localhost:3030/profile?ref=${MydecodedString}`;
      navigator.clipboard
        .writeText(urlToCopy)
        .then(() => {
          console.log("URL copied to clipboard");
          notify({ type: "info", message: "Copied to clipboard" });
        })
        .catch((err) => {
          console.error("Failed to copy URL to clipboard", err);
        });
    }
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");

  const closeModalHandler = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    // Ensure the user is on the /profile page and that a referral code is provided in the URL query
    if (router.query.ref && router.pathname === "/profile") {
      setAffiliateCode(router.query.ref as string); // Set the referral code from the URL
      setModalIsOpen(true); // Show the modal indicating the referral code is accepted or to take further action
    }
  }, [router.query.ref, router.pathname]);

  const ModalDetails = (
    <Modal
      className="custom-scrollbar bg-layer-2"
      isOpen={modalIsOpen}
      onRequestClose={closeModalHandler}
      style={{
        overlay: {
          zIndex: "100",
          backgroundColor: "transparent",
          backdropFilter: "blur(5px)",
        },
        content: {
          backgroundSize: "cover",
          position: "fixed",
          width: "320px",
          height: "290px",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div className="relative rounded tradingcard ">
        <div className="">
          <div className="font-poppins w-[100%] h-[100%] bg-layer-2 text-[#ffffff60]  font-poppins px-5 pt-3 pb rounded text-[1rem]">
            <div className="bankGothic text-center font-semibold text-[1.5rem] text-[#F7931A]">
              You have been referred by {affiliateCode}
            </div>
            By opening a trading account on PopFi, I agree to the following:
            <div className="relative leading-[14px] inline-block max-w-[250px]">
              Priority Fees
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
              <div className="self-stretch flex flex-row items-center justify-start">
                <button
                  onClick={onClick}
                  className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="relative overflow-hidden">
      {ModalDetails}
      <div
        className="hidden md:flex overflow-hidden absolute futures-circles1 w-3/4 h-full "
        style={{
          zIndex: 0,
          transform: "translate(-70%, 50%)",
          right: "0%",
        }}
      >
        {" "}
      </div>
      <div
        className="hidden md:flex overflow-hidden absolute futures-circles2 w-full h-full"
        style={{
          zIndex: 0,
          transform: "translate(72%, 25%)",
          right: "0%",
        }}
      ></div>
      <div
        className="md:hidden overflow-hidden absolute futures-circles1 w-3/4  h-2/3"
        style={{
          zIndex: 0,
          transform: "translate(-70%, 70%)",
          right: "0%",
        }}
      >
        {" "}
      </div>
      <div
        className="md:hidden overflow-hidden absolute futures-circles2 w-full h-3/4"
        style={{
          zIndex: 0,
          transform: "translate(72%, -20%)",
          right: "0%",
        }}
      ></div>
      <Head>
        <title>PopFi | Personal Stats</title>
        <meta name="description" content="PopFi" />
      </Head>
      <div className="bg-base flex justify-center md:pt-2 min-h-[calc(100vh-78px)]">
        <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] px-2 z-0">
          <div className="bankGothic flex flex-col  gap-[8px] text-3xl mt-2 lg:text-4xl text-white z-0"></div>
          <div className="w-full flex md:flex-row flex-col gap-2 md:px-0  z-100">
            <div className="w-full flex justify-center md:justify-start items-center gap-4">
              <h1 className="bankGothic md:text-start text-center text-3xl mt-2 lg:text-4xl text-transparent bg-clip-text bg-white">
                Your Stats
              </h1>
            </div>
            {!hasAffiliate ? (
              <div className="md:mt-4 z-10 w-full md:w-[350px] self-stretch rounded-lg bg-layer-1 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-gryy-text  hover:bg-[#484c6d5b]  ">
                <input
                  className="w-full h-full input3-capsule__input relative leading-[14px] "
                  type="text"
                  id="affiliateCode"
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  maxLength={8}
                  placeholder="Enter Promo Code"
                />
                <button
                  onClick={onClick}
                  className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                >
                  APPLY
                </button>
              </div>
            ) : (
              <div className="md:mt-4  z-10 font-poppins w-full md:w-[350px] self-stretch rounded-lg bg-layer-1 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey-text  hover:bg-[#484c6d5b]  ">
                Used Code
                <div className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                  {decodedString}
                </div>
              </div>
            )}
          </div>

          <div
            style={{ position: "relative", zIndex: 100 }}
            className="z-10 mt-2 w-full flex md:flex-row flex-col items-start justify-start gap-[8px] md:px-0"
          >
            <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons21.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  TRADER
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {userData?.playerAcc.slice(0, 3)}...
                  {userData?.playerAcc.slice(-3)}
                </div>
              </div>
            </div>
            <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons22.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  TRADES
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {userData?.totalTrades ?? "-"}
                </div>
              </div>
            </div>
            <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons23.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  VOLUME
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {userData?.totalVolume !== undefined
                    ? ((userData.totalVolume / LAMPORTS_PER_SOL) * 2).toFixed(
                        1
                      ) + "SOL"
                    : "-"}
                </div>
              </div>
            </div>
            <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons24.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  WIN RATIO
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {userData?.winRate
                    ? (userData.winRate * 100).toFixed(1) + " %"
                    : "-"}
                </div>
              </div>
            </div>
            <div className="z-100 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons25.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  PnL
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {userData?.PnL !== undefined
                    ? (userData?.PnL / LAMPORTS_PER_SOL).toFixed(1) + " SOL"
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{ position: "relative", zIndex: 100 }}
            className="z-100 mt-2 md:rounded-2xl rounded-lg bg-layer-1 box-border w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[16px] text-sm  "
          >
            <div className="self-stretch flex flex-col items-start justify-center gap-[8px] text-center text-lg text-grey font-poppins z-100">
              <div className="self-stretch flex flex-row items-center justify-between z-100">
                <div className="self-stretch w-[265px] flex flex-row items-start justify-start gap-[8px] z-100">
                  <button
                    onClick={setToggleChangeLong}
                    className={`w-[81px] rounded-lg h-8 flex flex-row items-center justify-center box-border ${
                      toggleState === "LONG"
                        ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                        : "bg-transparent border border-grey"
                    }`}
                  >
                    <div
                      className={`flex justify-center items-center h-full w-full rounded-lg ${
                        toggleState === "LONG"
                          ? "bg-[#0B111B] bg-opacity-80"
                          : "bg-opacity-0 hover:bg-[#484c6d5b]"
                      }`}
                    >
                      <div
                        className={`bankGothic bg-clip-text text-transparent uppercase ${
                          toggleState === "LONG"
                            ? "bg-gradient-to-t from-[#34C796] to-[#0B7A55]"
                            : "bg-grey"
                        }`}
                      >
                        PNL
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={setToggleChangeShort}
                    className={`w-[81px] rounded-lg h-8 flex flex-row items-center justify-center box-border ${
                      toggleState === "SHORT"
                        ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                        : "bg-transparent border border-grey"
                    }`}
                  >
                    <div
                      className={`flex justify-center items-center h-full w-full rounded-lg ${
                        toggleState === "SHORT"
                          ? "bg-[#0B111B] bg-opacity-80"
                          : "bg-opacity-0 hover:bg-[#484c6d5b]"
                      }`}
                    >
                      <div
                        className={`bankGothic bg-clip-text text-transparent uppercase ${
                          toggleState === "SHORT"
                            ? "bg-gradient-to-t from-[#34C796] to-[#0B7A55]"
                            : "bg-grey"
                        }`}
                      >
                        ROI
                      </div>
                    </div>
                  </button>
                </div>
                <div className="hidden md:flex z-100 flex flex-row items-start justify-start gap-[16px] md:text-lg text-md text-grey-text">
                  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
                    <div
                      onClick={() => setCurrentLeaderboard(UserData1Day)}
                      className={`md:text-lg text-md leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === UserData1Day
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == UserData1Day ? "text-white" : "text-gray-text"} `}
                    >
                      1 DAY
                    </div>
                  </button>
                  <button className="flex flex-row items-center justify-center py-1 px-0">
                    <div
                      onClick={() => setCurrentLeaderboard(UserData7Days)}
                      className={`md:text-lg text-md text-lg leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === UserData7Days
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == UserData7Days ? "text-white" : "text-gray-text"} `}
                    >
                      7 DAYS
                    </div>
                  </button>
                  <button className="flex flex-row items-center justify-center py-1 px-0">
                    <div
                      onClick={() => setCurrentLeaderboard(UserData30Days)}
                      className={`md:text-lg text-md leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === UserData30Days
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == UserData30Days ? "text-white" : "text-gray-text"} `}
                    >
                      30 DAYS
                    </div>
                  </button>
                </div>
                <div className="md:hidden z-100 flex flex-row items-start justify-start gap-[16px] md:text-lg text-md text-grey-text">
                  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
                    <div
                      onClick={() => setCurrentLeaderboard(UserData1Day)}
                      className={`md:text-lg text-md leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === UserData1Day
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == UserData1Day ? "text-white" : "text-gray-text"} `}
                    >
                      1d
                    </div>
                  </button>
                  <button className="flex flex-row items-center justify-center py-1 px-0">
                    <div
                      onClick={() => setCurrentLeaderboard(UserData7Days)}
                      className={`md:text-lg text-md text-lg leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === UserData7Days
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == UserData7Days ? "text-white" : "text-gray-text"} `}
                    >
                      7d
                    </div>
                  </button>
                  <button className="flex flex-row items-center justify-center py-1 px-0">
                    <div
                      onClick={() => setCurrentLeaderboard(UserData30Days)}
                      className={`md:text-lg text-md leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === UserData30Days
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == UserData30Days ? "text-white" : "text-gray-text"} `}
                    >
                      30d
                    </div>
                  </button>
                </div>
              </div>
              <div className="font-poppins w-full z-100 flex justify-between items-center md:text-5xl text-3xl leading-[100%] font-medium font-bankgothic-md-bt">
                <div
                  className={`${toggleState === "LONG" ? (latestPnL >= 0 ? "text-[#34C796]" : "text-red-500") : latestRoi >= 0 ? "text-[#34C796]" : "text-red-500"}`}
                >
                  {toggleState === "LONG"
                    ? latestPnL >= 0
                      ? `+${(latestPnL / LAMPORTS_PER_SOL).toFixed(2)} SOL`
                      : `${(latestPnL / LAMPORTS_PER_SOL).toFixed(2)} SOL`
                    : latestRoi >= 0
                      ? `+${(latestRoi * 100).toFixed(2)} %`
                      : `${(latestRoi * 100).toFixed(2)} %`}
                </div>

                <div className="text-center md:text-xl text-lg font-poppins text-grey-text font-semibold">
                  Trades: {tradesSum || 0}
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-start gap-[32px]' w-full h-full ">
              <SimpleLineChart
                data={currentLeaderboard}
                toggleState={toggleState}
              />
            </div>
          </div>

          <div className="flex flex-col items-start justify-start gap-[16px]">
            <div className="w-full flex justify-center md:justify-start items-center gap-4"></div>
            <div className="w-full flex md:flex-row flex-col gap-2 md:px-0  z-100">
              <div className="w-full flex justify-center md:justify-start items-center gap-4">
                <h1 className="bankGothic md:text-start text-center text-3xl mt-2 lg:text-4xl text-transparent bg-clip-text bg-white">
                  Opening Fee Tiers
                </h1>
              </div>

              <div className="md:mt-4 z-10 font-poppins w-full md:w-[350px] self-stretch rounded-lg bg-layer-1 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey-text  hover:bg-[#484c6d5b] ">
                Your Volume
                <span className="text-[#34C796]">
                  {(totalVolumepast4Epoch / LAMPORTS_PER_SOL).toFixed(0)} SOL
                </span>
              </div>
            </div>

            <div className="z-10 w-full flex md:flex-row flex-col items-stretch justify-start md:gap-[12px] gap-[8px] ">
              <div
                className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 0 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 0 ? "border-solid border-[#0F7F59]" : ""}`}
              >
                <div
                  className={`md:block hidden rounded-full ${rebateTier === 0 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 0 ? "Your Tier" : "Tier 1"}
                  </div>
                </div>
                <img
                  className="relative w-[90px] h-[90px] object-contain"
                  alt=""
                  src="/personal/bronze.png"
                />
                <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                  <div
                    className={`md:hidden rounded-full ${rebateTier === 0 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                  >
                    <div className="relative leading-[100%] font-medium">
                      {rebateTier === 0 ? "Your Tier" : "Tier 1"}
                    </div>
                  </div>
                  <div className="relative leading-[140%] font-semibold">
                    0% Discount
                  </div>
                  <div className="relative text-base leading-[140%] font-light text-grey-text">
                    less than 1,000 SOL Vol
                  </div>
                </div>
              </div>
              <div
                className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 5 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 5 ? "border-solid border-[#0F7F59]" : ""}`}
              >
                <div
                  className={`md:block hidden rounded-full ${rebateTier === 5 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 5 ? "Your Tier" : "Tier 2"}
                  </div>
                </div>
                <img
                  className="relative w-[90px] h-[90px] object-contain"
                  alt=""
                  src="/personal/silver.png"
                />
                <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                  <div
                    className={`md:hidden rounded-full ${rebateTier === 5 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                  >
                    <div className="relative leading-[100%] font-medium">
                      {rebateTier === 5 ? "Your Tier" : "Tier 2"}
                    </div>
                  </div>
                  <div className="relative leading-[140%] font-semibold">
                    5% Discount
                  </div>
                  <div className="relative text-base leading-[140%] font-light text-grey-text">
                    1,000 to 2,000 SOL Vol
                  </div>
                </div>
              </div>
              <div
                className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 10 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 10 ? "border-solid border-[#0F7F59]" : ""}`}
              >
                <div
                  className={`md:block hidden rounded-full ${rebateTier === 10 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 10 ? "Your Tier" : "Tier 3"}
                  </div>
                </div>
                <img
                  className="relative w-[90px] h-[90px] object-contain"
                  alt=""
                  src="/personal/gold.png"
                />
                <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                  <div
                    className={`md:hidden rounded-full ${rebateTier === 10 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                  >
                    <div className="relative leading-[100%] font-medium">
                      {rebateTier === 10 ? "Your Tier" : "Tier 3"}
                    </div>
                  </div>
                  <div className="relative leading-[140%] font-semibold">
                    10% Discount
                  </div>
                  <div className="relative text-base leading-[140%] font-light text-grey-text">
                    2,000 to 5,000 SOL Vol
                  </div>
                </div>
              </div>
              <div
                className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 15 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 15 ? "border-solid border-[#0F7F59]" : ""}`}
              >
                <div
                  className={`md:block hidden rounded-full ${rebateTier === 15 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 15 ? "Your Tier" : "Tier 4"}
                  </div>
                </div>
                <img
                  className="relative w-[90px] h-[90px] object-contain"
                  alt=""
                  src="/personal/purple.png"
                />
                <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                  <div
                    className={`md:hidden rounded-full ${rebateTier === 15 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                  >
                    <div className="relative leading-[100%] font-medium">
                      {rebateTier === 15 ? "Your Tier" : "Tier 4"}
                    </div>
                  </div>
                  <div className="relative leading-[140%] font-semibold">
                    15% Discount
                  </div>
                  <div className="relative text-base leading-[140%] font-light text-grey-text">
                    5,000 to 10,000 SOL Vol
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="z-10 md:mt-3 mt-2 w-full flex md:flex-row flex-col items-start justify-start md:gap-[12px] gap-[8px] ">
            <div
              className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 20 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 20 ? "border-solid border-[#0F7F59]" : ""}`}
            >
              <div
                className={`md:block hidden rounded-full ${rebateTier === 20 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
              >
                <div className="relative leading-[100%] font-medium">
                  {rebateTier === 20 ? "Your Tier" : "Tier 5"}
                </div>
              </div>
              <img
                className="relative w-[90px] h-[90px] object-contain"
                alt=""
                src="/personal/emerald.png"
              />
              <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                <div
                  className={`md:hidden rounded-full ${rebateTier === 20 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 20 ? "Your Tier" : "Tier 5"}
                  </div>
                </div>
                <div className="relative leading-[140%] font-semibold">
                  20% Discount
                </div>
                <div className="relative text-base leading-[140%] font-light text-grey-text">
                  10,000 to 20,000 SOL Vol
                </div>
              </div>
            </div>
            <div
              className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 25 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 25 ? "border-solid border-[#0F7F59]" : ""}`}
            >
              <div
                className={`md:block hidden rounded-full ${rebateTier === 25 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
              >
                <div className="relative leading-[100%] font-medium">
                  {rebateTier === 25 ? "Your Tier" : "Tier 6"}
                </div>
              </div>
              <img
                className="relative w-[90px] h-[90px] object-contain"
                alt=""
                src="/personal/ruby.png"
              />
              <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                <div
                  className={`md:hidden rounded-full ${rebateTier === 25 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 25 ? "Your Tier" : "Tier 6"}
                  </div>
                </div>
                <div className="relative leading-[140%] font-semibold">
                  25% Discount
                </div>
                <div className="relative text-base leading-[140%] font-light text-grey-text">
                  20,000 to 40,000 SOL Vol
                </div>
              </div>
            </div>
            <div
              className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 30 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 30 ? "border-solid border-[#0F7F59]" : ""}`}
            >
              <div
                className={`md:block hidden rounded-full ${rebateTier === 30 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
              >
                <div className="relative leading-[100%] font-medium">
                  {rebateTier === 30 ? "Your Tier" : "Tier 7"}
                </div>
              </div>
              <img
                className="relative w-[90px] h-[90px]"
                alt=""
                src="/personal/saphire.svg"
              />
              <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                <div
                  className={`md:hidden rounded-full ${rebateTier === 30 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 30 ? "Your Tier" : "Tier 7"}
                  </div>
                </div>
                <div className="relative leading-[140%] font-semibold">
                  30% Discount
                </div>
                <div className="relative text-base leading-[140%] font-light text-grey-text">
                  40,000 to 80,000 SOL Vol
                </div>
              </div>
            </div>
            <div
              className={`md:1/4 w-full md:rounded-2xl rounded-lg ${rebateTier === 35 ? "[background:linear-gradient(180deg,_rgba(19,53,52,255),_rgba(12,37,39,255))]" : "bg-layer-1"} flex md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ${rebateTier === 35 ? "border-solid border-[#0F7F59]" : ""}`}
            >
              <div
                className={`md:block hidden rounded-full ${rebateTier === 35 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
              >
                <div className="relative leading-[100%] font-medium">
                  {rebateTier === 35 ? "Your Tier" : "Tier 8"}
                </div>
              </div>
              <img
                className="relative w-[90px] h-[90px]"
                alt=""
                src="/personal/legendary.svg"
              />
              <div className="flex flex-col md:items-center items-start justify-start gap-[8px] text-center text-xl font-poppins">
                <div
                  className={`md:hidden rounded-full ${rebateTier === 35 ? "[background:linear-gradient(180deg,_#34c796,_#0b7a55)]" : "bg-layer-2"} flex flex-row items-center justify-center py-2 px-4`}
                >
                  <div className="relative leading-[100%] font-medium">
                    {rebateTier === 35 ? "Your Tier" : "Tier 8"}
                  </div>
                </div>
                <div className="relative leading-[140%] font-semibold">
                  35% Discount
                </div>
                <div className="relative text-base leading-[140%] font-light text-grey-text">
                  more than 80,000 SOL Vol
                </div>
              </div>
            </div>
          </div>
          <h1 className="bankGothic md:text-start text-center text-3xl pt-4 lg:text-4xl text-transparent bg-clip-text bg-white">
            Referral System
          </h1>
          <img
            className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/sheesh/donut3.svg"
          />
          {!userAffiliateData?.hasReferralCode ? (
            <div className="pb-8 pt-2 flex md:flex-row flex-col items-center justify-center gap-[16px] text-xl text-white z-100">
              <div className="md:w-[35%] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
                <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                  <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                    <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                      How it Works
                    </div>
                    <div className="font-poppins relative text-sm leading-[130%] text-white flex items-center w-full">
                      Refer friends to trade on PopFi and earn a share of their
                      trading fees!{" "}
                    </div>
                  </div>
                </div>
              </div>
              <div className="z-10 self-stretch md:rounded-2xl rounded-lg bg-layer-1 box-border md:w-[65%] w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[12px] text-grey-text ">
                <div className="pb-2 md:pb-2 bankGothic relative leading-[100%] font-medium">
                  Create Promo Code
                </div>
                <div className="self-stretch flex md:flex-row flex-col items-end justify-start gap-[16px] text-base text-grey font-poppins">
                  <div className="w-full md:h-10 h-8  rounded-lg bg-layer-2 border border-layer-3 px-2">
                    <input
                      type="text"
                      className="w-full h-full input3-capsule__input relative leading-[14px] "
                      id="affiliateCode"
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value)}
                      maxLength={8}
                      placeholder="Enter 8 letters"
                    />
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] md:w-1/4 w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={onClick1}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      <button className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                        CREATE
                      </button>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-8 z-10 pt-2 flex md:flex-row flex-col items-center justify-center gap-[16px] text-white px-2 md:px-0 z-100">
              <div className="z-10 md:w-[35%] self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px]">
                <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                  <div className="flex items-center justify-center bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                    <div className="bankGothic font-medium text-grey-text relative leading-[100%] text-center">
                      YOUR REFERRAL CODE
                    </div>
                    <div className="flex flex-col items-center justify-center text-right text-13xl text-white font-poppins">
                      <div className="flex flex-row items-center  justify-center gap-[8px]">
                        <div className="text-3xl relative leading-[100%] font-medium">
                          {MydecodedString}
                        </div>
                        <button>
                          <img
                            onClick={copyToClipboard}
                            className="relative w-6 h-6"
                            alt=""
                            src="/sheesh/vuesaxlinearcopy.svg"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" z-10 md:w-[65%] w-full md:rounded-2xl rounded-lg bg-layer-1 flex flex-col items-center justify-start p-4 md:p-8 gap-[32px] text-sm ">
                <div className="font-poppins w-full flex flex-row items-start justify-center gap-[32px]">
                  <div className="flex w-1/2 flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons12.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text relative leading-[100%] ">
                        TOTAL USERS
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {affiliateData?.totalAffiliatesUsers}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-1/2 flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons2.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text text-grey-textrelative leading-[100%] ">
                        TOTAL VOLUME
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {(
                          affiliateData?.totalAffiliatesVolume /
                          LAMPORTS_PER_SOL
                        ).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="font-poppins w-full flex flex-row items-start justify-center gap-[32px]">
                  <div className="flex w-1/2 flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons13.svg"
                    />
                    <div className=" flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text relative leading-[100%] ">
                        CLAIM
                      </div>
                      <div className="text-start relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {(
                          affiliateData?.totalEarned / LAMPORTS_PER_SOL
                        ).toFixed(2)}{" "}
                        SOL
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] w-1/2 h-10   box-border text-center text-lg">
                    <button
                      onClick={() => onClick2(0)}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      <button className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                        SOL
                      </button>
                    </button>
                  </div>
                </div>
                <div className="font-poppins w-full flex flex-row items-start justify-center gap-[32px]">
                  <div className="flex w-1/2 flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px]"
                      alt=""
                      src="/sheesh/icons1.svg"
                    />
                    <div className=" flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text relative leading-[100%] ">
                        CLAIM
                      </div>
                      <div className="text-start relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {(
                          (affiliateData?.usdcTotalEarned / LAMPORTS_PER_SOL) *
                          1000
                        ).toFixed(2)}{" "}
                        USDC
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] w-1/2 h-10   box-border text-center text-lg">
                    <button
                      onClick={() => onClick2(1)}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      <button className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                        USDC
                      </button>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
