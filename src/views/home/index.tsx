import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef, FC, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FunctionComponent } from "react";
import FrameComponent9 from "./components/FrameComponent3";
import FrameComponent from "./components/FrameComponent";
import FrameComponent8 from "./components/FrameComponent2";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  LotteryAccount,
  LotteryAccountJSON,
} from "../../out/accounts/LotteryAccount";
import {
  LotteryAccount as LotteryAccount2,
  LotteryAccountJSON as LotteryAccountJSON2,
} from "../../output/accounts/LotteryAccount";
import Frame1 from "./components/Frame1";
import axios from "axios";
import Decimal from "decimal.js";
import {
  buildWhirlpoolClient,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  WhirlpoolContext,
  PriceMath,
} from "@orca-so/whirlpools-sdk";

const whirlpoolAddress = new PublicKey(
  "DxD41srN8Xk9QfYjdNXF9tTnP6qQxeF2bZF8s1eN62Pe"
);

// Dynamically import the StarfieldAnimationComponent with SSR disabled
const fetchHistoricalPriceUpdates = async (timestamp, ids) => {
  const baseURL = "https://benchmarks.pyth.network/v1/updates/price/";
  const url = `${baseURL}${timestamp}`;
  const params = ids.map((id) => `ids=${id}`).join("&");
  const fullUrl = `${url}?${params}`;

  console.log(`Fetching data from URL: ${fullUrl}`);

  try {
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching historical price updates:", error);
    return null;
  }
};

const priceIdToSymbolMap = {
  ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d:
    "Crypto.SOL/USD",
  // Add more mappings as necessary
};

export const HomeView: FC = ({}) => {
  const { connection } = useConnection();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [lotteryAccountData, setLotteryAccountData] =
    useState<LotteryAccountJSON | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [lotteryAccountData2, setLotteryAccountData2] =
    useState<LotteryAccountJSON2 | null>(null);
  const [totalParticipants2, setTotalParticipants2] = useState(0);

  const [windowWidth, setWindowWidth] = useState(0);
  const [openPrices, setopenPrices] = useState({});
  const [prices, setPrices] = useState({});
  const [currentPrice, setCurrentPrice] = useState<Decimal | null>(null);
  const wallet = useWallet();

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

  const fetchWhirlpoolData = async () => {
    try {
      const { whirlpool, price } = await getWhirlpoolData(whirlpoolAddress);
      setCurrentPrice(price);
    } catch (error) {
      console.error("Failed to fetch whirlpool data:", error);
    }
  };

  useEffect(() => {
    fetchWhirlpoolData();
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const gmt2Date = new Date(currentDate.getTime() - 50000);
    const timestamp = Math.floor(gmt2Date.getTime() / 1000);

    const ids = Object.keys(priceIdToSymbolMap);

    const fetchPrices = async () => {
      const priceUpdates = await fetchHistoricalPriceUpdates(timestamp, ids);

      if (priceUpdates && priceUpdates.parsed) {
        const updatedPrices = { ...openPrices };
        priceUpdates.parsed.forEach((priceUpdate) => {
          const symbol = priceIdToSymbolMap[priceUpdate.id];
          if (symbol) {
            updatedPrices[symbol] = priceUpdate.price.price;
          }
        });

        setPrices(updatedPrices);
        console.log("updatedPrices", updatedPrices);
      }
    };

    fetchPrices();
  }, []);

  const solPrice =
    Number((prices["Crypto.SOL/USD"] / 100000000).toFixed(2)) || 150.35;

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

  async function checkLotteryAccount(
    connection: Connection
  ): Promise<LotteryAccountJSON> {
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

  useEffect(() => {
    fetchLotteryAccountData();
  }, [connection]);

  const mergeParticipants = (participants1, participants2) => {
    const mergedParticipants = {};

    // Iterate over the participants of lotteryAccount
    for (const participant of participants1) {
      const pubkeyStr = participant.pubkey.toString();
      mergedParticipants[pubkeyStr] = participant;
    }

    // Iterate over the participants of lotteryAccount2 and merge, if not already present
    for (const participant of participants2) {
      const pubkeyStr = participant.pubkey.toString();

      // If the participant exists in lotteryAccount1, don't double count
      if (!mergedParticipants[pubkeyStr]) {
        mergedParticipants[pubkeyStr] = participant;
      }
    }

    return Object.values(mergedParticipants); // Return merged participants as an array
  };

  const fetchLotteryAccountData = async () => {
    try {
      const data = await checkLotteryAccount(connection);
      setLotteryAccountData(data);
      const data2 = await checkLotteryAccount2(connection);
      setLotteryAccountData2(data2);
      const mergedParticipants = mergeParticipants(
        data.participants,
        data2.participants
      );
      const totalParticipants = mergedParticipants.length;
      // Store the total number of participants
      setTotalParticipants(totalParticipants);
    } catch (error) {
      console.error("Error fetching lottery account data:", error);
    }
  };

  return (
    <div className="w-full relative bg-layer-1 overflow-hidden flex flex-col items-center justify-center box-border  leading-[normal] tracking-[normal] text-left text-sm text-gray-200 font-gilroy-regular">
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
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="h-9.5 flex flex-row justify-between items-center max-w-[1700px] w-[95%] py-[29px] ">
        {" "}
        <Link href="/lottery" className="no-underline">
          <div className="flex flex-col items-start justify-start  px-0 pb-0">
            <FrameComponent9
              group1="/group-1.svg"
              propHeight="29.2px"
              propWidth="27.2px"
              propMinHeight="unset"
              propHeight1="21.9px"
              propFontSize="22.1px"
              propMinWidth="75.3px"
            />
          </div>{" "}
        </Link>
        <Link href="/lottery" className="no-underline">
          <button className="hover:opacity-50 transition ease-in-out duration-300 cursor-pointer [border:none] py-[7px] pl-4 pr-3 bg-primary rounded-lg overflow-hidden flex flex-row items-start justify-start gap-1 shrink-0">
            <div className="flex flex-col items-start justify-start pt-[2.5px] px-0 pb-0">
              <div className="relative text-base tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-bg text-left inline-block min-w-[84px] whitespace-nowrap">
                Launch App
              </div>
            </div>
            <img
              className="h-6 w-6 relative min-h-[24px]"
              alt=""
              src="/vuesaxlineararrowright.svg"
            />
          </button>{" "}
        </Link>
      </header>
      <main className="min-h-[calc(100vh-172px)]  max-w-[1700px] w-[95%] flex flex-col items-start justify-start pt-0 px-0 pb-[29px] box-border gap-8 ">
        <section
          className={` self-stretch rounded-3xl flex flex-row items-end justify-start md:pt-[99px] md:pb-[52px] md:px-12 pl-8 pr-4 pt-16 pb-8 box-border   text-left text-base text-neutral-06 font-gilroy-semibold lg:flex-wrap  lg:box-border`}
          style={{
            backgroundImage: "url('/rectangle-17@2x.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top",
          }}
        >
          <div className="flex-1 flex flex-col items-start justify-start pt-0 px-0  box-border max-w-full ">
            <div className="self-stretch flex lg:flex-row flex-col items-start justify-start gap-[30px] z-[1]">
              <div className="w-full lg:w-1/2 self-stretch flex flex-col items-start justify-start gap-4">
                <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] text-primary">
                  Stake Together, Win Individually
                </div>
                <h1 className="m-0 self-stretch relative xl:text-[60px] md:text-[50px] text-[45px] tracking-[-0.03em] leading-[120.41%] font-normal font-[inherit] ">
                  A lossless lottery platform built on top of Liquidity Staking.
                </h1>

                <div className="flex flex-col gap-[8px] ">
                  <div className="flex flex-row items-center justify-start gap-0 opacity-[0.5] text-mini font-gilroy-regular ">
                    <div className="relative tracking-[-0.03em] leading-[120.41%] inline-block min-w-[77px]">
                      Powered by
                    </div>
                    <img
                      className="h-[21.1px] relative overflow-hidden shrink-0"
                      loading="lazy"
                      alt=""
                      src="/logo-left-white.svg"
                    />
                  </div>
                  <Link href="/lottery" className="no-underline">
                    <button className="hover:opacity-50 transition ease-in-out duration-300 cursor-pointer [border:none] py-[7px] pl-4 pr-3 bg-primary rounded-lg overflow-hidden flex flex-row items-center justify-center gap-1 whitespace-nowrap hover:bg-limegreen">
                      <div className="relative text-base tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-bg text-left inline-block min-w-[84px]">
                        Launch App
                      </div>
                      <img
                        className="h-6 w-6 relative"
                        alt=""
                        src="/vuesaxlineararrowright.svg"
                      />
                    </button>{" "}
                  </Link>
                </div>
              </div>
              <div className=" xl:pt-30 lg:pt-36 lg:w-1/2 w-full flex flex-col md:flex-row items-end justify-end gap-4">
                <div className="flex lg:flex-col md:flex-row flex-col items-start justify-start md:w-1/3 lg:w-1/2 w-full">
                  <Frame1
                    frameDivFlex="0.8939"
                    frameDivPosition="unset"
                    frameDivBorderRadius="16px"
                    frameDivBackgroundColor="rgba(12, 30, 27, 0.81)"
                    frameDivPadding="20.9px 13px"
                    frameDivGap="5.2px"
                    frameDivAlignSelf="unset"
                    frameDivBackdropFilter="blur(17.22px)"
                    frameDivMinWidth="159px"
                    users="TVL"
                    usersColor="rgba(255, 255, 255, 0.75)"
                    prop={`$${
                      isNaN(Number(currentPrice)) ||
                      currentPrice === null ||
                      isNaN(
                        Number(lotteryAccountData?.totalDeposits) /
                          LAMPORTS_PER_SOL +
                          Number(lotteryAccountData2?.lstTotalDeposits) /
                            LAMPORTS_PER_SOL
                      )
                        ? "0.00"
                        : (
                            ((Number(lotteryAccountData?.totalDeposits) +
                              Number(lotteryAccountData2?.lstTotalDeposits) /
                                Number(currentPrice)) /
                              LAMPORTS_PER_SOL) *
                            solPrice
                          ).toFixed(2)
                    }`}
                    divFontSize="32px"
                    divColor="#fff"
                    className="w-full"
                  />{" "}
                </div>
                <div className="flex lg:flex-col md:flex-row flex-col items-start justify-start gap-4 w-full lg:w-1/2">
                  <Frame1
                    frameDivFlex="unset"
                    frameDivPosition="unset"
                    frameDivBorderRadius="16px"
                    frameDivBackgroundColor="rgba(12, 30, 27, 0.81)"
                    frameDivPadding="20.9px 13px"
                    frameDivGap="5.2px"
                    frameDivAlignSelf="stretch"
                    frameDivBackdropFilter="blur(17.22px)"
                    frameDivMinWidth="unset"
                    users="Users"
                    usersColor="rgba(255, 255, 255, 0.75)"
                    prop={totalParticipants?.toString()}
                    divFontSize="32px"
                    divColor="#fff"
                  />

                  <Frame1
                    frameDivFlex="unset"
                    frameDivPosition="unset"
                    frameDivBorderRadius="16px"
                    frameDivBackgroundColor="rgba(12, 30, 27, 0.81)"
                    frameDivPadding="20.9px 13px"
                    frameDivGap="5.2px"
                    frameDivAlignSelf="stretch"
                    frameDivBackdropFilter="blur(17.22px)"
                    frameDivMinWidth="unset"
                    users="Total Winnings"
                    usersColor="rgba(255, 255, 255, 0.75)"
                    prop="$100"
                    divFontSize="32px"
                    divColor="#fff"
                  />
                </div>
              </div>{" "}
            </div>
          </div>
        </section>
        <div className=" flex flex-col lg:flex-row w-full items-start justify-start gap-[32px]">
          <FrameComponent
            vuesaxbulkimport="/vuesaxbulkimport.svg"
            deposit="Deposit"
            depositYourTokensAndStart="Deposit your SOL into Stakera and start winning rewards, Immediately."
          />
          <FrameComponent
            vuesaxbulkimport="/vuesaxbulklikeshapes.svg"
            deposit="Win Solana"
            depositYourTokensAndStart="Win rewards from collective staking, Risklessly."
          />
          <FrameComponent
            vuesaxbulkimport="/vuesaxbulkexport.svg"
            deposit="Withdraw"
            depositYourTokensAndStart="Withdraw your tokens anytime, Instantly."
          />
        </div>
        <FrameComponent8 />
      </main>
    </div>
  );
};
