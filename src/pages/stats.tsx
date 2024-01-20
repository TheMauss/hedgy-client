import Head from "next/head";
import { FC, useEffect, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { initializeUserAcc } from "../out/instructions/initializeUserAcc"; // Update with the correct path
import io from 'socket.io-client';
import { PROGRAM_ID } from '../out/programId';
import { UserAccount  } from "../out/accounts/UserAccount"; // Update with the correct path
import { notify } from "utils/notifications";
import { AffiliateAccount  } from "../out/accounts/AffiliateAccount";
import { setAffilAcc, SetAffilAccArgs, SetAffilAccAccounts } from "../out/instructions/setAffilAcc"; // Update with the correct path
import { Connection, SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import useUserSOLBalanceStore from '../../src/stores/useUserSOLBalanceStore';



const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );

type UserStatsType = {
    playerAcc: string,
    totalTrades: number,
    totalVolume: number,
    winRate: number,
    creationTime: number,
    PnL: number,
    Fees: number,
    // other fields...
  };

  async function doesUserhaveAffiliateCode(account: PublicKey, connection: Connection): Promise<{ hasCode: boolean; usedAffiliate: Uint8Array; creationTime: number, isInitialized: boolean }> {
    const accountInfo = await connection.getAccountInfo(account);

    if (!accountInfo) {
        console.error("Account not found or not fetched properly.");
        return { hasCode: false, usedAffiliate: new Uint8Array(8), creationTime: 0, isInitialized: false }; // default value
    }

    // Convert the buffer from Solana into a Buffer type that's used by Borsh
    const bufferData = Buffer.from(accountInfo.data);

    let userAccount;
    try {
        // Use the UserAccount class to decode the data
        userAccount = UserAccount.decode(bufferData);
    } catch (error) {
        console.error("Failed to decode user account data:", error);
        return { hasCode: false, usedAffiliate: new Uint8Array(8), creationTime: 0, isInitialized: false }; // default value
    }



    // Convert BN to number
    const creationTimeNumber = userAccount.creationTime.toNumber();
    const hasCode = userAccount.usedAffiliate.some(value => value !== 0);
    return {
        hasCode,
        usedAffiliate: userAccount.usedAffiliate,
        creationTime: creationTimeNumber,
        isInitialized: userAccount.isInitialized // Assuming userAccount has an isInitialized property
    };
}

async function checkAffiliateInitialization(affiliatePublicKey: PublicKey, connection: Connection): Promise<{ IsInitialized: boolean }> {
    const accountInfo = await connection.getAccountInfo(affiliatePublicKey);
    
    if (!accountInfo) {
        return { IsInitialized: false };
    }

    // Convert the buffer from Solana into a Buffer type that's used by Borsh
    const bufferData = Buffer.from(accountInfo.data);

    let affiliateAccount;
    try {
        // Use the AffiliateAccount class to decode the data
        affiliateAccount = AffiliateAccount.decode(bufferData);
    } catch (error) {
        console.error("Failed to decode affiliate account data:", error);
        throw error;
    }

    return {
        IsInitialized: affiliateAccount.isInitialized  // assuming isInitialized is a method
    };
}




function affiliateCodeToUint8Array(input: string): Uint8Array {
    const byteArray = new Uint8Array(8).fill(0);
    for (let i = 0; i < 8 && i < input.length; i++) {
        byteArray[i] = input.charCodeAt(i);
    }
    return byteArray;
}

const Stats: FC = () => {
    const [leaderboard1Day, setLeaderboard1Day] = useState([]);
    const [leaderboard7Days, setLeaderboard7Days] = useState([]);
    const [leaderboard30Days, setLeaderboard30Days] = useState([]);
    const [leaderboardallDays, setLeaderboardallDays] = useState([]);
    const [currentLeaderboard, setCurrentLeaderboard] = useState([]);
    const [userData, setUserData] = useState<UserStatsType | null>(null);
    const [hasAffiliate, setHasAffiliate] = useState<boolean | null>(null);
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [affiliateCode, setAffiliateCode] = useState<string>('');
    const [usedAffiliate, setUsedAffiliate] = useState<Uint8Array>(new Uint8Array());
    const [accOld, setAccOld] = useState<number>(null);
    const [issInt, setIssInt] = useState <boolean>(null);
    const balance = useUserSOLBalanceStore((s) => s.balance);
    const { getUserSOLBalance } = useUserSOLBalanceStore();

    const [isCompetition, setIsCompetition] = useState(false);
    const [isTeamCompetition, setIsTeamCompetition] = useState(false);
    const [leaderboardCompetetion, setLeaderboardCompetetion] = useState([]);
    const [teamLeaderboard, setTeamLeaderboard] = useState([]);



    const LAMPORTS_PER_SOL = 1_000_000_000;
    const FEE_PERCENTAGE = 0.05;
    const wallet = useWallet();
    const userPublicKey = wallet.publicKey?.toBase58();

    useEffect(() => {
        const fetchUserAcc = async () => {
            if (!publicKey) {
                return; // Exit if publicKey is not defined
            }
    
            try {
                const seedsUser = [
                    Buffer.from(publicKey.toBytes()),
                ];
                
                const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);
                const result = await doesUserhaveAffiliateCode(userAcc, connection);
                
    
                setHasAffiliate(result.hasCode);
                setUsedAffiliate(result.usedAffiliate);
    
                if (!result.hasCode) {
                    setUsedAffiliate(result.usedAffiliate);
    
                    setAccOld(result.creationTime);
    
                    setIssInt(result.isInitialized);
                }
            } catch (error) {
                console.error("Error fetching user account or affiliate code:", error);
            }
        };
    
        fetchUserAcc();
    }, [publicKey, connection]);
    
    

    const onClick = useCallback(async () => {// Create the instruction to initialize the user account    const handleAffiliateTransaction = async () => {
      if (!publicKey) {
        notify({ type: 'info', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
        return;
      }
      const seedsUser = [
            Buffer.from(publicKey.toBytes()),
            ];

            const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);


            // Prompt the user for input or whatever logic you want here

            const seedsAffil = [affiliateCodeToUint8Array(affiliateCode)];
        
              const [AffilAcc] = await PublicKey.findProgramAddress(
                seedsAffil,
                PROGRAM_ID
              );

            const result = await checkAffiliateInitialization(AffilAcc, connection);
            const IsInitialized = result.IsInitialized;
            const isIntUser = issInt;
            const creationTime = accOld;
            const currentTime = Math.floor(Date.now() / 1000);  // Current Unix timestamp in seconds
            const timeDifference = currentTime - creationTime;  

            if (!IsInitialized) {
                notify({ type: 'error', message: 'Referral code does not exist.' });
            }else if (!isIntUser) {
                try {
                    // Create the instruction to initialize the user account
                    const initializeInstruction = initializeUserAcc({
                        userAcc: userAcc,
                        playerAcc: publicKey,
                        systemProgram: SystemProgram.programId,
                        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
                    });
              
                    // Create a new transaction to initialize the user account and send it
                    const initTransaction = new Transaction().add(initializeInstruction);
                    const initSignature = await sendTransaction(initTransaction, connection);
                    
                    // Wait for transaction confirmation
                    notify({ type: 'info', message: `Trying to create Trading Account` });
                    await connection.confirmTransaction(initSignature, 'confirmed');
                    setIssInt(true);
                    setAccOld(currentTime-1);
                    notify({ type: 'success', message: `Trading account successfully created, now enter the Referral.` });

                } catch (error) {
                    notify({ type: 'error', message: `Creating Trading account failed`, description: error?.message });
                }             } else if (timeDifference >= 24 * 60 * 60) {
                notify({ type: 'error', message: 'Referrals can only be used on accounts created within less than 24 hours.' });
            } else {
            const setAffiliateArgs: SetAffilAccArgs = {
                usedAffiliate: Array.from(affiliateCodeToUint8Array(affiliateCode)), // This is just an example; you will replace with actual data
            };
    
            const setAffilAccs: SetAffilAccAccounts = {
                userAcc: userAcc,  // Just a placeholder; replace with actual account
                affilAcc: AffilAcc, // Placeholder
                playerAcc: publicKey, // Placeholder
                systemProgram: SystemProgram.programId, // Using the SystemProgram's programId
                clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
            };
    
            const initTransaction = new Transaction().add(setAffilAcc(setAffiliateArgs, setAffilAccs));
            
            try {
                const initSignature = await sendTransaction(initTransaction, connection);
                    // Notify user that the transaction was sent
    notify({ type: 'info', message: `Trying to use the referral code...`, txid: initSignature });
                // Wait for transaction confirmation
                await connection.confirmTransaction(initSignature, 'confirmed');
                setHasAffiliate(true);
                setUsedAffiliate(affiliateCodeToUint8Array(affiliateCode));
                notify({ type: 'success', message: `Referral code has been used.`, txid: initSignature });
            } catch (error: any) {
                // In case of an error, show only the 'error' notification
                notify({ type: 'error', message: `Using the Referral code failed`, description: error?.message });
                return;
            }
            // Now, you can send this instruction in a transaction using Solana's web3.js library.
        }}
    , [issInt, , accOld, affiliateCode, publicKey, connection, sendTransaction, notify]);



    
    const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT8;
    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const resCompetition = await fetch(`${ENDPOINT}/api/leaderboard/competition`);
                const leaderboardCompetetion = await resCompetition.json();

                const teamCompetition = await fetch(`${ENDPOINT}/api/leaderboard/team`);
                const teamCompetitions = await teamCompetition.json();

                const res1Day = await fetch(`${ENDPOINT}/api/leaderboard/1`);
                const leaderboard1Day = await res1Day.json();
    
                const res7Days = await fetch(`${ENDPOINT}/api/leaderboard/7`);
                const leaderboard7Days = await res7Days.json();
    


                const res30Days = await fetch(`${ENDPOINT}/api/leaderboard/30`);
                const leaderboard30Days = await res30Days.json();
    
                const resallDays = await fetch(`${ENDPOINT}/api/leaderboard/all`);
                const leaderboardallDaysData = await resallDays.json();
                const leaderboardallDays = leaderboardallDaysData.slice();
    

                
                
                setLeaderboard1Day(leaderboard1Day);
                setLeaderboard7Days(leaderboard7Days);
                setLeaderboard30Days(leaderboard30Days);
                setLeaderboardCompetetion(leaderboardCompetetion);
                setLeaderboardallDays(leaderboardallDays);
                setTeamLeaderboard(teamCompetitions);
                if (!isCompetition) {
                setCurrentLeaderboard(leaderboard30Days)}
                else {setCurrentLeaderboard(leaderboardCompetetion)}
            } catch (error) {
                console.error('Failed to fetch leaderboard data:', error);
            }
        };
        

        fetchLeaderboards();
        
    }, []);
    

    const calculateVolume = () => {
        let volume = 0;
        leaderboardallDays.forEach((item) => {
            volume += 2 * item.totalVolume;
        });
        return volume / LAMPORTS_PER_SOL;
    };

    const calculateFees = () => {
        let fees = 0;
        leaderboardallDays.forEach((item) => {
            fees += item.Fees;
        });
        return fees / LAMPORTS_PER_SOL;
    };

    const calculateUniquePlayers = () => {
        const uniquePlayers = new Set();
        leaderboardallDays.forEach((item) => {
            uniquePlayers.add(item.playerAcc);
        });
        return uniquePlayers.size;
    };

    const calculateVolume24 = () => {
      let volume = 0;
      leaderboard1Day.forEach((item) => {
          volume += 2 * item.totalVolume;
      });
      return volume / LAMPORTS_PER_SOL;
  };

  const calculateFees24 = () => {
    let fees = 0;
    leaderboard1Day.forEach((item) => {
        fees += item.Fees;
    });
    return fees / LAMPORTS_PER_SOL;
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
  
  const [decodedString, setDecodedString] = useState("");

  useEffect(() => {
    if (usedAffiliate && usedAffiliate.length > 0) {
        const decoded = Array.from(usedAffiliate)
                             .filter(byte => byte !== 0)
                             .map(byte => String.fromCharCode(byte))
                             .join('');

        setDecodedString(decoded);
    } else {
        setDecodedString("");
        
    }
}, [usedAffiliate]);

const [activeSection, setActiveSection] = useState('protocol');
const showPersonal = () => setActiveSection('personal');
const showProtocol = () => setActiveSection('protocol');



  

    return (
        <div>
        <Head>
          <title>PopFi | Stats</title>
          <meta name="description" content="PopFi" />
        </Head>
        <div className="bg-base flex justify-center md:pt-2 min-h-[calc(100vh-94px)]">
            <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[780px] md:min-w-[780px] sm:min-w-[95%] ">
            <div className="bankGothic flex flex-col  gap-[8px] text-4xl mt-2 lg:text-5xl text-white">
            <h1 className="bankGothic md:text-start text-center text-4xl mt-2 lg:text-5xl text-transparent bg-clip-text bg-white">
                    Statistics
                </h1>        

      </div>
      <img
                                        className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
                                                     alt=""
                                                 src="/sheesh/donut1.svg"
                                                        />
        <div className="w-full flex md:flex-row flex-col gap-2 md:px-0 px-2 z-10">
      <div className="w-full flex justify-center md:justify-start items-center gap-4">
        <button onClick={showProtocol} className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
              activeSection === 'protocol'? 'cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
            } ${activeSection === 'personal' ? '' : 'text-gray-text'} `}>PROTOCOL</button>
      </div>
      {!hasAffiliate ? (
      <div className="z-10 w-full md:w-[350px] self-stretch rounded-lg bg-layer-1 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-gryy-text border-[1px] hover:bg-[#484c6d5b] border-solid border-layer-3 ">
            <input       
                                         className="w-full h-full input3-capsule__input relative leading-[14px] "
                                         type="text"
                                         id="affiliateCode"
                                         value={affiliateCode}
                                         onChange={(e) => setAffiliateCode(e.target.value)}
                                         maxLength={8}
                                         placeholder="Enter Promo Code"
                                     />
        <button 
        onClick={onClick}
        className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
          APPLY
        </button>
      </div>)
      :(

        <div className="z-10 font-poppins w-full md:w-[350px] self-stretch rounded-lg bg-layer-1 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey-text border-[1px] hover:bg-[#484c6d5b] border-solid border-layer-3 ">
        Used Code
    <div 
    className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
      {decodedString}
    </div>
  </div>
      )}
      </div>

           
      {(activeSection === 'personal') ? (      <div className="z-10 mt-4 w-full flex md:flex-row flex-col items-start justify-start gap-[8px] md:px-0 px-2">
      <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
          <img
            className="relative w-[60px] h-[60px]"
            alt=""
            src="/sheesh/icons21.svg"
          /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
          <div className="relative leading-[100%] font-medium text-center">TRADER</div>
          <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
          {userData?.playerAcc.slice(0, 3)}...{userData?.playerAcc.slice(-3)}
          </div></div>
        </div>
        <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
          <img
            className="relative w-[60px] h-[60px]"
            alt=""
            src="/sheesh/icons22.svg"
          /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
          <div className="relative leading-[100%] font-medium text-center">
            TRADES
          </div>
          <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
          {userData?.totalTrades?? '-'}
          </div></div>
        </div>
        <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
          <img
            className="relative w-[60px] h-[60px]"
            alt=""
            src="/sheesh/icons23.svg"
          /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
          <div className="relative leading-[100%] font-medium text-center">
            VOLUME
          </div>
          <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
          {userData?.totalVolume !== undefined ? (userData.totalVolume / LAMPORTS_PER_SOL).toFixed(1) + 'SOL': '-'} 

          </div></div>
        </div>
        <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
          <img
            className="relative w-[60px] h-[60px]"
            alt=""
            src="/sheesh/icons24.svg"
          /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
          <div className="relative leading-[100%] font-medium text-center">WIN RATIO</div>
          <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
            {
    userData?.winRate
    ? (userData.winRate * 100).toFixed(1) + " %"
    : '-'
  }
          </div></div>
        </div>
        <div className="z-10 md:w-1/5 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
          <img
            className="relative w-[60px] h-[60px]"
            alt=""
            src="/sheesh/icons25.svg"
          /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
          <div className="relative leading-[100%] font-medium text-center">PnL</div>
          <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
          {userData?.PnL !== undefined ? (userData?.PnL/LAMPORTS_PER_SOL).toFixed(1) + " SOL" : '-'}
          </div></div>
        </div>
      </div>

): (      <div className="mt-4 w-full flex md:flex-row flex-col items-start justify-start gap-[8px] md:px-0 px-2">
<div className="md:w-1/3 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
  <img
    className="relative w-[60px] h-[60px]"
    alt=""
    src="/sheesh/icons18.svg"
  /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
  <div className="relative leading-[100%] font-medium md:text-center">TOTAL VOLUME (24H)</div>
  <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
  {calculateVolume().toFixed(1)} SOL ({calculateVolume24().toFixed(1)})
  </div></div>
</div>
<div className="z-10 md:w-1/3 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
  <img
    className="relative w-[60px] h-[60px]"
    alt=""
    src="/sheesh/icons19.svg"
  /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
  <div className="relative leading-[100%] font-medium md:text-center">
  TOTAL FEES (24H)
  </div>
  <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
  {calculateFees().toFixed(2)} SOL ({calculateFees24().toFixed(2)})
  </div></div>
</div>
<div className="z-10 md:w-1/3 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-row md:flex-col items-center justify-start md:justify-center md:p-6 p-4 gap-[8px] border-[1px] border-solid border-layer-3">
  <img
    className="relative w-[60px] h-[60px]"
    alt=""
    src="/sheesh/icons20.svg"
  /><div className="h-[60px] flex flex-col justify-center items-start md:items-center">
  <div className="relative leading-[100%] font-medium md:text-center">
  TRADERS (24H)
  </div>
  <div className="pt-2 relative text-xl leading-[100%] font-medium font-poppins text-white text-left md:text-center">
  {calculateUniquePlayers()} ({calculateUniquePlayers24()})</div>
</div></div>
</div>

)}
                {isTeamCompetition && (
      <h1 className="pt-6 bankGothic md:text-start md:text-left text-center text-4xl lg:text-5xl text-transparent bg-clip-text bg-white">
                    DAO WARS
                </h1> )}
                {isTeamCompetition && (               
<div 

className="md:px-0 px-2 mt-4 flex flex md:flex-row flex-col items-start justify-start gap-[8px] text-5xl text-white">
        {teamLeaderboard.slice(0,3).map((item, index) => {
  
  return (
  <div 
  key={item}
  className="w-full text-3xl flex flex-col md:flex-row items-start justify-start gap-[8px]">
    <div className="z-10 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-col items-center justify-center pt-4 px-4 pb-6 gap-[16px] border-[1px] border-solid border-layer-3">
      <div className="flex flex-col items-center justify-center gap-[4px]">
      <img
                className="relative w-[84.7px] h-[80.9px]"
                alt=""
                src={`/${item.teamName}.png`}
              />
        <div 
        
        className="relative leading-[100%] font-medium flex flex-row items-center justify-center gap-2">
             <img
    className=" w-[24px] h-[24px]"
    alt=""
    src={`/sheesh/${24 + index}.svg`}
  /><a
    >        {`${item.teamName}`}</a>
        </div>
      </div>
      <div className="self-stretch flex flex-row items-center justify-between text-right text-xs text-grey-text font-poppins">
        <div className="flex flex-col items-start justify-center gap-[16px]">
          <div className="flex flex-col items-start justify-center gap-[4px]">
            <div className="relative leading-[12px]">Total Trades</div>
            <div className="relative text-[15px] leading-[12px] text-white">
            {item.totalTrades}
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-[4px]">
            <div className="relative leading-[12px]">Total Volume</div>
            <div className="relative text-[15px] leading-[12px] text-white">
            {(item.totalVolume / LAMPORTS_PER_SOL * 2).toFixed(1)} SOL
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center gap-[16px]">
          <div className="flex flex-col items-end justify-center gap-[4px]">
            <div className="relative leading-[12px]">Win Ratio</div>
            <div className="relative text-[15px] leading-[12px] text-white">
            {Number.isInteger(100 * item.winRate) ? 
     (100 * item.winRate) : 
      (100 * item.winRate).toFixed(1)
        } %
            </div>
          </div>
          <div className="flex flex-col items-end justify-center gap-[4px]">
            <div className="relative leading-[12px]">PnL</div>
            <div className="relative text-[15px] leading-[12px] text-white">
            {(item.PnL / LAMPORTS_PER_SOL).toFixed(2)} SOL
            </div>
          </div>
        </div>
      </div>
    </div></div>)})}
  </div>)}

      <div className="flex flex-col md:items-start items-center text-13xl text-white">
      <h1 className="pt-6 bankGothic md:text-start md:text-left text-center text-4xl lg:text-5xl text-transparent bg-clip-text bg-white">
                    Leaderboard
                </h1>          <div className="flex flex-row items-start justify-start gap-[16px] text-lg text-grey-text">
                {!isCompetition && (
          <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
            <div 
            onClick={() => setCurrentLeaderboard(leaderboard1Day)}
            className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                currentLeaderboard === leaderboard1Day ? ' cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
              } ${currentLeaderboard == leaderboard1Day ? 'text-white' : 'text-gray-text'} `}>1 DAY</div>
          </button>)}
          {!isCompetition && (
          <button className="flex flex-row items-center justify-center py-1 px-0">
            <div 
            onClick={() => setCurrentLeaderboard(leaderboard7Days)}
            className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                currentLeaderboard === leaderboard7Days ? ' cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
              } ${currentLeaderboard == leaderboard7Days ? 'text-white' : 'text-gray-text'} `}>7 DAYS</div>
          </button>)}
          {isCompetition && (
  <button className="flex flex-row items-center justify-center py-1 px-0 text-white">
    <div 
      onClick={() => setCurrentLeaderboard(leaderboardCompetetion)}
      className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
          currentLeaderboard === leaderboardCompetetion ? ' cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
        } ${currentLeaderboard == leaderboardCompetetion ? 'text-white' : 'text-gray-text'} `}>COMPETITION</div>
  </button>
)}
          <button className="flex flex-row items-center justify-center py-1 px-0">
            <div 
                onClick={() => setCurrentLeaderboard(leaderboard30Days)}

                className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                    currentLeaderboard === leaderboard30Days ? ' cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
                  } ${currentLeaderboard == leaderboard30Days ? 'text-white' : 'text-gray-text'} `}>30 DAYS</div>
          </button>
          <button className="flex flex-row items-center justify-center py-1 px-0">
            <div 
                onClick={() => setCurrentLeaderboard(leaderboardallDays)}

                className={`text-xl leading-[30px] bankGothic transition-colors duration-300 ease-in-out ${
                    currentLeaderboard === leaderboardallDays ? ' cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
                  } ${currentLeaderboard == leaderboardallDays ? 'text-white' : 'text-gray-text'} `}>ALL TIME</div>
          </button>

        </div>
      </div>

      <div 

      className="md:px-0 px-2 mt-4 flex flex md:flex-row flex-col items-start justify-start gap-[8px] text-5xl text-white">
              {currentLeaderboard.slice(0,3).map((item, index) => {
        
        return (
        <div 
        key={item}
        className="w-full text-3xl flex flex-col md:flex-row items-start justify-start gap-[8px]">
          <div className="z-10 w-full rounded-lg md:rounded-2xl bg-layer-1 flex flex-col items-center justify-center pt-4 px-4 pb-6 gap-[16px] border-[1px] border-solid border-layer-3">
            <div className="flex flex-col items-center justify-center gap-[4px]">
              <img
                className="relative w-[84.7px] h-[80.9px]"
                alt=""
                src={`/sheesh/${24 + index}.svg`}
              />
              <div 
              
              className="relative leading-[100%] font-medium">
                   <a
            href={`https://solscan.io/account/${item.playerAcc}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >{`${item.playerAcc.slice(0, 3)}...${item.playerAcc.slice(-3)}`}</a>
              </div>
            </div>
            <div className="self-stretch flex flex-row items-center justify-between text-right text-xs text-grey-text font-poppins">
              <div className="flex flex-col items-start justify-center gap-[16px]">
                <div className="flex flex-col items-start justify-center gap-[4px]">
                  <div className="relative leading-[12px]">Total Trades</div>
                  <div className="relative text-[15px] leading-[12px] text-white">
                  {item.totalTrades}
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center gap-[4px]">
                  <div className="relative leading-[12px]">Total Volume</div>
                  <div className="relative text-[15px] leading-[12px] text-white">
                  {(item.totalVolume / LAMPORTS_PER_SOL * 2).toFixed(1)} SOL
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center gap-[16px]">
                <div className="flex flex-col items-end justify-center gap-[4px]">
                  <div className="relative leading-[12px]">Win Ratio</div>
                  <div className="relative text-[15px] leading-[12px] text-white">
                  {Number.isInteger(100 * item.winRate) ? 
           (100 * item.winRate) : 
            (100 * item.winRate).toFixed(1)
              } %
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-[4px]">
                  <div className="relative leading-[12px]">PnL</div>
                  <div className="relative text-[15px] leading-[12px] text-white">
                  {(item.PnL / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </div>
                </div>
              </div>
            </div>
          </div></div>)})}
        </div>
        <div className="md:px-0 px-2">
        <div className="z-10 h-[600px] overflow-scroll custom-scrollbar mt-2 rounded-lg bg-layer-1 box-border w-full overflow-hidden flex flex-col items-start justify-start p-4 gap-[16px] text-right font-poppins border-[1px] border-solid border-layer-3">
        <table className="w-full relative h-3 text-sm text-grey-text text-end ">
      <thead>
        <tr>
          <th className=" font-normal w-[3%] leading-[9.98px] text-start font-poppins">#</th>
          <th className=" font-normal w-[8%] leading-[9.98px] text-start font-poppins">User</th>
          <th className=" font-normal w-[13%] leading-[12px] ">Total Trades</th>
          <th className=" font-normal w-[13%] leading-[12px] ">Total Volume</th>
          <th className=" font-normal w-[13%] leading-[12px]">Win Ratio</th>
          <th className=" font-normal w-[13%] leading-[12px]  pb-2">PnL</th>
        </tr>
      </thead>
      <tbody>
      {currentLeaderboard.slice(3).map((item, index) => (
          // Your code for rendering each user in a table row
          <tr key={item.playerAcc} className="text-end text-[15px] shadow-md overflow-scroll">
            <td className="text-start">{index + 4}</td>
            <td 
            
            className="text-start">                                            <a
            href={`https://solscan.io/account/${item.playerAcc}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >{`${item.playerAcc.slice(0, 3)}...${item.playerAcc.slice(-3)}`}</a></td>
            <td className="text-white">{item.totalTrades}</td>
            <td className="text-white"> {(item.totalVolume / LAMPORTS_PER_SOL * 2).toFixed(1)} SOL</td>
            <td className="text-white">                                          {Number.isInteger(100 * item.winRate) ? 
           (100 * item.winRate) : 
            (100 * item.winRate).toFixed(1)
              } %</td>
            <td className="text-white py-2">  {(item.PnL / LAMPORTS_PER_SOL).toFixed(2)} SOL</td>
            {/* ... other user details in table cells */}
          </tr>
        ))}
      </tbody></table>
      </div>
          </div>
            </div>
        </div>

        </div>
        
    );
};

export default Stats;
