import { FC, useEffect, useState, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  SystemProgram,
  Transaction,
  TransactionSignature,
  PublicKey,
} from "@solana/web3.js";
import socketIOClient from "socket.io-client";
import {
  FaAngleDoubleUp,
  FaAngleDoubleDown,
  FaWallet,
  FaStream,
  FaShareAlt,
  FaCogs,
} from "react-icons/fa";
import Modal from "react-modal";
import { BN } from "@project-serum/anchor";
import {
  CloseFutContAccounts,
  closeFutCont,
} from "../out/instructions/closeFutCont";
import {
  CloseLimitOrderAccounts,
  closeLimitOrder,
} from "../out/instructions/closeLimitOrder";
import domtoimage from "dom-to-image";
import {
  UpdateFutContAccounts,
  UpdateFutContArgs,
  updateFutCont,
} from "../out/instructions/updateFutCont";
import { PROGRAM_ID } from "../out/programId";
import { UserAccount } from "../out/accounts/UserAccount";
import axios from "axios";
import { usePriorityFee } from "../contexts/PriorityFee";
import { publicDecrypt } from "crypto";
import { useBackupOracle } from "contexts/BackupOracle";
import { v4 as uuidv4 } from "uuid";
import { notify } from "../utils/notifications";

const ENDPOINT1 = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;
const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT13;

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

interface Position {
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
  currentPrice: number;
  pnl: number;
  usdc: number;
  order: boolean;
}

interface Notification {
  type: string;
  message: string;
  description?: string;
  txid?: string;
  id?: string;
}

const generateUniqueId = () => {
  // Simple method to generate a unique ID
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface MyPositionsProps {
  latestOpenedPosition: Record<string, Position | null>;
  setLatestOpenedPosition: React.Dispatch<
    React.SetStateAction<Record<string, Position | null>>
  >;
  handleTotalBetAmountChange: (total: number) => void; // add this line
  handleusdcTotalBetAmountChange: (total: number) => void; // add this line

  prices: { [key: string]: { price: number; timestamp: string } };
  handleNewNotification: (notification: Notification) => void;
  positions: Position[];
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const ITEMS_PER_PAGE = 10;

const MyPositions: FC<MyPositionsProps> = ({
  prices,
  latestOpenedPosition,
  setLatestOpenedPosition,
  handleTotalBetAmountChange,
  handleusdcTotalBetAmountChange,
  handleNewNotification,
  positions,
  setPositions,
}) => {
  async function usdcSplTokenAccountSync(walletAddress) {
    let mintAddress = USDCMINT;

    const [splTokenAccount] = PublicKey.findProgramAddressSync(
      [
        walletAddress.toBuffer(),
        TOKENPROGRAM.toBuffer(),
        mintAddress.toBuffer(),
      ],
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
  const { sendTransaction } = useWallet();
  const [selectedButton, setSelectedButton] = useState("Positions");
  const [orders, setOrders] = useState<Position[]>([]);

  const [resolvedPositions, setResolvedPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { publicKey, connected } = useWallet(); // Add connected variable
  const walletAddress = publicKey?.toString() || "";
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Set the page size

  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const symbolMap = {
    0: "Crypto.SOL/USD",
    1: "Crypto.BTC/USD",
    2: "Crypto.PYTH/USD",
    3: "Crypto.BONK/USD",
    4: "Crypto.JUP/USD",
    5: "Crypto.ETH/USD",
    6: "Crypto.TIA/USD",
    7: "Crypto.SUI/USD",
    // Add more symbols as needed
  };
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen1, setModalIsOpen1] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItem1, setCurrentItem1] = useState(null);
  const [ProfitValue, setProfitValue] = useState("");
  const [LossValue, setLossValue] = useState("");
  const [Profit, setProfit] = useState("");
  const [Loss, setLoss] = useState("");
  const [lastInput, setLastInput] = useState(null);
  const [lastInputL, setLastInputL] = useState(null);
  const [warning, setWarning] = useState(null);
  const [isInit, setisInit] = useState<{
    isInitialized: boolean;
    usedAffiliate: Uint8Array;
    myAffiliate: Uint8Array;
  }>(null);
  const { isPriorityFee } = usePriorityFee();
  const { isBackupOracle } = useBackupOracle();
  const [totalPages, setTotalPages] = useState(1);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

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
    // Calculate total only for positions where position.usdc === 0
    const total = positions.reduce((total, position) => {
      if (position.usdc === 0) {
        return total + position.betAmount;
      }
      return total;
    }, 0);
    handleTotalBetAmountChange(total); // Pass the total back to the parent
  }, [positions]); // Dependency array includes positions

  useEffect(() => {
    // Calculate total only for positions where position.usdc === 1
    const total = positions.reduce((total, position) => {
      if (position.usdc === 1) {
        return total + position.betAmount;
      }
      return total;
    }, 0);
    handleusdcTotalBetAmountChange(total); // Pass the total back to the parent
  }, [positions]);

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

  const socketRef = useRef(null);
  const socket2Ref = useRef(null);

  function checkAndReconnectSocket(socketRef, setupSocketFn, socketName) {
    if (!socketRef.current || !socketRef.current.connected) {
      console.log(`${socketName} is disconnected. Attempting to reconnect...`);
      setupSocketFn();
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndReconnectSocket(socketRef, setupSocket1, "Socket 1");
      checkAndReconnectSocket(socket2Ref, setupSocket2, "Socket 2");
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  function setupSocket1() {
    socketRef.current = socketIOClient(ENDPOINT2);
    fetchPositionsByPage(currentPage);

    socketRef.current.on(
      "unresolvedfuturesPositions",
      (positions: Position[]) => {
        setLatestOpenedPosition((prevPositions) => {
          const updatedPositions: Record<string, Position | null> = {
            ...prevPositions,
          };

          positions.forEach((position) => {
            updatedPositions[position.symbol.toString()] = position;
          });

          return updatedPositions;
        });

        setPositions(positions);
        setIsLoading(false);
      }
    );

    socketRef.current.on("futuresPositions", ({ positions, totalPages }) => {
      setTotalPages(totalPages);

      setResolvedPositions(positions);
      setIsLoading(false);
    });

    socketRef.current.on("futuresOrders", (positions: Position[]) => {
      setOrders(positions);
    });

    socketRef.current.on("connect_error", (err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }

  function setupSocket2(walletAddress) {
    socket2Ref.current = socketIOClient(ENDPOINT1);

    if (socket2Ref.current) {
      socket2Ref.current.off("futuresPosition");
      socket2Ref.current.off("connect_error");
    }

    socket2Ref.current.emit("registerWallet", walletAddress);

    socket2Ref.current.on("futuresPosition", (updatedPosition: Position) => {
      const symbol = symbolMap[updatedPosition.symbol];
      const updatedPrice = prices[symbol];
      console.log("received updated position", updatedPosition)

      // Set the current price of the updated position
      updatedPosition.currentPrice = updatedPrice.price;
      setPreviousPrice(updatedPrice.price);

      setPositions((prevState) => {
        const positionExists = prevState.some(
          (position) => position._id === updatedPosition._id
        );

        if (positionExists) {
          // Update the position
          const updatedPositions = prevState.map((position) => {
            if (position._id === updatedPosition._id) {
              const updatedPos = {
                ...updatedPosition,
              };

              // If the position is not resolved and the stopLossPrice or takeProfitPrice has changed, update latestOpenedPosition
              if (
                !updatedPos.resolved &&
                (updatedPos.stopLossPrice !== position.stopLossPrice ||
                  updatedPos.takeProfitPrice !== position.takeProfitPrice ||
                  updatedPos.liquidationPrice !== position.liquidationPrice)
              ) {
                setLatestOpenedPosition((prevPositions) => {
                  const updatedPositions = {
                    ...prevPositions,
                    [updatedPos.symbol.toString()]: updatedPos,
                  };

                  return updatedPositions;
                });
                if (
                  updatedPos.stopLossPrice !== position.stopLossPrice ||
                  updatedPos.takeProfitPrice !== position.takeProfitPrice
                ) {
                  handleNewNotification({
                    id: updatedPosition._id.toString(),
                    type: "success",
                    message: `Position updated`,
                    description: `Take Profit is ${(updatedPosition.takeProfitPrice / 100000000).toFixed(2)}, Stop Loss is ${(updatedPosition.stopLossPrice / 100000000).toFixed(2)}`,
                  });
                } else {
                  handleNewNotification({
                    id: updatedPosition._id.toString(),
                    type: "success",
                    message: `Borrowing fee paid`,
                    description: `New Liquidation Price is  ${(updatedPosition.liquidationPrice / 100000000).toFixed(2)}`,
                  });
                }
              }
              return updatedPos;
            }

            return position;
          });

          return updatedPositions;
        } else {
          if (!updatedPosition.resolved) {
            // Add the new position to the array
            handleNewNotification({
              id: updatedPosition._id.toString(),
              type: "success",
              message: `Position opened`,
              description: `Entry price: ${(updatedPosition.initialPrice / 100000000).toFixed(3)} USD`,
            });
          }
          setLatestOpenedPosition((prevPositions) => {
            const updatedPositions = {
              ...prevPositions,
              [updatedPosition.symbol.toString()]: updatedPosition,
            };
            return updatedPositions;
          });

          return [...prevState, { ...updatedPosition }];
        }
      });

      if (updatedPosition.resolved) {
        const unit = updatedPosition.usdc === 1 ? "USDC" : "SOL";
        // handleNewNotification the user of the resolved position
        handleNewNotification({
          id: updatedPosition.futuresContract,
          type: "success",
          message: `Position resolved`,
          description: `PnL: ${(updatedPosition.pnl / LAMPORTS_PER_SOL).toFixed(2)} ${unit}`,
        });

        // Add the resolved position
        setResolvedPositions((prevState) => {
          const exists = prevState.some(
            (position) => position._id === updatedPosition._id
          );
          return exists ? prevState : [updatedPosition, ...prevState];
        });

        // Remove the resolved position from the main positions array
        setPositions((prevState) => {
          const updatedPositionIndex = prevState.findIndex(
            (position) => position._id === updatedPosition._id
          );
          const remainingPositions = prevState.filter(
            (position) => position._id !== updatedPosition._id
          );

          setLatestOpenedPosition((prevPositions) => {
            // If the updated position was the last in the array
            if (updatedPositionIndex === prevState.length - 1) {
              const nonResolvedSameSymbolPositions = remainingPositions.filter(
                (position) =>
                  position.symbol === updatedPosition.symbol &&
                  !position.resolved
              );

              const latestSameSymbolPosition =
                nonResolvedSameSymbolPositions.length
                  ? nonResolvedSameSymbolPositions[
                      nonResolvedSameSymbolPositions.length - 1
                    ]
                  : null;

              const updatedPrevPositions = {
                ...prevPositions,
                [updatedPosition.symbol.toString()]: latestSameSymbolPosition,
              };

              return updatedPrevPositions;
            } else if (
              prevPositions[updatedPosition.symbol.toString()]._id ===
                updatedPosition._id &&
              updatedPositionIndex === prevState.length - 1
            ) {
              // If the updated position was the current "latest"
              const subsequentPositions =
                remainingPositions.slice(updatedPositionIndex);
              const nextSameSymbolPositions = subsequentPositions.filter(
                (position) =>
                  position.symbol === updatedPosition.symbol &&
                  !position.resolved
              );

              const latestSameSymbolPosition = nextSameSymbolPositions.length
                ? nextSameSymbolPositions[0]
                : null;

              const updatedPrevPositions = {
                ...prevPositions,
                [updatedPosition.symbol.toString()]: latestSameSymbolPosition,
              };

              return updatedPrevPositions;
            }

            // If neither of the above, return the current state
            return prevPositions;
          });

          return remainingPositions;
        });
      }
    });

    socket2Ref.current.on(
      "futuresupdateOrders",
      (updatedOrder: Position, latestPrice: number) => {
        console.log(
          "Received order update:",
          updatedOrder,
          "with latest price:",
          latestPrice
        );
        setPreviousPrice(latestPrice);

        // Handle the updated order here
        // This might involve updating the state that holds your orders, similar to how positions are handled
        setOrders((prevOrders) => {
          // Example: Update the order in your state, or add it if it's new
          const existingOrderIndex = prevOrders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (existingOrderIndex > -1) {
            // Update existing order
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = {
              ...updatedOrder,
            };
            return updatedOrders;
          } else {
            // Add new order
            return [...prevOrders, { ...updatedOrder }];
          }
        });
      }
    );
    console.log(orders, "neworders");

    socket2Ref.current.on("connect_error", (err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }

  const fetchPositionsByPage = (page) => {
    socketRef.current.emit("registerWallet", walletAddress, page, pageSize);
  };

  useEffect(() => {
    if (!walletAddress) return;
    // Initial setup
    setupSocket1();
    setupSocket2(walletAddress);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!socketRef.current || !socketRef.current.connected) {
          setupSocket1();
        }
        if (!socket2Ref.current || !socket2Ref.current.connected) {
          setupSocket2(walletAddress);
        }
      }
    };

    // Reconnect logic when the app comes back to the foreground
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (socket2Ref.current) {
        socket2Ref.current.disconnect();
        socket2Ref.current.off("futuresPosition");
        socket2Ref.current.off("connect_error");
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [walletAddress, currentPage]);

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

    setPreviousPrice((previousPrice) => {
      const previousSymbol = symbolMap[previousPrice];
      const updatedPrice = prices[previousSymbol];
      return updatedPrice ? updatedPrice.price : previousPrice || 0;
    });
  }, [prices]);

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
      let profit;
      if (currentItem.priceDirection === 0) {
        profit = (
          (((parseFloat(ProfitValue) * 100000000 - currentItem.initialPrice) /
            currentItem.initialPrice) *
            currentItem.leverage *
            currentItem.betAmount) /
          LAMPORTS_PER_SOL
        ).toFixed(2);
      } else {
        profit = (
          ((-(parseFloat(ProfitValue) * 100000000 - currentItem.initialPrice) /
            currentItem.initialPrice) *
            currentItem.leverage *
            currentItem.betAmount) /
          LAMPORTS_PER_SOL
        ).toFixed(2);
      }
      profit = isNaN(profit) ? "" : profit;
      setProfit(profit);
    }
  }, [ProfitValue, currentItem]);

  useEffect(() => {
    if (lastInput === "Profit") {
      let profitValue;
      if (currentItem.priceDirection === 0) {
        profitValue = (
          (currentItem.initialPrice / 100000000) *
          (1 +
            parseFloat(Profit) /
              ((currentItem.leverage * currentItem.betAmount) /
                LAMPORTS_PER_SOL))
        ).toFixed(2);
      } else {
        profitValue = (
          (currentItem.initialPrice / 100000000) *
          (1 -
            parseFloat(Profit) /
              ((currentItem.leverage * currentItem.betAmount) /
                LAMPORTS_PER_SOL))
        ).toFixed(2);
      }
      profitValue = isNaN(profitValue) ? "" : profitValue;
      setProfitValue(profitValue);
    }
  }, [Profit, currentItem]);

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

    // Set the sanitized value as the LossValue
    setLossValue(sanitizedValue);
    setLastInputL("LossValue");
  };

  useEffect(() => {
    // Check if currentItem exists
    if (!currentItem) return;
    const val = parseFloat(ProfitValue);
    // Warning handler
    if (
      currentItem.priceDirection === 0 &&
      Number(val) <= currentItem.currentPrice / 100000000
    ) {
      setWarning("Take profit price should be higher than the current price.");
    } else if (
      currentItem.priceDirection === 1 &&
      Number(val) >= currentItem.currentPrice / 100000000
    ) {
      setWarning("Take profit should be lower than the current price.");
    } else {
      setWarning(null);
    }
  }, [ProfitValue, currentItem]);

  useEffect(() => {
    // Check if currentItem exists
    if (!currentItem) return;
    // Warning handler
    const val = parseFloat(LossValue);
    if (currentItem.priceDirection === 0) {
      if (val >= currentItem.currentPrice / 100000000) {
        setWarning("Stop Loss Price should be lower than the current price.");
      } else if (val < currentItem.liquidationPrice / 100000000) {
        setWarning(
          "Stop Loss Price should be higher than the liquidation price."
        );
      } else {
        setWarning(null);
      }
    } else if (currentItem.priceDirection === 1) {
      if (val <= currentItem.currentPrice / 100000000) {
        setWarning("Stop Loss Price should be higher than the current price.");
      } else if (val > currentItem.liquidationPrice / 100000000) {
        setWarning(
          "Stop Loss Price should be lower than the liquidation price."
        );
      } else {
        setWarning(null);
      }
    } else {
      setWarning(null);
    }
  }, [LossValue, currentItem]);

  const handleLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Replace comma with dot, and remove non-numeric characters except dot (.) and minus sign (-) as first character
    const preNumericValue = inputValue.replace(/,/g, ".");
    let numericValue = preNumericValue.replace(/[^0-9.-]/g, "");

    // Remove multiple minus signs
    numericValue = numericValue.replace(/-{2,}/g, "-");

    // Ensure minus sign is only at the front
    numericValue = numericValue.replace(/(.)-/g, "$1");

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

    setLoss(sanitizedValue);
    setLastInputL("Loss");
  };

  useEffect(() => {
    if (lastInputL === "LossValue") {
      let loss;
      if (currentItem.priceDirection === 0) {
        loss = (
          (((parseFloat(LossValue) * 100000000 - currentItem.initialPrice) /
            currentItem.initialPrice) *
            currentItem.leverage *
            currentItem.betAmount) /
          LAMPORTS_PER_SOL
        ).toFixed(2);
      } else {
        loss = (
          ((-(parseFloat(LossValue) * 100000000 - currentItem.initialPrice) /
            currentItem.initialPrice) *
            currentItem.leverage *
            currentItem.betAmount) /
          LAMPORTS_PER_SOL
        ).toFixed(2);
      }

      // Check and adjust if loss exceeds amountValue or is positive
      loss = Math.min(
        Math.max(parseFloat(loss), -(currentItem.betAmount / LAMPORTS_PER_SOL)),
        0
      ).toFixed(2);

      loss = isNaN(loss) ? "" : loss;
      setLoss(loss);
    }
  }, [LossValue, currentItem]);

  useEffect(() => {
    if (lastInputL === "Loss") {
      let lossValue;
      if (currentItem.priceDirection === 0) {
        lossValue = (
          (currentItem.initialPrice / 100000000) *
          (1 +
            parseFloat(Loss) /
              ((currentItem.leverage * currentItem.betAmount) /
                LAMPORTS_PER_SOL))
        ).toFixed(2);
      } else {
        lossValue = (
          (currentItem.initialPrice / 100000000) *
          (1 -
            parseFloat(Loss) /
              ((currentItem.leverage * currentItem.betAmount) /
                LAMPORTS_PER_SOL))
        ).toFixed(2);
      }

      if (currentItem.priceDirection === 0) {
        // Check for LONG
        if (
          parseFloat(lossValue) <
          Number(currentItem.liquidationPrice / 100000000)
        ) {
          lossValue = Number(currentItem.liquidationPrice / 100000000).toFixed(
            3
          );
        }
      } else {
        if (
          parseFloat(lossValue) >
          Number(currentItem.liquidationPrice / 100000000)
        ) {
          lossValue = Number(currentItem.liquidationPrice / 100000000).toFixed(
            3
          );
        }
      }

      lossValue = isNaN(lossValue) ? "" : lossValue;
      setLossValue(lossValue);
    }
  }, [Loss, currentItem]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setResolvedPositions([]);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setResolvedPositions([]);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
    setResolvedPositions([]);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
    setResolvedPositions([]);
  };

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

  const signature: TransactionSignature = "";

  const getPriorityFeeEstimate = async () => {
    try {
      const rpcUrl = ENDPOINT5;

      const requestData = {
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            accountKeys: ["PopFiDLVBg7MRoyzerAop6p85uxdM73nSFj35Zjn5Mt"],
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

      return (responseData.result.priorityFeeLevels.veryHigh + 30000).toFixed(
        0
      );
    } catch (error) {
      console.error("Error fetching priority fee estimate:", error);
    }
  };

  const resolveFutCont = async (position: Position) => {
    setIsTransactionPending(true);
    const transactionId = uuidv4();

    const accounts: CloseFutContAccounts = {
      futCont: new PublicKey(position.futuresContract),
      playerAcc: new PublicKey(walletAddress),
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

    // Create the transaction
    const transaction = new Transaction()
      .add(closeFutCont(accounts))
      .add(PRIORITY_FEE_IX);

    let signature: TransactionSignature = "";
    try {
      // Send the transaction
      sendSymbol(position.symbol);
      signature = await sendTransaction(transaction, connection);
      notify({
        id: transactionId,
        type: "info",
        message: `Closing the Position`,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");
      setIsTransactionPending(false);
      notify({
        id: transactionId,
        type: "success",
        message: `Closing Order Created`,
      });
      // Optionally, show a success notification
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setIsTransactionPending(false);
      // Optionally, show an error notification
      notify({
        id: transactionId,
        type: "error",
        message: `Contract resolution failed`,
        description: error?.message,
        txid: signature,
      });
    }
  };

  const sendSymbol = (symbol) => {
    if (socketRef.current && publicKey?.toString() !== "") {
      const messageObject = {
        symbol: symbol,
        active: true,
      };
      socketRef.current.emit("symbolUpdate", messageObject);
    }
  };

  const updateFuturescontract = async (position: Position) => {
    if (warning) {
      console.error("Cannot update futures contract due to warning:", warning);
      // Optionally, show a warning notification
      handleNewNotification({
        id: generateUniqueId(),
        type: "warning",
        message: `Position update prevented`,
        description: warning,
      });
      return; // Exit function early
    }

    let oracleAccountAddress;

    if (position.symbol === 0) {
      oracleAccountAddress = SOLORACLE;
    } else if (position.symbol === 1) {
      oracleAccountAddress = BTCORACLE;
    } else if (position.symbol === 2) {
      oracleAccountAddress = PYTHORACLE;
    } else if (position.symbol === 3) {
      oracleAccountAddress = BONKORACLE;
    } else if (position.symbol === 4) {
      oracleAccountAddress = JUPORACLE;
    } else if (position.symbol === 5) {
      oracleAccountAddress = ETHORACLE;
    } else if (position.symbol === 6) {
      oracleAccountAddress = TIAORACLE;
    } else if (position.symbol === 7) {
      oracleAccountAddress = SUIORACLE;
    } else {
      // Handle other cases or provide a default value if needed
    }

    const accounts: UpdateFutContAccounts = {
      futCont: new PublicKey(position.futuresContract),
      playerAcc: new PublicKey(walletAddress),
      oracleAccount: new PublicKey(oracleAccountAddress),
      ratioAcc: RATIOACC,
      houseAcc: HOUSEWALLET,
    };

    const args: UpdateFutContArgs = {
      tpPrice: new BN(Number(ProfitValue) * 100000000),
      slPrice: new BN(Number(LossValue) * 100000000),
    };

    console.log(LossValue);
    console.log("TP", new BN(Number(ProfitValue)));
    console.log("SL", new BN(Number(LossValue)));

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

    // Create the transaction
    const transaction = new Transaction()
      .add(updateFutCont(args, accounts))
      .add(PRIORITY_FEE_IX);

    let signature: TransactionSignature = "";
    try {
      // Send the transaction
      signature = await sendTransaction(transaction, connection);
      handleNewNotification({
        id: generateUniqueId(),
        type: "info",
        message: `Updating the Position`,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // Optionally, show a success notification
    } catch (error: any) {
      // Optionally, show an error notification
      handleNewNotification({
        id: generateUniqueId(),
        type: "error",
        message: `Position update failed`,
        description: error?.message,
        txid: signature,
      });
    }
  };

  const both0 = async (position: Position) => {
    if (warning) {
      console.error("Cannot update futures contract due to warning:", warning);
      // Optionally, show a warning notification
      handleNewNotification({
        id: generateUniqueId(),
        type: "warning",
        message: `Position update prevented`,
        description: warning,
      });
      return; // Exit function early
    }

    let oracleAccountAddress;

    if (position.symbol === 0) {
      oracleAccountAddress = SOLORACLE;
    } else if (position.symbol === 1) {
      oracleAccountAddress = BTCORACLE;
    } else if (position.symbol === 2) {
      oracleAccountAddress = PYTHORACLE;
    } else if (position.symbol === 3) {
      oracleAccountAddress = BONKORACLE;
    } else if (position.symbol === 4) {
      oracleAccountAddress = JUPORACLE;
    } else if (position.symbol === 5) {
      oracleAccountAddress = ETHORACLE;
    } else if (position.symbol === 6) {
      oracleAccountAddress = TIAORACLE;
    } else if (position.symbol === 7) {
      oracleAccountAddress = SUIORACLE;
    } else {
      // Handle other cases or provide a default value if needed
    }

    const accounts: UpdateFutContAccounts = {
      futCont: new PublicKey(position.futuresContract),
      playerAcc: new PublicKey(walletAddress),
      oracleAccount: new PublicKey(oracleAccountAddress),
      ratioAcc: RATIOACC,
      houseAcc: HOUSEWALLET,
    };

    const args: UpdateFutContArgs = {
      tpPrice: new BN(Number(ProfitValue) * 100000000),
      slPrice: new BN(Number(LossValue) * 100000000),
    };

    console.log(LossValue);
    console.log("TP", new BN(Number(0)));
    console.log("SL", new BN(Number(0)));

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

    // Create the transaction
    const transaction = new Transaction()
      .add(updateFutCont(args, accounts))
      .add(PRIORITY_FEE_IX);

    let signature: TransactionSignature = "";
    try {
      // Send the transaction
      signature = await sendTransaction(transaction, connection);
      ({
        type: "info",
        message: `Trying to update the Position`,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // Optionally, show a success notification
    } catch (error: any) {
      // Optionally, show an error notification
      handleNewNotification({
        id: generateUniqueId(),
        type: "error",
        message: `Position update failed`,
        description: error?.message,
        txid: signature,
      });
    }
  };

  const closeOrder = async (position: Position) => {
    const seedsUser = [Buffer.from(publicKey.toBytes())];
    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);

    const usdcAcc = await usdcSplTokenAccountSync(publicKey);

    const accounts: CloseLimitOrderAccounts = {
      futCont: new PublicKey(position.futuresContract),
      playerAcc: new PublicKey(publicKey),
      userAcc: userAcc,
      ratioAcc: RATIOACC,
      houseAcc: HOUSEWALLET,
      signerServer: SIGNERWALLET,
      pdaHouseAcc: PDAHOUSEWALLET,
      systemProgram: SystemProgram.programId,
      usdcMint: USDCMINT,
      usdcPlayerAcc: usdcAcc,
      usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
      tokenProgram: TOKENPROGRAM,
      associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
    };

    console.log(usdcAcc, USDCPDAHOUSEWALLET);

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

    // Create the transaction
    const transaction = new Transaction()
      .add(closeLimitOrder(accounts))
      .add(PRIORITY_FEE_IX);

    let signature: TransactionSignature = "";
    try {
      // Send the transaction
      signature = await sendTransaction(transaction, connection);
      handleNewNotification({
        id: generateUniqueId(),
        type: "info",
        message: `Closing Limit Order`,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");
      handleNewNotification({
        id: generateUniqueId(),
        type: "success",
        message: `Limit Order Closed`,
      });
      // Optionally, show a success notification
    } catch (error: any) {
      // Optionally, show an error notification
      handleNewNotification({
        id: generateUniqueId(),
        type: "error",
        message: `Closing Limit Order failed`,
        description: error?.message,
        txid: signature,
      });
    }
  };

  const getActiveSymbol = (item) => {
    const activeKey = item.symbol;
    console.log("Active key:", activeKey); // Outputs the key that is active

    const symbol = symbolMap[activeKey]; // Lookup the symbol in the map
    console.log("Mapped symbol:", symbol); // Outputs the corresponding symbol or undefined

    return symbol || "Crypto.SOL/USD"; // Fallback to "Crypto.SOL/USD" if symbol is undefined
  };

  const handleButtonClick3 = (item) => {
    resolveFutCont(item);
  };

  const renderPositions = (positionsToRender: Position[]) => {
    const unresolvedPositions = positionsToRender
      .filter((item) => !item.resolved)
      .sort((a, b) => b._id.localeCompare(a._id));

    unresolvedPositions.forEach((item) => {
      item.pnl =
        item.priceDirection === 0
          ? item.initialPrice < item.currentPrice
            ? (((item.currentPrice - item.initialPrice) / item.initialPrice) *
                item.betAmount *
                item.leverage) /
              LAMPORTS_PER_SOL
            : Math.max(
                (((item.currentPrice - item.initialPrice) / item.initialPrice) *
                  item.betAmount *
                  item.leverage) /
                  LAMPORTS_PER_SOL,
                -item.betAmount / LAMPORTS_PER_SOL
              )
          : item.initialPrice > item.currentPrice
            ? ((-(item.currentPrice - item.initialPrice) / item.initialPrice) *
                item.betAmount *
                item.leverage) /
              LAMPORTS_PER_SOL
            : Math.max(
                ((-(item.currentPrice - item.initialPrice) /
                  item.initialPrice) *
                  item.betAmount *
                  item.leverage) /
                  LAMPORTS_PER_SOL,
                -item.betAmount / LAMPORTS_PER_SOL
              );
    });

    return (
      <div className="flex flex-col">
        {unresolvedPositions.map((item, index) => {
          const isEvenRow = index % 2 === 0;
          const rowStyle = {
            backgroundColor: isEvenRow ? "#232332" : "#1a1a25",
          };

          const ModalDetails1 = (
            <Modal
              isOpen={modalIsOpen1}
              onRequestClose={() => setModalIsOpen1(false)}
              className="rounded-xl  border border-layer-1 bg-base"
              style={{
                overlay: {
                  backgroundColor: "transparent",
                },
                content: {
                  color: "lightsteelblue",

                  width: "320px", // default width for desktop// default height for desktop
                  position: "fixed",
                  top: "30%",
                  left: "50%",
                  transform: "translate(-50%)",
                },
              }}
            >
              {currentItem && (
                <div className="rounded-xl relative  flex-col h-full font-poppins px-4 py-6 bg-[#ffffff12]">
                  <div className="mb-3 leading-[80.69%] bankGothic uppercase text-xl text-white ">
                    Update Position
                  </div>
                  <div className="flex flex-row self-stretch justify-between text-[#ffffff60] text-sm">
                    <div>Actual Take Profit</div>
                    <div className="text-white">
                      {(currentItem.takeProfitPrice / 100000000).toFixed(2)} USD
                    </div>
                  </div>
                  <div className="flex flex-row self-stretch justify-between text-[#ffffff60] text-sm">
                    <div>Actual Stop Loss</div>
                    <div className="text-white">
                      {(currentItem.stopLossPrice / 100000000).toFixed(2)} USD
                    </div>
                  </div>
                  <div className="flex justify-center flex justify-center items-center gap-2">
                    <div className="py-2 w-[50%]">
                      <div className="mb-2 flex-1 rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2  hover:bg-[#ffffff24] transition-all duration-200 ease-in-out">
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
                      <div className="flex-1 rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2  hover:bg-[#ffffff24] transition-all duration-200 ease-in-out">
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
                    </div>
                    <div className="py-2 w-[50%]">
                      <div className="mb-2 hover:bg-[#ffffff24] transition-all duration-200 ease-in-out flex-1 rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 ">
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

                      <div className="hover:bg-[#ffffff24] transition-all duration-200 ease-in-out flex-1 rounded bg-[#ffffff12] box-border h-10 flex flex-row items-center justify-between py-0 px-2 ">
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
                    </div>
                  </div>
                  <div className="w-[100%]">
                    {warning && (
                      <div className="mt-1 text-red-500 text-[1rem] mb-1">
                        {warning}
                      </div>
                    )}
                    <div className="flex flex-row self-stretch justify-between text-[#ffffff60] text-sm">
                      <div>Remove TP/SL</div>
                      <button
                        className="flex justify-center items-center h-[26px] md:w-[45%] w-[95%] min:w-[100px] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.84rem] xl:text-[0.9rem]  py-0.5 px-4 rounded"
                        onClick={() => both0(item)}
                      >
                        Remove
                      </button>
                    </div>

                    <button
                      onClick={() => updateFuturescontract(currentItem)}
                      className="mt-3 w-full self-stretch rounded-lg [background:linear-gradient(180deg,_#34c796,_#0b7a55)] flex flex-row items-center justify-center py-3 px-6 text-center text-lg text-white"
                    >
                      <button className="relative font-semibold ">
                        CONFIRM
                      </button>
                    </button>
                  </div>
                </div>
              )}
            </Modal>
          );

          const ModalDetails2 = (
            <Modal
              className=" rounded-xl border border-layer-1 bg-base"
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
                  className="rounded-xl custom-scrollbar h-full w-full p-0 m-0 box-border bg-[#ffffff12]"
                  id="my-modal"
                  style={{}}
                >
                  <div className="font-poppins relative w-full overflow-hidden flex flex-col items-center justify-center text-left text-84xl text-white rounded-[2rem]   border border-layer-3">
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
                      ) : currentItem.symbol === 2 ? (
                        <img
                          className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                          alt=""
                          src="/coins/320x320/Pyth.png"
                        />
                      ) : currentItem.symbol === 3 ? (
                        <img
                          className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                          alt=""
                          src="/coins/320x320/Bonk.png"
                        />
                      ) : currentItem.symbol === 4 ? (
                        <img
                          className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                          alt=""
                          src="/coins/320x320/Jup.png"
                        />
                      ) : currentItem.symbol === 5 ? (
                        <img
                          className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                          alt=""
                          src="/coins/320x320/Eth1.png"
                        />
                      ) : currentItem.symbol === 6 ? (
                        <img
                          className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                          alt=""
                          src="/coins/320x320/Tia.png"
                        />
                      ) : currentItem.symbol === 7 ? (
                        <img
                          className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                          alt=""
                          src="/coins/320x320/Sui.png"
                        />
                      ) : null}
                    </div>
                    <div className="self-stretch flex flex-col items-center justify-center p-24 gap-[64px] z-[1]">
                      <div className="bankGothic text-16xl relative leading-[80%] text-[160px]">
                        {currentItem.symbol === 0 ? (
                          <p className="">{`SOL/USD`}</p>
                        ) : currentItem.symbol === 1 ? (
                          <p className="">{`BTC/USD`}</p>
                        ) : currentItem.symbol === 2 ? (
                          <p className="">{`PYTH/USD`}</p>
                        ) : currentItem.symbol === 3 ? (
                          <p className="">{`BONK/USD`}</p>
                        ) : currentItem.symbol === 4 ? (
                          <p className="">{`JUP/USD`}</p>
                        ) : currentItem.symbol === 5 ? (
                          <p className="">{`ETH/USD`}</p>
                        ) : currentItem.symbol === 6 ? (
                          <p className="">{`TIA/USD`}</p>
                        ) : currentItem.symbol === 7 ? (
                          <p className="">{`SUI/USD`}</p>
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
                              {currentItem.leverage}X
                            </div>
                          </div>
                          <div
                            className={
                              (currentItem.pnl / currentItem.betAmount) * 100 >
                              0
                                ? "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#0B7A55] to-[#34C796] flex justify-center items-center rounded-2xl  p-1"
                                : "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#7A3636] to-[#C44141] flex justify-center items-center rounded-2xl  p-1"
                            }
                          >
                            <div className="bg-[#0B111B] bg-opacity-80 px-8 py-4 rounded-2xl ">
                              <span
                                className={
                                  (currentItem.pnl / currentItem.betAmount) *
                                    100 >
                                  0
                                    ? "text-[#34C796]"
                                    : "text-red-500"
                                }
                              >
                                {Math.abs(
                                  ((currentItem.pnl * LAMPORTS_PER_SOL) /
                                    currentItem.betAmount) *
                                    100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-[64px] text-base text-[#ffffff60]">
                          <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                            <div className="relative leading-[48px] text-[#ffffff60]">
                              Entry Price
                            </div>
                            <div className="relative text-[78px] leading-[100%] font-medium text-white">
                              {currentItem.symbol === 1
                                ? (
                                    currentItem.initialPrice / 100000000
                                  ).toFixed(1)
                                : currentItem.symbol === 0
                                  ? (
                                      currentItem.initialPrice / 100000000
                                    ).toFixed(3)
                                  : currentItem.symbol === 2
                                    ? (
                                        currentItem.initialPrice / 100000000
                                      ).toFixed(4)
                                    : currentItem.symbol === 3
                                      ? (
                                          currentItem.initialPrice / 100000000
                                        ).toFixed(7)
                                      : currentItem.symbol === 4
                                        ? (
                                            currentItem.initialPrice / 100000000
                                          ).toFixed(3)
                                        : currentItem.symbol === 5
                                          ? (
                                              currentItem.initialPrice /
                                              100000000
                                            ).toFixed(1)
                                          : currentItem.symbol === 6
                                            ? (
                                                currentItem.initialPrice /
                                                100000000
                                              ).toFixed(3)
                                            : currentItem.symbol === 7
                                              ? (
                                                  currentItem.initialPrice /
                                                  100000000
                                                ).toFixed(3)
                                              : null}
                            </div>
                          </div>
                          <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                            <div className="relative leading-[48px] text-[#ffffff60]">
                              Mark Price
                            </div>
                            <div className="relative text-[78px] leading-[100%] font-medium text-white">
                              {currentItem.symbol === 1
                                ? (
                                    currentItem.currentPrice / 100000000
                                  ).toFixed(1)
                                : currentItem.symbol === 0
                                  ? (
                                      currentItem.currentPrice / 100000000
                                    ).toFixed(3)
                                  : currentItem.symbol === 2
                                    ? (
                                        currentItem.currentPrice / 100000000
                                      ).toFixed(4)
                                    : currentItem.symbol === 3
                                      ? (
                                          currentItem.currentPrice / 100000000
                                        ).toFixed(7)
                                      : currentItem.symbol === 4
                                        ? (
                                            currentItem.currentPrice / 100000000
                                          ).toFixed(3)
                                        : currentItem.symbol === 5
                                          ? (
                                              currentItem.currentPrice /
                                              100000000
                                            ).toFixed(1)
                                          : currentItem.symbol === 6
                                            ? (
                                                currentItem.currentPrice /
                                                100000000
                                              ).toFixed(3)
                                            : currentItem.symbol === 7
                                              ? (
                                                  currentItem.currentPrice /
                                                  100000000
                                                ).toFixed(3)
                                              : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch bg-[#ffffff12] flex flex-row items-center justify-between px-24 py-14 z-[2] text-right text-base text-[#ffffff60] font-poppins">
                      <div className="flex-1 flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center justify-start gap-[32px]">
                          <img
                            className="relative w-32 h-32"
                            alt=""
                            src="/sheesh/vuesaxbulkdiscountshape.svg"
                          />
                          <div className="relative leading-[48px] text-5xl text-[#ffffff60]">
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

          return !isMobile ? (
            <div
              key={item._id}
              className="px-2 w-full  rounded-lg font-poppins custom scrollbar flex  flex-row text-start rounded"
            >
              <div className=" w-[20%] flex items-center min-w-[140px] text-start text-sm text-[#ffffff60]  ">
                <a
                  href={`https://solscan.io/account/${item.futuresContract}`}
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
                    </div>{" "}
                  </div>
                </a>
                <div
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
                        <div className="text-[#34c796]">{item.leverage}X</div>
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
                        <div className="text-red-500">{item.leverage}X</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className=" flex justify-end items-center w-[18%] min-w-[90px] text-[0.9rem] text-white   font-poppins ">
                <p>
                  {item.symbol === 1
                    ? (item.initialPrice / 100000000).toFixed(1)
                    : item.symbol === 0
                      ? (item.initialPrice / 100000000).toFixed(3)
                      : item.symbol === 2
                        ? (item.initialPrice / 100000000).toFixed(4)
                        : item.symbol === 3
                          ? (item.initialPrice / 100000000).toFixed(7)
                          : item.symbol === 4
                            ? (item.initialPrice / 100000000).toFixed(3)
                            : item.symbol === 5
                              ? (item.initialPrice / 100000000).toFixed(1)
                              : item.symbol === 6
                                ? (item.initialPrice / 100000000).toFixed(3)
                                : item.symbol === 7
                                  ? (item.initialPrice / 100000000).toFixed(3)
                                  : null}
                </p>
              </div>
              <div className=" flex justify-end items-center w-[18%] min-w-[90px] text-[0.9rem] text-white   font-poppins ">
                <div>
                  {item.symbol === 1
                    ? (item.currentPrice / 100000000).toFixed(1)
                    : item.symbol === 0
                      ? (item.currentPrice / 100000000).toFixed(3)
                      : item.symbol === 2
                        ? (item.currentPrice / 100000000).toFixed(4)
                        : item.symbol === 3
                          ? (item.currentPrice / 100000000).toFixed(7)
                          : item.symbol === 4
                            ? (item.currentPrice / 100000000).toFixed(3)
                            : item.symbol === 5
                              ? (item.currentPrice / 100000000).toFixed(1)
                              : item.symbol === 6
                                ? (item.currentPrice / 100000000).toFixed(3)
                                : item.symbol === 7
                                  ? (item.currentPrice / 100000000).toFixed(3)
                                  : null}
                </div>
              </div>
              <div className="flex justify-end items-center w-[18%] min-w-[90px] text-[0.9rem] text-white   font-poppins ">
                {item.symbol === 1
                  ? (item.liquidationPrice / 100000000).toFixed(1)
                  : item.symbol === 0
                    ? (item.liquidationPrice / 100000000).toFixed(3)
                    : item.symbol === 2
                      ? (item.liquidationPrice / 100000000).toFixed(4)
                      : item.symbol === 3
                        ? (item.liquidationPrice / 100000000).toFixed(7)
                        : item.symbol === 4
                          ? (item.liquidationPrice / 100000000).toFixed(3)
                          : item.symbol === 5
                            ? (item.liquidationPrice / 100000000).toFixed(1)
                            : item.symbol === 6
                              ? (item.liquidationPrice / 100000000).toFixed(3)
                              : item.symbol === 7
                                ? (item.liquidationPrice / 100000000).toFixed(3)
                                : null}
              </div>

              <div className="flex justify-end items-center w-[12%] min-w-[90px] text-[0.9rem] text-[#ffffff60]   font-poppins ">
                {item.usdc === 0
                  ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                  : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}{" "}
              </div>
              <div className="flex justify-end items-center w-[15%] min-w-[90px] text-[0.9rem] text-[#ffffff60]   font-poppins ">
                {item.usdc === 0
                  ? `${((item.betAmount * item.leverage) / LAMPORTS_PER_SOL).toFixed(2)}◎`
                  : `${(((item.betAmount * item.leverage) / LAMPORTS_PER_SOL) * 1000).toFixed(0)}$`}
              </div>
              <div className="flex justify-end items-center w-[12%]  min-w-[90px] text-[0.9rem] text-[#ffffff60]  font-poppins ">
                <p
                  className={
                    item.pnl >= 0 ? "text-[#34c796] " : "text-red-500 "
                  }
                >
                  <div>
                    {item.usdc === 0
                      ? `${item.pnl.toFixed(2)}◎`
                      : `${(item.pnl * 1000).toFixed(2)}$`}
                  </div>
                </p>
              </div>
              <div className="flex justify-end items-center w-[15%] min-w-[140px] text-[0.9rem] text-[#ffffff60]   font-poppins py-1.5 rounded-r">
                <div className="items-center flex md:flex-row flex-col w-[100%]">
                  <div className="flex flex-row items-center justify-end w-[100%] min:w-[140px] gap-1.5">
                    <div className="flex flex-row md:w-[45%] w-[100%] gap-1.5">
                      <div className=" w-[100%]">
                        <button
                          className="flex justify-center items-center w-1/2 h-[26px] w-[100%] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.9rem]  py-1 px-1 rounded border-r border-[#1A1A25]"
                          onClick={() => {
                            setCurrentItem(item);
                            setModalIsOpen(true);
                          }}
                        >
                          <FaShareAlt size={15} />
                        </button>{" "}
                      </div>
                      <div className="justify-center w-[100%] h-[100%]">
                        <button
                          className="w-1/2 h-[26px] flex items-center justify-center w-[100%] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.9rem]  py-1 px-1 rounded"
                          onClick={() => {
                            setCurrentItem(item);
                            setModalIsOpen1(true);
                          }}
                        >
                          <FaCogs size={15} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="flex justify-center items-center h-[26px] md:w-[45%] w-[95%] min:w-[100px] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.84rem] xl:text-[0.9rem]  py-0.5 px-4 rounded"
                      onClick={() => handleButtonClick3(item)}
                      // onMouseEnter={handleMouseEnter(item)}
                    >
                      {isTransactionPending ? (
                        <div className="flex items-center justify-center">
                          <div
                            className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full"
                            role="status"
                          >
                            <span className="visually-hidden">.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="transition ease-in-out duration-300">
                          Close
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {ModalDetails1}
              {ModalDetails2}
            </div>
          ) : (
            <div
              key={item._id}
              className="text-poppins self-stretch flex flex-col items-center justify-start text-left text-xs"
            >
              <div className="self-stretch  flex flex-col items-start justify-start p-4 gap-[8px]">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="text-[#ffffff60] relative leading-[9.98px] flex items-center w-[50px]">
                      Position
                    </div>
                    <div className="relative leading-[12px]">
                      {" "}
                      <a
                        href={`https://solscan.io/account/${item.futuresContract}`}
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
                                <p className="flex ml-1 items-center">
                                  SOL/USD
                                </p>
                              </div>
                            ) : item.symbol === 1 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Btc.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  BTC/USD
                                </p>
                              </div>
                            ) : item.symbol === 2 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Pyth.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  PYTH/USD
                                </p>
                              </div>
                            ) : item.symbol === 3 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Bonk.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  BONK/USD
                                </p>
                              </div>
                            ) : item.symbol === 4 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Jup.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  JUP/USD
                                </p>
                              </div>
                            ) : item.symbol === 5 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Eth.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  ETH/USD
                                </p>
                              </div>
                            ) : item.symbol === 6 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Tia.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  TIA/USD
                                </p>
                              </div>
                            ) : item.symbol === 7 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Sui.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  SUI/USD
                                </p>
                              </div>
                            ) : null}
                          </div>{" "}
                          <div className="text-[#ffffff60] pl-2">
                            {item.usdc === 0
                              ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                              : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}
                          </div>
                          <div
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
                                  <div className="text-[#34c796]">
                                    {item.leverage}X
                                  </div>
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
                                  <div className="text-red-500">
                                    {item.leverage}X
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-[6px] text-right">
                    <div className="flex flex-col items-end justify-center gap-[4px]">
                      <div className="relative leading-[9.98px] text-[#ffffff60]">
                        PnL
                      </div>
                      <p
                        className={
                          item.pnl >= 0
                            ? "text-[#34c796] text-[1.05rem] mt-1"
                            : "text-red-500  text-[1.05rem] mt-1"
                        }
                      >
                        <div>
                          {" "}
                          {item.usdc === 0
                            ? `${item.pnl.toFixed(2)}◎`
                            : `${(item.pnl * 1000).toFixed(2)}$`}{" "}
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-between text-right">
                  <div className="flex flex-col items-start justify-center gap-[6px]">
                    <div className="text-[#ffffff60] relative leading-[12px]">
                      Entry
                    </div>
                    <div className="relative leading-[12px]">
                      {item.symbol === 1
                        ? (item.initialPrice / 100000000).toFixed(1)
                        : item.symbol === 0
                          ? (item.initialPrice / 100000000).toFixed(3)
                          : item.symbol === 2
                            ? (item.initialPrice / 100000000).toFixed(4)
                            : item.symbol === 3
                              ? (item.initialPrice / 100000000).toFixed(7)
                              : item.symbol === 4
                                ? (item.initialPrice / 100000000).toFixed(3)
                                : item.symbol === 5
                                  ? (item.initialPrice / 100000000).toFixed(1)
                                  : item.symbol === 6
                                    ? (item.initialPrice / 100000000).toFixed(3)
                                    : item.symbol === 7
                                      ? (item.initialPrice / 100000000).toFixed(
                                          3
                                        )
                                      : null}
                    </div>
                    <div className="flex flex-col items-start justify-center gap-[4px] text-left text-sm text-short">
                      <div
                        className={
                          item.priceDirection === 0
                            ? "text-[#34c796] "
                            : "text-red-500"
                        }
                      ></div>
                    </div>
                  </div>
                  <div className="w-[63px] flex flex-col items-end justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-[#ffffff60]">
                      Mark
                    </div>
                    <div className="relative leading-[12px]">
                      {" "}
                      {item.symbol === 1
                        ? (item.currentPrice / 100000000).toFixed(1)
                        : item.symbol === 0
                          ? (item.currentPrice / 100000000).toFixed(3)
                          : item.symbol === 2
                            ? (item.currentPrice / 100000000).toFixed(4)
                            : item.symbol === 3
                              ? (item.currentPrice / 100000000).toFixed(7)
                              : item.symbol === 4
                                ? (item.currentPrice / 100000000).toFixed(3)
                                : item.symbol === 5
                                  ? (item.currentPrice / 100000000).toFixed(1)
                                  : item.symbol === 6
                                    ? (item.currentPrice / 100000000).toFixed(3)
                                    : item.symbol === 7
                                      ? (item.currentPrice / 100000000).toFixed(
                                          3
                                        )
                                      : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-[#ffffff60]">
                      Liquidation
                    </div>
                    <div className="flex flex-col items-end justify-center gap-[4px] text-sm text-white">
                      <div className="relative leading-[12px] text-white">
                        {item.symbol === 1
                          ? (item.liquidationPrice / 100000000).toFixed(1)
                          : item.symbol === 0
                            ? (item.liquidationPrice / 100000000).toFixed(3)
                            : item.symbol === 2
                              ? (item.liquidationPrice / 100000000).toFixed(4)
                              : item.symbol === 3
                                ? (item.liquidationPrice / 100000000).toFixed(7)
                                : item.symbol === 4
                                  ? (item.liquidationPrice / 100000000).toFixed(
                                      3
                                    )
                                  : item.symbol === 5
                                    ? (
                                        item.liquidationPrice / 100000000
                                      ).toFixed(1)
                                    : item.symbol === 6
                                      ? (
                                          item.liquidationPrice / 100000000
                                        ).toFixed(3)
                                      : item.symbol === 7
                                        ? (
                                            item.liquidationPrice / 100000000
                                          ).toFixed(3)
                                        : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="items-center w-full text-[0.9rem] text-[#ffffff60]   font-poppins">
                  <div className="items-center flex md:flex-row flex-col w-[100%]">
                    <div className="flex flex-row items-center justify-center w-[100%]">
                      <div className="flex flex-row w-[30%]">
                        <div className=" w-[100%] gap-2">
                          <button
                            className="flex justify-center items-center mr-1 w-1/2 h-[26px] w-[100%] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.9rem]  py-1 px-1 rounded border-r border-[#1A1A25]"
                            onClick={() => {
                              setCurrentItem(item);
                              setModalIsOpen(true);
                            }}
                          >
                            <FaShareAlt size={15} />
                          </button>{" "}
                        </div>
                        <div className="justify-center w-[100%] h-[100%]">
                          <button
                            className="w-1/2 h-[26px] flex items-center ml-1 justify-center w-[100%] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.9rem]  py-1 px-1 rounded"
                            onClick={() => {
                              setCurrentItem(item);
                              setModalIsOpen1(true);
                            }}
                          >
                            <FaCogs size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="px-1"></div>
                      <button
                        className="h-[26px] md:w-[45%] w-[95%]  bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.84rem] xl:text-[0.9rem]  py-0.5 px-4 rounded"
                        onClick={() => handleButtonClick3(item)}
                        // onMouseEnter={handleMouseEnter(item)}
                      >
                        {isTransactionPending ? (
                          <div className="flex items-center justify-center">
                            <div
                              className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full"
                              role="status"
                            >
                              <span className="visually-hidden">.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="transition ease-in-out duration-300">
                            Close
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {ModalDetails1}
                {ModalDetails2}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHistoryPositions = () => {
    const resolvedPositionsToShow = resolvedPositions.filter(
      (position) => position.resolved
    );

    const ModalDetails = (
      <Modal
        className="  rounded-xl border border-layer-1 bg-base"
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
            className="rounded-xl custom-scrollbar h-full w-full p-0 m-0 box-border bg-[#ffffff12]"
            id="my-modal"
            style={{}}
          >
            <div className="font-poppins relative w-full overflow-hidden flex flex-col items-center justify-center text-left text-84xl text-white rounded-[2rem]   border border-layer-3">
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
                ) : currentItem.symbol === 2 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Pyth.png"
                  />
                ) : currentItem.symbol === 3 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Bonk.png"
                  />
                ) : currentItem.symbol === 4 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Jup.png"
                  />
                ) : currentItem.symbol === 5 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Eth1.png"
                  />
                ) : currentItem.symbol === 6 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Tia.png"
                  />
                ) : currentItem.symbol === 7 ? (
                  <img
                    className="absolute top-[456px] left-[564px] w-[396px] h-[396px] object-cover"
                    alt=""
                    src="/coins/320x320/Sui.png"
                  />
                ) : null}
              </div>
              <div className="self-stretch flex flex-col items-center justify-center p-24 gap-[64px] z-[1]">
                <div className="bankGothic text-16xl relative leading-[80%] text-[160px]">
                  {currentItem.symbol === 0 ? (
                    <p className="">{`SOL/USD`}</p>
                  ) : currentItem.symbol === 1 ? (
                    <p className="">{`BTC/USD`}</p>
                  ) : currentItem.symbol === 2 ? (
                    <p className="">{`PYTH/USD`}</p>
                  ) : currentItem.symbol === 3 ? (
                    <p className="">{`BONK/USD`}</p>
                  ) : currentItem.symbol === 4 ? (
                    <p className="">{`JUP/USD`}</p>
                  ) : currentItem.symbol === 5 ? (
                    <p className="">{`ETH/USD`}</p>
                  ) : currentItem.symbol === 6 ? (
                    <p className="">{`TIA/USD`}</p>
                  ) : currentItem.symbol === 7 ? (
                    <p className="">{`SUI/USD`}</p>
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
                        {currentItem.leverage}X
                      </div>
                    </div>
                    <div
                      className={
                        (currentItem.pnl / currentItem.betAmount) * 100 > 0
                          ? "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#0B7A55] to-[#34C796] flex justify-center items-center rounded-2xl  p-1"
                          : "relative font-bold text-[170px] leading-[100%] bg-gradient-to-t from-[#7A3636] to-[#C44141] flex justify-center items-center rounded-2xl  p-1"
                      }
                    >
                      <div className="bg-[#0B111B] bg-opacity-80 px-8 py-4 rounded-2xl ">
                        <span
                          className={
                            (currentItem.pnl / currentItem.betAmount) * 100 > 0
                              ? "text-[#34C796]"
                              : "text-red-500"
                          }
                        >
                          {Math.abs(
                            (currentItem.pnl / currentItem.betAmount) * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-[64px] text-base text-[#ffffff60]">
                    <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                      <div className="relative leading-[48px] text-[#ffffff60]">
                        Entry Price
                      </div>
                      <div className="relative text-[78px] leading-[100%] font-medium text-white">
                        {currentItem.symbol === 1
                          ? (currentItem.initialPrice / 100000000).toFixed(1)
                          : currentItem.symbol === 0
                            ? (currentItem.initialPrice / 100000000).toFixed(3)
                            : currentItem.symbol === 2
                              ? (currentItem.initialPrice / 100000000).toFixed(
                                  4
                                )
                              : currentItem.symbol === 3
                                ? (
                                    currentItem.initialPrice / 100000000
                                  ).toFixed(7)
                                : currentItem.symbol === 4
                                  ? (
                                      currentItem.initialPrice / 100000000
                                    ).toFixed(4)
                                  : currentItem.symbol === 5
                                    ? (
                                        currentItem.initialPrice / 100000000
                                      ).toFixed(1)
                                    : currentItem.symbol === 6
                                      ? (
                                          currentItem.initialPrice / 100000000
                                        ).toFixed(3)
                                      : currentItem.symbol === 7
                                        ? (
                                            currentItem.initialPrice / 100000000
                                          ).toFixed(4)
                                        : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-center gap-[32px] text-5xl">
                      <div className="relative leading-[48px] text-[#ffffff60]">
                        Exit Price
                      </div>
                      <div className="relative text-[78px] leading-[100%] font-medium text-white">
                        {currentItem.symbol === 1
                          ? (currentItem.finalPrice / 100000000).toFixed(1)
                          : currentItem.symbol === 0
                            ? (currentItem.finalPrice / 100000000).toFixed(3)
                            : currentItem.symbol === 2
                              ? (currentItem.finalPrice / 100000000).toFixed(4)
                              : currentItem.symbol === 3
                                ? (currentItem.finalPrice / 100000000).toFixed(
                                    7
                                  )
                                : currentItem.symbol === 4
                                  ? (
                                      currentItem.finalPrice / 100000000
                                    ).toFixed(4)
                                  : currentItem.symbol === 5
                                    ? (
                                        currentItem.finalPrice / 100000000
                                      ).toFixed(1)
                                    : currentItem.symbol === 6
                                      ? (
                                          currentItem.finalPrice / 100000000
                                        ).toFixed(3)
                                      : currentItem.symbol === 7
                                        ? (
                                            currentItem.finalPrice / 100000000
                                          ).toFixed(4)
                                        : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-[#ffffff12] flex flex-row items-center justify-between px-24 py-14 z-[2] text-right text-base text-[#ffffff60] font-poppins">
                <div className="flex-1 flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center justify-start gap-[32px]">
                    <img
                      className="relative w-32 h-32"
                      alt=""
                      src="/sheesh/vuesaxbulkdiscountshape.svg"
                    />
                    <div className="relative leading-[48px] text-5xl text-[#ffffff60]">
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

    // Get only the data for the current page
    const currentPageData = resolvedPositionsToShow;
    return (
      <div>
        {currentPageData.map((item, index) => {
          const isEvenRow = index % 2 === 0;
          const rowStyle = {
            backgroundColor: isEvenRow ? "#232332" : "#1a1a25",
          };

          return !isMobile ? (
            <div className="px-2 w-full  rounded-lg font-poppins custom scrollbar flex  flex-row text-start rounded">
              <div className=" w-[20%] flex items-center min-w-[140px] text-start text-sm text-[#ffffff60]  ">
                <a
                  href={`https://solscan.io/account/${item.futuresContract}`}
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
                    </div>{" "}
                  </div>
                </a>
                <div
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
                        <div className="text-[#34c796]">{item.leverage}X</div>
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
                        <div className="text-red-500">{item.leverage}X</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className=" flex justify-end items-center w-[18%] min-w-[90px] text-[0.9rem] text-white   font-poppins ">
                <p>
                  {item.symbol === 1
                    ? (item.initialPrice / 100000000).toFixed(1)
                    : item.symbol === 0
                      ? (item.initialPrice / 100000000).toFixed(3)
                      : item.symbol === 2
                        ? (item.initialPrice / 100000000).toFixed(4)
                        : item.symbol === 3
                          ? (item.initialPrice / 100000000).toFixed(7)
                          : item.symbol === 4
                            ? (item.initialPrice / 100000000).toFixed(4)
                            : item.symbol === 5
                              ? (item.initialPrice / 100000000).toFixed(1)
                              : item.symbol === 6
                                ? (item.initialPrice / 100000000).toFixed(3)
                                : item.symbol === 7
                                  ? (item.initialPrice / 100000000).toFixed(4)
                                  : null}
                </p>
              </div>
              <div className=" flex justify-end items-center w-[18%] min-w-[90px] text-[0.9rem] text-white   font-poppins ">
                <div>
                  {item.symbol === 1
                    ? (item.finalPrice / 100000000).toFixed(1)
                    : item.symbol === 0
                      ? (item.finalPrice / 100000000).toFixed(3)
                      : item.symbol === 2
                        ? (item.finalPrice / 100000000).toFixed(4)
                        : item.symbol === 3
                          ? (item.finalPrice / 100000000).toFixed(7)
                          : item.symbol === 4
                            ? (item.finalPrice / 100000000).toFixed(4)
                            : item.symbol === 5
                              ? (item.finalPrice / 100000000).toFixed(1)
                              : item.symbol === 6
                                ? (item.finalPrice / 100000000).toFixed(3)
                                : item.symbol === 7
                                  ? (item.finalPrice / 100000000).toFixed(4)
                                  : null}
                </div>
              </div>

              <div className="flex justify-end items-center w-[12%] min-w-[90px] text-[0.9rem] text-[#ffffff60]   font-poppins ">
                {item.usdc === 0
                  ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                  : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}
              </div>
              <div className="flex justify-end items-center w-[15%] min-w-[90px] text-[0.9rem] text-[#ffffff60]   font-poppins ">
                {item.usdc === 0
                  ? `${((item.betAmount * item.leverage) / LAMPORTS_PER_SOL).toFixed(2)}◎`
                  : `${(((item.betAmount * item.leverage) / LAMPORTS_PER_SOL) * 1000).toFixed(0)}$`}
              </div>
              <div className="flex justify-end items-center w-[12%]  min-w-[90px] text-[0.9rem] text-[#ffffff60]  font-poppins ">
                <p
                  className={
                    item.pnl >= 0 ? "text-[#34c796] " : "text-red-500 "
                  }
                >
                  <div>
                    {item.usdc === 0
                      ? `${(item.pnl / LAMPORTS_PER_SOL).toFixed(2)}◎`
                      : `${((item.pnl * 1000) / LAMPORTS_PER_SOL).toFixed(2)}$`}{" "}
                  </div>
                </p>
              </div>
              <div className=" flex justify-end items-center w-[15%] min-w-[140px] text-[0.9rem] text-[#ffffff60]   font-poppins py-1.5 rounded-r">
                <div className="flex justify-end  w-[70%] min-w-[140px]">
                  <button
                    className="min-w-[80px] h-[26px] bg-[#ffffff12] text-[#ffffff60] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.9rem]  py-0.5 px-4 rounded flex items-center justify-center"
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
            <div
              key={item._id}
              className="text-poppins self-stretch flex flex-col items-center justify-start text-left text-xs"
            >
              <div className="self-stretch  flex flex-col items-start justify-start p-4 gap-[8px]">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="text-[#ffffff60] relative leading-[9.98px] flex items-center w-[50px]">
                      Position
                    </div>
                    <div className="relative leading-[12px]">
                      {" "}
                      <a
                        href={`https://solscan.io/account/${item.futuresContract}`}
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
                                <p className="flex ml-1 items-center">
                                  SOL/USD
                                </p>
                              </div>
                            ) : item.symbol === 1 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Btc.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  BTC/USD
                                </p>
                              </div>
                            ) : item.symbol === 2 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Pyth.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  PYTH/USD
                                </p>
                              </div>
                            ) : item.symbol === 3 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Bonk.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  BONK/USD
                                </p>
                              </div>
                            ) : item.symbol === 4 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Jup.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  JUP/USD
                                </p>
                              </div>
                            ) : item.symbol === 5 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Eth.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  ETH/USD
                                </p>
                              </div>
                            ) : item.symbol === 6 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Tia.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  TIA/USD
                                </p>
                              </div>
                            ) : item.symbol === 7 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Sui.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  SUI/USD
                                </p>
                              </div>
                            ) : null}
                          </div>{" "}
                          <div className="text-[#ffffff60] pl-2">
                            {item.usdc === 0
                              ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                              : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}
                          </div>
                          <div
                            className={
                              item.priceDirection === 0
                                ? "text-[#34c796] "
                                : "text-red-500"
                            }
                          >
                            {item.priceDirection === 0 ? (
                              <>
                                <div className="pl-1 flex flex-row items-center">
                                  {" "}
                                  <img
                                    className="relative w-5 h-5 pb-0.5"
                                    alt=""
                                    src="/new/component-82.svg"
                                  />{" "}
                                  {item.leverage}X
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-row items-center ">
                                  <img
                                    className="relative w-5 h-5 pb-0.5"
                                    alt=""
                                    src="/new/component-81.svg"
                                  />{" "}
                                  {item.leverage}X
                                </div>
                              </>
                            )}
                          </div>{" "}
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-[6px] text-right">
                    <div className="flex flex-col items-end justify-center gap-[4px]">
                      <div className="relative leading-[9.98px] text-[#ffffff60]">
                        PnL
                      </div>
                      <p
                        className={
                          item.pnl >= 0
                            ? "text-[#34c796] text-[1.05rem] mt-1"
                            : "text-red-500  text-[1.05rem] mt-1"
                        }
                      >
                        <div>
                          {item.usdc === 0
                            ? `${(item.pnl / LAMPORTS_PER_SOL).toFixed(2)}◎`
                            : `${((item.pnl * 1000) / LAMPORTS_PER_SOL).toFixed(2)}$`}
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-between text-right">
                  <div className=" flex justify-end items-center w-1/4 text-[0.9rem] text-[#ffffff60]   font-poppins py-1.5 rounded-r">
                    <div className="items-center flex md:flex-row flex-col w-[100%]">
                      <div className=" w-[100%] gap-2">
                        <button
                          className="flex justify-center items-center mr-1 w-1/2 h-[26px] w-[100%] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.9rem]  py-1 px-1 rounded border-r border-[#1A1A25]"
                          onClick={() => {
                            setCurrentItem(item);
                            setModalIsOpen(true);
                          }}
                        >
                          <FaShareAlt size={15} />
                        </button>{" "}
                      </div>
                    </div>
                  </div>

                  <div className="w-[63px] flex flex-col items-start justify-center  gap-[6px]">
                    <div className="relative leading-[12px] text-[#ffffff60]">
                      Entry
                    </div>
                    <div className="flex flex-col items-start justify-center  text-white">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.initialPrice / 100000000).toFixed(1)
                          : item.symbol === 0
                            ? (item.initialPrice / 100000000).toFixed(3)
                            : item.symbol === 2
                              ? (item.initialPrice / 100000000).toFixed(4)
                              : item.symbol === 3
                                ? (item.initialPrice / 100000000).toFixed(7)
                                : item.symbol === 4
                                  ? (item.initialPrice / 100000000).toFixed(4)
                                  : item.symbol === 5
                                    ? (item.initialPrice / 100000000).toFixed(1)
                                    : item.symbol === 6
                                      ? (item.initialPrice / 100000000).toFixed(
                                          3
                                        )
                                      : item.symbol === 7
                                        ? (
                                            item.initialPrice / 100000000
                                          ).toFixed(4)
                                        : null}
                      </div>
                    </div>
                  </div>
                  <div className="w-[90px] flex flex-col items-end justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-[#ffffff60]">
                      Exit
                    </div>
                    <div className="flex flex-col items-end justify-center gap-[4px] text-white">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.finalPrice / 100000000).toFixed(1)
                          : item.symbol === 0
                            ? (item.finalPrice / 100000000).toFixed(3)
                            : item.symbol === 2
                              ? (item.finalPrice / 100000000).toFixed(4)
                              : item.symbol === 3
                                ? (item.finalPrice / 100000000).toFixed(7)
                                : item.symbol === 4
                                  ? (item.finalPrice / 100000000).toFixed(4)
                                  : item.symbol === 5
                                    ? (item.finalPrice / 100000000).toFixed(1)
                                    : item.symbol === 6
                                      ? (item.finalPrice / 100000000).toFixed(3)
                                      : item.symbol === 7
                                        ? (item.finalPrice / 100000000).toFixed(
                                            4
                                          )
                                        : null}
                      </div>
                    </div>
                  </div>
                </div>

                {ModalDetails}
              </div>
            </div>
          );
        })}
        {ModalDetails}
      </div>
    );
  };

  const renderOrders = () => {
    const orderstoShow = orders.filter(
      (order) => !order.resolved && order.order
    );

    // Reverse the array to show positions from newest to oldest
    orderstoShow.reverse();

    // Calculate start and end indices for the slice of data you want to display
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Get only the data for the current page
    const currentPageData = orderstoShow.slice(startIndex, endIndex);
    return (
      <div>
        {currentPageData.map((item, index) => {
          const isEvenRow = index % 2 === 0;
          const rowStyle = {
            backgroundColor: isEvenRow ? "#232332" : "#1a1a25",
          };

          return !isMobile ? (
            <div className="px-2 w-full  rounded-lg font-poppins custom scrollbar flex  flex-row text-start rounded">
              <div className=" w-[20%] flex items-center min-w-[140px] text-start text-sm text-[#ffffff60]  ">
                <a
                  href={`https://solscan.io/account/${item.futuresContract}`}
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
                    </div>{" "}
                  </div>
                </a>
                <div
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
                        <div className="text-[#34c796]">{item.leverage}X</div>
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
                        <div className="text-red-500">{item.leverage}X</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className=" flex justify-end items-center w-[20%] min-w-[90px] text-[0.9rem] text-white   font-poppins ">
                <p>
                  {item.symbol === 1
                    ? (item.initialPrice / 100000000).toFixed(1)
                    : item.symbol === 0
                      ? (item.initialPrice / 100000000).toFixed(3)
                      : item.symbol === 2
                        ? (item.initialPrice / 100000000).toFixed(4)
                        : item.symbol === 3
                          ? (item.initialPrice / 100000000).toFixed(7)
                          : item.symbol === 4
                            ? (item.initialPrice / 100000000).toFixed(4)
                            : item.symbol === 5
                              ? (item.initialPrice / 100000000).toFixed(1)
                              : item.symbol === 6
                                ? (item.initialPrice / 100000000).toFixed(3)
                                : item.symbol === 7
                                  ? (item.initialPrice / 100000000).toFixed(4)
                                  : null}
                </p>
              </div>

              <div className="flex justify-end items-center w-[20%] min-w-[90px] text-[0.9rem] text-[#ffffff60]   font-poppins ">
                {item.usdc === 0
                  ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                  : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}
              </div>
              <div className="flex justify-end items-center w-[20%] min-w-[90px] text-[0.9rem] text-[#ffffff60]   font-poppins ">
                {item.usdc === 0
                  ? `${((item.betAmount * item.leverage) / LAMPORTS_PER_SOL).toFixed(2)}◎`
                  : `${(((item.betAmount * item.leverage) / LAMPORTS_PER_SOL) * 1000).toFixed(0)}$`}
              </div>
              <div className=" flex justify-end items-center w-[20%] min-w-[140px] text-[0.9rem] text-[#ffffff60]   font-poppins py-1.5 rounded-r">
                <div className="flex justify-end  w-full min-w-[140px]">
                  <button
                    className="text-[#ffffff60] h-[26px] md:w-[45%] w-[95%]  bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.84rem] xl:text-[0.9rem]  py-0.5 px-4 rounded"
                    onClick={() => closeOrder(item)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={item._id}
              className="text-poppins self-stretch flex flex-col items-center justify-start text-left text-xs"
            >
              <div className="self-stretch  flex flex-col items-start justify-start p-4 gap-[8px]">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="text-[#ffffff60] relative leading-[9.98px] flex items-center w-[50px]">
                      Position
                    </div>
                    <div className="relative leading-[12px]">
                      {" "}
                      <a
                        href={`https://solscan.io/account/${item.futuresContract}`}
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
                                <p className="flex ml-1 items-center">
                                  SOL/USD
                                </p>
                              </div>
                            ) : item.symbol === 1 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Btc.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  BTC/USD
                                </p>
                              </div>
                            ) : item.symbol === 2 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Pyth.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  PYTH/USD
                                </p>
                              </div>
                            ) : item.symbol === 3 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Bonk.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  BONK/USD
                                </p>
                              </div>
                            ) : item.symbol === 4 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Jup.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  JUP/USD
                                </p>
                              </div>
                            ) : item.symbol === 5 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Eth.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  ETH/USD
                                </p>
                              </div>
                            ) : item.symbol === 6 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Tia.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  TIA/USD
                                </p>
                              </div>
                            ) : item.symbol === 7 ? (
                              <div className="py-0.5 flex flex-row justify-start">
                                <img
                                  src="/coins/60x60/Sui.png"
                                  alt="Logo"
                                  width="22"
                                  height="16"
                                />
                                <p className="flex ml-1 items-center">
                                  SUI/USD
                                </p>
                              </div>
                            ) : null}
                          </div>{" "}
                          <div className="flex flex-row items-center justify-center gap-[4px] text-left  text-short">
                            <div className="text-[#ffffff60] pl-2">
                              {item.usdc === 0
                                ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                                : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}
                            </div>
                            <div
                              className={
                                item.priceDirection === 0
                                  ? "text-[#34c796] "
                                  : "text-red-500"
                              }
                            >
                              {item.priceDirection === 0 ? (
                                <>
                                  <div className="flex flex-row items-center">
                                    {" "}
                                    <img
                                      className="relative w-5 h-5 pb-0.5"
                                      alt=""
                                      src="/new/component-82.svg"
                                    />
                                    <div className="">{item.leverage}X</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex flex-row items-center ">
                                    <img
                                      className="relative w-5 h-5 pb-0.5"
                                      alt=""
                                      src="/new/component-81.svg"
                                    />
                                    <div className=" ">{item.leverage}X</div>
                                  </div>
                                </>
                              )}
                            </div>{" "}
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-[6px] text-right">
                    <div className="flex flex-col items-end justify-center gap-[4px]">
                      <div className="relative leading-[9.98px] text-[#ffffff60]">
                        Collateral
                      </div>
                      <div className="relative leading-[12px] mt-1 text-[1.05rem] ">
                        {item.usdc === 0
                          ? `${(item.betAmount / LAMPORTS_PER_SOL).toFixed(2)}◎`
                          : `${((item.betAmount / LAMPORTS_PER_SOL) * 1000).toFixed(1)}$`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-end justify-between text-right">
                  <div className="w-[63px] flex flex-col items-start justify-center gap-[6px]">
                    <div className="relative leading-[12px] text-[#ffffff60]">
                      Limit Price
                    </div>
                    <div className="flex flex-col items-start justify-start text-white text-xs text-left">
                      <div className="relative leading-[12px]">
                        {item.symbol === 1
                          ? (item.initialPrice / 100000000).toFixed(1)
                          : item.symbol === 0
                            ? (item.initialPrice / 100000000).toFixed(3)
                            : item.symbol === 2
                              ? (item.initialPrice / 100000000).toFixed(4)
                              : item.symbol === 3
                                ? (item.initialPrice / 100000000).toFixed(7)
                                : item.symbol === 4
                                  ? (item.initialPrice / 100000000).toFixed(4)
                                  : item.symbol === 5
                                    ? (item.initialPrice / 100000000).toFixed(1)
                                    : item.symbol === 6
                                      ? (item.initialPrice / 100000000).toFixed(
                                          3
                                        )
                                      : item.symbol === 7
                                        ? (
                                            item.initialPrice / 100000000
                                          ).toFixed(4)
                                        : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#ffffff60] items-center flex md:flex-row flex-col w-[50%] items-end">
                    <div className=" w-[100%] gap-2">
                      <button
                        className="flex justify-center items-center h-[26px] w-full min:w-[100px] bg-[#ffffff12] hover:bg-[#ffffff24] transition-all duration-200 ease-in-out text-[0.84rem] xl:text-[0.9rem]  py-0.5 px-4 rounded"
                        onClick={() => closeOrder(item)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>

                <div className=" flex justify-end items-center w-[100%] min-w-[140px] text-[0.9rem] text-[#ffffff60]   font-poppins py-1.5 rounded-r"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!connected) {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full   rounded-lg   md:py-3 overflow-hidden">
        <div className="mx-2 pt-2 md:py-0 border-b-[2px] border-solid border-[#ffffff12] flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              selectedButton === "Positions"
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
            } ${
              selectedButton === "Positions"
                ? ""
                : "text-[#ffffff60] long-short-button"
            }`}
            onClick={() => setSelectedButton("Positions")}
          >
            {!isMobile ? (
              <span className="text-[1.05rem]">Positions</span>
            ) : (
              <span className="text-sm">Positions</span>
            )}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              selectedButton === "History"
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${selectedButton === "History" ? "" : "text-[#ffffff60] long-short-button"}`}
            onClick={() => setSelectedButton("History")}
          >
            {!isMobile ? (
              <span className="text-[1.05rem]">History</span>
            ) : (
              <span className="text-sm">History</span>
            )}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              selectedButton === "Order"
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${selectedButton === "Order" ? "" : "text-[#ffffff60] long-short-button"}`}
            onClick={() => setSelectedButton("Order")}
          >
            {!isMobile ? (
              <span className="text-[1.05rem]">Orders</span>
            ) : (
              <span className="text-sm">Orders</span>
            )}
          </button>
        </div>

        <div className=" flex flex-col items-center justify-center h-full overflow-hidden md:pb-10">
          <FaWallet className="flex justify-center items-center text-2xl text-[#ffffff60] mb-2" />
          <div className="flex justify-center items-center text-[0.95rem] text-[#ffffff60]  text-center overflow-hidden">
            Connect your wallet to see your positions.
          </div>
        </div>
      </div>
    );
  } else if (
    positions.length === 0 &&
    resolvedPositions.length === 0 &&
    orders.length === 0
  ) {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full overflow-hidden rounded-lg   md:py-3 md:">
        <div className="mx-2 pt-2 md:py-0 border-b-[2px] border-solid border-[#ffffff12] flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              selectedButton === "Positions"
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
            } ${selectedButton === "Positions" ? "" : "text-[#ffffff60] long-short-button"}`}
            onClick={() => setSelectedButton("Positions")}
          >
            {!isMobile ? (
              <span className="text-[1.05rem]">Positions</span>
            ) : (
              <span className="text-sm">Positions</span>
            )}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              selectedButton === "History"
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${selectedButton === "History" ? "" : "text-[#ffffff60] long-short-button"}`}
            onClick={() => setSelectedButton("History")}
          >
            {!isMobile ? (
              <span className="text-[1.05rem]">History</span>
            ) : (
              <span className="text-sm">History</span>
            )}
          </button>
          <button
            className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              selectedButton === "Order"
                ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
            } ${selectedButton === "Order" ? "" : "text-[#ffffff60] long-short-button"}`}
            onClick={() => setSelectedButton("Order")}
          >
            {!isMobile ? (
              <span className="text-[1.05rem]">Orders</span>
            ) : (
              <span className="text-sm">Orders</span>
            )}
          </button>
        </div>

        <div className=" flex flex-col items-center justify-center h-full overflow-hidden md:pb-10">
          <FaStream className="text-2xl text-[#ffffff60] mb-2" />
          <p className="text-[0.95rem] text-[#ffffff60]  text-center overflow-hidden">
            You don&apos;t have any opened positions yet.
          </p>
        </div>
      </div>
    );
  } else if (
    positions.length === 0 &&
    (resolvedPositions.length !== 0 ||
      orders.length !== 0 ||
      (resolvedPositions.length !== 0 && orders.length !== 0))
  ) {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full md:overflow-x-scroll overflow-y-hidden lg:overflow-y-auto rounded-lg   md:py-3 md:">
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div className="mx-2 pt-2 md:py-0 border-b-[2px] border-solid border-[#ffffff12] flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
            <button
              className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                selectedButton === "Positions"
                  ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                  : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
              } ${
                selectedButton === "Positions"
                  ? ""
                  : "text-[#ffffff60] long-short-button"
              }`}
              onClick={() => setSelectedButton("Positions")}
            >
              {!isMobile ? (
                <span className="text-[1.05rem]">Positions</span>
              ) : (
                <span className="text-sm">Positions</span>
              )}
            </button>
            <button
              className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                selectedButton === "History"
                  ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                  : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
              } ${
                selectedButton === "History"
                  ? ""
                  : "text-[#ffffff60] long-short-button"
              }`}
              onClick={() => setSelectedButton("History")}
            >
              {!isMobile ? (
                <span className="text-[1.05rem]">History</span>
              ) : (
                <span className="text-sm">History</span>
              )}
            </button>
            <button
              className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                selectedButton === "Order"
                  ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                  : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
              } ${selectedButton === "Order" ? "" : "text-[#ffffff60] long-short-button"}`}
              onClick={() => setSelectedButton("Order")}
            >
              {!isMobile ? (
                <span className="text-[1.05rem]">Orders</span>
              ) : (
                <span className="text-sm">Orders</span>
              )}
            </button>
          </div>

          <div
            className="custom-scrollbar overflow-y-scroll"
            style={{ flexGrow: 1 }}
          >
            {" "}
            {/* This div is your new scrolling area */}
            {selectedButton === "Positions" ? (
              <div className=" flex flex-col items-center justify-center h-full overflow-hidden md:pb-0">
                <FaStream className="text-2xl text-[#ffffff60] mb-2" />
                <p className="justify-center text-[0.95rem] text-[#ffffff60]  text-center overflow-hidden">
                  You don&apos;t have any opened positions yet.
                </p>
              </div>
            ) : selectedButton === "History" ? (
              !isMobile ? (
                <div
                  className="custom-scrollbar overflow-y-scroll rounded"
                  style={{ flexGrow: 1 }}
                >
                  {" "}
                  {/* This div is your new scrolling area */}
                  <div className="px-2 custom-scrollbar w-full flex font-poppins flex-row  rounded text-[#ffffff60] text-sm">
                    <div className="w-[20%] min-w-[140px] text-start   py-1 rounded-l">
                      Position
                    </div>
                    <div className="w-[18%] min-w-[90px] text-end  py-1">
                      Entry
                    </div>
                    <div className="w-[18%] min-w-[90px] text-end   py-1">
                      Exit
                    </div>
                    <div className="w-[12%]  min-w-[90px] text-end   py-1 rounded-r">
                      Collateral
                    </div>
                    <div className=" w-[15%] min-w-[90px] text-end   font-poppins py-1 rounded-r">
                      Size
                    </div>
                    <div className=" w-[12%] min-w-[90px] text-end text-[#ffffff60]  font-poppins py-1 rounded-r">
                      PnL
                    </div>
                    <div className="w-[15%] min-w-[140px] text-end text-[#ffffff60]  font-poppins py-1 rounded-r">
                      Actions
                    </div>
                  </div>
                  {renderHistoryPositions()}
                  <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-[#ffffff60]">
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
                </div>
              ) : (
                <div
                  className="custom-scrollbar overflow-y-scroll rounded"
                  style={{ flexGrow: 1 }}
                >
                  {" "}
                  {/* This div is your new scrolling area */}
                  {renderHistoryPositions()}
                  <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-[#ffffff60]">
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
                </div>
              )
            ) : selectedButton === "Order" ? (
              !isMobile ? (
                // Non-Mobile View for History or Orders
                <div
                  className="custom-scrollbar overflow-y-scroll rounded"
                  style={{ flexGrow: 1 }}
                >
                  {/* Your scrolling area and content for History or Orders in non-mobile view */}
                  <div className="px-2 custom-scrollbar w-full flex font-poppins flex-row  rounded text-[#ffffff60] text-sm">
                    <div className="w-[20%] min-w-[140px] text-start   py-1 rounded-l">
                      Position
                    </div>
                    <div className="w-[20%] min-w-[90px] text-end  py-1">
                      Entry
                    </div>
                    <div className="w-[20%]  min-w-[90px] text-end   py-1 rounded-r">
                      Collateral
                    </div>
                    <div className=" w-[20%] min-w-[90px] text-end   font-poppins py-1 rounded-r">
                      Size
                    </div>
                    <div className="w-[20%] min-w-[140px] text-end text-[#ffffff60]  font-poppins py-1 rounded-r">
                      Actions
                    </div>
                  </div>
                  {renderOrders()}
                </div>
              ) : (
                // Mobile View for History or Orders
                <div
                  className="custom-scrollbar overflow-y-scroll rounded"
                  style={{ flexGrow: 1 }}
                >
                  {/* Mobile-specific content rendering for History or Orders */}
                  {renderOrders()}
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="md:px-2 custom-scrollbar w-[100%] order-4 md:order-4 h-full md:overflow-x-scroll overflow-y-hidden lg:overflow-y-auto rounded-lg   md:py-3 md:">
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div className="mx-2 pt-2 md:py-0 border-b-[2px] border-solid border-[#ffffff12] flex justify-start items-center md:justify-start custom-scrollbar sticky top-0 z-10 mb-2 ">
            <button
              className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                selectedButton === "Positions"
                  ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                  : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5 "
              } ${selectedButton === "Positions" ? "" : "text-[#ffffff60] long-short-button"}`}
              onClick={() => setSelectedButton("Positions")}
            >
              {!isMobile ? (
                <span className="text-[1.05rem]">Positions</span>
              ) : (
                <span className="text-sm">Positions</span>
              )}
            </button>
            <button
              className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                selectedButton === "History"
                  ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                  : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
              } ${selectedButton === "History" ? "" : "text-[#ffffff60] long-short-button"}`}
              onClick={() => setSelectedButton("History")}
            >
              {!isMobile ? (
                <span className="text-[1.05rem]">History</span>
              ) : (
                <span className="text-sm">History</span>
              )}
            </button>
            <button
              className={`py-3.5 text-xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
                selectedButton === "Order"
                  ? "[background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.25))] flex flex-row items-start justify-start pt-0 px-4 pb-1.5 border-b-[2px] border-solid border-primary"
                  : "flex flex-row items-start justify-start pt-0 px-4 pb-1.5"
              } ${selectedButton === "Order" ? "" : "text-[#ffffff60] long-short-button"}`}
              onClick={() => setSelectedButton("Order")}
            >
              {!isMobile ? (
                <span className="text-[1.05rem]">Orders</span>
              ) : (
                <span className="text-sm">Orders</span>
              )}
            </button>
          </div>
          {!isMobile ? (
            <div
              className="custom-scrollbar overflow-y-auto  rounded"
              style={{ flexGrow: 1 }}
            >
              {" "}
              {/* This div is your new scrolling area */}
              {selectedButton !== "Order" ? (
                <div className="px-2 font-poppins custom-scrollbar w-full flex flex-row  rounded text-[#ffffff60] text-sm">
                  <div className="w-[20%] min-w-[140px] text-start   py-1 rounded-l">
                    Position
                  </div>
                  <div className="w-[18%] min-w-[90px] text-end  py-1">
                    Entry
                  </div>
                  <div className="w-[18%] min-w-[90px] text-end   py-1">
                    {selectedButton === "Positions" ? "Mark" : "Exit"}
                  </div>
                  {selectedButton === "Positions" && (
                    <div className="w-[18%] min-w-[90px] text-end py-1">
                      Liquidation
                    </div>
                  )}
                  <div className="w-[12%]  min-w-[90px] text-end   py-1 rounded-r">
                    Collateral
                  </div>
                  <div className=" w-[15%] min-w-[90px] text-end   font-poppins py-1 rounded-r">
                    Size
                  </div>

                  <div className=" w-[12%] min-w-[90px] text-end text-[#ffffff60]  font-poppins py-1 rounded-r">
                    PnL
                  </div>

                  <div className="md:pr-0 pr-2 w-[15%] min-w-[140px] text-end text-[#ffffff60]  font-poppins py-1 rounded-r">
                    Actions
                  </div>
                </div>
              ) : (
                <div className="px-2 font-poppins custom-scrollbar w-full flex flex-row  rounded text-[#ffffff60] text-sm">
                  <div className="w-[20%] min-w-[140px] text-start   py-1 rounded-l">
                    Position
                  </div>
                  <div className="w-[20%] min-w-[90px] text-end  py-1">
                    Entry
                  </div>

                  <div className="w-[20%]  min-w-[90px] text-end   py-1 rounded-r">
                    Collateral
                  </div>
                  <div className=" w-[20%] min-w-[90px] text-end   font-poppins py-1 rounded-r">
                    Size
                  </div>
                  <div className="md:pr-0 pr-2 w-[20%] min-w-[140px] text-end text-[#ffffff60]  font-poppins py-1 rounded-r">
                    Actions
                  </div>
                </div>
              )}
              {selectedButton === "Positions"
                ? renderPositions(positions)
                : selectedButton === "History"
                  ? renderHistoryPositions()
                  : selectedButton === "Order"
                    ? renderOrders()
                    : null}{" "}
              {selectedButton !== "History" ? null : (
                <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-[#ffffff60]">
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
              {selectedButton === "Positions"
                ? renderPositions(positions)
                : selectedButton === "History"
                  ? renderHistoryPositions()
                  : selectedButton === "Order"
                    ? renderOrders()
                    : null}{" "}
              {selectedButton !== "History" ? null : (
                <div className="flex justify-end mt-1 text-[0.95rem] rounded font-poppins text-[#ffffff60]">
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
  }
};

export default MyPositions;
