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
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
    ...cryptoPairs,
  ];

  const controls = useAnimation();

  const [movementDirection, setMovementDirection] = useState(["0%", "-1200%"]); // Default to PC

  // Adjust movementDirection based on window width
  const adjustMovementForDevice = () => {
    const width = window.innerWidth;
    if (width < 480) {
      // Mobile
      setMovementDirection(
        direction === "right" ? ["0%", "-4800%"] : ["-4800%", "0%"]
      );
    } else if (width >= 480 && width < 1024) {
      // Tablet
      setMovementDirection(
        direction === "right" ? ["0%", "-2400%"] : ["-2400%", "0%"]
      );
    } else {
      // PC and others
      setMovementDirection(
        direction === "right" ? ["0%", "-1200%"] : ["-1200%", "0%"]
      );
    }
  };

  useEffect(() => {
    adjustMovementForDevice();
    // Re-adjust when window resizes
    window.addEventListener("resize", adjustMovementForDevice);
    return () => window.removeEventListener("resize", adjustMovementForDevice);
  }, [direction]);

  useEffect(() => {
    controls.start({
      x: movementDirection,
      transition: {
        ease: "linear",
        duration: 600, // Adjust duration as needed
        repeat: Infinity,
      },
    });
  }, [controls, movementDirection]);

  // Stop animation on hover
  const handleMouseEnter = () => {
    controls.stop();
  };

  // Resume animation from where it stopped on mouse leave
  const handleMouseLeave = () => {
    controls.start({
      x: direction === "right" ? "-1200%" : "1200%",
      transition: {
        ease: "linear",
        duration: 600, // Keep or adjust duration to resume correctly
        repeat: Infinity,
      },
    });
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="z-10 relative h-full w-full overflow-hidden py-4 bg-backgroundColorTertiary"
    >
      <motion.div className="flex" animate={controls}>
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
                  <div className="flex flex-col items-start justify-start gap-[12px]">
                    <div className="relative leading-[100%] text-[20px] text-[#FFFFF]">
                      {pair.name}
                    </div>
                    <div className="relative text-[#B4B5C770] leading-[80.69%]">
                      {pair.ticker}
                    </div>
                  </div>
                  <img
                    className="w-[50px] relative h-[55px] object-cover"
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
