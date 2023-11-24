import { FC, useEffect, useState, useRef } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import socketIOClient from 'socket.io-client';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import { FaAngleDoubleUp, FaAngleDoubleDown, FaWallet, FaStream, FaShareAlt } from 'react-icons/fa';
import { notify } from "../utils/notifications";
import domtoimage from 'dom-to-image';
import Modal from 'react-modal';
import { UserAccount  } from "../out/accounts/UserAccount";
import { PROGRAM_ID } from '../out/programId';


const ENDPOINT1 = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;



interface Position {
  _id: string;
  binaryOption: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  symbol: number;
  resolved: boolean;
  payout: number;
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
  handleTotalBetAmountChange: (total: number) => void; // add this line
  prices: { [key: string]: { price: number, timestamp: string } };

}

const LAMPORTS_PER_SOL = 1_000_000_000;
const ITEMS_PER_PAGE = 10;

const MyPositions: FC<MyPositionsProps> = ({ prices, latestOpenedPosition, setLatestOpenedPosition, handleTotalBetAmountChange }) => {
  async function isUserAccountInitialized(account: PublicKey, connection: Connection): Promise<{ isInitialized: boolean; usedAffiliate: Uint8Array; myAffiliate: Uint8Array }> {
    const accountInfo = await connection.getAccountInfo(account);
  
    if (!accountInfo) {
      console.error("Account not found or not fetched properly.");
      // You'll need to decide on an appropriate default return here.
      return { isInitialized: false, usedAffiliate: new Uint8Array(8).fill(0), myAffiliate: new Uint8Array(8).fill(0)};
    }
  
    const bufferData = Buffer.from(accountInfo.data);
  
    let userAcc;
    try {
      userAcc = UserAccount.decode(bufferData);
    } catch (error) {
      console.error("Failed to decode user account data:", error);
      return { isInitialized: false, usedAffiliate: new Uint8Array(8).fill(0), myAffiliate: new Uint8Array(8).fill(0) };
    }
  

    return {
      isInitialized: userAcc.isInitialized,
      usedAffiliate: userAcc.usedAffiliate,
      myAffiliate: userAcc.myAffiliate,
    };
  }
  
  const { connection } = useConnection();
  const [position, setPosition] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [resolvedPositions, setResolvedPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { publicKey, connected } = useWallet(); // Add connected variable
  const walletAddress = publicKey?.toString() || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [isInit, setisInit] = useState<{ isInitialized: boolean; usedAffiliate: Uint8Array, myAffiliate: Uint8Array }>(null);
  const symbolMap = {
    0: "Crypto.SOL/USD",
    1: "Crypto.BTC/USD"
    // Add more symbols as needed
  };
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const socket2Ref = useRef(null);


  useEffect(() => {
    const total = positions.reduce((total, position) => total + position.betAmount, 0);
    handleTotalBetAmountChange(total);  // This line passes the total back to the parent
  }, [positions]);

  useEffect(() => {
    let socket;
    let socket2;
    let isMounted = true;

    const fetchSolanaTime = async () => {
      const currentSolanaTimestamp = await getSolanaTimestamp();
      if (isMounted) {
          setSolanaTimestamp(currentSolanaTimestamp);
      }
  };

    function setupSocket1() {
    socket = socketIOClient(ENDPOINT2);
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
      fetchSolanaTime();
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }
  function setupSocket2() {
    socket2Ref.current = socketIOClient(ENDPOINT1);

    if (socket2Ref.current) {
      socket2Ref.current.off('position');
      socket2Ref.current.off('connect_error');
    }
    
    socket2Ref.current.emit('registerWallet', walletAddress);
    
    socket2Ref.current.on('position', (updatedPosition: Position, latestPrice: number) => {
      setPreviousPrice(latestPrice);
  
      setPositions((prevState) => {
        const positionExists = prevState.some((position) => position._id === updatedPosition._id);
  
        if (positionExists) {
          // Update the existing position
          return prevState.map((position) =>
            position._id === updatedPosition._id
              ? { ...updatedPosition, currentPrice: latestPrice, remainingTime: calculateRemainingTime(updatedPosition.expirationTime) }
              : position
          );
        } else if (!updatedPosition.resolved) {
          // Add the new position only if it's not resolved
          return [{ ...updatedPosition, currentPrice: latestPrice }, ...prevState];
        } else {
          // If the position is resolved, don't add it to the positions array
          return prevState;
        }
      });
  
      if (updatedPosition.resolved) {
        setResolvedPositions((prevState) => [...prevState, updatedPosition]);
        
        setPositions(prevState => prevState.filter(position => position._id !== updatedPosition._id));
  
        setLatestOpenedPosition(prevPositions => {
          const nonResolvedSameSymbolPositions = positions.filter(
            position => position.symbol === updatedPosition.symbol && !position.resolved
          );
  
          // Sort by least remaining time
          nonResolvedSameSymbolPositions.sort((a, b) => {
            return calculateRemainingTimeInSeconds(a.remainingTime) - calculateRemainingTimeInSeconds(b.remainingTime);
          });
  
          const latestSameSymbolPosition = nonResolvedSameSymbolPositions.length 
              ? nonResolvedSameSymbolPositions[0]
              : null;
  
          return {
            ...prevPositions,
            [updatedPosition.symbol.toString()]: latestSameSymbolPosition
          };
        });
      } else {
        // Update the latest opened position for the symbol if the position is not resolved
        setLatestOpenedPosition(prevPositions => {
          return {
            ...prevPositions,
            [updatedPosition.symbol.toString()]: { ...updatedPosition, currentPrice: latestPrice }
          };
        });
      }
  
      // Notify the user
      if (updatedPosition.resolved) {
        notify({ type: 'success', message: `Option resolved`, description: `Your option ${updatedPosition.binaryOption.slice(0, 4)}...${updatedPosition.binaryOption.slice(-4)} has been resolved with payout of ${updatedPosition.payout/LAMPORTS_PER_SOL} SOL.` });
      } else {
        notify({ type: 'success', message: `Option created`, description: `A new option ${updatedPosition.binaryOption.slice(0, 4)}...${updatedPosition.binaryOption.slice(-4)} has been created with entry price: ${(updatedPosition.initialPrice/100000000).toFixed(3)} USD` });
        fetchSolanaTime();
      }
    });
  

    
  }
  
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (!socket || !socket.connected) {
      setupSocket1();
    }
    if (!socket2Ref.current || !socket2Ref.current.connected) {
      setupSocket2();
    }
     }
}
    // Initial setup
    setupSocket1();
    setupSocket2();



    // Reconnect logic when the app comes back to the foreground
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      isMounted = false;
      if (socket) socket.disconnect();
      if (socket2Ref.current) {
        socket2Ref.current.disconnect();
        socket2Ref.current.off('position');
        socket2Ref.current.off('connect_error');
      }
      
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
}, [walletAddress]);


// Price updates
useEffect(() => {
  setPositions((positions) =>
      positions.map((pos) => {
          const symbol = symbolMap[pos.symbol];
          const updatedPrice = prices[symbol];

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
      const updatedPrice = prices[previousSymbol];
      return updatedPrice ? updatedPrice.price : (previousPrice || 0);
  });
}, [prices]);





  const selectPosition = () => {
    setPosition(true);
  };

  const selectHistory = () => {
    setPosition(false);
  };


  const getSolanaTimestamp = async (): Promise<number | null> => {
    // Connect to the Solana cluster (mainnet in this case)
    const connection = new Connection('https://sparkling-warmhearted-water.solana-mainnet.quiknode.pro/9750bfc7335111091f9d0629dc8ffcb57d2939b0', 'processed');
    const slot = await connection.getSlot();
    // Fetch the recent blockhash and its associated details
    const recentBlockhash = await connection.getBlockTime(slot);
    console.log("time blockchain",recentBlockhash)
    // Return the block time
    return recentBlockhash;
  };

  const [solanaTimestamp, setSolanaTimestamp] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the current Solana timestamp
    const fetchSolanaTime = async () => {
      const currentSolanaTimestamp = await getSolanaTimestamp(); // You'll need to implement this function
      setSolanaTimestamp(currentSolanaTimestamp);
    };
  
    fetchSolanaTime();
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (solanaTimestamp !== null) {
        // Increment the solanaTimestamp by 1 second
        setSolanaTimestamp(prevTimestamp => prevTimestamp + 1);

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
      }
    }, 1000);

    return () => clearInterval(timer);
}, [solanaTimestamp]);

  const calculateRemainingTime = (expirationTime: number): string => {
    if (!solanaTimestamp) {
      return ''; // or some other placeholder
    }

    const remainingTime = expirationTime - solanaTimestamp;
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

  const downloadAsPng = () => {
    const modal = document.getElementById('my-modal');
    domtoimage.toPng(modal)
        .then(function (dataUrl) {
            const link = document.createElement('a');
            link.download = 'PopFi-trade.png';
            link.href = dataUrl;
            link.click();
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        });
}

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

  const fetchcheckuserdata = async () => {
    if (!publicKey) {
      setisInit(null);  // Reset the userAffiliateData if publicKey is not defined
        return;
    }
  
  const seedsUser = [Buffer.from(publicKey.toBytes())];
  const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);
  
  // Check if the user has an affiliate code when the component mounts
  if (publicKey) {
      const result = await isUserAccountInitialized(userAcc, connection);
      setisInit(result);
  }
  };
  useEffect(() => {
    fetchcheckuserdata();
  }, [publicKey, connection]);

  const [decodedString, setDecodedString] = useState("");

  useEffect(() => {
    // Check if userAffiliateData exists and has the 'myAffiliate' property with a length greater than 0
    if (isInit && isInit.myAffiliate.length > 0) {
        const decoded = Array.from(isInit.myAffiliate)
                             .filter(byte => byte !== 0)
                             .map(byte => String.fromCharCode(byte))
                             .join('');
        setDecodedString(decoded);
    } else {
        setDecodedString("");
    }
}, [isInit]);

  const renderPositions = (positionsToRender: Position[]) => {
    const unresolvedPositions = positionsToRender.filter((item) => !item.resolved);
    // Reverse the array to show positions from newest to oldest
    unresolvedPositions.sort((a, b) => {
      const aRemainingTime = calculateRemainingTimeInSeconds(a.remainingTime);
      const bRemainingTime = calculateRemainingTimeInSeconds(b.remainingTime);
      return aRemainingTime - bRemainingTime;
    });

    const pnl = currentItem ? 
    currentItem.priceDirection === 0
      ? currentItem.initialPrice < currentItem.currentPrice
        ? ((currentItem.payout - currentItem.betAmount) / currentItem.betAmount)
        : -currentItem.betAmount/currentItem.betAmount
      : currentItem.initialPrice > currentItem.currentPrice
      ? ((currentItem.payout - currentItem.betAmount) / currentItem.betAmount)
      : -currentItem.betAmount/currentItem.betAmount
  : 0;
      

    const ModalDetails1 = (
      <Modal
      className="custom-scrollbar"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'transparent'
          },
          content: {
            color: 'lightsteelblue',
            width: '1020px',  // default width for desktop
            height: '1380px', // default height for desktop
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.333)',
            border: '2px solid black', // add border here
            padding: '0', // remove padding here
            boxSizing: 'border-box', // ensure padding and border are included in width/height calculations
          }
        }}
      >
      
      {currentItem && (
        <div className="custom-scrollbar h-full w-full p-0 m-0 box-border" id="my-modal" style={{
        backgroundImage: `url("/promo.png")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
                <div className="h-[50%]"></div>
                <div className="h-[50%] flex justify-center">
                <div className="ml-24 w-[50%]">
                <div className="flex items-center text-[5.2rem] text-white font-bold font-sans">
                  {currentItem.symbol === 0 ?
                    <p className="">{`SOLUSD`}</p>  :
                  currentItem.symbol === 1 ?
                  <p className="">{`BTCUSD`}</p>  : 
                  null
                  }
                </div>
                <div className="flex items-center text-[3.3rem] text-white font-semibold font-sans">
                <p>
          {currentItem.priceDirection === 0 ? (
              <>
                  <span className="">LONG</span>
              </>
          ) : (
              <>
                  <span className="">SHORT</span>
              </>
          )}
      </p>     <p className="ml-3">BINARY</p></div>
                  
      
                {/* Adjust the pnl calculation according to your application's needs */}
                <p className={pnl > 0 ? "ml-3 text-[6.6rem] font-bold font-sans text-[#34C796]" : "text-[6.6rem] font-bold font-sans text-red-500"}>
  {((pnl)*100).toFixed(1)}%
</p>
{decodedString ? (
  <div className="ml-3 flex items-center text-[3.3rem] text-white font-semibold font-sans">
    <p className="text-[#8A99AD]">CODE<span className="ml-3 text-white">{decodedString}</span></p>
  </div>
) : null}

                </div>          
                <div className="ml-24 w-[50%]">         
                <p className="mt-1.5 flex items-center text-[3.6rem] text-[#8A99AD] font-semibold font-sans">ENTRY</p>  
                <p className="mt-1.5 flex items-center text-[4.2rem] text-white font-semibold font-sans"> {currentItem.symbol === 1 ? (currentItem.initialPrice / 100000000).toFixed(1) : (currentItem.initialPrice / 100000000).toFixed(3)}</p>              
                <p className="mt-1.5 flex items-center text-[3.6rem] text-[#8A99AD] font-semibold font-sans">MARK</p>
                <p className="mt-1.5 flex items-center text-[4.2rem] text-white font-semibold font-sans">{currentItem.symbol === 1 ? (currentItem.currentPrice / 100000000).toFixed(1) : (currentItem.currentPrice / 100000000).toFixed(3)}</p>              
                </div></div></div>
      
                
            )}      <div className="w-[100%] bg-[#1A1A25] border-2 border-black">  <button className="ml-2 text-[3rem] text-white font-semibold" onClick={downloadAsPng}>Download as PNG</button></div>
          </Modal>
        );


    return (
      <div>
        {unresolvedPositions.map((item, index) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.currentPrice
                ? (item.payout) / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.currentPrice
              ? (item.payout) / LAMPORTS_PER_SOL
              : -item.betAmount / LAMPORTS_PER_SOL;

          const isEvenRow = index % 2 === 0;
          const rowStyle = { backgroundColor: isEvenRow ? '#232332' : '#1a1a25' };
          const timeStr = item.remainingTime || '';

          return (
            <div key={item._id} className="mt-2 flex flex  flex-row text-start rounded">
              <div className="rounded-l bg-[#1a1a25] pl-2 w-[22%] min-w-[150px] text-start text-[0.9rem] text-slate-300 font-semibold  ">
                <a
                  href={`https://solscan.io/account/${item.binaryOption}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="flex items-center">
  {item.symbol === 0 ?
    <img src="/sol.png" alt="Logo" width="24" height="24" className="pt-0.5"/> :
  item.symbol === 1 ?
    <img src="/Bitcoin.png" alt="Logo" width="24" height="24" className="pt-0.5"/> : 
  null
  }
  <p className="pt-3 pb-2.5 ml-2">{`${item.binaryOption.slice(0, 4)}...${item.binaryOption.slice(-4)}`}</p> 
</div>   
                </a>
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[13%] min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
              <p>{item.symbol === 1 ? (item.initialPrice / 100000000).toFixed(1) : (item.initialPrice / 100000000).toFixed(3)}</p>              
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[13%] min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
              <p>{item.symbol === 1 ? (item.currentPrice / 100000000).toFixed(1) : (item.currentPrice / 100000000).toFixed(3)}</p>              
                </div>
                <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[13%] min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
                <p className={item.priceDirection === 0 ? 'font-semibold text-[#34c796]' : 'font-semibold text-red-500'}>
                  <div className="flex items-center">
                    {item.priceDirection === 0 ? (
                      <>
                        <FaAngleDoubleUp className="text-[#34c796]" />
                        <span className="ml-1">LONG</span>
                      </>
                    ) : (
                      <>
                        <FaAngleDoubleDown className="text-red-500" />
                        <span className="ml-1">SHORT</span>
                      </>
                    )}
                  </div>
                </p>
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[15%] min-w-[140px] text-start text-[0.9rem] text-slate-300 font-semibold">
                <p>{timeStr}</p>
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[10%]  min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
                <p className={pnl >= 0 ? 'text-[#34c796] font-semibold' : 'text-red-500 font-semibold'}>
                  {pnl.toFixed(2)} SOL
                </p>
              </div>
              <div className="rounded-r items-center bg-[#1a1a25] py-2.5 w-[14%] min-w-[140px] text-[0.9rem] text-slate-300 font-semibold">

<div className="flex items-center justify-center md:flex-row flex-col w-[100%]" >
<div className="flex items-center flex-row justify-center w-[70%] min-w-[140px]">
<button
  className="min-w-[100px] h-[26px] bg-[#484c6d] hover:bg-[#484c6d5b] text-[0.9rem] font-semibold py-0.5 px-4 rounded flex items-center justify-center"
  onClick={() => {
    setCurrentItem(item); 
    setModalIsOpen(true);
  }}
>
  Share <FaShareAlt size={12} className="ml-1 " />
</button>
</div>
</div>

</div>
            </div>
          );
        })}
        {ModalDetails1}
      </div>
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
    const pnl = currentItem ? 
    currentItem.priceDirection === 0
      ? currentItem.initialPrice < currentItem.finalPrice
        ? ((currentItem.payout - currentItem.betAmount) / currentItem.betAmount)
        : -currentItem.betAmount / currentItem.betAmount
      : currentItem.initialPrice > currentItem.finalPrice
      ? ((currentItem.payout - currentItem.betAmount) / currentItem.betAmount)
      : -currentItem.betAmount / currentItem.betAmount
  : 0;
      
    const ModalDetails = (
      <Modal
      className="custom-scrollbar"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'transparent'
          },
          content: {
            color: 'lightsteelblue',
            width: '1020px',  // default width for desktop
            height: '1380px', // default height for desktop
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.333)',
            border: '2px solid black', // add border here
            padding: '0', // remove padding here
            boxSizing: 'border-box', // ensure padding and border are included in width/height calculations
          }
        }}
      >
      
      {currentItem && (
        <div className="custom-scrollbar h-full w-full p-0 m-0 box-border" id="my-modal" style={{
        backgroundImage: `url("/promo.png")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
                <div className="h-[46.5%]"></div>
                <div className="h-[52.5%] flex justify-center">
                <div className="ml-24 w-[50%]">
                <div className="ml-3  flex items-center text-[5.2rem] text-white font-bold font-sans">
                  {currentItem.symbol === 0 ?
                    <p className="">{`SOLUSD`}</p>  :
                  currentItem.symbol === 1 ?
                  <p className="">{`BTCUSD`}</p>  : 
                  null
                  }
                </div>
                <div className="ml-3  flex items-center text-[3.3rem] text-white font-semibold font-sans">
                <p>
          {currentItem.priceDirection === 0 ? (
              <>
                  <span className="">LONG</span>
              </>
          ) : (
              <>
                  <span className="">SHORT</span>
              </>
          )}
      </p>     <p className="ml-3">BINARY</p></div>
                  
      
                {/* Adjust the pnl calculation according to your application's needs */}
                <p className={pnl > 0 ? "ml-3 text-[6.6rem] font-bold font-sans text-[#34C796]" : "text-[6.6rem] font-bold font-sans text-red-500"}>
                {((pnl)*100).toFixed(1)}%
</p>
{decodedString ? (
  <div className="ml-3 flex items-center text-[3.3rem] text-white font-semibold font-sans">
    <p className="text-[#8A99AD]">CODE<span className="ml-3 text-white">{decodedString}</span></p>
  </div>
) : null}

                </div>          
                <div className="ml-24 w-[50%]">         
                <p className="mt-1.5 flex items-center text-[3.6rem] text-[#8A99AD] font-semibold font-sans">ENTRY</p>  
                <p className="mt-1.5 flex items-center text-[4.2rem] text-white font-semibold font-sans"> {currentItem.symbol === 1 ? (currentItem.initialPrice / 100000000).toFixed(1) : (currentItem.initialPrice / 100000000).toFixed(3)}</p>              
                <p className="mt-1.5 flex items-center text-[3.6rem] text-[#8A99AD] font-semibold font-sans">EXIT</p>
                <p className="mt-1.5 flex items-center text-[4.2rem] text-white font-semibold font-sans">{currentItem.symbol === 1 ? (currentItem.finalPrice / 100000000).toFixed(1) : (currentItem.finalPrice / 100000000).toFixed(3)}</p>              
                </div></div></div>
      
                
            )}      <div className="w-[100%] bg-[#1A1A25] border-2 border-black">  <button className="ml-2 text-[3rem] text-white font-semibold" onClick={downloadAsPng}>Download as PNG</button></div>
          </Modal>
        );

    return (
      <div>
        {currentPageData.map((item, index) => {
          const pnl =
            item.priceDirection === 0
              ? item.initialPrice < item.finalPrice
                ? (item.payout) / LAMPORTS_PER_SOL
                : -item.betAmount / LAMPORTS_PER_SOL
              : item.initialPrice > item.finalPrice
              ? (item.payout) / LAMPORTS_PER_SOL
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
            <div key={item._id} className="flex flex flex-row mt-2 text-start rounded">
              <div className="rounded-l bg-[#1a1a25] pl-2 w-[22%] min-w-[150px] text-start text-[0.9rem] text-slate-300 font-semibold  ">
                <a
                  href={`https://solscan.io/account/${item.binaryOption}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="flex items-center">
  {item.symbol === 0 ?
    <img src="/sol.png" alt="Logo" width="24" height="24" className="pt-0.5"/> :
  item.symbol === 1 ?
    <img src="/Bitcoin.png" alt="Logo" width="24" height="24" className="pt-0.5"/> : 
  null
  }
  <p className="pt-3 pb-2.5 ml-2">{`${item.binaryOption.slice(0, 4)}...${item.binaryOption.slice(-4)}`}</p> 
</div>   
                </a>
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[13%] min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
              <p>{item.symbol === 1 ? (item.initialPrice / 100000000).toFixed(1) : (item.initialPrice / 100000000).toFixed(3)}</p>              
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[13%] min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
              <p>{item.symbol === 1 ? (item.finalPrice / 100000000).toFixed(1) : (item.finalPrice / 100000000).toFixed(3)}</p>              
                </div>
                <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[13%] min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
                <p className={item.priceDirection === 0 ? 'font-semibold text-[#34c796]' : 'font-semibold text-red-500'}>
                  <div className="flex items-center">
                    {item.priceDirection === 0 ? (
                      <>
                        <FaAngleDoubleUp className="text-[#34c796]" />
                        <span className="ml-1">LONG</span>
                      </>
                    ) : (
                      <>
                        <FaAngleDoubleDown className="text-red-500" />
                        <span className="ml-1">SHORT</span>
                      </>
                    )}
                  </div>
                </p>
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[15%] min-w-[140px] text-start text-[0.9rem] text-slate-300 font-semibold">
                <p>{formattedDate}</p>
              </div>
              <div className="bg-[#1a1a25] pt-3 pb-2.5 w-[10%]  min-w-[90px] text-start text-[0.9rem] text-slate-300 font-semibold">
                <p className={pnl >= 0 ? 'min-w-[90px] text-[#34c796] font-semibold' : 'text-red-500 font-semibold'}>
                  {pnl.toFixed(2)} SOL
                </p>
              </div>
              <div className="rounded-r items-center bg-[#1a1a25] py-2.5 w-[14%] min-w-[140px] text-[0.9rem] text-slate-300 font-semibold">

<div className="flex items-center justify-center md:flex-row flex-col w-[100%]" >
<div className="flex items-center flex-row justify-center w-[70%] min-w-[140px]">
<button
  className="min-w-[100px] h-[26px] bg-[#484c6d] hover:bg-[#484c6d5b] text-[0.9rem] font-semibold py-0.5 px-4 rounded flex items-center justify-center"
  onClick={() => {
    setCurrentItem(item); 
    setModalIsOpen(true);
  }}
>
  Share <FaShareAlt size={12} className="ml-1 " />
</button>
</div>
</div>

</div>
            </div>
          );
        })}
        {ModalDetails}
      </div>
    );
  };

  if (!connected) {
    return (
      <div className="px-2 custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] lg:h-[26vh] md:h-[28vh] overflow-x-scroll overflow-y-hidden lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
            <div className="mb-2">
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
        <div className="flex flex-col items-center justify-center md:h-[18vh] h-full overflow-hidden pb-6 md:pb-0">
  <FaWallet className="text-4xl text-slate-300 mb-2" />
  <div className="text-[0.95rem] text-slate-300 font-semibold text-center overflow-hidden">
    Connect your wallet to see your positions.
  </div>
</div>

      </div>
    );
  } else if (positions.length === 0 && resolvedPositions.length === 0) {
    return (
      <div className="px-2 custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] lg:h-[26vh] md:h-[28vh] overflow-x-scroll overflow-y-hidden lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
      <div className="sticky top-0 z-10 mb-2">
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
        <div className="flex flex-col items-center justify-center md:h-[18vh] h-full overflow-hidden pb-6 md:pb-0">
          <FaStream className="text-4xl text-slate-300 mb-2" />
          <p className="text-[0.95rem] text-slate-300 font-semibold text-center overflow-hidden">
          You don&apos;t have any opened positions yet.
          </p>
        </div>
      </div>
    );
  } else if ( positions.length === 0 && resolvedPositions.length !== 0 ) {
    
    return (
<div className="px-2 custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] lg:h-[26vh] md:h-[28vh] bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
  <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
    <div className="custom-scrollbar sticky top-0 z-10 mb-2">
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
        <div className="custom-scrollbar overflow-y-auto rounded" style={{flexGrow: 1}}> {/* This div is your new scrolling area */}
      {position ? (
        <div className="flex flex-col items-center justify-center md:h-[18vh] h-full overflow-hidden">
        <FaStream className="text-4xl text-slate-300 mb-2" />
            <p className="text-[0.95rem] text-slate-300 font-semibold text-center overflow-hidden">
  You don&apos;t have any opened positions yet.
</p>

          </div>
        ) : (
          <div className="custom-scrollbar overflow-y-auto rounded" style={{flexGrow: 1}}> {/* This div is your new scrolling area */}
          <div className="custom-scrollbar  w-full flex flex-row  rounded  text-slate-600">
                      <div className="w-[22%] min-w-[150px] text-start font-semibold pl-6 bg-[#1a1a25] py-1.5 rounded-l">
                  Option
                </div>
            <div className="w-[13%]  min-w-[90px] text-start font-semibold bg-[#1a1a25] py-1.5">
                  Entry Price
                </div>
            <div className="w-[13%] min-w-[90px] text-start font-semibold bg-[#1a1a25] py-1.5">
                  {position ? 'Mark Price' : 'Exit Price'}
                </div>
            <div className="w-[13%] min-w-[90px] text-start font-semibold bg-[#1a1a25] py-1.5">Direction</div>
            <div className="w-[15%] min-w-[140px] text-start font-semibold bg-[#1a1a25] py-1.5">
                  Expiration Time
                </div>
                <div className="w-[10%]  min-w-[90px] text-start font-semibold bg-[#1a1a25] py-1.5">Payout</div>
                <div className="w-[14%] min-w-[140px] text-[0.9rem] text-slate-300 font-semibold bg-[#1a1a25] py-1.5 rounded-r"></div>

              </div>
            {renderHistoryPositions()}
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
        )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 custom-scrollbar w-[100%] 2xl:w-[69.75%] xl:w-[69.75%] lg:w-[69.75%] md:w-[100%] order-4 md:order-4 h-[280px] md:h-[26vh] lg:h-[26vh] md:h-[28vh] overflow-x-scroll overflow-y-auto lg:overflow-y-auto bg-[#232332] py-3 mt-2 rounded shadow-component border-t-2 border-gray-500">
      <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>

    <div className="custom-scrollbar sticky top-0 z-10 mb-2">
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
      <div className="custom-scrollbar overflow-y-auto rounded" style={{flexGrow: 1}}> {/* This div is your new scrolling area */}

      <div className="custom-scrollbar w-full w-[100%] rounded bg-[#232332] text-[0.9rem] xl:text-[1rem] lg:text-[1rem] md:text-[1rem] sm:text-[0.9rem]">
          <div className="w-full flex flex-row  text-slate-600 rounded">
              <div className="w-[22%] min-w-[150px] text-start font-semibold pl-6  bg-[#1a1a25] py-1.5 rounded-l">
                  Option
                </div>
            <div className="w-[13%]  min-w-[90px] text-start font-semibold  bg-[#1a1a25] py-1.5">
                  Entry Price
                </div>
            <div className="w-[13%] min-w-[90px] text-start font-semibold  bg-[#1a1a25] py-1.5">
                  {position ? 'Mark Price' : 'Exit Price'}
                </div>
            <div className="w-[13%] min-w-[90px] text-start font-semibold  bg-[#1a1a25] py-1.5">Direction</div>
            <div className="w-[15%] min-w-[140px] text-start font-semibold bg-[#1a1a25] py-1.5">
                  Expiration Time
                </div>
                <div className="w-[10%]  min-w-[90px] text-start font-semibold bg-[#1a1a25] py-1.5">Payout</div>
                <div className="w-[14%] min-w-[140px] text-[0.9rem] text-slate-300 font-semibold bg-[#1a1a25] py-1.5 rounded-r"></div>

              </div>
        {position ? renderPositions(positions) : renderHistoryPositions()}
      </div>

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
    </div>
    </div>
  );
};

export default MyPositions;
