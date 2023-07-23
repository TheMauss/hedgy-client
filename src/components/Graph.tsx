import { FC } from "react";
import TradingViewWidget from "./TradingviewWidget";
import ChartComponent from "./CustomChart";

interface Position {
  _id: string;
  futuresContract: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  leverage: number,
  stopLossPrice: number,
  takeProfitPrice: number,
  liquidationPrice: number,
  symbol: number;
  resolved: boolean;
  winner: string | null;
  finalPrice: number;
  currentPrice: number;
  pnl: number;
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
