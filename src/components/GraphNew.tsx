  import ChartComponent from "./CustomChartTV";


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
    prices: { [key: string]: { price: number, timestamp: string } };
  }

  const Graph: React.FC<GraphProps> = ({ latestOpenedPosition, symbol, prices }) => { // You forgot to add latestOpenedPosition here

return (
  <div className="overflow-hidden w-full h-full order-1 rounded-lg md:border  border-t border-b border-layer-3 flex bg-layer-1">
<div className="min-h-[330px] h-full w-full flex flex-col overflow-y-auto ">
      <div className="flex-1 h-full relative flex flex-col w-full">
        <div className="absolute inset-0 flex bg-layer-1 rounded ">
          <ChartComponent key={symbol} symbol={symbol} latestOpenedPosition={latestOpenedPosition} prices={prices}/>
        </div>
      </div>
    </div>
  </div>



    );
  };

  export default Graph;
