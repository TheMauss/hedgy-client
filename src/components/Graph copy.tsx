import { FC } from "react";
import TradingViewWidget from "./TradingviewWidget";
import ChartComponent from "./CustomChart";

interface GraphProps {
  symbol: string;
}

const Graph: FC<GraphProps> = ({ symbol }) => {
  console.log("Symbol:", symbol);
  return (
    <div className="w-full order-1 rounded shadow-component border-t-2 border-gray-500 xl:mt-0 md:mt-0 mt-2 flex ">
      <div className="flex-1 h-[full] min-h-[510px] relative">
        <div className="absolute inset-0 h-full">
          <TradingViewWidget symbol={symbol} />
        </div>
      </div>
    </div>
  );
};

export default Graph;
