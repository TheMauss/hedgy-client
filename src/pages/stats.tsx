import { FC, useEffect, useState } from "react";
import Identicon from 'identicon.js';
import { FaPaste, FaCoins, FaUsers, FaUser } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { ImStatsBars } from "react-icons/im";
import { FaStairs, FaMoneyBill } from "react-icons/fa6";
import { useWallet } from '@solana/wallet-adapter-react';
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );

type UserStatsType = {
    playerAcc: string,
    totalTrades: number,
    totalVolume: number,
    winRate: number,
    PnL: number,
    // other fields...
  };

const Stats: FC = () => {
    const [leaderboard1Day, setLeaderboard1Day] = useState([]);
    const [leaderboard7Days, setLeaderboard7Days] = useState([]);
    const [leaderboard30Days, setLeaderboard30Days] = useState([]);
    const [leaderboardallDays, setLeaderboardallDays] = useState([]);
    const [currentLeaderboard, setCurrentLeaderboard] = useState([]);
    const [userData, setUserData] = useState<UserStatsType | null>(null);


    const LAMPORTS_PER_SOL = 1_000_000_000;
    const FEE_PERCENTAGE = 0.05;
    const wallet = useWallet();
    const userPublicKey = wallet.publicKey?.toBase58();


    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const res1Day = await fetch('https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/leaderboard/1');
                const leaderboard1Day = await res1Day.json();

                const res7Days = await fetch('https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/leaderboard/7');
                const leaderboard7Days = await res7Days.json();

                const res30Days = await fetch('https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/leaderboard/30');
                const leaderboard30Days = await res30Days.json();

                const resallDays = await fetch('https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/leaderboard/all');
                const leaderboardallDaysData = await resallDays.json();
                const leaderboardallDays = leaderboardallDaysData.slice();

                
                
                setLeaderboard1Day(leaderboard1Day);
                setLeaderboard7Days(leaderboard7Days);
                setLeaderboard30Days(leaderboard30Days);
                setLeaderboardallDays(leaderboardallDays);
                setCurrentLeaderboard(leaderboard30Days);
                console.log("leaderboard", leaderboard30Days);
            } catch (error) {
                console.error('Failed to fetch leaderboard data:', error);
            }
        };
        

        fetchLeaderboards();
        
    }, []);
    

    const calculateVolume = () => {
        let volume = 0;
        leaderboard30Days.forEach((item) => {
            volume += item.totalVolume;
        });
        return volume / LAMPORTS_PER_SOL;
    };

    const calculateFees = () => {
        const volume = calculateVolume();
        return volume * FEE_PERCENTAGE;
    };

    const calculateUniquePlayers = () => {
        const uniquePlayers = new Set();
        leaderboard30Days.forEach((item) => {
            uniquePlayers.add(item.playerAcc);
        });
        return uniquePlayers.size;
    };

    const calculateVolume24 = () => {
      let volume = 0;
      leaderboard1Day.forEach((item) => {
          volume += item.totalVolume;
      });
      return volume / LAMPORTS_PER_SOL;
  };

  const calculateFees24 = () => {
      const volume = calculateVolume24();
      return volume * FEE_PERCENTAGE;
  };

  const calculateUniquePlayers24 = () => {
      const uniquePlayers = new Set();
      leaderboard1Day.forEach((item) => {
          uniquePlayers.add(item.playerAcc);
      });
      return uniquePlayers.size;
  };

  useEffect(() => {
    // fetch leaderboard data...
  
    if (userPublicKey) {
      const userStats = leaderboardallDays.find(user => user.playerAcc === userPublicKey);
      setUserData(userStats);
    }
  }, [userPublicKey, leaderboardallDays]);
  




    return (
        <div className="flex justify-center">
            <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] ">
                <h1 className="text-center text-4xl mt-2 lg:text-5xl font-bold text-transparent bg-clip-text bg-slate-300">
                    Statistics
                </h1>
                <h2 className="text-start text-2xl ml-2 mt-2 font-bold text-transparent bg-clip-text bg-slate-300">
                    Personal statistics
                </h2>
                <div className="custom-scrollbar w-[100%] h-[240px] bg-[#232332] mt-2 rounded shadow-component border-t-2 border-gray-500 rounded">
  { !userPublicKey ?
    <div className="flex justify-center items-center h-full bg-[#232332] rounded">
      <div className={`flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[28%] h-[200px] bg-[#1a1a25] rounded shadow-component ${!userPublicKey ? "blur" : ""}`}>
Trader<FaUser  size="2.75em"  className="mt-2"/> {userData?.playerAcc.slice(0, 3)}...{userData?.playerAcc.slice(-3)}</div>
<div className="sm:w-[4%] w-[2%] h-[200px] bg-[#232332] rounded"></div>
<div style={{ position: 'relative' }} className="flex flex-col justify-center items-center text-center text-xl md:text-2xl text-slate-300 w-[28%] h-[200px]">

{/* This is your second column */}
<div className={`flex flex-col justify-center items-center text-slate-300 w-[100%] h-[100%] bg-gradient-to-tr from-[#EF4628] to-[#9845E1] rounded shadow-component ${!userPublicKey ? "blur" : ""}`}>
  <div className="flex flex-col justify-center items-center text-lg md:text-xl">
    <FaStairs size="2.3em"  className="mt-2 mb-2" /> Total Trades: {userData?.totalTrades?? 'Not available'}
  </div>
  <div className="flex flex-col justify-center items-center text-lg md:text-xl">
    <FaPaste size="2.3em"  className="mt-2 mb-2" /> Total Volume: {userData?.totalVolume/LAMPORTS_PER_SOL ?? 'Not available'}
  </div>
</div>

{/* This is your 'Connect Wallet' text */}
<div 
  style={{ 
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)', 
    zIndex: 100, 
    color: '#fff',
    padding: '1 2em',
  }}
  className="border-2 border-gray-500 font-semibold connect-wallet-button bg-[#1a1a25] rounded text-slate-300 pl-2 pr-2 pt-1 pb-1 scale">
  Connect Wallet
</div>


</div>
                <div className="sm:w-[4%] w-[2%] h-[200px] bg-[#232332] rounded"></div>
                <div className={`flex flex-col justify-center items-center text-center text-xl md:text-2xl text-slate-300 sm:w-[28%] w-[30%] bg-[#1a1a25] rounded shadow-component ${!userPublicKey ? "blur" : ""}`}>
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[100%] h-[50%] bg-[#1a1a25] rounded">
                <ImStatsBars size="2.3em"  className="mt-2 mb-2" /> Win Ratio: {
    userData?.winRate
    ? (userData.winRate * 100).toFixed(1) + " %"
    : '-'
  }</div>
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[100%] h-[50%] bg-[#1a1a25] rounded">
                <FaMoneyBill size="2.3em"  className="mt-2 mb-2" /> PnL: {userData?.PnL/LAMPORTS_PER_SOL + " SOL" ?? '-'}</div>
                </div>
    </div>
    :
    <div className="flex justify-center items-center h-[100%]">
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 sm:w-[28%] w-[30%] h-[200px] bg-[#1a1a25] rounded shadow-component">
Trader<FaUser  size="2.75em"  className="mt-2"/> {userData?.playerAcc.slice(0, 3)}...{userData?.playerAcc.slice(-3)}</div>
                <div className="sm:w-[4%] w-[2%] h-[200px] bg-[#232332] rounded"></div>
                <div className="flex flex-col justify-center items-center text-center text-xl md:text-2xl text-slate-300 sm:w-[28%] w-[30%] h-[200px] bg-[#1a1a25] rounded shadow-component">
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[100%] h-[50%] bg-[#1a1a25] rounded">
                <FaStairs size="2.3em"  className="mt-2 mb-2" /> Total Trades: {userData?.totalTrades?? '-'}</div>
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[100%] h-[50%] bg-[#1a1a25] rounded">
                <FaPaste size="2.3em"  className="mt-2 mb-2" /> Total Volume: {userData?.totalVolume/LAMPORTS_PER_SOL ?? '-'}</div>
                </div>
                <div className="sm:w-[4%] w-[2%] h-[200px] bg-[#232332] rounded"></div>
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 sm:w-[28%] w-[30%] h-[200px] bg-[#1a1a25] rounded shadow-component">
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[100%] h-[50%] bg-[#1a1a25] rounded">
                <ImStatsBars size="2.3em"  className="mt-2 mb-2" /> Win Ratio: {
    userData?.winRate
    ? (userData.winRate * 100).toFixed(1) + " %"
    : '-'
  }</div>
                <div className="flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 w-[100%] h-[50%] bg-[#1a1a25] rounded">
                <FaMoneyBill size="2.3em"  className="mt-2 mb-2" /> PnL: {userData?.PnL/LAMPORTS_PER_SOL + " SOL" ?? '-'}</div>
                </div>
                </div>
                  }
                  </div>
                <h2 className="text-start text-2xl ml-2 mt-2 font-bold text-transparent bg-clip-text bg-slate-300">
                    Protocol statistics
                </h2>
                <div className="custom-scrollbar w-[100%] h-[240px] bg-[#232332] mt-2 rounded shadow-component border-t-2 border-gray-500">
                    <div className="flex justify-center items-center h-[100%]">
                    <div className="flex flex-col justify-center items-center text-center text-xl md:text-2xl text-slate-300 sm:w-[28%] w-[30%] h-[200px] bg-[#1a1a25] rounded shadow-component">
                        <div>Volume (24h) </div> <FaPaste size="2.3em"  className="mt-2 mb-2" /><div className="text-lg md:text-xl">{calculateVolume().toFixed(2)} SOL ({calculateVolume24().toFixed(2)} SOL)
                        </div></div>
                        <div className="sm:w-[4%] w-[2%] h-[200px] bg-[#232332] rounded"></div>
                        <div className="flex flex-col justify-center items-center text-center text-xl md:text-2xl text-slate-300 sm:w-[28%] w-[30%] h-[200px] bg-[#1a1a25] rounded shadow-component">
                        <div>Fees (24h) </div> <FaCoins size="2.3em"  className="mt-2 mb-2"/>
                        <div className="text-lg md:text-xl">{calculateFees().toFixed(2)} SOL ({calculateFees24().toFixed(2)} SOL)
                        </div></div>
                        <div className="sm:w-[4%] w-[2%] h-[200px] bg-[#232332] rounded"></div>
                        <div className="flex flex-col justify-center items-center text-center text-xl md:text-2xl text-slate-300 sm:w-[28%] w-[30%] h-[200px] bg-[#1a1a25] rounded shadow-component">
                        <div>Traders (24h) </div> <FaUsers  size="2.75em"  className=""/><div className="text-lg md:text-xl">{calculateUniquePlayers()} ({calculateUniquePlayers24()})
                        </div></div>
                    </div>
                </div>
                <h2 className="text-start text-2xl ml-2 mt-2 font-bold text-transparent bg-clip-text bg-slate-300">
                    Leaderboards
                </h2>
                <div>
                </div>
                <div className="custom-scrollbar overflow-auto w-[100%] h-[600px] bg-[#232332] mt-2 rounded shadow-component border-t-2 border-gray-500">
                    <div className="flex justify-center mt-1 mb-1">
                    <button
    onClick={() => setCurrentLeaderboard(leaderboard1Day)}
    className={`text-lg transition-colors ease-in-out duration-500 hover:bg-[#1a1a25] hover:text-white transform hover:scale-110 w-[70px] ${
        currentLeaderboard === leaderboard1Day
            ? 'font-bold cursor-pointer border-b-2 border-gradient rounded bg-[#232332]'
            : 'cursor-pointer text-slate-300 font-semibold rounded bg-[#232332]'
    } ${currentLeaderboard !== leaderboard1Day ? 'text-gray-500' : ''} ml-4`}
>
    1 DAY
</button>
<button
    onClick={() => setCurrentLeaderboard(leaderboard7Days)}
    className={`text-lg transition-colors ease-in-out duration-500 hover:bg-[#1a1a25] hover:text-white transform hover:scale-110 w-[70px] ${
        currentLeaderboard === leaderboard7Days
            ? 'font-bold cursor-pointer border-b-2 border-gradient rounded bg-[#232332]'
            : 'cursor-pointer text-slate-300 font-semibold rounded bg-[#232332]'
    } ${currentLeaderboard !== leaderboard7Days ? 'text-gray-500' : ''} ml-4`}
>
    7 DAYS
</button>
<button
    onClick={() => setCurrentLeaderboard(leaderboard30Days)}
    className={`text-lg transition-colors ease-in-out duration-500 hover:bg-[#1a1a25] hover:text-white transform hover:scale-110 w-[90px] ${
        currentLeaderboard === leaderboard30Days
            ? 'font-bold cursor-pointer border-b-2 border-gradient rounded bg-[#232332]'
            : 'cursor-pointer text-slate-300 font-semibold rounded bg-[#232332]'
    } ${currentLeaderboard !== leaderboard30Days ? 'text-gray-500' : ''} ml-4`}
>
    30 DAYS
</button>
<button
    onClick={() => setCurrentLeaderboard(leaderboardallDays)}
    className={`text-lg transition-colors ease-in-out duration-500 hover:bg-[#1a1a25] hover:text-white transform hover:scale-110 w-[90px] ${
        currentLeaderboard === leaderboardallDays
            ? 'font-bold cursor-pointer border-b-2 border-gradient rounded bg-[#232332]'
            : 'cursor-pointer text-slate-300 font-semibold rounded bg-[#232332]'
    } ${currentLeaderboard !== leaderboardallDays ? 'text-gray-500' : ''} ml-4`}
>
    ALL TIME
</button>

                    </div>
                    <table className="w-[100%] mt-2 bg-[#232332]">
                        <thead className="w-[100%] text-slate-300 overflow-x-scroll">
                            <tr>
                                <th className="w-[5%] text-start font-semibold pb-3 pl-2">
                                    #
                                </th>
                                <th className="w-[23%] text-start font-semibold pb-3 ">
                                    USER
                                </th>
                                <th className="w-[18.75%] text-center font-semibold pb-3 ">
                                    TOTAL TRADES
                                </th>
                                <th className="w-[18.75%] text-center font-semibold pb-3 ">
                                    TOTAL VOLUME
                                </th>
                                <th className="w-[18.75%] text-center font-semibold pb-3">
                                    WIN RATIO
                                </th>
                                <th className="w-[18.75%] text-center font-semibold pb-3 ">
                                    PnL
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeaderboard.map((item, index) => {
                                const isEvenRow = index % 2 === 0;
                                const rowStyle = {
                                    backgroundColor: isEvenRow ? '#232332' : '#1a1a25',
                                };
                                return (
                                    <tr key={index} style={rowStyle}>
                                        <td
                                            style={{
                                                color:
                                                    index === 0
                                                        ? 'gold'
                                                        : index === 1
                                                        ? 'silver'
                                                        : index === 2
                                                        ? '#cd7f32'
                                                        : '#cbd5e1',
                                            }}
                                            className="pt-1.5 pb-1.5 pl-2"
                                        >
                                            {index + 1}
                                        </td>
                                        <td
                                            style={{
                                                color:
                                                    index === 0
                                                        ? 'gold'
                                                        : index === 1
                                                        ? 'silver'
                                                        : index === 2
                                                        ? '#cd7f32'
                                                        : '#cbd5e1',
                                            }}
                                            className="flex items-center"
                                        >
                                            <img
                                                className="mr-1 sm:mr-2 pt-2.5 sm:pt-2 pb-2 flex items-center"
                                                src={`data:image/png;base64,${new Identicon(
                                                    item.playerAcc,
                                                    { size: 20, format: 'png' }
                                                ).toString()}`}
                                                alt="identicon"
                                            />
                                            <div className="sm:pt-0">
                                            <a
                  href={`https://solscan.io/account/${item.playerAcc}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                                            {`${item.playerAcc.slice(0, 3)}...${item.playerAcc.slice(-3)}`}
                                            </a>
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                color:
                                                    index === 0
                                                        ? 'gold'
                                                        : index === 1
                                                        ? 'silver'
                                                        : index === 2
                                                        ? '#cd7f32'
                                                        : '#cbd5e1',
                                            }}
                                            className="text-center">
                                            {item.totalTrades}
                                        </td>
                                        <td
                                            style={{
                                                color:
                                                    index === 0
                                                        ? 'gold'
                                                        : index === 1
                                                        ? 'silver'
                                                        : index === 2
                                                        ? '#cd7f32'
                                                        : '#cbd5e1',
                                            }}
                                            className="text-center">
                                            {item.totalVolume / LAMPORTS_PER_SOL} SOL
                                        </td>
                                        <td
                                            style={{
                                                color:
                                                    index === 0
                                                        ? 'gold'
                                                        : index === 1
                                                        ? 'silver'
                                                        : index === 2
                                                        ? '#cd7f32'
                                                        : '#cbd5e1',
                                            }}
                                            className="text-center">
                                            {Number.isInteger(100 * item.winRate) ? 
    (100 * item.winRate) : 
    (100 * item.winRate).toFixed(1)
} %


                                        </td>
                                        <td
                                            style={{
                                                color:
                                                    index === 0
                                                        ? 'gold'
                                                        : index === 1
                                                        ? 'silver'
                                                        : index === 2
                                                        ? '#cd7f32'
                                                        : '#cbd5e1',
                                            }}
                                            className="text-center">
                                            {item.PnL / LAMPORTS_PER_SOL} SOL
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Stats;
