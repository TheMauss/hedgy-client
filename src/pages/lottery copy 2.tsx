import Head from "next/head";
import { FC, useState, useEffect, useCallback } from "react";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { deposit as depositInstruction } from "../out/instructions"; // Update with the correct path
import { withdraw as withdrawInstruction } from "../out/instructions"; // Update with the correct path
import { withdrawWithRatioLoss as withdrawwithLossInstruction } from "../out/instructions"; // Update with the correct path
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

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const lotteryAccount = new PublicKey(
  "9tmVNiV4fPhnydBeF4Bt1vVr7LcT4KXVfBSrNNyMb64y"
); // Replace with actual account
const pdaHouseAcc = new PublicKey(
  "2LzexAXyFHdW24XiQdYKNfZhPPkdts5r2zuVMvYNf1op"
); // Replace with actual account
const whirlpoolProgram = new PublicKey(ORCA_WHIRLPOOL_PROGRAM_ID);
const tokenProgram = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
); // Replace with actual account
const tokenOwnerAccountA = new PublicKey(
  "EvLPNR55B2NUjkTKux3RLSAm2grUNJQTwrtmz2T2wrAW"
); // Replace with actual account
const tokenVaultA = new PublicKey(
  "9sxSBQ3bS35VgV736MaSJRX11MfZHXxTdU4Pc1JfA5ML"
); // Replace with actual account
const tokenOwnerAccountB = new PublicKey(
  "Hoo63hqHPXKUSYdcKiKCRDG95zDBwpPhip4oT6GbEbB3"
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

async function checkLotteryAccount(
  connection: Connection
): Promise<LotteryAccountJSON> {
  const lotteryAcc = new PublicKey(
    "9tmVNiV4fPhnydBeF4Bt1vVr7LcT4KXVfBSrNNyMb64y"
  ); // Replace with actual account
  const lotteryAccount = await LotteryAccount.fetch(connection, lotteryAcc);

  if (!lotteryAccount) {
    return {
      isInitialized: false,
      totalDeposits: "0",
      lstTotalDeposits: "0",
      participants: [],
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
  const [otherAmountThreshold, setOtherAmountThreshold] = useState(0);
  const [sqrtPriceLimit, setSqrtPriceLimit] = useState(0);
  const [amountSpecifiedIsInput, setAmountSpecifiedIsInput] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<Decimal | null>(null);
  const [swapQuote, setSwapQuote] = useState<any>(null);
  const [swapQuoteOut, setSwapQuoteOut] = useState<any>(null);
  const [swapQuoteOutLoss, setSwapQuoteOutLoss] = useState<any>(null);
  const [lotteryAccountData, setLotteryAccountData] =
    useState<LotteryAccountJSON | null>(null);
  const [participantData, setParticipantData] =
    useState<ParticipantJSON | null>(null);

  const [whirlpool, setWhirlpool] = useState<any>(null);
  const [aToB, setAToB] = useState(true);
  const wallet = useWallet();
  const [slippageTolerance, setSlippageTolerance] = useState(30); // Default to 0.1%
  const [activeButton, setActiveButton] = useState(3);
  const [customSlippage, setCustomSlippage] = useState("");
  const { isPriorityFee, setPriorityFee } = usePriorityFee();
  const [selectedStake, setSelectedStake] = useState<"DEPOSIT" | "WITHDRAW">(
    "DEPOSIT"
  );
  const [showAdditionalDiv1, setShowAdditionalDiv1] = useState(false);

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

  // Function to calculate the next Friday at 12 AM +1 UTC
  const getNextFriday = (currentDate: Date) => {
    const nextFriday = new Date(currentDate);
    nextFriday.setUTCHours(1, 0, 0, 0); // Set to 12 AM +1 UTC
    nextFriday.setDate(
      nextFriday.getDate() + ((5 - nextFriday.getUTCDay() + 7) % 7)
    );
    return nextFriday;
  };

  // Function to calculate the next 4th Friday at 12 AM +1 UTC
  const getNext4thFriday = (currentDate: Date) => {
    const next4thFriday = new Date(currentDate);
    next4thFriday.setUTCHours(1, 0, 0, 0); // Set to 12 AM +1 UTC
    let fridayCount = 0;
    while (fridayCount < 4) {
      next4thFriday.setDate(next4thFriday.getDate() + 1);
      if (next4thFriday.getUTCDay() === 5) {
        fridayCount++;
      }
    }
    return next4thFriday;
  };

  useEffect(() => {
    const now = new Date();

    const smallLotteryEndTime = getNextFriday(now).getTime() / 1000;
    const smallLotteryStartTime = smallLotteryEndTime - 7 * 24 * 60 * 60 + 60; // Starts one minute after the previous end time

    const bigLotteryEndTime = getNext4thFriday(now).getTime() / 1000;
    const bigLotteryStartTime = bigLotteryEndTime - 4 * 7 * 24 * 60 * 60 + 60; // Starts one minute after the previous end time

    const updateRemainingTimes = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
      setRemainingTimeSmallLottery(smallLotteryEndTime - now);
      setRemainingTimeBigLottery(bigLotteryEndTime - now);
      setTotalTimeSmallLottery(smallLotteryEndTime - smallLotteryStartTime);
      setTotalTimeBigLottery(bigLotteryEndTime - bigLotteryStartTime);
    };

    updateRemainingTimes();
    const interval = setInterval(updateRemainingTimes, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const formatRemainingTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    return `${days}D ${hours}H ${minutes}M ${secs}S`;
  };

  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);
    setShowAdditionalDiv1(!showAdditionalDiv1);

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

  const fetchLotteryAccountData = async () => {
    try {
      const data = await checkLotteryAccount(connection);
      console.log("rawdata", data);
      setLotteryAccountData(data);
      const participant = data.participants.find(
        (participant) => participant.pubkey === publicKey.toString()
      );
      setParticipantData(participant || null);
    } catch (error) {
      console.error("Error fetching lottery account data:", error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchLotteryAccountData();
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
            accountKeys: ["5jbj67vN9obgTPa4oGJ28pZGnCM8VHutmdH8S7yxho1V"],
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

      return responseData.result.priorityFeeLevels.high.toFixed(0);
    } catch (error) {
      console.error("Error fetching priority fee estimate:", error);
    }
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

  useEffect(() => {
    const whirlpoolAddress = new PublicKey(
      "DxD41srN8Xk9QfYjdNXF9tTnP6qQxeF2bZF8s1eN62Pe"
    );
    const fetchWhirlpoolData = async () => {
      try {
        const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);
        setWhirlpool(whirlpool);
        setCurrentPrice(price);

        const amountIn = new Decimal(amount); // Example amount, update as needed
        const PriceN = new Decimal(price);
        const amountOut = amountIn.times(PriceN);
        const amountOutQuote = new Decimal(amountOut);

        const quote = await getSwapQuote(
          whirlpool,
          amountIn,
          slippageTolerance
        );
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

        const formattedQuote = decodeSwapQuote(quote);
        const formattedQuoteOut = decodeSwapQuote(quoteOut);
        const formattedQuoteOutLoss = decodeSwapQuote(quoteOutLoss);

        setSwapQuote(formattedQuote);
        setSwapQuoteOut(formattedQuoteOut);
        setSwapQuoteOutLoss(formattedQuoteOutLoss);

        console.log("Current Pool Price:", price.toFixed(9));
        console.log("Formatted Swap Quote:", formattedQuote);
        console.log("Formatted Swap Quote Out:", formattedQuoteOut);
        console.log("Formatted Swap Quote Out Loss:", formattedQuoteOutLoss);
      } catch (error) {
        console.error("Failed to fetch whirlpool data:", error);
      }
    };

    fetchWhirlpoolData();
  }, [connection, slippageTolerance, amount]);

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

  const handleDeposit = async () => {
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
      tickArray0: new PublicKey("AwxPowdzKrseoM263eYKkDxqdcogJRZT1PqzUuPFcmig"),
      tickArray1: new PublicKey("4hn4fZA5CsHEoK9ZL3sagUbawNNXPtwtsPyPSPeUq5Hn"),
      tickArray2: new PublicKey("ASiDWqYZknwWEyeuBsug7VaDYB1K8MoNmbmRznEYyK97"),
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

    try {
      const ix = depositInstruction(depositArgs, depositAccounts);
      const tx = new Transaction().add(ix).add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Deposit transaction successful!",
        txid: signature,
      });
      fetchLotteryAccountData();
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
      tickArray0: new PublicKey("AwxPowdzKrseoM263eYKkDxqdcogJRZT1PqzUuPFcmig"),
      tickArray1: new PublicKey("4hn4fZA5CsHEoK9ZL3sagUbawNNXPtwtsPyPSPeUq5Hn"),
      tickArray2: new PublicKey("ASiDWqYZknwWEyeuBsug7VaDYB1K8MoNmbmRznEYyK97"),
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

    try {
      const ix = withdrawInstruction(withdrawArgs, withdrawAccounts);
      const tx = new Transaction().add(ix).add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdraw transaction successful!",
        txid: signature,
      });
      fetchLotteryAccountData();
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
      tickArray0: new PublicKey("AwxPowdzKrseoM263eYKkDxqdcogJRZT1PqzUuPFcmig"),
      tickArray1: new PublicKey("4hn4fZA5CsHEoK9ZL3sagUbawNNXPtwtsPyPSPeUq5Hn"),
      tickArray2: new PublicKey("ASiDWqYZknwWEyeuBsug7VaDYB1K8MoNmbmRznEYyK97"),
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

    try {
      const ix = withdrawwithLossInstruction(withdrawArgs, withdrawAccounts);
      const tx = new Transaction().add(ix).add(PRIORITY_FEE_IX);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Withdraw transaction successful!",
        txid: signature,
      });
      fetchLotteryAccountData();
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

    // Set the sanitized value as the amount value
    setAmount(sanitizedValue);
  };

  const handleWithdrawDecision = async () => {
    if (participantData && currentPrice && whirlpool) {
      const depositAmount = new BN(participantData.deposit);
      const lstDepositAmount = new BN(participantData.lstDeposits);
      const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);
      const swapRatio = 1 / price.toNumber(); // Example calculation, update as needed

      let amountIn;

      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const participantDeposit = Number(participantData?.deposit) || 0;

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
    }
  };

  const calculateValue = (value, multiplier) => {
    return value * multiplier;
  };

  const value = 8.53;
  const multiplier = 0.9;
  const result = calculateValue(value, multiplier);

  const isAmountValid = amount && parseFloat(amount) > 0;

  const calculateWinningNewChance = () => {
    const parsedAmount = parseFloat(amount);
    if (
      !lotteryAccountData ||
      Number(lotteryAccountData.totalDeposits) === 0 ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return "0.00%";
    }
    const totalDeposits =
      Number(lotteryAccountData.totalDeposits) / LAMPORTS_PER_SOL;
    const newTotal =
      selectedStake === "DEPOSIT"
        ? totalDeposits + parsedAmount
        : totalDeposits - parsedAmount;
    const newPerson =
      selectedStake === "DEPOSIT"
        ? Number(participantData?.deposit) / LAMPORTS_PER_SOL + parsedAmount
        : Number(participantData?.deposit) / LAMPORTS_PER_SOL - parsedAmount;
    const chance = (newPerson / newTotal) * 100;
    return `${chance.toFixed(2)}%`;
  };

  const calculateWinningChance = () => {
    if (!lotteryAccountData || Number(lotteryAccountData.totalDeposits) === 0) {
      return "0.00%";
    }
    const totalDeposits =
      Number(lotteryAccountData.totalDeposits) / LAMPORTS_PER_SOL;
    const Person = Number(participantData?.deposit) / LAMPORTS_PER_SOL;
    const chance = (Person / totalDeposits) * 100;
    return `${chance.toFixed(2)}%`;
  };

  const toggleAdditionalDiv1 = () => {
    setShowAdditionalDiv1(!showAdditionalDiv1);
  };

  const [randomImage, setRandomImage] = useState("");

  const getRandomImageName = () => {
    const images = ["ellipse-1@2x.png", "cat1.png", "cat4.png", "cat6.png"];
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

  return (
    <div className=" overflow-hidden">
      <Head>
        <title>PopFi | Lottery</title>
        <meta name="description" content="PopFi" />
      </Head>

      <div className="flex justify-center items-top min-h-[calc(100vh-182px)] z-100 bg-layer-1 ">
        <div className="w-[95%] xl:w-[80%] lg:w-[80%] md:w-[80%] sm:min-w-[95%] ">
          <div className=" w-full  bg-layer-1 overflow-hidden text-left text-base text-neutral-06 font-gilroy-bold">
            <div
              className="rounded-2xl w-full flex lg:flex-row flex-col lg:gap-0 md:gap-4 items-center justify-between p-4 box-border text-13xl font-gilroy-semibold"
              style={{
                backgroundImage: "url('/frame-2085660298@3x.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top",
              }}
            >
              <div className="flex flex-row items-center justify-start lg:p-6 py-6 px-8 gap-[16px] md:rounded-2xl  lg:[backdrop-filter:blur(0px)] md:[backdrop-filter:blur(20px)] rounded-2xl">
                <img
                  className="w-16  rounded-[50%] h-16 object-cover"
                  alt=""
                  src={`/${randomImage}`}
                />
                <div className="w-[226px] flex flex-col items-start justify-start gap-[4px] ">
                  <div className="self-stretch  tracking-[-0.03em] leading-[120.41%]">
                    Welcome back
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
                      Your Stake
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      <span>
                        {(
                          Number(participantData?.deposit) / LAMPORTS_PER_SOL
                        ).toFixed(2)}{" "}
                      </span>
                      <span className="text-lg">SOL</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                    <div className=" tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                      Your Small Winnings
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      <span>{`0.143 `}</span>
                      <span className="text-lg">SOL</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                      Your Big Winnings
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      <span>{`1.235 `}</span>
                      <span className="text-lg">SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex md:flex-row flex-col gap-6 mt-6">
              <div className="flex flex-col gap-6 lg:w-[34%] md:w-[44%]">
                <div className="min-h-[510px] flex-1 rounded-2xl bg-bg flex flex-col items-between justify-start p-6 box-border gap-[16px] text-gray-200 font-gilroy-regular">
                  <div className="self-stretch flex flex-row items-center justify-between text-5xl text-neutral-06 font-gilroy-semibold">
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Enter Draw
                    </div>
                    <div className="rounded-981xl bg-mediumspringgreen-100 flex flex-row items-center justify-center py-2 px-3 text-sm text-primary">
                      <div className="w-[100px] leading-[120%] inline-block h-3.5 flex justify-center items-center">
                        Est. APY {result.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch rounded-lg bg-gray-100 flex flex-row items-center justify-start p-1 text-neutral-06 font-gilroy-semibold">
                    <div
                      className={`cursor-pointer flex-1 rounded-lg overflow-hidden flex flex-row items-center justify-center p-2 transition-background ${
                        selectedStake === "DEPOSIT"
                          ? "bg-bg text-white"
                          : "bg-gray-100 text-gray-200"
                      }`}
                      onClick={() => setSelectedStake("DEPOSIT")}
                    >
                      Deposit
                    </div>
                    <div
                      className={`cursor-pointer flex-1 rounded-lg flex flex-row items-center justify-center p-2 transition-background ${
                        selectedStake === "WITHDRAW"
                          ? "bg-bg text-white"
                          : "bg-gray-100 text-gray-200"
                      }`}
                      onClick={() => setSelectedStake("WITHDRAW")}
                    >
                      Withdraw
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start text-sm">
                    <div className="self-stretch rounded-2xl bg-gray-100 h-[111px] flex flex-row items-center justify-between gap-[2] p-4 box-border">
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
                      <input
                        type="text"
                        className="w-1/3 input-capsule__input text-13xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold bg-black"
                        placeholder="0.00"
                        value={amount}
                        onChange={handleInputChange}
                        min={0.05}
                        step={0.05}
                      />
                    </div>
                  </div>
                  {!publicKey ? (
                    <div className="flex justify-center items-center w-full h-[50px] rounded-lg bg-primary cursor-pointer font-semibold text-center text-lg text-black transition ease-in-out duration-300">
                      <WalletMultiButtonDynamic
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                        className="w-[100%]"
                      >
                        CONNECT WALLET
                      </WalletMultiButtonDynamic>
                    </div>
                  ) : (
                    <>
                      {isAmountValid && selectedStake === "DEPOSIT" ? (
                        <button
                          className="cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                          onClick={handleDeposit}
                        >
                          <div className="tracking-[-0.03em] leading-[120.41%]">
                            Deposit
                          </div>
                        </button>
                      ) : (
                        selectedStake === "DEPOSIT" && (
                          <div className="self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-[0.5] text-lg text-bg font-gilroy-semibold">
                            <div className="tracking-[-0.03em] leading-[120.41%]">
                              Deposit
                            </div>
                          </div>
                        )
                      )}
                      {isAmountValid && selectedStake === "WITHDRAW" ? (
                        <button
                          className="cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                          onClick={handleWithdrawDecision}
                        >
                          <div className="tracking-[-0.03em] leading-[120.41%]">
                            Withdraw
                          </div>
                        </button>
                      ) : (
                        selectedStake === "WITHDRAW" && (
                          <div className="self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-[0.5] text-lg text-bg font-gilroy-semibold">
                            <div className="tracking-[-0.03em] leading-[120.41%]">
                              Withdraw
                            </div>
                          </div>
                        )
                      )}
                    </>
                  )}
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
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Slippage
                    </div>
                    <div className="rounded-981xl flex flex-row items-center justify-start py-0.5 px-0 gap-[4px]">
                      <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                        {slippageTolerance / 100}%
                      </div>
                      <img
                        className="cursor-pointer w-full h-full"
                        onClick={toggleAdditionalDiv1}
                        alt="Candle Icon"
                        src="/vuesaxboldcandle2.svg"
                      />
                    </div>
                  </div>
                  <div
                    className={`w-full flex flex-row items-end justify-end gap-[8px] ${showAdditionalDiv1 ? "" : "hidden"}`}
                  >
                    <div className="self-stretch flex flex-col items-start justify-start">
                      <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
                        <button
                          onClick={() => handleButtonClick(1)}
                          className={`w-1/3 rounded h-7 flex flex-col items-center justify-center box-border transition-all duration-200 ease-in-out ${
                            activeButton === 1
                              ? "bg-primary"
                              : "bg-[#ffffff24] hover:bg-[#ffffff36] text-gray-200"
                          }`}
                        >
                          0.1%
                        </button>
                        <button
                          onClick={() => handleButtonClick(2)}
                          className={`w-1/3 rounded h-7 flex flex-col items-center justify-center box-border transition-all duration-200 ease-in-out ${
                            activeButton === 2
                              ? "bg-primary"
                              : "bg-[#ffffff24] hover:bg-[#ffffff36] text-gray-200"
                          }`}
                        >
                          0.3%
                        </button>
                        <button
                          onClick={() => handleButtonClick(3)}
                          className={`w-1/3 rounded h-7 flex flex-col items-center justify-center box-border transition-all duration-200 ease-in-out ${
                            activeButton === 3
                              ? "bg-primary"
                              : "bg-[#ffffff24] hover:bg-[#ffffff36] text-gray-200"
                          }`}
                        >
                          0.5%
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch h-6 flex flex-row items-center justify-between">
                    <div className="tracking-[-0.03em] leading-[120.41%]">
                      Winning Chance
                    </div>
                    <div className="rounded-981xl flex flex-row items-center justify-start py-0.5 px-0 gap-[4px]">
                      <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                        {calculateWinningNewChance()}
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
                    Refer to increase your winnings
                  </div>
                  <span className="text-mini tracking-[-0.03em] leading-[130%] font-gilroy-regular text-gray-300 inline-block">
                    For each friend you refer you will increase your winnings by
                    0.1 SOL
                  </span>
                  <div className="font-gilroy-semibold flex xk:flex-row flex-col gap-4">
                    <div className="[backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-[213px] flex flex-row items-center justify-start p-2 box-border gap-[8px]">
                      <div className="tracking-[-0.03em] leading-[130%] z-[0]">
                        stakera.io/ref=1234
                      </div>
                      <div className="absolute w-9 !m-[0] top-[0px] right-[0px] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none bg-gray-400 h-[37px] flex flex-row items-center justify-center z-[1]">
                        <img
                          className="w-6 h-6"
                          alt=""
                          src="/vuesaxbulkcopy.svg"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-start gap-[32px]">
                      <div className="flex flex-row items-center justify-start gap-[9px]">
                        <img
                          className="w-6 h-6 opacity-[0.5]"
                          alt=""
                          src="/vuesaxbolddollarcircle.svg"
                        />
                        <div className="tracking-[-0.03em] leading-[130%]">
                          0.2 SOL
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-start gap-[6px]">
                        <img
                          className="w-6 h-6 opacity-[0.5]"
                          alt=""
                          src="/vuesaxboldprofile2user.svg"
                        />
                        <div className="tracking-[-0.03em] leading-[130%]">
                          2
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[66%] md:w-[56%] flex flex-col lg:flex-row lg:gap-6">
                <div
                  className={`cursor-pointer flex-1 rounded-2xl bg-bg flex flex-col items-start justify-start p-6 gap-[24px] text-neutral-06 ${currentLottery === "SMALL" ? "block" : "hidden"} lg:flex`}
                >
                  <div className="lg:hidden md:flex hidden font-gilroy-semibold self-stretch flex flex-row items-start justify-start text-lg text-primary ">
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
                    style={smallLotteryBgStyle}
                  >
                    <div className="self-stretch flex flex-row items-start justify-between z-[1]">
                      <div className="tracking-[-0.03em] leading-[120.41%]">
                        Small Lottery
                      </div>
                      <div className="tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        {remainingTimeSmallLottery !== null
                          ? formatRemainingTime(remainingTimeSmallLottery)
                          : "Loading..."}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[8px] z-[2] text-35xl font-gilroy-bold">
                      <div className="self-stretch tracking-[-0.03em] leading-[120.41%] inline-block h-[47px] shrink-0">
                        <span>{`1.288 `}</span>
                        <span className="text-13xl">SOL</span>
                      </div>
                      <div className="self-stretch text-mid tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        {calculateWinningChance()} Chance
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start gap-[16px] text-3xl text-neutral-06 font-gilroy-bold">
                    <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                      Previous Winners
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-[24px] text-sm text-gray-200 font-gilroy-medium">
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            maus won 1.2342 sSOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            alex won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`cursor-pointer flex-1 rounded-2xl bg-bg flex flex-col items-start justify-start p-6 gap-[24px] text-neutral-06 ${currentLottery === "BIG" ? "block" : "hidden"} lg:flex`}
                >
                  <div className="lg:hidden md:flex hidden font-gilroy-semibold self-stretch flex flex-row items-start justify-start text-lg text-primary ">
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
                    style={bigLotteryBgStyle}
                  >
                    <div className="self-stretch flex flex-row items-start justify-between z-[1]">
                      <div className="tracking-[-0.03em] leading-[120.41%]">
                        Big Lottery
                      </div>
                      <div className="tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        {remainingTimeBigLottery !== null
                          ? formatRemainingTime(remainingTimeBigLottery)
                          : "Loading..."}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[8px] z-[2] text-35xl font-gilroy-bold">
                      <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[47px] shrink-0">
                        <span>{`14.432 `}</span>
                        <span className="text-13xl">SOL</span>
                      </div>
                      <div className="self-stretch text-mid tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                        {calculateWinningChance()} Chance
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start gap-[16px] text-3xl font-gilroy-bold">
                    <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                      Previous Winners
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-[24px] text-sm text-gray-200 font-gilroy-medium">
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            alex won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                      <div className="self-stretch flex flex-row items-start justify-start gap-[4px]">
                        <div className="flex-1 flex flex-col items-start justify-start gap-[4px]">
                          <div className="self-stretch tracking-[-0.03em] leading-[120.41%]">
                            7/22/24
                          </div>
                          <div className="self-stretch text-mini tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-neutral-06">
                            jonny boy won 1.2342 SOL with 0.2% chance
                          </div>
                        </div>
                        <img
                          className="w-4 h-4"
                          alt=""
                          src="/vuesaxlinearlink.svg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="md:hidden flex max-h-[200px] flex-1 flex flex-col p-6 gap-3 rounded-2xl  overflow-hidden"
                style={{
                  backgroundImage: "url('/frame-2085660304@3x.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top",
                }}
              >
                <div className="text-xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold">
                  Refer to increase your winnings
                </div>
                <span className="text-mini tracking-[-0.03em] leading-[130%] font-gilroy-regular text-gray-300 inline-block">
                  For each friend you refer you will increase your winnings by
                  0.1 SOL
                </span>
                <div className="font-gilroy-semibold flex xk:flex-row flex-col gap-4">
                  <div className="[backdrop-filter:blur(4px)] rounded-lg bg-gray-500 w-[213px] flex flex-row items-center justify-start p-2 box-border gap-[8px]">
                    <div className="tracking-[-0.03em] leading-[130%] z-[0]">
                      stakera.io/ref=1234
                    </div>
                    <div className="absolute w-9 !m-[0] top-[0px] right-[0px] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none bg-gray-400 h-[37px] flex flex-row items-center justify-center z-[1]">
                      <img
                        className="w-6 h-6"
                        alt=""
                        src="/vuesaxbulkcopy.svg"
                      />
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[32px]">
                    <div className="flex flex-row items-center justify-start gap-[9px]">
                      <img
                        className="w-6 h-6 opacity-[0.5]"
                        alt=""
                        src="/vuesaxbolddollarcircle.svg"
                      />
                      <div className="tracking-[-0.03em] leading-[130%]">
                        0.2 SOL
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-start gap-[6px]">
                      <img
                        className="w-6 h-6 opacity-[0.5]"
                        alt=""
                        src="/vuesaxboldprofile2user.svg"
                      />
                      <div className="tracking-[-0.03em] leading-[130%]">2</div>
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
