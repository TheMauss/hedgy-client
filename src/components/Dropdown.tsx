import React, { useState } from "react";

export const Dropdown = () => {
  // State for each dropdown
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(false);

  // Toggle functions for each dropdown
  const toggleDropdown1 = () => {
    setIsOpen1(!isOpen1);
  };

  const toggleDropdown2 = () => {
    setIsOpen2(!isOpen2);
  };

  return (
    <div className="font-gilroy-regular self-stretch flex flex-col items-start justify-start gap-4 text-lg text-neutral-06">
      {/* First Dropdown */}
      <div className="self-stretch flex flex-col items-start justify-start gap-2">
        <div
          className="self-stretch flex flex-row items-center justify-between cursor-pointer"
          onClick={toggleDropdown1}
        >
          <div className="relative tracking-[-0.21px] ">How does it work?</div>
          <img
            className={`w-6 h-6 transform transition-transform duration-300 ${
              isOpen1 ? "rotate-180" : "rotate-0"
            }`}
            alt=""
            src={isOpen1 ? "/arrow-down.svg" : "/arrow-down1.svg"}
          />
        </div>

        {/* Content for the first dropdown */}
        <div
          className={`self-stretch relative text-base leading-[150%] text-grey-text overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen1 ? "opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <span className="opacity-70">
            Hedgy is a fully automated, delta-neutral strategy built on top of
            the JLP token and Drift Trade. By utilizing advanced algorithm, it
            continuously balances positions to maximize returns while minimizing
            market risks. Hedgy leverages both long and short positions to hedge
            against volatility, ensuring steady yield growth for your USDC
            investments.{" "}
            <span>
              You can track the portfolio on
              <a
                href="https://app.drift.trade/overview/portfolio?authority=H77yKTWRUQjx9rDzeSdEL98msMinE7E1A5Zs9tfiP6yU&fbclid/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {" "}
                Drift Trade platform
              </a>
              .
            </span>
          </span>
        </div>
      </div>

      {/* Second Dropdown */}
      <div className="self-stretch flex flex-col items-start justify-start gap-2">
        <div
          className="self-stretch flex flex-row items-center justify-between cursor-pointer"
          onClick={toggleDropdown2}
        >
          <div className="relative tracking-[-0.21px] font-medium">
            What are the Risks
          </div>
          <img
            className={`w-6 h-6 transform transition-transform duration-300 ${
              isOpen2 ? "rotate-180" : "rotate-0"
            }`}
            alt=""
            src={isOpen2 ? "/arrow-down.svg" : "/arrow-down1.svg"}
          />
        </div>

        {/* Content for the second dropdown */}
        <div
          className={`self-stretch relative text-base leading-[150%] text-grey-text overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen2 ? "opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="opacity-70 flex flex-col">
            <span>
              {" "}
              Smart Contract Risk: Both Drift and JLP tokens operate on smart
              contracts, which may contain vulnerabilities or bugs that could
              lead to unintended consequences or losses.
            </span>
            <span>
              Volatility in JLP Premium: Fluctuations in the premium of the JLP
              token can impact your yield or result in unexpected losses despite
              the delta-neutral strategy.
            </span>
            <span>
              Insufficient Liquidity on Drift: The strategy relies on sufficient
              liquidity on Drift for seamless execution of trades. In times of
              low liquidity, executing positions could become difficult or
              costly.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
