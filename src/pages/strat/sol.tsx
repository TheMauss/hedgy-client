import Head from "next/head";
import { BN } from "@project-serum/anchor";
import { FC, useState, useEffect, useCallback, useRef } from "react";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import { FaQuestionCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { notify } from "utils/notifications";
import { deposit as depositInstruction } from "../../idl/instructions/depositSOL"; // Update with the correct path
import "react-tooltip/dist/react-tooltip.css";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import axios from "axios";
import dynamic from "next/dynamic";
import { usePriorityFee } from "../../contexts/PriorityFee";
import { VaultDepositor, VaultDepositorJSON } from "idl/accounts";
import { Vault, VaultJSON } from "idl/accounts";
import { initializeVaultDepositor as initVaultDepositor } from "../../idl/instructions"; // Update with the correct path
import { cancelRequestWithdraw } from "../../idl/instructions/cancelRequestWithdrawSOL"; // Update with the correct path
import { requestWithdraw } from "../../idl/instructions/requestWithdrawSOL"; // Update with the correct path
import { withdraw } from "../../idl/instructions/withdrawSOL"; // Update with the correct path
import {
  Token as TokenWithdraw,
  Shares,
  SharesPercent,
} from "../../idl/types/WithdrawUnit";
import LineChart from "../../components/Chart";
import Dropdown from "../../components/DropdownSol";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT5;

const DRIFT_VAULTS = new PublicKey(process.env.NEXT_PUBLIC_DRIFT_VAULTS);
const ASSOCIATED_TOKENPROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM
);
const WSOL_MINT = new PublicKey(process.env.NEXT_PUBLIC_WSOL_MINT);

const SOL_VAULT = new PublicKey(process.env.NEXT_PUBLIC_SOL_VAULT);
const SOL_AUTHORITY = new PublicKey(process.env.NEXT_PUBLIC_SOL_AUTHORITY);
const SOL_VAULT_TOKEN_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_VAULT_TOKEN_ADDRESS
);
const SOL_DRIFT_STATS = new PublicKey(process.env.NEXT_PUBLIC_SOL_DRIFT_STATS);
const SOL_DRIFT_USER = new PublicKey(process.env.NEXT_PUBLIC_SOL_DRIFT_USER);
const SOL_DRIFT_STATE = new PublicKey(process.env.NEXT_PUBLIC_SOL_DRIFT_STATE);
const SOL_DRIFT_SPOT_MARKET_VAULT = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_DRIFT_SPOT_MARKET_VAULT
);
const SOL_DRIFT_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_DRIFT_PROGRAM
);
const SOL_TOKEN_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_TOKEN_PROGRAM
);
const SOL_DRIFT_USDC_SPOT_MARKET = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_DRIFT_USDC_SPOT_MARKET
);
const SOL_DRIFT_SOL_SPOT_MARKET = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_DRIFT_SOL_SPOT_MARKET
);
const SOL_DRIFT_DSOL_SPOT_MARKET = new PublicKey(
  process.env.NEXT_PUBLIC_SOL_DRIFT_DSOL_SPOT_MARKET
);
const RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const SYSTEM_PROGRAM = new PublicKey("11111111111111111111111111111111");

async function prepareWrapSOLInstruction(
  connection,
  associatedTokenAccount,
  walletPublicKey,
  amount
) {
  // Convert the specified amount of SOL to lamports
  const lamports = amount * LAMPORTS_PER_SOL;

  const wrapInstruction = new Transaction();

  // Check if the associated token account already exists
  const accountInfo = await connection.getAccountInfo(associatedTokenAccount);

  if (!accountInfo) {
    // If it doesn't exist, add instruction to create the associated token account for wSOL
    wrapInstruction.add(
      createAssociatedTokenAccountInstruction(
        walletPublicKey, // Funding wallet (payer)
        associatedTokenAccount, // wSOL associated token account
        walletPublicKey, // Owner of the account
        NATIVE_MINT // Mint for wrapped SOL
      )
    );
  }

  // Add the transfer instruction to wrap SOL in the token account
  wrapInstruction.add(
    SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: associatedTokenAccount,
      lamports,
    })
  );

  // Sync the token account’s native SOL balance
  wrapInstruction.add(createSyncNativeInstruction(associatedTokenAccount));

  return wrapInstruction;
}

async function usdcSplTokenAccountSync(walletAddress) {
  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      SOL_TOKEN_PROGRAM.toBuffer(),
      WSOL_MINT.toBuffer(),
    ],
    ASSOCIATED_TOKENPROGRAM
  );
  return splTokenAccount;
}

function getVaultDepositorAddressSync(
  programId: PublicKey,
  vault: PublicKey,
  authority: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(new TextEncoder().encode("vault_depositor")),
      vault.toBuffer(),
      authority.toBuffer(),
    ],
    programId
  )[0];
}

function encodeName(name: string): number[] {
  if (name.length > 32) {
    throw Error(`Name (${name}) longer than 32 characters`);
  }

  const buffer = Buffer.alloc(32);
  buffer.fill(name);
  buffer.fill(" ", name.length);

  return Array(...buffer);
}

function getUserStatsAccountPublicKey(
  programId: PublicKey,
  authority: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(new TextEncoder().encode("user_stats")), authority.toBuffer()],
    programId
  )[0];
}

function getUserAccountPublicKeySync(
  programId: PublicKey,
  authority: PublicKey,
  subAccountId = 0
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(new TextEncoder().encode("user")),
      authority.toBuffer(),
      Buffer.from(new Uint8Array(new BN(subAccountId).toArray("le", 2))),
    ],
    programId
  )[0];
}

async function checkVaultDepositor(
  vaultDepositor: PublicKey,
  connection: Connection
): Promise<VaultDepositorJSON | null> {
  const vaultDepositorData = await VaultDepositor.fetch(
    connection,
    vaultDepositor
  );

  if (!vaultDepositorData) {
    console.log("Vault depositor account not found.");
    return null;
  }

  return vaultDepositorData.toJSON();
}

async function checkVaultData(
  vault: PublicKey,
  connection: Connection
): Promise<VaultJSON | null> {
  const vaultData = await Vault.fetch(connection, vault);

  if (!vaultData) {
    console.log("Vault depositor account not found.");
    return null;
  }

  return vaultData.toJSON();
}

require("dotenv").config();

const SOL: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const usdcbalance = useUserSOLBalanceStore((s) => s.usdcBalance);
  const { getUserSOLBalance, getUserUSDCBalance } = useUserSOLBalanceStore();
  const [amount, setAmount] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [displeyAmount, setDispleyAmount] = useState("");
  const [vaultDepositor, setVaultDepositor] = useState<PublicKey | null>(null);
  const [USDCAddress, setUSDCAddress] = useState<PublicKey | null>(null);
  const [depositorData, setDepositorData] = useState<VaultDepositorJSON | null>(
    null
  );
  const [maxSet, setMaxSet] = useState<boolean>(false);
  const [vaultData, setVaultData] = useState<VaultJSON | null>(null);
  const wallet = useWallet();
  const [waves, setWaves] = useState([]);
  const { isPriorityFee, setPriorityFee } = usePriorityFee();
  const [selectedStake, setSelectedStake] = useState<"DEPOSIT" | "WITHDRAW">(
    "DEPOSIT"
  );

  const [depositorEquity, setDepositorEquity] = useState(null);
  const [vaultEquity, setVaultEquity] = useState(null);
  const [jlpPremium, setJLPPremium] = useState(null);
  const [dayChart, setDayChart] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1 WEEK");
  const [apy, setApy] = useState(null);

  const handleAmountClick = (type) => {
    let tokenBalance;

    if (type === "HALF" && !isNaN(Number(amount)) && Number(amount) > 0) {
      tokenBalance = Number(amount) / 2;
      setMaxSet(false);
    } else {
      if (selectedStake === "DEPOSIT") {
        tokenBalance = type === "HALF" ? balance / 2 : balance;
        tokenBalance = tokenBalance;
        setMaxSet(false);
      } else {
        const participantDepositTotal = depositorEquity
          ? Number(depositorEquity / 10e8)
          : 0;
        setMaxSet(true);

        tokenBalance = participantDepositTotal;
      }
    }
    const maxValue = Math.max(Number(tokenBalance), 0);
    const displayMax = Math.max(Number(tokenBalance), 0).toFixed(2);

    setAmount(maxValue.toString()); // Update the state, which will update the input value reactively
    setDispleyAmount(displayMax.toString()); // Update the state, which will update the input value reactively
  };

  const formatPublicKey = (pubKey) => {
    if (!pubKey) return "";
    return `${pubKey.slice(0, 3)}...${pubKey.slice(-3)}`;
  };

  const handleWithdrawDecision = async (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newWave = {
      x,
      y,
      size,
      key: Date.now(), // Use a unique key for each wave
    };

    setWaves((prevWaves) => [...prevWaves, newWave]);

    // Remove the wave after animation ends
    setTimeout(() => {
      setWaves((prevWaves) =>
        prevWaves.filter((wave) => wave.key !== newWave.key)
      );
    }, 600);
  };

  const handleWithdrawRequest = async () => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }
    let PRIORITY_FEE_IX;

    if (isPriorityFee) {
      const priorityfees = await getPriorityFeeEstimate();
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityfees,
      });
    } else {
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0,
      });
    }

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });
    console.log(depositorData.vaultShares);
    console.log(Number(amount) * 10e8);

    let withdrawAmount;
    let withdrawUnit;

    if (maxSet) {
      // Fetch the depositor's equity when maxSet is true
      const depositorEquity = await fetchDepositorEquitys();
      console.log(Number(depositorEquity));

      // Set the withdraw amount and unit based on the equity
      withdrawAmount = new BN(1000000);
      withdrawUnit = new SharesPercent();
    } else {
      // Use the provided amount directly when maxSet is false
      withdrawAmount = new BN(Number(amount) * 10e8);
      withdrawUnit = new TokenWithdraw();
    }

    // Construct the RequestWithdrawArgs object
    const RequestWithdrawArgs = {
      withdrawAmount,
      withdrawUnit,
    };

    const RequestAccounts = {
      vault: SOL_VAULT,
      vaultDepositor: vaultDepositor,
      authority: publicKey,
      driftUserStats: SOL_DRIFT_STATS,
      driftUser: SOL_DRIFT_USER,
      driftState: SOL_DRIFT_STATE,
      acc11: new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"), // Replace with actual account 12 PublicKey
      acc12: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("7QJ6e57t3yM8HYVg6bAnJiCiZ3wQQ5CSVsa6GA16nJuK"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 16 PublicKey
      acc10: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 16 PublicKey
      spotMarketAddress: SOL_DRIFT_USDC_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      spotMarketSOLAddress: SOL_DRIFT_SOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      spotMarketdSOLAddress: SOL_DRIFT_DSOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc19: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"), // Replace with actual account 18 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"), // Replace with actual account 18 PublicKey
    };

    try {
      let tx = new Transaction();

      // 3. Create deposit instruction and add to transaction
      const depositIx = requestWithdraw(RequestWithdrawArgs, RequestAccounts);
      tx.add(COMPUTE_BUDGET_IX).add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Withdraw Request transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdraw Request transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
        fetchVaultEquity();
        fetchDepositorEquity();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Withdraw Request transaction failed!",
        description: error.message,
      });
    }
  };

  const handleCancelRequest = async () => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }
    let PRIORITY_FEE_IX;

    if (isPriorityFee) {
      const priorityfees = await getPriorityFeeEstimate();
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityfees,
      });
    } else {
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0,
      });
    }

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });

    const RequestArgs = {
      marketIndex: 0,
    };

    const RequestAccounts = {
      vault: SOL_VAULT,
      vaultDepositor: vaultDepositor,
      authority: publicKey,
      driftUserStats: SOL_DRIFT_STATS,
      driftUser: SOL_DRIFT_USER,
      driftState: SOL_DRIFT_STATE,
      acc11: new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"), // Replace with actual account 12 PublicKey
      acc12: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("7QJ6e57t3yM8HYVg6bAnJiCiZ3wQQ5CSVsa6GA16nJuK"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 16 PublicKey
      acc10: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 16 PublicKey
      spotMarketAddress: SOL_DRIFT_USDC_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      spotMarketSOLAddress: SOL_DRIFT_SOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      spotMarketdSOLAddress: SOL_DRIFT_DSOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc19: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"), // Replace with actual account 18 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"), // Replace with actual account 18 PublicKey
    };

    try {
      let tx = new Transaction();

      // 3. Create deposit instruction and add to transaction
      const depositIx = cancelRequestWithdraw(RequestAccounts);
      tx.add(COMPUTE_BUDGET_IX).add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Cancel transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Cancel transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
        fetchVaultEquity();
        fetchDepositorEquity();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Cancel transaction failed!",
        description: error.message,
      });
    }
  };

  const handleClaimWithdrawal = async () => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }
    let PRIORITY_FEE_IX;

    if (isPriorityFee) {
      const priorityfees = await getPriorityFeeEstimate();
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityfees,
      });
    } else {
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0,
      });
    }

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });

    const RequestAccounts = {
      vault: SOL_VAULT, // Replace with actual vault public key
      vaultDepositor: vaultDepositor, // Replace with actual depositor public key
      authority: publicKey, // User's public key (from wallet adapter)
      vaultTokenAccount: SOL_VAULT_TOKEN_ADDRESS, // Replace with actual vault token account
      driftUserStats: SOL_DRIFT_STATS, // Replace with drift user stats account
      driftUser: SOL_DRIFT_USER, // Replace with drift user account
      driftState: SOL_DRIFT_STATE, // Replace with drift state account
      driftSpotMarketVault: SOL_DRIFT_SPOT_MARKET_VAULT, // Replace with spot market vault account
      driftSigner: new PublicKey("JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw"), // Replace with drift user account
      userTokenAccount: USDCAddress, // User's token account for depositing tokens
      driftProgram: SOL_DRIFT_PROGRAM, // Replace with actual Drift program ID
      tokenProgram: SOL_TOKEN_PROGRAM, // Standard SPL token program ID
      acc10: new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"), // Replace with actual account 12 PublicKey
      acc11: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 13 PublicKey
      acc12: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("7QJ6e57t3yM8HYVg6bAnJiCiZ3wQQ5CSVsa6GA16nJuK"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 16 PublicKey
      spotMarketAddress: SOL_DRIFT_USDC_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      spotMarketAddressSOL: SOL_DRIFT_SOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      spotMarketAddressdSOL: SOL_DRIFT_DSOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc19: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"), // Replace with actual account 19 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"),
    };

    try {
      let tx = new Transaction();
      tx.add(COMPUTE_BUDGET_IX);
      // Check if the associated token account already exists
      const accountInfo = await connection.getAccountInfo(USDCAddress);

      if (!accountInfo) {
        // If it doesn't exist, add instruction to create the associated token account for wSOL
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // Funding wallet (payer)
            USDCAddress, // wSOL associated token account
            publicKey, // Owner of the account
            NATIVE_MINT // Mint for wrapped SOL
          )
        );
      }

      // 3. Create deposit instruction and add to transaction
      const depositIx = withdraw(RequestAccounts);
      tx.add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Withdrawal transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdrawal transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
        fetchVaultEquity();
        fetchDepositorEquity();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Withdrawal transaction failed!",
        description: error.message,
      });
    }
  };

  const handleDeposit = async (e) => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newWave = {
      x,
      y,
      size,
      key: Date.now(), // Use a unique key for each wave
    };

    setWaves((prevWaves) => [...prevWaves, newWave]);

    // Remove the wave after animation ends
    setTimeout(() => {
      setWaves((prevWaves) =>
        prevWaves.filter((wave) => wave.key !== newWave.key)
      );
    }, 600);
    if (!publicKey) {
      notify({ type: "error", message: "Wallet not connected!" });
      return;
    }

    let PRIORITY_FEE_IX;

    if (isPriorityFee) {
      const priorityfees = await getPriorityFeeEstimate();
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityfees,
      });
    } else {
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0,
      });
    }

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });

    const depositArgs = {
      marketIndex: 1,
      amount: new BN(Number(amount) * 1e9), // Adjust precision based on the token
      reduceOnly: false,
    };

    const depositAccounts = {
      vault: SOL_VAULT, // Replace with actual vault public key
      vaultDepositor: vaultDepositor, // Replace with actual depositor public key
      authority: publicKey, // User's public key (from wallet adapter)
      vaultTokenAccount: SOL_VAULT_TOKEN_ADDRESS, // Replace with actual vault token account
      driftUserStats: SOL_DRIFT_STATS, // Replace with drift user stats account
      driftUser: SOL_DRIFT_USER, // Replace with drift user account
      driftState: SOL_DRIFT_STATE, // Replace with drift state account
      driftSpotMarketVault: SOL_DRIFT_SPOT_MARKET_VAULT, // Replace with spot market vault account
      userTokenAccount: USDCAddress, // User's token account for depositing tokens
      driftProgram: SOL_DRIFT_PROGRAM, // Replace with actual Drift program ID
      tokenProgram: SOL_TOKEN_PROGRAM, // Standard SPL token program ID
      acc10: new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"), // Replace with actual account 12 PublicKey
      acc11: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 13 PublicKey
      acc12: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("7QJ6e57t3yM8HYVg6bAnJiCiZ3wQQ5CSVsa6GA16nJuK"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 16 PublicKey
      spotMarketAddress: SOL_DRIFT_USDC_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      spotMarketAddressSOL: SOL_DRIFT_SOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      spotMarketAddressdSOL: SOL_DRIFT_DSOL_SPOT_MARKET, // Replace with actual spot market address (e.g., USDC market)
      acc19: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"), // Replace with actual account 19 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"),
    };

    try {
      console.log(USDCAddress.toString());
      let tx = new Transaction();

      const wrapIx = await prepareWrapSOLInstruction(
        connection,
        USDCAddress,
        wallet.publicKey,
        amount
      );
      tx.add(wrapIx);

      // 1. Check if the vaultDepositor account exists
      const depositorInfo = await connection.getAccountInfo(vaultDepositor);

      if (!depositorInfo) {
        // 2. Initialize vaultDepositor if it doesn't exist

        const vaultAccounts = {
          vault: SOL_VAULT, // Replace with actual vault public key
          vaultDepositor: vaultDepositor, // Replace with actual depositor public key
          authority: publicKey, // User's public key (from wallet adapter)
          payer: publicKey, // Replace with actual vault token account
          rent: RENT, // Replace with drift user stats account
          systemProgram: SYSTEM_PROGRAM, // Replace with drift user account                        // Standard SPL token program ID
        };
        const initVaultDepositorIx = initVaultDepositor(vaultAccounts);
        tx.add(initVaultDepositorIx);
      }

      // 3. Create deposit instruction and add to transaction
      const depositIx = depositInstruction(depositArgs, depositAccounts);
      tx.add(COMPUTE_BUDGET_IX).add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Deposit transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Deposit transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
        fetchVaultEquity();
        fetchDepositorEquity();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Deposit transaction failed!",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
      getUserUSDCBalance(publicKey, connection);
      const Depositor = getVaultDepositorAddressSync(
        DRIFT_VAULTS,
        SOL_VAULT,
        publicKey
      );
      setVaultDepositor(Depositor);
      const fetchUSDCAddress = async () => {
        if (publicKey) {
          const USDCAddy = await usdcSplTokenAccountSync(publicKey);
          setUSDCAddress(USDCAddy); // Now USDCAddy is resolved to PublicKey
        }
      };
      fetchUSDCAddress();
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey && vaultDepositor) {
      const fetchDepositorEquity = async () => {
        try {
          const response = await fetch(
            // `http://localhost:3050/api/vaults-sol/depositor-equity/${vaultDepositor}`
            `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/depositor-equity/${vaultDepositor}`
          );
          const data = await response.json();
          setDepositorEquity(data.equity);
        } catch (error) {
          console.error("Error fetching depositor equity:", error);
        }
      };

      fetchDepositorEquity();
    }
  }, [publicKey, vaultDepositor]);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const response = await fetch(
          `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/equity`
          // `http://localhost:3050/api/vaults-sol/equity`
        );
        const data = await response.json();
        setVaultEquity(data.vaultEquity);
        setJLPPremium(data.jlpPremium);
        setApy(Number(data.apy)); // Store APY with compounding in the state
      } catch (error) {
        console.error("Error fetching vault equity:", error);
      }
    };
    fetchVaultData();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        let apiUrl = "";

        if (selectedTimeframe === "1 WEEK") {
          // apiUrl = `http://localhost:3050/api/vaults-sol/equity-weekly`; // Weekly data
          apiUrl = `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/equity-weekly`;
        } else if (selectedTimeframe === "1 DAY") {
          // apiUrl = `http://localhost:3050/api/vaults/equity-daily`; // Daily data
          apiUrl = `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/equity-daily`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();
        setDayChart(data.chartData);

        // Process the chartData for the chart
        const labels = data.chartData.map((item) => {
          if (item.timestamp) {
            const date = new Date(item.timestamp);

            // Conditionally format the labels based on the selected timeframe
            if (selectedTimeframe === "1 WEEK") {
              return date.toLocaleDateString([], {
                month: "2-digit",
                day: "2-digit",
              }); // Show days for weekly data (MM/DD)
            } else if (selectedTimeframe === "1 DAY") {
              return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }); // Show hours for daily data (HH:MM)
            }
          } else {
            return ""; // Fallback for missing timestamp
          }
        });

        const dataPoints = data.chartData.map((item) =>
          Number(item.priceOfEquity)
        );

        setChartLabels(labels.reverse()); // Set chart labels
        setChartDataPoints(dataPoints.reverse()); // Set chart data points
      } catch (error) {
        console.error("Error fetching vault equity:", error);
      }
    };
    fetchChartData();
  }, [selectedTimeframe]);

  const fetchVaultData = async () => {
    const data = await checkVaultData(SOL_VAULT, connection);
    console.log(data);
    setVaultData(data);
  };

  const fetchVaultEquity = async () => {
    try {
      const response = await fetch(
        `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/equity`
        // `http://localhost:3050/api/vaults/equity`
      );
      const data = await response.json();
      setVaultEquity(data.vaultEquity);
      setDayChart(data.chartData);
      setJLPPremium(data.jlpPremium);
      setApy(Number(data.apy)); // Store APY with compounding in the state
    } catch (error) {
      console.error("Error fetching vault equity:", error);
    }
  };

  const fetchDepositorEquitys = async () => {
    try {
      const response = await fetch(
        `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/depositor-equity/${vaultDepositor}`
      );
      const data = await response.json();
      return data.equity; // Return the equity value
    } catch (error) {
      console.error("Error fetching depositor equity:", error);
      throw error; // Re-throw the error to handle it upstream
    }
  };

  const fetchDepositorEquity = async () => {
    try {
      const response = await fetch(
        // `http://localhost:3050/api/vaults/depositor-equity/${vaultDepositor}`
        `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/depositor-equity/${vaultDepositor}`
      );
      const data = await response.json();
      setDepositorEquity(data.equity);
    } catch (error) {
      console.error("Error fetching depositor equity:", error);
    }
  };

  const fetchDepositorData = async () => {
    const data = await checkVaultDepositor(vaultDepositor, connection);
    console.log(data);
    setDepositorData(data);
  };

  useEffect(() => {
    if (connection) {
      const fetchVaultData = async () => {
        const data = await checkVaultData(SOL_VAULT, connection);
        console.log(data);
        setVaultData(data);
      };
      fetchVaultData();
    }
    if (vaultDepositor) {
      const fetchDepositorData = async () => {
        const data = await checkVaultDepositor(vaultDepositor, connection);
        console.log(data);
        setDepositorData(data);
      };
      fetchDepositorData();
    }
  }, [vaultDepositor, connection, publicKey]);

  // const fetchParticipantData = async () => {
  //   try {
  //     const data = await checkLotteryAccount(connection);
  //     const participant = data.participants.find(
  //       (participant) => participant.pubkey === publicKey.toString()
  //     );
  //     const data2 = await checkLotteryAccount2(connection);
  //     const participant2 = data2.participants.find(
  //       (participant2) => participant2.pubkey === publicKey.toString()
  //     );
  //     setParticipantData(participant || null);
  //     setParticipantData2(participant2 || null);
  //   } catch (error) {
  //     console.error("Error fetching lottery account data:", error);
  //   }
  // };

  // myslet na to!
  // useEffect(() => {
  //   fetchLotteryAccountData();
  // }, [connection]);

  // // myslet na to!
  // useEffect(() => {
  //   if (publicKey) {
  //     setTimeout(() => {
  //       fetchParticipantData();
  //     }, 150);
  //   }
  // }, [publicKey, connection]);

  const getPriorityFeeEstimate = async () => {
    try {
      const rpcUrl = ENDPOINT5;

      const requestData = {
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            accountKeys: [
              "StkraNY8rELLLoDHmVg8Di8DKTLbE8yAWZqRR9w413n",
              "DxD41srN8Xk9QfYjdNXF9tTnP6qQxeF2bZF8s1eN62Pe",
            ],
            options: {
              includeAllPriorityFeeLevels: true,
            },
          },
        ],
      };

      const response = await axios.post(rpcUrl, requestData);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = response.data;
      if (responseData.error) {
        throw new Error(
          `RPC error! Code: ${responseData.error.code}, Message: ${responseData.error.message}`
        );
      }

      return responseData.result.priorityFeeLevels.veryHigh.toFixed(0);
    } catch (error) {
      console.error("Error fetching priority fee estimate:", error);
    }
  };

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
    setMaxSet(false);
    setAmount(sanitizedValue); // Use maxValue for POOL1
    setDispleyAmount(sanitizedValue);
  };

  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (depositorData?.lastWithdrawRequest?.ts) {
      const withdrawTimestamp =
        Number(depositorData.lastWithdrawRequest.ts) * 1000 +
        24 * 60 * 60 * 1000; // Convert the timestamp if needed

      const updateCountdown = () => {
        const now = Date.now();
        const timeDiff = withdrawTimestamp - now;
        if (timeDiff > 0) {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining("Ready to claim");
        }
      };

      updateCountdown(); // Run once on mount
      const intervalId = setInterval(updateCountdown, 1000); // Update every second

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [depositorData]);

  return (
    <div className="overflow-hidden">
      <Head>
        <title>Hedgy</title>
        <meta
          name="description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta name="keywords" content="Delta Neutral, DeFi, JLP, Drift Trade" />{" "}
        {/* SEO keywords */}
        <meta name="author" content="" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="Hedgy Market" />
        <meta
          property="og:description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta property="og:image" content="/strat.png" />
        <meta property="og:url" content="https://hedgy.market/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="" />
        <meta
          name="twitter:description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta name="twitter:image" content="/strat.png" />
        <link rel="icon" href="/hedgy.svg" />
      </Head>

      <div className="flex justify-center items-top min-h-[calc(100vh-172px)] z-100 ">
        <div className="w-[95%] max-w-[1550px]">
          <div className=" flex md:flex-row flex-col gap-6">
            <div className="lg:w-[68%] md:w-[58%] flex flex-col">
              <div className="w-full rounded-2xl overflow-hidden text-left text-base py-6 text-neutral-06 font-gilroy-bold [background:linear-gradient(130deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid">
                <div className="lg:flex  w-full flex lg:flex-row flex-col lg:gap-0 md:gap-4  px-10 items-center justify-between box-border text-[20px] font-gilroy-semibold">
                  <div className="flex flex-col md:flex-row items-center justify-start  px-2 md:gap-[16px] md:rounded-2xl  lg:[backdrop-filter:blur(0px)] md:[backdrop-filter:blur(20px)] rounded-2xl">
                    <div className="relative group profile-picture-container w-16 h-16">
                      {/* Display the current profile image */}
                      <img
                        className={`w-16 h-16 rounded-full object-cover`}
                        alt="Profile"
                        src="/jup.png"
                      />

                      {/* Hidden file input to select new image */}
                    </div>
                    <div className="flex flex-col items-center justify-center md:items-start md:justify-center gap-[4px] ">
                      <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] text-center">
                        JLP - SOL Max Exposure Strategy
                      </div>

                      <div className="opacity-[0.4] text-[15px] tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block">
                        Maximize your SOL Yield
                      </div>
                    </div>
                    <div className="md:hidden rounded-2xl  h-[90px] flex flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                      <div className="flex flex-col items-center justify-center md:items-end md:justify-center gap-[4px] ">
                        <div className="text-[36px] self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                          <div>
                            {apy !== null ? (
                              <span>
                                {apy.toFixed(2)}%{" "}
                                <span className="opacity-[0.4]">APY</span>
                              </span>
                            ) : (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            )}
                          </div>{" "}
                        </div>

                        <Tooltip
                          anchorSelect="#Yield"
                          place="bottom"
                          className="font-gilroy-regular max-w-xs p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                        >
                          APY compounded monthly after performance fees, based
                          on the last 7 days performance
                        </Tooltip>
                        <div
                          id="Yield"
                          className="opacity-[0.4] text-[15px] justify-end text-end tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block"
                        >
                          Projected Yield{" "}
                          <FaQuestionCircle className="mt-0.5 text-[12px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex rounded-2xl  h-[90px] flex flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                    <div className="flex flex-col items-center justify-center text-center gap-[4px] ">
                      <div className="text-[36px] self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                        <div>
                          {apy !== null ? (
                            <span>
                              {apy.toFixed(2)}%{" "}
                              <span className="opacity-[0.4]">APY</span>
                            </span>
                          ) : (
                            <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                          )}
                        </div>{" "}
                      </div>

                      <Tooltip
                        anchorSelect="#Yield"
                        place="bottom"
                        className="font-gilroy-regular max-w-xs p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                      >
                        APY compounded monthly after performance fees, based on
                        the last 7 days performance
                      </Tooltip>
                      <div
                        id="Yield"
                        className="opacity-[0.4] text-[15px] justify-end text-end tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block"
                      >
                        Projected Yield{" "}
                        <FaQuestionCircle className="mt-0.5 text-[12px]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full py-2 px-8 rounded-2xl min-h-[90px] flex flex-row md:flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                  <div className="w-full border-t-layer-2 border-t-[1px] py-3 md:border-solid self-stretch flex flex-row items-center justify-between gap-[32px] ">
                    <div className="flex w-1/2 md:flex-row flex-col justify-center items-center text-center gap-2 md:gap-0">
                      <div className="md:w-1/2 flex flex-col justify-center items-center text-center md:gap-[4px]">
                        <div className="tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                          <span className="text-[21px]">
                            {isNaN(Number(vaultEquity) / 10e8) ||
                            vaultEquity === null ||
                            vaultData?.netDeposits === undefined ? (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            ) : (
                              (Number(vaultEquity) / 10e8).toFixed(2)
                            )}
                            {" SOL"}
                          </span>
                        </div>
                        <div className="font-gilroy-regular self-stretch text-[15px] tracking-[-0.03em] leading-[120.41%] opacity-[0.4]">
                          Vault TVL
                        </div>
                      </div>
                      <div className="md:w-1/2 border-r-layer-2 border-r-[1px] md:border-solid  flex flex-col justify-center items-center text-center justify-center md:gap-[4px]">
                        <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                          <span></span>
                          <span className="text-[21px]">
                            {isNaN(
                              (Number(vaultEquity) -
                                Number(vaultData?.netDeposits)) /
                                10e8
                            ) ||
                            vaultEquity === null ||
                            vaultData?.netDeposits === undefined ? (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            ) : (
                              (
                                (Number(vaultEquity) -
                                  Number(vaultData?.netDeposits)) /
                                10e8
                              ).toFixed(2)
                            )}
                            {" SOL"}
                          </span>
                        </div>
                        <div className="font-gilroy-regular self-stretch text-[15px] tracking-[-0.03em] leading-[120.41%] opacity-[0.4]">
                          Total Profit
                        </div>
                      </div>
                    </div>
                    <div className=" w-1/2 flex flex-col md:flex-row justify-center items-center text-center gap-2 md:gap-0">
                      <div className="md:w-1/2 flex flex-col justify-center items-center text-center justify-center md:gap-[4px]">
                        <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                          <span></span>
                          <span className="text-[21px]">
                            {isNaN(Number(depositorEquity) / 10e8) ||
                            depositorEquity === null ||
                            depositorData?.netDeposits === undefined
                              ? 0
                              : (Number(depositorEquity) / 10e8).toFixed(2)}
                            {" SOL"}
                          </span>
                        </div>
                        <div className="font-gilroy-regular self-stretch text-[15px] tracking-[-0.03em] leading-[120.41%] opacity-[0.4]">
                          Your Deposit
                        </div>
                      </div>
                      <div className="md:w-1/2 flex flex-col justify-center items-center text-center justify-center md:gap-[4px]">
                        <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                          <span></span>
                          <span className="text-[21px]">
                            {" "}
                            {isNaN(
                              (Number(depositorEquity) -
                                Number(depositorData?.netDeposits)) /
                                10e8
                            ) ||
                            depositorEquity === null ||
                            depositorData?.netDeposits === undefined
                              ? 0
                              : (
                                  (Number(depositorEquity) -
                                    Number(depositorData?.netDeposits)) /
                                  10e8
                                ).toFixed(2)}
                            {" SOL"}
                          </span>
                        </div>
                        <div className="font-gilroy-regular self-stretch text-[15px] tracking-[-0.03em] leading-[120.41%] opacity-[0.4]">
                          Your Profit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="mt-6 p-6 rounded-2xl border-layer-2 border-[1px] border-solid"
                style={{
                  backgroundImage: "url('/frames.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top",
                }}
              >
                <div className="font-gilroy-regular self-stretch flex flex-col items-start justify-center gap-3 z-[0] text-left text-3xl text-neutral-06">
                  <b className="relative tracking-[-0.21px] ">
                    Strategy Performance
                  </b>
                  <div className="font-gilroy-regular pb-3 flex flex-row items-center justify-start gap-[5px] text-right text-xs text-grey-text">
                    {/* <div className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-40 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary">
                      <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                        1 Year
                      </div>
                    </div>
                    <div
                          className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-40 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary"
                        >
                          <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            1 Month
                          </div>
                        </div> */}
                    <div
                      className={`cursor-pointer rounded-lg py-1 px-2 text-sm text-primary transition-all duration-200 ease-in-out flex flex-row items-center justify-center ${
                        selectedTimeframe === "1 WEEK"
                          ? "bg-mediumspringgreen-50 opacity-100"
                          : "bg-mediumspringgreen-50 opacity-70 hover:opacity-40"
                      }`}
                      onClick={() => setSelectedTimeframe("1 WEEK")}
                    >
                      <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                        1 WEEK
                      </div>
                    </div>
                    <div
                      className={`cursor-pointer rounded-lg py-1 px-2 text-sm text-primary transition-all duration-200 ease-in-out flex flex-row items-center justify-center ${
                        selectedTimeframe === "1 DAY"
                          ? "bg-mediumspringgreen-50 opacity-100"
                          : "bg-mediumspringgreen-50 opacity-70 hover:opacity-40"
                      }`}
                      onClick={() => setSelectedTimeframe("1 DAY")}
                    >
                      <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                        1 DAY
                      </div>
                    </div>
                  </div>
                </div>
                <LineChart labels={chartLabels} dataPoints={chartDataPoints} />
              </div>
            </div>
            <div className="flex flex-col gap-8 lg:w-[32%] md:w-[42%] flex flex-col items-start justify-start md:max-h-[500px]">
              <div className="[background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid w-full flex-1 rounded-2xl flex flex-col items-between justify-start py-6 px-5 md:p-8 box-border gap-5 text-gray-200 font-gilroy-regular">
                <div className="border-layer-2 border-[1px] border-solid self-stretch rounded-lg bg-layer-1 flex flex-row items-center justify-start p-1 text-neutral-06 font-gilroy-semibold">
                  <div
                    className={`cursor-pointer flex-1 rounded-lg overflow-hidden flex flex-row items-center justify-center p-2 transition-background ${
                      selectedStake === "DEPOSIT"
                        ? "bg-bg  text-white"
                        : " bg-layer-1 opacity-40 hover:text-white transition-all duration-200"
                    }`}
                    onClick={() => setSelectedStake("DEPOSIT")}
                  >
                    Deposit
                  </div>
                  <div
                    className={`cursor-pointer flex-1 rounded-lg flex flex-row items-center justify-center p-2 transition-background ${
                      selectedStake === "WITHDRAW"
                        ? "bg-bg  text-white"
                        : " bg-layer-1 opacity-40 hover:text-white transition-all duration-200"
                    }`}
                    onClick={() => setSelectedStake("WITHDRAW")}
                  >
                    Withdraw
                  </div>
                </div>
                <div className="rounded-2xl border-layer-2 border-[1px] border-solid self-stretch flex flex-col items-start justify-start text-sm">
                  <div className="self-stretch rounded-2xl flex flex-row items-center justify-between gap-[2] p-4 box-border">
                    <div className="flex flex-col items-start justify-center gap-[8px]">
                      <div className="tracking-[-0.03em] leading-[120.41%]">
                        You are{" "}
                        {selectedStake === "DEPOSIT"
                          ? "depositing"
                          : "withdrawing"}
                      </div>
                      <div className="rounded-lg overflow-hidden flex flex-row items-center justify-center gap-[10.3px] text-lg text-neutral-06 font-gilroy-semibold">
                        <img
                          className="w-8 rounded-981xl h-8 overflow-hidden shrink-0 object-cover"
                          alt=""
                          src="/sol.png"
                        />
                        <div className="tracking-[-0.21px]">SOL</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end gap-1">
                      <div className="flex flew-row gap-2">
                        <div
                          className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-40 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary"
                          onClick={() => handleAmountClick("HALF")}
                        >
                          <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            HALF
                          </div>
                        </div>
                        <div
                          className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-40 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary"
                          onClick={() => handleAmountClick("MAX")}
                        >
                          <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            MAX
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        className="w-full input-capsule__input text-13xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold bg-black"
                        placeholder="0.00"
                        value={displeyAmount}
                        onChange={handleInputChange}
                        min={0.05}
                        step={0.05}
                      />
                    </div>
                  </div>{" "}
                </div>
                <div className="self-stretch flex flex-row items-center justify-between">
                  <div className="w-[74px] tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                    Balance
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <div className="text-white tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                      {balance.toFixed(1)} SOL
                    </div>
                    {/* <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldwallet2.svg"
                      /> */}
                  </div>
                </div>

                {selectedStake === "DEPOSIT" && (
                  <div className="self-stretch flex flex-row items-center justify-between">
                    <div className="tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                      Minimum Deposit
                    </div>
                    <div className="flex flex-row items-center justify-start gap-[8px]">
                      <div className="tracking-[-0.03em] text-white leading-[120.41%] inline-block h-[18px] shrink-0">
                        1 SOL
                      </div>
                      {/* <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldwallet2.svg"
                      /> */}
                    </div>
                  </div>
                )}
                <div className="self-stretch flex flex-row items-center justify-between">
                  <div className="tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                    JLP Premium/Discount
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <div className="tracking-[-0.03em] text-white leading-[120.41%] inline-block h-[18px] shrink-0">
                      {isNaN(Number(jlpPremium))
                        ? 0
                        : Number(jlpPremium).toFixed(2)}{" "}
                      %
                    </div>
                    {/* <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldwallet2.svg"
                      /> */}
                  </div>
                </div>
                {depositorData &&
                  Number(depositorData?.lastWithdrawRequest.value) > 0 &&
                  selectedStake === "WITHDRAW" && (
                    <div className="self-stretch flex flex-row items-center justify-between">
                      <div className="tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                        Withdrawal available in
                      </div>
                      <div className="flex flex-row items-center justify-start gap-[8px]">
                        <div className="tracking-[-0.03em] text-white leading-[120.41%] inline-block h-[18px] shrink-0">
                          {timeRemaining}
                        </div>
                        {/* <img className="w-4 h-4" alt="" src="/vuesaxboldwallet2.svgasds" /> */}
                      </div>
                    </div>
                  )}
                <>
                  {!publicKey ? (
                    <div className="flex justify-center items-center w-full h-[50px] rounded-lg [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] cursor-pointer font-semibold text-center text-lg text-black transition ease-in-out duration-300">
                      <WalletMultiButtonDynamic
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                        className="mt-0.5 w-[100%]"
                      >
                        CONNECT WALLET
                      </WalletMultiButtonDynamic>
                    </div>
                  ) : (
                    <>
                      {selectedStake === "DEPOSIT" ? (
                        <button
                          className={`button-wrapper ${
                            Number(depositorData?.lastWithdrawRequest.value) > 0
                              ? "cursor-not-allowed opacity-50"
                              : "hover:opacity-70 cursor-pointer"
                          } transition ease-in-out duration-300 self-stretch rounded-lg [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold`}
                          onClick={handleDeposit}
                          disabled={
                            Number(depositorData?.lastWithdrawRequest.value) > 0
                          } // Disable if withdrawing
                        >
                          <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                            {Number(depositorData?.lastWithdrawRequest.value) >
                            0
                              ? "Withdrawal in Progress"
                              : "Deposit"}
                          </div>
                        </button>
                      ) : selectedStake === "WITHDRAW" ? (
                        depositorData &&
                        Number(depositorData?.lastWithdrawRequest.value) > 0 ? (
                          Number(depositorData.lastWithdrawRequest.ts) * 1000 +
                            // Number(depositorData.lastWithdrawRequest.ts)  +

                            24 * 60 * 60 * 1000 >
                          Date.now() ? (
                            <div className="self-stretch rounded-lg bg-bg p-4 flex flex-col items-center justify-center gap-2">
                              <div className="text-lg text-white">
                                You are withdrawing{" "}
                                {(
                                  Number(
                                    depositorData?.lastWithdrawRequest.value
                                  ) / 10e8
                                ).toFixed(2)}{" "}
                                SOL
                              </div>
                              <button
                                className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                                onClick={handleCancelRequest}
                              >
                                <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                  Cancel Request
                                </div>
                              </button>
                            </div>
                          ) : (
                            <div className="self-stretch rounded-lg bg-bg p-4 flex flex-col items-center justify-center gap-2">
                              <div className="text-lg text-white">
                                Claim{" "}
                                {(
                                  Number(
                                    depositorData?.lastWithdrawRequest.value
                                  ) / 10e8
                                ).toFixed(1)}{" "}
                                SOL
                              </div>
                              <button
                                className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-green-500 h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                                onClick={handleClaimWithdrawal}
                              >
                                <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                  Claim Withdrawal
                                </div>
                              </button>
                            </div>
                          )
                        ) : (
                          <button
                            className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                            onClick={handleWithdrawRequest}
                          >
                            <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                              Withdraw
                            </div>
                          </button>
                        )
                      ) : null}
                    </>
                  )}
                </>
              </div>
              <Dropdown></Dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOL;
