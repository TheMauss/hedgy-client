import { FC, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";     
    


interface DataProps {
  btcLong: string;
  btcShort: string;
  solLong: string;
  solShort: string;
}

interface InterestBarProps {
        data: DataProps;
        openingPrice: number; // Add openingPrice here
        isSoliditySelected: boolean;
        prices: { [key: string]: { price: number, timestamp: string } };
        EMAprice: number;
        symbol: string;
      }  
      
  const InterestBar: React.FC<InterestBarProps> = ({ isSoliditySelected, symbol, data, prices, EMAprice, openingPrice }) => { // You forgot to add latestOpenedPosition here
    // Safely access the properties of prices
    const solPrice = prices?.['Crypto.SOL/USD']?.price;
    const btcPrice = prices?.['Crypto.BTC/USD']?.price;

    const [initialPrice, setInitialPrice] = useState(0);

    useEffect(() => {
      const initialPrice = isSoliditySelected
        ? prices['Crypto.SOL/USD']?.price / 100000000
        : prices['Crypto.BTC/USD']?.price / 100000000;
    
      setInitialPrice(initialPrice);
    }, [isSoliditySelected, prices]);

    const percentage = (((initialPrice - openingPrice) / openingPrice) * 100).toFixed(2);
    const color = Number(percentage) < 0 ? 'text-red-500' : 'text-primary';
    const displayedPercentage = isNaN(Number(percentage)) ? '-' : Number(percentage) < 0 ? percentage : `+${percentage}`;
  
    // Check if solPrice and btcPrice are numbers before dividing and fixing
    const displayPrice = isSoliditySelected
      ? solPrice && !isNaN(solPrice)
        ? (solPrice / 100000000).toFixed(3)
        : '-'
      : btcPrice && !isNaN(btcPrice)
        ? (btcPrice / 100000000).toFixed(1)
        : '-';

    const MAX_NOTIONAL_POSITIONS = 1000;

    const getOpenInterestValues = (sym: string) => {
      if (sym === 'Crypto.BTC/USD') {
        return {
          long: (parseFloat(data.btcLong) / LAMPORTS_PER_SOL).toFixed(1),
          short: (parseFloat(data.btcShort) / LAMPORTS_PER_SOL).toFixed(1),
        };
      } else if (sym === 'Crypto.SOL/USD') {
        return {
          long: (parseFloat(data.solLong) / LAMPORTS_PER_SOL).toFixed(1),
          short: (parseFloat(data.solShort) / LAMPORTS_PER_SOL).toFixed(1)
        };
      } else {
        return {
          long: "0",
          short: "0"
        };
      }
    };

    const { long, short } = getOpenInterestValues(symbol);
    
const computeBorrowingFee = (direction: 'long' | 'short', price: number, emaPrice: number) => {
    const numerator = direction === 'long' ? parseFloat(long) : parseFloat(short);
    const total = parseFloat(long) + parseFloat(short);
    const ratio = (total !== 0) ? numerator / total : 0;
    const relativePriceDifference = (emaPrice !== 0) ? (price - emaPrice) / emaPrice : 0;
    const directionalDifference = direction === 'long' ? relativePriceDifference : -relativePriceDifference;
    const notionalPosition = parseFloat(long) + parseFloat(short);

    const annualFee = (0.6 * (ratio - 0.5) + 0.25 * (directionalDifference * 10) + 0.15 * (notionalPosition / MAX_NOTIONAL_POSITIONS)) * 2;
    const hourlyFee = annualFee / (24 * 365);
  
    return hourlyFee.toFixed(6);
};

const currentPrice = prices ? prices[symbol]?.price : 0;

let borrowingFeeLong = computeBorrowingFee('long', currentPrice, EMAprice) || "0";
let borrowingFeeShort = computeBorrowingFee('short', currentPrice, EMAprice) || "0";

if (parseFloat(borrowingFeeLong) > 0) {
  borrowingFeeShort = "0";
}
else if (parseFloat(borrowingFeeShort) > 0) {
  borrowingFeeLong = "0";
}

// Helper function to check if value is zero or undefined
const isZeroOrUndefined = (value: string) => parseFloat(value) === 0 && value === undefined;

// 1. Decide fee based on volatility and notional position if long = short or either one is 0 or undefined
if (parseFloat(long) === parseFloat(short) || isZeroOrUndefined(long) || isZeroOrUndefined(short)) {
  const relativePriceDifference = (EMAprice !== 0) ? (currentPrice - EMAprice) / EMAprice : 0;
  
  const directionalDifferenceLong = relativePriceDifference;  // Directional difference for long
  const directionalDifferenceShort = -relativePriceDifference; // Directional difference for short

  const volatilityFeeLong = Math.abs(0.25 * (directionalDifferenceLong * 10));
  const volatilityFeeShort = Math.abs(0.25 * (directionalDifferenceShort * 10));

  const notionalPositionFee = 0.15 * ((parseFloat(long) + parseFloat(short)) / MAX_NOTIONAL_POSITIONS);

  const combinedFeeLong = (volatilityFeeLong + notionalPositionFee) * 2 / (24 * 365);
  const combinedFeeShort = (volatilityFeeShort + notionalPositionFee) * 2 / (24 * 365);

  borrowingFeeLong = combinedFeeLong.toFixed(6);
  borrowingFeeShort = combinedFeeShort.toFixed(6);

  // 2. If EMA is above current price, then fee will be for paying short
  if (EMAprice > currentPrice) {
      borrowingFeeLong = "0";
  } 
  else if (EMAprice < currentPrice) {
      borrowingFeeShort = "0";
  }
}




    return (
      <div className="font-poppins custom-scrollbar rounded-lg bg-layer-1 w-full h-[55px] flex flex-row items-center justify-start  text-xs md:border border-t border-b border-layer-3 overflow-auto">
        <div className="flex flex-row items-center justify-between py-0 px-4 box-border">
          <div className="md:flex hidden min-w-[150px] flex flex-row items-center justify-start py-0 pr-8 pl-0 box-border gap-[12px] text-2xl text-white">
            <div className=" leading-[18px] font-medium pb-1">${displayPrice}</div>
            <div className={`text-base leading-[16px] font-medium ${color}`}>
              {displayedPercentage}%
            </div>
          </div>
          <div className="min-w-[110px] box-border h-8 flex flex-col items-center justify-center  md:border-l-[1px] border-solid border-layer-3">
            <div className="self-stretch flex flex-col md:pl-4 items-start justify-center gap-[4px]">
              <div className="relative leading-[12px] text-grey-text">Open (L)</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              {long} SOL
              </div>
            </div>
          </div>
          <div className="min-w-[110px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
            <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">             
            <div className="relative leading-[12px] text-grey-text">Open (S)</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              {short} SOL
              </div>
            </div>
          </div>
          <div className="min-w-[120px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
            <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">              
            <div className="relative leading-[12px] text-grey-text">Borrowing (L)</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-short">
              {(Number(borrowingFeeLong) * 100).toFixed(4)}%
              </div>
            </div>
          </div>
          <div className="min-w-[120px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
            <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">
              <div className="relative leading-[12px] text-grey-text">Borrowing (S)</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-short">
              {(Number(borrowingFeeShort) * 100).toFixed(4)}%
              </div>
            </div>
          </div>
        </div>
      </div>


);
};

export default InterestBar;