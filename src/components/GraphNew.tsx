import { Chart } from "./Chart/Chart";
import { FC } from "react";

export interface FutureContractPosition {
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

export interface BinaryOptionPosition {
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
  latestOpenedPosition: Record<string, FutureContractPosition | BinaryOptionPosition | null>;
  prices: { [key: string]: { price: number, timestamp: string } };
}

export const Graph: FC<GraphProps> = ({ latestOpenedPosition, symbol, prices }) => {
  return (
    <div className="overflow-hidden w-full h-full order-1 rounded-lg flex bg-layer-1">
      <div className="min-h-[330px] h-full w-full flex flex-col overflow-y-auto ">
        <div className="flex-1 h-full relative flex flex-col w-full">
          <div className="absolute inset-0 flex bg-layer-1 rounded ">
            <Chart key={symbol} symbol={symbol} latestOpenedPosition={latestOpenedPosition} prices={prices} />
          </div>
        </div>
      </div>
    </div>
  );
};