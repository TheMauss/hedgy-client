import { FC, useEffect, useState } from "react";
    


interface InterestBarProps {
        openingPrice: number; // Add openingPrice here
        prices: { [key: string]: { price: number, timestamp: string } };
        EMAprice: number;
        symbol: string;
        selectedCryptos: { [key: string]: boolean };
      }  
      
  const InterestBar: React.FC<InterestBarProps> = ({selectedCryptos, symbol, prices, EMAprice, openingPrice }) => { // You forgot to add latestOpenedPosition here
    // Safely access the properties of prices

    const [initialPrice, setInitialPrice] = useState(0);

    useEffect(() => {
      const selectedCrypto = Object.keys(selectedCryptos).find(key => selectedCryptos[key]);
    
      // Get the price for the selected cryptocurrency
      const selectedCryptoPrice = prices?.[`Crypto.${selectedCrypto}/USD`]?.price;
    
      // Function to determine the number of decimal places
      const getDecimalPlaces = (crypto) => {
        switch (crypto) {
          case 'BTC':
            return 1; // One decimal place for BTC
          case 'SOL':
            return 3; // Three decimal places for SOL
          // Add other cases as necessary
          case 'PYTH':
            return 4;
          case 'BONK':
            return 8;
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
    

    const percentage = (((initialPrice - openingPrice) / openingPrice) * 100).toFixed(2);
    const color = Number(percentage) < 0 ? 'text-red-500' : 'text-primary';
    const displayedPercentage = isNaN(Number(percentage)) ? '-' : Number(percentage) < 0 ? percentage : `+${percentage}`;

    const MAX_NOTIONAL_POSITIONS = 1000;

const SCALE = 10000; // Define SCALE according to your requirements

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
      <div className="font-poppins custom-scrollbar rounded-lg bg-layer-1 w-full h-[53px] flex flex-row items-center justify-start  text-xs overflow-auto">
        <div className="flex flex-row items-center justify-between py-0 px-4 box-border">
          <div className="md:flex hidden min-w-[150px] flex flex-row items-center justify-start py-0 pr-8 pl-0 box-border gap-[12px] text-2xl text-white">
            <div className=" leading-[18px] font-medium pb-1">${initialPrice}</div>
            <div className={`text-base leading-[16px] font-medium ${color}`}>
              {displayedPercentage}%
            </div>
          </div>
          <div className="min-w-[110px] box-border h-8 flex flex-col items-center justify-center  md:border-l-[1px] border-solid border-layer-3">
            <div className="self-stretch flex flex-col md:pl-4 items-start justify-center gap-[4px]">
              <div className="relative leading-[12px] text-grey-text">Multiplier</div>
              <div className="relative text-sm leading-[16px] font-dm-sans text-white">
              1.85x
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