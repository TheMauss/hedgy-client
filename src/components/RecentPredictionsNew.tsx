import { FC, useEffect, useState } from "react";
import socketIOClient from 'socket.io-client';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import HashLoader from "react-spinners/HashLoader";
import { FaSortAmountDown, FaAngleDoubleUp, FaAngleDoubleDown } from 'react-icons/fa';
import Identicon from 'identicon.js';
import FlipMove from 'react-flip-move';



const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;

const SMALL_SCREEN = 768;

interface Position {
  type: 'position';
  _id: string;
  binaryOption: string;
  playerAcc: string;
  betAmount: number;
  initialPrice: number;
  priceDirection: number;
  expirationTime: number;
  symbol: number;
  resolved: boolean;
  payout: number;
  finalPrice: number;
  elapsedTime: string;
}

interface PositionFutures {
  type: 'positionFutures';
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
  timestamp: number;
  pnl: number;
  elapsedTime: string;
}

interface Recentprops {
  divHeight: string;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const RecentPredictions: FC<Recentprops> = ({ divHeight }) => {
  const [positions, setPositions] = useState<(Position | PositionFutures)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const socket = socketIOClient(ENDPOINT2);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        if (!socket || socket.disconnected) {
          // Reinitialize the socket connection if it's not connected
          socket.connect();
          // You can also add any other logic here to fetch the latest data or emit events
        }
      }
    }

    // Add the visibility change event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);
    

    function calculateElapsedTime(timestamp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime - timestamp;
      const seconds = Math.floor(timeElapsed);
      const minutes = Math.floor(timeElapsed / 60);
      const hours = Math.floor(minutes / 60);
      let elapsedTime = "";
      if (hours > 0) {
        elapsedTime = `${hours} ${hours > 1 ? "hours" : "hour"} ago`;
      } else if (minutes > 0) {
        elapsedTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
      } else {
        elapsedTime = `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
      }
      return elapsedTime;
    }

    function elapsedTimeInSeconds(elapsedTimeString: string) {
      const [value, unit] = elapsedTimeString.split(' ');
      if (unit.startsWith('second')) {
        return Number(value);
      } else if (unit.startsWith('minute')) {
        return Number(value) * 60;
      } else if (unit.startsWith('hour')) {
        return Number(value) * 3600;
      } else {
        return 0;  // Or throw an error, etc.
      }
    }
    
// Function to handle new positions
function handleNewPositions(newPositions, timestampKey) {
  if (Array.isArray(newPositions)) {
    setPositions(prevPositions => {
      const prevPositionsMap = new Map(prevPositions.map(pos => [pos._id, pos]));

      const existingPositionIds = new Set(prevPositions.map(pos => pos._id));

      const updatedPositions = newPositions
        .filter(newPos => !existingPositionIds.has(newPos._id))
        .map(newPos => {
          const oldPos = prevPositionsMap.get(newPos._id);
          if (oldPos) {
            return oldPos;
          } else {
            const elapsedTime = calculateElapsedTime(newPos[timestampKey]);
            return { ...newPos, elapsedTime };
          }
        });

      // Concatenate the new positions with the old ones
      const combinedPositions = [...prevPositions, ...updatedPositions];

      // Sort positions array in descending order by elapsedTime
      const sortedPositions = combinedPositions.sort((a, b) =>
        elapsedTimeInSeconds(a.elapsedTime) - elapsedTimeInSeconds(b.elapsedTime)
      );

      return sortedPositions;
    });
    setIsLoading(false);
  } else {
    console.error('Received data is not an array:', newPositions);
  }
}


    socket.on('latestPositionsFutures', (newPositions: PositionFutures[]) => {
      handleNewPositions(newPositions, 'timestamp');
    });
    
    socket.on('latestPositions', (newPositions: Position[]) => {
      handleNewPositions(newPositions, 'expirationTime');
    });

    socket.on('newPosition', (newPosition: Position) => {
      setPositions(prevPositions => {
        // Calculate elapsed time for the new position
        const currentTime = Math.floor(Date.now() / 1000);
        const timeElapsed = currentTime - newPosition.expirationTime;
        const seconds = Math.floor(timeElapsed);
        const minutes = Math.floor(timeElapsed / 60);
        const hours = Math.floor(minutes / 60);
        let elapsedTime = "";
        if (hours > 0) {
          elapsedTime = `${hours} ${hours > 1 ? "hours" : "hour"} ago`;
        } else if (minutes > 0) {
          elapsedTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
        } else {
          elapsedTime = `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
        }
    
        // Prepare new positions array with the new position at the beginning
        const newPositions = [{...newPosition, elapsedTime}, ...prevPositions];
    
        // Limit the length of the positions array to 100
        if (newPositions.length > 15) {
          newPositions.pop();  // Remove the last element of the array (oldest position)
        }
    
        return newPositions;
        
      });
    });

    socket.on('newPositiones', (newPosition: PositionFutures) => {
    
      setPositions(prevPositions => {
        // Calculate elapsed time for the new position
        handleNewPositions(newPosition, 'timestamp');
    
        // Prepare new positions array with the new position at the beginning
        const newPositions = [{...newPosition}, ...prevPositions];
    
        // Limit the length of the positions array to 100
        if (newPositions.length > 15) {
          newPositions.pop();  // Remove the last element of the array (oldest position)
        }
    
        return newPositions;
        
      });
    });
        
    

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prevPositions) => {
        if (Array.isArray(prevPositions)) {
          return prevPositions.map((pos) => {
            const currentTime = Math.floor(Date.now() / 1000);
            let timeValue: number;
            
            if ('expirationTime' in pos) {
              timeValue = pos.expirationTime;
            } else if ('timestamp' in pos) {
              timeValue = pos.timestamp;
            } else {
              console.error('Invalid position object:', pos);
              return pos;
            }
            
            const timeElapsed = currentTime - timeValue;
      
            const seconds = Math.floor(timeElapsed);
            const minutes = Math.floor(timeElapsed / 60);
            const hours = Math.floor(minutes / 60);
            
            let elapsedTime = "";
            if (hours > 0) {
              elapsedTime = `${hours} ${hours > 1 ? "hours" : "hour"} ago`;
            } else if (minutes > 0) {
              elapsedTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
            } else {
              elapsedTime = `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
            }
      
            return {
              ...pos,
              elapsedTime,
            };
          });
        } else {
          console.error('Invalid previous positions:', prevPositions);
          return prevPositions;
        }
      });
          }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  

    return (
      <div
        className="font-poppins w-full flex flex-col overflow-hidden h-full md:overflow-y-scroll  custom-scrollbar  order-5 xl:order-3 lg:order-3 md:order-5 rounded-lg bg-layer-1 p-4 border-t border-b md:border border-layer-3 flex bg-layer-1"
      >
        <div className="sticky top-0 flex items-center z-10">
          <h2 className="bankGothic leading-[18px] text-xl text-start text-grey-text">Recent Predictions</h2>
        </div>
      
        {isLoading ? (
          <div className="flex justify-center items-center w-full flex-grow">
            <HashLoader color="#1a1a25" />
          </div>
        ) : (
          <div className="custom-scrollbar flex flex-col overflow-auto ">
            <div className="sticky top-0 bg-layer-1 flex z-10 pt-2">
          <div className="w-[25%] text-sm leading-[12px] text-grey-text py-2 ">User</div>
          <div className="w-[27%] text-sm leading-[12px] text-grey-text py-2"></div>
          <div className="w-[25%] text-sm leading-[12px] text-grey-text py-2">Lvg</div>
          <div className="w-[25%] text-sm leading-[12px] text-grey-text py-2">PnL</div>
          <div className="w-[17%] text-sm leading-[12px] text-grey-text py-2">ROI</div>
        </div>  
          <FlipMove>
            {Array.isArray(positions) && positions.map((item, i) => {
                let profit = 0;
  if ('binaryOption' in item) {

    if (item.priceDirection === 0 && item.finalPrice > item.initialPrice) {
      profit = (item.payout - item.betAmount) / LAMPORTS_PER_SOL;
    } else if (item.priceDirection === 0 && item.finalPrice < item.initialPrice) {
      profit = -item.betAmount / LAMPORTS_PER_SOL;
    } else if (item.priceDirection !== 0 && item.finalPrice < item.initialPrice) {
      profit = (item.payout - item.betAmount) / LAMPORTS_PER_SOL;
    } else if (item.priceDirection !== 0 && item.finalPrice > item.initialPrice) {
      profit = -item.betAmount / LAMPORTS_PER_SOL;
    }} 
    else if ('futuresContract' in item) {
      // profit for PositionFutures is already calculated
      profit = item.pnl/LAMPORTS_PER_SOL;
    }

    let value = 'binaryOption' in item ? profit : profit;
    value = Number(value); 

    let percentage = 'binaryOption' in item ? ((profit / (item.betAmount / LAMPORTS_PER_SOL)) * 100) : (((item.pnl) / item.betAmount) * 100);
percentage = Number(percentage);

  
              return (
                <div key={item._id} className={`shadow-lg flex text-[0.9rem] rounded my-1.5  ${profit > 4.99 && profit > 0 ? "text-slate-300" : "text-slate-300"}`}>
                  <div className="w-[40%] py-1">
                    <a
                      href={`https://solscan.io/account/${'binaryOption' in item ? item.playerAcc : item.playerAcc}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      <div className="flex items-center">
                      {item.symbol === 0 ?
    <img src="/Sol1.png" alt="Logo" width="24" height="24" className="pb-1"/> :
  item.symbol === 1 ?
    <img src="/Btc1.png" alt="Logo" width="24" height="24" className="pb-1" /> : 
    item.symbol === 2 ?
    <img src="/Coin1.png" alt="Logo" width="24" height="24" className="pb-1" /> : 
    item.symbol === 3 ?
    <img src="/Bonk2.png" alt="Logo" width="24" height="24" className="pb-1" /> : 
  null
  }
                        <p className="ml-2 text-grey-text">{`${'binaryOption' in item ? item.playerAcc.slice(0, 2) : item.playerAcc.slice(0, 2)}..${'binaryOption' in item ? item.playerAcc.slice(-2) : item.playerAcc.slice(-2)}`}</p>
                      </div>
                    </a>
                  </div>
                  <div className="w-[9%] flex justify-start items-start text-left">
                    {item.priceDirection === 0 ? (
                                      <img
                                      className="relative w-8 h-8"
                                      alt=""
                                      src="/new/component-82.svg"
                                    />
                    ) : (
                      <img
                      className="relative w-8 h-8"
                      alt=""
                      src="/new/component-81.svg"
                    />
                    )}
                  </div>
                  <div className="w-[25%] flex items-center text-white">{'binaryOption' in item ? 'BIN' : `${item.leverage}X`}</div>
                  <div className={`w-[25%] flex items-center text-right ${value < 0 ? 'negative text-red-500' : 'text-[#34c796]'}`}>
                    {value.toFixed(2)}
                  </div>
                  <div className={`w-[17%] flex items-center text-right pr-2 ${percentage < 0 ? 'negative text-red-500' : 'text-[#34c796]'}`}>
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </FlipMove>
        </div>
      )}
    </div>
  );
  
};
export default RecentPredictions;