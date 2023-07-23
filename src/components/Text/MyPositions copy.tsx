import { FC, useEffect, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';

interface Position {
  _id: string;
  binaryOption: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  expiration: number;
  expirationTime: number;
  resolved: boolean;
  winner: string | null;
  finalPrice: number;
  currentPrice: number;
  remainingTime: string; // Add remainingTime property
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const ITEMS_PER_PAGE = 10;

const MyPositions: FC = () => {
  const [position, setPosition] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [resolvedPositions, setResolvedPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString() || '';
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit('registerWallet', walletAddress);
    
// Listen for initial positions
socket.on('positions', (data: Position[]) => {
  const unresolvedPositions = data.filter((position) => !position.resolved);
  unresolvedPositions.forEach(position => position.remainingTime = calculateRemainingTime(position.expirationTime));
  const resolvedPositions = data.filter((position) => position.resolved);
  resolvedPositions.forEach(position => position.remainingTime = calculateRemainingTime(position.expirationTime));

  setPositions(unresolvedPositions);
  setResolvedPositions(resolvedPositions);
  setIsLoading(false);
});

// Listen for position updates
socket.on('positions', (updatedPositions: Position[]) => {
  const unresolvedPositions = updatedPositions.filter((position) => !position.resolved);
  const resolvedPositions = updatedPositions.filter((position) => position.resolved);
  setPositions(unresolvedPositions);
  setResolvedPositions(resolvedPositions);
});

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });
    // Listener for 'priceUpdate' event
    socket.on('priceUpdate', (price: number) => {
      setPositions(positions => positions.map(pos => ({
        ...pos,
        currentPrice: price
      })));
    });

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
      setPositions(positions => positions.map(position => ({
        ...position,
        remainingTime: calculateRemainingTime(position.expirationTime)
      })));
  
      setResolvedPositions(resolvedPositions => resolvedPositions.map(position => ({
        ...position,
        remainingTime: calculateRemainingTime(position.expirationTime)
      })));
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

  const calculateRemainingTimeInSeconds = (timeStr: string): number => {
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
        {unresolvedPositions.map((item) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.currentPrice
                ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.currentPrice
              ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
              : -item.betAmount / LAMPORTS_PER_SOL;
  
              const timeStr = item.remainingTime || '';
          return (
            <tr key={item._id}>
              <td className="pb-4" colSpan={2}>
                <p>{item.binaryOption}</p>
              </td>
              <td className="pb-4">
                <p>{(item.initialPrice / 100000000).toFixed(3)}</p>
              </td>
              <td className="pb-4">
                <p>{(item.currentPrice / 100000000).toFixed(3)}</p>
              </td>
              <td className="pb-4">
                <p className={item.priceDirection === 0 ? "text-green-600" : "text-red-500"}>
                  {item.priceDirection === 0 ? "Pump" : "Dump"}
                </p>
              </td>
              <td className="pb-4">
                <p>{timeStr}</p>
              </td>
              <td className="pb-4">
                <p>{pnl.toFixed(2)} SOL</p>
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
        {currentPageData.map((item) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.finalPrice
                ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.finalPrice
              ? (item.betAmount * 1.8) / LAMPORTS_PER_SOL
              : -item.betAmount / LAMPORTS_PER_SOL;

            const remainingTime = (item.expirationTime - Math.floor(Date.now() / 1000)) ;
          let timeStr = '';
          if (remainingTime <= 0) {
            timeStr = 'Expired';
          }
          

          return (
            <tr key={item._id}>
              <td className="pb-4" colSpan={2}>
                <p>{item.binaryOption}</p>
              </td>
              <td className="pb-4">
                <p>{(item.initialPrice / 100000000).toFixed(3)}</p>
              </td>
              <td className="pb-4">
                <p>{(item.finalPrice / 100000000).toFixed(3)}</p>
              </td>
              <td className="pb-4">
  <p className={item.priceDirection === 0 ? "text-green-500" : "text-red-500"}>
    {item.priceDirection === 0 ? "Pump" : "Dump"}
  </p>
</td>
              <td className="pb-4">
                <p>{timeStr}</p>
              </td>
              <td className="pb-4">
                <p>{pnl.toFixed(2)} SOL</p>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <div className="custom-scrollbar w-full order-2 md:order-3 h-[250px] overflow-y-hidden lg:overflow-y-auto bg-[#232332] pl-3 pr-5 py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
      <div>
        <span
          className={`text-lg ${position ? "font-bold" : "font-medium"} cursor-pointer`}
          onClick={selectPosition}
        >
          My Positions
        </span>
        <span
          className={`text-lg ${!position ? "font-bold" : "font-medium"} cursor-pointer ml-4`}
          onClick={selectHistory}
        >
          My History
        </span>
      
      </div>

      <table className="w-full mt-3 min-w-[700px]">
        <thead>
          <tr>
            <th className="text-start font-medium pb-3" colSpan={2}>
              Option
            </th>
            <th className="text-start font-medium pb-3">
              Initial Price
            </th>
            <th className="text-start font-medium pb-3">
              Actual Price
            </th>
            <th className="text-start font-medium pb-3">Direction</th>
            <th className="text-start font-medium pb-3">
              Expiration Time
            </th>
            <th className="text-start font-medium pb-3">PnL</th>
          </tr>
          
        </thead>
        {position ? renderPositions(positions) : renderHistoryPositions()}
      </table>

      {position ? (
 null ) : <div className="flex justify-end mt-4">
      <button
        className="px-2 py-1 rounded bg-transparent text-white mr-2"
        onClick={firstPage}
        disabled={currentPage === 1}
      >
        &lt;&lt;
      </button>
      <button
        className="px-2 py-1 rounded bg-transparent text-white mr-2"
        onClick={prevPage}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      <span className="text-white mr-2">
      Page {currentPage} of {totalPages}
    </span>
      <button
        className="px-2 py-1 rounded bg-transparent text-white mr-2"
        onClick={nextPage}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
      <button
        className="px-2 py-1 rounded bg-transparent text-white mr-2"
        onClick={lastPage}
        disabled={currentPage === totalPages}
      >
        &gt;&gt;
      </button>
    </div>}
    </div>
  );
};

export default MyPositions;
