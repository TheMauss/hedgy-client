import { FC, useEffect, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import socketIOClient from 'socket.io-client';
import { FaAngleUp, FaAngleDown, FaWallet, FaStream } from 'react-icons/fa';
import { notify } from "../utils/notifications";

const ENDPOINT = 'https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/'
const ENDPOINT2 = 'https://fast-tundra-88970.herokuapp.com/'



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

interface MyPositionsProps {
  latestOpenedPosition: Record<string, Position | null>;
  setLatestOpenedPosition: React.Dispatch<React.SetStateAction<Record<string, Position | null>>>;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const ITEMS_PER_PAGE = 10;

const MyPositions: FC<MyPositionsProps> = ({ latestOpenedPosition, setLatestOpenedPosition }) => {
  const [position, setPosition] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [resolvedPositions, setResolvedPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { publicKey, connected } = useWallet(); // Add connected variable
  const walletAddress = publicKey?.toString() || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const symbolMap = {
    0: "Crypto.SOL/USD",
    1: "Crypto.BTC/USD"
    // Add more symbols as needed
  };

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit('registerWallet', walletAddress);

    socket.on('positions', (positions: Position[]) => {
      const unresolvedPositions = positions.filter((position) => !position.resolved);
      const resolvedPositions = positions.filter((position) => position.resolved);
    
      setLatestOpenedPosition((prevPositions) => {
        const updatedPositions: Record<string, Position | null> = { ...prevPositions };
        
        unresolvedPositions.forEach((position) => {
          updatedPositions[position.symbol.toString()] = position;
        });
        
        return updatedPositions;
      });
      
      setPositions(unresolvedPositions);
      setResolvedPositions(resolvedPositions);
      setIsLoading(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    const socket2 = socketIOClient(ENDPOINT2);
    socket2.emit('registerWallet', walletAddress);
    socket2.on('position', (updatedPosition: Position, latestPrice: number) => {
      setPreviousPrice(latestPrice);

      setPositions((prevState) => {
        const positionExists = prevState.some((position) => position._id === updatedPosition._id);

        if (positionExists) {
          // Update the remaining time for the updated position
          const updatedPositions = prevState.map((position) =>
            position._id === updatedPosition._id
              ? { ...updatedPosition, currentPrice: latestPrice, remainingTime: calculateRemainingTime(updatedPosition.expirationTime) }
              : position
          );
          notify({ type: 'success', message: `Option resolved`, description: `Your option ${updatedPosition.binaryOption.slice(0, 4)}...${updatedPosition.binaryOption.slice(-4)} has been resolved.` });
          return updatedPositions;
        } else {
          // Calculate the remaining time for all positions, including the new one
          const updatedPositions = prevState.map((position) => ({
            ...position,
            remainingTime: calculateRemainingTime(position.expirationTime),
          }));
          updatedPosition.remainingTime = calculateRemainingTime(updatedPosition.expirationTime);
          notify({ type: 'success', message: `Option created`, description: `A new option ${updatedPosition.binaryOption.slice(0, 4)}...${updatedPosition.binaryOption.slice(-4)} has been created with entry price: ${(updatedPosition.initialPrice/100000000).toFixed(3)} USD` });

          setLatestOpenedPosition((prevPositions) => {
            const updatedPositions = {
              ...prevPositions,
              [updatedPosition.symbol.toString()]: { ...updatedPosition, currentPrice: latestPrice },
            };
            return updatedPositions;
          });

          return [{ ...updatedPosition, currentPrice: latestPrice }, ...updatedPositions];
        }
      });

      // Update the resolved positions array if needed
      if (updatedPosition.resolved) {
        setResolvedPositions((prevState) => [...prevState, updatedPosition]);
        setPositions((prevState) => prevState.filter((position) => position._id !== updatedPosition._id));
      
        setLatestOpenedPosition((prevPositions) => {
          if (prevPositions[updatedPosition.symbol.toString()]?._id === updatedPosition._id) {
            return { ...prevPositions, [updatedPosition.symbol.toString()]: updatedPosition };
          } else {
            return prevPositions;
          }
        });
      }
    });

        socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });



// Listener for 'priceUpdate' event
socket2.on('priceUpdate', (updatedPrices) => {

  setPositions((positions) =>
    positions.map((pos) => {
      const symbol = symbolMap[pos.symbol];
      const updatedPrice = updatedPrices.find((price) => price.symbol === symbol);

      if (updatedPrice) {
        const currentPrice = updatedPrice.price;
        return {
          ...pos,
          currentPrice,
        };
      } else {
        return pos;
      }
    })
  );

  setPreviousPrice((previousPrice) => {
    const previousSymbol = symbolMap[previousPrice];
    const updatedPrice = updatedPrices.find((price) => price.symbol === previousSymbol);
    return updatedPrice ? updatedPrice.price : (previousPrice || 0);
  });
});



// Disconnect the socket when the component unmounts
return () => {
  socket.disconnect();
};
}, [walletAddress]);

  const selectPosition = () => {
    setPosition(true);
  };

  const selectHistory = () => {
    setPosition(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPositions((positions) =>
        positions.map((position) => ({
          ...position,
          remainingTime: calculateRemainingTime(position.expirationTime),
        }))
      );

      setResolvedPositions((resolvedPositions) =>
        resolvedPositions.map((position) => ({
          ...position,
          remainingTime: calculateRemainingTime(position.expirationTime),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateRemainingTime = (expirationTime: number): string => {
    const remainingTime = expirationTime - Math.floor(Date.now() / 1000);
    if (remainingTime <= 0) {
      return 'Expired';
    } else if (remainingTime <= 60) {
      return `${remainingTime} seconds`;
    } else if (remainingTime <= 3600) {
      return `${Math.floor(remainingTime / 60)} minutes`;
    } else {
      return `${Math.floor(remainingTime / 3600)} hours`;
    }
  };

  const calculateRemainingTimeInSeconds = (timeStr: string | undefined): number => {
    if (!timeStr) {
      return 0; // Return a default value, or handle the case based on your requirements
    }
    if (timeStr === 'Expired') {
      return 0;
    } else {
      const value = parseInt(timeStr);
      if (timeStr.includes('seconds')) {
        return value;
      } else if (timeStr.includes('minutes')) {
        return value * 60;
      } else if (timeStr.includes('hours')) {
        return value * 3600;
      } else {
        throw new Error('Unrecognized timeStr format');
      }
    }
  };

  const totalPages = Math.ceil(resolvedPositions.length / ITEMS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  const renderPositions = (positionsToRender: Position[]) => {
    const unresolvedPositions = positionsToRender.filter((item) => !item.resolved);
    // Reverse the array to show positions from newest to oldest
    unresolvedPositions.sort((a, b) => {
      const aRemainingTime = calculateRemainingTimeInSeconds(a.remainingTime);
      const bRemainingTime = calculateRemainingTimeInSeconds(b.remainingTime);
      return aRemainingTime - bRemainingTime;
    });

    return (
      <tbody>
        {unresolvedPositions.map((item, index) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.currentPrice
                ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.currentPrice
              ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
              : -item.betAmount / LAMPORTS_PER_SOL;

          const isEvenRow = index % 2 === 0;
          const rowStyle = { backgroundColor: isEvenRow ? '#232332' : '#1a1a25' };
          const timeStr = item.remainingTime || '';

          return (
            <tr key={item._id} style={rowStyle}>
              <td className="w-1/5 text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 lg:pl-5 md:pl-5 sm:pl-2 pl-2 " colSpan={2}>
                <a
                  href={`https://solscan.io/account/${item.binaryOption}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="flex items-center">
  {item.symbol === 0 ?
    <img src="/sol.png" alt="Logo" width="24" height="24" /> :
  item.symbol === 1 ?
    <img src="/Bitcoin.png" alt="Logo" width="24" height="24" /> : 
  null
  }
  <p className="ml-2">{`${item.binaryOption.slice(0, 4)}...${item.binaryOption.slice(-4)}`}</p> 
  </div>
                </a>
              </td>
              <td className="w-1/6 text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
                <p>{(item.initialPrice / 100000000).toFixed(3)}</p>
              </td>
              <td className="w-1/6 text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
<p>{item.symbol === 1 ? (item.currentPrice / 100000000).toFixed(1) : (item.currentPrice / 100000000).toFixed(3)}</p>              </td>
              <td className="w-1/6 text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
                <p className={item.priceDirection === 0 ? 'text-green-600 ' : 'text-red-500'}>
                  <div className="flex items-center">
                    {item.priceDirection === 0 ? (
                      <>
                        <FaAngleUp className="text-green-600" />
                        <span className="ml-1">Pump</span>
                      </>
                    ) : (
                      <>
                        <FaAngleDown className="text-red-500" />
                        <span className="ml-1">Dump</span>
                      </>
                    )}
                  </div>
                </p>
              </td>
              <td className="w-1/6 text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
                <p>{timeStr}</p>
              </td>
              <td className="w-1/6 text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5">
                <p className={pnl >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                  {pnl.toFixed(2)} SOL
                </p>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  const renderHistoryPositions = () => {
    const resolvedPositionsToShow = resolvedPositions.filter((position) => position.resolved);
    // Reverse the array to show positions from newest to oldest
    resolvedPositionsToShow.reverse();

    // Calculate start and end indices for the slice of data you want to display
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Get only the data for the current page
    const currentPageData = resolvedPositionsToShow.slice(startIndex, endIndex);
    return (
      <tbody>
        {currentPageData.map((item, index) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.finalPrice
                ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.finalPrice
              ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
              : -item.betAmount / LAMPORTS_PER_SOL;

          const date = new Date(item.expirationTime * 1000);
          const formattedDate = date.toLocaleDateString(undefined, {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          const isEvenRow = index % 2 === 0;
          const rowStyle = { backgroundColor: isEvenRow ? '#232332' : '#1a1a25' };

          return (
            <tr key={item._id} style={rowStyle} >
              <td className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] font-semibold pb-1.5 pt-1.5 lg:pl-5 md:pl-5 sm:pl-2 pl-2" colSpan={2}>
                <a
                  href={`https://solscan.io/account/${item.binaryOption}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="flex items-center">
  {item.symbol === 0 ?
    <img src="/sol.png" alt="Logo" width="24" height="24" /> :
  item.symbol === 1 ?
    <img src="/Bitcoin.png" alt="Logo" width="24" height="24" /> : 
  null
  }
  <p className="ml-2">{`${item.binaryOption.slice(0, 4)}...${item.binaryOption.slice(-4)}`}</p> 
</div>   
                </a>
              </td>
              <td className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] font-semibold pb-1.5 pt-1.5 ">
              <p>{item.symbol === 1 ? (item.initialPrice / 100000000).toFixed(1) : (item.initialPrice / 100000000).toFixed(3)}</p>              
              </td>
              <td className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem]  font-semibold pb-1.5 pt-1.5 ">
              <p>{item.symbol === 1 ? (item.finalPrice / 100000000).toFixed(1) : (item.finalPrice / 100000000).toFixed(3)}</p>              
                </td>
              <td className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] font-semibold pb-1.5 pt-1.5 ">
                <p className={item.priceDirection === 0 ? 'font-semibold text-green-500' : 'font-semibold text-red-500'}>
                  <div className="flex items-center">
                    {item.priceDirection === 0 ? (
                      <>
                        <FaAngleUp className="text-green-600" />
                        <span className="ml-1">Pump</span>
                      </>
                    ) : (
                      <>
                        <FaAngleDown className="text-red-500" />
                        <span className="ml-1">Dump</span>
                      </>
                    )}
                  </div>
                </p>
              </td>
              <td className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem]  font-semibold pb-1.5 pt-1.5 ">
                <p>{formattedDate}</p>
              </td>
              <td className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem]   font-semibold pb-1.5 pt-1.5 ">
                <p className={pnl >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                  {pnl.toFixed(2)} SOL
                </p>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  if (!connected) {
    return (
      <div className="custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] overflow-y-auto lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
        <div>
          <span
            className={`text-lg transition-colors duration-300 ease-in-out ${
              position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
            } ${position ? '' : 'text-gray-500'} ml-4`}
            onClick={selectPosition}
          >
            My Positions
          </span>
          <span
            className={`text-lg transition-colors duration-300 ease-in-out ${
              !position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
            } ${!position ? '' : 'text-gray-500'} ml-4`}
            onClick={selectHistory}
          >
            My History
          </span>
        </div>
        <div className="flex flex-col items-center justify-center md:h-[18vh] h-[225px]">
  <FaWallet className="text-4xl text-slate-300 mb-2" />
  <div className="text-[0.95rem] text-slate-300 font-semibold text-center">
    Connect your wallet to see your positions.
  </div>
</div>

      </div>
    );
  } else if (positions.length === 0 && resolvedPositions.length === 0) {
    return (
      <div className="custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] overflow-y-auto lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
        <div>
          <span
            className={`text-lg transition-colors duration-300 ease-in-out ${
              position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
            } ${position ? '' : 'text-gray-500'} ml-4`}
            onClick={selectPosition}
          >
            My Positions
          </span>
          <span
            className={`text-lg transition-colors duration-300 ease-in-out ${
              !position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
            } ${!position ? '' : 'text-gray-500'} ml-4`}
            onClick={selectHistory}
          >
            My History
          </span>
        </div>
        <div className="flex flex-col items-center justify-center md:h-[18vh] h-[225px]">
          <FaStream className="text-4xl text-slate-300 mb-2" />
          <p className="text-[0.95rem] text-slate-300 font-semibold text-center">
          You don&apos;t have any opened positions yet.
          </p>
        </div>
      </div>
    );
  } else if ( positions.length === 0 && resolvedPositions.length !== 0 ) {
    
    return (
      <div className="custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] overflow-y-auto lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
        <div>
          <span
            className={`text-lg transition-colors duration-300 ease-in-out ${
              position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
            } ${position ? '' : 'text-gray-500'} ml-4`}
            onClick={selectPosition}
          >
            My Positions
          </span>
          <span
            className={`text-lg transition-colors duration-300 ease-in-out ${
              !position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
            } ${!position ? '' : 'text-gray-500'} ml-4`}
            onClick={selectHistory}
          >
            My History
          </span>
        </div>
        {position ? (
          <div className="flex flex-col items-center justify-center md:h-[18vh] h-[225px]">
            <FaStream className="text-4xl text-slate-300 mb-2" />
            <p className="text-[0.95rem] text-slate-300 font-semibold text-center">
  You don&apos;t have any opened positions yet.
</p>

          </div>
        ) : (
          <table className="w-full mt-2 w-[100%] bg-[#232332] text-[0.9rem] xl:text-[1rem] lg:text-[1rem] md:text-[1rem] sm:text-[0.9rem] overflow-x-hidden overflow-y-auto">
            <thead>
              <tr>
                <th className="w-1/5 text-start font-semibold pb-1.5 lg:pl-5 md:pl-5 sm:pl-2 pl-2" colSpan={2}>
                  Option
                </th>
                <th className="w-1/6  text-start font-semibold pb-1.5">
                  Initial Price
                </th>
                <th className="w-1/6  text-start font-semibold pb-1.5">
                  {position ? 'Actual Price' : 'Expiration Price'}
                </th>
                <th className="w-1/6  text-start font-semibold pb-1.5">Direction</th>
                <th className="w-1/6  text-start font-semibold pb-1.5">
                  Expiration Time
                </th>
                <th className="w-1/6  text-start font-semibold pb-1.5">PnL</th>
              </tr>
            </thead>
            {renderHistoryPositions()}
          </table>
        )}
        {position ? null : (
          <div className="flex justify-end mt-1 text-[0.95rem] xl:text-[1rem] lg:text-[1rem] md:text-[1rem] sm:text-[0.95rem]">
            <button
              className="text-slate-300 font-semibold rounded bg-transparent mr-2"
              onClick={firstPage}
              disabled={currentPage === 1}
            >
              &lt;&lt;
            </button>
            <button
              className="text-slate-300 font-semibold rounded bg-transparent mr-2"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span className="text-slate-300 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="text-slate-300 font-semibold rounded bg-transparent px-2"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
            <button
              className="text-slate-300 font-semibold rounded bg-transparent mr-2"
              onClick={lastPage}
              disabled={currentPage === totalPages}
            >
              &gt;&gt;
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] lg:h-[26vh] md:h-[28vh] overflow-x-hidden overflow-y-auto lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
      <div>
        <span
          className={`text-lg transition-colors duration-300 ease-in-out ${
            position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
          } ${position ? '' : 'text-gray-500'} ml-4`}
          onClick={selectPosition}
        >
          My Positions
        </span>
        <span
          className={`text-lg transition-colors duration-300 ease-in-out ${
            !position ? 'font-bold cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-slate-300 font-semibold'
          } ${!position ? '' : 'text-gray-500'} ml-4`}
          onClick={selectHistory}
        >
          My History
        </span>
      </div>

      <table className="w-full mt-2 w-[100%] bg-[#232332] text-[0.9rem] xl:text-[1rem] lg:text-[1rem] md:text-[1rem] sm:text-[0.9rem] overflow-x-hidden overflow-y-auto">
        <thead>
          <tr>
            <th className="w-1/5 text-start font-semibold  pb-3 lg:pl-5 md:pl-5 sm:pl-2 pl-2" colSpan={2}>
              Option
            </th>
            <th className="w-1/6 text-start font-semibold  pb-3 ">
              Initial Price
            </th>
            <th className="w-1/6 text-start font-semibold  pb-3">
              {position ? 'Actual Price' : 'Expiration Price'}
            </th>
            <th className="w-1/6 text-start font-semibold  pb-3 ">Direction</th>
            <th className="w-1/6 text-start font-semibold  pb-3 ">
              Expiration Time
            </th>
            <th className="w-1/6 text-start font-semibold  pb-3 ">PnL</th>
          </tr>
        </thead>
        {position ? renderPositions(positions) : renderHistoryPositions()}
      </table>

      {position ? null : (
        <div className="flex justify-end mt-1 text-[0.95rem]">
          <button
            className="text-slate-300 font-semibold rounded bg-transparent mr-2"
            onClick={firstPage}
            disabled={currentPage === 1}
          >
            &lt;&lt;
          </button>
          <button
            className="text-slate-300 font-semibold rounded bg-transparent mr-2"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span className="text-slate-300 font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="text-slate-300 font-semibold rounded bg-transparent px-2"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
          <button
            className="text-slate-300 font-semibold rounded bg-transparent mr-2"
            onClick={lastPage}
            disabled={currentPage === totalPages}
          >
            &gt;&gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPositions;
