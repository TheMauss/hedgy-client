import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef, FC } from "react";
import ResizeDetector from "react-resize-detector";
import PopFiLandingPageColumnvector from "components/PopFiLandingPageColumnvector";
import socketIOClient from "socket.io-client";
import { useRouter } from "next/router";
import AppBar from "components/Firstbar";
// At the top of your HomeView file
import dynamic from "next/dynamic";

// Dynamically import the StarfieldAnimationComponent with SSR disabled
const StarfieldAnimationComponentWithNoSSR = dynamic(
  () => import("components/StarfieldAnimationComponent"),
  { ssr: false }
);

const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;

export const HomeView: FC = ({}) => {
  const refSecondDiv = React.useRef(null);
  const reffirstDiv = React.useRef(null);
  const refthirdDiv = React.useRef(null);
  const refforthDiv = React.useRef(null);
  const [prices, setPrices] = useState({});
  const [openPrices, setopenPrices] = useState({});
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      // Add any event listeners here
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs once on mount
    if (typeof window !== "undefined") {
      setIsClient(true); // Enable client-dependent features
    }
  }, []);

  const imgRef1 = useRef(null);
  const imgRef2 = useRef(null);

  const imageRefs = useRef(null);
  const imageRefsd = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRefs.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const scrollTotal = scrollHeight - clientHeight;
      const scrollPercent = scrollTop / scrollTotal;

      // Calculate scale based on scroll position
      let scale = isMobile
        ? 0.5 + 3 * scrollPercent
        : 0.1 + 2.7 * scrollPercent;

      // Set a max scale value
      const maxScale = 1; // Adjust as necessary
      scale = Math.min(scale, maxScale);

      imageRefs.current.style.transform = `translateX(-50%) scale(${scale})`;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRefsd.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const scrollTotal = scrollHeight - clientHeight;
      const scrollPercent = scrollTop / scrollTotal;

      // Scale the image between 1 (no scale) to 2 based on scroll position
      let scale = isMobile
        ? 0.5 + 3 * scrollPercent
        : 0.1 + 2.7 * scrollPercent;

      // Set a max scale value
      const maxScale = 1; // Adjust as necessary
      scale = Math.min(scale, maxScale);

      imageRefsd.current.style.transform = `translateX(-50%) scale(${scale})`;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Logic to reinitialize the StarfieldAnimation or update its state
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on("priceUpdate", (updatedPrices) => {
      const newPrices = { ...prices };
      updatedPrices.forEach((updatedPrice) => {
        newPrices[updatedPrice.symbol] = updatedPrice.price;
      });

      setPrices(newPrices);
    });

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT2);

    socket.on("openingprice", (openingPrices) => {
      const openingPricess = { ...openPrices };
      openingPrices.forEach((openingPrices) => {
        openingPricess[openingPrices.symbol] = openingPrices.price;
      });
      setopenPrices(openingPricess);
    });

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const btcPrice = Number(prices["Crypto.BTC/USD"] / 100000000) || 35432.2;
  const openBtcPrice =
    Number(openPrices["Crypto.BTC/USD"] / 100000000) || 35502.2;

  const change = ((btcPrice - openBtcPrice) / openBtcPrice) * 100;
  const displayChange = change > 0 ? `${change.toFixed(2)}` : change.toFixed(2);

  const color =
    change > 0
      ? "bankGothic bg-clip-text bg-gradient-to-t from-[#0B7A55] to-[#34C796]   text-5xl md:text-6xl text-center text-transparent uppercase"
      : "bankGothic bg-clip-text bg-clip-text bg-gradient-to-t from-[#7A3636] to-[#C44141]  text-5xl md:text-6xl text-center text-transparent uppercase";

  const solPrice = Number(prices["Crypto.SOL/USD"] / 100000000) || 34.35;
  const openSolPrice = Number(openPrices["Crypto.SOL/USD"] / 100000000) || 34;

  const changesol = ((solPrice - openSolPrice) / openSolPrice) * 100;
  const displayChangesol =
    changesol > 0 ? `${changesol.toFixed(2)}` : changesol.toFixed(2);

  const colorsol =
    changesol > 0
      ? "bankGothic bg-clip-text bg-gradient-to-t from-[#0B7A55] to-[#34C796]  text-5xl md:text-6xl text-center text-transparent uppercase"
      : "bankGothic bg-clip-text bg-clip-text bg-gradient-to-t from-[#7A3636] to-[#C44141]   text-5xl md:text-6xl text-center text-transparent uppercase";
  const colorsolsmall =
    changesol > 0
      ? "bankGothic bg-clip-text bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:text-3xl text-[28px] sm:text-[32px] text-center text-transparent tracking-[-2.56px] uppercase w-auto"
      : "bankGothic bg-clip-text bg-gradient-to-t from-[#7A3636] to-[#C44141] md:text-3xl text-[28px] sm:text-[32px] text-center text-transparent tracking-[-2.56px] uppercase w-auto";

  const handleResize4 = (width, height) => {
    // Check the viewport width; if it's under 640px, exit early and ignore resizing.
    if (window.innerWidth <= 768) {
      return;
    }

    if (refforthDiv.current) {
      // Adjust the height based on any border or padding on the second div
      const computedStyle = getComputedStyle(refforthDiv.current);
      const totalPadding =
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.paddingBottom);
      const totalBorder =
        parseFloat(computedStyle.borderTopWidth) +
        parseFloat(computedStyle.borderBottomWidth);

      refforthDiv.current.style.height = `${(height - totalPadding - totalBorder) / 2 + 19.5}px`;
      refthirdDiv.current.style.height = `${(height - totalPadding - totalBorder) / 2 + 19.5}px`;
    }
  };

  const handleResize = (width, height) => {
    // Check the viewport width; if it's under 640px, exit early and ignore resizing.
    if (window.innerWidth <= 768) {
      return;
    }

    if (refSecondDiv.current) {
      // Adjust the height based on any border or padding on the second div
      const computedStyle = getComputedStyle(refSecondDiv.current);
      const totalPadding =
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.paddingBottom);
      const totalBorder =
        parseFloat(computedStyle.borderTopWidth) +
        parseFloat(computedStyle.borderBottomWidth);

      refSecondDiv.current.style.height = `${height - totalPadding - totalBorder}px`;
    }
  };

  const handleResize1 = (width, height) => {
    // Check the viewport width; if it's under 640px, exit early and ignore resizing.
    if (window.innerWidth <= 768) {
      return;
    }

    if (reffirstDiv.current) {
      // Adjust the height based on any border or padding on the second div
      const computedStyle = getComputedStyle(reffirstDiv.current);
      const totalPadding =
        parseFloat(computedStyle.paddingTop) +
        parseFloat(computedStyle.paddingBottom);
      const totalBorder =
        parseFloat(computedStyle.borderTopWidth) +
        parseFloat(computedStyle.borderBottomWidth);

      reffirstDiv.current.style.height = `${height - totalPadding - totalBorder}px`;
    }
  };

  const popFiLandingPageColumnvectorPropList = [
    { userimage: "images/img_vector.png" },
    {
      usertext:
        "Engage in a thrilling trading experience, wrapped in a gamified environment.",
      userimage: "images/bitcoin-convert.png",
    },
    {
      usertext:
        "Navigate effortlessly. Our intuitive design makes everyone feel like at home.",
      userimage: "images/flash.png",
    },
    {
      usertext: "Trade directly and securely from your wallet",
      userimage: "images/empty-wallet.png",
    },
    {
      usertext:
        "Connect, discuss, and grow. Chat with the community on our platform.",
      userimage: "images/messages-2.png",
    },
    {
      usertext: "Rest easy knowing your trades are backed by smart contract.",
      userimage: "images/shield-tick.png",
    },
  ];

  return (
    <>
      <>
        {console.log("Rendering StarfieldAnimation")}
        <StarfieldAnimationComponentWithNoSSR />
      </>
      <div className="flex topg flex-col font-poppins items-center justify-center mx-auto w-auto sm:w-full md:w-full z-1000">
        <div className="flex justify-between items-between w-full z-2000">
          <AppBar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        </div>

        <div className="flex flex-col md:gap-10 gap-[79px] items-center justify-start w-full">
          <div className=" flex flex-col gap-[55px] inset-x-[0] items-center justify-center mx-auto  w-auto">
            <div className="pt-16 bankGothic bg-clip-text bg-white  leading-[90.69%] max-w-full md:max-w-[900px] md:text-6xl text-5xl text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
              Trade Perpetual Futures on-chain.
            </div>
            <div className="flex sm:flex-row flex-col  gap-4 items-center justify-center w-auto sm:w-full">
              <Link href="/futures">
                <button className="py-3 rounded gradient-bggnew cursor-pointer font-semibold leading-[normal] min-w-[189px] text-center text-lg">
                  TRADE FUTURES
                </button>
              </Link>
            </div>
          </div>
          <div className=" font-bankgothicmdbt md:px-5 relative w-full pt-5">
            <div className="">
              <img
                className="relative z-10 bottom-[10%] h-[718px] h-auto  inset-x-[0] mx-auto object-cover rounded-[16px] w-[75%] max-w-[1400px] z-2 border-2 md:border-4  border-layer-3 flex justify-center items-center"
                src="trading.png"
                alt="imageFive_One"
              />
            </div>
          </div>
        </div>

        <div className="topggg w-full h-full bg-[#000000] flex flex-col items-center justify-start px-14 pb-14 md:px-10 sm:px-5 w-full ">
          <div className="pt-32 bankGothic mt-0.5 md:text-6xl text-5xl text-center text-white-A700 uppercase z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
            SOLANA PERP DEX
          </div>
          <div className="mt-[22px] sm:p-[] md:pb-[40px] sm:pb-[120px] pb-[160px] text-[#B4B5C7] text-center text-xl z-10">
            With low fees, deep liquidity, and up to 200x Leverage.
          </div>
          <div className="md:mt-8 flex md:flex-row flex-col flex justify-center items-center  md:w-[60%] w-[100%] relative z-1 md:gap-16 gap-32">
            <div className=" h-[370px] md:w-[50%] w-[100%] md:max-w-[450px] sm:max-w-[370px] min-w-[300px] relative  z-10">
              <Link href="/futures?crypto=btc">
                <div className="inside_shadow bg-gradient-to-t from-[#000000] to-[#111111]  inset-x-[0] items-center justify-end mx-auto p-[42px] sm:px-5  rounded-[32px] w-full">
                  <div className="bankGothic mt-[93px] text-[38px] md:text-[50px] text-center text-white-A700 uppercase">
                    BITCOIN
                  </div>
                  <div>
                    <div className={color}>{displayChange}%</div>
                    <div className="bankGothic text-[34px] sm:text-[40px] text-[#B4B5C7] text-center tracking-[-2.40px] uppercase">
                      $
                      {isNaN(prices["Crypto.BTC/USD"] / 100000000)
                        ? "35432.2"
                        : (prices["Crypto.BTC/USD"] / 100000000).toFixed(1)}
                    </div>
                  </div>
                  <img
                    className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 h-[180px] object-cover w-[180px]"
                    src="images/img_bitcoin3d.png"
                    alt="bitcoin3d"
                  />
                </div>
              </Link>
            </div>
            <div className=" h-[370px] relative md:max-w-[450px] min-w-[300px] sm:max-w-[370px] md:w-[50%] w-[100%] z-10">
              <Link href="/futures?crypto=sol">
                <div className="inside_shadow bg-gradient-to-t from-[#000000] to-[#111111] bottom-[0] inset-x-[0] items-center justify-end mx-auto p-[42px] sm:px-5 rounded-[32px] w-full">
                  <div className="bankGothic mt-[93px] text-[38px] md:text-[50px] text-center text-white-A700 uppercase">
                    SOLANA
                  </div>
                  <div className={colorsol}>{displayChangesol}%</div>
                  <div className="bankGothic text-[34px] sm:text-[40px] text-[#B4B5C7] text-center tracking-[-2.40px] uppercase">
                    $
                    {isNaN(prices["Crypto.SOL/USD"] / 100000000)
                      ? "34.35"
                      : (prices["Crypto.SOL/USD"] / 100000000).toFixed(3)}
                  </div>
                  <img
                    className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 h-[180px] object-cover w-[180px]"
                    src="images/img_solana3d.png"
                    alt="solana3d"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#000000] flex flex-col font-bankgothicmdbt items-center justify-start pt-[84px] pb-14  sm:px-10 px-5 w-full">
          <div className="flex flex-col gap-[22px] items-start justify-start max-w-[1400px] mb-[7px] mx-auto w-full">
            <ResizeDetector handleHeight onResize={handleResize4}>
              <div className="w-full flex md:flex-row flex-col gap-[22px] items-start justify-start">
                <div className="bg-[#151722] border border-[#434665] border-solid flex flex-col items-start justify-start md:p-11 p-8 rounded-[32px] w-full h-full md:w-[64%] z-10">
                  <div className="flex flex-col gap-[22px] items-start justify-start w-auto md:w-full">
                    <div className="bankGothic sm:text-[32px] md:text-[38px] text-[42px] text-white-A700 uppercase w-auto">
                      WHY POPFI?
                    </div>
                    <div className="leading-[140.00%] text-blue_gray-200 text-lg">
                      <span className="text-[#B4B5C7] font-poppins text-left font-light">
                        Because we simplify trading: Execute trades directly
                        from your wallet with just one click. Whether you are
                        predicting price movements on options or delving into
                        futures,{" "}
                      </span>
                      <span className="text-white-A700 font-poppins text-left font-light">
                        <>
                          make your trading decisions pop.
                          <br />
                        </>
                      </span>
                      <span className="text-[#B4B5C7] font-poppins text-left font-light">
                        <>
                          <br />
                          Say goodbye to complicated trading strategies and
                          hello to effortless profitability.
                        </>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative w-full md:w-[38%]">
                  <div className="flex flex-col items-center justify-between m-auto w-full  gap-[22px] ">
                    <div className="w-full">
                      <div className="bg-gradient-to-t from-[#0B7A55] to-[#34C796] rounded-[24px] w-full p-[1px]  ">
                        <div
                          ref={refthirdDiv}
                          className="bg-[#000000] bg-opacity-90 flex flex-1 flex-row md:h-full items-center justify-between  md:p-[33px] p-[34px] sm:px-5 rounded-[24px] w-full"
                        >
                          <div className="bankGothic bg-clip-text bg-gradient-to-t from-[#34C796] to-[#0B7A55]  text-3xl sm:text-[26px] md:text-[28px] text-transparent uppercase">
                            Long
                          </div>
                          <div className="h-[47px] sm:h-[66px] md:h-[73px] mb-4 mt-[3px] relative w-[60px]">
                            <img
                              className="h-[39px] sm:mt-[15px] md:m-[] m-auto md:mt-[15px] w-[39px]"
                              src="images/img_user.svg"
                              alt="user"
                            />
                            <img
                              className="absolute h-[60px] w-[60px] inset-[0] justify-center m-auto object-cover "
                              src="images/arrow-up.png"
                              alt="arrowup"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="bg-gradient-to-t from-[#7A3636] to-[#C44141] rounded-[24px] w-full p-[1px] ">
                        <div
                          ref={refforthDiv}
                          className="bg-[#000000] bg-opacity-90 flex flex-1 flex-row md:h-full items-center justify-between  md:p-[33px] p-[34px] sm:px-5 rounded-[24px] w-full"
                        >
                          <div className="bankGothic bg-clip-text bg-gradient-to-t from-[#7A3636] to-[#C44141]  text-3xl sm:text-[26px] md:text-[28px] text-transparent uppercase">
                            SHORT
                          </div>
                          <div className="h-[47px] sm:h-[66px] md:h-[73px] mb-4 mt-[3px] relative w-[60px]">
                            <img
                              className="h-[39px] sm:mt-[15px]  md:m-[] m-auto md:mt-[15px] w-[39px]"
                              src="images/img_user.svg"
                              alt="user"
                            />
                            <img
                              className="absolute h-[60px] w-[60px] inset-[0] justify-center m-auto object-cover "
                              src="images/arrow-down.png"
                              alt="arrowup"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-[190px] absolute bg-[#000000] border border-[#434665] border-solid flex flex-col font-bankgothicltbt h-[100px] inset-[0] items-center justify-center m-auto  px-[42px] rounded-[16px] w-1/2 md:w-2/">
                        <div className="flex flex-row gap-2 items-center justify-center w-auto ">
                          <button className="flex h-[39px] items-center justify-center rounded-[19px] w-[39px] bg-gradient-to-bl from-[#11EEAA] to-[#D229FB]">
                            <img src="images/img_volume.svg" alt="volume" />
                          </button>
                          <div className="bankGothicc text-2xl md:text-[22px] text-center  sm:text-xl tracking-[-1.92px] uppercase w-auto">
                            SOLANA
                          </div>
                        </div>
                        <div className={colorsolsmall}>
                          $
                          {isNaN(prices["Crypto.SOL/USD"] / 100000000)
                            ? "34.35"
                            : (prices["Crypto.SOL/USD"] / 100000000).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizeDetector>

            <ResizeDetector handleHeight onResize={handleResize1}>
              <div className="flex md:flex-row md:grid-cols-2 flex md:flex-row flex-col gap-[22px] items-start justify-start w-full md:pt-[0px] pt-[22px] z-10">
                <div
                  ref={reffirstDiv}
                  className="bg-gradient-to-t from-[#7A3636] to-[#C44141] w-full md:w-[38%] p-[1px] rounded-[32px] md:max-h-[400px] max-h-[300px]"
                >
                  <div className="w-full h-full bg-[#000000] bg-opacity-90  flex md:flex-1 flex-col items-center justify-start md:p-11 p-8 rounded-[32px] sm:top-[] w-full">
                    <div className="h-full flex flex-col gap-8 items-center justify-start w-auto">
                      <div className="bankGothic md:text-3xl sm:text-[28px] text-[32px] text-center text-[#B4B5C7] uppercase w-auto">
                        AUDITED BY
                      </div>
                      <div className="flex flex-col items-center justify-start w-auto">
                        <img
                          className="h-[86px] sm:h-[] md:h-auto object-cover w-[67px] sm:w-[]"
                          src="images/img_image7.png"
                          alt="imageSeven"
                        />
                        <img
                          className="h-[61px] md:h-auto object-cover w-[191px]"
                          src="images/img_image9.png"
                          alt="imageNine"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#151722] border border-[#434665] border-solid flex flex-row items-start justify-start md:p-11 p-8 rounded-[32px] w-full md:w-[62%] min-h-[305px]">
                  <div className=" flex flex-col gap-[26px] items-start justify-start my-1 w-auto md:w-full">
                    <div className="bankGothic leading-[90.69%] text-[32px] sm:text-[38px] md:text-[42px] text-white-A700 uppercase">
                      <>
                        Try <br />
                        Binary Options.
                      </>
                    </div>
                    <div className="text-[#B4B5C7] text-lg w-auto">
                      Predict Crypto price in a short timeframe and make it pop.
                    </div>
                    <Link href="/trade">
                      <button className="py-3 rounded gradient-bggnew cursor-pointer font-semibold leading-[normal] min-w-[189px] text-center text-lg">
                        TRADE OPTIONS
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </ResizeDetector>

            <ResizeDetector handleHeight onResize={handleResize}>
              <div className="flex md:flex-row flex-col gap-[22px] justify-start w-full md:pt-[0px] pt-[22px] z-10">
                <div className="md:order-1 order-2 md:max-h-[500px] min-h-[280px] bg-[#151722] border border-[#434665] border-solid flex flex-col items-start justify-start md:p-11 p-8 rounded-[32px] w-full md:w-[62%] flex-shrink-0">
                  <div className="flex flex-col gap-[22px] items-start justify-start  w-auto md:w-full ">
                    <div className="bankGothic leading-[90.69%] max-w-[560px] md:max-w-full text-[32px] sm:text-[36px] md:text-[42px] text-white-A700 uppercase">
                      Built on Solana, Powered by Pyth.
                    </div>
                    <div className="leading-[140.00%] max-w-[622px] md:max-w-full text-[#B4B5C7] text-lg">
                      Experience the synergy of Solana’s speed and Pyth’s
                      accuracy, redefining trading efficiency and reliability.
                    </div>
                  </div>
                </div>

                <div
                  ref={refSecondDiv}
                  className="md:order-2 order-1 md:max-h-[450px] max-h-[280px] bg-gradient-to-t from-[#0B7A55] to-[#34C796] w-full md:w-[38%] p-[1px] rounded-[32px] flex-shrink"
                >
                  <div className="bg-[#000000] h-full bg-opacity-90 rounded-[32px] w-full overflow-hidden md:max-h-[450px] max-h-[280px]">
                    <img
                      className="w-full h-full object-cover scale-200 sm:scale-160  -translate-x-1/8 md:-translate-y-1/5 overflow-hidden md:max-h-[450px] max-h-[260px]"
                      src="images/img_grid3.svg"
                      alt="gridThree"
                    />
                  </div>
                </div>
              </div>
            </ResizeDetector>
          </div>
        </div>
        <div className="bg-[#000000] flex flex-col font-bankgothicmdbt md:gap-10 gap-[79px] items-center justify-end p-5 w-full pb-[42px]">
          <div className="bankGothic mt-[52px] text-[40px] sm:text-[46px] md:text-[50px] text-center text-white-A700 uppercase">
            KEY FEATURES
          </div>
          <div className="flex flex-col font-poppins items-start justify-between max-w-[1229px] mx-auto md:px-5 w-full z-10">
            <div className="flex flex-col items-center justify-start w-full">
              <div className="md:gap-16 gap-5 grid sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center min-h-[auto] w-full">
                {popFiLandingPageColumnvectorPropList.map((props, index) => (
                  <React.Fragment key={`PopFiLandingPageColumnvector${index}`}>
                    <PopFiLandingPageColumnvector
                      className="flex flex-1 flex-col gap-[30px] h-[214px] md:h-auto items-center justify-start w-full"
                      {...props}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#000000] flex flex-col items-center justify-start md:m-[] md:mt-[] md:px-[58px] md:pt-[88px] sm:px-10 px-5 w-full ">
          <div className="bg-gradient-to-t from-[#0B7A55] to-[#34C796] max-w-[1232px] md:mb-[21px]  p-[1px]   rounded-[32px] z-10">
            <div className="bg-[#151722] flex flex-col md:flex-row items-center justify-start   w-full sm:px-[60px] px-[30px] md:py-[20px] py-[30px] rounded-[32px]">
              <div className="flex md:flex-row flex-col md:gap-10 items-center justify-between w-[95%] md:w-full overflow-hidden">
                <div className="flex flex-col items-start justify-start">
                  <div className="bankGothicc text-[32px] sm:text-[38px] md:text-[42px] text-white-A700 uppercase">
                    join our community
                  </div>
                  <div className="leading-[140.00%] mt-[7px] text-[#B4B5C7] text-xl w-[88%] sm:w-full">
                    Choose your direction now and join our community of traders.
                  </div>
                  <Link
                    href="https://discord.gg/jXCbWwD5s8"
                    target="_blank"
                    rel="noopener noreferrer"
                    passHref
                    className="text-secondary hover:text-white"
                  >
                    <button className="py-3 rounded gradient-bggnew cursor-pointer font-semibold leading-[normal] min-w-[219px] mt-[31px] text-center text-white text-lg">
                      JOIN OUR DISCORD
                    </button>
                  </Link>
                </div>

                <img
                  className="h-[279px] md:h-auto object-cover md:w-2/5 translate-y-[15%] overflow-hidden"
                  src="images/img_maskgroup.png"
                  alt="maskgroup"
                />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient7  flex flex-row  items-center justify-between  sm:w-[80%] w-[100%] pt-[21px] mt-[42px]">
            <Link href="/">
              <img
                className="h-[45px] object-cover mb-1.5"
                src="images/img_image5.png"
                alt="imageFive_Two"
              />
            </Link>
            <div className="flex flex-row gap-3 mb-1.5">
              <Link
                href="https://twitter.com/PopFi_io"
                target="_blank"
                rel="noopener noreferrer"
                passHref
                className="text-secondary hover:text-white"
              >
                <img
                  className=" h-[22px] object-cover "
                  src="images/x.png"
                  alt="videocamera"
                />
              </Link>
              <Link
                href="https://discord.gg/jXCbWwD5s8"
                target="_blank"
                rel="noopener noreferrer"
                passHref
                className="text-secondary hover:text-white"
              >
                <img
                  className=" h-[22px] object-cover "
                  src="images/dc.png"
                  alt="videocamera"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
