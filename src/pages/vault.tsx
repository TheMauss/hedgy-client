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
  stakeForPoints,
  StakeForPointsAccounts,
  StakeForPointsArgs,
  withdrawFromStaking,
  WithdrawFromStakingArgs,
  WithdrawFromStakingAccounts,
  ClaimPointsAccounts,
  ClaimPointsArgs,
  claimPoints,
} from "../out/instructions/"; // Update with the correct path
import { PROGRAM_ID } from "../out/programId";
import { notify } from "utils/notifications";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import { BN } from "@project-serum/anchor";
import moment from "moment-timezone";
import { token } from "@project-serum/anchor/dist/cjs/utils";
require("dotenv").config();

const HOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_HOUSE_WALLET);
const SIGNERWALLET = new PublicKey(process.env.NEXT_PUBLIC_SIGNER_WALLET);
const PDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_PDA_HOUSEWALLET);
const USDCMINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
const ASSOCIATEDTOKENPROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM
);
const TOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM);
const PUSDCMINT = new PublicKey(process.env.NEXT_PUBLIC_PUSDC_MINT);
const PSOLMINT = new PublicKey(process.env.NEXT_PUBLIC_PSOL_MINT);
const USDCPDAHOUSEWALLET = new PublicKey(
  process.env.NEXT_PUBLIC_USDCPDA_HOUSEWALLET
);
const RATIOACC = new PublicKey(process.env.NEXT_PUBLIC_RATIO_ACC);
const PSOLPDA = new PublicKey(process.env.NEXT_PUBLIC_PSOL_PDA);
const PUSDCPDA = new PublicKey(process.env.NEXT_PUBLIC_PUSDC_PDA);

const SOL_TO_USDC_RATE = 100; // Assuming 1 SOL = 100 USDC for example purposes
const MAX_DEPOSIT_SOL = 1500;
const MAX_DEPOSIT_USDC = 200000;
const MIN_DEPOSIT_SOL = 1; // Minimum deposit in SOL
const MIN_DEPOSIT_USDC = 100; // Assuming the minimum deposit in USDC

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
  projectsDepositedSol: number;
  projectsDepositedUsdc: number;
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
      projectsDepositedSol: 0,
      projectsDepositedUsdc: 0,
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
    projectsDepositedSol: LpAccount.projectsDepositedSol.toNumber(),
    projectsDepositedUsdc: LpAccount.projectsDepositedUsdc.toNumber(),
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
  psolStaked: number;
  pusdcStaked: number;
}> {
  const accountInfo = await connection.getAccountInfo(liqProviderAcc);

  if (!accountInfo) {
    return {
      isInitialized: false,
      withdrawalRequestAmount: 0,
      withdrawalRequestEpoch: 0,
      usdcWithdrawalRequestAmount: 0,
      usdcWithdrawalRequestEpoch: 0,
      psolStaked: 0,
      pusdcStaked: 0,
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
    usdcWithdrawalRequestAmount:
      LiqProviderAcc.usdcWithdrawalRequestAmount.toNumber(),
    usdcWithdrawalRequestEpoch:
      LiqProviderAcc.usdcWithdrawalRequestEpoch.toNumber(),
    psolStaked: LiqProviderAcc.psolStaked.toNumber(),
    pusdcStaked: LiqProviderAcc.pusdcStaked.toNumber(),
  };
}

async function findSplTokenAccountSync(walletAddress, currency) {
  let mintAddress;

  if (currency === "USDC") {
    mintAddress = PUSDCMINT;
  } else if (currency === "SOL") {
    mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
  } else {
    throw new Error("Unsupported currency");
  }

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [walletAddress.toBuffer(), TOKENPROGRAM.toBuffer(), mintAddress.toBuffer()],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function usdcSplTokenAccountSync(walletAddress) {
  let mintAddress = USDCMINT;

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [walletAddress.toBuffer(), TOKENPROGRAM.toBuffer(), mintAddress.toBuffer()],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function getSplTokenBalance(connection, walletAddress, selectedCurrency) {
  try {
    console.log("Wallet Address:", walletAddress);
    console.log("Selected Currency:", selectedCurrency);

    if (!walletAddress) {
      throw new Error("Wallet address is undefined");
    }

    if (!(walletAddress instanceof PublicKey)) {
      walletAddress = new PublicKey(walletAddress);
    }

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { programId: TOKENPROGRAM }
    );

    let mintAddress;

    if (selectedCurrency === "USDC") {
      console.log("USDC Mint Address:", PUSDCMINT);
      mintAddress = new PublicKey(PUSDCMINT);
    } else if (selectedCurrency === "SOL") {
      console.log("SOL Mint Address:", PSOLMINT);
      mintAddress = new PublicKey(PSOLMINT);
    } else {
      throw new Error(`Unsupported currency: ${selectedCurrency}`);
    }

    const specificTokenAccounts = tokenAccounts.value.filter(
      (account) =>
        account.account.data.parsed.info.mint === mintAddress.toString()
    );

    let totalBalance = 0;
    specificTokenAccounts.forEach((account) => {
      totalBalance += account.account.data.parsed.info.tokenAmount.uiAmount;
    });

    return totalBalance;
  } catch (error) {
    console.error("Error fetching SPL token balance:", error);
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
    projectsDepositedSol: number;
    projectsDepositedUsdc: number;
  } | null>(null);
  const [LProviderdata, setLProviderdata] = useState<{
    isInitialized: boolean;
    withdrawalRequestAmount: number;
    withdrawalRequestEpoch: number;
    usdcWithdrawalRequestAmount: number;
    usdcWithdrawalRequestEpoch: number;
    psolStaked: number;
    pusdcStaked: number;
  } | null>(null);
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const usdcbalance = useUserSOLBalanceStore((s) => s.usdcBalance);

  const [depositValue, setdepositValue] = useState("");
  const [withdrawValue, setwithdrawValue] = useState("");
  const [stakeValue, setStakeValue] = useState("");
  const [unstakeValue, setUnstakeValue] = useState("");
  const { getUserSOLBalance, getUserUSDCBalance } = useUserSOLBalanceStore();
  const [isInit, setisInit] = useState<{
    isInitialized: boolean;
    usedAffiliate: Uint8Array;
    myAffiliate: Uint8Array;
  }>(null);

  const [leaderboard30Days, setLeaderboard30Days] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState<"SOL" | "USDC">(
    "SOL"
  );

  const [selectedStake, setSelectedStake] = useState<"STAKE" | "MINT">("MINT");
  const [splTokenAccount, setSplTokenAccount] = useState<PublicKey | null>(
    null
  );
  const [usdcSplTokenAccount, setUsdcSplTokenAccount] =
    useState<PublicKey | null>(null);
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

  const calculateAPY = (selectedCurrency, LPdata) => {
    let APY = 0;
    leaderboard30Days.forEach((item) => {
      if (selectedCurrency === "SOL") {
        APY += (item.solFees * 7) / 10 - item.solPnL;
      } else {
        APY += (item.usdcFees * 7) / 10 - item.usdcPnL; // Assuming usdFees and usdPnL exist
      }
    });
    return selectedCurrency === "SOL"
      ? (APY / LAMPORTS_PER_SOL / (LPdata?.totalDeposits / LAMPORTS_PER_SOL)) *
          100 *
          12 // Convert lamports to SOL if the selected currency is SOL
      : (APY /
          LAMPORTS_PER_SOL /
          (LPdata?.usdcTotalDeposits / LAMPORTS_PER_SOL) /
          1000000000) *
          100 *
          12; // Directly in USD if the selected currency is USD
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
          const splAcc = await findSplTokenAccountSync(
            publicKey,
            selectedCurrency
          );
          setSplTokenAccount(splAcc);

          // Find SPL token account for USDC
          const usdcAcc = await usdcSplTokenAccountSync(publicKey);
          setUsdcSplTokenAccount(usdcAcc);
        } catch (error) {
          console.error("Error finding SPL token accounts:", error);
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
          const tokenBalance = await getSplTokenBalance(
            connection,
            publicKey,
            selectedCurrency
          );
          setTokenBalance(tokenBalance);
        } catch (error) {
          console.error("Error finding SPL token accounts:", error);
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
      getUserUSDCBalance(publicKey, connection);
    }
  }, [publicKey, connection, selectedCurrency]);

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

  const handleInputChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setStakeValue(sanitizedValue);
  };

  const handleInputChange4 = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUnstakeValue(sanitizedValue);
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
    if (selectedCurrency === "USDC") {
      mintAddress = PUSDCMINT;
      usdc = 1;
      deposit = (parseFloat(depositValue) * LAMPORTS_PER_SOL) / 1000;
    } else if (selectedCurrency === "SOL") {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
      deposit = parseFloat(depositValue) * LAMPORTS_PER_SOL;
    }
    const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);
    const maxDeposit =
      selectedCurrency === "SOL" ? MAX_DEPOSIT_SOL : MAX_DEPOSIT_USDC;
    const minDeposit =
      selectedCurrency === "SOL" ? MIN_DEPOSIT_SOL : MIN_DEPOSIT_USDC;
    const depositUnit = selectedCurrency;

    // Calculate the total deposits in the unit of the selected currency
    const totalDepositsInSelectedCurrency =
      selectedCurrency === "SOL"
        ? (LPdata.totalDeposits + LPdata.projectsDepositedSol) /
          LAMPORTS_PER_SOL
        : ((LPdata.usdcTotalDeposits + LPdata.projectsDepositedUsdc) /
            LAMPORTS_PER_SOL) *
          1000;

    if (LPdata?.locked) {
      notify({ type: "info", message: `Vault is locked.` });
    } else if (parseFloat(depositValue) < minDeposit) {
      notify({ type: "info", message: `Minimum deposit is 1 ${depositUnit}.` });
    } else if (
      parseFloat(depositValue) + totalDepositsInSelectedCurrency >
      maxDeposit
    ) {
      const remainingDeposit = maxDeposit - totalDepositsInSelectedCurrency;
      notify({
        type: "info",
        message: `Vault is almost full, you can deposit ${remainingDeposit.toFixed(1)} ${depositUnit}.`,
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
        const results = await checkLPdata(lpAcc, connection);
        setLPdata(results);
        notify({
          type: "success",
          message: `Successfully deposited into the Vault`,
        });
        getUserSOLBalance(publicKey, connection);
        getUserUSDCBalance(publicKey, connection);
        const tokenBalance = await getSplTokenBalance(
          connection,
          publicKey,
          selectedCurrency
        );
        setTokenBalance(tokenBalance);
      } catch (error) {
        notify({
          type: "error",
          message: `Failed to deposit into the Vault`,
          description: error?.message,
        });
      }
    }
  }, [
    connection,
    publicKey,
    depositValue,
    LPdata,
    LProviderdata,
    selectedCurrency,
    splTokenAccount,
    usdcSplTokenAccount,
  ]);

  const stakeTokens = useCallback(async () => {
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
    let splPDA;
    if (selectedCurrency === "USDC") {
      mintAddress = PUSDCMINT;
      usdc = 1;
      splPDA = PUSDCPDA;
      deposit = (parseFloat(stakeValue) * LAMPORTS_PER_SOL) / 1000;
    } else if (selectedCurrency === "SOL") {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
      splPDA = PSOLPDA;
      deposit = parseFloat(stakeValue) * LAMPORTS_PER_SOL;
    }
    const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);

    if (LPdata?.locked) {
      notify({ type: "info", message: `Vault is locked.` });
    }
    {
      try {
        const LPAccseeds = [
          Buffer.from(houseHarcodedkey.toBytes()),
          Buffer.from(publicKey.toBytes()),
        ];

        const [LProviderAcc] = await PublicKey.findProgramAddress(
          LPAccseeds,
          PROGRAM_ID
        );

        const seedsUser = [Buffer.from(publicKey.toBytes())];
        const [userAcc] = await PublicKey.findProgramAddress(
          seedsUser,
          PROGRAM_ID
        );

        const seedsAffil = [isInit.usedAffiliate];

        const [AffilAcc] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );

        const usdcAcc = await usdcSplTokenAccountSync(publicKey);

        if (!isInit.isInitialized) {
          try {
            const accounts: InitializeUserAccAccounts = {
              userAcc: userAcc,
              playerAcc: publicKey,
              affilAcc: AffilAcc,
              systemProgram: SystemProgram.programId,
              clock: new PublicKey(
                "SysvarC1ock11111111111111111111111111111111"
              ),
              usdcMint: USDCMINT,
              usdcPlayerAcc: usdcAcc,
              associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
              tokenProgram: TOKENPROGRAM,
            };

            const args: InitializeUserAccArgs = {
              usedAffiliate: Array.from(isInit.usedAffiliate),
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
            notify({ type: "info", message: `Creating Trading Account` });
            await connection.confirmTransaction(initSignature, "confirmed");
            fetchcheckuserdata();
            notify({
              type: "success",
              message: `Trading account created, you can stake now`,
            });
          } catch (error) {
            notify({
              type: "error",
              message: `Creation Failed`,
              description: error?.message,
            });
          }
        } else {
          console.log(isInit.isInitialized, isInit.usedAffiliate, "isinit");
          console.log("affilacc", AffilAcc.toString());

          const args: StakeForPointsArgs = {
            depositAmount: new BN(deposit),
            usdc: usdc,
            affiliateCode: Array.from(isInit.usedAffiliate),
          };
          const accounts: StakeForPointsAccounts = {
            liqProvider: LProviderAcc,
            userAcc: userAcc,
            providersWallet: publicKey,
            lpAcc: lpAcc,
            signerWalletAccount: SIGNERWALLET,
            ratioAcc: RATIOACC,
            houseAcc: HOUSEWALLET,
            pdaHouseAcc: PDAHOUSEWALLET,
            mint: mintAddress,
            solOracleAccount: new PublicKey(
              "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"
            ),
            providersSplTokenAccount: splTokenAccount,
            splPdaHouseAcc: splPDA,
            associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
            tokenProgram: TOKENPROGRAM,
            systemProgram: SystemProgram.programId,
            affilAcc: AffilAcc,
          };

          const initTransaction = new Transaction().add(
            stakeForPoints(args, accounts)
          );
          const initSignature = await sendTransaction(
            initTransaction,
            connection
          );

          notify({
            type: "info",
            message: `Staking LP Token.`,
            txid: signature,
          });
          await connection.confirmTransaction(initSignature, "confirmed");
          const result = await checkLiquidiryProviderAcc(
            LProviderAcc,
            connection
          );
          setLProviderdata(result);
          const results = await checkLPdata(lpAcc, connection);
          setLPdata(results);
          notify({
            type: "success",
            message: `Successfully staked LP tokens`,
          });
          getUserSOLBalance(publicKey, connection);
          getUserUSDCBalance(publicKey, connection);
          const tokenBalance = await getSplTokenBalance(
            connection,
            publicKey,
            selectedCurrency
          );
          setTokenBalance(tokenBalance);
        }
      } catch (error) {
        notify({
          type: "error",
          message: `Failed to stake LP tokens`,
          description: error?.message,
        });
      }
    }
  }, [
    isInit,
    connection,
    publicKey,
    stakeValue,
    LPdata,
    LProviderdata,
    selectedCurrency,
    splTokenAccount,
    usdcSplTokenAccount,
  ]);

  const unstakeTokens = useCallback(async () => {
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
    let splPDA;
    if (selectedCurrency === "USDC") {
      mintAddress = PUSDCMINT;
      usdc = 1;
      splPDA = PUSDCPDA;
      deposit = (parseFloat(unstakeValue) * LAMPORTS_PER_SOL) / 1000;
    } else if (selectedCurrency === "SOL") {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
      splPDA = PSOLPDA;
      deposit = parseFloat(unstakeValue) * LAMPORTS_PER_SOL;
    }
    const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);

    if (LPdata?.locked) {
      notify({ type: "info", message: `Vault is locked.` });
    }
    {
      try {
        const LPAccseeds = [
          Buffer.from(houseHarcodedkey.toBytes()),
          Buffer.from(publicKey.toBytes()),
        ];

        const [LProviderAcc] = await PublicKey.findProgramAddress(
          LPAccseeds,
          PROGRAM_ID
        );

        const seedsUser = [Buffer.from(publicKey.toBytes())];
        const [userAcc] = await PublicKey.findProgramAddress(
          seedsUser,
          PROGRAM_ID
        );

        const seedsAffil = [isInit.usedAffiliate];

        const [AffilAcc] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );

        const args: WithdrawFromStakingArgs = {
          withdrawAmount: new BN(deposit),
          usdc: usdc,
          affiliateCode: Array.from(isInit.usedAffiliate),
        };
        const accounts: WithdrawFromStakingAccounts = {
          liqProvider: LProviderAcc,
          userAcc: userAcc,
          providersWallet: publicKey,
          lpAcc: lpAcc,
          signerWalletAccount: SIGNERWALLET,
          ratioAcc: RATIOACC,
          houseAcc: HOUSEWALLET,
          pdaHouseAcc: PDAHOUSEWALLET,
          mint: mintAddress,
          solOracleAccount: new PublicKey(
            "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"
          ),
          providersSplTokenAccount: splTokenAccount,
          splPdaHouseAcc: splPDA,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
          tokenProgram: TOKENPROGRAM,
          systemProgram: SystemProgram.programId,
          affilAcc: AffilAcc,
        };

        const initTransaction = new Transaction().add(
          withdrawFromStaking(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        notify({
          type: "info",
          message: `Unstaking LP Token.`,
          txid: signature,
        });
        await connection.confirmTransaction(initSignature, "confirmed");
        const result = await checkLiquidiryProviderAcc(
          LProviderAcc,
          connection
        );
        setLProviderdata(result);
        const results = await checkLPdata(lpAcc, connection);
        setLPdata(results);
        notify({
          type: "success",
          message: `Successfully unstaked LP tokens`,
        });
        getUserSOLBalance(publicKey, connection);
        getUserUSDCBalance(publicKey, connection);
        const tokenBalance = await getSplTokenBalance(
          connection,
          publicKey,
          selectedCurrency
        );
        setTokenBalance(tokenBalance);
      } catch (error) {
        notify({
          type: "error",
          message: `Failed to unstake into the Vault`,
          description: error?.message,
        });
      }
    }
  }, [
    isInit,
    connection,
    publicKey,
    unstakeValue,
    LPdata,
    LProviderdata,
    selectedCurrency,
    splTokenAccount,
    usdcSplTokenAccount,
  ]);

  const getPoints = useCallback(async () => {
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
    let splPDA;
    if (selectedCurrency === "USDC") {
      mintAddress = PUSDCMINT;
      usdc = 1;
      splPDA = PUSDCPDA;
      deposit = (parseFloat(unstakeValue) * LAMPORTS_PER_SOL) / 1000;
    } else if (selectedCurrency === "SOL") {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
      splPDA = PSOLPDA;
      deposit = parseFloat(unstakeValue) * LAMPORTS_PER_SOL;
    }
    const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);

    if (LPdata?.locked) {
      notify({ type: "info", message: `Vault is locked.` });
    }
    {
      try {
        const LPAccseeds = [
          Buffer.from(houseHarcodedkey.toBytes()),
          Buffer.from(publicKey.toBytes()),
        ];

        const [LProviderAcc] = await PublicKey.findProgramAddress(
          LPAccseeds,
          PROGRAM_ID
        );

        const seedsUser = [Buffer.from(publicKey.toBytes())];
        const [userAcc] = await PublicKey.findProgramAddress(
          seedsUser,
          PROGRAM_ID
        );

        const seedsAffil = [isInit.usedAffiliate];

        const [AffilAcc] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );

        const args: ClaimPointsArgs = {
          affiliateCode: Array.from(isInit.usedAffiliate),
        };

        const accounts: ClaimPointsAccounts = {
          liqProvider: LProviderAcc,
          userAcc: userAcc,
          providersWallet: publicKey,
          lpAcc: lpAcc,
          signerWalletAccount: SIGNERWALLET,
          ratioAcc: RATIOACC,
          houseAcc: HOUSEWALLET,
          mint: mintAddress,
          solOracleAccount: new PublicKey(
            "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"
          ),
          systemProgram: SystemProgram.programId,
          affilAcc: AffilAcc,
        };

        const initTransaction = new Transaction().add(
          claimPoints(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        notify({
          type: "info",
          message: `Claiming Points.`,
          txid: signature,
        });
        await connection.confirmTransaction(initSignature, "confirmed");
        const result = await checkLiquidiryProviderAcc(
          LProviderAcc,
          connection
        );
        setLProviderdata(result);
        notify({
          type: "success",
          message: `Successfully Claimed Points`,
        });
      } catch (error) {
        notify({
          type: "error",
          message: `Failed to Claim Points`,
          description: error?.message,
        });
      }
    }
  }, [
    isInit,
    connection,
    publicKey,
    LPdata,
    LProviderdata,
    selectedCurrency,
    splTokenAccount,
    usdcSplTokenAccount,
  ]);

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
    let withdrawAmount;
    if (selectedCurrency === "USDC") {
      withdrawAmount = parseFloat(withdrawValue) / 1000;
      mintAddress = PUSDCMINT;
      usdc = 1;
    } else if (selectedCurrency === "SOL") {
      mintAddress = PSOLMINT; // Use the mint address for wSOL or your custom SPL token for SOL
      usdc = 0;
      withdrawAmount = parseFloat(withdrawValue);
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
    } else withdraw = withdrawAmount * LAMPORTS_PER_SOL;
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
        getUserSOLBalance(publicKey, connection);
        getUserUSDCBalance(publicKey, connection);
        const tokenBalance = await getSplTokenBalance(
          connection,
          publicKey,
          selectedCurrency
        );
        setTokenBalance(tokenBalance);
        const results = await checkLPdata(lpAcc, connection);
        setLPdata(results);
      } catch (error) {
        notify({
          type: "error",
          message: `Withdrawal Failed`,
          description: error?.message,
        });
      }
    }
  }, [
    isInit,
    connection,
    publicKey,
    withdrawValue,
    LPdata,
    LProviderdata,
    selectedCurrency,
    splTokenAccount,
    usdcSplTokenAccount,
  ]);

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
      console.log("HOUSEWALLET:", HOUSEWALLET); // Check if it's undefined or not a valid input

      const houseHarcodedkey = new PublicKey(HOUSEWALLET);
      const signerWalletAccount = new PublicKey(SIGNERWALLET);
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
        console.log(results);
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

      const houseHarcodedkey = new PublicKey(HOUSEWALLET);

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
  const [activeSection1, setActiveSection1] = useState("stake");

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
  const showStake = () => setActiveSection1("stake");
  const showUnstake = () => setActiveSection1("unstake");

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
          ((LProviderdata?.usdcWithdrawalRequestAmount || 0) /
            LAMPORTS_PER_SOL) *
          1000
        ).toFixed(2)
      : "0 USDC";

  const unstakedValue =
    selectedCurrency === "SOL"
      ? (LProviderdata?.psolStaked || 0) / LAMPORTS_PER_SOL
      : ((LProviderdata?.pusdcStaked || 0) / LAMPORTS_PER_SOL) * 1000;

  return (
    <div className="relative overflow-hidden">
      <div
        className="hidden md:flex overflow-hidden absolute futures-circles4 w-full h-full"
        style={{
          zIndex: -1,
          transform: "translate(-18%, -30%)",
          right: "0%",
        }}
      ></div>
      <div
        className="overflow-hidden absolute futures-circles4 w-full h-full"
        style={{
          zIndex: -1,
          transform: "translate(-18%, -30%)",
          right: "0%",
        }}
      ></div>
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
        className="md:hidden overflow-hidden absolute futures-circles1 w-full  h-1/3"
        style={{
          zIndex: -1,
          transform: "translate(-40%, 140%)",
          right: "0%",
        }}
      >
        {" "}
      </div>
      <div
        className="md:hidden overflow-hidden absolute futures-circles2 w-full h-1/3"
        style={{
          zIndex: -1,
          transform: "translate(48%, 30%)",
          right: "0%",
        }}
      ></div>
      <Head>
        <title>PopFi | Vault</title>
        <meta name="description" content="PopFi" />
      </Head>

      <div className="flex justify-center items-top md:pt-2 min-h-[calc(100vh-78px)] z-100">
        <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] ">
          <div className="w-full bankGothic flex md:flex-row flex-col  gap-[8px] text-4xl mt-2 lg:text-5xl text-white md:justify-between items-center justify-center">
            <h1 className="bankGothic md:text-start text-center text-3xl mt-2 lg:text-4xl text-transparent bg-clip-text bg-white">
              Vault
            </h1>
            <div className="w-[300px] flex flex-row items-center justify-center text-lg text-primary font-bankgothic-md-bt border-b-[2px] border-solid border-[#ffffff12]">
              <button
                className={`flex-1   h-10 flex flex-row  items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
                  selectedCurrency === "SOL"
                    ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-b-[2px] border-solid border-primary"
                    : "text-[#ffffff60]  long-short-button"
                }`}
                onClick={() => setSelectedCurrency("SOL")}
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
                    : "text-[#ffffff60]  long-short-button"
                }`}
                onClick={() => setSelectedCurrency("USDC")} // Set selectedCurrency to 'USDC'
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
          <div className="pt-2 bankGothic text-[#ffffff60] flex md:flex-row flex-col items-center justify-center gap-[16px] text-[1rem]  w-full px-2 md:px-0">
            <div className="z-10 md:w-[55%] w-full flex flex-col items-center justify-center relative gap-[8px] w-full self-stretch bg-[#23EAA4] hover:bg-[#23EAA490] transition-all duration-200 ease-in-out text-black md:rounded-2xl rounded-lg p-[1px] ">
              <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-end justify-center">
                <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-row items-center justify-center md:px-8 sm:gap-[16px]">
                  <img
                    className="my-0 mx-[!important] top-[20px] left-[calc(50%_-_143px)] sm:w-1/2 sm:min-w-[100px] w-1/3 min-w-[75px] sm:max-w-[150px] max-w-[100] z-[1] sm:p-0 p-3"
                    alt={selectedCurrency}
                    src={
                      selectedCurrency === "SOL"
                        ? "/coins/SOLLP.png"
                        : "/coins/USDCLP.png"
                    }
                  />
                  <div className="flex flex-col w-2/3 text-left h-[62px] flex flex-col items-start justify-center gap-[8px] z-[0] text-[18px]">
                    <div className="relative leading-[100%] text-[#ffffff60]">
                      {selectedCurrency === "SOL"
                        ? `SOLANA VAULT`
                        : `USDC VAULT`}
                    </div>
                    <div className="relative text-[36px] leading-[100%] font-semibold font-poppins bg-[#23EAA4] hover:bg-[#23EAA490] transition-all duration-200 ease-in-out text-black [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] text-left">
                      {calculateAPY(selectedCurrency, LPdata).toFixed(1)}% APY
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="z-10 bankGothic text-[#ffffff60] md:rounded-2xl rounded-lg bg-layer-1 box-border w-full flex sm:flex-row flex-col sm:items-center sm:justify-start items-start justify-center md:p-8 p-4 gap-[32px] text-sm">
              <div className="w-1/2 flex flex-col items-start justify-center gap-[32px]">
                <div className="flex flex-row items-center justify-start gap-[8px]">
                  <img
                    className="relative rounded-lg w-[42px] h-[42px]"
                    alt=""
                    src="/sheesh/icons.svg"
                  />
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className=" relative leading-[100%] text-[#ffffff60]">
                      Epoch
                    </div>
                    <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                      {LPdata?.epoch || 0}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-start gap-[8px]">
                  <img
                    className="relative rounded-lg w-[42px] h-[42px]"
                    alt=""
                    src="/sheesh/icons-1.png"
                  />
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="relative leading-[100%] text-[#ffffff60]">
                      Token Ratio
                    </div>
                    <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-left">
                      {selectedCurrency === "SOL"
                        ? `${(
                            ((LPdata?.psolValuation || 0) / LAMPORTS_PER_SOL) *
                            1000
                          ).toFixed(3)} pSOL/SOL`
                        : `${(
                            ((LPdata?.pusdcValuation || 0) / LAMPORTS_PER_SOL) *
                            1000
                          ).toFixed(3)} pUSDC/USD`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start justify-center gap-[32px]">
                <div className="flex flex-row items-center justify-start gap-[8px]">
                  <img
                    className="relative rounded-lg w-[42px] h-[42px]"
                    alt=""
                    src="/sheesh/icons-2.png"
                  />
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="relative leading-[100%] text-[#ffffff60]">
                      TVL
                    </div>
                    <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-left">
                      {selectedCurrency === "SOL"
                        ? `${((LPdata?.totalDeposits + LPdata?.projectsDepositedSol || 0) / LAMPORTS_PER_SOL).toFixed(2)} SOL`
                        : `${(((LPdata?.usdcTotalDeposits + LPdata?.projectsDepositedUsdc || 0) / LAMPORTS_PER_SOL) * 1000).toFixed(0)} USDC`}
                    </div>
                  </div>
                </div>
                {LPdata?.locked ? (
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons-5.svg"
                    />

                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Unlocking In
                      </div>
                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                        {timeUntilNextEpoch}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons-3.png"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Locking In
                      </div>
                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                        {timeUntilNextlockEpoch}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:hidden flex justify-center items-center gap-4 my-4 z-1000">
            <button
              onClick={showDeposit}
              className={`z-1000 text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                activeSection === "deposit"
                  ? " cursor-pointer border-b-2 border-gradient"
                  : "cursor-pointer text-[#ffffff60] "
              } ${activeSection === "withdraw" ? "" : "text-gray-text"} `}
            >
              Deposit
            </button>
            <button
              onClick={showWithdraw}
              className={`z-1000 text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                activeSection === "withdraw"
                  ? "cursor-pointer border-b-2 border-gradient"
                  : "cursor-pointer text-[#ffffff60] "
              } ${activeSection === "deposit" ? "" : "text-gray-text"} `}
            >
              Withdraw
            </button>
          </div>
          <div className="z-1000 mt-4 text-[#ffffff60] bankGothic w-full flex md:flex-row flex-col items-start justify-start gap-[16px] text-sm px-2 md:px-0">
            {(activeSection === "deposit" || !isMobile) && (
              <div className="z-1000 md:w-1/2 self-stretch flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[24px]">
                <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl">
                  <div className="hidden md:flex relative leading-[100%] text-[24px] text-white">
                    Deposit
                  </div>
                  <div className="self-stretch relative text-[1rem] leading-[140%] text-[#ffffff60]">
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
                      src="/sheesh/icons-4.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Deposited
                      </div>
                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                        {selectedCurrency === "SOL"
                          ? `${(
                              (tokenBalance * LPdata?.psolValuation * 1000 ||
                                0) / LAMPORTS_PER_SOL
                            ).toFixed(2)} SOL`
                          : `${(
                              (tokenBalance * LPdata?.pusdcValuation * 1000 ||
                                0) / LAMPORTS_PER_SOL
                            ).toFixed(0)} USDC`}
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
                  <div className=" hover:bg-[#ffffff24] transition-all duration-200 ease-in-out self-stretch rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-[1rem] text-grey">
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
                        const tokenBalance =
                          selectedCurrency === "SOL"
                            ? balance - 1 / 100
                            : usdcbalance;
                        // Assuming 'balance' is a numeric state or prop
                        const maxValue = Number(tokenBalance)
                          .toFixed(2)
                          .toString();
                        setdepositValue(maxValue); // Update the state, which will update the input value reactively
                      }}
                      className="relative leading-[14px] text-[#ffffff60] bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="rounded-lg bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black p-[1px]  w-full h-10   box-border text-center text-lg">
                  <button
                    onClick={deposittoLP}
                    className="flex flex-row items-center justify-center h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                  >
                    Deposit
                  </button>
                </div>
              </div>
            )}
            {(activeSection === "withdraw" || !isMobile) && (
              <div className="self-stretch md:w-1/2 z-10 flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[12px]">
                <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl">
                  <div className="hidden md:flex  relative leading-[100%] text-white  text-[24px]">
                    Withdraw
                  </div>
                  <div className="self-stretch relative text-[1rem] leading-[140%] font-light font-poppins text-[#ffffff60]">
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
                      src="/sheesh/icons-8.svg"
                    />
                    <div className="flex flex-col items-start justify-start gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Withdrawable
                      </div>
                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                        {selectedCurrency === "SOL"
                          ? `${(tokenBalance || 0).toFixed(2)} pSOL`
                          : `${(tokenBalance || 0).toFixed(0)} pUSDC`}
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px]"
                      alt=""
                      src="/sheesh/icons-1.png"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Pending Withdrawal
                      </div>
                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                        {selectedCurrency === "SOL"
                          ? `${result}`
                          : `${usdcresult}`}
                      </div>
                    </div>
                  </div>
                </div>
                {LProviderdata?.withdrawalRequestAmount != 0 &&
                LProviderdata?.withdrawalRequestEpoch == LPdata?.epoch ? (
                  <div className="rounded-lg bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black p-[1px]   w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={withdrawfromLP}
                      className="flex flex-row items-center justify-center h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      Claim Withdrawals
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
                      <div className="  hover:bg-[#ffffff24] transition-all duration-200 ease-in-out self-stretch rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-[1rem] text-grey">
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
                            const balance = tokenBalance;

                            const maxValue = Number(balance).toString();
                            setwithdrawValue(maxValue);
                          }}
                          className="relative leading-[14px] text-[#ffffff60] bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 rounded-lg bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black p-[1px]  w-full h-10   box-border text-center text-lg">
                      <button
                        onClick={withdrawfromLP}
                        className="flex flex-row items-center justify-center h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="z-1000 w-full md:hidden flex justify-center items-center gap-4 my-4">
            <button
              onClick={showStake}
              className={`z-1000 text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                activeSection1 === "stake"
                  ? " cursor-pointer border-b-2 border-gradient"
                  : "cursor-pointer text-[#ffffff60] "
              } ${activeSection1 === "unstake" ? "" : "text-gray-text"} `}
            >
              Stake
            </button>
            <button
              onClick={showUnstake}
              className={`z-1000 text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                activeSection1 === "unstake"
                  ? "cursor-pointer border-b-2 border-gradient"
                  : "cursor-pointer text-[#ffffff60] "
              } ${activeSection1 === "stake" ? "" : "text-gray-text"} `}
            >
              Unstake
            </button>
          </div>
          <div className="z-10 mt-4 text-[#ffffff60] bankGothic w-full flex md:flex-row flex-col items-start justify-start gap-[16px] text-sm px-2 md:px-0">
            {(activeSection1 === "stake" || !isMobile) && (
              <div className="md:w-1/2 self-stretch flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[24px]">
                <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl text-white">
                  <div className="hidden md:flex relative leading-[100%] text-[24px] text-white">
                    Stake
                  </div>
                  <div className="self-stretch relative text-[1rem] leading-[140%] font-light font-poppins text-[#ffffff60]">
                    <p className="m-0">
                      Stake your LP tokens in the vault and earn Points for
                      every trade on the platform.
                    </p>
                  </div>
                </div>
                <div className="self-stretch flex flex-col gap-[12px] sm:gap-[0px] items-start justify-center sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons-4.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Staked
                      </div>

                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-left">
                        {selectedCurrency === "SOL"
                          ? `${(
                              (LProviderdata?.psolStaked || 0) /
                              LAMPORTS_PER_SOL
                            ).toFixed(2)} pSOL`
                          : `${(
                              (LProviderdata?.pusdcStaked * 1000 || 0) /
                              LAMPORTS_PER_SOL
                            ).toFixed(0)} pUSDC`}
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="rounded-lg bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black p-[1px]  w-full h-10   box-border text-center text-lg">
                        <button
                          onClick={getPoints}
                          className="flex flex-row items-center justify-center h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                        >
                          Get Points
                        </button>
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
                  <div className=" hover:bg-[#ffffff24] transition-all duration-200 ease-in-out self-stretch rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-[1rem] text-grey">
                    <input
                      type="text"
                      className="w-full h-full input3-capsule__input relative leading-[14px] "
                      id="affiliateCode"
                      placeholder="0.00"
                      value={stakeValue}
                      onChange={handleInputChange3}
                      min={0.05}
                      max="100"
                    />
                    <button
                      onClick={() => {
                        const balance = tokenBalance;

                        const maxValue = Number(balance).toString();
                        setStakeValue(maxValue);
                      }}
                      className="relative leading-[14px] text-[#ffffff60] bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="rounded-lg bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black p-[1px]  w-full h-10   box-border text-center text-lg">
                  <button
                    onClick={stakeTokens}
                    className="flex flex-row items-center justify-center h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                  >
                    Stake
                  </button>
                </div>
              </div>
            )}
            {(activeSection1 === "unstake" || !isMobile) && (
              <div className="self-stretch md:w-1/2 z-10 flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[12px]">
                <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl text-white">
                  <div className="hidden md:flex  relative leading-[100%] text-white text-[24px]">
                    UNSTAKE
                  </div>
                  <div className="self-stretch relative text-[1rem] leading-[140%]  text-[#ffffff60]">
                    Unstake your LP tokens.
                  </div>
                </div>
                <div className=" self-stretch relative box-border h-px " />
                <div className="self-stretch flex flex-col gap-[12px] items-start justify-start  sm:justify-between">
                  <div className=" flex flex-row items-center justify-start gap-[8px]">
                    <img
                      className="relative rounded-lg w-[42px]"
                      alt=""
                      src="/sheesh/icons-8.svg"
                    />
                    <div className="flex flex-col items-start justify-start gap-[4px]">
                      <div className="relative leading-[100%] text-[#ffffff60]">
                        Unstakeable
                      </div>
                      <div className="relative text-xl leading-[100%] text-[#ffffff60] font-poppins text-white text-right">
                        {selectedCurrency === "SOL"
                          ? `${(
                              (LProviderdata?.psolStaked || 0) /
                              LAMPORTS_PER_SOL
                            ).toFixed(2)} pSOL`
                          : `${(
                              (LProviderdata?.pusdcStaked * 1000 || 0) /
                              LAMPORTS_PER_SOL
                            ).toFixed(0)} pUSDC`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full pt-3">
                  <div className="self-stretch h-[62px] flex flex-col items-start justify-start gap-[8px] font-poppins">
                    <div className="self-stretch flex flex-col items-start justify-start">
                      <div className="relative leading-[14px] inline-block max-w-[131px]">
                        Enter Amount
                      </div>
                    </div>
                    <div className="  hover:bg-[#ffffff24] transition-all duration-200 ease-in-out self-stretch rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-[1rem] text-grey">
                      <input
                        type="text"
                        className="w-full h-full input3-capsule__input relative leading-[14px] "
                        id="affiliateCode"
                        placeholder="0.00"
                        value={unstakeValue}
                        onChange={handleInputChange4}
                        min={0.05}
                        max="100"
                      />
                      <button
                        onClick={() => {
                          const balance = unstakedValue;

                          const maxValue = Number(balance).toString();
                          setUnstakeValue(maxValue);
                        }}
                        className="relative leading-[14px] text-[#ffffff60] bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg bg-[#23EAA490] hover:bg-[#23EAA4] transition-all duration-200 ease-in-out text-black p-[1px]  w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={unstakeTokens}
                      className="flex flex-row items-center justify-center h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      Unstake
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earn;
