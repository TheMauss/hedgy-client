import { FC, useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import socketIOClient from "socket.io-client";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FaWallet, FaStream, FaShareAlt } from "react-icons/fa";
import { notify } from "../utils/notifications";
import domtoimage from "dom-to-image";
import Modal from "react-modal";
import { UserAccount } from "../out/accounts/UserAccount";
import { PROGRAM_ID } from "../out/programId";
import { clearInterval, setInterval } from "worker-timers";

const ENDPOINT1 = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;

interface Position {
  _id: string;
  binaryOption: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  symbol: number;
  resolved: boolean;
  payout: number;
  winner: string | null;
  expiration: number;
  expirationTime: number;
  remainingTime: string;
  timestamp: number;
  finalPrice: number;
  currentPrice: number;
}

interface MyPositionsProps {
  latestOpenedPosition: Record<string, Position | null>;
  setLatestOpenedPosition: React.Dispatch<
    React.SetStateAction<Record<string, Position | null>>
  >;
  handleTotalBetAmountChange: (total: number) => void; // add this line
  prices: { [key: string]: { price: number; timestamp: string } };
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const ITEMS_PER_PAGE = 10;

const MyPositions: FC<MyPositionsProps> = ({
  prices,
  setLatestOpenedPosition,
  handleTotalBetAmountChange,
}) => {
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

  const { connection } = useConnection();
  const [position, setPosition] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [resolvedPositions, setResolvedPositions] = useState<Position[]>([]);
  const { publicKey, connected } = useWallet(); // Add connected variable
  const walletAddress = publicKey?.toString() || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [isInit, setisInit] = useState<{
    isInitialized: boolean;
    usedAffiliate: Uint8Array;
    myAffiliate: Uint8Array;
  }>(null);
  const symbolMap = {
    0: "Crypto.SOL/USD",
    1: "Crypto.BTC/USD",
    // Add more symbols as needed
  };
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const socket2Ref = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  // Example breakpoint for 'md' in Tailwind CSS is 768px by default
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const total = positions.reduce(
      (total, position) => total + position.betAmount,
      0
    );
    handleTotalBetAmountChange(total); // This line passes the total back to the parent
  }, [positions]);

  useEffect(() => {
    let socket;
    let isMounted = true;

    const fetchSolanaTime = async () => {
      const currentSolanaTimestamp = await getSolanaTimestamp();
      if (isMounted) {
        setSolanaTimestamp(currentSolanaTimestamp);
      }
    };

    function setupSocket1() {
      socket = socketIOClient(ENDPOINT2);
      socket.emit("registerWallet", walletAddress);

      socket.on("positions", (positions: Position[]) => {
        const unresolvedPositions = positions.filter(
          (position) => !position.resolved
        );
        const resolvedPositions = positions.filter(
          (position) => position.resolved
        );

        setLatestOpenedPosition((prevPositions) => {
          const updatedPositions: Record<string, Position | null> = {
            ...prevPositions,
          };

          unresolvedPositions.forEach((position) => {
            updatedPositions[position.symbol.toString()] = position;
          });

          return updatedPositions;
        });

        setPositions(unresolvedPositions);
        setResolvedPositions(resolvedPositions);
        fetchSolanaTime();
      });

      socket.on("connect_error", (err) => {
        console.error(err.message);
      });
    }
    function setupSocket2() {
      socket2Ref.current = socketIOClient(ENDPOINT1);

      if (socket2Ref.current) {
        socket2Ref.current.off("position");
        socket2Ref.current.off("connect_error");
      }

      socket2Ref.current.emit("registerWallet", walletAddress);

      socket2Ref.current.on(
        "position",
        (updatedPosition: Position, latestPrice: number) => {
          setPositions((prevState) => {
            const positionExists = prevState.some(
              (position) => position._id === updatedPosition._id
            );

            if (positionExists) {
              // Update the existing position
              return prevState.map((position) =>
                position._id === updatedPosition._id
                  ? {
                      ...updatedPosition,
                      currentPrice: latestPrice,
                      remainingTime: calculateRemainingTime(
                        updatedPosition.expirationTime
                      ),
                    }
                  : position
              );
            } else if (!updatedPosition.resolved) {
              // Add the new position only if it's not resolved
              return [
                { ...updatedPosition, currentPrice: latestPrice },
                ...prevState,
              ];
            } else {
              // If the position is resolved, don't add it to the positions array
              return prevState;
            }
          });

          if (updatedPosition.resolved) {
            setResolvedPositions((prevState) => [
              ...prevState,
              updatedPosition,
            ]);

            setPositions((prevState) =>
              prevState.filter(
                (position) => position._id !== updatedPosition._id
              )
            );

            setLatestOpenedPosition((prevPositions) => {
              const nonResolvedSameSymbolPositions = positions.filter(
                (position) =>
                  position.symbol === updatedPosition.symbol &&
                  !position.resolved
              );

              // Sort by least remaining time
              nonResolvedSameSymbolPositions.sort((a, b) => {
                return (
                  calculateRemainingTimeInSeconds(a.remainingTime) -
                  calculateRemainingTimeInSeconds(b.remainingTime)
                );
              });

              const latestSameSymbolPosition =
                nonResolvedSameSymbolPositions.length
                  ? nonResolvedSameSymbolPositions[0]
                  : null;

              return {
                ...prevPositions,
                [updatedPosition.symbol.toString()]: latestSameSymbolPosition,
              };
            });
          } else {
            // Update the latest opened position for the symbol if the position is not resolved
            setLatestOpenedPosition((prevPositions) => {
              return {
                ...prevPositions,
                [updatedPosition.symbol.toString()]: {
                  ...updatedPosition,
                  currentPrice: latestPrice,
                },
              };
            });
          }

          // Notify the user
          if (updatedPosition.resolved) {
            notify({
              type: "success",
              message: `Option resolved`,
              description: `Your option ${updatedPosition.binaryOption.slice(0, 4)}...${updatedPosition.binaryOption.slice(-4)} has been resolved with payout of ${updatedPosition.payout / LAMPORTS_PER_SOL} SOL.`,
            });
          } else {
            notify({
              type: "success",
              message: `Option created`,
              description: `A new option ${updatedPosition.binaryOption.slice(0, 4)}...${updatedPosition.binaryOption.slice(-4)} has been created with entry price: ${(updatedPosition.initialPrice / 100000000).toFixed(3)} USD`,
            });
            fetchSolanaTime();
          }
        }
      );
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        if (!socket || !socket.connected) {
          setupSocket1();
        }
        if (!socket2Ref.current || !socket2Ref.current.connected) {
          setupSocket2();
        }
      }
    }
    // Initial setup
    setupSocket1();
    setupSocket2();

    // Reconnect logic when the app comes back to the foreground
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      isMounted = false;
      if (socket) socket.disconnect();
      if (socket2Ref.current) {
        socket2Ref.current.disconnect();
        socket2Ref.current.off("position");
        socket2Ref.current.off("connect_error");
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [walletAddress]);

  // Price updates
  useEffect(() => {
    setPositions((positions) =>
      positions.map((pos) => {
        const symbol = symbolMap[pos.symbol];
        const updatedPrice = prices[symbol];

        if (updatedPrice) {
          const currentPrice = updatedPrice.price;
          return {
            ...pos,
            currentPrice,
          };
        } else {
          return pos;
        }
      })
    );
  }, [prices]);

  const selectPosition = () => {
    setPosition(true);
  };

  const selectHistory = () => {
    setPosition(false);
  };

  const getSolanaTimestamp = async (): Promise<number> => {
    return Math.floor(Date.now() / 1000);
  };

  const [solanaTimestamp, setSolanaTimestamp] = useState<number>(null);

  useEffect(() => {
    // Fetch the current Solana timestamp
    const fetchSolanaTime = async () => {
      const currentSolanaTimestamp = await getSolanaTimestamp(); // You'll need to implement this function
      setSolanaTimestamp(currentSolanaTimestamp);
    };

    fetchSolanaTime();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (solanaTimestamp !== null) {
        // Increment the solanaTimestamp by 1 second
        setSolanaTimestamp((prevTimestamp) => prevTimestamp + 1);
        setPositions((positions) =>
          positions.map((position) => ({
            ...position,
            remainingTime: calculateRemainingTime(position.expirationTime),
          }))
        );

        setResolvedPositions((resolvedPositions) =>
          resolvedPositions.map((position) => ({
            ...position,
            remainingTime: calculateRemainingTime(position.expirationTime),
          }))
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [solanaTimestamp]);

  const calculateRemainingTime = (expirationTime: number): string => {
    if (!solanaTimestamp) {
      return ""; // or some other placeholder
    }

    const remainingTime = expirationTime - solanaTimestamp;
    if (remainingTime <= 0) {
      return "Expired";
    } else if (remainingTime <= 60) {
      return `${remainingTime} seconds`;
    } else if (remainingTime <= 3600) {
      return `${Math.floor(remainingTime / 60)} minutes`;
    } else {
      return `${Math.floor(remainingTime / 3600)} hours`;
    }
  };

  const calculateRemainingTimeInSeconds = (
    timeStr: string | undefined
  ): number => {
    if (!timeStr) {
      return 0; // Return a default value, or handle the case based on your requirements
    }
    if (timeStr === "Expired") {
      return 0;
    } else {
      const value = parseInt(timeStr);
      if (timeStr.includes("seconds")) {
        return value;
      } else if (timeStr.includes("minutes")) {
        return value * 60;
      } else if (timeStr.includes("hours")) {
        return value * 3600;
      } else {
        throw new Error("Unrecognized timeStr format");
      }
    }
  };

  const downloadAsPng = () => {
    const modal = document.getElementById("my-modal");
    domtoimage
      .toPng(modal)
      .then(function (dataUrl) {
        const link = document.createElement("a");
        link.download = "PopFi-trade.png";
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        console.error("oops, something went wrong!", error);
      });
  };

  const totalPages = Math.ceil(resolvedPositions.length / ITEMS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
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

  const [decodedString, setDecodedString] = useState("");

  useEffect(() => {
    // Check if userAffiliateData exists and has the 'myAffiliate' property with a length greater than 0
    if (isInit && isInit.myAffiliate.length > 0) {
      const decoded = Array.from(isInit.myAffiliate)
        .filter((byte) => byte !== 0)
        .map((byte) => String.fromCharCode(byte))
        .join("");
      setDecodedString(decoded);
    } else {
      setDecodedString("");
    }
  }, [isInit]);

  const renderPositions = (positionsToRender: Position[]) => {
    const unresolvedPositions = positionsToRender.filter(
      (item) => !item.resolved
    );
    // Reverse the array to show positions from newest to oldest
    unresolvedPositions.sort((a, b) => {
      const aRemainingTime = calculateRemainingTimeInSeconds(a.remainingTime);
      const bRemainingTime = calculateRemainingTimeInSeconds(b.remainingTime);
      return aRemainingTime - bRemainingTime;
    });

    const pnl = currentItem
      ? currentItem.priceDirection === 0
        ? currentItem.initialPrice < currentItem.currentPrice
          ? (currentItem.payout - currentItem.betAmount) / currentItem.betAmount
          : -currentItem.betAmount / currentItem.betAmount
        : currentItem.initialPrice > currentItem.currentPrice
          ? (currentItem.payout - currentItem.betAmount) / currentItem.betAmount
          : -currentItem.betAmount / currentItem.betAmount
      : 0;

    const ModalDetails1 = (
      <Modal
        className="bg-layer-1 border border-layer-3 rounded-[2rem]"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: "transparent",
          },
          content: {
            width: "1280px", // default width for desktop // default height for desktop
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0.25)",
            boxSizing: "border-box", // ensure padding and border are included in width/height calculations
          },
        }}
      >
        {currentItem && (
          <div
            className="custom-scrollbar h-full w-full p-0 m-0 box-border"
            id="my-modal"
            style={{}}
          >
            <div className="font-poppins relative w-full overflow-hidden flex flex-col items-center justify-center text-left text-84xl text-white rounded-[2rem] border border-layer-3 bg-layer-1">
              <div className="relative w-[1280px] h-[800px] z-1000">
                <img
                  className="absolute top-[105.2px] left-[243.2px] w-[760.8px] h-[760.8px]"
                  alt=""
                  src="/sheesh/abstract071.svg"
                />
                <div className="absolute top-[64px] right-[64px] rounded-lg bg-layer-2 flex flex-row items-start justify-start p-4 border-[4px] border-solid border-grey">
                  <button className="" onClick={downloadAsPng}>
                    <img
                      className="relative w-24 h-24"
                      alt=""
                      src="/sheesh/vuesaxlinearimport.svg"
                    />
                  </button>
                </div>
                <img
                  className="absolute my-0 mx-[!important] top-[64px] left-[64px] w-[404px] h-[133.6px] object-cover z-[3]"
                  alt=""
                  src="/sheesh/image-5@2x.png"
                />
                {currentItem.symbol === 0 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Sol.png"
                  />
                ) : currentItem.symbol === 1 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Btc.png"
                  />
                ) : null}
              </div>
              <div className="self-stretch flex flex-col items-center justify-center p-24 gap-[64px] z-[1]">
                <div className="bankGothic text-16xl relative leading-[80%] text-[160px]">
                  {currentItem.symbol === 0 ? (
                    <p className="">{`SOL/USD`}</p>
                  ) : currentItem.symbol === 1 ? (
                    <p className="">{`BTC/USD`}</p>
                  ) : null}
                </div>
                <div className="self-stretch flex flex-row items-center justify-start gap-[128px] text-right font-poppins">
                  <div className="h-[392px] flex flex-col items-start justify-start gap-[36px]">
                    <div className="flex flex-row items-center justify-start gap-[32px]">
                      {currentItem.priceDirection === 0 ? (
                        <>
                          <img
                            className="relative w-32 h-32"
                            alt=""
                            src="/sheesh/vuesaxbulktrendup2.svg"
                          />
                        </>
                      ) : (
                        <>
                          <img
                            className="relative w-32 h-32"
                            alt=""
                            src="/sheesh/vuesaxbulktrendup1.svg"
                          />
                        </>
                      )}

                      <div className="relative font-semibold text-[75px] leading-[100%]">
                        {currentItem.priceDirection === 0 ? (
                          <>
                            <span className="">LONG</span>
                          </>
                        ) : (
                          <>
                            <span className="">SHORT</span>
                          </>
                        )}{" "}
                        BIN
                      </div>
                    </div>
                    <div
                      className={
                        pnl > 0
                          ? "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#0B7A55] to-[#34C796] flex justify-center items-center rounded-2xl  p-1"
                          : "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#7A3636] to-[#C44141] flex justify-center items-center rounded-2xl  p-1"
                      }
                    >
                      <div className="bg-[#0B111B] bg-opacity-80 px-8 py-4 rounded-2xl ">
                        <span
                          className={
                            pnl > 0 ? "text-[#34C796]" : "text-red-500"
                          }
                        >
                          {Math.abs(pnl * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-[64px] text-base text-grey-text">
                    <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                      <div className="relative leading-[48px] ">
                        Strike Price
                      </div>
                      <div className="relative text-[78px] leading-[100%] font-medium text-white">
                        {currentItem.symbol === 1
                          ? (currentItem.initialPrice / 100000000).toFixed(1)
                          : (currentItem.initialPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                      <div className="relative leading-[48px] ">Mark Price</div>
                      <div className="relative text-[78px] leading-[100%] font-medium text-white">
                        {currentItem.symbol === 1
                          ? (currentItem.currentPrice / 100000000).toFixed(1)
                          : (currentItem.currentPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-layer-2 flex flex-row items-center justify-between px-24 py-14 z-[2] text-right text-base text-grey-text font-poppins">
                <div className="flex-1 flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center justify-start gap-[32px]">
                    <img
                      className="relative w-32 h-32"
                      alt=""
                      src="/sheesh/vuesaxbulkdiscountshape.svg"
                    />
                    <div className="relative leading-[48px] text-5xl">
                      Use Code
                    </div>
                  </div>
                  <div className="relative leading-[100%] text-7xl font-semibold text-white">
                    {decodedString}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    );

    return (
      <div>
        {unresolvedPositions.map((item, index) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.currentPrice
                ? item.payout / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.currentPrice
                ? item.payout / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL;

          const isEvenRow = index % 2 === 0;
          const rowStyle = {
            backgroundColor: isEvenRow ? "#232332" : "#1a1a25",
          };
          const timeStr = item.remainingTime || "";

          return !isMobile ? (
            <div
              key={item._id}
              className="px-2 flex flex  flex-row text-start rounded font-poppins"
            >
              <div className="flex items-center w-[22%] min-w-[150px] text-start text-sm    text-grey-text">
                <a
                  href={`https://solscan.io/account/${item.binaryOption}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="flex flex-row justify-center items-center rounded-l">
                    <div className="flex flex-row items-center text-grey-text">
                          {item.symbol === 0 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Sol.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">SOL/USD</p>
                            </div>
                          ) : item.symbol === 1 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Btc.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">BTC/USD</p>
                            </div>
                          ) : item.symbol === 2 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Pyth.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">PYTH/USD</p>
                            </div>
                          ) : item.symbol === 3 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Bonk.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">BONK/USD</p>
                            </div>
                          ) : item.symbol === 4 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Jup.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">JUP/USD</p>
                            </div>
                          ) : item.symbol === 5 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Eth.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">ETH/USD</p>
                            </div>
                          ) : item.symbol === 6 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Tia.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">TIA/USD</p>
                            </div>
                          ) : item.symbol === 7 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Sui.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">SUI/USD</p>
                            </div>
                          ) : null}
                        </div>       </div>
                </a><div
                  className={
                    item.priceDirection === 0
                      ? "text-[#34c796] "
                      : "text-red-500"
                  }
                >
                  {item.priceDirection === 0 ? (
                    <>
                      <div className="flex flex-row items-center pl-1">
                        {" "}
                        <img
                          className="relative w-5 h-5 pb-0.5"
                          alt=""
                          src="/new/component-82.svg"
                        />
                        <div className="text-[#34c796]">CALL</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center pl-1">
                        <img
                          className="relative w-5 h-5 pb-0.5"
                          alt=""
                          src="/new/component-81.svg"
                        />
                        <div className="text-red-500">PUT</div>
                      </div>
                    </>
                  )}
           
                </div>  
              </div>
              <div className="flex justify-end items-center  w-[15%] min-w-[90px] text-start text-sm  ">
                <p>
                  {item.symbol === 1
                    ? (item.initialPrice / 100000000).toFixed(1)
                    : (item.initialPrice / 100000000).toFixed(3)}
                </p>
              </div>
              <div className="flex justify-end items-center w-[15%] min-w-[90px] text-start text-sm  ">
                <p>
                  {item.symbol === 1
                    ? (item.currentPrice / 100000000).toFixed(1)
                    : (item.currentPrice / 100000000).toFixed(3)}
                </p>
              </div>
              <div className="flex justify-end items-center w-[15%] min-w-[140px] text-start text-sm  ">
              <p>{timeStr}</p>
              </div>
              <div className="flex justify-end items-center   w-[12%] min-w-[90px] text-start text-sm  ">
                <p>{(item.betAmount/LAMPORTS_PER_SOL).toFixed(2)}◎</p>
              </div>
              <div className="flex justify-end items-center   w-[10%]  min-w-[90px] text-start text-sm  ">
                <p className={pnl >= 0 ? "text-[#34c796] " : "text-red-500 "}>
                  {pnl.toFixed(2)}◎
                </p>
              </div>
              <div className="flex justify-end items-center w-[14%] min-w-[140px] text-[0.9rem] text-grey-text   font-poppins py-1.5 rounded-r">
                  <div className="flex justify-end  w-[70%] min-w-[140px]">
                    <button
                      className="min-w-[80px] h-[26px] bg-[#1D202F] text-grey-text hover:bg-[#484c6d5b] text-[0.9rem]  py-0.5 px-4 rounded flex items-center justify-center"
                      onClick={() => {
                        setCurrentItem(item);
                        setModalIsOpen(true);
                      }}
                    >
                      Share <FaShareAlt size={12} className="ml-1 " />
                    </button>
                  </div>
              </div>
            </div>
          ) : (
            <div className="self-stretch flex flex-col items-center justify-start text-left text-xs">
              <div className="self-stretch bg-layer-1 flex flex-col items-start justify-start p-4 gap-[16px]  border-layer-3 text-poppins">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start justify-center gap-[4px] ">
                    <div className="relative leading-[9.98px] flex items-center text-grey-text w-[50px]">
                      Position
                    </div>
                    <div className="relative leading-[12px]">
                      {" "}
                      <a
                  href={`https://solscan.io/account/${item.binaryOption}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="flex flex-row justify-center items-center rounded-l">
                    <div className="flex flex-row items-center">
                          {item.symbol === 0 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Sol.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">SOL/USD</p>
                            </div>
                          ) : item.symbol === 1 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Btc.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">BTC/USD</p>
                            </div>
                          ) : item.symbol === 2 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Pyth.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">PYTH/USD</p>
                            </div>
                          ) : item.symbol === 3 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Bonk.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">BONK/USD</p>
                            </div>
                          ) : item.symbol === 4 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Jup.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">JUP/USD</p>
                            </div>
                          ) : item.symbol === 5 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Eth.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">ETH/USD</p>
                            </div>
                          ) : item.symbol === 6 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Tia.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">TIA/USD</p>
                            </div>
                          ) : item.symbol === 7 ? (
                           <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Sui.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">SUI/USD</p>
                            </div>
                          ) : null}
                        </div>       </div>
                </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-[6px] text-right">
                    <div className="relative leading-[12px] text-grey-text">
                      Payout
                    </div>
                    <div className="flex flex-col items-end justify-center gap-[4px] text-sm text-primary">
                      <div className="relative leading-[12px] ">
                        <p
                          className={
                            pnl >= 0 ? "text-[#34c796] " : "text-red-500 "
                          }
                        >
                          {pnl.toFixed(2)} SOL
                        </p>
                      </div>
                      <div className="relative leading-[12px] text-grey-text hidden">
                        0.050 SOL
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-between text-right">
                  <div className="flex flex-col items-start justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Direction
                    </div>
                    <div className="flex flex-col items-start justify-center gap-[4px] text-left text-sm text-short">
                      <div
                        className={
                          item.priceDirection === 0
                            ? "flex flex-row items-center text-[#34c796] "
                            : "flex flex-row items-center text-red-500"
                        }
                      >
                        {item.priceDirection === 0 ? (
                          <>
                            <img
                              className="relative w-5 h-5 pb-0.5"
                              alt=""
                              src="/new/component-82.svg"
                            />
                            <span className="ml-1">LONG</span>
                          </>
                        ) : (
                          <>
                            <img
                              className="relative w-5 h-5 pb-0.5"
                              alt=""
                              src="/new/component-81.svg"
                            />
                            <span className="ml-1">SHORT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Expiration Time
                    </div>
                    <div className="flex flex-col items-end justify-center gap-[4px] text-sm text-white">
                      <div className="relative leading-[12px]">{timeStr}</div>
                    </div>
                  </div>
                </div>

                <div className="self-stretch flex flex-row items-center justify-between gap-[8px] text-center text-sm text-grey-100">
                  <div className="flex flex-col items-start justify-start gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Strike Price
                    </div>
                    <div className="flex flex-col items-end justify-center text-sm text-white">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.initialPrice / 100000000).toFixed(1)
                          : (item.initialPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-start gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Mark Price
                    </div>
                    <div className="flex flex-col items-end justify-center text-sm text-white">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.currentPrice / 100000000).toFixed(1)
                          : (item.currentPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-grey-text flex justify-center items-center mr-1 w-1/2 h-[26px] w-1/4 bg-[#1D202F] hover:bg-[#484c6d5b] text-[0.9rem]  py-1 px-1 rounded border-r border-[#1A1A25]"
                    onClick={() => {
                      setCurrentItem(item);
                      setModalIsOpen(true);
                    }}
                  >
                    <FaShareAlt size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {ModalDetails1}
      </div>
    );
  };

  const renderHistoryPositions = () => {
    const resolvedPositionsToShow = resolvedPositions.filter(
      (position) => position.resolved
    );
    // Reverse the array to show positions from newest to oldest
    resolvedPositionsToShow.reverse();

    // Calculate start and end indices for the slice of data you want to display
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Get only the data for the current page
    const currentPageData = resolvedPositionsToShow.slice(startIndex, endIndex);
    const pnl = currentItem
      ? currentItem.priceDirection === 0
        ? currentItem.initialPrice < currentItem.finalPrice
          ? (currentItem.payout - currentItem.betAmount) / currentItem.betAmount
          : -currentItem.betAmount / currentItem.betAmount
        : currentItem.initialPrice > currentItem.finalPrice
          ? (currentItem.payout - currentItem.betAmount) / currentItem.betAmount
          : -currentItem.betAmount / currentItem.betAmount
      : 0;

    const ModalDetails = (
      <Modal
        className="bg-layer-1 border border-layer-3 rounded-[2rem]"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: "transparent",
          },
          content: {
            width: "1280px", // default width for desktop // default height for desktop
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0.25)",
            boxSizing: "border-box", // ensure padding and border are included in width/height calculations
          },
        }}
      >
        {currentItem && (
          <div
            className="custom-scrollbar h-full w-full p-0 m-0 box-border"
            id="my-modal"
            style={{}}
          >
            <div className="font-poppins relative w-full overflow-hidden flex flex-col items-center justify-center text-left text-84xl text-white rounded-[2rem] border border-layer-3 bg-layer-1">
              <div className="relative w-[1280px] h-[800px] z-1000">
                <img
                  className="absolute top-[105.2px] left-[243.2px] w-[760.8px] h-[760.8px]"
                  alt=""
                  src="/sheesh/abstract071.svg"
                />
                <div className="absolute top-[64px] right-[64px] rounded-lg bg-layer-2 flex flex-row items-start justify-start p-4 border-[4px] border-solid border-grey">
                  <button className="" onClick={downloadAsPng}>
                    <img
                      className="relative w-24 h-24"
                      alt=""
                      src="/sheesh/vuesaxlinearimport.svg"
                    />
                  </button>
                </div>
                <img
                  className="absolute my-0 mx-[!important] top-[64px] left-[64px] w-[404px] h-[133.6px] object-cover z-[3]"
                  alt=""
                  src="/sheesh/image-5@2x.png"
                />
                {currentItem.symbol === 0 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Sol.png"
                  />
                ) : currentItem.symbol === 1 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Btc.png"
                  />
                ) : null}
              </div>
              <div className="self-stretch flex flex-col items-center justify-center p-24 gap-[64px] z-[1]">
                <div className="bankGothic text-16xl relative leading-[80%] text-[160px]">
                  {currentItem.symbol === 0 ? (
                    <p className="">{`SOL/USD`}</p>
                  ) : currentItem.symbol === 1 ? (
                    <p className="">{`BTC/USD`}</p>
                  ) : null}
                </div>
                <div className="self-stretch flex flex-row items-center justify-start gap-[128px] text-right font-poppins">
                  <div className="h-[392px] flex flex-col items-start justify-start gap-[36px]">
                    <div className="flex flex-row items-center justify-start gap-[32px]">
                      {currentItem.priceDirection === 0 ? (
                        <>
                          <img
                            className="relative w-32 h-32"
                            alt=""
                            src="/sheesh/vuesaxbulktrendup2.svg"
                          />
                        </>
                      ) : (
                        <>
                          <img
                            className="relative w-32 h-32"
                            alt=""
                            src="/sheesh/vuesaxbulktrendup1.svg"
                          />
                        </>
                      )}

                      <div className="relative font-semibold text-[75px] leading-[100%]">
                        {currentItem.priceDirection === 0 ? (
                          <>
                            <span className="">LONG</span>
                          </>
                        ) : (
                          <>
                            <span className="">SHORT</span>
                          </>
                        )}{" "}
                        BIN
                      </div>
                    </div>
                    <div
                      className={
                        pnl > 0
                          ? "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#0B7A55] to-[#34C796] flex justify-center items-center rounded-2xl  p-1"
                          : "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#7A3636] to-[#C44141] flex justify-center items-center rounded-2xl  p-1"
                      }
                    >
                      <div className="bg-[#0B111B] bg-opacity-80 px-8 py-4 rounded-2xl ">
                        <span
                          className={
                            pnl > 0 ? "text-[#34C796]" : "text-red-500"
                          }
                        >
                          {Math.abs(pnl * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-[64px] text-base text-grey-text">
                    <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                      <div className="relative leading-[48px] ">
                        Strike Price
                      </div>
                      <div className="relative text-[78px] leading-[100%] font-medium text-white">
                        {currentItem.symbol === 1
                          ? (currentItem.initialPrice / 100000000).toFixed(1)
                          : (currentItem.initialPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                      <div className="relative leading-[48px] ">Exit Price</div>
                      <div className="relative text-[78px] leading-[100%] font-medium text-white">
                        {currentItem.symbol === 1
                          ? (currentItem.finalPrice / 100000000).toFixed(1)
                          : (currentItem.finalPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-layer-2 flex flex-row items-center justify-between px-24 py-14 z-[2] text-right text-base text-grey-text font-poppins">
                <div className="flex-1 flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center justify-start gap-[32px]">
                    <img
                      className="relative w-32 h-32"
                      alt=""
                      src="/sheesh/vuesaxbulkdiscountshape.svg"
                    />
                    <div className="relative leading-[48px] text-5xl">
                      Use Code
                    </div>
                  </div>
                  <div className="relative leading-[100%] text-7xl font-semibold text-white">
                    {decodedString}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    );

    return (
      <div>
        {currentPageData.map((item, index) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.finalPrice
                ? item.payout / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.finalPrice
                ? item.payout / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL;

          const date = new Date(item.expirationTime * 1000);
          const formattedDate = date.toLocaleDateString(undefined, {
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          });

          return !isMobile ? (
            <div
            key={item._id}
            className="px-2 flex flex  flex-row text-start rounded font-poppins"
          >
            <div className="flex items-center w-[22%] min-w-[150px] text-start text-sm    text-grey-text">
              <a
                href={`https://solscan.io/account/${item.binaryOption}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                <div className="flex flex-row justify-center items-center rounded-l">
                  <div className="flex flex-row items-center text-grey-text">
                        {item.symbol === 0 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Sol.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">SOL/USD</p>
                          </div>
                        ) : item.symbol === 1 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Btc.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">BTC/USD</p>
                          </div>
                        ) : item.symbol === 2 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Pyth.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">PYTH/USD</p>
                          </div>
                        ) : item.symbol === 3 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Bonk.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">BONK/USD</p>
                          </div>
                        ) : item.symbol === 4 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Jup.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">JUP/USD</p>
                          </div>
                        ) : item.symbol === 5 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Eth.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">ETH/USD</p>
                          </div>
                        ) : item.symbol === 6 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Tia.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">TIA/USD</p>
                          </div>
                        ) : item.symbol === 7 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Sui.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">SUI/USD</p>
                          </div>
                        ) : null}
                      </div>       </div>
              </a><div
                className={
                  item.priceDirection === 0
                    ? "text-[#34c796] "
                    : "text-red-500"
                }
              >
                {item.priceDirection === 0 ? (
                  <>
                    <div className="flex flex-row items-center pl-1">
                      {" "}
                      <img
                        className="relative w-5 h-5 pb-0.5"
                        alt=""
                        src="/new/component-82.svg"
                      />
                      <div className="text-[#34c796]">CALL</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-row items-center pl-1">
                      <img
                        className="relative w-5 h-5 pb-0.5"
                        alt=""
                        src="/new/component-81.svg"
                      />
                      <div className="text-red-500">PUT</div>
                    </div>
                  </>
                )}
         
              </div>  
            </div>
            <div className="flex justify-end items-center  w-[15%] min-w-[90px] text-start text-sm  ">
              <p>
                {item.symbol === 1
                  ? (item.initialPrice / 100000000).toFixed(1)
                  : (item.initialPrice / 100000000).toFixed(3)}
              </p>
            </div>
            <div className="flex justify-end items-center w-[15%] min-w-[90px] text-start text-sm  ">
              <p>
                {item.symbol === 1
                  ? (item.finalPrice / 100000000).toFixed(1)
                  : (item.finalPrice / 100000000).toFixed(3)}
              </p>
            </div>
            <div className="flex justify-end items-center w-[15%] min-w-[140px] text-start text-sm  ">
            <p>{formattedDate}</p>
            </div>
            <div className="flex justify-end items-center   w-[12%] min-w-[90px] text-start text-sm  ">
              <p>{(item.betAmount/LAMPORTS_PER_SOL).toFixed(2)}◎</p>
            </div>
            <div className="flex justify-end items-center   w-[10%]  min-w-[90px] text-start text-sm  ">
              <p className={pnl >= 0 ? "text-[#34c796] " : "text-red-500 "}>
                {pnl.toFixed(2)}◎
              </p>
            </div>
            <div className="flex justify-end items-center w-[14%] min-w-[140px] text-[0.9rem] text-grey-text   font-poppins py-1.5 rounded-r">
                <div className="flex justify-end  w-[70%] min-w-[140px]">
                  <button
                    className="min-w-[80px] h-[26px] bg-[#1D202F] text-grey-text hover:bg-[#484c6d5b] text-[0.9rem]  py-0.5 px-4 rounded flex items-center justify-center"
                    onClick={() => {
                      setCurrentItem(item);
                      setModalIsOpen(true);
                    }}
                  >
                    Share <FaShareAlt size={12} className="ml-1 " />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="self-stretch flex flex-col items-center justify-start text-left text-xs">
              <div className="self-stretch bg-layer-1 flex flex-col items-start justify-start p-4 gap-[16px]  border-layer-3 text-poppins">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start justify-center gap-[4px] ">
                    <div className="relative leading-[9.98px] flex items-center text-grey-text w-[50px]">
                      Position
                    </div>
                    <div className="relative leading-[12px]">
                      {" "}
                      <a
                href={`https://solscan.io/account/${item.binaryOption}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                <div className="flex flex-row justify-center items-center rounded-l">
                  <div className="flex flex-row items-center">
                        {item.symbol === 0 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Sol.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">SOL/USD</p>
                          </div>
                        ) : item.symbol === 1 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Btc.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">BTC/USD</p>
                          </div>
                        ) : item.symbol === 2 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Pyth.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">PYTH/USD</p>
                          </div>
                        ) : item.symbol === 3 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Bonk.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">BONK/USD</p>
                          </div>
                        ) : item.symbol === 4 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Jup.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">JUP/USD</p>
                          </div>
                        ) : item.symbol === 5 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Eth.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">ETH/USD</p>
                          </div>
                        ) : item.symbol === 6 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Tia.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">TIA/USD</p>
                          </div>
                        ) : item.symbol === 7 ? (
                         <div className="py-0.5 flex flex-row justify-start">
                            <img
                              src="/coins/60x60/Sui.png"
                              alt="Logo"
                              width="22"
                              height="16"
                            />
                            <p className="flex ml-1 items-center">SUI/USD</p>
                          </div>
                        ) : null}
                      </div>       </div>
              </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-[6px] text-right">
                    <div className="relative leading-[12px] text-grey-text">
                      Payout
                    </div>
                    <div className="flex flex-col items-end justify-center gap-[4px] text-sm text-primary">
                      <div className="relative leading-[12px] ">
                        <p
                          className={
                            pnl >= 0 ? "text-[#34c796] " : "text-red-500 "
                          }
                        >
                          {pnl.toFixed(2)} SOL
                        </p>
                      </div>
                      <div className="relative leading-[12px] text-grey-text hidden">
                        0.050 SOL
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-between text-right">
                  <div className="flex flex-col items-start justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Direction
                    </div>
                    <div className="flex flex-col items-start justify-center gap-[4px] text-left text-sm text-short">
                      <div
                        className={
                          item.priceDirection === 0
                            ? "flex flex-row items-center text-[#34c796] "
                            : "flex flex-row items-center text-red-500"
                        }
                      >
                        {item.priceDirection === 0 ? (
                          <>
                            <img
                              className="relative w-5 h-5 pb-0.5"
                              alt=""
                              src="/new/component-82.svg"
                            />
                            <span className="ml-1">LONG</span>
                          </>
                        ) : (
                          <>
                            <img
                              className="relative w-5 h-5 pb-0.5"
                              alt=""
                              src="/new/component-81.svg"
                            />
                            <span className="ml-1">SHORT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Expiration Time
                    </div>
                    <div className="flex flex-col items-end justify-center gap-[4px] text-sm text-white">
                      <div className="relative leading-[12px]">
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="self-stretch flex flex-row items-center justify-between gap-[8px] text-center text-sm text-grey-100">
                  <div className="flex flex-col items-start justify-start gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Strike Price
                    </div>
                    <div className="flex flex-col items-end justify-center text-sm text-white">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.initialPrice / 100000000).toFixed(1)
                          : (item.initialPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-start gap-[6px]">
                    <div className="relative leading-[12px] text-grey-text">
                      Expiry Price
                    </div>
                    <div className="flex flex-col items-end justify-center text-sm text-white">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.finalPrice / 100000000).toFixed(1)
                          : (item.finalPrice / 100000000).toFixed(3)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-grey-text flex justify-center items-center mr-1 w-1/2 h-[26px] w-1/4 bg-[#1D202F] hover:bg-[#484c6d5b] text-[0.9rem]  py-1 px-1 rounded border-r border-[#1A1A25]"
                    onClick={() => {
                      setCurrentItem(item);
                      setModalIsOpen(true);
                    }}
                  >
                    <FaShareAlt size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {ModalDetails}
      </div>
    );
  };

  if (!connected) {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full md:overflow-x-scroll overflow-y-hidden lg:overflow-y-auto rounded-lg bg-layer-1  md:py-3 md:">
        <div className="mx-2 pt-3.5 md:py-0 border-b-[1px] border-solid border-layer-3 flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              position
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
            } ${position ? "" : "text-grey long-short-button"}`}
            onClick={selectPosition}
          >
            {!isMobile ? <span>My Positions</span> : <span>My Positions</span>}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              !position
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${!position ? "" : "text-grey long-short-button"}`}
            onClick={selectHistory}
          >
            {!isMobile ? <span>My History</span> : <span>My History</span>}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-full overflow-hidden md:pb-10">
          <FaWallet className="flex justify-center items-center text-4xl text-grey" />
          <div className="flex justify-center items-center text-[0.95rem] text-grey  text-center overflow-hidden">
            Connect your wallet to see your positions.
          </div>
        </div>
      </div>
    );
  } else if (positions.length === 0 && resolvedPositions.length === 0) {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full md:overflow-x-scroll overflow-y-hidden lg:overflow-y-auto rounded-lg bg-layer-1  md:py-3 md:">
        <div className="mx-2 pt-3.5 md:py-0 border-b-[1px] border-solid border-layer-3 flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              position
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
            } ${position ? "" : "text-grey long-short-button"}`}
            onClick={selectPosition}
          >
            {!isMobile ? <span>My Positions</span> : <span>My Positions</span>}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              !position
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${!position ? "" : "text-grey long-short-button"}`}
            onClick={selectHistory}
          >
            {!isMobile ? <span>My History</span> : <span>My History</span>}
          </button>
        </div>

        <div className=" flex flex-col items-center justify-center h-full overflow-hidden md:pb-10">
          <FaStream className="text-4xl text-grey mb-2" />
          <p className="text-[0.95rem] text-grey  text-center overflow-hidden">
            You don&apos;t have any opened positions yet.
          </p>
        </div>
      </div>

    );
  } else if (positions.length === 0 && resolvedPositions.length !== 0) {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full md:overflow-x-scroll overflow-y-hidden lg:overflow-y-auto rounded-lg bg-layer-1  md:py-3 md:">
      <div
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
      <div className="mx-2 pt-3.5 md:py-0 border-b-[1px] border-solid border-layer-3 flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
        <button
          className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
            position
              ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
              : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
          } ${position ? "" : "text-grey long-short-button"}`}
          onClick={selectPosition}
        >
          {!isMobile ? <span>My Positions</span> : <span>My Positions</span>}
        </button>
        <button
          className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
            !position
              ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
              : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
          } ${!position ? "" : "text-grey long-short-button"}`}
          onClick={selectHistory}
        >
            {!isMobile ? <span>My History</span> : <span>My History</span>}
          </button>
        </div>

        <div
          className="custom-scrollbar overflow-y-scroll"
          style={{ flexGrow: 1 }}
        >
          {" "}
          {/* This div is your new scrolling area */}
          {position ? (
            <div className=" flex flex-col items-center justify-center h-full overflow-hidden md:pb-0">
              <FaStream className="text-4xl text-grey mb-2" />
              <p className="justify-center text-[0.95rem] text-grey  text-center overflow-hidden">
                You don&apos;t have any opened positions yet.
              </p>
            </div>
            ) : !isMobile ? (
              <div
                className="custom-scrollbar overflow-y-auto rounded"
                style={{ flexGrow: 1 }}
              >
                {" "}
                {/* This div is your new scrolling area */}
                <div className="px-2 w-full flex flex-row  rounded font-poppins text-grey-text text-sm">
              <div className="w-[22%] min-w-[150px] text-start    py-1 rounded-l">
                Option
              </div>
              <div className="w-[15%]  min-w-[90px] text-end   py-1">
                Strike Price
              </div>
              <div className="w-[15%] min-w-[90px] text-end  py-1">
                {position ? "Mark Price" : "Exit Price"}
              </div>
              <div className="w-[15%] min-w-[140px] text-end   py-1">
              Expiration Time
              </div>
              <div className="w-[12%] min-w-[90px] text-end  py-1">
                Collateral
              </div>
              <div className="w-[10%]  min-w-[90px] text-end  py-1">
                Payout
              </div>
              <div className="w-[14%] min-w-[140px] text-end  py-1 rounded-r ">
                Actions
              </div>
                </div>
                {renderHistoryPositions()}
                {position ? null : (
                  <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-grey-text">
                    <button
                      className=" bg-transparent mr-2"
                      onClick={firstPage}
                      disabled={currentPage === 1}
                    >
                      &lt;&lt;
                    </button>
                    <button
                      className=" bg-transparent mr-2"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    <span className="">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className=" bg-transparent px-2"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                    <button
                      className=" bg-transparent mr-2"
                      onClick={lastPage}
                      disabled={currentPage === totalPages}
                    >
                      &gt;&gt;
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="custom-scrollbar overflow-y-auto rounded"
                style={{ flexGrow: 1 }}
              >
                {" "}
                {/* This div is your new scrolling area */}
                {renderHistoryPositions()}
                {position ? null : (
                  <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-grey-text">
                    <button
                      className=" bg-transparent mr-2"
                      onClick={firstPage}
                      disabled={currentPage === 1}
                    >
                      &lt;&lt;
                    </button>
                    <button
                      className=" bg-transparent mr-2"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    <span className="">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className=" bg-transparent px-2"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                    <button
                      className=" bg-transparent mr-2"
                      onClick={lastPage}
                      disabled={currentPage === totalPages}
                    >
                      &gt;&gt;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full md:overflow-x-scroll overflow-y-hidden lg:overflow-y-auto rounded-lg bg-layer-1  md:py-3 md:">
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="mx-2 pt-3.5 md:py-0 border-b-[1px] border-solid border-layer-3 flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              position
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
            } ${position ? "" : "text-grey long-short-button"}`}
            onClick={selectPosition}
          >
            {!isMobile ? <span>My Positions</span> : <span>My Positions</span>}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              !position
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${!position ? "" : "text-grey long-short-button"}`}
            onClick={selectHistory}
          >
            {!isMobile ? <span>My History</span> : <span>My History</span>}
          </button>
        </div>

        {!isMobile ? (
          <div
            className="custom-scrollbar overflow-y-auto rounded"
            style={{ flexGrow: 1 }}
          >
            {" "}
            {/* This div is your new scrolling area */}
            <div className="px-2 w-full flex flex-row  rounded font-poppins text-grey-text text-sm">
              <div className="w-[22%] min-w-[150px] text-start    py-1 rounded-l">
                Option
              </div>
              <div className="w-[15%]  min-w-[90px] text-end   py-1">
                Strike Price
              </div>
              <div className="w-[15%] min-w-[90px] text-end  py-1">
                {position ? "Mark Price" : "Exit Price"}
              </div>
              <div className="w-[15%] min-w-[140px] text-end   py-1">
              Expiration Time
              </div>
              <div className="w-[12%] min-w-[90px] text-end  py-1">
              Collateral
              </div>
              <div className="w-[10%]  min-w-[90px] text-end  py-1">
                Payout
              </div>
              <div className="w-[14%] min-w-[140px] text-end  py-1 rounded-r ">
                Actions
              </div>
            </div>
            {position ? renderPositions(positions) : renderHistoryPositions()}
            {position ? null : (
              <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-grey-text">
                <button
                  className=" bg-transparent mr-2"
                  onClick={firstPage}
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </button>
                <button
                  className=" bg-transparent mr-2"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span className="">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className=" bg-transparent px-2"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button
                  className=" bg-transparent mr-2"
                  onClick={lastPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className="custom-scrollbar overflow-y-auto  rounded"
            style={{ flexGrow: 1 }}
          >
            {" "}
            {/* This div is your new scrolling area */}
            {position ? renderPositions(positions) : renderHistoryPositions()}
            {position ? null : (
              <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-grey-text">
                <button
                  className=" bg-transparent mr-2"
                  onClick={firstPage}
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </button>
                <button
                  className=" bg-transparent mr-2"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span className="">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className=" bg-transparent px-2"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button
                  className=" bg-transparent mr-2"
                  onClick={lastPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPositions;
