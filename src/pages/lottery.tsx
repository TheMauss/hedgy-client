import Head from "next/head";
import { FC, useState, useEffect, useCallback, useRef } from "react";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { toPng } from "html-to-image";
import { Tooltip } from "react-tooltip";
import { IoMdInformationCircle } from "react-icons/io";
import "react-tooltip/dist/react-tooltip.css";
import debounce from "lodash.debounce";
import { FaCheckCircle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { deposit as depositInstruction } from "../out/instructions"; // Update with the correct path
import { withdraw as withdrawInstruction } from "../out/instructions"; // Update with the correct path
import { withdrawWithRatioLoss as withdrawwithLossInstruction } from "../out/instructions"; // Update with the correct path
import { withdrawTeamYield as withdrawTeamYield } from "../out/instructions"; // Update with the correct path
import { incentive as incentiveInstruction } from "../out/instructions/incentive"; // Update with the correct path

import { deposit as depositInstruction2 } from "../output/instructions"; // Update with the correct path
import { withdraw as withdrawInstruction2 } from "../output/instructions"; // Update with the correct path
import { withdrawWithRatioLoss as withdrawwithLossInstruction2 } from "../output/instructions"; // Update with the correct path
import { withdrawTeamYield as withdrawTeamYield2 } from "../output/instructions"; // Update with the correct path
import { incentive as incentiveInstruction2 } from "../output/instructions/incentive"; // Update with the correct path
import {
  LotteryAccount as LotteryAccount2,
  LotteryAccountJSON as LotteryAccountJSON2,
} from "../output/accounts/LotteryAccount";
import { ParticipantJSON as ParticipantJSON2 } from "../output/types/Participant";

import Modal from "react-modal";
import Decimal from "decimal.js";
import { usePriorityFee } from "../contexts/PriorityFee";
import { PROGRAM_ID } from "../out/programId";
import { notify } from "utils/notifications";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import {
  buildWhirlpoolClient,
  SwapUtils,
  PDAUtil,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  WhirlpoolContext,
  WhirlpoolAccountFetcher,
  TickUtil,
  PriceMath,
  swapQuoteByInputToken,
  swapQuoteByOutputToken,
  IGNORE_CACHE,
} from "@orca-so/whirlpools-sdk";
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import axios from "axios";
import {
  LotteryAccount,
  LotteryAccountJSON,
} from "../out/accounts/LotteryAccount";
import { ParticipantJSON } from "../out/types/Participant";
import dynamic from "next/dynamic";
import holderList from "./holders.json";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface UserWinnings {
  _id: string;
  user: string;
  smallWinnings: number;
  bigWinnings: number;

  // Add other properties if they exist
}

const lotteryAccount = new PublicKey(
  "9aFmbWZuMbCQzMyNqsTB4umen9mpnqL6Z6a4ypis3XzW"
); // Replace with actual account

const lotteryAccount2 = new PublicKey(
  "AnmXvJgAto11nm75RiUTEKAR3Ad2ZzzogxmhdUE4rdUA"
); // Replace with actual account

const pdaHouseAcc = new PublicKey(
  "FnxstpbQKMYW3Jw7SY5outhEiHGDkg7GUpoCVt9nVuHJ"
); // Replace with actual account

const pdaHouseAcc2 = new PublicKey(
  "EVRz6QgBH55qky7KWoVqQfxSE5S7vgR5zFdwQ9R7CM95"
); // Replace with actual account

const whirlpoolProgram = new PublicKey(ORCA_WHIRLPOOL_PROGRAM_ID);
const tokenProgram = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
); // Replace with actual account

const tokenOwnerAccountA = new PublicKey(
  "5UwRe6CoRZLJYJSd8GcbaXKrFCHbjYeRUdKSRpqRtkMH"
); // Replace with actual account

const tokenOwnerAccountA2 = new PublicKey(
  "6rVELXwk6io32kyqsJodM7VQLKYaTahnexavu9dTZ6RM"
); // Replace with actual account

const tokenVaultA = new PublicKey(
  "9sxSBQ3bS35VgV736MaSJRX11MfZHXxTdU4Pc1JfA5ML"
); // Replace with actual account

const tokenOwnerAccountB = new PublicKey(
  "ESXQ1jcH2CzchJR3oqYfsxJU9evGM14Fg5gaJPFXSvoX"
); // Replace with actual account

const tokenOwnerAccountB2 = new PublicKey(
  "3x1Q9VxKoo5Q6C3XxYd66YTdL4Ahz5LsnyyT1Pb3j72n"
); // Replace with actual account

const tokenVaultB = new PublicKey(
  "FZKgBhFkwNwsJLx3GXHHW8XPi8NMiJX791wweHBKaPcP"
); // Replace with actual account
const whirlpoolAddress = new PublicKey(
  "DxD41srN8Xk9QfYjdNXF9tTnP6qQxeF2bZF8s1eN62Pe"
);
const oraclePDA = PDAUtil.getOracle(
  ORCA_WHIRLPOOL_PROGRAM_ID,
  whirlpoolAddress
);

const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT5;

const fetchAPY = async () => {
  try {
    const response = await axios.get(
      "https://sanctum-extra-api.ngrok.dev/v1/apy/latest?lst=INF"
    );
    if (response.status === 200 && response.data && response.data.apys) {
      return response.data.apys.INF; // Assuming you need the APY for "INF"
    } else {
      console.error("APY data is not available or API request failed");
      return null;
    }
  } catch (error) {
    console.error("Error fetching APY:", error);
    return null;
  }
};

const fetchCurrentValue = async () => {
  try {
    const response = await axios.get(
      "https://sanctum-extra-api.ngrok.dev/v1/sol-value/current?lst=INF"
    );
    if (response.status === 200 && response.data && response.data.solValues) {
      return response.data.solValues.INF; // Returning the value for "INF"
    } else {
      console.error("SOL value data is not available or API request failed");
      return null;
    }
  } catch (error) {
    console.error("Error fetching SOL value:", error);
    return null;
  }
};

const calculateValue = (value, multiplier) => {
  return value * multiplier;
};

async function checkLotteryAccount(
  connection: Connection
): Promise<LotteryAccountJSON> {
  // const lotteryAcc = new PublicKey(
  //   "9aFmbWZuMbCQzMyNqsTB4umen9mpnqL6Z6a4ypis3XzW"
  // ); // Replace with actual account
  const lotteryAcc = new PublicKey(
    "9aFmbWZuMbCQzMyNqsTB4umen9mpnqL6Z6a4ypis3XzW"
  ); // Replace with actual account
  const lotteryAccount = await LotteryAccount.fetch(connection, lotteryAcc);

  if (!lotteryAccount) {
    return {
      isInitialized: false,
      totalDeposits: "0",
      lstTotalDeposits: "0",
      participants: [],
      smallCommitSlot: "0",
      smallRandomnessAccount: "0",
      bigLotteryTime: "0",
      bigLotteryHappened: false,
      smallLotteryTime: "0",
      smallLotteryHappened: false,
      bigCommitSlot: "0",
      bigRandomnessAccount: "0",
      teamYield: "0",
      bigLotteryYield: "0",
      smallLotteryToBig: 0,
      solIncentive: "0",
      lstIncentive: "0",
      bigSolIncentive: "0",
      bigLstIncentive: "0",
      bigLstLotteryYield: "0",
      teamLstYield: "0",
      bigCommitTime: "0",
      smallCommitTime: "0",
      isBigCommitted: false,
      isSmallComitted: false,
      weeklyHour: 0,
      monthlyHour: 0,
      maxWeeklyHour: 0,
      maxMonthlyHour: 0,
      hourlyTimestamp: "0",
    };
  }

  return lotteryAccount.toJSON();
}

async function checkLotteryAccount2(
  connection: Connection
): Promise<LotteryAccountJSON2> {
  const lotteryAcc = new PublicKey(
    "AnmXvJgAto11nm75RiUTEKAR3Ad2ZzzogxmhdUE4rdUA"
  ); // Replace with actual account
  const lotteryAccount = await LotteryAccount2.fetch(connection, lotteryAcc);

  if (!lotteryAccount) {
    return {
      isInitialized: false,
      totalDeposits: "0",
      lstTotalDeposits: "0",
      lstYieldDeposits: "0",
      lstLotteryDeposits: "0",
      participants: [],
      smallCommitSlot: "0",
      smallRandomnessAccount: "0",
      bigLotteryTime: "0",
      bigLotteryHappened: false,
      smallLotteryTime: "0",
      smallLotteryHappened: false,
      bigCommitSlot: "0",
      bigRandomnessAccount: "0",
      teamYield: "0",
      bigLotteryYield: "0",
      smallLotteryToBig: 0,
      solIncentive: "0",
      lstIncentive: "0",
      bigSolIncentive: "0",
      bigLstIncentive: "0",
      bigLstLotteryYield: "0",
      teamLstYield: "0",
      bigCommitTime: "0",
      smallCommitTime: "0",
      isBigCommitted: false,
      isSmallComitted: false,
      weeklyHour: 0,
      monthlyHour: 0,
      maxWeeklyHour: 0,
      maxMonthlyHour: 0,
      hourlyTimestamp: "0",
    };
  }

  return lotteryAccount.toJSON();
}

require("dotenv").config();

const Lottery: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const usdcbalance = useUserSOLBalanceStore((s) => s.usdcBalance);
  const { getUserSOLBalance, getUserUSDCBalance } = useUserSOLBalanceStore();
  const [amount, setAmount] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [displeyAmount, setDispleyAmount] = useState("");

  const [otherAmountThreshold, setOtherAmountThreshold] = useState(0);
  const [sqrtPriceLimit, setSqrtPriceLimit] = useState(0);
  const [amountSpecifiedIsInput, setAmountSpecifiedIsInput] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<Decimal | null>(null);
  const [swapQuote, setSwapQuote] = useState<any>(null);
  const [swapQuoteOut, setSwapQuoteOut] = useState<any>(null);
  const [swapQuoteOutLoss, setSwapQuoteOutLoss] = useState<any>(null);
  const [swapQuoteOutYield, setSwapQuoteOutYield] = useState<any>(null);

  const [lotteryAccountData, setLotteryAccountData] =
    useState<LotteryAccountJSON | null>(null);

  const [lotteryAccountData2, setLotteryAccountData2] =
    useState<LotteryAccountJSON2 | null>(null);

  const [participantData, setParticipantData] =
    useState<ParticipantJSON | null>(null);

  const [participantData2, setParticipantData2] =
    useState<ParticipantJSON2 | null>(null);

  const [participantDataMongo, setParticipantDataMongo] = useState(null);
  const [whirlpool, setWhirlpool] = useState<any>(null);
  const [aToB, setAToB] = useState(true);
  const wallet = useWallet();
  const [slippageTolerance, setSlippageTolerance] = useState(30); // Default to 0.1%
  const [activeButton, setActiveButton] = useState(2);
  const [customSlippage, setCustomSlippage] = useState("");
  const { isPriorityFee, setPriorityFee } = usePriorityFee();
  const [selectedStake, setSelectedStake] = useState<"DEPOSIT" | "WITHDRAW">(
    "DEPOSIT"
  );

  const [showAdditionalDiv1, setShowAdditionalDiv1] = useState(false);
  const [loading, setLoading] = useState(false);

  const [remainingTimeSmallLottery, setRemainingTimeSmallLottery] = useState<
    number | null
  >(null);
  const [remainingTimeBigLottery, setRemainingTimeBigLottery] = useState<
    number | null
  >(null);
  const [totalTimeSmallLottery, setTotalTimeSmallLottery] = useState<
    number | null
  >(null);
  const [totalTimeBigLottery, setTotalTimeBigLottery] = useState<number | null>(
    null
  );

  const [remainingTimeSmallLottery2, setRemainingTimeSmallLottery2] = useState<
    number | null
  >(null);
  const [remainingTimeBigLottery2, setRemainingTimeBigLottery2] = useState<
    number | null
  >(null);
  const [totalTimeSmallLottery2, setTotalTimeSmallLottery2] = useState<
    number | null
  >(null);
  const [totalTimeBigLottery2, setTotalTimeBigLottery2] = useState<
    number | null
  >(null);

  const [smallLotteryWinners, setSmallLotteryWinners] = useState([]);
  const [bigLotteryWinners, setBigLotteryWinners] = useState([]);
  const [userWinnings, setUserWinnings] = useState<UserWinnings | null>(null);
  const [userWinningsHistory, setUserWinningsHistory] = useState([]);

  const [smallLotteryYield, setSmallLotteryYield] = useState(null);
  const [bigLotteryYield, setBigLotteryYield] = useState(null);
  const [smallLotteryYield2, setSmallLotteryYield2] = useState(null);
  const [bigLotteryYield2, setBigLotteryYield2] = useState(null);
  const [apyValue, setApyValue] = useState(null);
  const [isYieldCalculated, setIsYieldCalculated] = useState(false);
  const [isYieldCalculated2, setIsYieldCalculated2] = useState(false);

  // New toggle state, starting with true by default
  const [depegProtectionState, setDepegProtectionState] = useState(true);
  const [referralLink, setReferralLink] = useState("");

  const multiplier = 0.9;
  const result =
    apyValue !== null ? calculateValue(apyValue * 100, multiplier) : null; // Convert to percentage

  const [selectedPool, setSelectedPool] = useState<"POOL1" | "POOL2">("POOL1");

  const formatPublicKey = (pubKey) => {
    if (!pubKey) return "";
    return `${pubKey.slice(0, 3)}...${pubKey.slice(-3)}`;
  };

  useEffect(() => {
    const getAPY = async () => {
      const apy = await fetchAPY();
      if (apy !== null) {
        setApyValue(apy);
      }
    };
    getAPY();
  }, []);

  function calculateAdjustedValue(
    infsol: number,
    lstDeposits: number,
    totalDeposits: number
  ): number {
    // Calculate the difference and the INF to SOL value
    const adjustedValue = infsol * lstDeposits - totalDeposits;

    if (adjustedValue > 0) {
      // Multiply by 0.9 if adjustedValue is greater than 0
      return adjustedValue * 0.9;
    } else {
      // Return the adjustedValue as is
      return adjustedValue;
    }
  }

  const calculateYield = async () => {
    const apy_raw = await fetchAPY();
    const apy = apy_raw * 0.9;
    if (
      !apy_raw ||
      !remainingTimeSmallLottery ||
      !remainingTimeBigLottery ||
      isYieldCalculated
    ) {
      return;
    }

    const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);

    if (apy !== null && price !== null && lotteryAccountData) {
      const lstDeposits = Number(lotteryAccountData.lstTotalDeposits);
      const totalDeposits = Number(lotteryAccountData.totalDeposits);
      const infsol = ((1 / price.toNumber()) * 9999) / 10000;
      const biLotteryYield = Number(lotteryAccountData.bigLotteryYield);
      const bigIncv = Number(lotteryAccountData.bigSolIncentive);
      const solIncv = Number(lotteryAccountData.solIncentive);

      console.log("orca price", infsol);

      console.log("lst/total", totalDeposits / lstDeposits);

      // Calculate the difference and the INF to SOL value
      const adjustedValue = calculateAdjustedValue(
        infsol,
        lstDeposits,
        totalDeposits
      );

      console.log("adj value", adjustedValue);

      // Calculate small lottery yield using remaining time
      if (remainingTimeSmallLottery) {
        const smallAPY = calculateLotteryAPY(apy, remainingTimeSmallLottery);
        let smallYield =
          (smallAPY * totalDeposits + adjustedValue + solIncv) / 2;
        smallYield = smallYield < 0 ? 0 : smallYield; // Set to 0 if below 0
        console.log("Small Lottery Yield:", smallYield);
        setSmallLotteryYield(smallYield);
      }

      // Calculate big lottery yield using remaining time
      if (remainingTimeBigLottery) {
        const bigAPY = calculateLotteryAPY(apy, remainingTimeBigLottery);
        let bigYield =
          (bigAPY * totalDeposits + adjustedValue) / 2 +
          biLotteryYield +
          bigIncv;
        bigYield = bigYield < 0 ? 0 : bigYield; // Set to 0 if below 0
        console.log("Big Lottery Yield:", bigYield);
        setBigLotteryYield(bigYield);
      }
      setIsYieldCalculated(true);
    }
  };

  useEffect(() => {
    if (lotteryAccountData) {
      calculateYield();
    }

    // Reset isYieldCalculated to false every X milliseconds
    const resetYieldCalculation = setInterval(() => {
      setIsYieldCalculated(false);
    }, 600000); // Reset every 60 seconds

    return () => clearInterval(resetYieldCalculation);
  }, [lotteryAccountData, remainingTimeSmallLottery, remainingTimeBigLottery]);

  const calculateYield2 = async () => {
    const apy_raw = await fetchAPY();
    const apy = (apy_raw / 2) * 0.85;
    if (
      !apy_raw ||
      !remainingTimeSmallLottery2 ||
      !remainingTimeBigLottery2 ||
      isYieldCalculated2
    ) {
      return;
    }

    const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);

    if (apy !== null && price !== null && lotteryAccountData2) {
      const lstDeposits = Number(lotteryAccountData2.lstLotteryDeposits);
      const totalDeposits = Number(lotteryAccountData2.totalDeposits);
      const infsol = ((1 / price.toNumber()) * 9999) / 10000;
      const biLotteryYield = Number(lotteryAccountData2.bigLotteryYield);
      const bigIncv = Number(lotteryAccountData2.bigSolIncentive);
      const solIncv = Number(lotteryAccountData2.solIncentive);

      console.log("orca price", infsol);

      console.log("lst/total", totalDeposits / lstDeposits);

      // Calculate the difference and the INF to SOL value
      const adjustedValue = calculateAdjustedValue(
        infsol,
        lstDeposits,
        totalDeposits
      );

      console.log("adj value", adjustedValue);

      // Calculate small lottery yield using remaining time
      if (remainingTimeSmallLottery2) {
        const smallAPY = calculateLotteryAPY(apy, remainingTimeSmallLottery2);
        let smallYield =
          (smallAPY * totalDeposits + adjustedValue + solIncv) / 2;
        smallYield = smallYield < 0 ? 0 : smallYield; // Set to 0 if below 0
        console.log("Small Lottery Yield:", smallYield);
        setSmallLotteryYield2(smallYield);
      }

      // Calculate big lottery yield using remaining time
      if (remainingTimeBigLottery2) {
        const bigAPY = calculateLotteryAPY(apy, remainingTimeBigLottery2);
        let bigYield =
          (bigAPY * totalDeposits + adjustedValue) / 2 +
          biLotteryYield +
          bigIncv;
        bigYield = bigYield < 0 ? 0 : bigYield; // Set to 0 if below 0
        console.log("Big Lottery Yield:", bigYield);
        setBigLotteryYield2(bigYield);
      }
      setIsYieldCalculated2(true);
    }
  };

  useEffect(() => {
    if (lotteryAccountData2) {
      calculateYield2();
    }

    // Reset isYieldCalculated to false every X milliseconds
    const resetYieldCalculation = setInterval(() => {
      setIsYieldCalculated2(false);
    }, 600000); // Reset every 60 seconds

    return () => clearInterval(resetYieldCalculation);
  }, [lotteryAccountData, remainingTimeSmallLottery, remainingTimeBigLottery]);

  // start

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Load the list of holders
  const [allowedHolders, setAllowedHolders] = useState<string[]>([]);

  useEffect(() => {
    const loadHolders = async () => {
      // Simulate loading JSON from uploaded file
      const holders = holderList; // Replace this with the actual method to load the JSON file
      setAllowedHolders(holders);
    };

    loadHolders();
  }, []);

  // Check if the connected wallet is in the list
  useEffect(() => {
    if (publicKey && allowedHolders.length > 0) {
      const publicKeyString = publicKey.toString();
      const isAllowed = allowedHolders.includes(publicKeyString);
      setHasAccess(isAllowed);
    }
  }, [publicKey, allowedHolders]);

  // end

  useEffect(() => {
    if (!lotteryAccountData) {
      console.log("Waiting for lotteryAccountData...");
      return; // Exit early if lotteryAccountData is not yet available
    }

    if (!lotteryAccountData2) {
      console.log("Waiting for lotteryAccountData...");
      return; // Exit early if lotteryAccountData is not yet available
    }
    const activeLotteryAccountData =
      selectedPool === "POOL1" ? lotteryAccountData : lotteryAccountData2;

    const smallLotteryEndTime = Number(
      activeLotteryAccountData?.smallLotteryTime
    );
    const smallLotteryStartTime = smallLotteryEndTime - 60 * 60 * 24 * 7; // Adjust based on your requirements

    const bigLotteryEndTime = Number(activeLotteryAccountData?.bigLotteryTime);
    const bigLotteryStartTime = bigLotteryEndTime - 4 * 60 * 60 * 24 * 7; // Adjust based on your requirements

    const updateRemainingTimes = async () => {
      try {
        let currentTime = new Date().getTime() / 1000;

        if (currentTime !== null) {
          const now = Math.floor(currentTime); // Use Solana time as Unix timestamp

          const remainingTimeSmallLottery = smallLotteryEndTime - now;
          const remainingTimeBigLottery = bigLotteryEndTime - now;
          const totalTimeSmallLottery =
            smallLotteryEndTime - smallLotteryStartTime;
          const totalTimeBigLottery = bigLotteryEndTime - bigLotteryStartTime;

          if (selectedPool === "POOL1") {
            setRemainingTimeSmallLottery(remainingTimeSmallLottery);
            setRemainingTimeBigLottery(remainingTimeBigLottery);
            setTotalTimeSmallLottery(totalTimeSmallLottery);
            setTotalTimeBigLottery(totalTimeBigLottery);
          } else {
            setRemainingTimeSmallLottery2(remainingTimeSmallLottery);
            setRemainingTimeBigLottery2(remainingTimeBigLottery);
            setTotalTimeSmallLottery2(totalTimeSmallLottery);
            setTotalTimeBigLottery2(totalTimeBigLottery);
          }
        } else {
          console.error("Failed to retrieve Solana block time.");
        }
      } catch (error) {
        console.error("Error fetching Solana time:", error);
      }
    };

    updateRemainingTimes();
    const interval = setInterval(updateRemainingTimes, 1000);

    return () => clearInterval(interval);
  }, [lotteryAccountData, lotteryAccountData2, selectedPool]);

  const getPercentage = (
    remainingTime: number | null,
    totalTime: number | null
  ) => {
    if (remainingTime === null || totalTime === null) return 0;
    return ((totalTime - remainingTime) / totalTime) * 100;
  };

  const smallLotteryPercentage = getPercentage(
    remainingTimeSmallLottery,
    totalTimeSmallLottery
  );
  const bigLotteryPercentage = getPercentage(
    remainingTimeBigLottery,
    totalTimeBigLottery
  );

  const smallLotteryPercentage2 = getPercentage(
    remainingTimeSmallLottery2,
    totalTimeSmallLottery2
  );
  const bigLotteryPercentage2 = getPercentage(
    remainingTimeBigLottery2,
    totalTimeBigLottery2
  );

  const getBackgroundStyle = (
    percentage: number,
    color1: string,
    color2: string
  ) => {
    return {
      background: `linear-gradient(to right, ${color1} ${percentage}%, ${color2} ${percentage}%)`,
    };
  };

  const smallLotteryBgStyle = getBackgroundStyle(
    smallLotteryPercentage,
    "#6fff90",
    "#255146"
  ); // Adjust colors as needed
  const bigLotteryBgStyle = getBackgroundStyle(
    bigLotteryPercentage,
    "#7363f3",
    "#255146"
  ); // Adjust colors as needed

  const smallLotteryBgStyle2 = getBackgroundStyle(
    smallLotteryPercentage2,
    "#6fff90",
    "#255146"
  ); // Adjust colors as needed
  const bigLotteryBgStyle2 = getBackgroundStyle(
    bigLotteryPercentage2,
    "#7363f3",
    "#255146"
  ); // Adjust colors as needed

  const formatRemainingTime = (seconds: number) => {
    if (seconds < 0) {
      return `0D 0H 0M 0S`;
    }

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    return `${days}D ${hours}H ${minutes}M ${secs}S`;
  };

  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);
    // setShowAdditionalDiv1(!showAdditionalDiv1);

    switch (buttonIndex) {
      case 1:
        setSlippageTolerance(10); // 0.1%
        break;
      case 2:
        setSlippageTolerance(30); // 0.3%
        break;
      case 3:
        setSlippageTolerance(50); // 0.5%
        break;
      default:
      // Handle default case if necessary
    }

    // Clear any custom slippage value
    setCustomSlippage("");
  };

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
      getUserUSDCBalance(publicKey, connection);
    }
  }, [publicKey, connection]);

  const checkParticipant = async () => {
    if (!publicKey) return;

    try {
      const response = await axios.post(
        "/api/check-participant", // Use a relative URL for the API
        {
          publicKey: publicKey.toBase58(),
        }
      );

      if (response.status === 200) {
        setParticipantDataMongo(response.data.participant);
        console.log(response.data.participant);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    checkParticipant();
  }, [publicKey]);

  useEffect(() => {
    if (participantDataMongo?.referralCode) {
      // Create the referral link using the referral code
      const link = `https://stakera.io/points?ref=${participantDataMongo.referralCode}`;
      setReferralLink(link);
    }
  }, [participantDataMongo]);

  const handleCopyClick = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      notify({
        type: "success",
        message: "Referral link copied to clipboard!",
      });
    }
  };

  const fetchLotteryAccountData = async () => {
    try {
      const data = await checkLotteryAccount(connection);
      console.log("rawdata", data);
      setLotteryAccountData(data);
      const data2 = await checkLotteryAccount2(connection);
      console.log("rawdata", data2);
      setLotteryAccountData2(data2);
    } catch (error) {
      console.error("Error fetching lottery account data:", error);
    }
  };

  const fetchParticipantData = async () => {
    try {
      const data = await checkLotteryAccount(connection);
      const participant = data.participants.find(
        (participant) => participant.pubkey === publicKey.toString()
      );
      const data2 = await checkLotteryAccount2(connection);
      const participant2 = data2.participants.find(
        (participant2) => participant2.pubkey === publicKey.toString()
      );
      setParticipantData(participant || null);
      setParticipantData2(participant2 || null);
    } catch (error) {
      console.error("Error fetching lottery account data:", error);
    }
  };

  // myslet na to!
  useEffect(() => {
    fetchLotteryAccountData();
  }, [connection]);

  // myslet na to!
  useEffect(() => {
    if (publicKey) {
      setTimeout(() => {
        fetchParticipantData();
      }, 150);
    }
  }, [publicKey, connection]);

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

  const handleToggle = () => {
    // Update the isPriorityFee state when the toggle button is clicked
    setDepegProtectionState(!depegProtectionState);
  };

  // const fetcher = new WhirlpoolAccountFetcher(connection);

  const getWhirlpoolClient = useCallback(() => {
    const ctx = WhirlpoolContext.from(
      connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID
    );
    const client = buildWhirlpoolClient(ctx);
    return client;
  }, [connection, wallet]);

  const getWhirlpoolData = useCallback(
    async (whirlpoolAddress: PublicKey) => {
      const client = getWhirlpoolClient();
      const whirlpool = await client.getPool(whirlpoolAddress);
      const sqrtPriceX64 = whirlpool.getData().sqrtPrice;
      const price = PriceMath.sqrtPriceX64ToPrice(sqrtPriceX64, 9, 9); // Update decimals based on token pairs
      return { whirlpool, price };
    },
    [getWhirlpoolClient]
  );

  const getSwapQuote = useCallback(
    async (whirlpool: any, amountIn: Decimal, slippage: Number) => {
      const ctx = WhirlpoolContext.from(
        connection,
        wallet,
        ORCA_WHIRLPOOL_PROGRAM_ID
      );
      const quote = await swapQuoteByInputToken(
        whirlpool,
        new PublicKey("So11111111111111111111111111111111111111112"), // Update with your input token mint
        DecimalUtil.toBN(amountIn, 9), // Update decimals based on token pairs
        Percentage.fromFraction(slippage, 10000),
        ctx.program.programId,
        ctx.fetcher,
        IGNORE_CACHE
      );
      return quote;
    },
    [connection, wallet]
  );

  const getSwapQuoteOutput = useCallback(
    async (whirlpool: any, amountOut: Decimal, slippage: number) => {
      const ctx = WhirlpoolContext.from(
        connection,
        wallet,
        ORCA_WHIRLPOOL_PROGRAM_ID
      );
      const quote = await swapQuoteByOutputToken(
        whirlpool,
        new PublicKey("So11111111111111111111111111111111111111112"), // Update with your output token mint
        DecimalUtil.toBN(amountOut, 9), // Update decimals based on token pairs
        Percentage.fromFraction(slippage, 10000),
        ctx.program.programId,
        ctx.fetcher,
        IGNORE_CACHE
      );
      return quote;
    },
    [connection, wallet]
  );

  const getSwapQuoteOutputLoss = useCallback(
    async (whirlpool: any, amountOut: Decimal, slippage: number) => {
      const ctx = WhirlpoolContext.from(
        connection,
        wallet,
        ORCA_WHIRLPOOL_PROGRAM_ID
      );
      const quote = await swapQuoteByInputToken(
        whirlpool,
        new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"), // Update with your output token mint
        DecimalUtil.toBN(amountOut, 9), // Update decimals based on token pairs
        Percentage.fromFraction(slippage, 1000),
        ctx.program.programId,
        ctx.fetcher,
        IGNORE_CACHE
      );
      return quote;
    },
    [connection, wallet]
  );

  const fetchWhirlpoolData = async () => {
    setLoading(true);
    try {
      const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);
      setWhirlpool(whirlpool);
      setCurrentPrice(price);

      const amountIn = new Decimal(amount);
      const PriceN = new Decimal(price);
      const amountOut = amountIn.times(PriceN);
      const amountOutQuote = new Decimal(amountOut);
      const amountOutYield = new Decimal(yieldAmount);

      console.log("Current Pool Price:", price.toFixed(9));
      if (selectedStake === "DEPOSIT") {
        const quote = await getSwapQuote(
          whirlpool,
          amountIn,
          slippageTolerance
        );
        const formattedQuote = decodeSwapQuote(quote);
        setSwapQuote(formattedQuote);
        console.log("Formatted Swap Quote:", formattedQuote);
      } else if (selectedStake === "WITHDRAW" && selectedPool === "POOL1") {
        const quoteOut = await getSwapQuoteOutput(
          whirlpool,
          amountIn,
          slippageTolerance
        );
        const quoteOutLoss = await getSwapQuoteOutputLoss(
          whirlpool,
          amountOutQuote,
          slippageTolerance
        );

        const formattedQuoteOut = decodeSwapQuote(quoteOut);
        const formattedQuoteOutLoss = decodeSwapQuote(quoteOutLoss);

        setSwapQuoteOut(formattedQuoteOut);
        setSwapQuoteOutLoss(formattedQuoteOutLoss);
        console.log("Formatted Swap Quote Out:", formattedQuoteOut);
        console.log("Formatted Swap Quote Out Loss:", formattedQuoteOutLoss);
      } else if (selectedStake === "WITHDRAW" && selectedPool === "POOL2") {
        const quoteOut = await getSwapQuoteOutput(
          whirlpool,
          amountIn,
          slippageTolerance
        );
        const quoteOutLoss = await getSwapQuoteOutputLoss(
          whirlpool,
          amountOutQuote,
          slippageTolerance
        );

        const quoteOutYield = await getSwapQuoteOutputLoss(
          whirlpool,
          amountOutYield,
          slippageTolerance
        );

        const formattedQuoteOut = decodeSwapQuote(quoteOut);
        const formattedQuoteOutLoss = decodeSwapQuote(quoteOutLoss);
        const formattedQuoteOutYield = decodeSwapQuote(quoteOutYield);

        setSwapQuoteOut(formattedQuoteOut);
        setSwapQuoteOutLoss(formattedQuoteOutLoss);
        setSwapQuoteOutYield(formattedQuoteOutYield);

        console.log("Formatted Swap Quote Out:", formattedQuoteOut);
        console.log("Formatted Swap Quote Out Loss:", formattedQuoteOutLoss);
        console.log("Formatted Swap Quote Out Yield:", formattedQuoteOutYield);
      }
    } catch (error) {
      console.error("Failed to fetch whirlpool data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of fetchWhirlpoolData
  const debouncedFetchWhirlpoolData = useCallback(
    debounce(fetchWhirlpoolData, 400), // 500ms debounce
    [amount, slippageTolerance, whirlpoolAddress, yieldAmount]
  );

  useEffect(() => {
    debouncedFetchWhirlpoolData();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchWhirlpoolData.cancel();
    };
  }, [debouncedFetchWhirlpoolData]);

  const decodeSwapQuote = (quote) => {
    return {
      estimatedAmountIn: quote.estimatedAmountIn.toString(),
      estimatedAmountOut: quote.estimatedAmountOut.toString(),
      estimatedEndTickIndex: quote.estimatedEndTickIndex,
      estimatedEndSqrtPrice: quote.estimatedEndSqrtPrice.toString(),
      estimatedFeeAmount: quote.estimatedFeeAmount.toString(),
      aToB: quote.aToB,
      amount: quote.amount.toString(),
      amountSpecifiedIsInput: quote.amountSpecifiedIsInput,
      otherAmountThreshold: quote.otherAmountThreshold.toString(),
      sqrtPriceLimit: quote.sqrtPriceLimit.toString(),
      tickArray0: quote.tickArray0.toBase58(),
      tickArray1: quote.tickArray1.toBase58(),
      tickArray2: quote.tickArray2.toBase58(),
      transferFee: {
        deductingFromEstimatedAmountIn:
          quote.transferFee.deductingFromEstimatedAmountIn.toString(),
        deductedFromEstimatedAmountOut:
          quote.transferFee.deductedFromEstimatedAmountOut.toString(),
      },
    };
  };

  // const startTick = TickUtil.getStartTickIndex(      whirlpool.getData().tickCurrentIndex,
  // whirlpool.getData().tickSpacing,);
  // // const tickArrayKey = PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolAddress, startTick);

  // // const tickArrays = await SwapUtils.getTickArrays(
  // //   whirlpool.getData().tickCurrentIndex,
  // //   whirlpool.getData().tickSpacing,
  // //   aToB,
  // //   ctx.program.programId,
  // //   whirlpoolAddress,
  // //   fetcher,
  // //   true
  // // );

  const handleDeposit = async (e) => {
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

    const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);

    const quote = await getSwapQuote(
      whirlpool,
      new Decimal(amount),
      slippageTolerance
    );

    const formattedQuote = decodeSwapQuote(quote);
    setSwapQuote(formattedQuote);

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

    const depositArgs = {
      amount: new BN(swapQuote.estimatedAmountIn),
      otherAmountThreshold: new BN(swapQuote.otherAmountThreshold),
      sqrtPriceLimit: new BN(swapQuote.sqrtPriceLimit),
      amountSpecifiedIsInput: true,
      aToB: true,
      slippage: new BN(slippageTolerance),
      depegProtection: depegProtectionState,
    };

    const depositAccounts = {
      lotteryAccount,
      user: publicKey,
      pdaHouseAcc,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA,
      tokenVaultA,
      tokenOwnerAccountB,
      tokenVaultB,
      tickArray0: new PublicKey(swapQuote.tickArray0),
      tickArray1: new PublicKey(swapQuote.tickArray1),
      tickArray2: new PublicKey(swapQuote.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
    };

    const depositAccounts2 = {
      lotteryAccount: lotteryAccount2,
      user: publicKey,
      pdaHouseAcc: pdaHouseAcc2,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA: tokenOwnerAccountA2,
      tokenVaultA,
      tokenOwnerAccountB: tokenOwnerAccountB2,
      tokenVaultB,
      tickArray0: new PublicKey(swapQuote.tickArray0),
      tickArray1: new PublicKey(swapQuote.tickArray1),
      tickArray2: new PublicKey(swapQuote.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
    };

    const accountsToUse =
      selectedPool === "POOL1" ? depositAccounts : depositAccounts2;

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

    try {
      const ix =
        selectedPool === "POOL1"
          ? depositInstruction(depositArgs, depositAccounts)
          : depositInstruction2(depositArgs, depositAccounts2);
      // const ix = incentiveInstruction(depositArgs, depositAccounts);
      const tx = new Transaction()
        .add(COMPUTE_BUDGET_IX)
        .add(ix)
        .add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Deposit transaction sent!",
        txid: signature,
      });
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Deposit transaction successful!",
        txid: signature,
      });
      setTimeout(() => {
        fetchLotteryAccountData();
        fetchParticipantData();
      }, 1500);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Deposit transaction failed!",
        description: error.message,
      });
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey) {
      notify({ type: "error", message: "Wallet not connected!" });
      return;
    }

    const withdrawArgs = {
      amount: new BN(swapQuoteOut.estimatedAmountOut),
      otherAmountThreshold: new BN(swapQuoteOut.otherAmountThreshold),
      sqrtPriceLimit: new BN(swapQuoteOut.sqrtPriceLimit),
      amountSpecifiedIsInput: false,
      aToB: false,
      slippage: new BN(slippageTolerance),
      depegProtection: depegProtectionState,
    };

    const withdrawAccounts = {
      lotteryAccount,
      user: publicKey,
      pdaHouseAcc,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA,
      tokenVaultA,
      tokenOwnerAccountB,
      tokenVaultB,
      tickArray0: new PublicKey(swapQuoteOut.tickArray0),
      tickArray1: new PublicKey(swapQuoteOut.tickArray1),
      tickArray2: new PublicKey(swapQuoteOut.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
    };

    const withdrawArgs2 = {
      amount: new BN(swapQuoteOut.estimatedAmountOut),
      otherAmountThreshold: new BN(swapQuoteOut.otherAmountThreshold),
      sqrtPriceLimit: new BN(swapQuoteOut.sqrtPriceLimit),
      amountSpecifiedIsInput: false,
      aToB: false,
      amountYield: new BN(swapQuoteOutYield.estimatedAmountIn),
      otherAmountThresholdYield: new BN(swapQuoteOutYield.otherAmountThreshold),
      sqrtPriceLimitYield: new BN(swapQuoteOutYield.sqrtPriceLimit),
      amountSpecifiedIsInputYield: true,
      aToBYield: false,
      slippageYield: new BN(slippageTolerance),
      depegProtection: depegProtectionState,
    };

    console.log("args", withdrawArgs);
    console.log("args2", withdrawArgs2);

    const withdrawAccounts2 = {
      lotteryAccount: lotteryAccount2,
      user: publicKey,
      pdaHouseAcc: pdaHouseAcc2,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA: tokenOwnerAccountA2,
      tokenVaultA,
      tokenOwnerAccountB: tokenOwnerAccountB2,
      tokenVaultB,
      tickArray0: new PublicKey(swapQuoteOut.tickArray0),
      tickArray1: new PublicKey(swapQuoteOut.tickArray1),
      tickArray2: new PublicKey(swapQuoteOut.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
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

    const COMPUTE_BUDGET_IX =
      selectedPool === "POOL1"
        ? ComputeBudgetProgram.setComputeUnitLimit({
            units: 300000,
          })
        : ComputeBudgetProgram.setComputeUnitLimit({
            units: 400000,
          });

    try {
      const ix =
        selectedPool === "POOL1"
          ? withdrawInstruction(withdrawArgs, withdrawAccounts)
          : withdrawInstruction2(withdrawArgs2, withdrawAccounts2);
      const tx = new Transaction()
        .add(COMPUTE_BUDGET_IX)
        .add(ix)
        .add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Withdraw transaction sent!",
        txid: signature,
      });
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdraw transaction successful!",
        txid: signature,
      });
      setTimeout(() => {
        fetchLotteryAccountData();
        fetchParticipantData();
      }, 1500);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Withdraw transaction failed!",
        description: error.message,
      });
    }
  };

  const handleTeamWithdraw = async () => {
    if (!publicKey) {
      notify({ type: "error", message: "Wallet not connected!" });
      return;
    }

    console.log(new Decimal(lotteryAccountData?.teamYield));
    console.log(lotteryAccountData.teamYield);

    const quoteOut = await getSwapQuoteOutput(
      whirlpool,
      new Decimal(Number(lotteryAccountData.teamYield) / LAMPORTS_PER_SOL),
      slippageTolerance
    );

    const withdrawArgs = {
      amount: new BN(quoteOut.estimatedAmountOut),
      otherAmountThreshold: new BN(quoteOut.otherAmountThreshold),
      sqrtPriceLimit: new BN(quoteOut.sqrtPriceLimit),
      amountSpecifiedIsInput: false,
      aToB: false,
      slippage: new BN(slippageTolerance),
    };

    const withdrawAccounts = {
      lotteryAccount,
      user: publicKey,
      pdaHouseAcc,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA,
      tokenVaultA,
      tokenOwnerAccountB,
      tokenVaultB,
      tickArray0: new PublicKey(quoteOut.tickArray0),
      tickArray1: new PublicKey(quoteOut.tickArray1),
      tickArray2: new PublicKey(quoteOut.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
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

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 3000000,
    });

    try {
      const ix = withdrawTeamYield(withdrawArgs, withdrawAccounts);
      const tx = new Transaction()
        .add(COMPUTE_BUDGET_IX)
        .add(ix)
        .add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Withdraw transaction sent!",
        txid: signature,
      });
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdraw transaction successful!",
        txid: signature,
      });
      setTimeout(() => {
        fetchLotteryAccountData();
        fetchParticipantData();
      }, 1500);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Withdraw transaction failed!",
        description: error.message,
      });
    }
  };

  const handleWithdrawWithLoss = async (amount) => {
    if (!publicKey) {
      notify({ type: "error", message: "Wallet not connected!" });
      return;
    }

    const withdrawArgs = {
      amount: new BN(amount),
      otherAmountThreshold: new BN(swapQuoteOutLoss.otherAmountThreshold),
      sqrtPriceLimit: new BN(swapQuoteOutLoss.sqrtPriceLimit),
      amountSpecifiedIsInput: true,
      aToB: false,
      slippage: new BN(slippageTolerance),
      depegProtection: depegProtectionState,
    };

    const withdrawArgs2 = {
      amount: new BN(amount),
      otherAmountThreshold: new BN(swapQuoteOutLoss.otherAmountThreshold),
      sqrtPriceLimit: new BN(swapQuoteOutLoss.sqrtPriceLimit),
      amountSpecifiedIsInput: true,
      aToB: false,
      amountYield: new BN(swapQuoteOutYield.estimatedAmountIn),
      otherAmountThresholdYield: new BN(swapQuoteOutYield.otherAmountThreshold),
      sqrtPriceLimitYield: new BN(swapQuoteOutYield.sqrtPriceLimit),
      amountSpecifiedIsInputYield: true,
      aToBYield: false,
      slippage: new BN(slippageTolerance),
      depegProtection: depegProtectionState,
    };

    const withdrawAccounts = {
      lotteryAccount,
      user: publicKey,
      pdaHouseAcc,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA,
      tokenVaultA,
      tokenOwnerAccountB,
      tokenVaultB,
      tickArray0: new PublicKey(swapQuoteOutLoss.tickArray0),
      tickArray1: new PublicKey(swapQuoteOutLoss.tickArray1),
      tickArray2: new PublicKey(swapQuoteOutLoss.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
    };

    const withdrawAccounts2 = {
      lotteryAccount: lotteryAccount2,
      user: publicKey,
      pdaHouseAcc: pdaHouseAcc2,
      systemProgram: SystemProgram.programId,
      whirlpoolProgram,
      tokenProgram,
      whirlpool: whirlpoolAddress,
      tokenOwnerAccountA: tokenOwnerAccountA2,
      tokenVaultA,
      tokenOwnerAccountB: tokenOwnerAccountB2,
      tokenVaultB,
      tickArray0: new PublicKey(swapQuoteOutLoss.tickArray0),
      tickArray1: new PublicKey(swapQuoteOutLoss.tickArray1),
      tickArray2: new PublicKey(swapQuoteOutLoss.tickArray2),
      oracle: oraclePDA.publicKey,
      wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
      associatedTokenProgram: new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      ),
      solOracleAccount: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
      infOracleAccount: new PublicKey(
        "Ceg5oePJv1a6RR541qKeQaTepvERA3i8SvyueX9tT8Sq"
      ),
      infMint: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
      poolState: new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW"),
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

    const COMPUTE_BUDGET_IX =
      selectedPool === "POOL1"
        ? ComputeBudgetProgram.setComputeUnitLimit({
            units: 300000,
          })
        : ComputeBudgetProgram.setComputeUnitLimit({
            units: 400000,
          });

    try {
      const ix =
        selectedPool === "POOL1"
          ? withdrawwithLossInstruction(withdrawArgs, withdrawAccounts)
          : withdrawwithLossInstruction2(withdrawArgs2, withdrawAccounts2);
      const tx = new Transaction()
        .add(COMPUTE_BUDGET_IX)
        .add(ix)
        .add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Withdraw transaction sent!",
        txid: signature,
      });
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdraw transaction successful!",
        txid: signature,
      });
      setTimeout(() => {
        fetchLotteryAccountData();
        fetchParticipantData();
      }, 1500);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Withdraw transaction failed!",
        description: error.message,
      });
    }
  };

  // const handleCustomSlippageChange = (event) => {
  //   const customValue = event.target.value;

  //   // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
  //   const preNumericValue = customValue.replace(/,/g, ".");
  //   const customValues = preNumericValue.replace(/[^0-9.]/g, "");

  //   // Count the occurrences of dot (.)
  //   const dotCount = (customValues.match(/\./g) || []).length;
  //   let sanitizedValue = customValues;
  //   // If there is more customValues one dot, keep only the portion before the second dot
  //   if (dotCount > 1) {
  //     sanitizedValue = sanitizedValue.substring(
  //       0,
  //       sanitizedValue.indexOf(".") + sanitizedValue.split(".")[1].length + 1
  //     );
  //   }

  //   // Update custom slippage state
  //   setCustomSlippage(sanitizedValue);

  //   // Convert to a number for validation
  //   const customTolerance = Number(sanitizedValue);

  //   // If the custom value is valid, update the slippage tolerance
  //   if (!isNaN(customTolerance) && customTolerance > 0) {
  //     setSlippageTolerance(customTolerance * 100); // Assuming the input is in percentage
  //     setActiveButton(4); // Deselect any active button
  //   }
  // };

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

    const PoolTwoyieldDeposits = participantData2?.lstYieldDeposits;
    const PoolTwoDeposits =
      participantData2?.pendingDeposit + participantData2?.deposit;

    const Numbers = parseFloat(sanitizedValue) / 2;
    const NumbersMultiplied = Numbers * Number(currentPrice);

    const SolWithdrawal =
      Numbers > Number(PoolTwoDeposits) ? Number(PoolTwoDeposits) : Numbers;
    const YieldWithdrawal =
      NumbersMultiplied > Number(PoolTwoyieldDeposits)
        ? Number(PoolTwoyieldDeposits)
        : NumbersMultiplied;

    // Conditional logic for setting amount and yield
    if (selectedPool === "POOL2" && selectedStake === "WITHDRAW") {
      setAmount(SolWithdrawal.toString()); // Set amount for POOL2
      setYieldAmount(YieldWithdrawal.toString()); // Set yield amount for POOL2
    } else {
      setAmount(sanitizedValue); // Use maxValue for POOL1
    }

    setDispleyAmount(sanitizedValue);
  };

  const [waves, setWaves] = useState([]);

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

    if (
      participantData &&
      currentPrice &&
      whirlpool &&
      selectedPool === "POOL1"
    ) {
      const depositAmount =
        Number(participantData.deposit) +
        Number(participantData?.pendingDeposit);
      const lstDepositAmount = Number(participantData.lstDeposits);
      const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);
      const swapRatio = 1 / price.toNumber(); // Example calculation, update as needed

      let amountIn;

      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const participantDeposit =
        Number(participantData?.deposit) +
          Number(participantData?.pendingDeposit) || 0;

      const difference = Math.abs(amountInLamports - participantDeposit);
      const percentageDifference = difference / participantDeposit;

      if (
        participantDeposit > 0 &&
        percentageDifference < 0.002 &&
        participantDeposit < amountInLamports
      ) {
        // If participantDeposit is less than amountInLamports and percentage difference is within 0.0002%
        amountIn = new Decimal(participantDeposit / LAMPORTS_PER_SOL);
      } else if (amountInLamports <= participantDeposit) {
        // If amountInLamports is less than participantDeposit
        amountIn = new Decimal(amount);
      } else {
        // Default case, set amountIn to 0
        amountIn = new Decimal(0);
      }

      console.log(`amountIn: ${amountIn.toString()}`);

      const PriceN = new Decimal(price);
      const amountOut = amountIn.times(PriceN);
      const amountOutQuote = new Decimal(amountOut);

      console.log(`amountIn: ${amountOutQuote.toString()}`);

      const quoteOut = await getSwapQuoteOutput(
        whirlpool,
        amountIn,
        slippageTolerance
      );
      const quoteOutLoss = await getSwapQuoteOutputLoss(
        whirlpool,
        amountOutQuote,
        slippageTolerance
      );

      const formattedQuoteOut = decodeSwapQuote(quoteOut);
      const formattedQuoteOutLoss = decodeSwapQuote(quoteOutLoss);

      // const quoteOutLoss = await getSwapQuoteOutputLoss(whirlpool, amountOutQuote, slippageTolerance);

      setSwapQuoteOut(formattedQuoteOut);
      setSwapQuoteOutLoss(formattedQuoteOutLoss);

      // console.log("swapRatio:", swapRatio);
      // console.log("depositRatio:", depositRatio);
      // console.log("lstDepositAmount:", lstDepositAmount);
      // console.log("formattedQuoteOut.estimatedAmountIn:", formattedQuoteOut.estimatedAmountIn);
      // console.log("depositAmount:", depositAmount);
      // console.log("formattedQuoteOut.estimatedAmountOut:", formattedQuoteOut.estimatedAmountOut);

      console.log("");
      if (
        // swapRatio >= depositRatio &&

        lstDepositAmount > formattedQuoteOut.estimatedAmountIn &&
        depositAmount >= formattedQuoteOut.estimatedAmountOut

        // swapRatio >= depositRatio &&
        // formattedQuoteOut.estimatedAmountOut.eq(depositAmount)
      ) {
        console.log("met");
        handleWithdraw();
      } else {
        const withdrawAmount = new BN(formattedQuoteOut.estimatedAmountIn).gt(
          lstDepositAmount
        )
          ? lstDepositAmount
          : new BN(formattedQuoteOut.estimatedAmountIn);
        console.log(Number(withdrawAmount.toString()), "withdrawAmount");

        handleWithdrawWithLoss(withdrawAmount);
      }
    } else if (
      participantData2 &&
      currentPrice &&
      whirlpool &&
      selectedPool === "POOL2"
    ) {
      const depositAmount =
        Number(participantData2.deposit) +
        Number(participantData2?.pendingDeposit);
      const lstDepositAmount = Number(participantData2.lstLotteryDeposits);
      const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);
      const swapRatio = 1 / price.toNumber(); // Example calculation, update as needed

      let amountIn;

      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const participantDeposit =
        Number(participantData2?.deposit) +
          Number(participantData2?.pendingDeposit) || 0;

      const difference = Math.abs(amountInLamports - participantDeposit);
      const percentageDifference = difference / participantDeposit;

      if (
        participantDeposit > 0 &&
        percentageDifference < 0.002 &&
        participantDeposit < amountInLamports
      ) {
        // If participantDeposit is less than amountInLamports and percentage difference is within 0.0002%
        amountIn = new Decimal(participantDeposit / LAMPORTS_PER_SOL);
      } else if (amountInLamports <= participantDeposit) {
        // If amountInLamports is less than participantDeposit
        amountIn = new Decimal(amount);
      } else {
        // Default case, set amountIn to 0
        amountIn = new Decimal(0);
      }

      console.log(`amountIn: ${amountIn.toString()}`);

      const PriceN = new Decimal(price);
      const amountOut = amountIn.times(PriceN);
      const amountOutQuote = new Decimal(amountOut);
      const amountOutYield = new Decimal(yieldAmount);

      console.log(`amountIn: ${amountOutQuote.toString()}`);

      const quoteOut = await getSwapQuoteOutput(
        whirlpool,
        amountIn,
        slippageTolerance
      );
      const quoteOutLoss = await getSwapQuoteOutputLoss(
        whirlpool,
        amountOutQuote,
        slippageTolerance
      );

      const quoteOutYield = await getSwapQuoteOutputLoss(
        whirlpool,
        amountOutYield,
        slippageTolerance
      );

      const formattedQuoteOut = decodeSwapQuote(quoteOut);
      const formattedQuoteOutLoss = decodeSwapQuote(quoteOutLoss);
      const formattedQuoteOutYield = decodeSwapQuote(quoteOutYield);

      // const quoteOutLoss = await getSwapQuoteOutputLoss(whirlpool, amountOutQuote, slippageTolerance);

      setSwapQuoteOut(formattedQuoteOut);
      setSwapQuoteOutLoss(formattedQuoteOutLoss);
      setSwapQuoteOutYield(formattedQuoteOutYield);

      // console.log("swapRatio:", swapRatio);
      // console.log("depositRatio:", depositRatio);
      console.log("lstDepositAmount:", lstDepositAmount);
      console.log("formattedQuoteOut", formattedQuoteOut);
      console.log("formattedQuoteOutLoss", formattedQuoteOutLoss);
      console.log("formattedQuoteOutYield", formattedQuoteOutYield);

      console.log("");
      if (
        // swapRatio >= depositRatio &&

        lstDepositAmount > formattedQuoteOut.estimatedAmountIn &&
        depositAmount >= formattedQuoteOut.estimatedAmountOut

        // swapRatio >= depositRatio &&
        // formattedQuoteOut.estimatedAmountOut.eq(depositAmount)
      ) {
        console.log("met");
        handleWithdraw();
      } else {
        const withdrawAmount = new BN(formattedQuoteOut.estimatedAmountIn).gt(
          lstDepositAmount
        )
          ? lstDepositAmount
          : new BN(formattedQuoteOut.estimatedAmountIn);
        console.log(Number(withdrawAmount.toString()), "withdrawAmount");
        console.log(
          Number(swapQuoteOutYield.estimatedAmountIn.toString()),
          "withdrawAmountYield"
        );

        handleWithdrawWithLoss(withdrawAmount);
      }
    }
  };

  const calculateLotteryAPY = (apy, totalTime) => {
    // Assuming the APY is given for a year, convert it to the period of the lottery.
    const secondsInAYear = 365 * 24 * 60 * 60;
    return (apy * totalTime) / secondsInAYear;
  };

  const isAmountValid = amount && parseFloat(amount) > 0;

  const [winningNewChance, setWinningNewChance] = useState("0.00%");

  useEffect(() => {
    const calculateWinningNewChance = () => {
      let parsedAmount = parseFloat(amount);

      // Set parsedAmount to 0 if it's NaN or less than or equal to 0
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        parsedAmount = 0;
      }

      const activeLotteryAccountData =
        selectedPool === "POOL1" ? lotteryAccountData : lotteryAccountData2;
      const activeParticipantData =
        selectedPool === "POOL1" ? participantData : participantData2;

      if (
        !activeLotteryAccountData ||
        Number(activeLotteryAccountData.totalDeposits) === 0 ||
        (parsedAmount === 0 &&
          (!activeParticipantData ||
            Number(activeParticipantData?.deposit) +
              Number(activeParticipantData?.pendingDeposit) ===
              0))
      ) {
        setWinningNewChance(`0.00%`);
        return "0.00%";
      }

      const MAX_CYCLE = activeLotteryAccountData?.maxWeeklyHour * 10;
      const current_hor = activeLotteryAccountData?.weeklyHour;

      if (
        current_hor + 1 > activeLotteryAccountData?.maxWeeklyHour &&
        selectedStake == "DEPOSIT"
      ) {
        setWinningNewChance(`0.00%`);
        return "0.00%";
      }

      // Calculate total weighted deposits
      const totalDeposits = activeLotteryAccountData.participants.reduce(
        (total, participant) => {
          // Ensure deposit and pendingDeposit are valid numbers and default to 0 if they're undefined or null
          const deposit = Number(participant?.deposit || 0);
          const pendingDeposit =
            current_hor === MAX_CYCLE / 10 - 1
              ? 0
              : Number(participant?.pendingDeposit || 0); // Exclude pendingDeposit if smallLotteryToBig === 3
          const totalDeposit = (deposit + pendingDeposit) / LAMPORTS_PER_SOL;
          const depositCycleStart = Number(participant?.avgWeeklyDeposit || 0);

          const weight = MAX_CYCLE - depositCycleStart;

          const weightedDeposit = totalDeposit * weight;

          // Add weighted deposit to total and return the new total
          return total + weightedDeposit;
        },
        0 // Initial value of total
      );

      const participantDeposit = Number(activeParticipantData?.deposit) || 0;
      const participantPendingDeposit =
        current_hor === MAX_CYCLE - 1
          ? 0
          : Number(activeParticipantData?.pendingDeposit) || 0; // Exclude pendingDeposit if smallLotteryToBig === 3
      const participantCycleStart =
        Number(activeParticipantData?.avgWeeklyDeposit) || 0;
      const participantWeight = MAX_CYCLE - participantCycleStart;

      const participantTotalDeposit =
        (participantDeposit + participantPendingDeposit) / LAMPORTS_PER_SOL;
      const participantWeightedDeposit =
        participantTotalDeposit * participantWeight;

      const actualPercentage =
        (participantWeightedDeposit / totalDeposits) * 100;

      const newTotal = Math.max(
        selectedStake === "DEPOSIT"
          ? totalDeposits + parsedAmount * (MAX_CYCLE - (current_hor + 1) * 10)
          : totalDeposits - parsedAmount * (MAX_CYCLE - (current_hor + 1) * 10),
        0 // Ensure newTotal is not negative
      );

      const newPerson = Math.max(
        selectedStake === "DEPOSIT"
          ? participantWeightedDeposit +
              parsedAmount * (MAX_CYCLE - (current_hor + 1) * 10)
          : participantWeightedDeposit -
              parsedAmount * (MAX_CYCLE - (current_hor + 1) * 10),
        0 // Ensure newPerson is not negative
      );
      const chance =
        newTotal === 0
          ? 0
          : selectedStake === "DEPOSIT"
            ? (newPerson / newTotal) * 100 - actualPercentage
            : -(actualPercentage - (newPerson / newTotal) * 100);
      setWinningNewChance(`${chance.toFixed(2)}%`);
    };
    // Call the calculation function
    calculateWinningNewChance();

    // Recalculate the winning chance when lotteryAccountData or participantData changes
  }, [
    lotteryAccountData,
    lotteryAccountData2,
    participantData,
    participantData2,
    amount,
    selectedStake,
    selectedPool,
  ]);

  const [winningChance, setWinningChance] = useState("0.00%");

  useEffect(() => {
    const calculateWinningChance = () => {
      const activeLotteryAccountData =
        selectedPool === "POOL1" ? lotteryAccountData : lotteryAccountData2;
      const activeParticipantData =
        selectedPool === "POOL1" ? participantData : participantData2;

      if (
        !activeLotteryAccountData ||
        Number(activeLotteryAccountData.totalDeposits) === 0
      ) {
        return "0.00%";
      }

      // Constants
      const MAX_CYCLE = activeLotteryAccountData?.maxWeeklyHour * 10;
      const current_hor = activeLotteryAccountData?.weeklyHour;

      // Calculate total weighted deposits
      const totalWeightedDeposits =
        activeLotteryAccountData.participants.reduce(
          (total, participant) => {
            // Ensure deposit and pendingDeposit are valid numbers and default to 0 if they're undefined or null
            const deposit = Number(participant?.deposit || 0);
            const pendingDeposit =
              current_hor === MAX_CYCLE / 10 - 1
                ? 0
                : Number(participant?.pendingDeposit || 0); // Exclude pendingDeposit if smallLotteryToBig === 3
            const totalDeposit = (deposit + pendingDeposit) / LAMPORTS_PER_SOL;
            const depositCycleStart = Number(
              participant?.avgWeeklyDeposit || 0
            );

            const weight = MAX_CYCLE - depositCycleStart;

            const weightedDeposit = totalDeposit * weight;

            // Add weighted deposit to total and return the new total
            return total + weightedDeposit;
          },
          0 // Initial value of total
        );

      // Calculate participant's deposit and weight
      const participantDeposit = Number(activeParticipantData?.deposit) || 0;
      const participantPendingDeposit =
        current_hor === MAX_CYCLE - 1
          ? 0
          : Number(activeParticipantData?.pendingDeposit) || 0; // Exclude pendingDeposit if smallLotteryToBig === 3
      const participantCycleStart =
        Number(activeParticipantData?.avgWeeklyDeposit) || 0;
      const participantWeight = MAX_CYCLE - participantCycleStart;

      const participantTotalDeposit =
        (participantDeposit + participantPendingDeposit) / LAMPORTS_PER_SOL;
      const participantWeightedDeposit =
        participantTotalDeposit * participantWeight;

      // Calculate the chance
      const chance = (participantWeightedDeposit / totalWeightedDeposits) * 100;

      setWinningChance(`${chance.toFixed(2)}%`);
    };
    // Call the calculation function
    calculateWinningChance();

    // Recalculate the winning chance when lotteryAccountData or participantData changes
  }, [
    lotteryAccountData,
    participantData,
    lotteryAccountData2,
    participantData2,
    selectedPool,
  ]);

  const [winningChanceBig, setWinningChanceBig] = useState("0.00%");

  useEffect(() => {
    const calculateWinningChanceBig = () => {
      const activeLotteryAccountData =
        selectedPool === "POOL1" ? lotteryAccountData : lotteryAccountData2;
      const activeParticipantData =
        selectedPool === "POOL1" ? participantData : participantData2;

      if (
        !activeLotteryAccountData ||
        Number(activeLotteryAccountData.totalDeposits) === 0
      ) {
        return "0.00%";
      }

      // Constants
      const max_monthly_hours = activeLotteryAccountData?.maxMonthlyHour * 10; // Assuming 4000 is the maximum value for cycle calculation.
      const current_hor = activeLotteryAccountData?.monthlyHour; // Assuming 4000 is the maximum value for cycle calculation.

      // Calculate total weighted deposits
      const totalWeightedDeposits =
        activeLotteryAccountData.participants.reduce(
          (total, participant) => {
            // Ensure deposit and pendingDeposit are valid numbers and default to 0 if they're undefined or null
            const deposit = Number(participant?.deposit || 0);
            const pendingDeposit =
              current_hor === max_monthly_hours / 10 - 1
                ? 0
                : Number(participant?.pendingDeposit || 0); // Exclude pendingDeposit if smallLotteryToBig === 3
            const totalDeposit = (deposit + pendingDeposit) / LAMPORTS_PER_SOL;
            const depositCycleStart = Number(
              participant?.avgMonthlyDeposit || 0
            );

            const weight = max_monthly_hours - depositCycleStart;

            const weightedDeposit = totalDeposit * weight;

            // Add weighted deposit to total and return the new total
            return total + weightedDeposit;
          },
          0 // Initial value of total
        );

      // Calculate participant's deposit and weight
      const participantDeposit = Number(activeParticipantData?.deposit) || 0;
      const participantPendingDeposit =
        current_hor === max_monthly_hours - 1
          ? 0
          : Number(activeParticipantData?.pendingDeposit) || 0; // Exclude pendingDeposit if smallLotteryToBig === 3
      const participantCycleStart =
        Number(activeParticipantData?.avgMonthlyDeposit) || 0;
      const participantWeight = max_monthly_hours - participantCycleStart;

      const participantTotalDeposit =
        (participantDeposit + participantPendingDeposit) / LAMPORTS_PER_SOL;
      const participantWeightedDeposit =
        participantTotalDeposit * participantWeight;

      // Calculate the chance
      const chance = (participantWeightedDeposit / totalWeightedDeposits) * 100;
      setWinningChanceBig(`${chance.toFixed(2)}%`);
    };

    // Call the calculation function
    calculateWinningChanceBig();

    // Recalculate the winning chance when lotteryAccountData or participantData changes
  }, [
    lotteryAccountData,
    participantData,
    lotteryAccountData2,
    participantData2,
    selectedPool,
  ]);

  const toggleAdditionalDiv1 = () => {
    setShowAdditionalDiv1(!showAdditionalDiv1);
  };

  const defaultImage = "/catavatargod.png"; // Default image
  const [profileImage, setProfileImage] = useState(defaultImage);
  const fileInputRef = useRef(null); // Reference to the file input

  // Load the saved image from local storage when the component mounts
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // Handle the file input change and update profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      // Once the file is read, save it and update the state
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const imageUrl = reader.result;
          setProfileImage(imageUrl);
          localStorage.setItem("profileImage", imageUrl); // Save the image in local storage
        }
      };

      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  };

  // Function to trigger file input click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger click on hidden file input
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(defaultImage); // Revert back to the default image
    localStorage.removeItem("profileImage"); // Remove the image from local storage
  };

  const [randomImage, setRandomImage] = useState("");

  const getRandomImageName = () => {
    // const images = ["ellipse-1@2x.png", "cat1.png", "cat4.png", "cat6.png"];
    const images = ["catavatargod.png"];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  useEffect(() => {
    const randomImageName = getRandomImageName();
    setRandomImage(randomImageName);
  }, []);

  const { subscribeToBalanceChanges } = useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      subscribeToBalanceChanges(wallet.publicKey, connection);
    }
  }, [
    wallet.publicKey,
    connection,
    getUserSOLBalance,
    subscribeToBalanceChanges,
  ]);

  const [currentLottery, setCurrentLottery] = useState("BIG");

  const toggleLottery = (lottery: string) => {
    setCurrentLottery(lottery);
  };

  const handleAmountClick = (type) => {
    let tokenBalance;
    let maxAmount;
    let maxLSTAmount;

    if (type === "HALF" && !isNaN(Number(amount)) && Number(amount) > 0) {
      if (selectedStake === "WITHDRAW" && selectedPool === "POOL2") {
        tokenBalance =
          Number(amount) / 2 +
          ((1 / Number(currentPrice)) * Number(yieldAmount)) / 2;
        maxAmount = Number(amount) / 2;
        maxLSTAmount = Number(yieldAmount) / 2;
      } else {
        tokenBalance = Number(amount) / 2;
      }
    } else {
      if (selectedStake === "DEPOSIT") {
        tokenBalance =
          type === "HALF" ? (balance - 2 / 100) / 2 : balance - 2 / 100;
        tokenBalance = tokenBalance.toFixed(3);
      } else {
        const participantDeposit =
          selectedPool === "POOL1"
            ? isNaN(
                (Number(participantData?.deposit) +
                  Number(participantData?.pendingDeposit)) /
                  LAMPORTS_PER_SOL
              )
              ? 0
              : (Number(participantData?.deposit) +
                  Number(participantData?.pendingDeposit)) /
                LAMPORTS_PER_SOL
            : isNaN(
                  (Number(participantData2?.deposit) +
                    Number(participantData2?.pendingDeposit) +
                    (1 / Number(currentPrice)) *
                      Number(participantData2?.lstLotteryDeposits)) /
                    LAMPORTS_PER_SOL
                )
              ? 0
              : (Number(participantData2?.deposit) +
                  Number(participantData2?.pendingDeposit) +
                  (1 / Number(currentPrice)) *
                    Number(participantData2?.lstLotteryDeposits)) /
                LAMPORTS_PER_SOL;

        const participantDepositTotal =
          (Number(participantData2?.deposit) +
            Number(participantData2?.pendingDeposit)) /
          LAMPORTS_PER_SOL;

        tokenBalance =
          type === "HALF" ? participantDeposit / 2 : participantDeposit;
        maxAmount =
          type === "HALF"
            ? participantDepositTotal / 2
            : participantDepositTotal;
        maxLSTAmount =
          type === "HALF"
            ? Number(participantData2?.lstYieldDeposits) / LAMPORTS_PER_SOL / 2
            : Number(participantData2?.lstYieldDeposits) / LAMPORTS_PER_SOL;
      }
    }
    const maxValue = Math.max(Number(tokenBalance), 0);
    const displayMax = Math.max(Number(tokenBalance), 0).toFixed(3);
    const maxDepositValue = Math.max(Number(maxAmount), 0);
    const maximumLSTValue = Math.max(Number(maxLSTAmount), 0);

    setAmount(maxValue.toString()); // Update the state, which will update the input value reactively

    // Conditional logic for setting amount and yield
    if (selectedPool === "POOL2" && selectedStake === "WITHDRAW") {
      setAmount(maxDepositValue.toString()); // Set amount for POOL2
      setYieldAmount(maximumLSTValue.toString()); // Set yield amount for POOL2
    } else {
      setAmount(maxValue.toString()); // Use maxValue for POOL1

      // For POOL2, use deposit + pendingDeposit for setAmount
    }

    setDispleyAmount(displayMax.toString()); // Update the state, which will update the input value reactively
  };

  useEffect(() => {
    const fetchLotteryResults = async () => {
      try {
        const response = await axios.get("/api/lottery-results"); // Call your Next.js API route
        const { smallResults, bigResults } = response.data;

        setSmallLotteryWinners(smallResults);
        setBigLotteryWinners(bigResults);
      } catch (error) {
        console.error("Error fetching lottery results:", error);
      }
    };

    fetchLotteryResults();
  }, []);

  const screenshotRef = useRef(null); // Create a reference to the div
  const [isImageCopied, setImageCopied] = useState(false);

  // Function to capture the screenshot and copy to clipboard
  const handleScreenshotAndTweet = async () => {
    if (screenshotRef.current) {
      try {
        const dataUrl = await toPng(screenshotRef.current);

        // Create an image element
        const img = new Image();
        img.src = dataUrl;

        // Create a canvas to hold the image and copy to clipboard
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
          });
          setImageCopied(true);
        };

        // Optionally open Twitter after copying (with delay)
        setTimeout(() => {
          const tweetText = encodeURIComponent(
            "Check out my lossless lottery winnings at Stakera!"
          );
          const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
          window.open(twitterUrl, "_blank");
        }, 3000); // 3 seconds delay before opening Twitter
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      }
    }
  };

  // Function to capture the screenshot and copy to clipboard
  const handleScreenshotAndCopy = async () => {
    if (screenshotRef.current) {
      try {
        const dataUrl = await toPng(screenshotRef.current);

        // Create an image element
        const img = new Image();
        img.src = dataUrl;

        // Create a canvas to hold the image and copy to clipboard
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
          });
          setImageCopied(true);
        };
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUserResults = async () => {
      try {
        if (!publicKey) {
          console.error("Public key is not available");
          return;
        }

        const response = await axios.get(
          `/api/user-winnings?publicKey=${publicKey}`
        ); // Call your Next.js API route
        console.log("response", response);
        setUserWinnings(response.data.winnings);
        setUserWinningsHistory(response.data.lotteryWins);
      } catch (error) {
        console.error("Error fetching user winnings:", error);
      }
    };

    fetchUserResults();
  }, [publicKey]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle clicking on the info icon to toggle the modal
  const handleToggleModal = () => {
    setIsModalOpen((prevState) => !prevState); // Toggle modal
  };

  const [isModal2Open, setIsModal2Open] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Handle clicking on the info icon to toggle the modal
  const handleToggleModal2 = () => {
    setIsModal2Open((prevState) => !prevState); // Toggle modal
  };

  const closeModalHandler1 = () => {
    setIsModal2Open(false);
  };

  const ModalDetails = (
    <Modal
      className="flex-col items-center w-[1920px] h-[1080px] justify-center bg-gray-100 p-3 rounded-2xl modal-content"
      isOpen={isModal2Open}
      onRequestClose={() => {
        setIsModal2Open(false); // Close the modal
        setImageCopied(false); // Reset image copied state
      }}
      contentLabel="Confirm Team Action"
      style={{
        overlay: {
          zIndex: "100",
          backgroundColor: "transparent",
          backdropFilter: "blur(10px)",
        },
      }}
    >
      {isImageCopied && (
        <Tooltip
          anchorSelect="#CopiedCard"
          place="top"
          style={{
            position: "fixed",
            transform: "translate(0%, -200%) scale(2.5)",
          }}
          className="p-4 bg-gray-800 text-white rounded-lg shadow-lg font-gilroy-medium" // 40px * 2.94 = 117px
        >
          Image copied
        </Tooltip>
      )}
      {currentItem && (
        <div
          id="CopiedCard"
          ref={screenshotRef}
          style={{
            backgroundImage: "url('/twitterpost.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top",
          }}
          className="text-start w-full h-full flex flex-col items-start justify-start gap-[2px] text-center text-white font-gilroy-medium"
        >
          <div className="text-[50px]  pt-[150px] px-[100px] ">
            <div className="text-[60px] font-gilroy-regular">Winnings</div>
            <div className="text-[150px] text-primary">
              {" "}
              {(currentItem.yieldAmount / LAMPORTS_PER_SOL).toFixed(2)}{" "}
              <span className="text-[120px]">◎</span>
            </div>
            <div className="pt-[25px] w-[70%]">
              <div className="flex flex-row justify-between text-[50px] w-full">
                <div className="flex flex-col justify-between">
                  <div className="text-[60px] font-gilroy-regular">Deposit</div>
                  <div className="text-[150px]">
                    {(isNaN(
                      ((currentItem.pool ?? 1) === 1
                        ? Number(participantData?.deposit || 0)
                        : Number(participantData2?.deposit || 0)) -
                        Number(currentItem.yieldAmount || 0)
                    )
                      ? 0
                      : (((currentItem.pool ?? 1) === 1
                          ? Number(participantData?.deposit || 0)
                          : Number(participantData2?.deposit || 0)) -
                          Number(currentItem.yieldAmount || 0)) /
                        LAMPORTS_PER_SOL
                    ).toFixed(1)}{" "}
                    <span className="text-[120px]">◎</span>
                  </div>{" "}
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-[60px] font-gilroy-regular">ROI</div>
                  <div className="text-[150px]">
                    {(
                      (currentItem.yieldAmount /
                        ((currentItem.pool ?? 1) === 1
                          ? Number(participantData?.deposit)
                          : Number(participantData2?.deposit))) *
                      100
                    ).toFixed(1)}
                    %
                  </div>{" "}
                </div>
              </div>
            </div>
            <div className="text-[50px] pt-[50px] w-[60%]">
              Win in a Lossless Lottery, without risking your deposit!
            </div>
          </div>
        </div>
      )}
      <div className="justify-end flex flex-row gap-8">
        <div
          id="CopiedCards"
          onClick={handleScreenshotAndCopy}
          className="mt-6 cursor-pointer h-[150px] w-[150px] md:h-[120px] md:w-[120px] justify-end items-end rounded-xl bg-gray-400 flex flex-row items-center justify-center z-[1]"
        >
          {isImageCopied && (
            <Tooltip
              anchorSelect="#CopiedCards"
              place="bottom"
              style={{
                position: "fixed",
                transform: "translate(0%, 100%) scale(2.5)",
              }}
              className="p-4 bg-gray-800 text-white rounded-lg shadow-lg font-gilroy-medium" // 40px * 2.94 = 117px
            >
              Image copied
            </Tooltip>
          )}
          <img
            className="h-[100px] w-[100px] md:h-[80px] md:w-[80px]"
            alt=""
            src="/vuesaxbulkcopy.svg"
          />
        </div>
        <div
          onClick={handleScreenshotAndTweet}
          className="mt-6 cursor-pointer h-[150px] w-[150px] md:h-[120px] md:w-[120px] justify-end items-end rounded-xl bg-gray-400 flex flex-row items-center justify-center z-[1]"
        >
          <img
            className="h-[100px] w-[100px] md:h-[80px] md:w-[80px]"
            alt=""
            src="/icon--x.svg"
          />
        </div>
      </div>
    </Modal>
  );

  // if (hasAccess === null) {
  //   return (
  //     <div className="flex flex-col justify-center items-center min-h-[calc(100vh-172px)] z-100 bg-layer-1 font-gilroy-semibold">
  //       <div
  //         className="rounded-3xl"
  //         style={{
  //           backgroundImage: "url('/rectangle-17@2x.png')",
  //           backgroundSize: "cover",
  //           backgroundRepeat: "no-repeat",
  //           backgroundPosition: "top",
  //         }}
  //       >
  //         <div className="flex justify-center items-center flex-col p-12">
  //           <p className="text-xl text-white">
  //             Prove that you are a Pophead holder.
  //           </p>

  //           <div className="flex justify-center items-center w-[250px] h-[50px] rounded-lg bg-primary cursor-pointer font-semibold text-center text-lg text-black transition ease-in-out duration-300">
  //             <WalletMultiButtonDynamic
  //               style={{
  //                 width: "100%",
  //                 backgroundColor: "transparent",
  //                 color: "black",
  //               }}
  //               className="mt-0.5 w-[100%]"
  //             >
  //               CONNECT WALLET
  //             </WalletMultiButtonDynamic>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!hasAccess) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[calc(100vh-172px)] z-100 bg-layer-1 font-gilroy-semibold">
  //       <div
  //         className="rounded-3xl"
  //         style={{
  //           backgroundImage: "url('/rectangle-17@2x.png')",
  //           backgroundSize: "cover",
  //           backgroundRepeat: "no-repeat",
  //           backgroundPosition: "top",
  //         }}
  //       >
  //         <div className="flex justify-center items-center flex-col p-12">
  //           <p className="text-xl text-white">
  //             Access Denied: Your wallet is not on the list.
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="overflow-hidden">
      {ModalDetails}
      <Head>
        <title>Stakera | Lottery</title>
        <meta
          name="description"
          content="A lossless lottery platform built on Solana Liquidity Staking"
        />
        <meta
          name="keywords"
          content="Stakera, lottery, lossless, crypto, win, blockchain, solana"
        />{" "}
        {/* SEO keywords */}
        <meta name="author" content="Stakera Team" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="Stakera | Lottery" />
        <meta
          property="og:description"
          content="A lossless lottery platform built on Solana Liquidity Staking"
        />
        <meta property="og:image" content="/stakerameta.png" />
        <meta property="og:url" content="https://stakera.io/lottery" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stakera" />
        <meta
          name="twitter:description"
          content="A lossless lottery platform built on Solana Liquidity Staking"
        />
        <meta name="twitter:image" content="/stakerameta.png" />
        <link rel="icon" href="/logoico.png" />
      </Head>

      <div className="flex justify-center items-top min-h-[calc(100vh-172px)] z-100 bg-layer-1 ">
        <div className="w-[95%] max-w-[1550px]">
          <div className="w-full  bg-layer-1 overflow-hidden text-left text-base text-neutral-06 font-gilroy-bold">
            <div
              className="lg:hidden flex rounded-2xl w-full flex lg:flex-row flex-col lg:gap-0 md:gap-4 items-center justify-between p-4 box-border text-13xl  font-gilroy-semibold"
              style={{
                backgroundImage: "url('/frame-2085660298@3x.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top",
              }}
            >
              <div className="w-full flex flex-col md:items-center items-start justify-between py-4 gap-[8px] md:rounded-2xl [backdrop-filter:blur(20px)] rounded-2xl">
                <div className="px-4 flex flex-row gap-[16px]">
                  <div className="relative group profile-picture-container w-16 h-16">
                    {/* Display the current profile image */}
                    <img
                      className={`w-16 h-16 rounded-full object-cover cursor-pointer ${
                        profileImage === defaultImage
                          ? "drop-shadow-[0_0_20px_rgba(111,255,144,0.7)]"
                          : ""
                      }`}
                      alt="Profile"
                      src={profileImage}
                      onClick={handleImageClick} // Trigger file input when image is clicked
                    />

                    {/* Hidden file input to select new image */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef} // Attach reference to file input
                      style={{ display: "none" }} // Hide the file input
                      onChange={handleImageChange} // Handle image selection
                    />
                    {profileImage !== defaultImage && (
                      <div
                        className="absolute text-sm top-0 right-0 p-0 bg-transparent text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveImage}
                      >
                        ✕
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-start gap-[4px] ">
                    <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                      Welcome{" "}
                      {participantData && participantDataMongo?.nickName
                        ? `${participantDataMongo.nickName},`
                        : ""}
                    </div>

                    <div className=" text-lg tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block">
                      May the odds be in your favour
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-4/5 py-2 px-4 rounded-2xl flex flex-col items-center justify-center  box-border text-base font-gilroy-medium ">
                  <div className="self-stretch flex md:flex-row flex-col items-start justify-center gap-[32px] ">
                    <div className="w-1/3 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                      <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                        Pool TVL
                      </div>
                      <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                        {selectedPool === "POOL1" ? (
                          <span>
                            {isNaN(
                              Number(lotteryAccountData?.totalDeposits) /
                                LAMPORTS_PER_SOL
                            )
                              ? 0
                              : (
                                  Number(lotteryAccountData?.totalDeposits) /
                                  LAMPORTS_PER_SOL
                                ).toFixed(2)}{" "}
                          </span>
                        ) : (
                          <span>
                            {isNaN(
                              Number(lotteryAccountData2?.totalDeposits) /
                                LAMPORTS_PER_SOL
                            ) ||
                            isNaN(
                              Number(lotteryAccountData2?.lstLotteryDeposits) /
                                LAMPORTS_PER_SOL
                            ) ||
                            Number(currentPrice) === 0 ||
                            isNaN(Number(currentPrice))
                              ? 0 // Fallback value if any number is invalid or if currentPrice is 0
                              : (
                                  Number(lotteryAccountData2?.totalDeposits) /
                                    LAMPORTS_PER_SOL +
                                  (1 / Number(currentPrice)) *
                                    (Number(
                                      lotteryAccountData2?.lstLotteryDeposits
                                    ) /
                                      LAMPORTS_PER_SOL)
                                ).toFixed(2)}{" "}
                          </span>
                        )}
                        <span className="text-lg">SOL</span>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-row">
                      <div className="md:w-full w-1/2 flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                        <div className=" tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                          Your Stake
                        </div>
                        <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                          {selectedPool === "POOL1" ? (
                            <span>
                              {isNaN(
                                (Number(participantData?.deposit) +
                                  Number(participantData?.pendingDeposit)) /
                                  LAMPORTS_PER_SOL
                              )
                                ? 0
                                : (
                                    (Number(participantData?.deposit) +
                                      Number(participantData?.pendingDeposit)) /
                                    LAMPORTS_PER_SOL
                                  ).toFixed(2)}{" "}
                            </span>
                          ) : (
                            <span>
                              {isNaN(
                                (Number(participantData2?.deposit) +
                                  Number(participantData2?.pendingDeposit)) /
                                  LAMPORTS_PER_SOL
                              ) ||
                              Number(currentPrice) === 0 ||
                              isNaN(Number(currentPrice)) ||
                              Number(participantData2?.lstLotteryDeposits) === 0
                                ? 0 // Fallback value if the calculation results in NaN or if currentPrice is 0 or NaN
                                : (
                                    (Number(participantData2?.deposit) +
                                      Number(participantData2?.pendingDeposit) +
                                      (1 / Number(currentPrice)) *
                                        Number(
                                          participantData2?.lstLotteryDeposits
                                        )) /
                                    LAMPORTS_PER_SOL
                                  ).toFixed(2)}{" "}
                            </span>
                          )}

                          <span className="text-lg">SOL</span>
                        </div>
                      </div>
                      <div className="md:w-full w-1/2 flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                        <div className="self-stretch  tracking-[-0.03em] leading-[120.41%]">
                          <span className="opacity-[0.5]"> Your Winnings </span>{" "}
                          <IoMdInformationCircle
                            onClick={handleToggleModal} // Toggle modal on click
                            className={`inline-block cursor-pointer ${isModalOpen ? "text-primary" : "opacity-[0.5]"}`}
                          />
                          {isModalOpen && (
                            <div className="absolute right-0 mt-1 w-64 p-4 bg-bg rounded-lg shadow-lg z-1000">
                              <h3 className="text-xl mb-4 text-left flex item-start justify-start">
                                Winnings History
                              </h3>
                              {userWinningsHistory.length > 0 ? (
                                <div>
                                  {userWinningsHistory.map((winning, index) => (
                                    <div
                                      key={index}
                                      className="mb-2 flex justify-between"
                                    >
                                      <div>
                                        {winning.lotteryType === "small"
                                          ? "Small Lottery"
                                          : "Big Lottery"}
                                        :{" "}
                                        {(
                                          winning.yieldAmount / LAMPORTS_PER_SOL
                                        ).toFixed(2)}{" "}
                                        SOL{" "}
                                        <span className="opacity-[0.5]">
                                          on{" "}
                                          {new Date(
                                            winning.timestamp
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div>
                                        <img
                                          className="cursor-pointer w-[16px] relative h-[16px] overflow-hidden shrink-0 opacity-[0.5] mr-1"
                                          alt=""
                                          src="/icon--x.svg"
                                          onClick={() => {
                                            setCurrentItem(winning);
                                            setIsModal2Open(true);
                                          }}
                                        />
                                        <a
                                          href={`https://solscan.io/tx/${winning.transactionSignature}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="hover:underline"
                                        >
                                          <img
                                            className="w-4 h-4"
                                            alt=""
                                            src="/vuesaxlinearlink.svg"
                                          />
                                        </a>{" "}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>No winnings history available.</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                          <span>
                            {userWinnings?.smallWinnings
                              ? isNaN(
                                  userWinnings.smallWinnings +
                                    userWinnings.bigWinnings
                                )
                                ? 0
                                : (
                                    (userWinnings.smallWinnings +
                                      userWinnings.bigWinnings) /
                                    LAMPORTS_PER_SOL
                                  ).toFixed(3)
                              : 0}
                          </span>{" "}
                          <span className="text-lg">SOL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="hidden lg:flex rounded-2xl w-full flex lg:flex-row flex-col lg:gap-0 md:gap-4 items-center justify-between py-2 px-6 box-border text-13xl font-gilroy-semibold"
              style={{
                backgroundImage: "url('/frame-2085660298@3x.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top",
              }}
            >
              <div className="flex flex-row items-center justify-start py-6 px-2 gap-[16px] md:rounded-2xl  lg:[backdrop-filter:blur(0px)] md:[backdrop-filter:blur(20px)] rounded-2xl">
                <div className="relative group profile-picture-container w-16 h-16">
                  {/* Display the current profile image */}
                  <img
                    className={`w-16 h-16 rounded-full object-cover cursor-pointer ${
                      profileImage === defaultImage
                        ? "drop-shadow-[0_0_20px_rgba(111,255,144,0.6)]"
                        : ""
                    }`}
                    alt="Profile"
                    src={profileImage}
                    onClick={handleImageClick} // Trigger file input when image is clicked
                  />

                  {/* Hidden file input to select new image */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef} // Attach reference to file input
                    style={{ display: "none" }} // Hide the file input
                    onChange={handleImageChange} // Handle image selection
                  />
                  {profileImage !== defaultImage && (
                    <div
                      className="absolute text-sm top-0 right-0 p-0 bg-transparent text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveImage}
                    >
                      ✕
                    </div>
                  )}
                </div>
                <div className="w-[226px] flex flex-col items-start justify-start gap-[4px] ">
                  <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                    Welcome{" "}
                    {participantData && participantDataMongo?.nickName
                      ? `${participantDataMongo.nickName},`
                      : ""}
                  </div>

                  <div className="w-[255px]  text-lg tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block">
                    May the odds be in your favour
                  </div>
                </div>
              </div>
              <div className="lg:w-[55%] md:w-4/5 py-2 px-8 [backdrop-filter:blur(20px)] rounded-2xl bg-darkslategray-200 h-[90px] flex flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                <div className="self-stretch flex flex-row items-center justify-center gap-[32px] ">
                  <div className="flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                      Pool TVL
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      {selectedPool === "POOL1" ? (
                        <span>
                          {isNaN(
                            Number(lotteryAccountData?.totalDeposits) /
                              LAMPORTS_PER_SOL
                          )
                            ? 0
                            : (
                                Number(lotteryAccountData?.totalDeposits) /
                                LAMPORTS_PER_SOL
                              ).toFixed(2)}{" "}
                        </span>
                      ) : (
                        <span>
                          {isNaN(
                            Number(lotteryAccountData2?.totalDeposits) /
                              LAMPORTS_PER_SOL
                          ) ||
                          isNaN(
                            Number(lotteryAccountData2?.lstLotteryDeposits) /
                              LAMPORTS_PER_SOL
                          ) ||
                          Number(currentPrice) === 0 ||
                          isNaN(Number(currentPrice))
                            ? 0 // Fallback value if any number is invalid or if currentPrice is 0
                            : (
                                Number(lotteryAccountData2?.totalDeposits) /
                                  LAMPORTS_PER_SOL +
                                (1 / Number(currentPrice)) *
                                  (Number(
                                    lotteryAccountData2?.lstLotteryDeposits
                                  ) /
                                    LAMPORTS_PER_SOL)
                              ).toFixed(2)}{" "}
                        </span>
                      )}
                      <span className="text-lg">SOL</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                    <div className=" tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                      Your Stake
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      {selectedPool === "POOL1" ? (
                        <span>
                          {isNaN(
                            (Number(participantData?.deposit) +
                              Number(participantData?.pendingDeposit)) /
                              LAMPORTS_PER_SOL
                          )
                            ? 0
                            : (
                                (Number(participantData?.deposit) +
                                  Number(participantData?.pendingDeposit)) /
                                LAMPORTS_PER_SOL
                              ).toFixed(2)}{" "}
                        </span>
                      ) : (
                        <span>
                          {isNaN(
                            (Number(participantData2?.deposit) +
                              Number(participantData2?.pendingDeposit)) /
                              LAMPORTS_PER_SOL
                          ) ||
                          Number(currentPrice) === 0 ||
                          isNaN(Number(currentPrice)) ||
                          Number(participantData2?.lstLotteryDeposits) === 0
                            ? 0 // Fallback value if the calculation results in NaN or if currentPrice is 0 or NaN
                            : (
                                (Number(participantData2?.deposit) +
                                  Number(participantData2?.pendingDeposit) +
                                  (1 / Number(currentPrice)) *
                                    Number(
                                      participantData2?.lstLotteryDeposits
                                    )) /
                                LAMPORTS_PER_SOL
                              ).toFixed(2)}{" "}
                        </span>
                      )}
                      <span className="text-lg"> SOL</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] ">
                      <span className="opacity-[0.5]"> Your Winnings </span>{" "}
                      <IoMdInformationCircle
                        onClick={handleToggleModal} // Toggle modal on click
                        className={`inline-block cursor-pointer ${isModalOpen ? "text-primary" : "opacity-[0.5]"}`}
                      />
                      {isModalOpen && (
                        <div className="absolute right-32 mt-1 w-80 p-4 bg-bg rounded-lg shadow-lg z-1000">
                          <h3 className="text-xl mb-4 text-left flex item-start justify-start">
                            Winnings History
                          </h3>
                          {userWinningsHistory.length > 0 ? (
                            <div>
                              {userWinningsHistory.map((winning, index) => (
                                <div
                                  key={index}
                                  className="mb-2 flex justify-between"
                                >
                                  <div>
                                    {winning.lotteryType === "small"
                                      ? "Small Lottery"
                                      : "Big Lottery"}
                                    :{" "}
                                    {(
                                      winning.yieldAmount / LAMPORTS_PER_SOL
                                    ).toFixed(2)}{" "}
                                    SOL{" "}
                                    <span className="opacity-[0.5]">
                                      on{" "}
                                      {new Date(
                                        winning.timestamp
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>
                                    <img
                                      className="cursor-pointer w-[16px] relative h-[16px] overflow-hidden shrink-0 opacity-[0.5] mr-1"
                                      alt=""
                                      src="/icon--x.svg"
                                      onClick={() => {
                                        setCurrentItem(winning);
                                        setIsModal2Open(true);
                                      }}
                                    />
                                    <a
                                      href={`https://solscan.io/tx/${winning.transactionSignature}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:underline"
                                    >
                                      <img
                                        className="w-4 h-4"
                                        alt=""
                                        src="/vuesaxlinearlink.svg"
                                      />
                                    </a>{" "}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No winnings history available.</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      <span>
                        {userWinnings?.smallWinnings
                          ? isNaN(
                              userWinnings.smallWinnings +
                                userWinnings.bigWinnings
                            )
                            ? 0
                            : (
                                (userWinnings.smallWinnings +
                                  userWinnings.bigWinnings) /
                                LAMPORTS_PER_SOL
                              ).toFixed(3)
                          : 0}
                      </span>{" "}
                      <span className="text-lg"> SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex md:flex-row flex-col gap-6 mt-6">
              <div className="flex flex-col gap-6 lg:w-[34%] md:w-[44%]">
                <div className=" flex-1 rounded-2xl bg-bg flex flex-col items-between justify-start py-6 px-5 md:p-6 box-border gap-[16px] text-gray-200 font-gilroy-regular">
                  <div className="self-stretch flex flex-row items-center justify-between">
                    <div className="text-[18px] text-neutral-06 tracking-[-0.03em] font-gilroy-regular ">
                      Lottery Pool
                    </div>
                    <div className="text-[12px] text-primary flex flex-row gap-2">
                      <div
                        id="pool1"
                        onClick={() => setSelectedPool("POOL1")}
                        className={`cursor-pointer rounded-981xl bg-gray-100  py-1.5 px-2.5   inline-block h-3.5 flex justify-center items-center font-gilroy-semibold ${
                          selectedPool === "POOL1"
                            ? "bg-mediumspringgreen-100  text-primary transition-all duration-200"
                            : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                        }`}
                      >
                        Pool 1
                      </div>
                      <Tooltip
                        anchorSelect="#pool1"
                        place="top"
                        className="p-4 w-[260px] bg-gray-800 text-white rounded-lg shadow-lg font-gilroy-medium" // 40px * 2.94 = 117px
                      >
                        In Pool One, all of the yield generated from staking is pooled into the lottery. This means that 100% of the staking rewards are used to create the prize pool.
                      </Tooltip>
                      <div
                        id="pool2"
                        onClick={() => setSelectedPool("POOL2")}
                        className={`cursor-pointer rounded-981xl bg-gray-100  py-1.5 px-2.5   inline-block h-3.5 flex justify-center items-center font-gilroy-semibold ${
                          selectedPool === "POOL2"
                            ? "bg-mediumspringgreen-100  text-primary transition-all duration-200"
                            : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                        }`}
                      >
                        {" "}
                        Pool 2
                      </div>
                      <Tooltip
                        anchorSelect="#pool2"
                        place="top"
                        className="p-4 bg-gray-800 text-white rounded-lg shadow-lg font-gilroy-medium" // 40px * 2.94 = 117px
                      >
                        Pool Two offers a balanced approach. Here, 50% of the yield generated is kept as individual staking rewards for participants, while the remaining 50% goes into the lottery pool.
                      </Tooltip>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-row items-center justify-between text-[20px] text-neutral-06 font-gilroy-semibold">
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Enter Draw
                    </div>
                    <div className="rounded-981xl bg-mediumspringgreen-100 flex flex-row items-center justify-center py-2 px-3 text-[13px] text-primary">
                      <div className="leading-[120%] inline-block h-3.5 flex justify-center items-center">
                        {selectedPool === "POOL1" ? (
                          <span>Lottery {result?.toFixed(1)}%</span>
                        ) : (
                          <span>
                            Lottery {(result / 2)?.toFixed(1)}%, Yield{" "}
                            {(result / 2)?.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch rounded-lg bg-gray-100 flex flex-row items-center justify-start p-1 text-neutral-06 font-gilroy-semibold">
                    <div
                      className={`cursor-pointer flex-1 rounded-lg overflow-hidden flex flex-row items-center justify-center p-2 transition-background ${
                        selectedStake === "DEPOSIT"
                          ? "bg-bg text-white"
                          : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                      }`}
                      onClick={() => setSelectedStake("DEPOSIT")}
                    >
                      Deposit
                    </div>
                    <div
                      className={`cursor-pointer flex-1 rounded-lg flex flex-row items-center justify-center p-2 transition-background ${
                        selectedStake === "WITHDRAW"
                          ? "bg-bg text-white"
                          : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                      }`}
                      onClick={() => setSelectedStake("WITHDRAW")}
                    >
                      Withdraw
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start text-sm">
                    <div className="self-stretch rounded-2xl bg-gray-100 flex flex-row items-center justify-between gap-[2] p-4 box-border">
                      <div className="flex flex-col items-start justify-center gap-[8px]">
                        <div className="tracking-[-0.03em] leading-[120.41%]">
                          You are{" "}
                          {selectedStake === "DEPOSIT"
                            ? "depositing"
                            : "withdrawing"}
                        </div>
                        <div className="rounded-lg overflow-hidden flex flex-row items-center justify-center gap-[10.3px] text-lg text-neutral-06 font-gilroy-semibold">
                          <img
                            className="w-10 rounded-981xl h-10 overflow-hidden shrink-0 object-cover"
                            alt=""
                            src="/tokeneth@2x.png"
                          />
                          <div className="tracking-[-0.21px]">SOL</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-end gap-1">
                        <div className="flex flew-row gap-2">
                          <div className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-50 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary">
                            <div
                              onClick={() => handleAmountClick("HALF")}
                              className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center"
                            >
                              HALF
                            </div>
                          </div>
                          <div className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-50 transition-all duration-200 ease-in-out  flex flex-row items-center justify-center py-1 px-2 text-sm text-primary">
                            <div
                              onClick={() => handleAmountClick("MAX")}
                              className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center"
                            >
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
                    </div>
                  </div>
                  <>
                    {!publicKey ? (
                      <div className="flex justify-center items-center w-full h-[50px] rounded-lg bg-primary cursor-pointer font-semibold text-center text-lg text-black transition ease-in-out duration-300">
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
                        {loading ? (
                          <div className="flex justify-center items-center w-full h-[50px] rounded-lg opacity-[0.5]  bg-primary cursor-not-allowed font-semibold text-center text-lg text-black transition ease-in-out duration-300">
                            <ClipLoader size={20} color={"#000000"} />
                          </div>
                        ) : (
                          <>
                            {isAmountValid &&
                            selectedStake === "DEPOSIT" &&
                            lotteryAccountData?.weeklyHour <
                              lotteryAccountData?.maxWeeklyHour ? (
                              <button
                                className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                                onClick={handleDeposit}
                              >
                                <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                  Deposit
                                </div>
                                <img
                                  src="/cat_money.png"
                                  className="animated-img"
                                  alt="animated-image"
                                />

                                {waves.map((wave) => (
                                  <span
                                    key={wave.key}
                                    className="wave-effect"
                                    style={{
                                      width: wave.size,
                                      height: wave.size,
                                      top: wave.y,
                                      left: wave.x,
                                    }}
                                  />
                                ))}
                              </button>
                            ) : (
                              selectedStake === "DEPOSIT" && (
                                <div className="transition ease-in-out duration-300 self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-[0.5] text-lg text-bg font-gilroy-semibold">
                                  <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                    {lotteryAccountData?.weeklyHour >=
                                    lotteryAccountData?.maxWeeklyHour
                                      ? "Wait until next Draw"
                                      : "Deposit"}
                                  </div>
                                </div>
                              )
                            )}
                            {isAmountValid && selectedStake === "WITHDRAW" ? (
                              <button
                                className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                                onClick={handleWithdrawDecision}
                                // onClick={handleTeamWithdraw}
                              >
                                <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                  Withdraw
                                </div>
                                <img
                                  src="/cat_withdraw.png"
                                  className="animated-img"
                                  alt="animated-image"
                                />

                                {waves.map((wave) => (
                                  <span
                                    key={wave.key}
                                    className="wave-effect"
                                    style={{
                                      width: wave.size,
                                      height: wave.size,
                                      top: wave.y,
                                      left: wave.x,
                                    }}
                                  />
                                ))}
                              </button>
                            ) : (
                              selectedStake === "WITHDRAW" && (
                                <div className="transition ease-in-out duration-300 self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-[0.5] text-lg text-bg font-gilroy-semibold">
                                  <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                    Withdraw
                                  </div>
                                </div>
                              )
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                  <div className="self-stretch flex flex-row items-center justify-between">
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Settings
                    </div>
                    <div className="rounded-981xl flex flex-row items-center justify-start py-0.5 px-0 gap-[4px]">
                      <img
                        className="cursor-pointer w-full h-full"
                        onClick={toggleAdditionalDiv1}
                        alt="Candle Icon"
                        src="/vuesaxboldcandle2.svg"
                      />
                    </div>
                  </div>
                  <div
                    className={`w-full flex flex-row items-center justify-between gap-[8px]  ${showAdditionalDiv1 ? "" : "hidden"}`}
                  >
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Slippage
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start">
                      <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
                        <button
                          onClick={() => handleButtonClick(1)}
                          className={`cursor-pointer w-1/3 rounded h-6 flex flex-col items-center justify-center box-border transition-all duration-200 ease-in-out ${
                            activeButton === 1
                              ? "bg-primary"
                              : "bg-[#ffffff12] hover:bg-[#ffffff36] text-gray-200"
                          }`}
                        >
                          0.1%
                        </button>
                        <button
                          onClick={() => handleButtonClick(2)}
                          className={`cursor-pointer w-1/3 rounded h-6 flex flex-col items-center justify-center box-border transition-all duration-200 ease-in-out ${
                            activeButton === 2
                              ? "bg-primary"
                              : "bg-[#ffffff12] hover:bg-[#ffffff36] text-gray-200"
                          }`}
                        >
                          0.3%
                        </button>
                        <button
                          onClick={() => handleButtonClick(3)}
                          className={`cursor-pointer w-1/3 rounded h-6 flex flex-col items-center justify-center box-border transition-all duration-200 ease-in-out ${
                            activeButton === 3
                              ? "bg-primary"
                              : "bg-[#ffffff12] hover:bg-[#ffffff36] text-gray-200"
                          }`}
                        >
                          0.5%
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-full flex flex-row items-end justify-between gap-[8px] ${showAdditionalDiv1 ? "" : "hidden"}`}
                  >
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Depeg Protection
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start">
                      <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
                        <label className="toggle-switch-bigger">
                          <input
                            type="checkbox"
                            checked={depegProtectionState}
                            onChange={handleToggle}
                            className="hidden"
                          />
                          <div
                            className={`slider-bigger ${depegProtectionState ? "active" : ""}`}
                          ></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-row items-center justify-between">
                    <div className="w-[74px] tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                      Balance
                    </div>
                    <div className="flex flex-row items-center justify-start gap-[8px]">
                      <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                        {balance.toFixed(1)} SOL
                      </div>
                      <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldwallet2.svg"
                      />
                    </div>
                  </div>

                  <div className="self-stretch h-6 flex flex-row items-center justify-between">
                    <div>
                      <span id="winningChance" className="cursor-pointer">
                        Winning Chance Δ
                      </span>

                      <Tooltip
                        className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                        anchorSelect="#winningChance"
                        place="top"
                        content="This represents the change in your winning chance compared to current chance."
                      />
                    </div>
                    <div className="rounded-981xl flex flex-row items-center justify-start py-0.5 px-0 gap-[4px]">
                      <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                        {winningNewChance}
                      </div>
                      <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldmedalstar.svg"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="md:flex hidden max-h-[200px] flex-1 flex flex-col p-6 gap-3 rounded-2xl  overflow-hidden"
                  style={{
                    backgroundImage: "url('/frame-2085660304@3x.png')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "top",
                  }}
                >
                  <div className="text-xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                    Refer your friends
                  </div>
                  <span className="text-mini tracking-[-0.03em] leading-[130%] font-gilroy-regular text-gray-300 inline-block">
                    For each friend you refer you will increase your Points
                    rewards
                  </span>
                  <div className="w-full font-gilroy-semibold flex md:flex-row flex-col justify-between gap-4">
                    {participantDataMongo ? (
                      // If participantDataMongo exists, show referral code with copy button
                      <div className="h-9 [backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-full flex flex-row items-center justify-between pl-2 box-border gap-[8px]">
                        <div className="z-[0]">
                          {" "}
                          {participantDataMongo?.referralCode}
                        </div>
                        <div
                          onClick={handleCopyClick}
                          className="cursor-pointer h-full w-9 justify-end items-end rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none bg-gray-400 flex flex-row items-center justify-center z-[1]"
                        >
                          <img
                            className="w-6 h-6"
                            alt=""
                            src="/vuesaxbulkcopy.svg"
                          />
                        </div>
                      </div>
                    ) : (
                      // If participantDataMongo does not exist, show 'Create Ref' message
                      <div className="w-full h-9  [backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-full flex flex-row items-center justify-center pl-2 box-border gap-[8px]">
                        <div className="z-[0] w-full"> Soon™ </div>
                      </div>

                      // <a
                      //   href="/points"
                      //   target="_blank"
                      //   rel="noreferrer"
                      //   className="text-center no-underline text-white w-full"
                      // >
                      //   <div className="w-full h-9  [backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-full flex flex-row items-center justify-center pl-2 box-border gap-[8px]">
                      //     <div className="z-[0] w-full"> Create Ref </div>
                      //   </div>{" "}
                      // </a>
                    )}

                    {/* <div className="flex flex-row items-center justify-start gap-[9px]">
                        <img
                          className="w-6 h-6 opacity-[0.5]"
                          alt=""
                          src="/vuesaxbolddollarcircle.svg"
                        />
                        <div className="tracking-[-0.03em] leading-[130%]">
                          0.0 SOL
                        </div>
                      </div> */}
                    <div className="flex flex-row items-center justify-start">
                      <img
                        className="w-6 h-6 opacity-[0.5]"
                        alt=""
                        src="/vuesaxboldprofile2user.svg"
                      />
                      <div className="tracking-[-0.03em] leading-[130%]">
                        {participantDataMongo?.referred_user}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[66%] md:w-[56%] flex flex-col lg:flex-row lg:gap-6">
                <div
                  className={` flex-1 rounded-2xl bg-bg flex flex-col items-start justify-start p-5 md:p-6 gap-[24px] text-neutral-06 ${currentLottery === "SMALL" ? "block" : "hidden"} lg:flex`}
                >
                  <div className="cursor-pointer lg:hidden flex font-gilroy-semibold self-stretch flex flex-row items-start justify-start text-lg text-primary ">
                    <div
                      onClick={() => toggleLottery("SMALL")}
                      className={` flex-1   h-10 flex flex-row items-center justify-center  px-2 transition-all duration-200 ease-in-out  ${
                        currentLottery === "SMALL"
                          ? " flex-1 h-10 flex flex-row items-center justify-center  px-2 border-b-[2px] border-solid border-short"
                          : " text-[#ffffff60] border-b-[2px] border-solid border-[#ffffff12]"
                      }`}
                    >
                      Small Lottery
                    </div>
                    <div
                      onClick={() => toggleLottery("BIG")}
                      className={`cursor-pointer flex-1   h-10 flex flex-row items-center justify-center px-2 transition-all duration-200 ease-in-out  ${
                        currentLottery === "BIG"
                          ? " flex-1 h-10 flex flex-row items-center justify-center  px-2 border-b-[2px] border-solid border-short"
                          : " text-[#ffffff60] border-b-[2px] border-solid border-[#ffffff12]"
                      }`}
                    >
                      <div
                        className={`flex justify-center items-center h-full w-full rounded-lg ${
                          currentLottery === "BIG" ? "" : ""
                        }`}
                      >
                        Big Lottery
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-black self-stretch rounded-2xl flex flex-col items-start justify-center p-6 gap-[24px]"
                    style={
                      selectedPool === "POOL1"
                        ? smallLotteryBgStyle
                        : smallLotteryBgStyle2
                    }
                  >
                    <div className="self-stretch flex flex-row items-start justify-between z-[1]">
                      <div className="tracking-[-0.03em] leading-[120.41%]">
                        Small Lottery
                      </div>
                      <div className=" tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        {selectedPool === "POOL1" ? (
                          <span>
                            {remainingTimeSmallLottery !== null
                              ? remainingTimeSmallLottery < 0
                                ? "Drawing any moment..."
                                : formatRemainingTime(remainingTimeSmallLottery)
                              : "Loading..."}
                          </span>
                        ) : (
                          <span>
                            {remainingTimeSmallLottery2 !== null
                              ? remainingTimeSmallLottery2 < 0
                                ? "Drawing any moment..."
                                : formatRemainingTime(
                                    remainingTimeSmallLottery2
                                  )
                              : "Loading..."}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[8px] z-[2] text-35xl font-gilroy-bold">
                      <div className="self-stretch tracking-[-0.03em] leading-[120.41%] inline-block h-[47px] shrink-0">
                        {selectedPool === "POOL1" ? (
                          <span>
                            {smallLotteryYield !== null
                              ? (
                                  smallLotteryYield.toFixed(0) /
                                  LAMPORTS_PER_SOL
                                ).toFixed(3)
                              : "0"}
                          </span>
                        ) : (
                          <span>
                            {smallLotteryYield2 !== null
                              ? (
                                  smallLotteryYield2.toFixed(0) /
                                  LAMPORTS_PER_SOL
                                ).toFixed(3)
                              : "0"}
                          </span>
                        )}
                        {/* Small Lottery APY */}{" "}
                        <span className="text-13xl">SOL</span>
                      </div>
                      <div className="self-stretch text-mid tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        <span id="currentInfo" className="cursor-pointer">
                          {winningChance} Chance
                        </span>

                        {/* Tooltip must be after the element */}
                        <Tooltip
                          anchorSelect="#currentInfo"
                          place="bottom"
                          content="This shows your current winning chance."
                          className="font-gilroy-regular max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-4 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                        />
                        {/* {
        !isNaN(Number(calculateWinningChanceNextWeek())) && Number(calculateWinningChanceNextWeek()) > 0
          ? (
            <>
              <span id="pendingInfo" className="cursor-pointer">
              {" + "} {calculateWinningChanceNextWeek()}% Pending
              </span>
              <Tooltip
                anchorSelect="#pendingInfo"
                place="bottom"
                content="This shows how much your winning chance will increase next week."
                className="font-gilroy-regular max-w-xs p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
              />
            </>
          )
          : ''
      } */}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start gap-[16px] text-3xl text-neutral-06 font-gilroy-bold">
                    <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                      Previous Winners
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-[24px] text-sm text-gray-200 font-gilroy-medium">
                      {smallLotteryWinners
                        .slice(0, 6) // Take only the latest 6 entries
                        .map((winner, index) => (
                          <div
                            key={index}
                            className="self-stretch flex flex-row items-start justify-start gap-[4px]"
                          >
                            <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                              <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                                {new Date(
                                  winner.timestamp
                                ).toLocaleDateString()}
                              </div>
                              <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                                <span
                                  className={
                                    winner.winner === publicKey?.toString()
                                      ? "text-primary"
                                      : ""
                                  }
                                >
                                  {" "}
                                  {winner.winner === publicKey?.toString()
                                    ? "You"
                                    : winner.nickName
                                      ? winner.nickName
                                      : formatPublicKey(winner.winner)}{" "}
                                  won{" "}
                                  {(
                                    winner.yieldAmount / LAMPORTS_PER_SOL
                                  ).toFixed(2)}{" "}
                                  SOL with{" "}
                                  {Number(winner.winningChance).toFixed(1)}%
                                  chance
                                </span>
                              </div>
                            </div>
                            <div>
                              {winner.winner === publicKey?.toString() && (
                                <img
                                  className="cursor-pointer w-[16px] relative h-[16px] overflow-hidden shrink-0 opacity-[0.5] mr-1"
                                  alt="Remove"
                                  src="/icon--x.svg"
                                  onClick={() => {
                                    setCurrentItem(winner);
                                    setIsModal2Open(true);
                                  }}
                                />
                              )}
                              <a
                                href={`https://solscan.io/tx/${winner.transactionSignature}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                              >
                                <img
                                  className="w-4 h-4"
                                  alt=""
                                  src="/vuesaxlinearlink.svg"
                                />
                              </a>{" "}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div
                  className={` flex-1 rounded-2xl bg-bg flex flex-col items-start justify-start p-5 md:p-6 gap-[24px] text-neutral-06 ${currentLottery === "BIG" ? "block" : "hidden"} lg:flex`}
                >
                  <div className="cursor-pointer lg:hidden flex font-gilroy-semibold self-stretch flex flex-row items-start justify-start text-lg text-primary ">
                    <div
                      onClick={() => toggleLottery("SMALL")}
                      className={`flex-1   h-10 flex flex-row items-center justify-center  px-2 transition-all duration-200 ease-in-out  ${
                        currentLottery === "SMALL"
                          ? "flex-1 h-10 flex flex-row items-center justify-center  px-2 border-b-[2px] border-solid border-short"
                          : "text-[#ffffff60] border-b-[2px] border-solid border-[#ffffff12]"
                      }`}
                    >
                      Small Lottery
                    </div>
                    <div
                      onClick={() => toggleLottery("BIG")}
                      className={`flex-1   h-10 flex flex-row items-center justify-center px-2 transition-all duration-200 ease-in-out  ${
                        currentLottery === "BIG"
                          ? "flex-1 h-10 flex flex-row items-center justify-center  px-2 border-b-[2px] border-solid border-short"
                          : "text-[#ffffff60] border-b-[2px] border-solid border-[#ffffff12]"
                      }`}
                    >
                      <div
                        className={`flex justify-center items-center h-full w-full rounded-lg ${
                          currentLottery === "BIG" ? "" : ""
                        }`}
                      >
                        Big Lottery
                      </div>
                    </div>
                  </div>
                  <div
                    className="self-stretch rounded-2xl flex flex-col items-start justify-center p-6 gap-[24px]"
                    style={
                      selectedPool === "POOL1"
                        ? bigLotteryBgStyle
                        : bigLotteryBgStyle2
                    }
                  >
                    <div className="self-stretch flex flex-row items-start justify-between ">
                      <div className="tracking-[-0.03em] leading-[120.41%]">
                        Big Lottery
                      </div>
                      <div className="tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        {selectedPool === "POOL1" ? (
                          <span>
                            {" "}
                            {remainingTimeBigLottery !== null
                              ? remainingTimeBigLottery < 0
                                ? "Drawing any moment..."
                                : formatRemainingTime(remainingTimeBigLottery)
                              : "Loading..."}
                          </span>
                        ) : (
                          <span>
                            {" "}
                            {remainingTimeBigLottery2 !== null
                              ? remainingTimeBigLottery2 < 0
                                ? "Drawing any moment..."
                                : formatRemainingTime(remainingTimeBigLottery2)
                              : "Loading..."}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[8px]  text-35xl font-gilroy-bold">
                      <div className="self-stretch tracking-[-0.03em] leading-[120.41%] inline-block h-[47px] shrink-0">
                        {selectedPool === "POOL1" ? (
                          <span>
                            {bigLotteryYield !== null
                              ? (
                                  bigLotteryYield.toFixed(0) / LAMPORTS_PER_SOL
                                ).toFixed(3)
                              : "0"}
                          </span>
                        ) : (
                          <span>
                            {bigLotteryYield2 !== null
                              ? (
                                  bigLotteryYield2.toFixed(0) / LAMPORTS_PER_SOL
                                ).toFixed(3)
                              : "0"}
                          </span>
                        )}
                        {/* Small Lottery APY */}{" "}
                        <span className="text-13xl">SOL</span>
                      </div>

                      <div className="self-stretch text-mid tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        <span
                          id="winningChanceBigInfo"
                          className="cursor-pointer"
                        >
                          {winningChanceBig} Chance
                        </span>
                        {/* Tooltip for Winning Chance with additional context */}
                        <Tooltip
                          anchorSelect="#winningChanceBigInfo"
                          place="bottom"
                          content="The longer you hold, the bigger your chances of winning. Holding since the beginning of lottery gives you a bigger advantage than depositing at the end."
                          className="font-gilroy-regular max-w-xs p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start gap-[16px] text-3xl font-gilroy-bold">
                    <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                      Previous Winners
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-[24px] text-sm text-gray-200 font-gilroy-medium">
                      {bigLotteryWinners

                        .slice(0, 6) // Take only the latest 6 entries
                        .map((winner, index) => (
                          <div
                            key={index}
                            className="self-stretch flex flex-row items-start justify-start gap-[4px]"
                          >
                            <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                              <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                                {new Date(
                                  winner.timestamp
                                ).toLocaleDateString()}
                              </div>
                              <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                                <span
                                  className={
                                    winner.winner === publicKey?.toString()
                                      ? "text-[#7363f3]"
                                      : ""
                                  }
                                >
                                  {" "}
                                  {winner.winner === publicKey?.toString()
                                    ? "You"
                                    : winner.nickName
                                      ? winner.nickName
                                      : formatPublicKey(winner.winner)}{" "}
                                  won{" "}
                                  {(
                                    winner.yieldAmount / LAMPORTS_PER_SOL
                                  ).toFixed(2)}{" "}
                                  SOL with{" "}
                                  {Number(winner.winningChance).toFixed(1)}%
                                  chance
                                </span>
                              </div>
                            </div>
                            <div>
                              {winner.winner === publicKey?.toString() && (
                                <img
                                  className="cursor-pointer w-[16px] relative h-[16px] overflow-hidden shrink-0 opacity-[0.5] mr-1"
                                  alt="Remove"
                                  src="/icon--x.svg"
                                  onClick={() => {
                                    setCurrentItem(winner);
                                    setIsModal2Open(true);
                                  }}
                                />
                              )}
                              <a
                                href={`https://solscan.io/tx/${winner.transactionSignature}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                              >
                                <img
                                  className="w-4 h-4"
                                  alt=""
                                  src="/vuesaxlinearlink.svg"
                                />
                              </a>
                            </div>{" "}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="md:hidden max-h-[200px] flex-1 flex flex-col p-5 gap-3 rounded-2xl  overflow-hidden"
                style={{
                  backgroundImage: "url('/frame-2085660304@3x.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top",
                }}
              >
                <div className="text-xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                  Refer your friends
                </div>
                <span className="text-mini tracking-[-0.03em] leading-[130%] font-gilroy-regular text-gray-300 inline-block">
                  For each friend you refer you will increase your Points
                  rewards
                </span>
                <div className="w-full font-gilroy-semibold flex flex-row justify-between gap-4">
                  {participantDataMongo ? (
                    // If participantDataMongo exists, show referral code with copy button
                    <div className="h-9 [backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-full flex flex-row items-center justify-between pl-2 box-border gap-[8px]">
                      <div className="z-[0]">
                        {" "}
                        {participantDataMongo?.referralCode}
                      </div>
                      <div
                        onClick={handleCopyClick}
                        className="cursor-pointer h-full w-9 justify-end items-end rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none bg-gray-400 flex flex-row items-center justify-center z-[1]"
                      >
                        <img
                          className="w-6 h-6"
                          alt=""
                          src="/vuesaxbulkcopy.svg"
                        />
                      </div>
                    </div>
                  ) : (
                    // If participantDataMongo does not exist, show 'Create Ref' message
                    <div className="w-full h-9  [backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-full flex flex-row items-center justify-center pl-2 box-border gap-[8px]">
                      <div className="z-[0] w-full"> Soon™ </div>
                    </div>
                    // <a
                    //   href="/points"
                    //   target="_blank"
                    //   rel="noreferrer"
                    //   className="text-center no-underline text-white w-full"
                    // >
                    //   <div className="w-full h-9  [backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-full flex flex-row items-center justify-center pl-2 box-border gap-[8px]">
                    //     <div className="z-[0] w-full"> Create Ref </div>
                    //   </div>{" "}
                    // </a>
                  )}

                  {/* <div className="flex flex-row items-center justify-start gap-[9px]">
                        <img
                          className="w-6 h-6 opacity-[0.5]"
                          alt=""
                          src="/vuesaxbolddollarcircle.svg"
                        />
                        <div className="tracking-[-0.03em] leading-[130%]">
                          0.0 SOL
                        </div>
                      </div> */}
                  <div className="flex flex-row items-center justify-start">
                    <img
                      className="w-6 h-6 opacity-[0.5]"
                      alt=""
                      src="/vuesaxboldprofile2user.svg"
                    />
                    <div className="tracking-[-0.03em] leading-[130%]">
                      {participantDataMongo?.referred_user}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lottery;
