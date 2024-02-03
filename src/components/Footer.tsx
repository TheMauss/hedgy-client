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
    <div className="bg-base h-[30px] flex flex-row  text-[#E0E5EA]  ">
      <div className="flex items-center flex-row gap-y-5 justify-between w-full md:px-10">
        <div className="justify-start w-full lg:w-auto flex items-center md:px-7 pl-10">
          <Link
            href="https://solana.com"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary hover:text-white"
          >
            <img src="/solana.png" alt="Logo" width="16" height="6" />
          </Link>
          <SolanaTPS />
        </div>
        <div className="justify-end flex w-full lg:w-auto items-center space-x-5 md:px-7 pr-10">
          <Link
            href="https://popfi.gitbook.io/"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary "
          >
            <IoIosDocument width="16" height="8" className="text-[#dde1e7]" />
          </Link>
          <Link
            href="https://discord.gg/popfiio"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary hover:text-white"
          >
            <img src="/discord.png" alt="Logo" width="16" height="6" />
          </Link>
          <Link
            href="https://twitter.com/PopFi_io"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary hover:text-white"
          >
            <img
              src="/twitter.png"
              alt="Logo"
              width="16"
              height="6"
              className=""
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
