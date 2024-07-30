import { FC } from "react";
import Link from "next/link";
import SolanaTPS from "./SolanaTPS"; // import your SolanaTPS component
import React, { useState, useEffect } from "react";
import { IoIosDocument } from "react-icons/io";

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
    <div className="flex justify-center bg-layer-1 ">
      <div className="h-9.5 py-[13.5px] text-gray-200 flex items-center justify-between  w-[95%] xl:w-[80%] lg:w-[80%] md:w-[80%] sm:min-w-[95%] flex flex-row items-center justify-between text-mini-7">
        <div className="flex flex-row items-center justify-start gap-[5px]">
          <img
            className="ml-1 w-[18.1px] relative h-[19.5px]"
            alt=""
            src="/group-11.svg"
          />
          <div className="font-gilroy-semibold text-white w-[50.2px] relative tracking-[-0.03em] leading-[120.41%] inline-block h-[14.6px] shrink-0">
            Stakera
          </div>
        </div>
        {/* <div className="relative text-sm leading-[150%] font-gilroy-regular opacity-[0.5]">
      © 2024 Stakera. All rights reserved.
    </div> */}
        <div className="flex flex-row items-center justify-start gap-[13px] opacity-[0.5]">
          <img
            className="w-6 relative h-6 overflow-hidden shrink-0 object-cover"
            alt=""
            src="/icon--youtube@2x.png"
          />
          <img
            className="w-6 relative h-6 overflow-hidden shrink-0"
            alt=""
            src="/icon--x.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
