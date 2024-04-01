import { FC, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface DataProps {
  btcLong: string;
  btcShort: string;
  solLong: string;
  solShort: string;
  pythLong: string;
  pythShort: string;
  bonkLong: string;
  bonkShort: string;
  jupLong: string;
  jupShort: string;
  ethLong: string;
  ethShort: string;
  tiaLong: string;
  tiaShort: string;
  suiLong: string;
  suiShort: string;
}

interface InterestBarProps {
  data: DataProps;
  openingPrice: number; // Add openingPrice here
  selectedCryptos: { [key: string]: boolean };
  prices: { [key: string]: { price: number; timestamp: string } };
  EMAprice: number;
  symbol: string;
  selectedCurrency: "SOL" | "USDC";
  totalDeposits: number;
  usdcTotalDeposits: number;
}

const InterestBar: React.FC<InterestBarProps> = ({
  selectedCryptos,
  symbol,
  data,
  prices,
  EMAprice,
  openingPrice,
  selectedCurrency,
  totalDeposits,
  usdcTotalDeposits,
}) => {
  // You forgot to add latestOpenedPosition here
  // Safely access the properties of prices
  const [initialPrice, setInitialPrice] = useState(0);

  useEffect(() => {
    const selectedCrypto = Object.keys(selectedCryptos).find(
      (key) => selectedCryptos[key]
    );

    // Get the price for the selected cryptocurrency
    const selectedCryptoPrice = prices?.[`Crypto.${selectedCrypto}/USD`]?.price;

    // Function to determine the number of decimal places
    const getDecimalPlaces = (crypto) => {
      switch (crypto) {
        case "BTC":
          return 1;
        case "ETH":
          return 1; // One decimal place for BTC
        case "SOL":
          return 3; // Three decimal places for SOL
        // Add other cases as necessary
        case "PYTH":
          return 4;
        case "JUP":
          return 4;
        case "BONK":
          return 8;
        case "TIA":
          return 3;
        case "SUI":
          return 4; // Three decimal places for SOL
        default:
          return 2; // Default number of decimal places
      }
    };

    let initialPrice = 0;

    if (selectedCryptoPrice) {
      const price = selectedCryptoPrice / 100000000;
      const decimalPlaces = getDecimalPlaces(selectedCrypto);

      // Convert to fixed-point notation before applying toFixed()
      const fixedPrice = Number(price.toPrecision(15));
      initialPrice = parseFloat(fixedPrice.toFixed(decimalPlaces));
    }

    setInitialPrice(initialPrice);
  }, [selectedCryptos, prices]);

  const percentage = (
    ((initialPrice - openingPrice) / openingPrice) *
    100
  ).toFixed(2);
  const color = Number(percentage) < 0 ? "text-short" : "text-primary";
  const displayedPercentage = isNaN(Number(percentage))
    ? "-"
    : Number(percentage) < 0
      ? percentage
      : `+${percentage}`;

  const getOpenInterestValues = (sym, selectedCurrency) => {
    const capitalizeFirstLetter = (string) =>
      string.charAt(0).toUpperCase() + string.slice(1);

    const currencySuffix = selectedCurrency === "USDC" ? "usdc" : "";

    const getCryptoPropertyName = (crypto, type) => {
      const cryptoName = currencySuffix
        ? capitalizeFirstLetter(crypto)
        : crypto;
      return `${currencySuffix}${cryptoName}${type}`;
    };

    const mapping = {
      "Crypto.BTC/USD": {
        long: getCryptoPropertyName("btc", "Long"),
        short: getCryptoPropertyName("btc", "Short"),
      },
      "Crypto.SOL/USD": {
        long: getCryptoPropertyName("sol", "Long"),
        short: getCryptoPropertyName("sol", "Short"),
      },
      "Crypto.PYTH/USD": { long: "pythLong", short: "pythShort" },
      "Crypto.BONK/USD": { long: "bonkLong", short: "bonkShort" },
      "Crypto.JUP/USD": { long: "jupLong", short: "jupShort" },
      "Crypto.ETH/USD": { long: "ethLong", short: "ethShort" },
      "Crypto.TIA/USD": { long: "tiaLong", short: "tiaShort" },
      "Crypto.SUI/USD": { long: "suiLong", short: "suiShort" },
    };

    if (mapping[sym]) {
      return {
        long: (parseFloat(data[mapping[sym].long]) / LAMPORTS_PER_SOL).toFixed(
          1
        ),
        short: (
          parseFloat(data[mapping[sym].short]) / LAMPORTS_PER_SOL
        ).toFixed(1),
      };
    } else {
      return { long: "0", short: "0" };
    }
  };

  const getMaxOpenInterest = (
    sym: string,
    selectedCurrency: "SOL" | "USDC",
    totalDeposits: number,
    usdcTotalDeposits: number
  ) => {
    const deposits =
      selectedCurrency === "USDC" ? usdcTotalDeposits : totalDeposits;

    // Map of symbols to their respective "groups" for calculation
    const divisionMap = {
      "Crypto.BTC/USD": 4,
      "Crypto.SOL/USD": 4,
      "Crypto.PYTH/USD": 25,
      "Crypto.BONK/USD": 25,
      "Crypto.JUP/USD": 25,
      "Crypto.ETH/USD": 4,
      "Crypto.TIA/USD": 25,
      "Crypto.SUI/USD": 25,
    };

    // Retrieve the divisor for the given symbol, default to 0 if not found
    const divisor = divisionMap[sym] || 0;

    if (divisor === 0) {
      console.error("Invalid symbol for max open interest calculation");
      return 0; // Return a default or error value for invalid symbols
    }

    return deposits / divisor;
  };

  const { long, short } = getOpenInterestValues(symbol, selectedCurrency);
  const totalMaxOpenInterest = getMaxOpenInterest(
    symbol,
    selectedCurrency,
    totalDeposits,
    usdcTotalDeposits
  );

  const [borrowingFeeLong, setBorrowingFeeLong] = useState("0");
  const [borrowingFeeShort, setBorrowingFeeShort] = useState("0");

  useEffect(() => {
    const computeBorrowingFee = (
      direction: "long" | "short",
      MaxOpenInterest: number
    ) => {
      const numerator =
        direction === "long" ? parseFloat(long) : parseFloat(short);
      const total = parseFloat(long) + parseFloat(short);
      const ratio = total !== 0 ? numerator / total : 0;

      const annualFee =
        0.4 * (ratio - 0.5) + (numerator / MaxOpenInterest) * 0.9;
      const hourlyFee = annualFee / (24 * 365);

      return hourlyFee.toFixed(6);
    };

    let tempBorrowingFeeLong = computeBorrowingFee(
      "long",
      totalMaxOpenInterest
    );
    let tempBorrowingFeeShort = computeBorrowingFee(
      "short",
      totalMaxOpenInterest
    );

    if (parseFloat(tempBorrowingFeeLong) < 0) {
      tempBorrowingFeeLong = "0";
    }

    if (parseFloat(tempBorrowingFeeShort) < 0) {
      tempBorrowingFeeShort = "0";
    }

    setBorrowingFeeLong(tempBorrowingFeeLong);
    setBorrowingFeeShort(tempBorrowingFeeShort);
  }, [long, short, totalMaxOpenInterest]);

  return (
    <div className="md:flex hidden font-poppins custom-scrollbar rounded-lg  w-full h-[53px] flex flex-row items-center justify-start  text-xs  overflow-auto">
      <div className="flex flex-row items-center justify-between py-0 px-4 box-border">
        <div className="md:flex hidden min-w-[150px] flex flex-row items-center justify-start py-0 pr-8 pl-0 box-border gap-[12px] text-2xl text-white">
          <div className=" leading-[18px] font-medium pb-1">
            ${initialPrice}
          </div>
          <div className={`text-base leading-[16px] font-medium ${color}`}>
            {displayedPercentage}%
          </div>
        </div>
        <div className="min-w-[110px] box-border h-8 flex flex-col items-center justify-center  md:border-l-[1px] border-solid border-layer-3">
          <div className="self-stretch flex flex-col md:pl-4 items-start justify-center gap-[4px]">
            <div className="relative leading-[12px] text-[#ffffff60]">
              Open (L)
            </div>
            <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              {selectedCurrency === "SOL" ? `${long} SOL` : `${long}k USDC`}
            </div>
          </div>
        </div>
        <div className="min-w-[110px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
          <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">
            <div className="relative leading-[12px] text-[#ffffff60]">
              Open (S)
            </div>
            <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              {selectedCurrency === "SOL" ? `${short} SOL` : `${short}k USDC`}{" "}
            </div>
          </div>
        </div>
        <div className="min-w-[120px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
          <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">
            <div className="relative leading-[12px] text-[#ffffff60]">
              Borrowing (L)
            </div>
            <div className="relative text-sm leading-[16px] font-dm-sans text-short">
              {isNaN(Number(borrowingFeeLong))
                ? "0.0000%"
                : `${(Number(borrowingFeeLong) * 100).toFixed(4)}%`}
            </div>
          </div>
        </div>
        <div className="min-w-[120px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
          <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">
            <div className="relative leading-[12px] text-[#ffffff60]">
              Borrowing (S)
            </div>
            <div className="relative text-sm leading-[16px] font-dm-sans text-short">
              {isNaN(Number(borrowingFeeShort))
                ? "0.0000%"
                : `${(Number(borrowingFeeShort) * 100).toFixed(4)}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestBar;
