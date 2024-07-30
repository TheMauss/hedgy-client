import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef, FC } from "react";
import ResizeDetector from "react-resize-detector";
import socketIOClient from "socket.io-client";
import { useRouter } from "next/router";
import AppBar from "components/Firstbar";
// At the top of your HomeView file
import dynamic from "next/dynamic";
import axios from "axios";
import { FaAngleDoubleRight } from "react-icons/fa";

// Dynamically import the StarfieldAnimationComponent with SSR disabled
const StarfieldAnimationComponentWithNoSSR = dynamic(
  () => import("components/StarfieldAnimationComponent"),
  { ssr: false }
);

const fetchHistoricalPriceUpdates = async (timestamp, ids) => {
  const baseURL = "https://benchmarks.pyth.network/v1/updates/price/";
  const url = `${baseURL}${timestamp}`;
  const params = ids.map((id) => `ids=${id}`).join("&");
  const fullUrl = `${url}?${params}`;

  console.log(`Fetching data from URL: ${fullUrl}`);

  try {
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching historical price updates:", error);
    return null;
  }
};

export const HomeView: FC = ({}) => {
  const refSecondDiv = React.useRef(null);
  const reffirstDiv = React.useRef(null);
  const refthirdDiv = React.useRef(null);
  const refforthDiv = React.useRef(null);
  const [prices, setPrices] = useState({});
  const [openPrices, setopenPrices] = useState({});
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(0);

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
      </div>
    </>
  );
};
