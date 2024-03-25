import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

interface CryptoSliderProps {
  cryptoPairs: {
    name: string;
    price: string;
    ticker: string;
    img: string;
  }[];
  direction: "left" | "right";
}

const CryptoSlider: React.FC<CryptoSliderProps> = ({
  cryptoPairs,
  direction,
}) => {
  // Ensure pairs are duplicated for infinite scroll effect
  const duplicatedCryptoPairs = [
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
  ];

  // Calculate movement direction based on props
  const movementDirection =
    direction === "right" ? ["0%", "-100%"] : ["-100%", "0%"];

  return (
    <div className="z-10 relative h-full w-full overflow-hidden py-4 bg-backgroundColorTertiary">
      <motion.div
        className="flex"
        initial={{ x: movementDirection[0] }}
        animate={{
          x: movementDirection,
          transition: {
            ease: "linear",
            duration: 40, // Adjust the duration to control the speed
            repeat: Infinity,
          },
        }}
      >
        {duplicatedCryptoPairs.map((pair, index) => (
          <div
            key={index}
            className="z-10 flex-shrink-0 w-[340px]  px-4"
            style={{ width: `340px` }}
          >
            {" "}
            {/* Adjust min-width as needed */}
            <div className="flex items-center justify-center h-full  ">
              <div className="w-[330px] rounded-3xl bg-new-card-bg [backdrop-filter:blur(10px)] flex flex-col items-start justify-start p-6 box-border gap-[24px]">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start justify-start gap-[8px]">
                    <div className="relative leading-[100%] font-medium">
                      {pair.name}
                    </div>
                    <div className="relative text-base leading-[80.69%] text-gray-200">
                      {pair.ticker}
                    </div>
                  </div>
                  <img
                    className="w-[60px] relative h-[60px] object-cover"
                    alt={pair.name}
                    src={pair.img}
                  />
                </div>
                <div className="self-stretch flex flex-row items-center justify-between text-xl">
                  <div className="relative leading-[100%] font-medium">
                    {pair.price}
                  </div>
                  <div className="relative leading-[100%] font-medium text-primary">
                    +2.32%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CryptoSlider;
