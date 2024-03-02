import Head from "next/head";
import TradeBarFutures from "../components/TradeBarFuturesnew";
import RecentPredictions from "../components/RecentPredictionsNew";
import MyPositionsFutures from "../components/MyPositionsFuturesNew";
import { FC, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import React from "react";
import Chat from "../components/Chatnew";
import PairPicker from "components/PairPickerFutures";
import InterestBar from "components/InterestBar";
import Footer from "components/Footernew";
import { priceDataState } from "components/globalStatse";
import { FaChevronLeft, FaChevronUp } from "react-icons/fa";
import { Graph } from "components/GraphNew";
import { notify } from "../utils/notifications";

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
  order: boolean
}

const Futures: FC = () => {
  const [symbol, setSymbol] = useState("Crypto.SOL/USD"); // default value
  const [latestOpenedPosition, setLatestOpenedPosition] = useState<
    Record<string, Position | null>
  >({});
  const [totalBetAmount, setTotalBetAmount] = useState(0);
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
  const [selectedCryptos, setSelectedCryptos] = useState({
    BTC: false,
    SOL: true,
    PYTH: false,
    BONK: false,
    JUP: false,
    ETH: false,
    TIA: false,
    SUI: false,
    // Add other cryptocurrencies as needed
  });
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(false);
  const [isSoliditySelected, setIsSoliditySelected] = useState(true);
  const [openingPrice, setOpeningPrice] = useState(0);
  const [initialPrice, setInitialPrice] = useState(0);
  const [selectedPair, setSelectedPair] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<'SOL' | 'USDC'>('SOL');


  const router = useRouter();
  const { crypto } = router.query; // could be 'btc' or 'sol'

  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef(null); // Ref for the element that will become sticky

  const [ActiveButton, setActiveButton] = useState(1);

  const bottomRef = useRef(null);
  const [isStickyBottom, setIsStickyBottom] = useState(true);

  const lastNotificationRef = useRef(null);
  let debounceTimer;
  const debounceDelay = 75;
  let lastNotificationTime = 0;

// Example adjustment for immediate deduplication
const handleNewNotification = (newNotification) => {
  const currentTime = Date.now();
  const isNewNotificationSameAsLast = lastNotificationRef.current?.id === newNotification.id;
  
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

  
  

  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);

    switch (buttonIndex) {
      case 1:
        setActiveButton(1); // 0.1%
        break;
      case 2:
        setActiveButton(2); // 0.3%
        break;
      case 3:
        setActiveButton(3); // 0.5%
        break;
      case 4:
        setActiveButton(4); // 0.5%
        break;
    }
  };

  // Function to update the state based on the window width
  const checkSize = () => {
    // Tailwind's 'sm' breakpoint is 768px by default. Adjust the value if you've customized the breakpoints.
    if (window.innerWidth >= 768) {
      setActiveButton(1);
    }
  };

  // Effect hook to add event listener on mount and cleanup on unmount
  useEffect(() => {
    // Check on initial mount
    checkSize();

    // Add event listener for resize
    window.addEventListener("resize", checkSize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const stickyThreshold = 64; // for example, 200px from the top of the page
      const bottomStickyThreshold = -1;
      if (ref.current) {
        setIsSticky(window.scrollY > stickyThreshold);
      }

      // Handle sticky bottom element
      // Handle sticky bottom element
      if (bottomRef.current) {
        const viewportHeight = window.innerHeight;
        // Check if the bottom of the element is within the viewport
        const isNearBottom =
          window.scrollY + viewportHeight >=
          document.documentElement.offsetHeight - bottomStickyThreshold;
        setIsStickyBottom(!isNearBottom);
      }
    };

    // Trigger the scroll event listener on scroll
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  return (
    <div>
      <Head>
        <title>
          {" "}
          {selectedPair} ${initialPrice} | PopFi Futures
        </title>
        <meta name="description" content="PopFi" />
      </Head>
      <div className="bg-base w-full flex justify-center flex-col">
        <div className="relative lg:block hidden mt-1">
          {" "}
          {/* Ensure the parent has relative positioning */}
          <button
            onClick={toggleSidePanel}
            className="z-50 fixed right-0 top-1/2 transform -translate-y-1/2 text-sm text-white  rounded lg:block hidden"
          >
            <FaChevronLeft
              className={`ml-2 transition-transform duration-300 text-layer-3 ${showSidePanel ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={toggleBottomPanel}
            className="z-50 fixed right-1/2 bottom-0 transform -translate-y-1/2 text-sm text-white  rounded lg:block hidden"
          >
            <FaChevronUp
              className={`ml-2 transition-transform duration-300 text-layer-3 ${showBottomPanel ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <div className="w-full md:px-2 h-full lg:h-[calc(100vh-78px)] bg-base overflow-hidden ">
          <div className="w-full">
            {/* right content */}
            <div className="w-full">
              {/* top */}
              <div className="w-full flex md:flex-row flex-col ">
                <div className="w-full flex flex-col">
                  <div className="w-full md:flex-row flex-col gap-2">
                    <div className="w-full flex md:flex-row flex-col gap-2">
                      <div className="md:w-[330px] w-full">
                        <div
                          ref={ref}
                          className={`${isSticky && ActiveButton === 1 ? "sticky-top" : ""}`}
                        >
                          <PairPicker
                            onSymbolChange={handleSymbolChange}
                            selectedCryptos={selectedCryptos}
                            setSelectedCryptos={setSelectedCryptos}
                            openingPrice={openingPrice}
                            prices={prices}
                          />
                        </div>
                        <div
                          className={`${isSticky && ActiveButton === 1 ? "spacer-active pt-[64px] md:pt-0" : ""}`}
                        ></div>
                        <div
                          className={`overflow-auto w-full md:hidden md:order-1 order-2 ${ActiveButton === 1 ? "" : "hidden"}`}
                        >
                          <InterestBar
                            openingPrice={openingPrice}
                            symbol={symbol}
                            data={data}
                            prices={prices}
                            EMAprice={EMAprice}
                            selectedCryptos={selectedCryptos}
                            selectedCurrency={selectedCurrency}
                          />
                          <div className="w-full flex flex-col md:order-1 order-2 md:mt-2 mt-2">
                            <Graph
                              symbol={symbol}
                              latestOpenedPosition={latestOpenedPosition}
                              prices={prices}
                            />
                          </div>
                        </div>
                        <div
                          className={`md:w-[330px] w-full md:order-1 order-2  overflow-y-auto mb-2 rounded-lg bg-layer-1  overhlow-y-auto overflow-x-hidden mt-2 ${ActiveButton === 1 ? "" : "hidden"}`}
                        >
                          <TradeBarFutures
                            setOpeningPrice={setOpeningPrice}
                            openingPrice={openingPrice}
                            setParentDivHeight={handleDivHeightChange}
                            totalBetAmount={totalBetAmount}
                            data={data}
                            setData={setData}
                            setPrices={setPrices}
                            setEMAPrice={setEMAprice}
                            prices={prices}
                            EMAprice={EMAprice}
                            isBitcoinSelected={isBitcoinSelected}
                            isSoliditySelected={isSoliditySelected}
                            selectedCryptos={selectedCryptos}
                            selectedCurrency={selectedCurrency}
                            setSelectedCurrency={setSelectedCurrency}
                          />
                        </div>
                      </div>

                      <div className="w-full md:block hidden lg:h-[calc(100vh-80px)] overflow-auto">
                        <InterestBar
                          openingPrice={openingPrice}
                          symbol={symbol}
                          data={data}
                          prices={prices}
                          EMAprice={EMAprice}
                          selectedCryptos={selectedCryptos}
                          selectedCurrency={selectedCurrency}
                        />
                        <div
                          className={`w-full md:block flex-col hidden md:order-2 order-1 mt-2 md:h-[629px] ${
                            showBottomPanel
                              ? "lg:h-[calc((100vh-2px)-(38vh))]"
                              : "lg:h-[calc(100vh-108px-33px)] "
                          }`}
                        >
                          <Graph
                            symbol={symbol}
                            latestOpenedPosition={latestOpenedPosition}
                            prices={prices}
                          />
                        </div>

                        <div
                          className={`w-full lg:flex lg:flex-col hidden order-3   lg:h-[calc((100vh-226px)-(62vh-79px))] mt-2 ${showBottomPanel ? "" : "lg:hidden"}`}
                        >
                          <MyPositionsFutures
                            latestOpenedPosition={latestOpenedPosition}
                            setLatestOpenedPosition={setLatestOpenedPosition}
                            handleTotalBetAmountChange={
                              handleTotalBetAmountChange
                            }
                            prices={prices}
                            handleNewNotification={handleNewNotification}
                          />
                        </div>
                      </div>

                      <div
                        className={`lg:block hidden md:w-[315px] flex flex-col lg:h-[calc(100vh-88px)] ${showSidePanel ? "" : "lg:hidden"}`}
                      >
                        <div className="w-full flex flex-col h-[59%]">
                          <RecentPredictions divHeight={divHeight} />
                        </div>
                        <div className="h-[41%] mt-2">
                          <Chat />
                        </div>
                      </div>
                      {/* left sidebar */}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`h-[calc(100vh-192px)] md:h-[330px] w-full md:flex lg:flex-col lg:hidden  ${
                  ActiveButton === 2 ? "" : "hidden"
                }`}
              >
                <MyPositionsFutures
                  latestOpenedPosition={latestOpenedPosition}
                  setLatestOpenedPosition={setLatestOpenedPosition}
                  handleTotalBetAmountChange={handleTotalBetAmountChange}
                  prices={prices}
                  handleNewNotification={handleNewNotification}
                />
              </div>
              <div className="flex flex-row md:py-2 md:gap-2">
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
                  <Chat />
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <Footer />
          </div>
          <div
            className={`h-[62px] md:hidden ${isStickyBottom ? "" : "hidden"}`}
          ></div>

          <div
            ref={bottomRef}
            className={`bankGothic px-2 md:hidden h-[62px]  self-stretch bg-layer-2 flex flex-row items-start justify-between py-0 text-center text-grey font-bankgothic-md-bt border-t border-layer-3 ${isStickyBottom ? "fixed-bottom" : ""}`}
          >
            <button
              onClick={() => handleButtonClick(1)}
              className={`bankGothic w-[70px] flex flex-col items-center justify-center py-3 px-0 box-border gap-[4px] ${
                ActiveButton === 1 ? "text-white" : "text-text-grey"
              }`}
            >
              <img
                className="relative w-6 h-6"
                alt=""
                src={`${
                  ActiveButton === 1
                    ? "/new/vuesaxboldbitcoinconvert2.svg"
                    : "/new/vuesaxboldbitcoinconvert1.svg"
                }`}
              />
              <div className="bankGothic relative tracking-[-0.08em] leading-[80.69%] uppercase text-[12px]">
                Trade
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(2)}
              className={`bankGothic w-1/4 flex flex-col items-center justify-center py-3 px-0 box-border gap-[4px] ${
                ActiveButton === 2 ? "text-white " : "text-text-grey"
              }`}
            >
              <img
                className="relative w-6 h-6 "
                alt=""
                src={`${
                  ActiveButton === 2
                    ? "/new/vuesaxboldcalendar.svg"
                    : "/new/vuesaxboldcalendar1.svg"
                }`}
              />
              <div className="bankGothic relative tracking-[-0.08em] leading-[80.69%] uppercase text-[12px]">
                Positions
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(3)}
              className={`flex flex-col items-center justify-center py-3 px-0 box-border gap-[4px] ${
                ActiveButton === 3 ? "text-white " : "text-text-grey"
              }`}
            >
              <img
                className="relative w-6 h-6"
                alt=""
                src={`${
                  ActiveButton === 3
                    ? "/new/vuesaxboldflash2.svg"
                    : "/new/vuesaxboldflash1.svg"
                }`}
              />
              <div className="bankGothic relative tracking-[-0.08em] leading-[80.69%] uppercase text-[12px]">
                Predictions
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(4)}
              className={`w-[65px] flex flex-col items-center justify-center py-3 px-0 box-border gap-[4px] ${
                ActiveButton === 4 ? "text-white " : "text-text-grey"
              }`}
            >
              <img
                className="relative w-6 h-6"
                alt=""
                src={`${
                  ActiveButton === 4
                    ? "/new/vuesaxboldmessages22.svg"
                    : "/new/vuesaxboldmessages21.svg"
                }`}
              />
              <div className="bankGothic relative tracking-[-0.08em] leading-[80.69%] uppercase text-[12px]">
                CHATS
              </div>
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
