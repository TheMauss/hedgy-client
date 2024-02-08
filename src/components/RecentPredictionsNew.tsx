import { FC, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import HashLoader from "react-spinners/HashLoader";
import {
  FaSortAmountDown,
  FaAngleDoubleUp,
  FaAngleDoubleDown,
} from "react-icons/fa";
import Identicon from "identicon.js";
import FlipMove from "react-flip-move";

const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;

const SMALL_SCREEN = 768;

interface Position {
  type: "position";
  _id: string;
  binaryOption: string;
  playerAcc: string;
  betAmount: number;
  initialPrice: number;
  priceDirection: number;
  expirationTime: number;
  symbol: number;
  resolved: boolean;
  payout: number;
  finalPrice: number;
  elapsedTime: string;
  timestamp: number;
}

interface PositionFutures {
  type: "positionFutures";
  _id: string;
  futuresContract: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  leverage: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  liquidationPrice: number;
  symbol: number;
  resolved: boolean;
  winner: string | null;
  finalPrice: number;
  timestamp: number;
  pnl: number;
  elapsedTime: string;
}

interface Recentprops {
  divHeight: string;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const RecentPredictions: FC<Recentprops> = ({ divHeight }) => {
  const [positions, setPositions] = useState<(Position | PositionFutures)[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT2);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        if (!socket || socket.disconnected) {
          // Reinitialize the socket connection if it's not connected
          socket.connect();
          // You can also add any other logic here to fetch the latest data or emit events
        }
      }
    }

    // Add the visibility change event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function calculateElapsedTime(timestamp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime - timestamp;
      const seconds = Math.floor(timeElapsed);
      const minutes = Math.floor(timeElapsed / 60);
      const hours = Math.floor(minutes / 60);
      let elapsedTime = "";
      if (hours > 0) {
        elapsedTime = `${hours} ${hours > 1 ? "hours" : "hour"} ago`;
      } else if (minutes > 0) {
        elapsedTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
      } else {
        elapsedTime = `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
      }
      return elapsedTime;
    }

    function elapsedTimeInSeconds(elapsedTimeString: string) {
      // Check if elapsedTimeString is a string
      if (typeof elapsedTimeString !== "string") {
        console.error("elapsedTimeString must be a string:", elapsedTimeString);
        return 0; // or throw new Error('elapsedTimeString must be a string');
      }

      const [value, unit] = elapsedTimeString.split(" ");
      if (unit.startsWith("second")) {
        return Number(value);
      } else if (unit.startsWith("minute")) {
        return Number(value) * 60;
      } else if (unit.startsWith("hour")) {
        return Number(value) * 3600;
      } else {
        return 0; // Or throw an error, etc.
      }
    }

    // Function to handle new positions
    function handleNewPositions(newPositions, timestampKey) {
      if (Array.isArray(newPositions)) {
        setPositions((prevPositions) => {
          const prevPositionsMap = new Map(
            prevPositions.map((pos) => [pos._id, pos])
          );

          const existingPositionIds = new Set(
            prevPositions.map((pos) => pos._id)
          );

          const updatedPositions = newPositions
            .filter((newPos) => !existingPositionIds.has(newPos._id))
            .map((newPos) => {
              const oldPos = prevPositionsMap.get(newPos._id);
              if (oldPos) {
                return oldPos;
              } else {
                const elapsedTime = calculateElapsedTime(newPos[timestampKey]);
                return { ...newPos, elapsedTime };
              }
            });

          // Concatenate the new positions with the old ones
          const combinedPositions = [...prevPositions, ...updatedPositions];

          // Sort positions array in descending order by elapsedTime
          const sortedPositions = combinedPositions.sort(
            (a, b) =>
              elapsedTimeInSeconds(a.elapsedTime) -
              elapsedTimeInSeconds(b.elapsedTime)
          );

          return sortedPositions;
        });
        setIsLoading(false);
      } else {
        console.error("Received data is not an array:", newPositions);
      }
    }

    socket.on("latestPositionsFutures", (newPositions: PositionFutures[]) => {
      handleNewPositions(newPositions, "timestamp");
    });

    socket.on("latestPositions", (newPositions: Position[]) => {
      handleNewPositions(newPositions, "timestamp");
    });

    socket.on("newPosition", (newPosition: Position) => {
      setPositions((prevPositions) => {
        // Calculate elapsed time for the new position
        const currentTime = Math.floor(Date.now() / 1000);
        const timeElapsed = currentTime - newPosition.expirationTime;
        const seconds = Math.floor(timeElapsed);
        const minutes = Math.floor(timeElapsed / 60);
        const hours = Math.floor(minutes / 60);
        let elapsedTime = "";
        if (hours > 0) {
          elapsedTime = `${hours} ${hours > 1 ? "hours" : "hour"} ago`;
        } else if (minutes > 0) {
          elapsedTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
        } else {
          elapsedTime = `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
        }

        // Prepare new positions array with the new position at the beginning
        const newPositions = [
          { ...newPosition, elapsedTime },
          ...prevPositions,
        ];

        // Limit the length of the positions array to 100
        if (newPositions.length > 40) {
          newPositions.pop(); // Remove the last element of the array (oldest position)
        }

        return newPositions;
      });
    });

    socket.on("newPositiones", (newPosition: PositionFutures) => {
      setPositions((prevPositions) => {
        // Calculate elapsed time for the new position
        handleNewPositions(newPosition, "timestamp");

        // Prepare new positions array with the new position at the beginning
        const newPositions = [{ ...newPosition }, ...prevPositions];

        // Limit the length of the positions array to 100
        if (newPositions.length > 40) {
          newPositions.pop(); // Remove the last element of the array (oldest position)
        }

        return newPositions;
      });
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const decimalPlacesMapping = {
    0: 3, // Example: SOL has 2 decimal places
    1: 1, // Example: BTC has 2 decimal places
    2: 4, // Example: PYTH has 3 decimal places
    3: 6, // BONK
    4: 4, // JUP
    5: 1, // ETH
    6: 3, // TIA
    7: 4, // SUI
    // ... add mappings for other symbols ...
  };

  return (
    <div className="font-poppins w-full flex flex-col overflow-hidden h-full md:overflow-y-scroll  custom-scrollbar  order-5 xl:order-3 lg:order-3 md:order-5 rounded-lg bg-layer-1 py-4  flex bg-layer-1">
      <div className="sticky top-0 flex items-center z-10">
        <h2 className="bankGothic leading-[18px] text-xl text-start text-grey-text px-4">
          Recent Trades
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center w-full flex-grow">
          <HashLoader color="#1a1a25" />
        </div>
      ) : (
        <div className="custom-scrollbar flex flex-col overflow-auto ">
          <div className="sticky top-0 bg-layer-1 flex z-10 pt-2 px-3.5">
            <div className="w-[26%] text-sm leading-[12px] text-grey-text py-2 ">
              Pair/USD
            </div>
            <div className="w-[34%] text-sm leading-[12px] text-grey-text py-2 text-end">
              Price
            </div>
            <div className="w-[24%] text-sm leading-[12px] text-grey-text py-2 text-end">
              Size ◎
            </div>
            <div className="w-[29%] text-sm leading-[12px] text-grey-text py-2 text-end">
              Time
            </div>
          </div>
          <FlipMove>
            {Array.isArray(positions) &&
              positions.map((item, i) => {
                let profit = 0;
                const decimals = decimalPlacesMapping[item.symbol] || 2;
                if ("binaryOption" in item) {
                  if (
                    item.priceDirection === 0 &&
                    item.finalPrice > item.initialPrice
                  ) {
                    profit = (item.payout - item.betAmount) / LAMPORTS_PER_SOL;
                  } else if (
                    item.priceDirection === 0 &&
                    item.finalPrice < item.initialPrice
                  ) {
                    profit = -item.betAmount / LAMPORTS_PER_SOL;
                  } else if (
                    item.priceDirection !== 0 &&
                    item.finalPrice < item.initialPrice
                  ) {
                    profit = (item.payout - item.betAmount) / LAMPORTS_PER_SOL;
                  } else if (
                    item.priceDirection !== 0 &&
                    item.finalPrice > item.initialPrice
                  ) {
                    profit = -item.betAmount / LAMPORTS_PER_SOL;
                  }
                } else if ("futuresContract" in item) {
                  // profit for PositionFutures is already calculated
                  profit = item.pnl / LAMPORTS_PER_SOL;
                }

                let value = "binaryOption" in item ? profit : profit;
                value = Number(value);

                let percentage =
                  "binaryOption" in item
                    ? (profit / (item.betAmount / LAMPORTS_PER_SOL)) * 100
                    : (item.pnl / item.betAmount) * 100;
                percentage = Number(percentage);

                const positionSize =
                  "binaryOption" in item
                    ? item.betAmount / LAMPORTS_PER_SOL
                    : (item.leverage * item.betAmount) / LAMPORTS_PER_SOL;

                const minPositionSize = 0;
                const maxPositionSize = 500; // The value corresponding to 100% green
                let greenPercentage =
                  ((positionSize - minPositionSize) /
                    (maxPositionSize - minPositionSize)) *
                  100;

                // Define a minimum visible percentage for small bet amounts
                const minVisiblePercentage = 2; // for example, 5%

                // Adjust greenPercentage to be at least the minimum visible percentage if it's too small but greater than zero
                if (
                  greenPercentage > 0 &&
                  greenPercentage < minVisiblePercentage
                ) {
                  greenPercentage = minVisiblePercentage;
                }
                const colorfill = Math.max(0, Math.min(greenPercentage, 100));

                return (
                  <div
                    key={item._id}
                    className={`flex text-sm my-1 w-full pr-3.5 pl-3 hover:bg-layer-3`}
                    style={{
                      background: `linear-gradient(to right, transparent ${100 - colorfill}%, ${
                        item.priceDirection === 1
                          ? item.resolved
                            ? "rgba(52, 199, 150, 0.2)"
                            : "rgba(255, 76, 76, 0.2)"
                          : item.resolved
                            ? "rgba(255, 76, 76, 0.2)"
                            : "rgba(52, 199, 150, 0.2)"
                      } ${100 - colorfill}%)`,
                    }}
                  >
                    <div className="w-[26%] leading-[12px] flex items-center">
                      <a
                        href={`https://solscan.io/account/${"binaryOption" in item ? item.playerAcc : item.playerAcc}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        <div className="flex flex-row items-center">
                          {item.symbol === 0 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Sol.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">SOL</p>
                            </div>
                          ) : item.symbol === 1 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Btc.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">BTC</p>
                            </div>
                          ) : item.symbol === 2 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Pyth.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">PYTH</p>
                            </div>
                          ) : item.symbol === 3 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Bonk.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">BONK</p>
                            </div>
                          ) : item.symbol === 4 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Jup.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">JUP</p>
                            </div>
                          ) : item.symbol === 5 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Eth.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">ETH</p>
                            </div>
                          ) : item.symbol === 6 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Tia.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">TIA</p>
                            </div>
                          ) : item.symbol === 7 ? (
                            <div className="py-0.5 flex flex-row justify-start">
                              <img
                                src="/coins/60x60/Sui.png"
                                alt="Logo"
                                width="22"
                                height="16"
                              />
                              <p className="flex ml-1 items-center">SUI</p>
                            </div>
                          ) : null}
                        </div>
                      </a>
                    </div>
                    <div
                      className={`w-[35%] leading-[12px] flex items-center justify-end ${
                        item.priceDirection === 1
                          ? item.resolved
                            ? "text-[#34c796]"
                            : "text-red-500" // If priceDirection is 1, green if resolved, otherwise red
                          : item.resolved
                            ? "text-red-500"
                            : "text-[#34c796]" // If priceDirection is 0, red if resolved, otherwise green
                      }`}
                    >
                      $
                      {item.resolved
                        ? (item.finalPrice / 100000000).toFixed(decimals)
                        : (item.initialPrice / 100000000).toFixed(decimals)}
                    </div>

                    <div
                      className={`w-[24%] leading-[12px] flex items-center justify-end`}
                    >
                      {"binaryOption" in item
                        ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(1)}`
                        : `${((item.leverage * item.betAmount) / LAMPORTS_PER_SOL).toFixed(1)}`}
                    </div>
                    <div
                      className={`w-[29%] leading-[12px] flex items-center justify-end text-grey-text`}
                    >
                      {new Date(item.timestamp * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
          </FlipMove>
        </div>
      )}
    </div>
  );
};
export default RecentPredictions;
