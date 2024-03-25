import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef, FC } from "react";
import ResizeDetector from "react-resize-detector";
import CryptoSlider from "components/CryptoSlider";
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
  const cryptoPairs1 = [
    {
      name: "Bitcoin",
      price: "$68,321",
      ticker: "BTC-PERP",
      img: "coins/120x120/Btc.png",
    },
    {
      name: "Ethereum",
      price: "$4,321",
      ticker: "ETH-PERP",
      img: "coins/120x120/Eth.png",
    },
    {
      name: "Solana",
      price: "$132.11",
      ticker: "SOL-PERP",
      img: "coins/120x120/Sol.png",
    },
    {
      name: "Bonk",
      price: "$1.32",
      ticker: "BONK-PERP",
      img: "coins/120x120/Bonk.png",
    },
    // Add more pairs as needed
  ];

  const cryptoPairs2 = [
    {
      name: "Pyth",
      price: "$68,321",
      ticker: "PYTH-PERP",
      img: "coins/120x120/Pyth.png",
    },
    {
      name: "Jup",
      price: "$4,321",
      ticker: "JUP-PERP",
      img: "coins/120x120/Jup.png",
    },
    {
      name: "Sui",
      price: "$132.11",
      ticker: "SUI-PERP",
      img: "coins/120x120/Sui.png",
    },
    {
      name: "Tia",
      price: "$1.32",
      ticker: "TIA-PERP",
      img: "coins/120x120/Tia.png",
    },
    // Add more pairs as needed
  ];

  return (
    <>
      <>
        {console.log("Rendering StarfieldAnimation")}
        <div className="z-100">
          <StarfieldAnimationComponentWithNoSSR />
        </div>
      </>
      {/* <div className="w-1/4 h-1/4 absolute !m-[0] top-[250%] left-[70%] rounded-[50%] bg-primary [filter:blur(400px)]  opacity-[1] z-[1] overflow-auto" /> */}

      <div className="relative flex topg flex-col font-poppins items-center justify-center mx-auto w-auto sm:w-full md:w-full z-1000">
        <div className="flex justify-between items-between w-full z-2000">
          <AppBar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        </div>

        <div className="flex flex-col md:gap-10 gap-[79px] items-center justify-start w-full">
          <div className=" flex flex-col gap-[45px] inset-x-[0] items-center justify-center mx-auto  w-auto">
            <div className="pt-16  bg-clip-text bg-white  leading-[90.69%] max-w-[100%] md:max-w-[900px] text-center md:text-7xl text-6xl !bg-clip-text [background:linear-gradient(91.75deg,_#fff,_rgba(255,_255,_255,_0.25))] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              Trade Perpetual Futures{" "}
              <div className="pt-2 md:text-7xl text-3xl">on-chain.</div>
            </div>
            <div className="flex sm:flex-row flex-col  gap-4 items-center justify-center w-auto sm:w-full">
              <Link href="/futures">
                <button className="relative overflow-hidden py-3 rounded-lg bg-new-green hover:bg-new-green-dark cursor-pointer font-semibold leading-[normal] min-w-[189px] text-center text-lg text-black transition ease-in-out duration-300">
                  TRADE FUTURES
                </button>
              </Link>
            </div>
          </div>
          <div className="font-bankgothicmdbt md:px-5 relative w-full pt-5 mb-16">
            <div className="absolute  flex md:flex-row flex-col gap-3.5 h-max inset-[0] items-start justify-between m-auto w-full">
              <div className="h-[159px] top-[29%] w-[67%]"></div>
            </div>
            <div className="relative bottom-[10%] h-[718px] h-auto  inset-x-[0] mx-auto object-cover  md:w-[80%] w-[100%] max-w-[1600px] z-5  flex justify-center items-center">
              <img
                className="w-[80%] "
                src="trading.png"
                alt="imageFive_One"
                style={{
                  zIndex: 10,
                  transform: "translate(10%)",
                  right: "10%",
                }}
              />
              <img
                className="w-[20%]"
                src="phoneph.png"
                alt="abstractSeven"
                style={{
                  zIndex: 10,
                  top: "50%",
                  transform: "translate(-80%, 40%)",
                  right: "10%",
                }}
              />

              <div
                className="rellax absolute w-[53%] h-full inset-y-0 rounded-full overflow-x-hidden"
                style={{
                  zIndex: 5,
                  top: "50%",
                  transform: "translate(0%, 0%)",
                  right: "0%",
                }}
              >
                <div className="custom-blur-circle w-full h-full"></div>
              </div>
            </div>
          </div>

          <div className=" font-bankgothicmdbt md:px-5 relative w-full pt-5">
            <div className=""></div>
          </div>
        </div>
        <div className="lg:pt-48 pb-16 md:pt-16 flex md:flex-row flex-col justify-center items-center md:w-2/3 md:min-w-[670px] max-w-[1400px] w-full z-10">
          <div className="md:w-1/3 w-full items-center justify-center text-center rounded-2xl py-4 px-6 box-border gap-[16px]">
            <b className="text-5xl leading-[100%] text-transparent !bg-clip-text [background:linear-gradient(91.75deg,_#fff,_rgba(255,_255,_255,_0.25))] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              $25M+
            </b>
            <div className=" text-center text-primary leading-[100%] pt-2">
              Total Volume
            </div>
          </div>
          <div className="md:w-1/3 w-full items-center justify-center text-center rounded-2xl py-4 px-6 box-border gap-[16px]">
            <b className="text-5xl  leading-[100%] text-transparent !bg-clip-text [background:linear-gradient(91.75deg,_#fff,_rgba(255,_255,_255,_0.25))] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              5,125
            </b>
            <div className=" text-center text-primary leading-[100%] pt-2">
              Total Trades
            </div>
          </div>
          <div className="md:w-1/3 w-full items-center justify-center text-center rounded-2xl py-4 px-6 box-border gap-[16px]">
            <b className="text-5xl text-center  leading-[100%] text-transparent !bg-clip-text [background:linear-gradient(91.75deg,_#fff,_rgba(255,_255,_255,_0.25))] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              325
            </b>
            <div className=" text-center text-primary leading-[100%] pt-2">
              Users
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-hidden">
          <div
            className="rellax absolute md:w-1/2 w-full md:h-full h-1/3 inset-y-0 rounded-full overflow-x-hidden"
            style={{
              zIndex: 5,
              top: "10%",
              transform: "translate(-15%, -25%)",
              left: "0%",
            }}
          >
            <div className="custom-blur-circle2 w-full h-full"></div>
          </div>
          <div className="rellaxx">
            <div className="custom-blur-circle3 w-full h-full"></div>
          </div>
          <div className="relative w-full h-full bg-[#000000] flex flex-col items-center justify-center px-14 md:px-10 sm:px-5 w-full ">
            <div className="pt-32 bankGothic mt-0.5 md:text-6xl text-5xl text-center text-white-A700 uppercase z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
              SOLANA PERP DEX
            </div>

            <div className="mt-[22px] sm:p-[] md:pb-[40px] sm:pb-[120px] pb-[160px] text-[#B4B5C7] text-center text-xl z-10">
              With low fees, deep liquidity, and up to 100x Leverage.
            </div>
          </div>
          <div className="pb-5 z-30 w-full flex flex-col justify-center items-center">
            <CryptoSlider cryptoPairs={cryptoPairs1} direction="left" />
            <CryptoSlider cryptoPairs={cryptoPairs2} direction="right" />{" "}
          </div>
          <div className="overflow-hidden flex flex-col font-bankgothicmdbt items-center justify-start pt-[84px] pb-4  sm:px-10 px-5 w-full">
            <div className="flex flex-col gap-[22px] items-start justify-start max-w-[1400px] mb-[7px] mx-auto w-full">
              <ResizeDetector handleHeight onResize={handleResize4}>
                <div className="w-full flex md:flex-row flex-col gap-[22px] items-start justify-start">
                  <div className="bg-new-card-bg flex flex-col items-start justify-start md:p-11 p-8 rounded-[32px] w-full h-full md:w-[64%] z-10">
                    <div className="flex flex-col gap-[22px] items-start justify-start w-auto md:w-full">
                      <div className="bankGothic sm:text-[32px] md:text-[38px] text-[42px] bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
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
                              : (prices["Crypto.SOL/USD"] / 100000000).toFixed(
                                  3
                                )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizeDetector>

              <ResizeDetector handleHeight onResize={handleResize1}>
                <div className="relative flex md:flex-row md:grid-cols-2 flex md:flex-row flex-col gap-[22px] items-start justify-start w-full md:pt-[0px] pt-[22px] z-10">
                  <div
                    ref={reffirstDiv}
                    className="bg-[url('/blockapexbg.png')] bg-cover w-full md:w-[38%] p-[1px] rounded-[32px] md:max-h-[400px] max-h-[300px]"
                  >
                    <div className="bg-[#000000] bg-opacity-35 w-full h-full   flex md:flex-1 flex-col items-center justify-start md:p-11 p-8 rounded-[32px] sm:top-[] w-full">
                      <div className="h-full flex flex-col gap-8 items-center justify-start w-auto">
                        <div className="bankGothic md:text-3xl sm:text-[28px] text-[32px] text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
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
                  <div className=" bg-new-card-bg flex flex-row items-center justify-center md:p-8 p-8 rounded-[32px] w-full md:w-[62%] min-h-[305px]">
                    <div className="flex flex-col gap-[26px] items-start justify-start my-1 w-auto md:w-2/3">
                      <div className="md:px-0 px-2 bankGothic leading-[90.69%] text-[32px] sm:text-[38px] md:text-[42px] bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
                        <>
                          Trade straight from your wallet. <br />
                        </>
                      </div>

                      <div className="md:block hidden  text-[#B4B5C7] text-lg w-auto">
                        Predict Crypto price and make it pop.
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <Link href="/trade">
                        <button className="block md:hidden relative overflow-hidden py-3 rounded-lg bg-new-green hover:bg-new-green-dark cursor-pointer font-semibold leading-[normal] min-w-[100px] text-center text-lg text-black transition ease-in-out duration-300">
                          TRADE
                        </button>
                        <button className="md:block hidden relative overflow-hidden py-3 rounded-lg bg-new-green hover:bg-new-green-dark cursor-pointer font-semibold leading-[normal] min-w-[189px] text-center text-lg text-black transition ease-in-out duration-300">
                          TRADE NOW
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </ResizeDetector>

              <ResizeDetector handleHeight onResize={handleResize}>
                <div className="flex md:flex-row md:grid-cols-2 flex md:flex-row flex-col gap-[22px] items-center justify-center w-full md:pt-[0px] pt-[22px] z-10">
                  <div className="md:order-1 order-2 md:max-h-[450px] min-h-[280px] bg-new-card-bg [backdrop-filter:blur(10px)] flex flex-col items-center justify-center md:p-11 p-8 rounded-[32px] w-full md:w-[62%] flex-shrink-0">
                    <div className="flex flex-col gap-[22px] items-center justify-center  w-auto md:w-full ">
                      <div className="bankGothic leading-[90.69%] max-w-[560px] md:max-w-full text-[32px] sm:text-[36px] md:text-[42px] bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
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
                    className="md:order-2 order-1 md:max-h-[450px] max-h-[280px]  w-full md:w-[38%] p-[1px] rounded-[32px] flex-shrink"
                  >
                    <div className="bg-[url('/communitybg.png')] bg-cover   h-full bg-opacity-90 rounded-[32px] w-full overflow-hidden md:max-h-[450px] max-h-[280px]">
                      <div className="bg-[#000000] bg-opacity-10 w-full h-full   flex md:flex-1 flex-col items-center justify-center md:p-11 p-8 rounded-[32px] sm:top-[] w-full">
                        <div className="h-full flex flex-col gap-2 items-center justify-center w-auto">
                          <div className="bankGothic text-center text-[32px] sm:text-[36px] md:text-[42px] bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] to-[#7b7c8a]">
                            Join our Community
                          </div>
                          <div className="rounded-lg bg-new-green flex flex-row items-center justify-center text-left text-lg">
                            <Link
                              href="https://discord.gg/jXCbWwD5s8"
                              target="_blank"
                              rel="noopener noreferrer"
                              passHref
                              className="text-secondary hover:text-white"
                            >
                              <button className="relative overflow-hidden py-3 rounded-lg bg-new-green hover:bg-new-green-dark cursor-pointer font-semibold leading-[normal] min-w-[189px] text-center text-lg text-black transition ease-in-out duration-300">
                                DISCORD
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizeDetector>
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

        {/* <div className="bg-[#000000] flex flex-col font-bankgothicmdbt md:gap-10 gap-[79px] items-center justify-end p-5 w-full pb-[42px]">
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
        </div> */}
        <div className="bg-[#000000] flex flex-col items-center justify-start md:m-[] md:mt-[] md:px-[58px] sm:px-10 px-5 w-full ">
          {/* <div className="bg-gradient-to-t from-[#0B7A55] to-[#34C796] max-w-[1232px] md:mb-[21px]  p-[1px]   rounded-[32px] z-10">
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
                      JOIN DISCORD
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
          </div> */}
        </div>
      </div>
    </>
  );
};
