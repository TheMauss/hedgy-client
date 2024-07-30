import { FC } from "react";
import Link from "next/link";
import SolanaTPS from "./SolanaTPS"; // import your SolanaTPS component
import React, { useState, useEffect } from "react";
import { IoIosDocument } from "react-icons/io";
import { usePriorityFee } from "../contexts/PriorityFee";

export const Footer: FC = () => {
  const [slogan, setSlogan] = useState("");
  const { isPriorityFee, setPriorityFee } = usePriorityFee();

  const handleToggle = () => {
    // Update the isPriorityFee state when the toggle button is clicked
    setPriorityFee(!isPriorityFee);
  };

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
    <div className="text-sm h-[26px] flex flex-row  text-[#ffffff60]  ">
      <div className="flex items-center flex-row gap-y-5 justify-between w-full md:px-10">
        <div className="justify-start flex w-full lg:w-auto items-center space-x-5 md:px-7 pl-10">
          <Link
            href="https://discord.gg/popfiio"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-[#ffffff60] hover:text-white"
          >
            <img src="/discord.png" alt="Logo" width="16" height="6" />
          </Link>
          <Link
            href="https://twitter.com/PopFi_io"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-[#ffffff60] hover:text-white"
          >
            <img
              src="/twitter.png"
              alt="Logo"
              width="16"
              height="6"
              className=""
            />
          </Link>
          <Link
            href="https://popfi.gitbook.io/"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-[#ffffff60] "
          >
            <IoIosDocument width="16" height="8" className="text-[#dde1e7]" />
          </Link>
          <Link
            href="https://pyth.network/"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-[#ffffff60] hover:text-white"
          >
            <img src="/pythsvg.svg" alt="Logo" width="16" height="6" />
          </Link>
        </div>
        <div className="justify-end w-full lg:w-auto flex items-center md:px-7 pr-10">
          <SolanaTPS />
          <div className="md:flex flex-row hidden font-poppins pl-2 text-[#ffffff60] self-stretch  items-center justify-center gap-2">
            <div className="relative leading-[14px]">Priority Fees</div>
            <div className="relative leading-[14px] font-medium text-white">
              <label className="toggle-switch-bigger">
                <input
                  type="checkbox"
                  checked={isPriorityFee}
                  onChange={handleToggle}
                  className=""
                />
                <div
                  className={`slider-bigger ${isPriorityFee ? "active" : ""}`}
                ></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
