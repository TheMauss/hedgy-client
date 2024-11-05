import { FC } from "react";
import Link from "next/link";
import SolanaTPS from "./SolanaTPS"; // import your SolanaTPS component
import React, { useState, useEffect } from "react";
import { IoIosDocument } from "react-icons/io";
import { FaBook } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";

export const Footer: FC = () => {
  const [slogan, setSlogan] = useState("");

  useEffect(() => {
    const slogans = [
      "Popping potential in every trade.",
      "Make it pop in every trade.",
    ];

    // Choose a random slogan
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];

    setSlogan(randomSlogan);
  }, []);

  return (
    <div className="flex justify-center">
      <div className="h-20 text-gray-200 flex items-center justify-between  w-[95%] max-w-[1550px] flex flex-row items-center justify-between text-mini-7">
        <a href="/" className="no-underline">
          <div className="flex flex-row items-center justify-start gap-[5px]">
            <img className="ml-1 w-[70px] relative " alt="" src="/hedgy.png" />
          </div>
        </a>
        <div className="hidden sm:flex px-2 relative justify-center items-center text-center text-sm leading-[150%] font-gilroy-regular opacity-[0.5]">
          Hedgy is currently in beta. Please proceed with caution and be aware
          of potential risks.
        </div>
        <div className="sm:hidden px-2 relative flex justify-center items-center text-center text-sm leading-[150%] font-gilroy-regular opacity-[0.5]">
          Hedgy is currently in beta.
        </div>

        <div className="flex flex-row items-center justify-start gap-[13px]">
          <a
            href={`https://docs.hedgy.market/`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            <img
              className="w-[20px] relative h-[20px] overflow-hidden shrink-0"
              alt=""
              src="/gitbook--icon--light-1.svg"
            />{" "}
          </a>

          <a
            // href={`https://discord.gg/cpJ2GF6Skc`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            <img
              className="w-[22px] relative h-[16px] overflow-hidden shrink-0"
              alt=""
              src="/discord-symbolsvg.svg"
            />
          </a>
          <a
            href="https://x.com/HedgyMarket"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            <img
              className="w-[22px] relative h-[16px] overflow-hidden shrink-0"
              alt=""
              src="/x-logosvg.svg"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
