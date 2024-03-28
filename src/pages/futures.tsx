import Head from "next/head";
import TradeBarFutures from "../components/TradeBarFuturesnew";
import RecentPredictions from "../components/RecentPredictionsNew";
import MyPositionsFutures from "../components/MyPositionsFuturesNew";
import AppBar from "../components/AppBar";

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

  const [openingPrice, setOpeningPrice] = useState(0);
  const [initialPrice, setInitialPrice] = useState(0);
  const [selectedPair, setSelectedPair] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<"SOL" | "USDC">(
    "SOL"
  );

  const router = useRouter();
  const { crypto } = router.query; // could be 'btc' or 'sol'

  const ref = useRef(null); // Ref for the element that will become sticky

  const bottomRef = useRef(null);
  const [isStickyBottom, setIsStickyBottom] = useState(true);

  const lastNotificationRef = useRef(null);
  let debounceTimer;
  const debounceDelay = 75;
  let lastNotificationTime = 0;

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

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const closeModalHandler = () => {
    setModalIsOpen(false);
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance
  const minSwipeDistance = 80; // Adjust based on your needs

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

  const ModalDetails = (
    <Modal
      className="custom-scrollbar bg-[#00000090] "
      isOpen={modalIsOpen}
      onRequestClose={closeModalHandler}
      style={{
        overlay: {
          zIndex: "100",
          backgroundColor: "transparent",
          backdropFilter: "blur(7px)",
        },
        content: {
          backgroundSize: "cover",
          position: "fixed",
          width: "100%", // Sets the width to span the full viewport width
          bottom: "0",
        },
      }}
    >
      <div
        className={`overflow-auto z-100 bg-[#00000099] h-[90%] w-full `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
          selectedCryptos={selectedCryptos}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
        />{" "}
      </div>
    </Modal>
  );

  return (
    <div className="relative max-h-100vh overflow-hidden">
      {ModalDetails}

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
      <div className="relative w-full flex justify-center flex-col">
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
        <div className="w-full md:px-3 h-full lg:h-[calc(100vh-85px)] overflow-hidden ">
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
                          className={`rounded-lg w-full bg-[#ffffff08] lg:flex lg:flex-col  order-3   lg:h-[calc((100vh-233px)-(58vh-79px))] hidden mt-3 ${showBottomPanel ? "" : "hidden"}`}
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
                        className={`md:flex hidden mt-2.5 z-100 md:w-[375px] bg-[#ffffff08] h-1/2 w-full md:order-1 order-2  rounded-lg  `}
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
                          selectedCryptos={selectedCryptos}
                          selectedCurrency={selectedCurrency}
                          setSelectedCurrency={setSelectedCurrency}
                        />
                      </div>
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
                  prices={prices}
                  handleNewNotification={handleNewNotification}
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
              onClick={toggleModal}
              className={`bg-primary hover:bg-new-green-dark mx-2.5 py-1 w-1/2 rounded-lg flex flex-row items-center justify-center box-border  text-black transition ease-in-out duration-300
              }`}
            >
              LONG
            </button>
            <button
              onClick={toggleModal}
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
