import { FC } from "react";
import Link from "next/link";
import SolanaTPS from './SolanaTPS'; // import your SolanaTPS component
import React, { useState, useEffect } from 'react';



export const Footer: FC = () => {
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    const slogans = [
      'Popping potential in every trade.',
      'Make it pop in every trade.'
    ];

    // Choose a random slogan
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];

    setSlogan(randomSlogan);
  }, []);
  
  return (
    <div className="h-30 lg:h-12 flex mt-1 mb-1 pt-2 pb-2 flex-row bg-transparent text-[#E0E5EA]  bg-opacity-66 overflow-hidden">
      <div className="flex items-center flex-col lg:flex-row gap-y-5 justify-between w-full px-4 md:px-10">
        <div className="lg:navbar-start justify-center w-full lg:w-auto flex items-center md:px-7 pr-5 ">
          <Link
            href="https://solana.com"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary hover:text-white"
          >
            <img src="/solana.png" alt="Logo" width="24" height="8" />
          </Link>
          <SolanaTPS />
          
        </div>
        <div className="navbar-center w-full lg:w-auto flex items-center justify-center">
        <div className="text-center text-slate-300">
      {`2023 © PopFi - ${slogan}`}
    </div>
           {/* Include your SolanaTPS component */}
        </div>
        <div className="lg:navbar-end justify-center flex w-full lg:w-auto items-center space-x-5 md:px-7">
        <div className="text-slate-300">Got questions? Our Discord is here to help.</div>
        <Link
            href="https://discord.gg/jXCbWwD5s8"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary hover:text-white"
          >
            <img src="/discord.png" alt="Logo" width="24" height="8" />
          </Link>
          <Link
            href="https://twitter.com/PopFi_io"
            target="_blank"
            rel="noopener noreferrer"
            passHref
            className="text-secondary hover:text-white"
          >
            <img src="/twitter.png" alt="Logo" width="24" height="8" />
          </Link>

        </div>
      </div>
    </div>
  );
};
