import Head from "next/head";
import { FC, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from "../../src/stores/useUserSOLBalanceStore";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const Stats: FC = () => {
  const [leaderboard1Day, setLeaderboard1Day] = useState([]);
  const [leaderboard7Days, setLeaderboard7Days] = useState([]);
  const [leaderboard30Days, setLeaderboard30Days] = useState([]);
  const { publicKey } = useWallet();
  const [leaderboardallDays, setLeaderboardallDays] = useState([]);
  const [currentLeaderboard, setCurrentLeaderboard] = useState([]);
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  const [isCompetition, setIsCompetition] = useState(false);
  const [isTeamCompetition, setIsTeamCompetition] = useState(false);
  const [leaderboardCompetetion, setLeaderboardCompetetion] = useState([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);

  const [sortCriterion, setSortCriterion] = useState("PnL"); // Default sorting criterion

  const sortLeaderboard = (leaderboard, criterion) => {
    return [...leaderboard].sort((a, b) => {
      return criterion === "totalVolume"
        ? b.totalVolume - a.totalVolume
        : b.PnL - a.PnL;
    });
  };

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection]);

  const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT8;
  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const resCompetition = await fetch(
          `${ENDPOINT}/api/leaderboard/competition`
        );
        const leaderboardCompetetion = await resCompetition.json();

        const teamCompetition = await fetch(`${ENDPOINT}/api/leaderboard/team`);
        const teamCompetitions = await teamCompetition.json();

        const res1Day = await fetch(`${ENDPOINT}/api/leaderboard/1`);
        const leaderboard1Day = await res1Day.json();

        const res7Days = await fetch(`${ENDPOINT}/api/leaderboard/7`);
        const leaderboard7Days = await res7Days.json();

        const res30Days = await fetch(`${ENDPOINT}/api/leaderboard/30`);
        const leaderboard30Days = await res30Days.json();

        const resallDays = await fetch(`${ENDPOINT}/api/leaderboard/all`);
        const leaderboardallDaysData = await resallDays.json();
        const leaderboardallDays = leaderboardallDaysData.slice();

        setLeaderboard1Day(leaderboard1Day);
        setLeaderboard7Days(leaderboard7Days);
        setLeaderboard30Days(leaderboard30Days);
        setLeaderboardCompetetion(leaderboardCompetetion);
        setLeaderboardallDays(leaderboardallDays);
        setTeamLeaderboard(teamCompetitions);
        if (!isCompetition) {
          setCurrentLeaderboard(leaderboard30Days);
        } else {
          setCurrentLeaderboard(leaderboardCompetetion);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      }
    };

    fetchLeaderboards();
  }, []);

  const handleSort = (criterion) => {
    const sortedLeaderboard1Day = sortLeaderboard(leaderboard1Day, criterion);
    const sortedLeaderboard7Days = sortLeaderboard(leaderboard7Days, criterion);
    const sortedLeaderboard30Days = sortLeaderboard(
      leaderboard30Days,
      criterion
    );
    const sortedLeaderboardCompetition = sortLeaderboard(
      leaderboardCompetetion,
      criterion
    );
    const sortedLeaderboardAllDays = sortLeaderboard(
      leaderboardallDays,
      criterion
    );

    setLeaderboard1Day(sortedLeaderboard1Day);
    setLeaderboard7Days(sortedLeaderboard7Days);
    setLeaderboard30Days(sortedLeaderboard30Days);
    setLeaderboardCompetetion(sortedLeaderboardCompetition);
    setLeaderboardallDays(sortedLeaderboardAllDays);

    // Update currentLeaderboard based on the current view
    if (!isCompetition) {
      if (currentLeaderboard === leaderboard1Day) {
        setCurrentLeaderboard(sortedLeaderboard1Day);
      } else if (currentLeaderboard === leaderboard7Days) {
        setCurrentLeaderboard(sortedLeaderboard7Days);
      } else if (currentLeaderboard === leaderboard30Days) {
        setCurrentLeaderboard(sortedLeaderboard30Days);
      } else {
        setCurrentLeaderboard(sortedLeaderboardAllDays);
      }
    } else {
      setCurrentLeaderboard(sortedLeaderboardCompetition);
    }

    setSortCriterion(criterion);
  };

  const calculateVolume = () => {
    let volume = 0;
    leaderboardallDays.forEach((item) => {
      volume += 2 * item.totalVolume;
    });
    return volume / LAMPORTS_PER_SOL;
  };

  const calculateFees = () => {
    let fees = 0;
    leaderboardallDays.forEach((item) => {
      fees += item.Fees;
    });
    return fees / LAMPORTS_PER_SOL;
  };

  const calculateUniquePlayers = () => {
    const uniquePlayers = new Set();
    leaderboardallDays.forEach((item) => {
      uniquePlayers.add(item.playerAcc);
    });
    return uniquePlayers.size;
  };

  const calculateVolume24 = () => {
    let volume = 0;
    leaderboard1Day.forEach((item) => {
      volume += 2 * item.totalVolume;
    });
    return volume / LAMPORTS_PER_SOL;
  };

  const calculateFees24 = () => {
    let fees = 0;
    leaderboard1Day.forEach((item) => {
      fees += item.Fees;
    });
    return fees / LAMPORTS_PER_SOL;
  };

  const calculateUniquePlayers24 = () => {
    const uniquePlayers = new Set();
    leaderboard1Day.forEach((item) => {
      uniquePlayers.add(item.playerAcc);
    });
    return uniquePlayers.size;
  };

  const [activeSection, setActiveSection] = useState("protocol");
  const showPersonal = () => setActiveSection("personal");
  const showProtocol = () => setActiveSection("protocol");

  return (
    <div>
      <Head>
        <title>PopFi | Stats</title>
        <meta name="description" content="PopFi" />
      </Head>
      <div className="bg-base flex justify-center md:pt-2 min-h-[calc(100vh-78px)]">
        <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] ">
          <div className="bankGothic flex flex-col  gap-[8px] text-4xl mt-2 lg:text-5xl text-white">
            <h1 className="bankGothic md:text-start text-center text-4xl mt-2 lg:text-5xl text-transparent bg-clip-text bg-white">
              Statistics
            </h1>
          </div>
          <img
            className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/sheesh/donut1.svg"
          />
          <div className="w-full flex md:flex-row flex-col gap-2 md:px-0 px-2 z-10"></div>
          <div className="mt-2 w-full flex md:flex-row flex-col items-start justify-start gap-[8px] md:px-0 px-2">
            <div className="md:w-1/3 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons18.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium md:text-center">
                  TOTAL VOLUME (24H)
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {calculateVolume().toFixed(1)} SOL (
                  {calculateVolume24().toFixed(1)})
                </div>
              </div>
            </div>
            <div className="z-10 md:w-1/3 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons19.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium md:text-center">
                  TOTAL FEES (24H)
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {calculateFees().toFixed(2)} SOL (
                  {calculateFees24().toFixed(2)})
                </div>
              </div>
            </div>
            <div className="z-10 md:w-1/3 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
              <img
                className="relative w-[60px] h-[60px]"
                alt=""
                src="/sheesh/icons20.svg"
              />
              <div className="h-[60px] flex flex-col justify-center items-start md:items-center">
                <div className="relative leading-[100%] font-medium md:text-center">
                  TRADERS (24H)
                </div>
                <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
                  {calculateUniquePlayers()} ({calculateUniquePlayers24()})
                </div>
              </div>
            </div>
          </div>

          {isTeamCompetition && (
            <h1 className="pt-6 bankGothic md:text-start md:text-left text-center text-4xl lg:text-5xl text-transparent bg-clip-text bg-white">
              DAO WARS
            </h1>
          )}
          {isTeamCompetition && (
            <div className="md:px-0 px-2 mt-4 flex flex md:flex-row flex-col items-start justify-start gap-[8px] text-5xl text-white">
              {teamLeaderboard.slice(0, 3).map((item, index) => {
                return (
                  <div
                    key={item}
                    className="w-full text-3xl flex flex-col md:flex-row items-start justify-start gap-[8px]"
                  >
                    <div className="z-10 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-col items-center justify-center pt-4 px-4 pb-6 gap-[16px] border-[1px] border-solid border-layer-3">
                      <div className="flex flex-col items-center justify-center gap-[4px]">
                        <img
                          className="relative w-[84.7px] h-[80.9px]"
                          alt=""
                          src={`/${item.teamName}.png`}
                        />
                        <div className="relative leading-[100%] font-medium flex flex-row items-center justify-center gap-2">
                          <img
                            className=" w-[24px] h-[24px]"
                            alt=""
                            src={`/sheesh/${24 + index}.svg`}
                          />
                          <a> {`${item.teamName}`}</a>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-row items-center justify-between text-right text-xs text-grey-text font-poppins">
                        <div className="flex flex-col items-start justify-center gap-[16px]">
                          <div className="flex flex-col items-start justify-center gap-[4px]">
                            <div className="relative leading-[12px]">
                              Total Trades
                            </div>
                            <div className="relative text-[15px] leading-[12px] text-white">
                              {item.totalTrades}
                            </div>
                          </div>
                          <div className="flex flex-col items-start justify-center gap-[4px]">
                            <div className="relative leading-[12px]">
                              Total Volume
                            </div>
                            <div className="relative text-[15px] leading-[12px] text-white">
                              {(
                                (item.totalVolume / LAMPORTS_PER_SOL) *
                                2
                              ).toFixed(1)}{" "}
                              SOL
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-[16px]">
                          <div className="flex flex-col items-end justify-center gap-[4px]">
                            <div className="relative leading-[12px]">
                              Win Ratio
                            </div>
                            <div className="relative text-[15px] leading-[12px] text-white">
                              {Number.isInteger(100 * item.winRate)
                                ? 100 * item.winRate
                                : (100 * item.winRate).toFixed(1)}{" "}
                              %
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-center gap-[4px]">
                            <div className="relative leading-[12px]">PnL</div>
                            <div className="relative text-[15px] leading-[12px] text-white">
                              {(item.PnL / LAMPORTS_PER_SOL).toFixed(2)} SOL
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div
            style={{ position: "relative", zIndex: 100 }}
            className="flex flex-col md:items-start items-center text-13xl text-white md:px-0 px-2"
          >
            <h1 className="pt-6 bankGothic md:text-start md:text-left text-center text-4xl lg:text-5xl text-transparent bg-clip-text bg-white">
              Leaderboard
            </h1>
            <div className="mt-2 flex md:flex-row flex-col items-center justify-between md:gap-[16px] text-lg text-grey-text w-full md:rounded-xl rounded-lg bg-layer-1 border-[1px] border-solid border-layer-3 px-4">
              <div className="self-stretch md:w-1/3 flex flex-row items-center justify-center md:justify-start gap-[8px] z-100 py-2">
                <button
                  onClick={() => handleSort("PnL")}
                  className={`w-[120px] rounded-lg h-8 flex flex-row items-center justify-center box-border ${
                    sortCriterion === "PnL"
                      ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                      : "bg-transparent border border-grey"
                  }`}
                >
                  <div
                    className={`flex justify-center items-center h-full w-full rounded-lg ${
                      sortCriterion === "PnL"
                        ? "bg-[#0B111B] bg-opacity-80"
                        : "bg-opacity-0 hover:bg-[#484c6d5b]"
                    }`}
                  >
                    <div
                      className={`bankGothic bg-clip-text text-transparent uppercase ${
                        sortCriterion === "PnL"
                          ? "bg-gradient-to-t from-[#34C796] to-[#0B7A55]"
                          : "bg-grey"
                      }`}
                    >
                      PnL
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleSort("totalVolume")}
                  className={`w-[120px] rounded-lg h-8 flex flex-row items-center justify-center box-border ${
                    sortCriterion === "totalVolume"
                      ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                      : "bg-transparent border border-grey"
                  }`}
                >
                  <div
                    className={`flex justify-center items-center h-full w-full rounded-lg ${
                      sortCriterion === "totalVolume"
                        ? "bg-[#0B111B] bg-opacity-80"
                        : "bg-opacity-0 hover:bg-[#484c6d5b]"
                    }`}
                  >
                    <div
                      className={`bankGothic bg-clip-text text-transparent uppercase ${
                        sortCriterion === "totalVolume"
                          ? "bg-gradient-to-t from-[#34C796] to-[#0B7A55]"
                          : "bg-grey"
                      }`}
                    >
                      VOL
                    </div>
                  </div>
                </button>
              </div>
              <div className="md:hidden flex flex-row gap-3">
                {!isCompetition && (
                  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
                    <div
                      onClick={() => setCurrentLeaderboard(leaderboard1Day)}
                      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === leaderboard1Day
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == leaderboard1Day ? "text-white" : "text-gray-text"} `}
                    >
                      1<span className="ml-0.5">d</span>
                    </div>
                  </button>
                )}
                {!isCompetition && (
                  <button className="flex flex-row items-center justify-center py-1 px-0">
                    <div
                      onClick={() => setCurrentLeaderboard(leaderboard7Days)}
                      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === leaderboard7Days
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == leaderboard7Days ? "text-white" : "text-gray-text"} `}
                    >
                      7<span className="ml-0.5">d</span>
                    </div>
                  </button>
                )}
                {isCompetition && (
                  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
                    <div
                      onClick={() =>
                        setCurrentLeaderboard(leaderboardCompetetion)
                      }
                      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === leaderboardCompetetion
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == leaderboardCompetetion ? "text-white" : "text-gray-text"} `}
                    >
                      Comp
                    </div>
                  </button>
                )}
                <button className="flex flex-row items-center justify-center py-1 px-0">
                  <div
                    onClick={() => setCurrentLeaderboard(leaderboard30Days)}
                    className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                      currentLeaderboard === leaderboard30Days
                        ? " cursor-pointer border-b-2 border-gradient"
                        : "cursor-pointer text-grey-text "
                    } ${currentLeaderboard == leaderboard30Days ? "text-white" : "text-gray-text"} `}
                  >
                    30<span className="ml-0.5">d</span>
                  </div>
                </button>
                <button className="flex flex-row items-center justify-center py-1 px-0">
                  <div
                    onClick={() => setCurrentLeaderboard(leaderboardallDays)}
                    className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                      currentLeaderboard === leaderboardallDays
                        ? " cursor-pointer border-b-2 border-gradient"
                        : "cursor-pointer text-grey-text "
                    } ${currentLeaderboard == leaderboardallDays ? "text-white" : "text-gray-text"} `}
                  >
                    ALL
                  </div>
                </button>
              </div>

              <div className="hidden md:flex flex-row gap-3">
                {!isCompetition && (
                  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
                    <div
                      onClick={() => setCurrentLeaderboard(leaderboard1Day)}
                      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === leaderboard1Day
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == leaderboard1Day ? "text-white" : "text-gray-text"} `}
                    >
                      1 DAY
                    </div>
                  </button>
                )}
                {!isCompetition && (
                  <button className="flex flex-row items-center justify-center py-1 px-0">
                    <div
                      onClick={() => setCurrentLeaderboard(leaderboard7Days)}
                      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === leaderboard7Days
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == leaderboard7Days ? "text-white" : "text-gray-text"} `}
                    >
                      7 DAYS
                    </div>
                  </button>
                )}
                {isCompetition && (
                  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
                    <div
                      onClick={() =>
                        setCurrentLeaderboard(leaderboardCompetetion)
                      }
                      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                        currentLeaderboard === leaderboardCompetetion
                          ? " cursor-pointer border-b-2 border-gradient"
                          : "cursor-pointer text-grey-text "
                      } ${currentLeaderboard == leaderboardCompetetion ? "text-white" : "text-gray-text"} `}
                    >
                      COMPETITION
                    </div>
                  </button>
                )}
                <button className="flex flex-row items-center justify-center py-1 px-0">
                  <div
                    onClick={() => setCurrentLeaderboard(leaderboard30Days)}
                    className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                      currentLeaderboard === leaderboard30Days
                        ? " cursor-pointer border-b-2 border-gradient"
                        : "cursor-pointer text-grey-text "
                    } ${currentLeaderboard == leaderboard30Days ? "text-white" : "text-gray-text"} `}
                  >
                    30 DAYS
                  </div>
                </button>
                <button className="flex flex-row items-center justify-center py-1 px-0">
                  <div
                    onClick={() => setCurrentLeaderboard(leaderboardallDays)}
                    className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                      currentLeaderboard === leaderboardallDays
                        ? " cursor-pointer border-b-2 border-gradient"
                        : "cursor-pointer text-grey-text "
                    } ${currentLeaderboard == leaderboardallDays ? "text-white" : "text-gray-text"} `}
                  >
                    ALL TIME
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="md:px-0 px-2 mt-2 flex flex md:flex-row flex-col items-start justify-start gap-[8px] text-5xl text-white">
            {currentLeaderboard.slice(0, 3).map((item, index) => {
              return (
                <div
                  key={item}
                  style={{ position: "relative", zIndex: 100 }}
                  className="w-full text-3xl flex flex-col md:flex-row items-start justify-start gap-[8px]"
                >
                  <div className="z-10 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-col items-center justify-center pt-4 px-4 pb-6 gap-[16px] border-[1px] border-solid border-layer-3">
                    <div className="flex flex-col items-center justify-center gap-[4px]">
                      <img
                        className="relative w-[84.7px] h-[80.9px]"
                        alt=""
                        src={`/sheesh/${24 + index}.svg`}
                      />
                      <div className="relative leading-[100%] font-medium">
                        <a
                          href={`https://solscan.io/account/${item.playerAcc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >{`${item.playerAcc.slice(0, 3)}...${item.playerAcc.slice(-3)}`}</a>
                      </div>
                    </div>
                    <div className="self-stretch flex flex-row items-center justify-between text-right text-xs text-grey-text font-poppins">
                      <div className="flex flex-col items-start justify-center gap-[16px]">
                        <div className="flex flex-col items-start justify-center gap-[4px]">
                          <div className="relative leading-[12px]">
                            Total Trades
                          </div>
                          <div className="relative text-[15px] leading-[12px] text-white">
                            {item.totalTrades}
                          </div>
                        </div>
                        <div className="flex flex-col items-start justify-center gap-[4px]">
                          <div className="relative leading-[12px]">
                            Total Volume
                          </div>
                          <div className="relative text-[15px] leading-[12px] text-white">
                            {(
                              (item.totalVolume / LAMPORTS_PER_SOL) *
                              2
                            ).toFixed(1)}{" "}
                            SOL
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-[16px]">
                        <div className="flex flex-col items-end justify-center gap-[4px]">
                          <div className="relative leading-[12px]">
                            Win Ratio
                          </div>
                          <div className="relative text-[15px] leading-[12px] text-white">
                            {Number.isInteger(100 * item.winRate)
                              ? 100 * item.winRate
                              : (100 * item.winRate).toFixed(1)}{" "}
                            %
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-[4px]">
                          <div className="relative leading-[12px]">PnL</div>
                          <div className="relative text-[15px] leading-[12px] text-white">
                            {(item.PnL / LAMPORTS_PER_SOL).toFixed(2)} SOL
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{ position: "relative", zIndex: 100 }}
            className="md:px-0 px-2"
          >
            <div className="z-10 h-[600px] overflow-scroll custom-scrollbar mt-2 rounded-lg md:rounded-2xl bg-layer-1 box-border w-full overflow-hidden flex flex-col items-start justify-start p-4 gap-[16px] text-right font-poppins border-[1px] border-solid border-layer-3">
              <table className="w-full relative h-3 text-sm text-grey-text text-end ">
                <thead>
                  <tr>
                    <th className=" font-normal w-[3%] leading-[9.98px] text-start font-poppins">
                      #
                    </th>
                    <th className=" font-normal w-[8%] leading-[9.98px] text-start font-poppins">
                      User
                    </th>
                    <th className=" font-normal w-[13%] leading-[12px] ">
                      Total Trades
                    </th>
                    <th className=" font-normal w-[13%] leading-[12px] ">
                      Total Volume
                    </th>
                    <th className=" font-normal w-[13%] leading-[12px]">
                      Win Ratio
                    </th>
                    <th className=" font-normal w-[13%] leading-[12px]  pb-2">
                      PnL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeaderboard.slice(3).map((item, index) => (
                    // Your code for rendering each user in a table row
                    <tr
                      key={item.playerAcc}
                      className="text-end text-[15px] shadow-md overflow-scroll"
                    >
                      <td className="text-start">{index + 4}</td>
                      <td className="text-start">
                        {" "}
                        <a
                          href={`https://solscan.io/account/${item.playerAcc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >{`${item.playerAcc.slice(0, 3)}...${item.playerAcc.slice(-3)}`}</a>
                      </td>
                      <td className="text-white">{item.totalTrades}</td>
                      <td className="text-white">
                        {" "}
                        {((item.totalVolume / LAMPORTS_PER_SOL) * 2).toFixed(
                          1
                        )}{" "}
                        SOL
                      </td>
                      <td className="text-white">
                        {" "}
                        {Number.isInteger(100 * item.winRate)
                          ? 100 * item.winRate
                          : (100 * item.winRate).toFixed(1)}{" "}
                        %
                      </td>
                      <td className="text-white py-2">
                        {" "}
                        {(item.PnL / LAMPORTS_PER_SOL).toFixed(2)} SOL
                      </td>
                      {/* ... other user details in table cells */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
