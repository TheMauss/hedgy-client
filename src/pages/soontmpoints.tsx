import Head from "next/head";
import React, { FC, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import axios from "axios";
import { notify } from "utils/notifications";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  LotteryAccount,
  LotteryAccountJSON,
} from "../out/accounts/LotteryAccount";
import { ParticipantJSON } from "../out/types/Participant";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const APIKEYTEAM = process.env.NEXT_PUBLIC_APIKEYTEAM;

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

const Points: FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [teamName, setTeamName] = useState("");
  const [hasFollowedTwitter, setHasFollowedTwitter] = useState(false);
  const [hasJoinedDiscord, setHasJoinedDiscord] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participantData, setParticipantData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [topTeams, setTopTeams] = useState(null);
  const [participantDataSOL, setParticipantDataSOL] =
    useState<ParticipantJSON | null>(null);
  const [selectedPoint, setSelectedPoints] = useState<"Individual" | "Team">(
    "Individual"
  );
  const [referralLink, setReferralLink] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const router = useRouter(); // Use useRouter instead of useLocation

  useEffect(() => {
    // Parse the referral code from the URL
    const { ref } = router.query;
    console.log("Referral code from URL:", ref);
    if (ref) {
      setReferralCode(ref as string);
    }
  }, [router.query]);

  const handleTwitterClick = () => {
    setHasFollowedTwitter(true);
  };

  const handleDiscordClick = () => {
    if (hasFollowedTwitter) {
      setHasJoinedDiscord(true);
    }
  };

  const handleCreateOrJoinTeam = async (
    action: "create" | "join",
    teamName: string
  ) => {
    if (!teamName) {
      return notify({ type: "error", message: "Please enter a team name." });
    }

    setLoading(true);
    notify({
      type: "info",
      message: action === "create" ? "Creating team..." : "Joining team...",
    });

    try {
      const response = await axios.post(
        "http://localhost:4000/api/team",
        {
          publicKey: publicKey.toBase58(),
          teamName,
          action,
          usedReferralCode: referralCode || null, // Adjust this if you're using referral codes
        },
        {
          headers: {
            "x-api-key": APIKEYTEAM, // Add the API key in the request headers
          },
        }
      );

      if (response.status === 200) {
        notify({ type: "success", message: response.data.message });
        checkParticipant();
      } else {
        notify({ type: "error", message: response.data.message });
      }
    } catch (error) {
      console.error("Error:", error);

      // Check if the error is a 400 error and handle it accordingly
      if (error.response && error.response.status === 400) {
        notify({
          type: "error",
          message:
            error.response.data.message ||
            "Invalid request. Please check your inputs.",
        });
      } else {
        notify({
          type: "error",
          message: "Failed to create/join team. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantData = async () => {
    try {
      const data = await checkLotteryAccount(connection);
      const participant = data.participants.find(
        (participant) => participant.pubkey === publicKey.toString()
      );
      setParticipantDataSOL(participant || null);
    } catch (error) {
      console.error("Error fetching lottery account data:", error);
    }
  };

  // myslet na to!
  useEffect(() => {
    if (publicKey) {
      setTimeout(() => {
        fetchParticipantData();
      }, 150);
    }
  }, [publicKey, connection]);

  const catImages = [
    "/cat@2x.png",
    "/cat1@2x.png",
    "/cat2@2x.png",
    "/cat3@2x.png",
    "/cat4@2x.png",
    "/cat5@2x.png",
  ];

  const checkParticipant = async () => {
    if (!publicKey) return;

    try {
      const response = await axios.post(
        "http://localhost:4000/api/check-participant",
        {
          publicKey: publicKey.toBase58(),
        },
        {
          headers: {
            "x-api-key": APIKEYTEAM, // Add the API key in the request headers
          },
        }
      );

      if (response.status === 200) {
        setParticipantData(response.data.participant);
        console.log(response.data.participant);
        setTeamData(response.data.team);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    checkParticipant();
  }, [publicKey]);

  const fetchTopTeams = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/top-teams", {
        headers: {
          "x-api-key": APIKEYTEAM, // Add the API key in the request headers
        },
      });
      if (response.status === 200) {
        setTopTeams(response.data.topTeams);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // You can call this function in a useEffect or whenever needed
  useEffect(() => {
    fetchTopTeams();
  }, []);

  useEffect(() => {
    if (participantData?.referralCode) {
      // Create the referral link using the referral code
      const link = `http://localhost:3030/points?ref=${participantData.referralCode}`;
      setReferralLink(link);
    }
  }, [participantData]);

  const handleCopyClick = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      notify({
        type: "success",
        message: "Referral link copied to clipboard!",
      });
    }
  };

  const [boostMultiplier, setBoostMultiplier] = useState(1); // Default multiplier is 1

  // useEffect to calculate the boostMultiplier whenever teamData.tvl changes
  useEffect(() => {
    const calculateBoostMultiplier = () => {
      const tvlNumber = teamData?.tvl; // Assume this is a number

      if (tvlNumber > 3_000_000) {
        setBoostMultiplier(1.5); // 50% boost
      } else if (tvlNumber > 1_000_000) {
        setBoostMultiplier(1.3); // 30% boost
      } else if (tvlNumber > 600_000) {
        setBoostMultiplier(1.25); // 25% boost
      } else if (tvlNumber > 300_000) {
        setBoostMultiplier(1.2); // 20% boost
      } else if (tvlNumber > 100_000) {
        setBoostMultiplier(1.15); // 15% boost
      } else if (tvlNumber > 50_000) {
        setBoostMultiplier(1.1); // 10% boost
      } else if (tvlNumber > 30_000) {
        setBoostMultiplier(1.05); // 5% boost
      } else {
        setBoostMultiplier(1); // No boost
      }
    };

    // Call the function to calculate boostMultiplier
    calculateBoostMultiplier();
  }, [teamData]); // Dependency array includes teamData.tvl

  useEffect(() => {
    if (participantData?.OG) {
      setOgBoost(0.1);
    } else {
      setOgBoost(0); // Reset to 0 if OG is not true
    }

    if (participantData?.swboardOG) {
      setSwBoost(0.05);
    } else {
      setSwBoost(0); // Reset to 0 if OG is not true
    }

    if (participantData?.pophead) {
      setPopheadBoost(0.1);
    } else {
      setPopheadBoost(0); // Reset to 0 if OG is not true
    }
  }, [participantData]); // Dependency array includes teamData.tvl

  const [ogBoost, setOgBoost] = useState(0); // Example initial value
  const [swBoost, setSwBoost] = useState(0); // Example initial value
  const [popheadBoost, setPopheadBoost] = useState(0); // Example initial value
  const [otherBoost2, setOtherBoost2] = useState(0); // Example initial value
  const [totalMultiplier, setTotalMultiplier] = useState(1); // Total multiplier

  function formatNumberToKOrM(num) {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + "M"; // Format as millions
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "k"; // Format as thousands
    }
    return num.toFixed(1); // Return the original number if less than 1000
  }

  function formatNumberToKOrMs(num) {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(0) + "M"; // Format as millions
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(0) + "k"; // Format as thousands
    }
    return num.toFixed(1); // Return the original number if less than 1000
  }

  // useEffect to calculate totalMultiplier whenever any individual multiplier changes
  useEffect(() => {
    const sumOfMultipliers = boostMultiplier + ogBoost + popheadBoost + swBoost;
    setTotalMultiplier(sumOfMultipliers);
  }, [boostMultiplier, ogBoost, popheadBoost, otherBoost2, swBoost]);

  const thresholds = [
    { limit: 30000, boost: 5 },
    { limit: 50000, boost: 10 },
    { limit: 100000, boost: 15 },
    { limit: 300000, boost: 20 },
    { limit: 600000, boost: 25 },
    { limit: 1000000, boost: 30 },
    { limit: 3000000, boost: 50 },
  ];

  const [progress, setProgress] = useState(0);
  const [boost, setBoost] = useState(0);
  useEffect(() => {
    calculateProgress(teamData?.tvl);
  }, [teamData]);

  const calculateProgress = (tvl) => {
    let segmentIndex = 0;
    let percentage = 0;
    let boostMultiplier = 0;

    // Determine the correct segment for the given TVL
    for (let i = 0; i < thresholds.length; i++) {
      if (tvl <= thresholds[i].limit) {
        segmentIndex = i;
        break;
      } else if (i === thresholds.length - 1) {
        // If TVL exceeds the highest limit
        segmentIndex = thresholds.length;
      }
    }

    // Calculate the percentage progress within the segment
    if (segmentIndex === 0) {
      // First segment (half-width)
      percentage = (tvl / thresholds[0].limit) * (50 / thresholds.length);
    } else if (segmentIndex === thresholds.length) {
      // Beyond the last segment (fully filled)
      percentage = 100;
    } else {
      const rangeStart = thresholds[segmentIndex - 1].limit;
      const rangeEnd = thresholds[segmentIndex].limit;
      const rangeDiff = rangeEnd - rangeStart;

      // Calculate total percentage directly
      const segmentFullWidthPercentage =
        ((0.5 + segmentIndex - 1) / thresholds.length) * 100;
      console.log(segmentFullWidthPercentage, "fullwidthpercentage");
      const segmentProgress =
        ((tvl - rangeStart) / rangeDiff) * (100 / thresholds.length);
      console.log(segmentProgress, "segmentproggres");

      percentage = segmentFullWidthPercentage + segmentProgress;
    }

    setProgress(percentage);
  };

  // Determine the current index based on teamData?.tvl
  const currentIndex = thresholds.findIndex(
    (threshold) => teamData?.tvl < threshold.limit
  );

  // Adjust index to display from the current threshold if no threshold is exceeded
  const adjustedIndex =
    currentIndex === -1
      ? thresholds.length - 1
      : currentIndex === 0
        ? 0
        : currentIndex - 1;

  // Calculate which thresholds to display, ensuring we only show up to four thresholds ahead
  const displayThresholds = thresholds.slice(adjustedIndex, adjustedIndex + 4);

  if (participantData) {
    return (
      <div className="overflow-hidden flex justify-center items-top min-h-[calc(100vh-172px)] z-100 bg-layer-1 ">
        <div className=" w-[95%] max-w-[1550px] justify-start flex flex-col gap-4 lg:gap-8 text-left text-3xl-1 text-neutral-06 font-gilroy-bold">
          <div className="w-full flex flex-col lg:flex-row gap-8">
            <div
              style={{
                backgroundImage: "url('/frame-20856602981@3x.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top",
              }}
              className="rounded-2xl w-full lg:w-[35%] flex flex-col items-start justify-start p-4 sm:p-6 box-border gap-8 bg-cover bg-no-repeat bg-[top] text-5xl font-gilroy-semibold"
            >
              <div className="self-stretch flex-1 [backdrop-filter:blur(20px)] rounded-2xl bg-darkslategray-200 flex flex-col items-start justify-start p-5 sm:p-6 gap-6">
                <div className="w-[166px] flex-1 flex flex-col items-start justify-start">
                  <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                    Your profile
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-center justify-start gap-[7px] text-base font-gilroy-medium">
                  <div className="flex-1 flex flex-col items-start justify-start gap-4">
                    <div className="h-[57px] flex flex-col items-start justify-center gap-[9px]">
                      <div className="relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                        Your Total Points
                      </div>
                      <div className="flex flex-row items-center justify-start gap-1 text-lg font-gilroy-semibold">
                        <img
                          className="w-6 relative h-6"
                          alt=""
                          src="/vuesaxlinearcoin.svg"
                        />
                        <div className="mt-1 relative tracking-[-0.03em] leading-[120.41%]">
                          {`${formatNumberToKOrM(
                            Number(
                              participantData?.tvlPoints +
                                participantData?.refPoints
                            )
                          )}`}
                        </div>
                      </div>
                    </div>
                    <div className="h-[57px] flex flex-col items-start justify-center gap-[9px]">
                      <div className="relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                        Your Team
                      </div>
                      <div className="flex flex-row items-start justify-start gap-1 text-lg font-gilroy-semibold">
                        <img
                          className="w-6 relative h-6"
                          alt=""
                          src="/vuesaxlinearflag.svg"
                        />
                        <div className="mt-0.5 relative tracking-[-0.03em] leading-[120.41%]">
                          {teamData?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <img
                    className="w-[100px] h-[100px] sm:w-[150px] relative rounded-2xl sm:h-[150px] object-cover"
                    alt=""
                    src="/siamese-cat@2x.png"
                  />
                </div>
              </div>
              <div className="self-stretch [backdrop-filter:blur(20px)] rounded-2xl bg-darkslategray-200 flex flex-col items-start justify-center p-6 gap-6 text-base font-gilroy-medium">
                <div className="w-[183px] relative text-5xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold inline-block">{`Refer & earn`}</div>
                <div className="self-stretch h-[57px] flex flex-col items-start justify-center gap-[9px]">
                  <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                    Number of Referee(s)
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[9px] text-5xl font-gilroy-semibold">
                    <img
                      className="w-6 relative h-6"
                      alt=""
                      src="/vuesaxlinearpeople.svg"
                    />
                    <div className="relative tracking-[-0.03em] leading-[120.41%]">
                      {participantData?.referred_user}
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start justify-start gap-2">
                  <div className="self-stretch flex flex-col items-start justify-start gap-2">
                    <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                      Referral Code
                    </div>
                    <div className="self-stretch rounded-lg bg-gray-500 h-12 flex flex-row items-center justify-start p-2 box-border relative gap-2">
                      <div className="relative tracking-[-0.03em] leading-[130%] z-[0]">
                        {participantData?.referralCode}
                      </div>
                      <div className="cursor-pointer w-12 !m-[0] absolute top-[0px] right-[0px] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none bg-gray-400 h-12 flex flex-row items-center justify-center z-[1]">
                        <img
                          className="w-6 relative h-6"
                          alt=""
                          src="/vuesaxbulkcopy1.svg"
                          onClick={handleCopyClick}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={handleCopyClick}
                    className="hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border text-lg text-bg font-gilroy-semibold"
                  >
                    <div className="mt-1 cursor-pointer relative tracking-[-0.03em] leading-[120.41%]">
                      Invite your Friends
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-bg w-full lg:w-[65%] min-h-[650px] flex flex-col items-start justify-start pt-6 pb-5 px-4 sm:p-6 box-border gap-[11px] text-base font-gilroy-semibold">
              <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                Points
              </div>
              <div className="self-stretch rounded-lg bg-gray-100 flex flex-row items-center justify-start p-1 text-neutral-06 font-gilroy-semibold">
                <div
                  className={`cursor-pointer flex-1 rounded-lg overflow-hidden flex flex-row items-center justify-center p-2 transition-background ${
                    selectedPoint === "Individual"
                      ? "bg-bg text-white"
                      : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                  }`}
                  onClick={() => setSelectedPoints("Individual")}
                >
                  Individual
                </div>
                <div
                  className={`cursor-pointer flex-1 rounded-lg flex flex-row items-center justify-center p-2 transition-background ${
                    selectedPoint === "Team"
                      ? "bg-bg text-white"
                      : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                  }`}
                  onClick={() => setSelectedPoints("Team")}
                >
                  Team
                </div>
              </div>
              {selectedPoint === "Individual" && (
                <div className="w-full flex flex-col gap-[11px]">
                  <div className="flex flex-col sm:flex-row items-start justify-start gap-[11px] text-center font-gilroy-medium">
                    <div className="w-full sm:w-1/2 rounded-2xl bg-gray-100 flex flex-col items-center justify-center py-6 gap-[9px]">
                      <div
                        id="totalPointsInfo"
                        className="cursor-pointer w-full  tracking-[-0.03em] leading-[120.41%] opacity-[0.5]"
                      >
                        Your TVL Points
                      </div>
                      <Tooltip
                        anchorSelect="#totalPointsInfo"
                        place="top"
                        content="You earn 1 point for every USD deposited per 24 hours."
                        className="font-gilroy-regular max-w-xs p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                      />
                      <div className="  text-5xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold inline-block">
                        {`${formatNumberToKOrM(Number(participantData?.tvlPoints))}`}
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2 rounded-2xl bg-gray-100 flex flex-col items-center justify-center py-6 gap-[9px]">
                      <div
                        id="refPointsInfo"
                        className="cursor-pointer w-full  tracking-[-0.03em] leading-[120.41%] opacity-[0.5]"
                      >
                        Your Referral Points
                      </div>{" "}
                      <Tooltip
                        anchorSelect="#refPointsInfo"
                        place="top"
                        content="You earn 10% of the points accumulated by your referrals."
                        className="font-gilroy-regular max-w-xs p-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                      />
                      <div className="  text-5xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold inline-block">
                        {`${formatNumberToKOrM(Number(participantData?.refPoints))}`}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-row items-start justify-start font-gilroy-medium">
                    <div className="flex-1 rounded-2xl bg-gray-100 flex flex-row items-center justify-between p-6">
                      <div className="flex flex-row items-center justify-start gap-2">
                        <img
                          className="w-12  h-12"
                          alt=""
                          src="/vuesaxboldimport1.svg"
                        />
                        <div className="flex flex-col items-start justify-center gap-[6px]">
                          <div className=" tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                            Your Deposits
                          </div>
                          <div className=" text-5xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-center">
                            <span>
                              {isNaN(
                                (Number(participantDataSOL?.deposit) +
                                  Number(participantDataSOL?.pendingDeposit)) /
                                  LAMPORTS_PER_SOL
                              )
                                ? 0
                                : (
                                    (Number(participantDataSOL?.deposit) +
                                      Number(
                                        participantDataSOL?.pendingDeposit
                                      )) /
                                    LAMPORTS_PER_SOL
                                  ).toFixed(2)}
                            </span>
                            <span className="text-lg ml-1">SOL</span>
                          </div>
                        </div>
                      </div>
                      <div className="hover:opacity-70 transition ease-in-out duration-300 rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-bg font-gilroy-semibold">
                        <a href="/lottery" className="no-underline text-black">
                          <div className="mt-1 relative tracking-[-0.03em] leading-[120.41%]">
                            Deposit
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="w-full rounded-2xl bg-gray-100 flex flex-col items-start justify-center p-6 box-border gap-4 text-center text-21xl text-primary">
                    <div className="self-stretch flex flex-row items-center justify-start gap-2">
                      <img
                        className="w-10 relative h-10"
                        alt=""
                        src="/vuesaxboldflash.svg"
                      />
                      <div className=" flex flex-row items-end justify-start gap-[9px]">
                        <div className="text-[42px] relative tracking-[-0.03em] leading-[100%] inline-block h-[35px] shrink-0">
                          {`${totalMultiplier.toFixed(2)}x`}
                        </div>
                        <div className=" relative text-base tracking-[-0.03em] leading-[120.41%] font-gilroy-medium text-neutral-06 inline-block h-[15px] shrink-0">
                          Point Multiplier
                        </div>
                      </div>
                    </div>
                    <div className="custom-scrollbar self-stretch flex flex-row overflow-x-scroll items-start justify-start gap-4 text-base text-neutral-06">
                      <div className="self-stretch flex-1 rounded-2xl bg-bg border-primary border-[1px] border-solid flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                        <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                          {`${(Number(boostMultiplier.toFixed(2)) - 1).toFixed(2)}x`}
                        </div>
                        <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                          Team Boost
                        </div>
                        <div className="cursor-not-allowed self-stretch rounded-lg bg-gray-100 h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-primary">
                          <div className="relative tracking-[-0.03em] leading-[120.41%]">
                            Completed
                          </div>
                        </div>
                      </div>
                      {!participantData?.OG ? (
                        <div className="self-stretch flex-1 rounded-2xl bg-bg flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                          <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                            0.1x
                          </div>
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                            OG Boost
                          </div>
                          <div className="hover:opacity-70 transition ease-in-out duration-300 self-stretch rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center  box-border text-left text-bg">
                            <a
                              href="https://forms.gle/KGpdxZWkHiyaKHZM8"
                              target="_blank"
                              className="flex flex-row items-center justify-center py-2 px-4 no-underline text-black w-full"
                            >
                              <div className="relative tracking-[-0.03em] leading-[120.41%] w-full flex flex-row items-center justify-center">
                                Get
                              </div>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="self-stretch flex-1 rounded-2xl bg-bg border-primary border-[1px] border-solid flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                          <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                            {`${ogBoost.toFixed(2)}x`}
                          </div>
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                            OG Boost
                          </div>
                          <div className="cursor-not-allowed self-stretch rounded-lg bg-gray-100 h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-primary">
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              Completed
                            </div>
                          </div>
                        </div>
                      )}
                      {!participantData?.pophead ? (
                        <div className="self-stretch flex-1 rounded-2xl bg-bg flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                          <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                            0.10x
                          </div>
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                            Pophead Boost
                          </div>
                          <div className="cursor-not-allowed self-stretch rounded-lg bg-gray-100 h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-primary">
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              Unobtainable
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="self-stretch flex-1 rounded-2xl bg-bg border-primary border-[1px] border-solid flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                          <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                            {`${ogBoost.toFixed(2)}x`}
                          </div>
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                            Pophead Boost
                          </div>
                          <div className="cursor-not-allowed self-stretch rounded-lg bg-gray-100 h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-primary">
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              Completed
                            </div>
                          </div>
                        </div>
                      )}
                      {!participantData?.swboardOG ? (
                        <div className="self-stretch flex-1 rounded-2xl bg-bg flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                          <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                            0.05x
                          </div>
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                            Switchboard AMA
                          </div>
                          <div className="cursor-not-allowed self-stretch rounded-lg bg-gray-100 h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-primary">
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              Unobtainable
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="self-stretch flex-1 rounded-2xl bg-bg border-primary border-[1px] border-solid flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                          <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                            {`${ogBoost.toFixed(2)}x`}
                          </div>
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                            Switchboard AMA
                          </div>
                          <div className="cursor-not-allowed self-stretch rounded-lg bg-gray-100 h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-primary">
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              Completed
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="self-stretch flex-1 rounded-2xl bg-bg flex flex-col items-center justify-start p-4 md:p-6 gap-[13px]">
                        <div className="self-stretch relative text-5xl tracking-[-0.03em] leading-[120.41%]">
                          0.0x
                        </div>
                        <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
                          ?
                        </div>
                        <div className="cursor-not-allowed self-stretch rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-bg">
                          <div className="relative tracking-[-0.03em] leading-[120.41%]">
                            Soon™
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                </div>
              )}
              {selectedPoint === "Team" && (
                <div className="w-full flex flex-col gap-[11px]">
                  <div className="flex flex-row items-center justify-center pt-4 px-0 pb-0 text-lg font-gilroy-medium">
                    <div className="w-full text-left items-start justify-start relative tracking-[-0.03em] leading-[120.41%] ">
                      Play as a team to maximize your point boosting
                    </div>
                  </div>
                  <div className="w-full rounded-2xl bg-gray-100 flex flex-col items-start justify-center pt-6 px-4 md:px-6 pb-0 box-border gap-4 text-center text-21xl text-primary">
                    <div className="self-stretch flex flex-row items-center justify-start gap-2">
                      <img
                        className="w-10 relative h-10"
                        alt=""
                        src="/vuesaxboldimport.svg"
                      />
                      <div className="w-[181px] flex flex-row items-end justify-start gap-[9px]">
                        <div className="text-[42px] sm:text-[42px] relative tracking-[-0.03em] leading-[100%] inline-block h-[35px] shrink-0">
                          {`$${formatNumberToKOrM(Number(teamData?.tvl))}`}{" "}
                        </div>
                        <div className="text-[13px] sm:text-[16px] w-[101px] relative text-base tracking-[-0.03em] leading-[120.41%] font-gilroy-medium text-neutral-06 text-left inline-block h-[15px] shrink-0">
                          Team Supply
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start py-6 px-0 gap-2 text-base">
                      {/* Threshold Labels */}
                      <div className="self-stretch flex flex-row items-center justify-between">
                        {thresholds.map((threshold, index) => (
                          <div
                            key={index}
                            className="text-[11px] sm:text-[16px] flex-1 relative tracking-[-0.03em] leading-[120.41%]"
                            style={{ textAlign: "center" }} // Center align text to align labels properly
                          >
                            {formatNumberToKOrMs(threshold.limit)}
                          </div>
                        ))}
                      </div>

                      {/* Progress Bar Container */}
                      <div className="self-stretch rounded-981xl border-layer-1 border-[1px] border-solid flex flex-col items-start justify-start p-1 relative gap-2">
                        {/* Threshold Lines */}
                        <div className="absolute w-full self-stretch flex flex-row items-center justify-between text-neutral-06 font-gilroy-medium">
                          {thresholds.map((threshold, index) => (
                            <div
                              key={index}
                              className="absolute z-10 flex-1 relative tracking-[-0.03em] opacity-[0.5] leading-[120.41%]"
                              style={{ textAlign: "center" }}
                            >
                              <span>|</span>
                            </div>
                          ))}
                        </div>
                        <div
                          className="hidden md:flex w-full rounded-981xl bg-[#6fff91e1] h-4 overflow-hidden shrink-0 z-[1]"
                          style={{ width: `${progress}%` }} // Progress bar width
                        >
                          <img
                            src="/Title.svg" // Replace with the actual path to your logo
                            alt="Progress Logo"
                            className="breathing absolute top-1/2 transform -translate-y-1/2 h-12 w-12"
                            style={{
                              animation: "breathing 2s ease-in-out infinite",
                              height: "36px", // Adjust the height of the logo
                              width: "36px", // Adjust the width of the logo
                              left: `${progress + 0.5}%`,
                            }} // Position the logo at the end of the filled portion
                          />
                        </div>
                        {/* Progress Bar */}
                        <div
                          className="flex md:hidden w-full rounded-981xl bg-[#6fff91e1] h-4 overflow-hidden shrink-0 z-[1]"
                          style={{ width: `${progress + 1}%` }} // Progress bar width
                        >
                          <img
                            src="/Title.svg" // Replace with the actual path to your logo
                            alt="Progress Logo"
                            className="breathing absolute top-1/2 transform -translate-y-1/2 h-12 w-12"
                            style={{
                              animation: "breathing 2s ease-in-out infinite",
                              height: "36px", // Adjust the height of the logo
                              width: "36px", // Adjust the width of the logo
                              left: `${progress + 1.5}%`,
                            }} // Position the logo at the end of the filled portion
                          />
                        </div>
                      </div>

                      {/* Boost Percentages */}
                      <div className="self-stretch flex flex-row items-center justify-between text-neutral-06 font-gilroy-medium">
                        {thresholds.map((threshold, index) => (
                          <div
                            key={index}
                            className="text-[11px] sm:text-[16px] flex-1 relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]"
                            style={{ textAlign: "center" }}
                          >
                            {threshold.boost}%
                          </div>
                        ))}
                      </div>
                    </div>{" "}
                  </div>
                  <div className="self-stretch rounded-2xl bg-gray-100 flex flex-col items-center justify-center p-4 md:p-6 gap-4 text-center text-sm font-gilroy-medium">
                    <div className="self-stretch flex flex-row items-start justify-start gap-[9px]">
                      <div className="flex-1 relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                        Total Team Deposits
                      </div>
                      <div className="flex-1 relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                        Team Boosts
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-2 text-lg font-gilroy-semibold">
                      {displayThresholds.map((threshold, index) => (
                        <div
                          key={index}
                          className={`self-stretch rounded flex flex-row items-center justify-start py-1 px-0 relative gap-[9px] ${
                            teamData?.tvl >= threshold.limit
                              ? "bg-layer-1 text-primary"
                              : ""
                          }`}
                        >
                          <div className="flex-1 relative tracking-[-0.03em] leading-[120.41%] z-[0] text-[14px] sm:text-[16px]">
                            More than ${threshold.limit.toLocaleString()}
                          </div>
                          <div className="flex-1 relative tracking-[-0.03em] leading-[120.41%] z-[1]">
                            {threshold.boost}%
                          </div>
                          {/* Show arrow icons for current or achieved boosts */}
                          <img
                            className={`hidden sm:flex w-6 absolute !m-[0] top-[3px] left-[4px] h-6 ${
                              teamData?.tvl >= threshold.limit ? "" : "hidden"
                            } z-[2]`}
                            alt=""
                            src="/vuesaxboldarrowright.svg"
                          />
                          <img
                            className={`hidden sm:flex w-6 absolute !m-[0] top-[3px] right-[4px] h-6 object-contain ${
                              teamData?.tvl >= threshold.limit ? "" : "hidden"
                            } z-[3]`}
                            alt=""
                            src="/vuesaxboldarrowright1.svg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>{" "}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" overflow-hidden">
      <Head>
        <title>Stakera | Points</title>
        <meta name="description" content="Stakera" />
      </Head>

      <div className="flex justify-center items-top min-h-[calc(100vh-172px)] z-100 bg-layer-1 ">
        <div className=" w-[95%] max-w-[1550px] justify-start flex flex-col gap-4 lg:gap-8">
          <div className="pt-8 w-full flex flex-col items-start justify-start gap-[11px] text-5xl font-gilroy-semibold">
            <div className="text-white self-stretch relative tracking-[-0.03em] leading-[120.41%]">
              Join the Stakventure
            </div>
            <div className="text-white self-stretch relative text-base tracking-[-0.03em] leading-[120.41%] font-gilroy-medium opacity-[0.5]">
              Complete your tasks to unlock more rewards!
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="self-stretch w-full lg:w-[50%]">
              <div className="flex flex-col items-start justify-start gap-2.5 text-center text-lg text-primary">
                <div className="self-stretch rounded-2xl bg-bg flex flex-row items-center justify-between p-6">
                  <div className="flex flex-row items-center justify-start gap-3">
                    <div className="w-8 rounded-full bg-mediumspringgreen-300 border-primary border-[1px] border-solid box-border h-8 flex flex-col items-center justify-center p-2">
                      <div className="w-[15px] relative tracking-[-0.03em] leading-[100%] flex items-end justify-center h-5 shrink-0">
                        1
                      </div>
                    </div>
                    <div className="relative tracking-[-0.03em] leading-[120.41%] font-gilroy-medium text-neutral-06 text-left ">
                      Follow Stakera on x.com
                    </div>
                  </div>

                  <>
                    {!publicKey ? (
                      <div className="hover:opacity-70 transition ease-in-out duration-300 w-[110px] rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center box-border text-left text-base text-bg font-gilroy-semibold flex justify-center items-center h-[34px] rounded-lg tracking-[-0.03em] leading-[120.41%] bg-primary cursor-pointer font-semibold">
                        <WalletMultiButtonDynamic
                          style={{
                            width: "100%",
                            backgroundColor: "transparent",
                            color: "black",
                          }}
                          className="font-gilroy-medium  mt-0.5 w-[110px] font-gilroy-semibold text-base text-bg tracking-[-0.03em] leading-[120.41%]"
                        >
                          <div className="text-base text-bg text-sm">
                            Follow
                          </div>
                        </WalletMultiButtonDynamic>
                      </div>
                    ) : (
                      <div className="hover:opacity-70 transition ease-in-out duration-300 w-[110px] rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center box-border text-left text-base text-bg font-gilroy-semibold font-gilroy-semibold relative tracking-[-0.03em] text-sm leading-[120.41%]">
                        <a
                          className="mt-1 twitter-follow-button no-underline text-black"
                          href="https://x.com/intent/follow?screen_name=stakera_io"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleTwitterClick}
                        >
                          Follow
                        </a>
                      </div>
                    )}
                  </>
                </div>
                <div className="self-stretch rounded-2xl bg-bg flex flex-row items-center justify-between p-6">
                  <div className="flex flex-row items-center justify-start gap-3">
                    <div className="w-8 rounded-full bg-mediumspringgreen-300 border-primary border-[1px] border-solid box-border h-8 flex flex-col items-center justify-center p-2">
                      <div className="w-[15px] relative tracking-[-0.03em] leading-[100%] flex items-end justify-center h-5 shrink-0">
                        2
                      </div>
                    </div>
                    <div className="tracking-[-0.03em] leading-[120.41%] text-neutral-06 text-left font-gilroy-medium ">
                      Join the Stakera Discord
                    </div>
                  </div>
                  <a
                    className={`hover:opacity-70 transition ease-in-out duration-300 w-[110px] rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-left text-base text-bg font-gilroy-semibold no-underline text-black text-sm ${!hasFollowedTwitter ? "opacity-50 cursor-not-allowed" : ""}`}
                    href={
                      hasFollowedTwitter ? "https://discord.gg/cpJ2GF6Skc" : ""
                    }
                    target={hasFollowedTwitter ? "_blank" : ""}
                    rel="noopener noreferrer"
                    onClick={handleDiscordClick}
                  >
                    <a className="mt-1">Join</a>
                  </a>
                </div>
                <div className="self-stretch rounded-2xl bg-bg flex flex flex-col md:flex-row md:items-center md:justify-between p-6">
                  <div className="flex flex-row items-center justify-start gap-3">
                    <div className="w-8 rounded-full bg-mediumspringgreen-300 border-primary border-[1px] border-solid box-border h-8 flex flex-col items-center justify-center p-2">
                      <div className="w-[15px] relative tracking-[-0.03em] leading-[100%] flex items-end justify-center h-5 shrink-0">
                        3
                      </div>
                    </div>
                    <div className="relative tracking-[-0.03em] leading-[120.41%] text-neutral-06 text-left font-gilroy-medium ">
                      Join or create a Stakera Team
                    </div>
                  </div>
                  <div className="w-full md:w-[60%] flex flex-col items-end justify-start gap-2 text-left text-base font-gilroy-semibold">
                    <input
                      type="text"
                      className="input-capsule__input text-13xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold bg-black"
                      placeholder="Team Name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={!hasJoinedDiscord}
                    />
                    <div className="flex flex-row gap-2 items-end justify-end">
                      <div
                        className={`hover:opacity-70 transition ease-in-out duration-300 w-[110px] rounded-lg border-primary border-[1px] border-solid box-border h-[34px] flex flex-row items-center justify-center py-2 px-4 ${!hasJoinedDiscord ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={() =>
                          handleCreateOrJoinTeam("create", teamName)
                        }
                      >
                        <div className="mt-0.5 relative tracking-[-0.03em] leading-[120.41%] text-sm">
                          Create
                        </div>
                      </div>
                      <div
                        className={`hover:opacity-70 transition ease-in-out duration-300 w-[110px] rounded-lg bg-primary h-[34px] flex flex-row items-center justify-center py-2 px-4 box-border text-bg ${!hasJoinedDiscord ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={() => handleCreateOrJoinTeam("join", teamName)}
                      >
                        <div className="mt-0.5 relative tracking-[-0.03em] leading-[120.41%] text-sm">
                          Join
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  className="mt-6 rounded-3xl w-full h-[200px] object-cover"
                  alt=""
                  src="/@2x.png"
                />
              </div>
            </div>
            <div className="self-stretch w-full lg:w-[50%]">
              <div className="flex-1 rounded-2xl bg-bg flex flex-col items-start justify-center p-4 md:p-6 box-border gap-4 text-left text-5xl text-neutral-06 font-gilroy-semibold">
                <div className="flex flex-row items-center justify-start gap-1">
                  <img
                    className="w-10 relative h-10"
                    alt=""
                    src="/vuesaxboldflag.svg"
                  />
                  <div className="relative tracking-[-0.03em] leading-[120.41%]">
                    Join the Best Team
                  </div>
                </div>
                <div className="self-stretch flex-1 rounded-2xl bg-gray-100 flex flex-col items-center justify-start p-3 md:p-6 text-center text-sm font-gilroy-medium">
                  <div className="self-stretch flex flex-row items-start justify-start">
                    <div className="w-[146px] flex flex-col items-center justify-start gap-2">
                      <div className="self-stretch flex flex-row items-center justify-start py-2 px-0">
                        <div className="relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                          Team Name
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col items-start justify-start text-left text-base font-gilroy-semibold">
                        {topTeams?.map((team, index) => (
                          <div
                            key={team._id}
                            className="self-stretch h-[50px] flex flex-row items-center justify-start gap-2"
                          >
                            <img
                              className="w-8 relative rounded-[50%] h-8 object-cover"
                              alt={`Team ${team.name}`}
                              src={catImages[index]}
                            />
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              {team.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-start gap-2">
                      <div className="self-stretch flex flex-row items-center justify-center p-2">
                        <div className="relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                          Members
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col items-start justify-start text-base font-gilroy-regular">
                        {topTeams?.map((team, index) => (
                          <div
                            key={index}
                            className="self-stretch h-[50px] flex flex-row items-center justify-center p-2 box-border"
                          >
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              {team.memberCount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-start gap-2 text-left">
                      <div className="self-stretch flex flex-row items-center justify-center p-2">
                        <div className="relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                          TVL
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col items-start justify-start text-center text-base font-gilroy-regular">
                        {topTeams?.map((team, index) => (
                          <div
                            key={index}
                            className="self-stretch h-[50px] flex flex-row items-center justify-center p-2 box-border"
                          >
                            <div className="relative tracking-[-0.03em] leading-[120.41%]">
                              {`$ ${formatNumberToKOrM(Number(team.tvl))}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-[103px] flex flex-col items-end justify-center gap-2 text-left">
                      <div className="self-stretch flex flex-row items-center justify-center p-2">
                        <div className="relative tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                          Action
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col items-end justify-center text-base text-primary font-gilroy-semibold">
                        {topTeams?.map((team, index) => (
                          <div
                            key={index}
                            className="self-stretch flex flex-col items-center justify-center p-2"
                          >
                            <div
                              className={`hover:opacity-70 transition ease-in-out duration-300 rounded-lg border-primary border-[1px] border-solid box-border h-[34px] flex flex-row items-center justify-center py-2 px-4 ${!hasJoinedDiscord ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              onClick={() =>
                                handleCreateOrJoinTeam("join", team.name)
                              }
                            >
                              <div className="mt-1 relative tracking-[-0.03em] leading-[120.41%]">
                                Join
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

export default Points;
