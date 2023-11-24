import { FC, useEffect, useState } from "react";
    


interface InterestBarProps {
        openingPrice: number; // Add openingPrice here
        isSoliditySelected: boolean;
        prices: { [key: string]: { price: number, timestamp: string } };
        EMAprice: number;
        symbol: string;
      }  
      
  const InterestBar: React.FC<InterestBarProps> = ({ isSoliditySelected, symbol, prices, EMAprice, openingPrice }) => { // You forgot to add latestOpenedPosition here
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

const SCALE = 10000; // Define SCALE according to your requirements
const MAX_SPREAD_RATIO = 200; // 0.015 in your scale
const MIN_SPREAD_RATIO = 100; // This is the minimum spread ratio you set

const calculateSpreadPrice = (currentPrice, EMAprice) => {
  let spreadRatio = 0;
  if (EMAprice > currentPrice) {
    const priceDifference = EMAprice - currentPrice;
    spreadRatio = priceDifference * 100000 / currentPrice / 5;
  } else {
    const priceDifference = currentPrice - EMAprice;
    spreadRatio = priceDifference * 100000 / currentPrice / 5;
  }

  // Ensure the spread doesn't exceed 0.02
  const finalSpreadRatio = Math.max(100, Math.min(spreadRatio, 200));
  return finalSpreadRatio;
}

  // Since prices could update, you should use useEffect to recompute when prices change
  const [spreadRatio, setSpreadRatio] = useState<number>(0);

  useEffect(() => {
    if (prices && prices[symbol] && EMAprice) {
      const currentPythPrice = prices[symbol].price; // This assumes the price is not scaled.
      const newSpreadRatio = calculateSpreadPrice(EMAprice, currentPythPrice);
      setSpreadRatio(newSpreadRatio);
    }
  }, [prices, EMAprice, symbol]);

  // ... the rest of your component

  // Display the computed spread
  const displaySpread = (spreadRatio / SCALE).toFixed(3) + '%';



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
              <div className="relative leading-[12px] text-grey-text">Multiplier</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              1.70x
              </div>
            </div>
          </div>
          <div className="min-w-[110px] box-border h-8 flex flex-col items-center justify-center  border-l-[1px] border-solid border-layer-3">
            <div className="self-stretch flex flex-col pl-4 items-start justify-center gap-[4px]">             
            <div className="relative leading-[12px] text-grey-text">Spread</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              {displaySpread}
              </div>
            </div>
          </div>
        </div>
      </div>


);
};

export default InterestBar;