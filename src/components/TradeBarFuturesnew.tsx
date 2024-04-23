import { BN } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  PythSolanaReceiver,
  InstructionWithEphemeralSigners,
} from "@pythnetwork/pyth-solana-receiver";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";
import axios from "axios";
import dynamic from "next/dynamic";
import Slider from "rc-slider";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { FaChevronUp } from "react-icons/fa";
import { MdOutlineSettings } from "react-icons/md";
import Modal from "react-modal";
import socketIOClient from "socket.io-client";
import { usePriorityFee } from "../contexts/PriorityFee";
import { useBackupOracle } from "../contexts/BackupOracle";

import { LiquidityPoolAccount } from "../out/accounts/LiquidityPoolAccount";
import { LongShortRatio } from "../out/accounts/LongShortRatio"; // Update with the correct path
import { UserAccount } from "../out/accounts/UserAccount"; // Update with the correct path
import {
  CreateFutContAccounts,
  CreateFutContArgs,
  createFutCont,
} from "../out/instructions/createFutCont";
import {
  CreateLimitOrderAccounts,
  CreateLimitOrderArgs,
  createLimitOrder,
} from "../out/instructions/createLimitOrder";
import {
  InitializeUserAccAccounts,
  InitializeUserAccArgs,
  initializeUserAcc,
} from "../out/instructions/initializeUserAcc"; // Update with the correct path
import { PROGRAM_ID } from "../out/programId";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import { notify } from "../utils/notifications";
import useUserActivity from "../hooks/useUserActivity";

const HOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_HOUSE_WALLET);
const SIGNERWALLET = new PublicKey(process.env.NEXT_PUBLIC_SIGNER_WALLET);
const PDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_PDA_HOUSEWALLET);
const USDCMINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
const ASSOCIATEDTOKENPROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM
);
const TOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM);
const USDCPDAHOUSEWALLET = new PublicKey(
  process.env.NEXT_PUBLIC_USDCPDA_HOUSEWALLET
);
const LONGSHORTACC = new PublicKey(process.env.NEXT_PUBLIC_LONG_SHORT_ACC);
const RATIOACC = new PublicKey(process.env.NEXT_PUBLIC_RATIO_ACC);
const LPACC = new PublicKey(process.env.NEXT_PUBLIC_LP_ACC);

const SOLORACLE = process.env.NEXT_PUBLIC_SOL;
const BTCORACLE = process.env.NEXT_PUBLIC_BTC;
const PYTHORACLE = process.env.NEXT_PUBLIC_PYTH;
const BONKORACLE = process.env.NEXT_PUBLIC_BONK;
const JUPORACLE = process.env.NEXT_PUBLIC_JUP;
const ETHORACLE = process.env.NEXT_PUBLIC_ETH;
const TIAORACLE = process.env.NEXT_PUBLIC_TIA;
const SUIORACLE = process.env.NEXT_PUBLIC_SUI;

const priceIdToSymbolMap = {
  e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43:
    "Crypto.BTC/USD",
  ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d:
    "Crypto.SOL/USD",
  "0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996":
    "Crypto.JUP/USD",
  ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace:
    "Crypto.ETH/USD",
  "09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723":
    "Crypto.TIA/USD",
  "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744":
    "Crypto.SUI/USD",
  "0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff":
    "Crypto.PYTH/USD",
  "72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419":
    "Crypto.BONK/USD",
  // Add more mappings as necessary
};

const PRICE_IDS = [
  "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  "0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996",
  "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723",
  "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
  "0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff",
  "72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
];

interface TradeBarFuturesProps {
  setParentDivHeight: (height: string) => void;
  EMAprice: number;
  totalBetAmount: number;
  usdcTotalBetAmount: number;
  prices: { [key: string]: { price: number; timestamp: string } };
  setPrices: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { price: number; timestamp: string };
    }>
  >;
  setEMAPrice: (EMAprice: number) => void; // assuming it's a function that accepts a number
  openingPrice: number; // Add openingPrice here
  setOpeningPrice: React.Dispatch<React.SetStateAction<number>>;
  selectedCryptos: { [key: string]: boolean };
  selectedCurrency: "SOL" | "USDC";
  setSelectedCurrency: React.Dispatch<React.SetStateAction<"SOL" | "USDC">>;
  setToggleState: React.Dispatch<React.SetStateAction<string>>;
  toggleState: string; // The current state
  setTotalDeposits: (totalDeposits: number) => void; // assuming it's a function that accepts a number
  setUsdcTotalDeposits: (usdcTotalDeposits: number) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  setSymbolSub: React.Dispatch<React.SetStateAction<string>>;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateTransactionWithRetries(
  transaction,
  connection,
  maxRetries = 10,
  delayDuration = 150
) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting simulation ${attempt}/${maxRetries}...`);
      const simulationResult =
        await connection.simulateTransaction(transaction);
      if (simulationResult.value.err) {
        lastError = simulationResult.value.err;
        // Optionally, handle adjustments based on the error here
        if (attempt < maxRetries) {
          await delay(delayDuration);
        }
      } else {
        console.log("Simulation successful");
        return { success: true }; // Simulation succeeded
      }
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`Waiting ${delayDuration}ms before retrying...`);
        await delay(delayDuration);
      }
    }
  }
  return { success: false, error: lastError }; // All attempts failed
}

async function checkLPdata(
  lpAcc: PublicKey,
  connection: Connection
): Promise<{
  IsInitialized: boolean;
  locked: boolean;
  epoch: number;
  totalDeposits: number;
  usdcTotalDeposits: number;
  usdcPnl: number;
  lpFees: number;
  pnl: number;
  cumulativeFeeRate: number;
  cumulativePnlRate: number;
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
      usdcPnl: 0,
      cumulativeFeeRate: 0,
      cumulativePnlRate: 0,
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
    totalDeposits: LpAccount.totalDeposits.toNumber(),
    usdcTotalDeposits: LpAccount.usdcTotalDeposits.toNumber(),
    lpFees: LpAccount.lpFees.toNumber(),
    pnl: LpAccount.pnl.toNumber(),
    usdcPnl: LpAccount.usdcPnl.toNumber(),

    cumulativeFeeRate: LpAccount.cumulativeFeeRate.toNumber(),
    cumulativePnlRate: LpAccount.cumulativePnlRate.toNumber(),
    projectsDepositedSol: LpAccount.projectsDepositedSol.toNumber(),
    projectsDepositedUsdc: LpAccount.projectsDepositedUsdc.toNumber(),
  };
}

async function usdcSplTokenAccountSync(walletAddress) {
  let mintAddress = USDCMINT;

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [walletAddress.toBuffer(), TOKENPROGRAM.toBuffer(), mintAddress.toBuffer()],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function isUserAccountInitialized(
  account: PublicKey,
  connection: Connection
): Promise<{
  isInitialized: boolean;
  usedAffiliate: Uint8Array;
  myAffiliate: Uint8Array;
  rebateTier: number;
}> {
  const accountInfo = await connection.getAccountInfo(account);

  if (!accountInfo) {
    console.error("Account not found or not fetched properly.");
    // You'll need to decide on an appropriate default return here.
    return {
      isInitialized: false,
      usedAffiliate: new Uint8Array(8).fill(0),
      myAffiliate: new Uint8Array(8).fill(0),
      rebateTier: 0,
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
      rebateTier: 0,
    };
  }

  const userrebateTier = userAcc.rebateTier.toNumber();

  return {
    isInitialized: userAcc.isInitialized,
    usedAffiliate: userAcc.usedAffiliate,
    myAffiliate: userAcc.myAffiliate,
    rebateTier: userrebateTier,
  };
}

async function listenLongShortRatioData(
  account: PublicKey,
  connection: Connection,
  onDataReceived: (data: any) => void
): Promise<() => void> {
  const subscriptionId = connection.onAccountChange(
    account,
    async (accountInfo) => {
      try {
        const dataBuffer = Buffer.from(accountInfo.data);
        if (!dataBuffer.slice(0, 8).equals(LongShortRatio.discriminator)) {
          console.log("Account is not a LongShortRatio account.");
          return;
        }

        const longShortRatio = LongShortRatio.decode(dataBuffer);
        onDataReceived(longShortRatio.toJSON());
      } catch (error) {
        console.error("Failed to decode LongShortRatio data:", error);
      }
    }
  );

  // Return a function to allow unsubscribing
  return () => {
    connection.removeAccountChangeListener(subscriptionId);
  };
}

const G_17 = 0.6; // Center for longs
const G_15 = 0.4; // Center for shorts

const MAX_LEVERAGE = 200.0;
const K = 4.3;

function getDynamicLeverage(longShortRatio, priceDirection) {
  if (longShortRatio < 0.0 || longShortRatio > 1.0) {
    throw new Error("Ratio must be between 0 and 1");
  }

  let leverage;
  switch (priceDirection) {
    case 0: // 0 for Increase (long)
      leverage =
        MAX_LEVERAGE * Math.exp(-K * Math.pow(longShortRatio - G_17, 2));
      break;
    case 1: // 1 for Decrease (short)
      leverage =
        MAX_LEVERAGE * Math.exp(-K * Math.pow(G_15 - longShortRatio, 2));
      break;
    default:
      throw new Error("Invalid price direction");
  }

  return Math.round(leverage);
}

const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT1 = "https://hermes.pyth.network";
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;
const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT5;

type SymbolPosition =
  | "btcLong"
  | "btcShort"
  | "solLong"
  | "solShort"
  | "pythLong"
  | "pythShort"
  | "bonkLong"
  | "bonkShort"
  | "jupLong"
  | "jupShort"
  | "ethLong"
  | "ethShort"
  | "tiaLong"
  | "tiaShort"
  | "suiLong"
  | "suiShort"
  | "longCollateral"
  | "shortCollateral";
type TradeBarData = {
  [key in SymbolPosition]: string;
};

const TradeBar: React.FC<
  TradeBarFuturesProps & {
    setParentDivHeight: (height: string) => void;
    data: TradeBarData;
    setData: (data: TradeBarData) => void;
  }
> = ({
  selectedCryptos,
  setParentDivHeight,
  totalBetAmount,
  usdcTotalBetAmount,
  data,
  setData,
  setPrices,
  setEMAPrice,
  prices,
  setOpeningPrice,
  openingPrice,
  setSelectedCurrency,
  selectedCurrency,
  setToggleState,
  toggleState,
  setTotalDeposits,
  setUsdcTotalDeposits,
  setIsActive,
  setSymbolSub,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amountValue, setAmountValue] = useState("");
  const [limitAmount, setLimitAmount] = useState("");

  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const usdcbalance = useUserSOLBalanceStore((s) => s.usdcBalance);

  const { getUserSOLBalance, getUserUSDCBalance } = useUserSOLBalanceStore();
  const wallet = useWallet();

  const [leverage, setLeverage] = useState(50);
  const [showAdditionalDiv, setShowAdditionalDiv] = useState(false);
  const [showAdditionalDiv1, setShowAdditionalDiv1] = useState(false);

  const [ProfitValue, setProfitValue] = useState("");
  const [LossValue, setLossValue] = useState("");
  const [Profit, setProfit] = useState("");
  const [Loss, setLoss] = useState("");
  const [lastInput, setLastInput] = useState(null);
  const [lastInputL, setLastInputL] = useState(null);
  const [liquidationPrice, setliquidationPrice] = useState("- USD");
  const [warning, setWarning] = useState(null);
  const [initialPrice, setInitialPrice] = useState(0);
  const [openPrices, setopenPrices] = useState({});
  const [isInit, setisInit] = useState<{
    isInitialized: boolean;
    usedAffiliate: Uint8Array;
    myAffiliate: Uint8Array;
    rebateTier: number;
  }>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen1, setModalIsOpen1] = useState(false);
  const [modalIsOpen2, setModalIsOpen2] = useState(false);

  const [activeLeverageButton, setActiveLeverageButton] = useState(0);

  const [activeButton, setActiveButton] = useState(3);
  const [slippageTolerance, setSlippageTolerance] = useState(500); // Default to 0.1%
  const [customSlippage, setCustomSlippage] = useState("");

  const { isPriorityFee, setPriorityFee } = usePriorityFee();
  const { isBackupOracle, setBackupOracle } = useBackupOracle();

  const snapPoints = [
    1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  ];
  const snapRange = 0;
  const [maxleverage, setMaxLeverage] = useState(100); // Initially set to 1000
  const [rebateTier, setrebateTier] = useState<number>(null);

  const LOWER_SPREAD_SYMBOLS = ["BTC", "SOL", "ETH"]; // Add more if needed
  const HIGHER_SPREAD_SYMBOLS = ["JUP", "PYTH", "BONK"]; // Add more if needed

  const [availableLiquidity, setAvailableLiquidity] = useState(0);
  const [fee, setFee] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<"MARKET" | "LIMIT">(
    "MARKET"
  );

  const [isTransactionPending, setIsTransactionPending] = useState(false);

  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);

    switch (buttonIndex) {
      case 1:
        setSlippageTolerance(100); // 0.1%
        break;
      case 2:
        setSlippageTolerance(300); // 0.3%
        break;
      case 3:
        setSlippageTolerance(500); // 0.5%
        break;
      default:
      // Handle default case if necessary
    }

    // Clear any custom slippage value
    setCustomSlippage("");
  };

  const handleCustomSlippageChange = (event) => {
    const customValue = event.target.value;

    // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
    const preNumericValue = customValue.replace(/,/g, ".");
    const customValues = preNumericValue.replace(/[^0-9.]/g, "");

    // Count the occurrences of dot (.)
    const dotCount = (customValues.match(/\./g) || []).length;
    let sanitizedValue = customValues;
    // If there is more customValues one dot, keep only the portion before the second dot
    if (dotCount > 1) {
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.indexOf(".") + sanitizedValue.split(".")[1].length + 1
      );
    }

    // Update custom slippage state
    setCustomSlippage(sanitizedValue);

    // Convert to a number for validation
    const customTolerance = Number(sanitizedValue);

    // If the custom value is valid, update the slippage tolerance
    if (!isNaN(customTolerance) && customTolerance > 0) {
      setSlippageTolerance(customTolerance * 1000); // Assuming the input is in percentage
      setActiveButton(4); // Deselect any active button
    }
  };

  const [LPdata, setLPdata] = useState<{
    IsInitialized: boolean;
    locked: boolean;
    epoch: number;
    totalDeposits: number;
    usdcTotalDeposits: number;

    lpFees: number;
    pnl: number;
    usdcPnl: number;

    cumulativeFeeRate: number;
    cumulativePnlRate: number;
    projectsDepositedSol: number;
    projectsDepositedUsdc: number;
  } | null>(null);

  useEffect(() => {
    const fetchLpstatus = async () => {
      const houseHarcodedkey = HOUSEWALLET;
      const signerWalletAccount = SIGNERWALLET;
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
        setTotalDeposits(
          (results.totalDeposits + results.projectsDepositedSol) /
            LAMPORTS_PER_SOL
        );
        setUsdcTotalDeposits(
          (results.usdcTotalDeposits + results.projectsDepositedUsdc) /
            LAMPORTS_PER_SOL
        );
      }
    };

    fetchLpstatus();
  }, [connection]);

  const handleLeverageClick = (buttonIndex: number) => {
    // Determine the max leverage based on the selected symbol
    const symbolMaxLeverage =
      selectedCryptos.PYTH ||
      selectedCryptos.BONK ||
      selectedCryptos.JUP ||
      selectedCryptos.TIA ||
      selectedCryptos.SUI
        ? 50
        : 100;

    if (buttonIndex > symbolMaxLeverage) {
      // Set to a default leverage if clicked value exceeds symbolMaxLeverage
      const defaultLeverage = 50;
      setLeverage(defaultLeverage);
      setActiveLeverageButton(defaultLeverage);
    } else {
      // Set to the clicked value
      setActiveLeverageButton(buttonIndex);
      setLeverage(buttonIndex);
    }
  };

  useEffect(() => {
    // This code runs if maxleverage changes.
    // If the current leverage is greater than the max leverage, adjust it.
    if (leverage > maxleverage) {
      setLeverage(maxleverage);
      setActiveLeverageButton(maxleverage);
    }
  }, [maxleverage, leverage]); // Only re-run the effect if maxleverage changes

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
      setrebateTier(result.rebateTier);
    }
  };
  useEffect(() => {
    fetchcheckuserdata();
  }, [publicKey, connection]);

  const buttonValues = [25, 50, 75, 100]; // Define the button values

  const handleSliderChange = (value) => {
    value = parseInt(value);
    if (value > maxleverage) {
      // Ensure user doesn't exceed the maxleverage
      setLeverage(maxleverage);
      setActiveLeverageButton(0); // Reset active button if leverage exceeds max
      return;
    }

    if (value <= 10) {
      setLeverage(value);
      setActiveLeverageButton(0); // Reset active button for values <= 10
    } else {
      const closestSnap = snapPoints.reduce((a, b) =>
        Math.abs(b - value) < Math.abs(a - value) ? b : a
      );

      if (Math.abs(closestSnap - value) <= snapRange) {
        setLeverage(closestSnap);
        // Set active button if closestSnap is one of the button values
        setActiveLeverageButton(
          buttonValues.includes(closestSnap) ? closestSnap : 0
        );
      } else {
        setLeverage(value);
        // Reset active button if value is not one of the button values
        setActiveLeverageButton(buttonValues.includes(value) ? value : 0);
      }
    }
  };

  useEffect(() => {
    let longShortRatio;
    const THRESHOLD_BET_AMOUNT = 50000000; // Replace with your threshold value

    const computeLongShortRatio = (long, short) => {
      const totalBetAmount = parseInt(long) + parseInt(short);
      return totalBetAmount !== 0 ? parseInt(long) / totalBetAmount : 0.5;
    };

    // Determine which cryptocurrency data to use based on selectedCryptos
    let selectedData = { long: 0, short: 0 };
    if (selectedCryptos.SOL) {
      selectedData = {
        long: parseInt(data.solLong),
        short: parseInt(data.solShort),
      };
    } else if (selectedCryptos.BTC) {
      selectedData = {
        long: parseInt(data.btcLong),
        short: parseInt(data.btcShort),
      };
    } else if (selectedCryptos.PYTH) {
      selectedData = {
        long: parseInt(data.pythLong),
        short: parseInt(data.pythShort),
      };
    } else if (selectedCryptos.BONK) {
      selectedData = {
        long: parseInt(data.bonkLong),
        short: parseInt(data.bonkShort),
      };
    } else if (selectedCryptos.ETH) {
      selectedData = {
        long: parseInt(data.ethLong),
        short: parseInt(data.ethShort),
      };
    } else if (selectedCryptos.TIA) {
      selectedData = {
        long: parseInt(data.tiaLong),
        short: parseInt(data.tiaShort),
      };
    } else if (selectedCryptos.SUI) {
      selectedData = {
        long: parseInt(data.suiLong),
        short: parseInt(data.suiShort),
      };
    } else if (selectedCryptos.JUP) {
      selectedData = {
        long: parseInt(data.jupLong),
        short: parseInt(data.jupShort),
      };
    }

    // Add more conditions if you have more cryptocurrencies

    // Compute longShortRatio and totalBetAmount for the selected cryptocurrency
    longShortRatio = computeLongShortRatio(
      selectedData.long,
      selectedData.short
    );
    const totalBetAmount = selectedData.long + selectedData.short;

    const priceDirection =
      toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
    if (priceDirection === -1) {
      throw new Error("Invalid toggle state");
    }

    // Adjust longShortRatio based on the conditions in your Rust logic
    if (totalBetAmount < THRESHOLD_BET_AMOUNT) {
      longShortRatio = priceDirection === 0 ? 0.6 : 0.4;
    } else if (priceDirection === 0 && longShortRatio < 0.6) {
      longShortRatio = 0.6;
    } else if (priceDirection === 1 && longShortRatio > 0.4) {
      longShortRatio = 0.4;
    }

    const newMaxLeverage = getDynamicLeverage(longShortRatio, priceDirection);
    setMaxLeverage(newMaxLeverage);

    const defaultLeverage =
      selectedCryptos.PYTH ||
      selectedCryptos.BONK ||
      selectedCryptos.JUP ||
      selectedCryptos.TIA ||
      selectedCryptos.SUI
        ? 50
        : 100;

    if (leverage > newMaxLeverage && newMaxLeverage > defaultLeverage) {
      setLeverage(50);
      setActiveLeverageButton(50);
    } else if (leverage > newMaxLeverage && newMaxLeverage < defaultLeverage) {
      const newlvg = newMaxLeverage;
      setMaxLeverage(newlvg);
      setLeverage(newlvg);
      setActiveLeverageButton(0);
    }

    if (
      selectedCryptos.PYTH ||
      selectedCryptos.BONK ||
      selectedCryptos.JUP ||
      selectedCryptos.TIA ||
      selectedCryptos.SUI
    ) {
      setMaxLeverage(defaultLeverage);
    }
  }, [data, toggleState, leverage, selectedCryptos]);

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
      getUserUSDCBalance(publicKey, connection);
    }
  }, [publicKey, connection]); //selected currency

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountToWatch = LONGSHORTACC;
        const initialAccountInfo =
          await connection.getAccountInfo(accountToWatch);

        if (initialAccountInfo) {
          const initialDataBuffer = Buffer.from(initialAccountInfo.data);
          if (
            initialDataBuffer.slice(0, 8).equals(LongShortRatio.discriminator)
          ) {
            const initialLongShortRatio =
              LongShortRatio.decode(initialDataBuffer);
            setData(initialLongShortRatio.toJSON()); // Directly set the data here
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
        // Here you can execute your notification logic, e.g., show a toast, alert, etc.
        // Notify('Failed to fetch account info.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const accountToWatch = LONGSHORTACC;
    let unsubscribe;

    const fetchData = async () => {
      try {
        await listenLongShortRatioData(
          accountToWatch,
          connection,
          onDataReceived
        ).then((fn) => {
          unsubscribe = fn;
        });
      } catch (error) {
        console.error("An error occurred:", error);
        // Again, place your notification logic here.
        // Notify('Failed to subscribe to account data.');
      }
    };

    fetchData();

    function onDataReceived(newData) {
      setData(newData);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [connection]);

  useEffect(() => {
    const connection = new PriceServiceConnection(ENDPOINT1, {
      priceFeedRequestConfig: { binary: true },
    });

    // Function to handle incoming price updates
    const handlePriceUpdate = (priceFeed) => {
      const priceData = priceFeed.getPriceNoOlderThan(8);
      const symbol = priceIdToSymbolMap[priceFeed.id]; // Make sure this map is defined somewhere in your code

      if (symbol) {
        const updatedPrices = {
          ...prices,
          [symbol]: {
            price: parseFloat(priceData?.price),
            timestamp: priceData?.publishTime.toString(),
          },
        };
        setPrices((currentPrices) => ({
          ...currentPrices,
          [symbol]: {
            price: parseFloat(priceData?.price),
            timestamp: priceData?.publishTime.toString(),
          },
        }));
      } else {
        console.error(`Symbol not found for priceFeed ID: ${priceFeed.id}`);
      }
    };

    // Subscribe to price updates
    connection.subscribePriceFeedUpdates(PRICE_IDS, handlePriceUpdate);
    return () => {
      // Close the WebSocket connection when the component unmounts
      connection.closeWebSocket();
    };
  }, []);

  useEffect(() => {
    const selectedCryptosSafe = selectedCryptos || {};

    const selectedCrypto = Object.keys(selectedCryptosSafe).find(
      (key) => selectedCryptosSafe[key]
    );
    // Define a mapping of crypto symbols to decimal places
    const decimalPlacesMapping = {
      BTC: 1, // Example: Bitcoin to 2 decimal places
      SOL: 3,
      PYTH: 4,
      BONK: 8,
      ETH: 1,
      SUI: 4,
      TIA: 3,
      JUP: 4,
      // Add more mappings as needed
    };
    // Get the number of decimal places for the selected crypto, defaulting to a standard value if not found
    const decimalPlaces =
      decimalPlacesMapping[selectedCrypto?.toUpperCase()] || 2;

    const newInitialPrice =
      prices?.[`Crypto.${selectedCrypto?.toUpperCase()}/USD`]?.price /
        100000000 || 0;
    setInitialPrice(parseFloat(newInitialPrice.toFixed(decimalPlaces)));
  }, [selectedCryptos, prices]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT2);

    socket.on("openingprice", (openingPrices) => {
      const openingPricess = { ...openPrices };
      openingPrices.forEach((openingPrices) => {
        openingPricess[openingPrices.symbol] = openingPrices.price;
      });

      setopenPrices(openingPricess);
    });

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const selectedCrypto = Object.keys(selectedCryptos).find(
      (key) => selectedCryptos[key]
    );

    // Get the price for the selected cryptocurrency
    const openingPrice =
      openPrices?.[`Crypto.${selectedCrypto}/USD`] / 100000000;

    setOpeningPrice(openingPrice);
  }, [selectedCryptos, openPrices]);

  const setToggleChangeLong = () => {
    setToggleState("LONG");
  };

  const setToggleChangeShort = () => {
    setToggleState("SHORT");
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

    // Set the sanitized value as the amount value
    setAmountValue(sanitizedValue);
  };

  const handleInputLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setLimitAmount(sanitizedValue);
  };

  const handleInputChangeProfit = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Set the sanitized value as the ProfitValue
    setProfitValue(sanitizedValue);
    setLastInput("ProfitValue");
  };

  const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setProfit(sanitizedValue);
    setLastInput("Profit");
  };

  useEffect(() => {
    if (lastInput === "ProfitValue") {
      const price =
        selectedOrder === "LIMIT" ? parseFloat(limitAmount) : initialPrice;
      let profit;
      if (toggleState === "LONG") {
        profit = (
          ((parseFloat(ProfitValue) - price) / price) *
          leverage *
          parseFloat(amountValue)
        ).toFixed(2);
      } else {
        profit = (
          (-(parseFloat(ProfitValue) - price) / price) *
          leverage *
          parseFloat(amountValue)
        ).toFixed(2);
      }
      profit = isNaN(profit) ? "" : profit;
      setProfit(profit);
    }
  }, [
    ProfitValue,
    initialPrice,
    leverage,
    amountValue,
    toggleState,
    selectedOrder,
    limitAmount,
  ]);

  useEffect(() => {
    if (lastInput === "Profit") {
      let profitValue;
      if (toggleState === "LONG") {
        profitValue = (
          initialPrice *
          (1 + parseFloat(Profit) / (leverage * parseFloat(amountValue)))
        ).toFixed(3);
      } else {
        profitValue = (
          initialPrice *
          (1 - parseFloat(Profit) / (leverage * parseFloat(amountValue)))
        ).toFixed(3);
      }
      profitValue = isNaN(profitValue) ? "" : profitValue;
      setProfitValue(profitValue);
    }
  }, [Profit, initialPrice, leverage, amountValue, toggleState]);

  const handleInputChangeLoss = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setLossValue(sanitizedValue);
    setLastInputL("LossValue");
  };

  const handleLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Add minus sign ("-") in front of the numbers to make it negative
    if (
      sanitizedValue !== "" &&
      sanitizedValue !== "0" &&
      sanitizedValue !== "0."
    ) {
      sanitizedValue = "-" + sanitizedValue;
    }

    setLoss(sanitizedValue);
    setLastInputL("Loss");
  };

  useEffect(() => {
    if (lastInputL === "LossValue") {
      const price =
        selectedOrder === "LIMIT" ? parseFloat(limitAmount) : initialPrice;
      let loss;
      if (toggleState === "LONG") {
        loss = (
          ((parseFloat(LossValue) - price) / price) *
          leverage *
          parseFloat(amountValue)
        ).toFixed(2);
      } else {
        loss = (
          (-(parseFloat(LossValue) - price) / price) *
          leverage *
          parseFloat(amountValue)
        ).toFixed(2);
      }

      // Check and adjust if loss exceeds amountValue or is positive
      loss = Math.min(
        Math.max(parseFloat(loss), -parseFloat(amountValue)),
        0
      ).toFixed(2);

      loss = isNaN(loss) ? "" : loss;
      setLoss(loss);
    }
  }, [
    LossValue,
    initialPrice,
    leverage,
    amountValue,
    toggleState,
    selectedOrder,
    limitAmount,
  ]);

  useEffect(() => {
    if (lastInputL === "Loss") {
      let lossValue;
      if (toggleState === "LONG") {
        lossValue = (
          initialPrice *
          (1 + parseFloat(Loss) / (leverage * parseFloat(amountValue)))
        ).toFixed(3);
      } else {
        lossValue = (
          initialPrice *
          (1 - parseFloat(Loss) / (leverage * parseFloat(amountValue)))
        ).toFixed(3);
      }

      if (toggleState === "LONG") {
        // Check for LONG
        if (parseFloat(lossValue) < Number(liquidationPrice)) {
          lossValue = Number(liquidationPrice).toFixed(3);
        }
      } else {
        if (parseFloat(lossValue) > Number(liquidationPrice)) {
          lossValue = Number(liquidationPrice).toFixed(3);
        }
      }

      lossValue = isNaN(lossValue) ? "" : lossValue;
      setLossValue(lossValue);
    }
  }, [
    Loss,
    initialPrice,
    leverage,
    amountValue,
    toggleState,
    liquidationPrice,
  ]);

  useEffect(() => {
    const getDisplayedPrice = () => {
      const selectedCrypto = Object.keys(selectedCryptos).find(
        (key) => selectedCryptos[key]
      );

      const priceKey = `Crypto.${selectedCrypto?.toUpperCase()}/USD`;
      const price = prices[priceKey];

      const decimalPlacesMapping = {
        BTC: 1, // Example: Bitcoin to 2 decimal places
        SOL: 3,
        PYTH: 4,
        BONK: 8,
        ETH: 1,
        SUI: 4,
        TIA: 3,
        JUP: 4,

        // Add more mappings as needed
      };

      const finalSpreadRatio = spreadPercentage(selectedCrypto) / 100;

      const decimalPlaces =
        decimalPlacesMapping[selectedCrypto?.toUpperCase()] || 2;

      if (price && !isNaN(price.price)) {
        const priceInUsd = price.price / 100000000;
        const priceDisplay =
          toggleState === "LONG"
            ? priceInUsd * (1 + finalSpreadRatio) -
              (priceInUsd * (1 + finalSpreadRatio)) / leverage +
              (priceInUsd *
                (1 + finalSpreadRatio) *
                (13 + finalSpreadRatio * 100)) /
                10000
            : priceInUsd * (1 - finalSpreadRatio) +
              (priceInUsd * (1 - finalSpreadRatio)) / leverage -
              (priceInUsd *
                (1 - finalSpreadRatio) *
                (13 + finalSpreadRatio * 100)) /
                10000;

        const liquidationPrice = priceDisplay.toFixed(decimalPlaces);

        return `${liquidationPrice}`;
      } else {
        return "0";
      }
    };

    setliquidationPrice(getDisplayedPrice());
  }, [selectedCryptos, prices, leverage, toggleState]);

  useEffect(() => {
    // Check if currentItem exists
    const price =
      selectedOrder === "LIMIT" ? parseFloat(limitAmount) : initialPrice;
    const val = parseFloat(ProfitValue);
    const priceDirection =
      toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
    if (priceDirection === -1) {
      throw new Error("Invalid toggle state");
    }
    // Warning handler
    if (priceDirection === 0 && Number(val) <= price) {
      setWarning(
        `Take profit price should be higher than the ${selectedOrder === "MARKET" ? "current" : "limit"} price.`
      );
    } else if (priceDirection === 1 && Number(val) >= price) {
      setWarning(
        `Take profit should be lower than the ${selectedOrder === "MARKET" ? "current" : "limit"} price.`
      );
    } else {
      setWarning(null);
    }
  }, [
    ProfitValue,
    liquidationPrice,
    toggleState,
    initialPrice,
    selectedOrder,
    limitAmount,
  ]);

  useEffect(() => {
    // Warning handler
    const val = parseFloat(LossValue);
    const price =
      selectedOrder === "LIMIT" ? parseFloat(limitAmount) : initialPrice;

    const priceDirection =
      toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
    if (priceDirection === -1) {
      throw new Error("Invalid toggle state");
    }

    if (priceDirection === 0) {
      if (Number(val) >= price) {
        setWarning(
          `Stop Loss Price should be lower than the ${selectedOrder === "MARKET" ? "current" : "limit"} price.`
        );
      } else if (Number(val) < Number(liquidationPrice)) {
        setWarning(
          "Stop Loss Price should be higher than the liquidation price."
        );
      } else {
        setWarning(null);
      }
    } else if (priceDirection === 1) {
      if (Number(val) <= price) {
        setWarning(
          `Stop Loss Price should be higher than the ${selectedOrder === "MARKET" ? "current" : "limit"} price.`
        );
      } else if (Number(val) > Number(liquidationPrice)) {
        setWarning(
          "Stop Loss Price should be lower than the liquidation price."
        );
      } else {
        setWarning(null);
      }
    } else {
      setWarning(null);
    }
  }, [
    LossValue,
    initialPrice,
    liquidationPrice,
    toggleState,
    selectedOrder,
    limitAmount,
  ]);

  const toggleAdditionalDiv = () => {
    setShowAdditionalDiv(!showAdditionalDiv);
  };

  const toggleAdditionalDiv1 = () => {
    setShowAdditionalDiv1(!showAdditionalDiv1);
  };

  const toggleModal = () => {
    setModalIsOpen1(!modalIsOpen1);
  };

  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleModal2 = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom, // Position modal below the button
        left: rect.left, // Align modal with the left edge of the button
      });
    }
    setModalIsOpen2(!modalIsOpen2);
  };

  const getPriorityFeeEstimate = async () => {
    try {
      const rpcUrl = ENDPOINT5;

      const requestData = {
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            accountKeys: ["72GXz5HcGmnuU1M87MGRkb3cJZVTxatCjL56y1gdPRob"],
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

      return (responseData.result.priorityFeeLevels.veryHigh + 300).toFixed(0);
    } catch (error) {
      console.error("Error fetching priority fee estimate:", error);
    }
  };

  const handleToggle = () => {
    // Update the isPriorityFee state when the toggle button is clicked
    setPriorityFee(!isPriorityFee);
  };

  const handleToggleOracle = () => {
    // Update the isPriorityFee state when the toggle button is clicked
    setBackupOracle(!isBackupOracle);
  };

  const FutOrder = useCallback(async () => {
    const countmaxBet =
      selectedCurrency === "USDC"
        ? ((((LPdata?.usdcTotalDeposits +
            LPdata?.usdcPnl +
            LPdata?.projectsDepositedUsdc) /
            200) *
            3) /
            5 /
            LAMPORTS_PER_SOL) *
          1000
        : (((LPdata?.totalDeposits +
            LPdata?.pnl +
            LPdata?.projectsDepositedSol) /
            200) *
            3) /
          5 /
          LAMPORTS_PER_SOL; // 0,3% maximálni pozice

    const maxBet = Math.min(100000, countmaxBet);
    const realbalance = selectedCurrency === "USDC" ? usdcbalance : balance; // 0,3% maximálni pozice
    const token = selectedCurrency === "USDC" ? "$" : "◎"; // 0,3% maximálni pozice
    const currentTotalBetAmount =
      selectedCurrency === "USDC" ? usdcTotalBetAmount * 1000 : totalBetAmount;

    if (warning) {
      console.error("Cannot open position due to warning:", warning);
      // Optionally, show a warning notification
      notify({
        type: "info",
        message: `Position Reverted`,
        description: warning,
      });
      return; // Exit function early
    }

    if (parseFloat(amountValue) > maxBet) {
      notify({
        type: "error",
        message: `Position Reverted`,
        description: `Maximum Collateral is ${maxBet.toFixed(2)} ${token}`,
      });
      return;
    }

    if (
      currentTotalBetAmount + parseFloat(amountValue) * LAMPORTS_PER_SOL >
      2 * maxBet * LAMPORTS_PER_SOL
    ) {
      notify({
        type: "error",
        message: `Position Reverted`,
        description: `Collateral limit per user is ${(2 * maxBet).toFixed(2)}`,
      });
      return;
    }

    const cryptoSettings = {
      SOL: {
        symbolCode: 0,
        oracleAddy: SOLORACLE,
      },
      BTC: {
        symbolCode: 1,
        oracleAddy: BTCORACLE,
      },
      PYTH: {
        symbolCode: 2,
        oracleAddy: PYTHORACLE,
      },
      BONK: {
        symbolCode: 3,
        oracleAddy: BONKORACLE,
      },
      JUP: {
        symbolCode: 4,
        oracleAddy: JUPORACLE,
      },
      ETH: {
        symbolCode: 5,
        oracleAddy: ETHORACLE,
      },
      TIA: {
        symbolCode: 6,
        oracleAddy: TIAORACLE,
      },
      SUI: {
        symbolCode: 7,
        oracleAddy: SUIORACLE,
      },
      // Add more cryptocurrencies here in the same pattern
    };

    let symbolCode;
    let oracleAddy;
    const selectedCrypto = Object.keys(selectedCryptos).find(
      (key) => selectedCryptos[key]
    );

    if (selectedCrypto && cryptoSettings[selectedCrypto]) {
      symbolCode = cryptoSettings[selectedCrypto].symbolCode;
      oracleAddy = cryptoSettings[selectedCrypto].oracleAddy;
    } else {
      throw new Error("Invalid or unsupported symbol");
    }

    if (!publicKey) {
      notify({
        type: "info",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    if (!amountValue || parseFloat(amountValue) === 0) {
      notify({
        type: "info",
        message: "Amount feels empty",
        description: "Fill the Trade Amount",
      });
      return;
    }

    if (parseFloat(amountValue) > realbalance) {
      notify({
        type: "info",
        message: "Insufficient balance",
        description: "Trade Amount is greater than the available balance",
      });
      return;
    }

    if ((parseFloat(amountValue) - fee) * leverage > availableLiquidity) {
      notify({
        type: "error",
        message: "Insufficient balance",
        description: "Not enough available liquidity in the Vault",
      });
      return;
    }

    const minAmount = selectedCurrency === "SOL" ? 0.05 : 5;

    if (
      parseFloat(amountValue) > maxBet ||
      parseFloat(amountValue) < minAmount
    ) {
      notify({
        type: "info",
        message: "Invalid trade amount",
        description: `Trade Amount should be between ${minAmount.toFixed(2)}${token} and ${maxBet.toFixed(2)}${token}`,
      });
      return;
    }

    let signature: TransactionSignature = "";
    try {
      // Get the current time and add 1 to the time number
      const now = Date.now();
      const timeNumber = (Math.floor(now / 1000) % 1000000) + 1;

      const betAmount =
        selectedCurrency === "USDC"
          ? (parseFloat(amountValue) * LAMPORTS_PER_SOL) / 1000
          : parseFloat(amountValue) * LAMPORTS_PER_SOL;

      const stopLoss = isNaN(parseFloat(LossValue))
        ? 0
        : parseFloat(LossValue) * 100000000;
      const takeProfit = isNaN(parseFloat(ProfitValue))
        ? 0
        : parseFloat(ProfitValue) * 100000000;

      const priceDirection =
        toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
      if (priceDirection === -1) {
        throw new Error("Invalid toggle state");
      }

      const seeds = [
        Buffer.from(publicKey.toBytes()),
        new BN(timeNumber).toArray("le", 8),
      ];

      const [pda] = await PublicKey.findProgramAddress(seeds, PROGRAM_ID);

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

      const usdc = selectedCurrency === "USDC" ? 1 : 0;
      const backOracle = isBackupOracle === true ? 0 : 1;

      if (!isInit.isInitialized) {
        try {
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
          setModalIsOpen(false);
          notify({
            type: "success",
            message: `Trading account created`,
          });
        } catch (error) {
          notify({
            type: "error",
            message: `Creation Failed`,
            description: error?.message,
          });
        }
      } else {
        const args: CreateLimitOrderArgs = {
          number: new BN(timeNumber),
          betAmount: new BN(betAmount),
          leverage: new BN(leverage),
          priceDirection: priceDirection,
          symbol: symbolCode,
          slPrice: new BN(stopLoss),
          tpPrice: new BN(takeProfit),
          initialPrice: new BN(parseFloat(limitAmount) * 100000000),
          backOracle: backOracle,
          usdc: usdc,
        };
        console.log(
          "Creating Order",
          "Est. Initial Price",
          initialPrice,
          "Collateral",
          betAmount / LAMPORTS_PER_SOL,
          "Leverage",
          leverage,
          "Direction",
          priceDirection,
          "Symbol",
          symbolCode,
          "SL",
          stopLoss / 100000000,
          "TP",
          takeProfit / 100000000
        );

        const seedsRatio = [Buffer.from(HOUSEWALLET.toBytes())];

        const accounts: CreateLimitOrderAccounts = {
          futCont: pda,
          playerAcc: publicKey,
          userAcc: userAcc,
          ratioAcc: RATIOACC,
          houseAcc: HOUSEWALLET,
          lpAcc: LPACC,
          signerServer: SIGNERWALLET,
          oracleAccount: new PublicKey(oracleAddy),
          pdaHouseAcc: PDAHOUSEWALLET,
          systemProgram: SystemProgram.programId,
          usdcMint: USDCMINT,
          usdcPlayerAcc: usdcAcc,
          usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
          tokenProgram: TOKENPROGRAM,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
        };

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

        const transaction = new Transaction()
          .add(createLimitOrder(args, accounts))
          .add(PRIORITY_FEE_IX);

        signature = await sendTransaction(transaction, connection);
        notify({
          type: "info",
          message: `Creating Order`,
          txid: signature,
        });
        // Wait for transaction confirmation before showing the 'success' notification
        await connection.confirmTransaction(signature, "confirmed");
        notify({
          type: "success",
          message: `Limit Order Created`,
          txid: signature,
        });
      }
    } catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({
        type: "error",
        message: `Position Reverted`,
        description: error?.message,
        txid: signature,
      });
      return;
    }
  }, [
    isBackupOracle,
    fee,
    isPriorityFee,
    LPdata,
    selectedCryptos,
    slippageTolerance,
    isInit,
    initialPrice,
    balance,
    warning,
    totalBetAmount,
    usdcTotalBetAmount,
    publicKey,
    notify,
    connection,
    sendTransaction,
    ProfitValue,
    LossValue,
    leverage,
    amountValue,
    toggleState,
    availableLiquidity,
    selectedCurrency,
    limitAmount,
  ]);

  const onClick = useCallback(async () => {
    const countmaxBet =
      selectedCurrency === "USDC"
        ? ((((LPdata?.usdcTotalDeposits +
            LPdata?.usdcPnl +
            LPdata?.projectsDepositedUsdc) /
            200) *
            3) /
            5 /
            LAMPORTS_PER_SOL) *
          1000
        : (((LPdata?.totalDeposits +
            LPdata?.pnl +
            LPdata?.projectsDepositedSol) /
            200) *
            3) /
          5 /
          LAMPORTS_PER_SOL; // 0,3% maximálni pozice

    const maxBet = Math.min(100000, countmaxBet);
    const realbalance = selectedCurrency === "USDC" ? usdcbalance : balance; // 0,3% maximálni pozice
    const token = selectedCurrency === "USDC" ? "$" : "◎"; // 0,3% maximálni pozice
    const currentTotalBetAmount =
      selectedCurrency === "USDC" ? usdcTotalBetAmount * 1000 : totalBetAmount;

    if (warning) {
      console.error("Cannot open position due to warning:", warning);
      // Optionally, show a warning notification
      notify({
        type: "info",
        message: `Position Reverted`,
        description: warning,
      });
      return; // Exit function early
    }

    if (parseFloat(amountValue) > maxBet) {
      notify({
        type: "error",
        message: `Position Reverted`,
        description: `Maximum Collateral is ${maxBet.toFixed(2)} ${token}`,
      });
      return;
    }

    if (
      currentTotalBetAmount + parseFloat(amountValue) * LAMPORTS_PER_SOL >
      2 * maxBet * LAMPORTS_PER_SOL
    ) {
      notify({
        type: "error",
        message: `Position Reverted`,
        description: `Collateral limit per user is ${(2 * maxBet).toFixed(2)}`,
      });
      return;
    }

    const cryptoSettings = {
      SOL: {
        symbolCode: 0,
        oracleAddy: SOLORACLE,
      },
      BTC: {
        symbolCode: 1,
        oracleAddy: BTCORACLE,
      },
      PYTH: {
        symbolCode: 2,
        oracleAddy: PYTHORACLE,
      },
      BONK: {
        symbolCode: 3,
        oracleAddy: BONKORACLE,
      },
      JUP: {
        symbolCode: 4,
        oracleAddy: JUPORACLE,
      },
      ETH: {
        symbolCode: 5,
        oracleAddy: ETHORACLE,
      },
      TIA: {
        symbolCode: 6,
        oracleAddy: TIAORACLE,
      },
      SUI: {
        symbolCode: 7,
        oracleAddy: SUIORACLE,
      },
      // Add more cryptocurrencies here in the same pattern
    };

    let symbolCode;
    let oracleAddy;
    const selectedCrypto = Object.keys(selectedCryptos).find(
      (key) => selectedCryptos[key]
    );

    if (selectedCrypto && cryptoSettings[selectedCrypto]) {
      symbolCode = cryptoSettings[selectedCrypto].symbolCode;
      oracleAddy = cryptoSettings[selectedCrypto].oracleAddy;
    } else {
      throw new Error("Invalid or unsupported symbol");
    }

    if (!publicKey) {
      notify({
        type: "info",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    if (!amountValue || parseFloat(amountValue) === 0) {
      notify({
        type: "info",
        message: "Amount feels empty",
        description: "Fill the Trade Amount",
      });
      return;
    }

    if (parseFloat(amountValue) > realbalance) {
      notify({
        type: "info",
        message: "Insufficient balance",
        description: "Trade Amount is greater than the available balance",
      });
      return;
    }

    if ((parseFloat(amountValue) - fee) * leverage > availableLiquidity) {
      notify({
        type: "error",
        message: "Insufficient balance",
        description: "Not enough available liquidity in the Vault",
      });
      return;
    }

    const minAmount = selectedCurrency === "SOL" ? 0.05 : 5;

    if (
      parseFloat(amountValue) > maxBet ||
      parseFloat(amountValue) < minAmount
    ) {
      notify({
        type: "info",
        message: "Invalid trade amount",
        description: `Trade Amount should be between ${minAmount.toFixed(2)} and ${maxBet.toFixed(2)}`,
      });
      return;
    }

    let signature: TransactionSignature = "";
    try {
      // Get the current time and add 1 to the time number
      const now = Date.now();
      const timeNumber = (Math.floor(now / 1000) % 1000000) + 1;

      const betAmount =
        selectedCurrency === "USDC"
          ? (parseFloat(amountValue) * LAMPORTS_PER_SOL) / 1000
          : parseFloat(amountValue) * LAMPORTS_PER_SOL;

      const stopLoss = isNaN(parseFloat(LossValue))
        ? 0
        : parseFloat(LossValue) * 100000000;
      const takeProfit = isNaN(parseFloat(ProfitValue))
        ? 0
        : parseFloat(ProfitValue) * 100000000;

      const priceDirection =
        toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
      if (priceDirection === -1) {
        throw new Error("Invalid toggle state");
      }

      const seeds = [
        Buffer.from(publicKey.toBytes()),
        new BN(timeNumber).toArray("le", 8),
      ];

      const [pda] = await PublicKey.findProgramAddress(seeds, PROGRAM_ID);

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

      const usdc = selectedCurrency === "USDC" ? 1 : 0;
      const backOracle = isBackupOracle === true ? 0 : 1;

      if (!isInit.isInitialized) {
        try {
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
          setModalIsOpen(false);
          notify({
            type: "success",
            message: `Trading account created`,
          });
        } catch (error) {
          notify({
            type: "error",
            message: `Creation Failed`,
            description: error?.message,
          });
        }
      } else {
        setIsTransactionPending(true);
        const args: CreateFutContArgs = {
          number: new BN(timeNumber),
          affiliateCode: Array.from(isInit.usedAffiliate),
          betAmount: new BN(betAmount),
          leverage: new BN(leverage),
          priceDirection: priceDirection,
          symbol: symbolCode,
          slPrice: new BN(stopLoss),
          tpPrice: new BN(takeProfit),
          slippagePrice: new BN(initialPrice * 100000000),
          slippage: new BN(slippageTolerance),
          backOracle: backOracle,
          usdc: usdc,
        };
        console.log(
          "Opening Futures Position",
          "Est. Initial Price",
          initialPrice,
          "Collateral",
          betAmount / LAMPORTS_PER_SOL,
          "Leverage",
          leverage,
          "Direction",
          priceDirection,
          "Symbol",
          symbolCode,
          "SL",
          stopLoss / 100000000,
          "TP",
          takeProfit / 100000000
        );

        const accounts: CreateFutContAccounts = {
          futCont: pda,
          playerAcc: publicKey,
          userAcc: userAcc,
          ratioAcc: RATIOACC,
          houseAcc: HOUSEWALLET,
          oracleAccount: new PublicKey(oracleAddy),
          solOracleAccount: new PublicKey(
            "3fpFnRbRX5r6vQKGbmKGqEiC6u7BK8o2FMJcziy2MqBW"
          ),
          pdaHouseAcc: PDAHOUSEWALLET,
          affilAcc: AffilAcc,
          lpAcc: LPACC,
          signerWalletAccount: SIGNERWALLET,
          systemProgram: SystemProgram.programId,
          usdcMint: USDCMINT,
          usdcPlayerAcc: usdcAcc,
          usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
          tokenProgram: TOKENPROGRAM,
          associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
        };

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

        const feePayer = publicKey;

        // Prepare the transaction with futures contract creation and priority fee
        const transaction = new Transaction({
          feePayer: feePayer, // Explicitly setting the fee payer
        })
          .add(createFutCont(args, accounts))
          .add(PRIORITY_FEE_IX);

        await simulateTransactionWithRetries(transaction, connection);

        signature = await sendTransaction(transaction, connection);
        notify({
          type: "info",
          message: `Opening Position`,
          txid: signature,
        });
        // Wait for transaction confirmation before showing the 'success' notification
        await connection.confirmTransaction(signature, "confirmed");
        setIsTransactionPending(false);
      }
    } catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({
        type: "error",
        message: `Position Reverted`,
        description: error?.message,
        txid: signature,
      });
      setIsTransactionPending(false);
      return;
    }
  }, [
    fee,
    isPriorityFee,
    LPdata,
    selectedCryptos,
    slippageTolerance,
    isInit,
    initialPrice,
    balance,
    warning,
    totalBetAmount,
    publicKey,
    notify,
    connection,
    sendTransaction,
    ProfitValue,
    LossValue,
    leverage,
    amountValue,
    toggleState,
    availableLiquidity,
    selectedCurrency,
    isBackupOracle,
  ]);

  const onClick1 = useCallback(async () => {
    const seedsUser = [Buffer.from(publicKey.toBytes())];
    const usdcAcc = await usdcSplTokenAccountSync(publicKey);
    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);
    try {
      const seedsAffil = [isInit.usedAffiliate];

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
        usedAffiliate: Array.from(isInit.usedAffiliate),
      };

      // Create a new transaction to initialize the user account and send it
      const initTransaction = new Transaction().add(
        initializeUserAcc(args, accounts)
      );

      const initSignature = await sendTransaction(initTransaction, connection);

      // Wait for transaction confirmation
      notify({ type: "info", message: `Creating Trading Account` });
      await connection.confirmTransaction(initSignature, "confirmed");
      fetchcheckuserdata();
      setModalIsOpen(false);
      notify({
        type: "success",
        message: `Trading account created`,
      });
    } catch (error) {
      notify({
        type: "error",
        message: `Creation failed`,
        description: error?.message,
      });
    }
  }, [isInit, publicKey]);

  const handleInputFocus: React.FocusEventHandler<HTMLInputElement> = (
    event
  ) => {
    // Disables zooming
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      );
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%"; // Add this line
  };

  const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = (
    event
  ) => {
    // Enables zooming again
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute("content", "width=device-width, initial-scale=1.0");
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = ""; // Add this line
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  };

  const [userClosedModal, setUserClosedModal] = useState(false);

  useEffect(() => {
    if (publicKey && isInit && !isInit?.isInitialized && !userClosedModal) {
      setModalIsOpen(true);
    }
  }, [publicKey, isInit, userClosedModal]);

  const closeModalHandler = () => {
    setModalIsOpen(false);
    setUserClosedModal(true);
  };

  const closeModalHandler1 = () => {
    setModalIsOpen1(false);
  };

  const getMaxLeverage = (selectedCryptos) => {
    // Check if either PYTH or BONK is selected
    if (
      selectedCryptos.PYTH ||
      selectedCryptos.BONK ||
      selectedCryptos.JUP ||
      selectedCryptos.TIA ||
      selectedCryptos.SUI
    ) {
      return 50;
    }
    // Default max leverage for other cases
    return 100;
  };

  const calculateFee = (amount, lev, rebate, init) => {
    const baseFee = parseFloat(amount) * 0.0008 * lev;
    const hasAffiliate = init?.usedAffiliate.some((value) => value !== 0);
    const feeReduction = hasAffiliate ? baseFee * 0.05 : 0;
    const rebateAmount = (baseFee * rebate) / 100;

    const finalFee = baseFee - feeReduction - rebateAmount;
    return isNaN(finalFee) ? 0 : parseFloat(finalFee.toFixed(3)); // Check for NaN and return as a number
  };

  const [spreadPrice, setSpreadPrice] = useState(0);

  const spreadPercentage = (symbol) => {
    const upperSymbol = symbol?.toUpperCase();
    if (LOWER_SPREAD_SYMBOLS.includes(upperSymbol)) {
      return 0.02; // Spread for lower spread symbols
    } else if (HIGHER_SPREAD_SYMBOLS.includes(upperSymbol)) {
      return 0.08; // Spread for higher spread symbols
    } else {
      return 0.06; // Default spread for other symbols
    }
  };

  // Function to calculate spread price
  const calculateSpreadPrice = (currentPrice, toggleState, symbol) => {
    // Get spread based on symbol
    const finalSpreadRatio = spreadPercentage(symbol);

    // Adjust the currentPrice with the spread to get the initial price.
    const calculatedInitialPrice =
      toggleState === "LONG"
        ? currentPrice + (currentPrice * finalSpreadRatio) / 100
        : currentPrice - (currentPrice * finalSpreadRatio) / 100;

    return calculatedInitialPrice;
  };

  useEffect(() => {
    if (prices) {
      const currentPrice = initialPrice;
      const selectedCryptosSafe = selectedCryptos || {};
      const selectedCrypto = Object.keys(selectedCryptosSafe).find(
        (key) => selectedCryptosSafe[key]
      );
      const decimalPlacesMapping = {
        BTC: 1,
        SOL: 3,
        PYTH: 4,
        BONK: 8,
        ETH: 1,
        SUI: 4,
        TIA: 3,
        JUP: 4,
      };
      const decimalPlaces =
        decimalPlacesMapping[selectedCrypto?.toUpperCase()] || 2;

      const spread = calculateSpreadPrice(
        currentPrice,
        toggleState,
        selectedCrypto
      );
      setSpreadPrice(parseFloat(spread.toFixed(decimalPlaces)));
    }
  }, [toggleState, prices, initialPrice, selectedCryptos]);

  // Rest of your code...

  useEffect(() => {
    const newFee = calculateFee(amountValue, leverage, rebateTier, isInit);
    setFee(newFee); // Set as a number
  }, [amountValue, leverage, rebateTier, isInit]);

  useEffect(() => {
    const currencySuffix = selectedCurrency === "USDC" ? "usdc" : "";

    const capitalizeFirstLetter = (string) =>
      string.charAt(0).toUpperCase() + string.slice(1);
    const parseData = (crypto, type) => {
      const cryptoName = currencySuffix
        ? capitalizeFirstLetter(crypto)
        : crypto;
      const propName = `${currencySuffix}${cryptoName}${type}`;
      return parseInt(data[propName] || 0, 10);
    };
    let selectedData = { long: 0, short: 0 };
    if (selectedCryptos.SOL) {
      selectedData = {
        long: parseData("sol", "Long"),
        short: parseData("sol", "Short"),
      };
    } else if (selectedCryptos.BTC) {
      selectedData = {
        long: parseData("btc", "Long"),
        short: parseData("btc", "Short"),
      };
    } else if (selectedCryptos.PYTH) {
      selectedData = {
        long: parseData("pyth", "Long"),
        short: parseData("pyth", "Short"),
      };
    } else if (selectedCryptos.BONK) {
      selectedData = {
        long: parseData("bonk", "Long"),
        short: parseData("bonk", "Short"),
      };
    } else if (selectedCryptos.ETH) {
      selectedData = {
        long: parseData("eth", "Long"),
        short: parseData("eth", "Short"),
      };
    } else if (selectedCryptos.TIA) {
      selectedData = {
        long: parseData("tia", "Long"),
        short: parseData("tia", "Short"),
      };
    } else if (selectedCryptos.SUI) {
      selectedData = {
        long: parseData("sui", "Long"),
        short: parseData("sui", "Short"),
      };
    } else if (selectedCryptos.JUP) {
      selectedData = {
        long: parseData("jup", "Long"),
        short: parseData("jup", "Short"),
      };
    }

    const totalDepositsKey = currencySuffix
      ? `usdcTotalDeposits`
      : "totalDeposits";

    const totalPOLDepositsKey = currencySuffix
      ? `projectsDepositedUsdc`
      : "projectsDepositedSol";
    console.log(totalDepositsKey, "TotalDepositss");

    const totalDeposits =
      LPdata?.[totalDepositsKey] + LPdata?.[totalPOLDepositsKey] || 0;
    console.log(totalDeposits, "TotalDepositss");

    const oiSol = totalDeposits / 4; // Open interest for large caps
    const poSmallPairs = totalDeposits / 25;

    let availableLiquidity = 0;

    if (totalDeposits === 0) {
      setAvailableLiquidity(0); // Set available liquidity to 0 if total deposits are not loaded
      return;
    }

    const individualLong = selectedData.long;
    const individualShort = selectedData.short;

    const bigCapLong =
      parseData("sol", "Long") +
      parseData("btc", "Long") +
      parseData("eth", "Long");
    const bigCapShort =
      parseData("sol", "Short") +
      parseData("btc", "Short") +
      parseData("eth", "Short");
    const smallCapLong =
      parseData("pyth", "Long") +
      parseData("bonk", "Long") +
      parseData("jup", "Long") +
      parseData("tia", "Long") +
      parseData("sui", "Long");
    const smallCapShort =
      parseData("pyth", "Short") +
      parseData("bonk", "Short") +
      parseData("jup", "Short") +
      parseData("tia", "Short") +
      parseData("sui", "Short");

    const currencyAdjustment =
      selectedCurrency === "USDC" ? 1000 : 5 * LAMPORTS_PER_SOL;

    if (toggleState === "LONG") {
      // Calculate available liquidity for selected cryptocurrency
      if (selectedCryptos.BTC || selectedCryptos.SOL || selectedCryptos.ETH) {
        if (bigCapLong <= oiSol * 2) {
          availableLiquidity = Math.min(
            oiSol * 2 - bigCapLong,
            oiSol - individualLong
          );
        }
      } else {
        if (smallCapLong <= totalDeposits / 12) {
          availableLiquidity = Math.min(
            totalDeposits / 10 - smallCapLong,
            poSmallPairs - individualLong
          );
        }
      }
    } else if (toggleState === "SHORT") {
      // Calculate available liquidity for selected cryptocurrency
      if (selectedCryptos.BTC || selectedCryptos.SOL || selectedCryptos.ETH) {
        if (bigCapShort <= oiSol * 2) {
          availableLiquidity = Math.min(
            oiSol * 2 - bigCapShort,
            oiSol - individualShort
          );
        }
      } else {
        if (smallCapShort <= totalDeposits / 12) {
          availableLiquidity = Math.min(
            totalDeposits / 10 - smallCapShort,
            poSmallPairs - individualShort
          );
        }
      }
    }
    setAvailableLiquidity(
      selectedCurrency === "USDC"
        ? (availableLiquidity * 1000) / LAMPORTS_PER_SOL
        : availableLiquidity / LAMPORTS_PER_SOL
    );
  }, [data, toggleState, selectedCryptos, LPdata, selectedCurrency]);

  const symbolMap = {
    BTC: "Crypto.BTC/USD",
    SOL: "Crypto.SOL/USD",
    PYTH: "Crypto.PYTH/USD",
    BONK: "Crypto.BONK/USD",
    JUP: "Crypto.JUP/USD",
    ETH: "Crypto.ETH/USD",
    TIA: "Crypto.TIA/USD",
    SUI: "Crypto.SUI/USD",

    // Add other mappings as necessary
  };

  const getActiveSymbol = () => {
    const activeKey = Object.keys(selectedCryptos).find(
      (key) => selectedCryptos[key]
    );
    console.log("Active key:", activeKey); // Outputs the key that is active

    const symbol = symbolMap[activeKey]; // Lookup the symbol in the map
    console.log("Mapped symbol:", symbol); // Outputs the corresponding symbol or undefined

    return symbol || "Crypto.SOL/USD"; // Fallback to "Crypto.SOL/USD" if symbol is undefined
  };

  const handleMouseEnter = () => {
    setSymbolSub(getActiveSymbol());
    setIsActive(true); // Set user as active when the mouse enters the button area
  };

  const handleButtonClick3 = () => {
    setSymbolSub(getActiveSymbol());
    setIsActive(true); // Set user as active on any button click
    if (selectedOrder === "MARKET") {
      onClick();
    } else {
      FutOrder();
    }
  };

  const ModalDetails1 = (
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
      <div className="relative rounded tradingcard">
        <div className="">
          <div className="font-poppins w-[100%] h-[100%] bg-[#080808] text-white px-5 pt-3 pb rounded text-[1rem]">
            <div className="bankGothic text-center font-semibold text-[1.5rem] text-[#F7931A]">
              DISCLAIMER{" "}
            </div>
            By opening a trading account on PopFi, I agree to the following:
            <div className="font-poppins pt-2 text-slate-300 text-[0.9rem]">
              I am lawfully allowed to access this site and use the PopFi dApp
              under the laws of the jurisdiction where I reside and am currently
              located.
            </div>
            <div className="font-poppins pt-2 text-slate-300 text-[0.9rem]">
              I will not use the PopFi dApp while located within any prohibited
              jurisdictions.
            </div>
            <button
              className="mt-4 p-2 bg-primary hover:bg-new-green-dark w-full rounded-lg flex flex-row items-center justify-center box-border  text-black transition ease-in-out duration-300"
              onClick={onClick1}
            >
              OPEN ACCOUNT
            </button>
            <div className="pt-6"></div>
          </div>
        </div>
      </div>
    </Modal>
  );

  const ModalDetails = (
    <Modal
      className="custom-scrollbar bg-layer-2"
      isOpen={modalIsOpen1}
      onRequestClose={closeModalHandler1}
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
              DISCLAIMER{" "}
            </div>
            By opening a trading account on PopFi, I agree to the following:
            <div className="relative leading-[14px] inline-block max-w-[250px]">
              Priority Fees
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
              <div className="self-stretch flex flex-row items-center justify-start">
                <div className="relative leading-[14px] inline-block max-w-[250px]">
                  Slippage Tolerance
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start justify-start">
                <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
                  <button
                    onClick={() => handleButtonClick(2)}
                    className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                      activeButton === 2
                        ? "bg-primary text-black"
                        : "bg-layer-2"
                    }`}
                  >
                    <div
                      className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                        activeButton === 2
                          ? "bg-[#0B111B] bg-opacity-80"
                          : "bg-opacity-0 hover:bg-[#ffffff24]"
                      }`}
                    >
                      0.3%
                    </div>
                  </button>
                  <button
                    onClick={() => handleButtonClick(3)}
                    className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                      activeButton === 3
                        ? "bg-primary text-black"
                        : "bg-layer-2"
                    }`}
                  >
                    <div
                      className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                        activeButton === 3
                          ? "bg-[#0B111B] bg-opacity-80"
                          : "bg-opacity-0 hover:bg-[#ffffff24]"
                      }`}
                    >
                      0.5%
                    </div>
                  </button>
                  <div
                    onClick={() => handleButtonClick(4)}
                    className={`flex hover:bg-[#ffffff24] rounded  w-[115px] h-7 ${activeButton === 4 ? "bg-primary text-black" : "bg-layer-2"}`}
                  >
                    <div
                      className={`rounded flex flex-row w-full h-full px-2 ${activeButton === 4 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#ffffff24]"}`}
                    >
                      <input
                        type="text"
                        placeholder="Custom"
                        className="flex justify-center items-center input3-capsule__input relative leading-[14px]"
                        value={customSlippage}
                        onChange={handleCustomSlippageChange}
                      />
                      <span className="flex justify-center items-center relative w-4 h-8 overflow-hidden shrink-0">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  const selectCurrencyAndCloseModal = (currency) => {
    setSelectedCurrency(currency);
    setModalIsOpen2(false);
  };

  const ModalDetails2 = (
    <Modal
      className="z-10000 custom-scrollbar bg-black rounded-md border-[1px] border-solid border-[#ffffff24]"
      isOpen={modalIsOpen2}
      onRequestClose={() => setModalIsOpen2(false)}
      style={{
        overlay: {
          zIndex: "10000",
          backgroundColor: "transparent",
        },
        content: {
          backgroundSize: "cover",
          position: "absolute",
          top: `${modalPosition.top + 8}px`,
          left: `${modalPosition.left - 98}px`,
        },
      }}
    >
      <div className="w-32 rounded-md bg-layer-1 text-[#ffffff60] ">
        <button
          onClick={() => selectCurrencyAndCloseModal("SOL")}
          className="w-full rounded-t-md flex flex-row gap-2 py-1 px-2 hover:bg-[#ffffff24]"
        >
          {" "}
          <img
            className="relative w-6 h-6 overflow-hidden shrink-0"
            alt=""
            src="/coins/60x60/Sol.png"
          />{" "}
          SOL{" "}
        </button>
        <button
          onClick={() => selectCurrencyAndCloseModal("USDC")}
          className="w-full rounded-b-md flex flex-row gap-2 py-1 px-2 hover:bg-[#ffffff24]"
        >
          {" "}
          <img
            className="relative w-6 h-6 overflow-hidden shrink-0"
            alt=""
            src="/coins/60x60/Usdc.png"
          />{" "}
          USDC{" "}
        </button>
      </div>
    </Modal>
  );

  return (
    <div className="z-100 custom-scrollbar overflow-hidden md:w-[375px] w-full rounded-lg  flex flex-col items-start justify-start p-4 gap-[16px] text-left text-sm text-[#ffffff60]  font-poppins">
      {ModalDetails1}
      {ModalDetails}
      {ModalDetails2}
      <div className="self-stretch flex flex-row items-start justify-start text-lg text-primary font-bankgothic-md-bt border-b-[2px] border-solid border-[#ffffff12]">
        <button
          onClick={setToggleChangeLong}
          className={`flex-1   h-10 flex flex-row items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
            toggleState === "LONG"
              ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-b-[2px] border-solid border-primary"
              : "text-[#ffffff60]  long-short-button"
          }`}
        >
          <div
            className={`flex justify-center items-center h-full w-full rounded-lg ${
              toggleState === "LONG" ? "" : ""
            }`}
          >
            <div
              className={`bankGothic uppercase  ${
                toggleState === "LONG" ? "" : ""
              }`}
            >
              LONG
            </div>
          </div>
        </button>
        <button
          onClick={setToggleChangeShort}
          className={`flex-1   h-10 flex flex-row items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
            toggleState === "SHORT"
              ? "flex-1 [background:linear-gradient(180deg,_rgba(255,_76,_76,_0),_rgba(255,_76,_76,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 text-short border-b-[2px] border-solid border-short"
              : "text-[#ffffff60]  long-short-button"
          }`}
        >
          <div
            className={`bankGothic  uppercase ${
              toggleState === "SHORT" ? "" : ""
            }`}
          >
            SHORT
          </div>
        </button>
      </div>
      <div className="w-full flex flex-row font-poppins rounded-md">
        <button
          onClick={() => setSelectedOrder("MARKET")}
          className={`w-1/2  self-stretch rounded-l-md  box-border h-[38px] flex flex-row items-center justify-center py-0 px-2 transition-all duration-200 ease-in-out   ${
            selectedOrder === "MARKET"
              ? "bg-[#ffffff08] text-white"
              : "bg-[#ffffff12] hover:bg-[#ffffff24]"
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setSelectedOrder("LIMIT")}
          className={`w-1/2  self-stretch rounded-r-md  box-border h-[38px] flex flex-row items-center justify-center py-0 px-2 transition-all duration-200 ease-in-out   ${
            selectedOrder === "LIMIT"
              ? "bg-[#ffffff08] text-white "
              : "bg-[#ffffff12] hover:bg-[#ffffff24]"
          }`}
        >
          Limit
        </button>
      </div>
      <div className="w-full h-[60px] flex flex-col items-start justify-start gap-[8px]">
        <div className="w-full flex flex-row items-start justify-start gap-[8px] justify-between">
          <div className="flex-1 flex-col">
            <div className="w-full h-4 flex flex-row items-start justify-between">
              <div className="relative leading-[14px]">Collateral Size</div>
              <button
                className="hidden relative leading-[20px] font-medium text-[#ffffff60]  text-lg"
                onClick={toggleModal}
              >
                <MdOutlineSettings></MdOutlineSettings>
              </button>
            </div>
            <div className="w-full mt-[12px] rounded-lg bg-[#ffffff12]  box-border h-[38px] flex flex-row items-center justify-between py-0 px-2 text-base text-[#ffffff60]  hover:bg-[#ffffff24] transition-all duration-200 ease-in-out  ">
              <input
                type="text"
                className="input-capsule__input w-full"
                placeholder="3.00"
                value={amountValue}
                onChange={handleInputChange}
                min={0.05}
                step={0.05}
              />
              <span className="rounded-12xs flex flex-row items-center justify-start py-[7px] px-0">
                {" "}
                <button
                  ref={buttonRef}
                  className=" relative leading-[20px] font-medium text-[#ffffff60]  text-lg flex flex-row items-center"
                  onClick={toggleModal2}
                >
                  <img
                    className="relative w-6 h-6 overflow-hidden shrink-0"
                    alt={selectedCurrency}
                    src={
                      selectedCurrency === "SOL"
                        ? "/coins/60x60/Sol.png"
                        : "/coins/60x60/Usdc.png"
                    }
                  />
                  <FaChevronUp
                    className={`w-[18px] h-[18px] ml-1 text-[#ffffff80] transition-all duration-300 ease-in-out   ${modalIsOpen2 ? "" : "rotate-180"}`}
                  />
                </button>
              </span>
            </div>
          </div>
          {selectedOrder === "LIMIT" && (
            <div className="w-1/2 flex-col">
              <div className="w-full h-4 flex flex-row items-start justify-between">
                <div className="relative leading-[14px]">Limit Price</div>
                <button
                  className="hidden relative leading-[20px] font-medium text-[#ffffff60]  text-lg"
                  onClick={toggleModal}
                >
                  <MdOutlineSettings></MdOutlineSettings>
                </button>
              </div>
              <div className="w-full mt-[12px] rounded-lg bg-[#ffffff12] box-border h-[38px] flex flex-row items-center justify-between py-0 px-2 text-base text-[#ffffff60] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out ">
                <input
                  type="text"
                  className="input-capsule__input"
                  placeholder="100$"
                  value={limitAmount} // Assume limitPriceValue is the state for this input
                  onChange={handleInputLimit} // Assume handleLimitPriceChange is the handler for this input
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
        <div className="self-stretch flex flex-row items-center justify-between">
          <div className="relative leading-[14px] inline-block max-w-[131px]">
            Leverage
          </div>
          <div className="rounded bg-[#ffffff12] box-border w-[60.3px] h-7 flex flex-col items-center justify-center py-0 px-2 text-base">
            <div className="relative leading-[14px] font-medium text-white">
              {leverage}X
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start  gap-[16px]">
          <Slider
            min={2}
            max={getMaxLeverage(selectedCryptos)}
            step={1}
            value={leverage}
            onChange={handleSliderChange}
            className="w-full"
            railStyle={{
              backgroundColor: "#ffffff12",
              paddingTop: "0.2rem",
              minHeight: "1.2rem",
              borderRadius: "100px",
            }}
            trackStyle={{
              minHeight: "0.7rem",
              backgroundColor: "#43e3ae",
              borderRadius: "100px",
              top: "9px",
              left: "5px",
            }}
            handleStyle={{
              backgroundColor: "#141825",
              border: "2px solid #30c296",
              top: "10px",
            }}
          />
          <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
            <button
              onClick={() => handleLeverageClick(25)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeLeverageButton === 25
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              25X
            </button>
            <button
              onClick={() => handleLeverageClick(50)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeLeverageButton === 50
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              50X
            </button>
            <button
              onClick={() => handleLeverageClick(75)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeLeverageButton === 75
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              75X
            </button>
            <button
              onClick={() => handleLeverageClick(100)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeLeverageButton === 100
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              100X
            </button>
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
        <div className="self-stretch flex flex-col items-start justify-start gap-[8px]">
          <div className="self-stretch flex flex-row items-start justify-between text-[#ffffff60] ">
            <button
              className="duration-300 flex items-center"
              onClick={toggleAdditionalDiv1}
            >
              <span className="mr-1">Slippage Tolerance</span>
              <FaChevronUp
                className={`ml-2 text-[#ffffff60] transition-all duration-300 ease-in-out  ${showAdditionalDiv1 ? "" : "rotate-180"}`}
              />
            </button>
          </div>
          <div
            className={`w-full flex flex-row items-start justify-start gap-[8px] ${showAdditionalDiv1 ? "" : "hidden"}`}
          >
            <button
              onClick={() => handleButtonClick(1)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeButton === 1
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              0.1%
            </button>
            <button
              onClick={() => handleButtonClick(2)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeButton === 2
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              0.3%
            </button>
            <button
              onClick={() => handleButtonClick(3)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border transition-all duration-200 ease-in-out ${
                activeButton === 3
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              0.5%
            </button>
            <div
              onClick={() => handleButtonClick(4)}
              className={`flex rounded  w-[115px] h-7 transition-all duration-200 ease-in-out items-center justify-center ${
                activeButton === 4
                  ? "bg-primary text-black"
                  : "bg-[#ffffff12] hover:bg-[#ffffff24]"
              }`}
            >
              <input
                type="text"
                placeholder="Custom %"
                className={`h-full w-full rounded flex justify-center items-center input7-capsule__input  relative leading-[14px] text-center transition-all duration-200 ease-in-out ${
                  activeButton === 4
                    ? "bg-primary text-black "
                    : "bg-[#ffffff12] "
                }`}
                value={customSlippage}
                onChange={handleCustomSlippageChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-[8px] text-[#ffffff60] ">
        <div className="self-stretch flex flex-row items-start justify-between text-[#ffffff60] ">
          <button
            className="duration-300 flex items-center"
            onClick={toggleAdditionalDiv}
          >
            <span className="mr-1">Risk management</span>
            <FaChevronUp
              className={`ml-2 text-[#ffffff60] transition-all duration-300 ease-in-out ${showAdditionalDiv ? "" : "rotate-180"}`}
            />
          </button>
        </div>
        <div
          className={`w-full flex flex-row items-start justify-start gap-[8px]  ${showAdditionalDiv ? "" : "hidden"}`}
        >
          <div className="flex-1 rounded bg-[#ffffff12]  h-10 flex flex-row items-center justify-between py-0 px-2   hover:bg-[#ffffff24] transition-all duration-200 ease-in-out">
            <input
              type="text"
              placeholder="Take Profit"
              className="input3-capsule__input relative leading-[14px]"
              value={ProfitValue ? ProfitValue : ""}
              onChange={handleInputChangeProfit}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <span className="relative w-6 h-6 overflow-hidden shrink-0">
              {" "}
              <img
                className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                alt=""
                src="/new/vector.svg"
              />
              <div className="absolute text-[17px] top-[20.83%] left-[29.5%] bg-gradient-to-b from-[#34C796] to-[#0B7A55] leading-[14px] bg-white [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                $
              </div>
            </span>
          </div>

          <div className="hover:bg-[#ffffff24] flex-1 rounded bg-[#ffffff12]  h-10 flex flex-row items-center justify-between py-0 px-2 transition-all duration-200 ease-in-out ">
            <input
              type="text"
              placeholder="Profit"
              className="input3-capsule__input relative leading-[14px]"
              value={Profit ? Profit : ""}
              onChange={handleProfitChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <span className="relative w-6 h-6 overflow-hidden shrink-0">
              {" "}
              <img
                className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                alt=""
                src="/new/component-9.svg"
              />
            </span>
          </div>
        </div>
        <div
          className={`w-full flex flex-row items-start justify-start gap-[8px] ${showAdditionalDiv ? "" : "hidden"}`}
        >
          <div className="flex-1 rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2   hover:bg-[#ffffff24] transition-all duration-200 ease-in-out">
            <input
              type="text"
              placeholder="Stop Loss"
              className="input3-capsule__input relative leading-[14px] "
              value={LossValue ? LossValue : ""}
              onChange={handleInputChangeLoss}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <span className="relative w-6 h-6 overflow-hidden shrink-0">
              {" "}
              <img
                className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                alt=""
                src="/new/vector.svg"
              />
              <div className="absolute text-[17px] top-[20.83%] left-[29.5%] leading-[14px] font-medium bg-gradient-to-b from-[#34C796] to-[#0B7A55] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                $
              </div>
            </span>
          </div>
          <div className="hover:bg-[#ffffff24] flex-1 rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 transition-all duration-200 ease-in-out">
            <input
              type="text"
              placeholder="Loss"
              className="input3-capsule__input relative leading-[14px]"
              value={Loss ? Loss : ""}
              onChange={handleLossChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <span className="relative w-6 h-6 overflow-hidden shrink-0">
              {" "}
              <img
                className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                alt=""
                src="/new/component-9.svg"
              />
            </span>
          </div>
        </div>{" "}
      </div>
      <div className="self-stretch rounded-md flex flex-col items-start justify-start gap-[8px]">
        <div className="md:hidden  self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Priority Fees</div>
          <div className="relative leading-[14px] font-medium text-white">
            <label className="toggle-switch-bigger">
              <input
                type="checkbox"
                checked={isPriorityFee}
                // onChange={handleToggle}
                className="hidden"
              />
              <div
                className={`slider-bigger ${isPriorityFee ? "active" : ""}`}
              ></div>
            </label>
          </div>
        </div>
        <div className="md:hidden self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Backup Oracle</div>
          <div className="relative leading-[14px] font-medium text-white">
            <label className="toggle-switch-bigger">
              <input
                type="checkbox"
                checked={isBackupOracle}
                onChange={handleToggleOracle}
                className="hidden"
              />
              <div
                className={`slider-bigger ${isBackupOracle ? "active" : ""}`}
              ></div>
            </label>
          </div>
        </div>

        <div className="md:flex hidden self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Fees</div>
          <div className="relative leading-[14px] font-medium text-white">
            {isNaN(parseFloat(amountValue) * 0.0008 * leverage) ? (
              `0 ${selectedCurrency}`
            ) : parseFloat(
                (parseFloat(amountValue) * 0.0008 * leverage).toFixed(3)
              ) > fee ? (
              <>
                <span className="line-through">
                  {(parseFloat(amountValue) * 0.0008 * leverage).toFixed(3)} SOL
                </span>
                <span>
                  {" "}
                  {fee} {selectedCurrency}
                </span>
              </>
            ) : (
              <span>
                {" "}
                {fee} {selectedCurrency}
              </span>
            )}
          </div>
        </div>
        <div className="md:flex hidden self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[120%]">Collateral Size</div>
          <div className="relative leading-[14px] font-medium text-white">
            {isNaN(parseFloat(amountValue))
              ? `0 ${selectedCurrency}`
              : `${parseFloat(amountValue)} ${selectedCurrency}`}
          </div>
        </div>
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Position Size</div>
          <div className="relative leading-[14px] font-medium text-white">
            {isNaN((parseFloat(amountValue) - fee) * leverage)
              ? `0 ${selectedCurrency}`
              : `${((parseFloat(amountValue) - fee) * leverage).toFixed(2)} ${selectedCurrency}`}
          </div>
        </div>
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Available Liquidity</div>
          <div className="relative leading-[14px] font-medium text-white">
            {availableLiquidity.toFixed(1)} {selectedCurrency}
          </div>
        </div>
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Est. Entry Price</div>
          <div className="relative leading-[14px] font-medium text-white">
            {spreadPrice} USD
          </div>
        </div>
        <div className="md:flex hidden self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Liquidation Price</div>
          <div className="relative leading-[14px] font-medium text-white">
            {liquidationPrice} USD
          </div>
        </div>
      </div>

      {wallet.connected ? (
        <button
          // onMouseEnter={handleMouseEnter}
          onClick={handleButtonClick3}
          disabled={isTransactionPending}
          className={`w-full rounded-lg h-[50px] flex flex-row items-center justify-center box-border text-black transition ease-in-out duration-300 ${
            toggleState === "LONG"
              ? "bg-primary hover:bg-new-green-dark"
              : "bg-short hover:bg-new-red-dark"
          }`}
        >
          {isTransactionPending ? (
            <div className="flex items-center justify-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                role="status"
              >
                <span className="visually-hidden">.</span>
              </div>
            </div>
          ) : (
            <div className="text-black text-lg transition ease-in-out duration-300">
              {selectedOrder === "MARKET" ? "OPEN POSITION" : "CREATE ORDER"}{" "}
            </div>
          )}
        </button>
      ) : (
        <div
          className={`flex justify-center items-center w-full h-[50px] rounded-lg bg-primar  cursor-pointer font-semibold   text-center text-lg text-black transition ease-in-out duration-300 ${
            toggleState === "LONG"
              ? "bg-primary hover:bg-new-green-dark"
              : "bg-short hover:bg-new-red-dark"
          }`}
        >
          <WalletMultiButton
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "black",
            }}
            className="w-[100%]"
          ></WalletMultiButton>
        </div>
      )}
    </div>
  );
};

export default TradeBar;
