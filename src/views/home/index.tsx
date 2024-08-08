import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef, FC } from "react";
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
import Frame1 from "./components/Frame1";

// Dynamically import the StarfieldAnimationComponent with SSR disabled

export const HomeView: FC = ({}) => {
  const { connection } = useConnection();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [lotteryAccountData, setLotteryAccountData] =
    useState<LotteryAccountJSON | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);

  const [windowWidth, setWindowWidth] = useState(0);

  async function checkLotteryAccount(
    connection: Connection
  ): Promise<LotteryAccountJSON> {
    const lotteryAcc = new PublicKey(
      "5aB2uyiesNo28v2g6CsfdcXVNs2feN74TNsexPHZih1Q"
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
      };
    }

    return lotteryAccount.toJSON();
  }

  useEffect(() => {
    fetchLotteryAccountData();
  }, [connection]);

  const fetchLotteryAccountData = async () => {
    try {
      const data = await checkLotteryAccount(connection);
      console.log("rawdata", data);
      setLotteryAccountData(data);
      const totalParticipants = data.participants.length;
      // Store the total number of participants
      setTotalParticipants(totalParticipants);
    } catch (error) {
      console.error("Error fetching lottery account data:", error);
    }
  };

  return (
    <div className="w-full relative bg-layer-1 overflow-hidden flex flex-col items-center justify-center box-border  leading-[normal] tracking-[normal] text-left text-sm text-gray-200 font-gilroy-regular">
      <header className="h-9.5 flex flex-row justify-between items-center max-w-[1700px] w-[95%] py-[29px] ">
        {" "}
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
        </div>
        <Link href="/lottery" className="no-underline">
          <button className="cursor-pointer [border:none] py-[7px] pl-4 pr-3 bg-primary rounded-lg overflow-hidden flex flex-row items-start justify-start gap-1 shrink-0">
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
          className={` self-stretch rounded-3xl flex flex-row items-end justify-start pt-[99px] pb-[52px] px-12 box-border   text-left text-base text-neutral-06 font-gilroy-semibold lg:flex-wrap  lg:box-border`}
          style={{
            backgroundImage: "url('/rectangle-17@2x.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top",
          }}
        >
          <div className="flex-1 flex flex-col items-start justify-start pt-0 px-0  box-border min-w-[424px] max-w-full ">
            <div className="self-stretch flex lg:flex-row flex-col items-start justify-start gap-[30px] z-[1]">
              <div className="w-full lg:w-1/2 self-stretch flex flex-col items-start justify-start gap-4">
                <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%] text-primary">
                  Stake Together, Win Individually
                </div>
                <h1 className="m-0 self-stretch relative xl:text-[60px] text-[50px] tracking-[-0.03em] leading-[120.41%] font-normal font-[inherit] ">
                  A lossless lottery platform built on top of Liquidity Staking.
                </h1>

                <div className="flex flex-col gap-[8px] ">
                  <div className="flex flex-row items-center justify-start gap-2 opacity-[0.5] text-mini font-gilroy-regular ">
                    <div className="relative tracking-[-0.03em] leading-[120.41%] inline-block min-w-[77px]">
                      Powered by
                    </div>
                    <img
                      className="h-[21.1px] w-[62px] relative overflow-hidden shrink-0"
                      loading="lazy"
                      alt=""
                      src="/pyth-logotype-light.svg"
                    />
                  </div>
                  <Link href="/lottery" className="no-underline">
                    <button className="cursor-pointer [border:none] py-[7px] pl-4 pr-3 bg-primary rounded-lg overflow-hidden flex flex-row items-center justify-center gap-1 whitespace-nowrap hover:bg-limegreen">
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
                <div className="w-full md:w-1/3 lg:w-1/2 h-full flex">
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
                    prop={`$${(Number(lotteryAccountData?.totalDeposits) / LAMPORTS_PER_SOL).toFixed(2)}`}
                    divFontSize="32px"
                    divColor="#fff"
                    className="flex-1"
                  />
                </div>
                <div className="flex-1 flex lg:flex-col md:flex-row flex-col items-start justify-start gap-4 w-full">
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
                    className="flex-1"
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
                    prop="$6,443.21"
                    divFontSize="32px"
                    divColor="#fff"
                    className="flex-1"
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
            propMinHeight="unset"
            vuesaxbulkimport="/vuesaxbulklikeshapes.svg"
            deposit="Win Solana"
            depositYourTokensAndStart="Win rewards from collective staking, Risklessly."
          />
          <FrameComponent
            propMinHeight="230px"
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
