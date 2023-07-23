import { FC, useEffect, useState,useRef } from "react";
import { useConnection,useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, TransactionSignature, PublicKey} from '@solana/web3.js';
import socketIOClient from 'socket.io-client';
import { FaAngleUp, FaAngleDown, FaWallet, FaStream } from 'react-icons/fa';
import { notify } from "../utils/notifications";
import {
  ResolveFuturesContractuserAccounts,
  resolveFuturesContractuser,
} from "../outfutures/instructions/resolveFuturesContractuser";


const ENDPOINT = 'https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/'
const ENDPOINT2 = 'https://fast-tundra-88970.herokuapp.com/'


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


interface MyPositionsProps {
  latestOpenedPosition: Record<string, Position | null>;
  setLatestOpenedPosition: React.Dispatch<React.SetStateAction<Record<string, Position | null>>>;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const ITEMS_PER_PAGE = 10;

const MyPositions: FC<MyPositionsProps> = ({ latestOpenedPosition, setLatestOpenedPosition }) => {
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);  // change here
  
    return () => {
      document.removeEventListener('click', handleClickOutside);  // change here
    };
  }, []);
  
  const toggleDropdownOpens = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleDropdownClick = (e) => {
    e.preventDefault();  
    e.stopPropagation(); // prevent the click from triggering handleClickOutside
  };
  


  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit('registerWallet', walletAddress);

    socket.on('futuresPositions', (positions: Position[]) => {
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
    socket2.on('futuresPosition', (updatedPosition: Position, latestPrice: number) => {
      setPreviousPrice(latestPrice);
    
      setPositions((prevState) => {
        const positionExists = prevState.some((position) => position._id === updatedPosition._id);
    
        if (positionExists) {
          // Update the position
          const updatedPositions = prevState.map((position) =>
            position._id === updatedPosition._id
              ? { ...updatedPosition, currentPrice: latestPrice }
              : position
          );
    
          notify({ type: 'success', message: `Position resolved`, description: `Your position ${updatedPosition.futuresContract.slice(0, 4)}...${updatedPosition.futuresContract.slice(-4)} has been resolved with PnL: ${((updatedPosition.pnl-updatedPosition.betAmount)/LAMPORTS_PER_SOL).toFixed(2)} SOL` });
    
          return updatedPositions;
        } else {
          // Add the new position to the array
          notify({ type: 'success', message: `New position created`, description: `A new position ${updatedPosition.futuresContract.slice(0, 4)}...${updatedPosition.futuresContract.slice(-4)} has been created with entry price: ${(updatedPosition.initialPrice/100000000).toFixed(3)} USD` });
          setLatestOpenedPosition((prevPositions) => {
            const updatedPositions = {
              ...prevPositions,
              [updatedPosition.symbol.toString()]: updatedPosition,
            };
            return updatedPositions;
          });
          return [{ ...updatedPosition, currentPrice: latestPrice }, ...prevState];
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
    
    socket2.on('connect_error', (err) => {
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
  socket2.disconnect();
};
}, [walletAddress]);

  const selectPosition = () => {
    setPosition(true);
  };

  const selectHistory = () => {
    setPosition(false);
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

  const signature: TransactionSignature = '';
  

  const resolveFuturesContract = async (position: Position) => {  
    const oracleAccountAddress = position.symbol === 0
    ? "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"
    : "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J";

    const accounts: ResolveFuturesContractuserAccounts = {
      futuresContract: new PublicKey(position.futuresContract),
      playerWalletAccount: new PublicKey(walletAddress),
      oracleAccount: new PublicKey(oracleAccountAddress),
      pdaHouseWalletAccount: new PublicKey("CvFxKTkmesQTGXPRwqqgwoaYe6BxARE2qVHKGhce68Ej"),
      clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
      systemProgram: SystemProgram.programId,
    };
  
    // Create the transaction
    const transaction = new Transaction().add(
      resolveFuturesContractuser(accounts)
    );
  
    let signature: TransactionSignature = '';
    try {
      // Send the transaction
      signature = await sendTransaction(transaction, connection);
  
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction sent:', signature);
  
      // Optionally, show a success notification
    } catch (error: any) {
      console.error('Transaction failed:', error);
  
      // Optionally, show an error notification
      notify({ type: 'error', message: `Contract resolution failed`, description: error?.message, txid: signature });
    }
  };
  
  const renderPositions = (positionsToRender: Position[]) => {
    const unresolvedPositions = positionsToRender
        .filter((item) => !item.resolved)
        .sort((a, b) => b._id.localeCompare(a._id)); 

    return (
      <tbody>
        {unresolvedPositions.map((item, index) => {
          const pnl =
          item.priceDirection === 0
          ? item.initialPrice < item.currentPrice
          ? (item.currentPrice - item.initialPrice) / item.initialPrice * (item.betAmount - item.betAmount*10/100) * item.leverage / LAMPORTS_PER_SOL
          : Math.max(
            (item.currentPrice - item.initialPrice) / item.initialPrice * item.betAmount * item.leverage / LAMPORTS_PER_SOL,
            -item.betAmount / LAMPORTS_PER_SOL
          )          : item.initialPrice > item.currentPrice
          ? (-(item.currentPrice - item.initialPrice) / item.initialPrice * (item.betAmount - item.betAmount*10/100) * item.leverage / LAMPORTS_PER_SOL) 
          : Math.max(-
            (item.currentPrice - item.initialPrice) / item.initialPrice * item.betAmount * item.leverage / LAMPORTS_PER_SOL,
            -item.betAmount / LAMPORTS_PER_SOL
          )
          const isEvenRow = index % 2 === 0;
          const rowStyle = { backgroundColor: isEvenRow ? '#232332' : '#1a1a25' };

          return (
            <tr key={item._id} style={rowStyle}>
              <td className="w-[22%] min-w-[100px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 lg:pl-5 md:pl-5 sm:pl-2 pl-2 ">
                <a
                  href={`https://solscan.io/account/${item.futuresContract}?cluster=devnet`}
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
  <p className="ml-2">{`${item.futuresContract.slice(0, 4)}...${item.futuresContract.slice(-4)}`}</p> 
</div>                </a>
              </td>
              <td className="w-[13%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
              <p>{item.symbol === 1 ? (item.initialPrice / 100000000).toFixed(1) : (item.initialPrice / 100000000).toFixed(3)}</p>                </td>
              <td className="w-[13%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
<p>{item.symbol === 1 ? (item.currentPrice / 100000000).toFixed(1) : (item.currentPrice / 100000000).toFixed(3)}</p>              </td>
              <td className="w-[13%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
                <p className={item.priceDirection === 0 ? 'text-[#34c796] ' : 'text-red-500'}>
                  <div className="flex items-center">
                    {item.priceDirection === 0 ? (
                      <>
                        <FaAngleUp className="text-[#34c796]" />
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
              <td className="w-[10%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
              {item.leverage}x</td>
              <td className="w-[13%]  min-w-[140px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5">
                <p className={pnl >= 0 ? 'text-[#34c796] font-semibold' : 'text-red-500 font-semibold'}>
                  {pnl.toFixed(2)} SOL <span className="text-slate-300">({item.betAmount/LAMPORTS_PER_SOL} SOL)</span>
                </p>

              </td>
              <td className="w-[16%] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 pr-2">

              <div className="flex md:flex-row flex-col w-[100%]">
  <div className="flex flex-row justify-center w-[100%]">

  <div className="md:w-[45%] w-[95%] min:w-[100px] dropdown dropdown-end" ref={dropdownRef}>
    <button
      className="bg-[#484c6d] hover:bg-[#484c6d5b] text-[0.84rem] xl:text-[0.9rem] font-semibold py-0.5 px-4 rounded dropdown-toggle"
      onClick={toggleDropdownOpens}
    >
      TP/SL
    </button>


    {isDropdownOpen && (
    <ul className="position:absolute h-[100px] overflow-visible p-2 shadow menu dropdown-content bg-[#1a1a25] border-2 border-gray-500 rounded-box sm:w-52 absolute right-0 bottom-full mb-2 z-20" onMouseDown={handleDropdownClick} onClick={handleDropdownClick}>
      <li className="form-control bg-opacity-100">
        <div className="w-full text-slate-300 font-semibold mt-2 relative">
          Autoconnect
        </div>
      </li>
    </ul>
  )}
  </div>
    <div className="px-0.5"></div>
  <button
      className="md:w-[45%] w-[95%] min:w-[100px] bg-[#1f8a66] hover:bg-[#1f8a66ad] text-[0.84rem] xl:text-[0.9rem] font-semibold py-0.5 px-4 rounded"
      onClick={() => resolveFuturesContract(item)}
  >
    Close
  </button>
  </div>
</div>

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
          ? (item.finalPrice - item.initialPrice) / item.initialPrice * (item.betAmount - item.betAmount*10/100) * item.leverage / LAMPORTS_PER_SOL
          : Math.max(
            (item.finalPrice - item.initialPrice) / item.initialPrice * item.betAmount * item.leverage / LAMPORTS_PER_SOL,
            -item.betAmount / LAMPORTS_PER_SOL
          )          : item.initialPrice > item.finalPrice
          ? (-(item.finalPrice - item.initialPrice) / item.initialPrice * (item.betAmount - item.betAmount*10/100) * item.leverage / LAMPORTS_PER_SOL) 
          : Math.max(-
            (item.finalPrice - item.initialPrice) / item.initialPrice * item.betAmount * item.leverage / LAMPORTS_PER_SOL, -item.betAmount / LAMPORTS_PER_SOL           )
          const isEvenRow = index % 2 === 0;
          const rowStyle = { backgroundColor: isEvenRow ? '#232332' : '#1a1a25' };

          return (
            <tr key={item._id} style={rowStyle} >
              <td className="w-[22%] min-w-[100px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 lg:pl-5 md:pl-5 sm:pl-2 pl-2 ">
                <a
                  href={`https://solscan.io/account/${item.futuresContract}?cluster=devnet`}
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
  <p className="ml-2">{`${item.futuresContract.slice(0, 4)}...${item.futuresContract.slice(-4)}`}</p> 
</div>
               </a>
              </td>
              <td className="w-[13%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
              <p>{item.symbol === 1 ? (item.initialPrice / 100000000).toFixed(1) : (item.initialPrice / 100000000).toFixed(3)}</p>              
              </td>
              <td className="w-[13%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
              <p>{item.symbol === 1 ? (item.finalPrice / 100000000).toFixed(1) : (item.finalPrice / 100000000).toFixed(3)}</p>              
                </td>
                <td className="w-[13%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
                <p className={item.priceDirection === 0 ? 'font-semibold text-[#34c796]' : 'font-semibold text-red-500'}>
                  <div className="flex items-center">
                    {item.priceDirection === 0 ? (
                      <>
                        <FaAngleUp className="text-[#34c796]" />
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
              <td className="w-[10%] min-w-[90px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 ">
              {item.leverage}x</td>
              <td className="w-[13%]  min-w-[140px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5">
                <p className={pnl >= 0 ? 'text-[#34c796] font-semibold' : 'text-red-500 font-semibold'}>
                  {pnl.toFixed(2)} SOL <span className="text-slate-300">({item.betAmount/LAMPORTS_PER_SOL} SOL)</span>
                </p>
              </td>
              <td className="w-[16%] min-w-[140px] text-start text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem] text-slate-300 font-semibold pb-1.5 pt-1.5 pr-2">

<div className="flex md:flex-row flex-col w-[100%]">
<div className="flex flex-row justify-center w-[100%]">


<button
className="bg-[#484c6d] hover:bg-[#484c6d5b] text-[0.84rem] xl:text-[0.9rem] font-semibold py-0.5 px-4 rounded"
onClick={() => resolveFuturesContract(item)}
>
Share Trade
</button>
</div>
</div>

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
          <table className="w-full mt-2 w-[100%] bg-[#232332] text-[0.9rem] xl:text-[1rem] lg:text-[1rem] md:text-[1rem] sm:text-[0.9rem] overflow-x-scroll overflow-y-auto">
            <thead>
              <tr>
              <th className="w-[22%] text-start font-semibold  pb-3 pl-5">
              Option
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3 ">
              Initial Price
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3">
              {position ? 'Actual Price' : 'Closing Price'}
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3 ">Direction</th>
            <th className="w-[10%] text-start font-semibold  pb-3 ">
              Leverage
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3 ">PnL (Position)</th>
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
    <div className="custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] lg:h-[26vh] md:h-[28vh] overflow-x-scroll overflow-y-auto lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
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
            <th className="w-[22%] text-start font-semibold  pb-3 pl-5">
              Option
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3 ">
              Initial Price
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3">
              {position ? 'Actual Price' : 'Closing Price'}
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3 ">Direction</th>
            <th className="w-[10%] text-start font-semibold  pb-3 ">
              Leverage
            </th>
            <th className="w-[13%] text-start font-semibold  pb-3 ">PnL (Position)</th>
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
