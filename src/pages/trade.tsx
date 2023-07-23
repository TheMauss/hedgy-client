import Head from "next/head";
import TradeBar from "../components/TradeBar";
import Graph from "../components/GraphOp";
import RecentPredictions from "../components/RecentPredictions";
import MyPositions from "../components/MyPositions";
import { FC, useState, useEffect } from "react";
import Chat from "components/Chat";

interface Position {
  _id: string;
  binaryOption: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  symbol: number;
  resolved: boolean;
  winner: string | null;
  expiration: number;
  expirationTime: number;
  remainingTime: string;
  timestamp: number;
  finalPrice: number;
  currentPrice: number;
}


const Transaction: FC = () => {
  const [symbol, setSymbol] = useState('Crypto.SOL/USD'); // default value
  const [divHeight, setDivHeight] = useState('60vh');
  const [latestOpenedPosition, setLatestOpenedPosition] = useState<Record<string, Position | null>>({});
  console.log('resize', divHeight)

  const handleSymbolChange = (newSymbol) => {
    setSymbol(newSymbol);
  };

  const handleDivHeightChange = (newHeight) => {
    setDivHeight(newHeight);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only run this client-side since window object is not available server-side
      let scrollPosition = 0;

      const handleFocus = () => {
        // Save the current scroll position when an input is focused
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      };

      const handleBlur = () => {
        // When an input is blurred, scroll back to the saved position
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      };
    
      // Add the event listeners when the component mounts
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
      });

      // Remove the event listeners when the component unmounts
      return () => {
        inputs.forEach((input) => {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
        });
      };
    }
  }, []);  

  return (
    <div>
      <Head>
        <title>Binary Finance | Trade</title>
        <meta name="description" content="PopFi" />
      </Head>
      <div className="flex justify-center">
        <div className="w-[98%] xl:w-[92%] lg:w-[94%] md:w-[96%] sm:w-[98%]">
          <div className="w-full flex xl:flex-row flex-col">
            {/* left sidebar */}
            
            {/* right content */}
            <div className=" w-full ">
              {/* top */}
              <div className="w-full flex md:flex-row flex-wrap flex-col justify-between">
                {/* left Image */}
                <TradeBar 
  onSymbolChange={handleSymbolChange} 
  setParentDivHeight={handleDivHeightChange} 
/>                 <div className=" lg:mr-1.5 lg:ml-1.5 md:ml-1.5 flex flex-grow order-2">
                  <Graph symbol={symbol} latestOpenedPosition={latestOpenedPosition}/>
                </div>
                <RecentPredictions divHeight={divHeight} />
                <MyPositions
                                latestOpenedPosition={latestOpenedPosition}
                                setLatestOpenedPosition={setLatestOpenedPosition}
                                />
                <Chat/>
                {/* bottom */}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
