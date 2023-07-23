import { FC, useEffect, useState } from "react";
import socketIOClient from 'socket.io-client';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import HashLoader from "react-spinners/HashLoader";
import { FaSortAmountDown } from 'react-icons/fa';
import Identicon from 'identicon.js';


const ENDPOINT = 'https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/'
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
    const socket = socketIOClient(ENDPOINT);
    socket.on('connect', () => {
      console.log('connected to the server');
    });

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
  console.log("Received array:", newPositions); // Logs the received array
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
      console.log('Received latestPositionsFutures event', newPositions);
      handleNewPositions(newPositions, 'timestamp');
    });
    
    socket.on('latestPositions', (newPositions: Position[]) => {
      console.log('Received latestPositions event', newPositions);
      handleNewPositions(newPositions, 'expirationTime');
    });

    socket.on('newPosition', (newPosition: Position) => {
      console.log('New position: ', newPosition);
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
    
    

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
}, []);

useEffect(() => {
  console.log("positions", positions);  // Logs the updated positions state
}, [positions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prevPositions) => {
        if (Array.isArray(prevPositions)) {
          console.log("array",positions); // Logs the entire array
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
    <div style={{height: divHeight}}
    className="xl:min-h-[510px] lg:min-h-[510px] lg:max-h-[800px] sm:max-h-[300px] md:max-h-[300px] max-h-[400px] md:overflow-y-scroll overflow-hidden mt-2 xl:mt-0 lg:mt-0 custom-scrollbar w-full md:w-[49.65%] xl:w-[19%] lg:w-[19%] min-w-[270px] order-5 xl:order-3 lg:order-3 md:order-5 overflow-auto rounded bg-[#232332] py-3 shadow-component border-t-2 border-gray-500 mt-2">
      <div className="flex items-center pl-3 mb-2">
      <FaSortAmountDown className="text-slate-300"/>
  <h2 className="pl-2 font-semibold text-lg text-start">Recent Predictions</h2>
  
</div>

      {isLoading ? (
        <div className="mt-20 mb-16 flex justify-center items-center">
          <HashLoader color="#1a1a25" />
        </div>
      ) : (
        <TransitionGroup>
          {Array.isArray(positions) &&
positions.map((item, i) => {
  let profit = 0;
  console.log(item);
  if ('binaryOption' in item) {
  
              if (item.priceDirection === 0 && item.finalPrice > item.initialPrice) {
                profit = 1.8 * item.betAmount / LAMPORTS_PER_SOL;
              } else if (item.priceDirection === 0 && item.finalPrice < item.initialPrice) {
                profit = -item.betAmount / LAMPORTS_PER_SOL;
              } else if (item.priceDirection !== 0 && item.finalPrice < item.initialPrice) {
                profit = 1.8 * item.betAmount / LAMPORTS_PER_SOL;
              } else if (item.priceDirection !== 0 && item.finalPrice > item.initialPrice) {
                profit = -item.betAmount / LAMPORTS_PER_SOL;
              }} 
              else if ('futuresContract' in item) {
                // profit for PositionFutures is already calculated
                profit = item.pnl/LAMPORTS_PER_SOL;
              }
  
              const isEvenRow = i % 2 === 0;
              const rowStyle = { backgroundColor: isEvenRow ? '#232332' : '#1a1a25' };
  

              if ('binaryOption' in item) {
              return (
                <CSSTransition
                  key={`${item.playerAcc}-${i}`}
                  timeout={500}
                  classNames="prediction"
                >
<div style={rowStyle} className={`flex flex-col items-start justify-between`}>
  <div className={`mt-1 pl-3 font-semibold flex items-center justify-start flex-grow ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}>
    <p className="text-[0.84rem] font-semibold pr-3">
      <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "font-semibold gradient-text" : ""}`}>
        {item.binaryOption.slice(0, 3)}...{item.binaryOption.slice(-3)} predicted{" "}
        <span
          className={` ${profit > 4.99 && profit > 0 ? "gradient-text" : item.priceDirection === 0 ? "text-green-500" : "text-red-500"}`}
        >
          {item.priceDirection === 0 ? "pump" : "dump"}
        </span>{" "}
        {profit > 0 ? (
          <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-green-500"}`}>
            <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}> and </span> bagged {profit.toFixed(2)} SOL
          </span>
        ) : (
          <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-red-500"}`}>
            <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}> and </span>lost {Math.abs(profit).toFixed(2)} SOL
          </span>
        )}
      </span>
    </p>
  </div>
  <div className={`font-semibold self-end flex items-end justify-end ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}>
    <p className={`mb-2 pr-3 text-[0.7rem] overflow-hidden whitespace-nowrap text-right overflow-ellipsis ml-1 ${profit > 4.99 && profit > 0 ? "gradient-text1" : ""}`}>
      {item.elapsedTime}
    </p>
  </div>
</div>

                </CSSTransition>
              );
            } else if ('futuresContract' in item) {
              return (
                <CSSTransition
                  key={`${item.playerAcc}-${i}`}
                  timeout={500}
                  classNames="prediction"
                >
             <div style={rowStyle} className={`flex flex-col items-start justify-between`}>
  <div className={`mt-1 pl-3 font-semibold flex items-center justify-start flex-grow ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}>
    <p className="text-[0.84rem] font-semibold pr-3">
      <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "font-semibold gradient-text" : ""}`}>
      {item.futuresContract.slice(0, 3)}...{item.futuresContract.slice(-3)} predicted{" "}
        <span
          className={` ${profit > 4.99 && profit > 0 ? "gradient-text" : item.priceDirection === 0 ? "text-green-500" : "text-red-500"}`}
        >
          {item.priceDirection === 0 ? "pump" : "dump"}
        </span>{" "}
        {profit > 0 ? (
          <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-green-500"}`}>
            <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}> and </span> bagged {profit.toFixed(2)} SOL
          </span>
        ) : (
          <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-red-500"}`}>
            <span className={`font-semibold ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}> and </span>lost {Math.abs(profit).toFixed(2)} SOL
          </span>
        )}
      </span>
    </p>
  </div>
  <div className={`font-semibold self-end flex items-end justify-end ${profit > 4.99 && profit > 0 ? "gradient-text" : "text-slate-300"}`}>
    <p className={`mb-2 pr-3 text-[0.7rem] overflow-hidden whitespace-nowrap text-right overflow-ellipsis ml-1 ${profit > 4.99 && profit > 0 ? "gradient-text1" : ""}`}>
      {item.elapsedTime}
    </p>
  </div>
</div>

                </CSSTransition>
              );
            }
          })}
        </TransitionGroup>
      )}

      {error && (
        <div className="mt-20 mb-16 flex justify-center items-center text-red-500">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};
export default RecentPredictions;