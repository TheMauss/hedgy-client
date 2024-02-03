import Head from "next/head";
import TradeBar from "../components/TradeBarNew";
import RecentPredictions from "../components/RecentPredictionsNew";
import MyPositions from "../components/MyPositionsNew";
import { FC, useState, useEffect, useRef } from "react";
import Chat from "components/Chatnew";
import { useRouter } from "next/router";
import React from "react";
import PairPicker from "components/PairPicker";
import Footer from "components/Footernew";
import InterestBar from "components/InterestBarOp";
import { priceDataState } from "components/globalStatse";
import { FaChevronLeft, FaChevronUp } from "react-icons/fa";
import { Graph } from "components/GraphNew";

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

const Transaction: FC = () => {
  const [symbol, setSymbol] = useState("Crypto.SOL/USD"); // default value
  const [divHeight, setDivHeight] = useState("60vh");
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [latestOpenedPosition, setLatestOpenedPosition] = useState<
    Record<string, Position | null>
  >({});
  const [selectedCryptos, setSelectedCryptos] = useState({
    BTC: false,
    SOL: true,
    PYTH: false,
    BONK: false,
    // Add other cryptocurrencies as needed
  });
  const [prices, setPrices] = useState({});
  const [EMAprice, setEMAprice] = useState(null);
  const [openingPrice, setOpeningPrice] = useState(0);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(false);
  const [isSoliditySelected, setIsSoliditySelected] = useState(true);
  const [initialPrice, setInitialPrice] = useState(0);
  const [selectedPair, setSelectedPair] = useState("");

  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef(null); // Ref for the element that will become sticky

  const [ActiveButton, setActiveButton] = useState(1);

  const bottomRef = useRef(null);
  const [isStickyBottom, setIsStickyBottom] = useState(true);

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
    Object.keys(prices).forEach((symbol) => {
      priceDataState.updatePriceData(symbol, prices[symbol]);
    });
  }, [prices]);

  useEffect(() => {
    const handleScroll = () => {
      const stickyThreshold = 64; // for example, 200px from the top of the page
      const bottomStickyThreshold = -62;
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
        console.log(!isNearBottom);
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
      PYTH: 3,
      BONK: 8,
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

  const router = useRouter();
  const { crypto } = router.query; // could be 'btc' or 'sol'

  useEffect(() => {
    const cryptoKey = Array.isArray(crypto) ? crypto[0] : crypto; // Or handle arrays differently

    const newSelectedCryptos = { ...selectedCryptos };
    Object.keys(newSelectedCryptos).forEach((key) => {
      newSelectedCryptos[key] = key === cryptoKey;
    });

    setSelectedCryptos(newSelectedCryptos);

    const symbolMap = {
      btc: "Crypto.BTC/USD",
      sol: "Crypto.SOL/USD",
      // Add other mappings as necessary
    };

    if (symbolMap[cryptoKey]) {
      setSymbol(symbolMap[cryptoKey]);
      console.log(`is${cryptoKey.toUpperCase()}Selected is set to true`);
      Object.keys(symbolMap).forEach((key) => {
        if (key !== cryptoKey) {
          console.log(`is${key.toUpperCase()}Selected is set to false`);
        }
      });
      console.log(`Symbol is set to ${symbolMap[cryptoKey]}`);
    }
  }, [crypto]);

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

  return (
    <div>
      <Head>
        <title>
          {" "}
          {selectedPair} ${initialPrice} | PopFi Options
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
              <div className="w-full flex md:flex-row flex-col  ">
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
                            selectedCryptos={selectedCryptos}
                            symbol={symbol}
                            prices={prices}
                            EMAprice={EMAprice}
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
                          <TradeBar
                            setOpeningPrice={setOpeningPrice}
                            openingPrice={openingPrice}
                            setParentDivHeight={handleDivHeightChange}
                            totalBetAmount={totalBetAmount}
                            setPrices={setPrices}
                            setEMAPrice={setEMAprice}
                            prices={prices}
                            EMAprice={EMAprice}
                            isBitcoinSelected={isBitcoinSelected}
                            isSoliditySelected={isSoliditySelected}
                            selectedCryptos={selectedCryptos}
                          />
                        </div>
                      </div>

                      <div className="w-full md:block hidden lg:h-[calc(100vh-80px)] overflow-auto">
                        <InterestBar
                          openingPrice={openingPrice}
                          selectedCryptos={selectedCryptos}
                          symbol={symbol}
                          prices={prices}
                          EMAprice={EMAprice}
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
                        </div>{" "}
                        <div
                          className={`w-full lg:flex lg:flex-col hidden order-3   lg:h-[calc((100vh-226px)-(62vh-79px))] mt-2 ${showBottomPanel ? "" : "lg:hidden"}`}
                        >
                          <MyPositions
                            latestOpenedPosition={latestOpenedPosition}
                            setLatestOpenedPosition={setLatestOpenedPosition}
                            handleTotalBetAmountChange={
                              handleTotalBetAmountChange
                            }
                            prices={prices}
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
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`h-[calc(100vh-192px)] md:h-[330px] w-full md:flex lg:flex-col lg:hidden  ${
                  ActiveButton === 2 ? "" : "hidden"
                }`}
              >
                <MyPositions
                  latestOpenedPosition={latestOpenedPosition}
                  setLatestOpenedPosition={setLatestOpenedPosition}
                  handleTotalBetAmountChange={handleTotalBetAmountChange}
                  prices={prices}
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
                  className={`h-[calc(100vh-192px)] md:h-[330px] w-full md:block lg:flex-col lg:hidden flex-row gap-2  ${
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

export default Transaction;
