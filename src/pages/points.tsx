import Head from "next/head";
import { FC, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Modal from "react-modal";
import ReactConfetti from "react-confetti";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
import { Line } from "react-progressbar.js";

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
  playerAcc: String;
  Frame: String;
  totalTrades: Number;
  totalWins: Number;
  solVolume: Number;
  usdcVolume: Number;
  solWinVolume: Number;
  usdcWinVolume: Number;
  solPnL: Number;
  usdcPnL: Number;
  solRate: Number;
  usdRate: Number;
  hour: Number;
  createdAt: Date;
  updatedAt: Date;
  // other fields...
};

const Stats: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [userStats, setUserStats] = useState(null);

  const ENDPOINT8 = process.env.NEXT_PUBLIC_ENDPOINT8;

  const [nextMilestone, setNextMilestone] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch(
          `${ENDPOINT8}/api/userPoints/${publicKey}`
        );
        const data = await response.json();
        setUserStats(data);

        // Calculate the next milestone and progress
        const milestones = [
          { label: "Next Milestone", points: data.pointsToNext1000th },
          { label: "Next Milestone", points: data.pointsToNext100th },
          { label: "Next Milestone", points: data.pointsToNext10th },
          { label: "Next Milestone", points: data.pointsTo1st },
        ];

        const next = milestones.find((milestone) => milestone.points !== null);
        setNextMilestone(next);

        if (next && next.points !== null) {
          const totalPoints = data.mainPoints + data.refPoints;
          setProgress((totalPoints / (totalPoints + next.points)) * 100);
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    fetchUserStats();
  }, [publicKey]);

  function formatNumber(num) {
    if (num >= 1_000_000) {
      return (
        (num / 1_000_000).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }) + "M"
      );
    } else if (num >= 1_000) {
      return (
        (num / 1_000).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }) + "k"
      );
    } else {
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    }
  }

  return (
    <div className="md:bg-base relative overflow-hidden">
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
        className="md:hidden overflow-hidden absolute futures-circles1 w-full  h-1/4"
        style={{
          zIndex: -1,
          transform: "translate(-45%, 80%)",
          right: "0%",
        }}
      >
        {" "}
      </div>
      <div
        className="md:hidden overflow-hidden absolute futures-circles2 w-full h-1/4"
        style={{
          zIndex: -1,
          transform: "translate(49%, -10%)",
          right: "0%",
        }}
      ></div>
      <div
        className="md:hidden overflow-hidden absolute futures-circles2 w-full h-1/4"
        style={{
          zIndex: -1,
          transform: "translate(65%, 200%)",
          right: "0%",
        }}
      ></div>

      <Head>
        <title>PopFi | Personal Stats</title>
        <meta name="description" content="PopFi" />
      </Head>
      <div className=" flex justify-center md:pt-2 min-h-[calc(100vh-85px)]">
        <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] px-2 z-0">
          <div className="bankGothic flex flex-col  gap-[8px] text-3xl mt-2 lg:text-4xl text-white z-0"></div>
          <div className="w-full flex md:flex-row flex-col gap-2 md:px-0  z-100">
            <div className="w-full flex justify-center md:justify-start items-center gap-4">
              <h1 className="bankGothic md:text-start text-center text-3xl mt-2 lg:text-4xl text-transparent bg-clip-text bg-white">
                Your Points
              </h1>
            </div>
          </div>
          <div
            style={{ position: "relative", zIndex: 100 }}
            className="z-100 mt-2 md:rounded-2xl rounded-lg bg-layer-1 box-border w-full flex flex-col md:flex-row items-start justify-start md:p-8 p-4 gap-[16px] text-sm  "
          >
            <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/totalvolume.png"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  Trading Points
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  <span className="text-new-green">
                    {userStats?.mainPoints}
                  </span>
                </div>
              </div>
            </div>
            <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/totalvolume.png"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium text-center">
                  Referral Points
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  <span className="text-new-green">{userStats?.refPoints}</span>
                </div>
              </div>
            </div>

            <div className="z-10 md:w-3/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px]  ">
              <div
                className="overflow-hidden absolute futures-circles5 w-2/3 h-full"
                style={{
                  zIndex: 0,
                  transform: "translate(35%, 15%)",
                  right: "0%",
                }}
              ></div>

              <div className="h-[60px] flex md:flex-row justify-start items-center gap-3 w-1/2 md:w-full">
                <img
                  className="relative w-[45px] h-[45px]"
                  alt=""
                  src="/sheesh/totalvolume.png"
                />
                <div className="flex flex-row md:flex-col">
                  <div className="hidden md:flex flex-row justify-center items-center ">
                    Global Rank:{" "}
                  </div>
                  <div className="md:hidden flex flex-row justify-center items-center ">
                    Rank:{" "}
                  </div>
                  <div className="ml-1 md:ml-0 flex flex-row relative md:text-3xl text-2xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                    <span className="text-new-green">{userStats?.rank} </span> /{" "}
                    <span className="text-[#ffffff100]">
                      {" "}
                      {userStats?.totalUsers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[60px] w-1/2 md:w-full flex flex-col justify-center items-end md:items-center">
                {nextMilestone && (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-2 w-full">
                      <span className="">{nextMilestone.label}:</span>
                      <span className="md:text-3xl text-2xl text-new-green">
                        {nextMilestone.points ?? "-"}
                      </span>
                    </div>
                    <div className="w-full bg-[#ffffff15] rounded-full mb-1">
                      <div
                        className="flex justify-center m-1 items-center bg-new-green h-4 rounded-full px-2"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
