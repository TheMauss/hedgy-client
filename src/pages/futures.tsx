import Head from "next/head";
import TradeBarFutures from "../components/TradeBarFuturesnew";
import RecentPredictions from "../components/RecentPredictionsNew";
import MyPositionsFutures from "../components/MyPositionsFuturesNew";
import AppBar from "../components/AppBar";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import React from "react";
import PairPicker from "components/PairPickerFutures";
import InterestBar from "components/InterestBar";
import Footer from "components/Footernew";
import { priceDataState } from "components/globalStatse";
import { FaChevronLeft, FaChevronUp } from "react-icons/fa";
import { Graph } from "components/GraphNew";
import { notify } from "../utils/notifications";
import Modal from "react-modal";
import { useVisibility } from "components/VisibilityContext";
import socketIOClient from "socket.io-client";
import usePageVisibility from "../hooks/usePageVisibility";
import useUserActivity from "../hooks/useUserActivity";
import { useMemo } from "react";

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

const getInitialCryptosState = (crypto) => {
  const initialState = {
    BTC: false,
    SOL: false,
    PYTH: false,
    BONK: false,
    JUP: false,
    ETH: false,
    TIA: false,
    SUI: false,
  };

  if (crypto && initialState.hasOwnProperty(crypto.toUpperCase())) {
    return { ...initialState, [crypto.toUpperCase()]: true };
  }

  return initialState;
};

const useUniqueSymbols = (positions, defaultSymbol) => {
  return useMemo(() => {
    const newSymbols = new Set([defaultSymbol]);

    positions.forEach((position) => {
      const mappedSymbol = symbolMap[position.symbol];
      if (mappedSymbol) {
        newSymbols.add(mappedSymbol);
      }
    });

    return Array.from(newSymbols);
  }, [positions.map((pos) => pos.symbol).join(","), defaultSymbol]); // Only recompute if the list of position symbols changes
};

const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT153;

const Futures: FC = () => {
  const [symbol, setSymbol] = useState("Crypto.SOL/USD"); // default value
  const [latestOpenedPosition, setLatestOpenedPosition] = useState<
    Record<string, Position | null>
  >({});
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [usdcTotalBetAmount, setUsdcTotalBetAmount] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [usdcTotalDeposits, setUsdcTotalDeposits] = useState(0);

  const [divHeight, setDivHeight] = useState("60vh");
  const [data, setData] = useState({
    btcLong: "0",
    btcShort: "0",
    solLong: "0",
    solShort: "0",
    longCollateral: "0",
    shortCollateral: "0",
    pythLong: "0",
    pythShort: "0",
    bonkLong: "0",
    bonkShort: "0",
    jupLong: "0",
    jupShort: "0",
    ethLong: "0",
    ethShort: "0",
    tiaLong: "0",
    tiaShort: "0",
    suiLong: "0",
    suiShort: "0",
  });

  const [prices, setPrices] = useState({});
  const [EMAprice, setEMAprice] = useState(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedCryptos, setSelectedCryptos] = useState({
    BTC: false,
    SOL: true,
    PYTH: false,
    BONK: false,
    JUP: false,
    ETH: false,
    TIA: false,
    SUI: false,
  });

  const [openingPrice, setOpeningPrice] = useState(0);
  const { publicKey } = useWallet();
  const [initialPrice, setInitialPrice] = useState(0);
  const [selectedPair, setSelectedPair] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<"SOL" | "USDC">(
    "SOL"
  );
  const [toggleState, setToggleState] = useState("LONG");

  const router = useRouter();
  const { crypto } = router.query; // could be 'btc' or 'sol'

  const ref = useRef(null); // Ref for the element that will become sticky

  const bottomRef = useRef(null);
  const [isStickyBottom, setIsStickyBottom] = useState(true);

  const lastNotificationRef = useRef(null);
  let debounceTimer;
  const debounceDelay = 75;
  let lastNotificationTime = 0;

  const [socket, setSocket] = useState(null);
  const isVisiblePrice = usePageVisibility();
  const { isActive, setIsActive } = useUserActivity(15000);
  const [symbolSub, setSymbolSub] = useState("Crypto.SOL/USD"); // default value
  const socketRef = useRef(socket);
  const symbols = useUniqueSymbols(positions, symbolSub);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const clientCurrentSymbol = useRef(null);

  useEffect(() => {
    console.log("Setting up socket connection for symbol:", symbolSub);
    const symbol = symbolSub;

    // Ensure the socket is connected and active
    if (publicKey && isActive) {
      if (!socketRef.current) {
        console.log("Establishing new socket connection...");
        const newSocket = socketIOClient(ENDPOINT, {
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        newSocket.on("connect", () => {
          console.log("Connected to WebSocket server");
          newSocket.emit("subscribe", { publicKey, symbol });
          clientCurrentSymbol.current = symbol; // Set the current symbol on successful connection
          setIsSocketConnected(true);
        });

        newSocket.on("connect_error", (error) => {
          console.log("Connection Error:", error);
          setIsSocketConnected(false);
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
          setIsSocketConnected(false);
        });

        socketRef.current = newSocket;
      } else {
        console.log("Updating subscription to new symbol:", symbol);
        // Unsubscribe from previous symbol and subscribe to new symbol
        if (clientCurrentSymbol.current) {
          socketRef.current.emit("unsubscribe", {
            publicKey,
            symbol: clientCurrentSymbol.current,
          });
        }
        socketRef.current.emit("subscribe", { publicKey, symbol });
        clientCurrentSymbol.current = symbol; // Update the current symbol reference
      }

      // Cleanup on component unmount or conditions no longer met
      return () => {
        if (socketRef.current) {
          console.log("Cleaning up: Unsubscribing and disconnecting.");
          if (clientCurrentSymbol.current) {
            socketRef.current.emit("unsubscribe", {
              publicKey,
              symbol: clientCurrentSymbol.current,
            });
          }
          setIsSocketConnected(false);
          // socketRef.current.close();
          // socketRef.current = null;
        }
      };
    }
  }, [publicKey, symbolSub, isActive, socketRef, isSocketConnected]);

  useEffect(() => {
    const checkConnectionInterval = setInterval(() => {
      if (socketRef.current) {
        const isConnected = socketRef.current.connected;
        if (!isConnected) {
          // Attempt to reconnect or handle a disconnected socket
          socketRef.current.connect();
        } else {
        }
      }
    }, 15000); // Check every 10 seconds

    return () => clearInterval(checkConnectionInterval);
  }, []);

  // Example adjustment for immediate deduplication
  const handleNewNotification = (newNotification) => {
    const currentTime = Date.now();
    const isNewNotificationSameAsLast =
      lastNotificationRef.current?.id === newNotification.id;

    if (!isNewNotificationSameAsLast) {
      // Process for new or non-duplicate notification
      processNotification(newNotification, currentTime);
    } else {
      console.log("Duplicate notification detected, skipping.");
    }
  };

  const processNotification = (newNotification, currentTime) => {
    lastNotificationRef.current = newNotification;
    lastNotificationTime = currentTime;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => notify(newNotification), debounceDelay);
  };

  useEffect(() => {
    // Only proceed if the router is ready and the crypto parameter is present
    if (!router.isReady || !crypto) {
      console.log("Router or crypto query not ready.");
      return;
    }

    const cryptoKey = crypto.toString().toUpperCase();

    // Update selectedCryptos state
    const newSelectedCryptos = { ...selectedCryptos, [cryptoKey]: true };

    // Check if the cryptoKey is valid
    if (!Object.keys(newSelectedCryptos).includes(cryptoKey)) {
      console.log(`Crypto key ${cryptoKey} is not recognized.`);
      return;
    }

    setSelectedCryptos(newSelectedCryptos);

    const symbolMap = {
      BTC: "Crypto.BTC/USD",
      SOL: "Crypto.SOL/USD",
      PYTH: "Crypto.PYTH/USD",
      BONK: "Crypto.BONK/USD",
      JUP: "Crypto.JUP/USD",
      ETH: "Crypto.ETH/USD",
      TIA: "Crypto.TIA/USD",
      SUI: "Crypto.SUI/USD",

      // Add other mappings as necessary
    };

    // Set the symbol for the selected crypto
    if (symbolMap[cryptoKey]) {
      setSymbol(symbolMap[cryptoKey]);
      console.log(`Symbol is set to ${symbolMap[cryptoKey]}`);
    } else {
      console.log(`No symbol found for ${cryptoKey}.`);
    }
  }, [crypto, router.isReady]);

  useEffect(() => {
    Object.keys(prices).forEach((symbol) => {
      priceDataState.updatePriceData(symbol, prices[symbol]);
    });
  }, [prices]);

  const handleTotalBetAmountChange = (totalBetAmount) => {
    setTotalBetAmount(totalBetAmount);
  };

  const handleusdcTotalBetAmountChange = (usdcTotalBetAmount) => {
    setUsdcTotalBetAmount(usdcTotalBetAmount);
  };

  const handleSymbolChange = (newSymbol) => {
    setSymbol(newSymbol);
  };

  const handleDivHeightChange = (newHeight) => {
    setDivHeight(newHeight);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only run this client-side since window object is not available server-side
      let scrollPosition = 0;

      const handleFocus = () => {
        // Save the current scroll position when an input is focused
        scrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;
      };

      const handleBlur = () => {
        // When an input is blurred, scroll back to the saved position
        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      };

      // Add the event listeners when the component mounts
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        input.addEventListener("focus", handleFocus);
        input.addEventListener("blur", handleBlur);
      });

      // Remove the event listeners when the component unmounts
      return () => {
        inputs.forEach((input) => {
          input.removeEventListener("focus", handleFocus);
          input.removeEventListener("blur", handleBlur);
        });
      };
    }
  }, []);

  const [showSidePanel, setShowSidePanel] = useState(true);

  const toggleSidePanel = () => {
    setShowSidePanel((prevShowSidePanel) => !prevShowSidePanel);
  };

  const [showBottomPanel, setshowBottomPanel] = useState(true);

  const toggleBottomPanel = () => {
    setshowBottomPanel((prevshowBottomPanel) => !prevshowBottomPanel);
  };

  useEffect(() => {
    // Provide a default empty object if selectedCryptos is undefined or null
    const selectedCryptosSafe = selectedCryptos || {};

    const selectedCrypto = Object.keys(selectedCryptosSafe).find(
      (key) => selectedCryptosSafe[key]
    );
    if (selectedCrypto) {
      setSelectedPair(selectedCrypto);
    }
    const decimalPlacesMapping = {
      BTC: 1, // Example: Bitcoin to 2 decimal places
      SOL: 3,
      PYTH: 4,
      BONK: 8,
      ETH: 1,
      SUI: 4,
      TIA: 3,
      JUP: 4,

      // Add more mappings as needed
    };
    // Get the number of decimal places for the selected crypto, defaulting to a standard value if not found
    const decimalPlaces =
      decimalPlacesMapping[selectedCrypto?.toUpperCase()] || 2;

    const newInitialPrice =
      prices?.[`Crypto.${selectedCrypto?.toUpperCase()}/USD`]?.price /
        100000000 || 0;
    setInitialPrice(parseFloat(newInitialPrice.toFixed(decimalPlaces)));
  }, [selectedCryptos, prices]);

  const { isVisible, setIsVisible } = useVisibility();

  const closeModalHandler = () => {
    setIsVisible(false); // Hide the TradeBarFutures and the pseudo-modal
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const showTradeBarAndSetToShort = () => {
    setIsVisible(true); // Show the TradeBarFutures
    setToggleState("SHORT"); // Set the state to "SHORT"
  };

  const showTradeBarAndSetToLong = () => {
    setIsVisible(true); // Show the TradeBarFutures
    setToggleState("LONG"); // Set the state to "SHORT"
  };

  // Minimum swipe distance
  const minSwipeDistance = 100; // Adjust based on your needs

  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientY;
    setTouchStart(touchDown);
  };

  const handleTouchEnd = (e) => {
    const touchDown = touchStart;
    const currentTouch = e.changedTouches[0].clientY;
    setTouchEnd(currentTouch);

    // Check if the swipe gesture is downward and exceeds the minimum swipe distance
    if (touchDown && currentTouch - touchDown > minSwipeDistance) {
      closeModalHandler(); // Close the modal
    }

    // Reset touch start and end
    setTouchStart(null);
    setTouchEnd(null);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const mainContent = document.querySelector(".main-content");
    if (isVisible) {
      mainContent.classList.add("blur-behind-modal");
    } else {
      mainContent.classList.remove("blur-behind-modal");
    }

    // Cleanup function to ensure the class is removed when the component unmounts
    return () => {
      mainContent.classList.remove("blur-behind-modal");
    };
  }, [isVisible]);

  return (
    <div className="relative max-h-100vh overflow-hidden">
      <div
        className="overflow-hidden absolute futures-circles4 w-full h-full"
        style={{
          zIndex: 0,
          transform: "translate(-42%, -28%)",
          right: "0%",
        }}
      ></div>
      <div
        className="overflow-hidden absolute futures-circles5 w-full h-full"
        style={{
          zIndex: 0,
          transform: "translate(40%, -30%)",
          right: "0%",
        }}
      ></div>
      <div
        className="overflow-hidden absolute futures-circles1 w-full h-full"
        style={{
          zIndex: 0,
          transform: "translate(-38%, 55%)",
          right: "0%",
        }}
      >
        {" "}
      </div>
      <div
        className="overflow-hidden absolute futures-circles2 w-full h-full"
        style={{
          zIndex: 0,
          transform: "translate(65%, 35%)",
          right: "0%",
        }}
      >
        {" "}
      </div>

      {/* <div className="overflow-hidden absolute futures-circles w-full h-full"
                              style={{
                                zIndex: 10,
                                transform: "translate(0%, -50%)",
                                right: "0%",
                              }}> </div> */}

      <Head>
        <title>
          {" "}
          {selectedPair} ${initialPrice} | PopFi Futures
        </title>
        <meta name="description" content="PopFi" />
      </Head>
      {isMobile && (
        <div className={`pseudo-modal ${isVisible ? "visible" : "hidden"}`}>
          {/* You can include a background overlay here */}
          <div
            className={`relative overflow-auto z-1000000 bg-[#00000090] w-full `}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {" "}
            <div
              onClick={closeModalHandler}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 h-2.5 bg-[#ffffff60] rounded-full"
            ></div>
            <TradeBarFutures
              setTotalDeposits={setTotalDeposits}
              setUsdcTotalDeposits={setUsdcTotalDeposits}
              setToggleState={setToggleState}
              toggleState={toggleState}
              setOpeningPrice={setOpeningPrice}
              openingPrice={openingPrice}
              setParentDivHeight={handleDivHeightChange}
              totalBetAmount={totalBetAmount}
              usdcTotalBetAmount={usdcTotalBetAmount}
              data={data}
              setData={setData}
              setPrices={setPrices}
              setEMAPrice={setEMAprice}
              prices={prices}
              EMAprice={EMAprice}
              selectedCryptos={selectedCryptos}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              isActive={isActive}
              setIsActive={setIsActive}
              setSymbolSub={setSymbolSub}
              isSocketConnected={isSocketConnected}
            />{" "}
          </div>
        </div>
      )}
      <div className=" main-content relative w-full flex justify-center flex-col">
        <div className="relative lg:block hidden mt-1">
          {" "}
          {/* Ensure the parent has relative positioning */}
          <button
            onClick={toggleSidePanel}
            className="z-50 fixed right-0 top-1/2 transform -translate-y-1/2 text-sm text-white  rounded lg:block hidden"
          ></button>
          <button
            onClick={toggleBottomPanel}
            className="z-50 fixed right-1/2 bottom-0 transform -translate-y-1/2 text-sm text-white  rounded lg:block hidden"
          >
            <FaChevronUp
              className={`ml-2 transition-transform duration-300 text-layer-3 ${showBottomPanel ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className=" w-full md:px-3 h-full lg:h-[calc(100vh-85px)] overflow-hidden ">
          <div className="w-full">
            {/* right content */}
            <div className="w-full px-2">
              {/* top */}
              <div className="w-full flex md:flex-row flex-col ">
                <div className="w-full flex flex-col">
                  <div className="w-full md:flex-row flex-col gap-2">
                    <div className="w-full flex md:flex-row flex-col gap-3 lg:pt-0 md:pt-1">
                      <div className="w-full lg:h-[calc(100vh-87px)] overflow-auto ">
                        <div className="flex md:flex-row flex-col">
                          <PairPicker
                            onSymbolChange={handleSymbolChange}
                            selectedCryptos={selectedCryptos}
                            setSelectedCryptos={setSelectedCryptos}
                            openingPrice={openingPrice}
                            prices={prices}
                          />
                          <InterestBar
                            totalDeposits={totalDeposits}
                            usdcTotalDeposits={usdcTotalDeposits}
                            openingPrice={openingPrice}
                            symbol={symbol}
                            data={data}
                            prices={prices}
                            EMAprice={EMAprice}
                            selectedCryptos={selectedCryptos}
                            selectedCurrency={selectedCurrency}
                          />
                        </div>
                        <div
                          className={`w-full md:block flex-col  md:order-2 order-1 md:mt-2 md:h-[calc((100vh-6px)-(42vh))] h-[calc((100vh+2px)-(58vh))] ${
                            showBottomPanel
                              ? "lg:h-[calc((100vh-6px)-(42vh))]"
                              : "lg:h-[calc(100vh-108px-44px)] "
                          }`}
                        >
                          <Graph
                            symbol={symbol}
                            latestOpenedPosition={latestOpenedPosition}
                            prices={prices}
                          />
                        </div>

                        <div
                          className={`rounded-lg w-full bg-[#ffffff08]  lg:flex-col  order-3   lg:h-[calc((100vh-233px)-(58vh-79px))] hidden mt-3 ${showBottomPanel ? "lg:flex" : "hidden"}`}
                        >
                          <MyPositionsFutures
                            latestOpenedPosition={latestOpenedPosition}
                            setLatestOpenedPosition={setLatestOpenedPosition}
                            handleTotalBetAmountChange={
                              handleTotalBetAmountChange
                            }
                            handleusdcTotalBetAmountChange={
                              handleusdcTotalBetAmountChange
                            }
                            prices={prices}
                            handleNewNotification={handleNewNotification}
                            setPositions={setPositions}
                            positions={positions}
                            isActive={isActive}
                            setIsActive={setIsActive}
                            setSymbolSub={setSymbolSub}
                            isSocketConnected={isSocketConnected}
                          />
                        </div>
                      </div>
                      {!isMobile && (
                        <div
                          className={`md:flex hidden mt-2.5 z-100 md:w-[375px] bg-[#ffffff08] h-1/2 w-full md:order-1 order-2  rounded-lg  `}
                        >
                          <TradeBarFutures
                            setTotalDeposits={setTotalDeposits}
                            setUsdcTotalDeposits={setUsdcTotalDeposits}
                            setToggleState={setToggleState}
                            toggleState={toggleState}
                            setOpeningPrice={setOpeningPrice}
                            openingPrice={openingPrice}
                            setParentDivHeight={handleDivHeightChange}
                            totalBetAmount={totalBetAmount}
                            usdcTotalBetAmount={usdcTotalBetAmount}
                            data={data}
                            setData={setData}
                            setPrices={setPrices}
                            setEMAPrice={setEMAprice}
                            prices={prices}
                            EMAprice={EMAprice}
                            selectedCryptos={selectedCryptos}
                            selectedCurrency={selectedCurrency}
                            setSelectedCurrency={setSelectedCurrency}
                            isActive={isActive}
                            setIsActive={setIsActive}
                            setSymbolSub={setSymbolSub}
                            isSocketConnected={isSocketConnected}
                          />
                        </div>
                      )}
                      {/* <div
                        className={`lg:block hidden md:w-[315px] flex flex-col lg:h-[calc(100vh-88px)] ${showSidePanel ? "" : "lg:hidden"}`}
                      >
                        <div className="w-full flex flex-col h-[59%]">
                          <RecentPredictions divHeight={divHeight} />
                        </div>
                        <div className="h-[41%] mt-2">
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl md:px-0 md:mt-3 mt-1.5 bg-[#ffffff08] md:h-[calc((100vh-233px)-(58vh-81px))] mb-1 h-[calc((100vh-172px)-(42vh))] w-full flex lg:hidden  `}
              >
                <MyPositionsFutures
                  latestOpenedPosition={latestOpenedPosition}
                  setLatestOpenedPosition={setLatestOpenedPosition}
                  handleTotalBetAmountChange={handleTotalBetAmountChange}
                  handleusdcTotalBetAmountChange={
                    handleusdcTotalBetAmountChange
                  }
                  prices={prices}
                  handleNewNotification={handleNewNotification}
                  setPositions={setPositions}
                  positions={positions}
                  isActive={isActive}
                  setIsActive={setIsActive}
                  setSymbolSub={setSymbolSub}
                  isSocketConnected={isSocketConnected}
                />
              </div>
              {/* <div className="flex flex-row md:py-2 md:gap-2">
                <div
                  className={`h-[calc(100vh-192px)] md:h-[330px] w-full md:block lg:flex-col lg:hidden flex-row gap-2 ${
                    ActiveButton === 3 ? "" : "hidden"
                  }`}
                >
                  <RecentPredictions divHeight={divHeight} />
                </div>
                <div
                  className={`h-[calc(100vh-192px)] md:h-[330px] w-full md:block lg:flex-col lg:hidden flex-row gap-2 ${
                    ActiveButton === 4 ? "" : "hidden"
                  }`}
                >
                </div>
              </div> */}
            </div>
          </div>
          {/* <div className="md:hidden">
            <Footer />
          </div> */}

          <div
            ref={bottomRef}
            className={`bankGothic px-3 md:hidden h-[50px]  self-stretch bg-[#00000040] flex flex-row items-center justify-center py-0 text-center text-grey font-bankgothic-md-bt`}
          >
            <button
              onClick={showTradeBarAndSetToLong}
              className={`bg-primary hover:bg-new-green-dark mx-2.5 py-1 w-1/2 rounded-lg flex flex-row items-center justify-center box-border  text-black transition ease-in-out duration-300
              }`}
            >
              LONG
            </button>
            <button
              onClick={showTradeBarAndSetToShort}
              className={`bg-short hover:bg-new-red-dark mx-2.5 py-1 w-1/2 rounded-lg flex flex-row items-center justify-center box-border  text-black transition ease-in-out duration-300
              }`}
            >
              SHORT
            </button>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Futures;
