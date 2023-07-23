import { FC } from "react";
import TradingViewWidget from "./TradingviewWidget";
import ChartComponent from "./CustomChartOp";

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

interface GraphProps {
  symbol: string;
  latestOpenedPosition: Record<string, Position | null>;
}

const Graph: React.FC<GraphProps> = ({ latestOpenedPosition, symbol }) => { // You forgot to add latestOpenedPosition here
  console.log("Symbol:", symbol);
  return (
    <div className="w-full order-1 rounded shadow-component border-t-2 border-gray-500 xl:mt-0 md:mt-0 mt-2 flex ">
      <div className="flex-1 h-[full] min-h-[510px] relative">
        <div className="absolute inset-0 h-full">
          <ChartComponent key={symbol} symbol={symbol} latestOpenedPosition={latestOpenedPosition}/>        
        </div>
      </div>
    </div>
  );
};

export default Graph;
