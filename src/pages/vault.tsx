import Head from "next/head";
import { FC, useState, useEffect, useCallback } from "react";
import { Connection, SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL, EpochSchedule } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { UserAccount  } from "../out/accounts/UserAccount"; // Update with the correct path
import { LiquidityPoolAccount  } from "../out/accounts/LiquidityPoolAccount";
import { LiquidityProviderAccount  } from "../out/accounts/LiquidityProviderAccount";
import { FaStairs, FaMoneyBill, FaLockOpen, FaLock } from "react-icons/fa6";
import { FaPaste, FaCoins, FaUsers, FaUser } from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';
import { WithdrawFromLiquidityPoolArgs, DepositToLiquidityPoolAccounts, DepositToLiquidityPoolArgs, WithdrawFeeFromLiquidityPoolAccounts, WithdrawFromLiquidityPoolAccounts, initializeLiqProvider, withdrawFeeFromLiquidityPool, withdrawFromLiquidityPool } from "../out/instructions/"; // Update with the correct path
import { PROGRAM_ID } from '../out/programId';
import { notify } from "utils/notifications";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import { depositToLiquidityPool } from "out/instructions";
import { BN } from '@project-serum/anchor';
import moment from 'moment-timezone';






async function checkLPdata(lpAcc: PublicKey, connection: Connection): Promise<{ IsInitialized: boolean, locked: boolean, epoch: number, totalDeposits: number, lpFees: number, pnl: number, cumulativeFeeRate: number, cumulativePnlRate: number   }> {
    const accountInfo = await connection.getAccountInfo(lpAcc);
    
    if (!accountInfo) {
        return { 
            IsInitialized: false,     
            locked: false,
            epoch: 0,
            totalDeposits: 0,
            lpFees: 0,
            pnl: 0,
            cumulativeFeeRate: 0,
            cumulativePnlRate: 0,
        
        };
    }

    // Convert the buffer from Solana into a Buffer type that's used by Borsh
    const bufferData = Buffer.from(accountInfo.data);

    let LpAccount;
    try {
        // Use the AffiliateAccount class to decode the data
        LpAccount = LiquidityPoolAccount.decode(bufferData);
    } catch (error) {
        console.error("Failed to decode affiliate account data:", error);
        throw error;
    }

    return {
        IsInitialized: LpAccount.isInitialized,
        locked: LpAccount.locked,
        epoch: LpAccount.epoch.toNumber(),
        totalDeposits: LpAccount.totalDeposits.toNumber(),
        lpFees: LpAccount.lpFees.toNumber(),
        pnl: LpAccount.pnl.toNumber(),
        cumulativeFeeRate:LpAccount.cumulativeFeeRate.toNumber(),
        cumulativePnlRate: LpAccount.cumulativePnlRate.toNumber(),

    };
}

async function checkLiquidiryProviderAcc(liqProviderAcc: PublicKey, connection: Connection): Promise<{ isInitialized: boolean, lastDepositEpoch: number, lastWithdrawFeeEpoch: number, providerDepositedAmount: number, solEarned: number, lastKnownCumulativeFeeRate: number, lastKnownPnlRate: number,  isActive: boolean   }> {
    const accountInfo = await connection.getAccountInfo(liqProviderAcc);
    
    if (!accountInfo) {
        return { 
            isInitialized: false,
            lastDepositEpoch: 0,
            lastWithdrawFeeEpoch: 0,
            providerDepositedAmount: 0,
            solEarned: 0,
            lastKnownCumulativeFeeRate: 0,
            lastKnownPnlRate: 0,
            isActive: false,
        };
    }

    // Convert the buffer from Solana into a Buffer type that's used by Borsh
    const bufferData = Buffer.from(accountInfo.data);

    let LiqProviderAcc;
    try {
        // Use the AffiliateAccount class to decode the data
        LiqProviderAcc = LiquidityProviderAccount.decode(bufferData);
    } catch (error) {
        console.error("Failed to decode affiliate account data:", error);
        throw error;
    }

    return {
        isInitialized: LiqProviderAcc.isInitialized,
        lastDepositEpoch: LiqProviderAcc.lastDepositEpoch.toNumber(),
        lastWithdrawFeeEpoch: LiqProviderAcc.lastWithdrawFeeEpoch.toNumber(),
        providerDepositedAmount: LiqProviderAcc.providerDepositedAmount.toNumber(),
        solEarned: LiqProviderAcc.solEarned.toNumber(),
        lastKnownCumulativeFeeRate: LiqProviderAcc.lastKnownCumulativeFeeRate.toNumber(),
        lastKnownPnlRate: LiqProviderAcc.lastKnownPnlRate.toNumber(),
        isActive: LiqProviderAcc.isActive,
    };
}



const Earn: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [LPdata, setLPdata] = useState<{ IsInitialized: boolean, locked: boolean, epoch: number, totalDeposits: number, lpFees: number, pnl: number, cumulativeFeeRate: number, cumulativePnlRate: number } | null>(null);
    const [LProviderdata, setLProviderdata] = useState<{ isInitialized: boolean, lastDepositEpoch: number, lastWithdrawFeeEpoch: number, providerDepositedAmount: number, solEarned: number, lastKnownCumulativeFeeRate: number, lastKnownPnlRate: number,  isActive: boolean   } | null>(null);
    const balance = useUserSOLBalanceStore((s) => s.balance);
    const [depositValue, setdepositValue] = useState("");
    const [withdrawValue, setwithdrawValue] = useState("");
    const { getUserSOLBalance } = useUserSOLBalanceStore();


    const [Rewards, setRewards] = useState("");

    useEffect(() => {
    
        if (publicKey) {
          getUserSOLBalance(publicKey, connection);
        }
      }, [publicKey, connection, getUserSOLBalance]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
    
        // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
        const preNumericValue = inputValue.replace(/,/g, ".");
        const numericValue = preNumericValue.replace(/[^0-9.]/g, "");
    
        // Count the occurrences of dot (.)
        const dotCount = (numericValue.match(/\./g) || []).length;
    
        // If there is more than one dot, keep only the portion before the second dot
        let sanitizedValue = numericValue;
        if (dotCount > 1) {
          sanitizedValue = sanitizedValue.substring(0, sanitizedValue.lastIndexOf('.'));
        }
    
        // Set the sanitized value as the amount value
        setdepositValue(sanitizedValue);
      };

      const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
    
        // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
        const preNumericValue = inputValue.replace(/,/g, ".");
        const numericValue = preNumericValue.replace(/[^0-9.]/g, "");
    
        // Count the occurrences of dot (.)
        const dotCount = (numericValue.match(/\./g) || []).length;
    
        // If there is more than one dot, keep only the portion before the second dot
        let sanitizedValue = numericValue;
        if (dotCount > 1) {
          sanitizedValue = sanitizedValue.substring(0, sanitizedValue.lastIndexOf('.'));
        }
    
        // Set the sanitized value as the amount value
        setwithdrawValue(sanitizedValue);
      };

    const signature: TransactionSignature = '';
    const initLPAccount = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
            return;
          }
        const houseHarcodedkey = new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ");

        const LPAccseeds = 
            [   Buffer.from(houseHarcodedkey.toBytes()),
                Buffer.from(publicKey.toBytes()),
            ];
        
        const [LProviderAcc] = await PublicKey.findProgramAddress(LPAccseeds, PROGRAM_ID);
        try {
                            // Create the instruction to initialize the user account
        const initializeInstruction = initializeLiqProvider({
            liqProvider: LProviderAcc,
            providersWallet: publicKey,
            houseAcc: houseHarcodedkey,
            systemProgram: SystemProgram.programId,
            });
        
        const initTransaction = new Transaction().add(initializeInstruction);
        const initSignature = await sendTransaction(initTransaction, connection);

        notify({ type: 'info', message: `Trying to create Liquidity Provider account.` });
        await connection.confirmTransaction(initSignature, 'confirmed');
        const result = await checkLiquidiryProviderAcc(LProviderAcc, connection);
        setLProviderdata(result);
        notify({ type: 'success', message: `Liquidity Provider account created, you can now deposit.` });
    } catch (error) {
        notify({ type: 'error', message: `Creating Liquidity Provider account failed`, description: error?.message });
    } 
    }, [publicKey])

    const deposittoLP = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
            return;
          }
        const houseHarcodedkey = new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ");
        const signerWalletAccount = new PublicKey("Fb1ABWjtSJVtoZnqogFptAAgqhBCPFY1ZcbEskF8gD1C");
        const seedsLpAcc = [Buffer.from(houseHarcodedkey.toBytes()), Buffer.from(signerWalletAccount.toBytes())];
        const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);
        const deposit = parseFloat(depositValue) * LAMPORTS_PER_SOL;

        if   (LPdata?.locked) {
            notify({ type: 'info', message: `Vault is locked.`});
        }

        else if (LProviderdata?.lastKnownCumulativeFeeRate != LPdata?.cumulativeFeeRate && LProviderdata?.providerDepositedAmount != 0){ 
            notify({ type: 'info', message: `Please withdraw your rewards first.`});  
        }

        else if (parseFloat(depositValue) < 1 ) {
            notify({ type: 'info', message: `Minimum deposit is 1 SOL.`});

        }  else if (parseFloat(depositValue + LPdata.totalDeposits/LAMPORTS_PER_SOL) > 200 ) {
            const remainingDeposit = 200 - (Number(LPdata.totalDeposits)/Number(LAMPORTS_PER_SOL));
            notify({ type: 'info', message: `Vault is full, you can deposit ${remainingDeposit.toFixed(1)} SOL.`});

        }
        
        else {


        try {
        const LPAccseeds = 
            [   Buffer.from(houseHarcodedkey.toBytes()),
                Buffer.from(publicKey.toBytes()),
            ];
        
        const [LProviderAcc] = await PublicKey.findProgramAddress(LPAccseeds, PROGRAM_ID);

        const args: DepositToLiquidityPoolArgs = {
            depositAmount: new BN(deposit),
        }
        const accounts: DepositToLiquidityPoolAccounts = {
            liqProvider: LProviderAcc,
            providersWallet: publicKey,
            lpAcc: lpAcc,
            signerWalletAccount: signerWalletAccount,
            houseAcc: houseHarcodedkey,
            pdaHouseAcc: new PublicKey ("3MRKR5tYQeUT8CXYkTjvzR6ivEpaqFLqK9CsNbMFvoHB"),
            systemProgram: SystemProgram.programId,
        };

        const initTransaction = new Transaction().add(depositToLiquidityPool(args, accounts))
        const initSignature = await sendTransaction(initTransaction, connection);

        notify({ type: 'info', message: `Depositing into the vault.`, txid: signature });
        await connection.confirmTransaction(initSignature, 'confirmed');
        const result = await checkLiquidiryProviderAcc(LProviderAcc, connection);
        setLProviderdata(result);
        setLPdata(prevState => ({ ...prevState,  totalDeposits: prevState.totalDeposits + deposit }));
        notify({ type: 'success', message: `Successfully deposited into the Vault` });
        } catch (error) {
            notify({ type: 'error', message: `Failed to deposit into the Vault`, description: error?.message });
        } 

    }}, [publicKey, depositValue, LPdata, LProviderdata])

    const withdrawFees = useCallback(async () => {
        const houseHarcodedkey = new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ");
        const signerWalletAccount = new PublicKey("Fb1ABWjtSJVtoZnqogFptAAgqhBCPFY1ZcbEskF8gD1C");
        const seedsLpAcc = [Buffer.from(houseHarcodedkey.toBytes()), Buffer.from(signerWalletAccount.toBytes())];
        const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);
        const LPAccseeds = 
            [   Buffer.from(houseHarcodedkey.toBytes()),
                Buffer.from(publicKey.toBytes()),
            ];
        
        const [LProviderAcc] = await PublicKey.findProgramAddress(LPAccseeds, PROGRAM_ID);

        if (LPdata?.locked) {
            notify({ type: 'info', message: `Vault is locked.`});

        } else if (LProviderdata?.providerDepositedAmount == 0){ 
            notify({ type: 'info', message: `You have no deposits.`});  

        } else if (LProviderdata?.lastKnownCumulativeFeeRate == LPdata?.cumulativeFeeRate){ 
            notify({ type: 'info', message: `You have nothing to claim.`});  
        
        } else {

        try {
        const accounts: WithdrawFeeFromLiquidityPoolAccounts = {
            liqProvider: LProviderAcc,
            providersWallet: publicKey,
            lpAcc: lpAcc,
            signerWalletAccount: signerWalletAccount,
            houseAcc: houseHarcodedkey,
            pdaHouseAcc: new PublicKey ("3MRKR5tYQeUT8CXYkTjvzR6ivEpaqFLqK9CsNbMFvoHB"),
            lpRevAcc: new PublicKey ("Cr7jUVQTBEXWQKKeLBZrGa2Eqgkk7kmDvACrh35Rj5mV"),
            systemProgram: SystemProgram.programId,
        };
        
        const initTransaction = new Transaction().add(withdrawFeeFromLiquidityPool(accounts))
        const initSignature = await sendTransaction(initTransaction, connection);

        notify({ type: 'info', message: `Requesting Rewards.`, txid: signature });
        await connection.confirmTransaction(initSignature, 'confirmed');
        const result = await checkLiquidiryProviderAcc(LProviderAcc, connection);
        setLProviderdata(result);
        notify({ type: 'success', message: `Successfully withdrawn Sol from the Vault` });
        } catch (error) {
        notify({ type: 'error', message: `Failed to withdraw Sol from the Vault`, description: error?.message });
        } 

    
    
    }}, [publicKey, depositValue, LPdata, LProviderdata])

    const withdrawfromLP = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
            return;
          }

        const houseHarcodedkey = new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ");
        const signerWalletAccount = new PublicKey("Fb1ABWjtSJVtoZnqogFptAAgqhBCPFY1ZcbEskF8gD1C");
        const seedsLpAcc = [Buffer.from(houseHarcodedkey.toBytes()), Buffer.from(signerWalletAccount.toBytes())];
        const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);
        const LPAccseeds = 
            [   Buffer.from(houseHarcodedkey.toBytes()),
                Buffer.from(publicKey.toBytes()),
            ];
        
        const [LProviderAcc] = await PublicKey.findProgramAddress(LPAccseeds, PROGRAM_ID);

        const withdraw = parseFloat(withdrawValue)*LAMPORTS_PER_SOL;

        if (LPdata?.locked) {
            notify({ type: 'info', message: `Vault is locked.`});

        } else if (LProviderdata?.providerDepositedAmount == 0){ 
            notify({ type: 'info', message: `You have no deposits.`});  

        } else if (parseFloat(withdrawValue) == 0 || withdrawValue == ""){ 
            notify({ type: 'info', message: `Withdrawal should be higher than 0.`});  

        } else if (LProviderdata?.lastKnownCumulativeFeeRate != LPdata?.cumulativeFeeRate){ 
            notify({ type: 'info', message: `Please withdraw your rewards first.`});  

        } else {

        try {
        const args: WithdrawFromLiquidityPoolArgs = {
            withdrawAmount: new BN(withdraw),
        }

        const accounts: WithdrawFromLiquidityPoolAccounts = {
            liqProvider: LProviderAcc,
            providersWallet: publicKey,
            lpAcc: lpAcc,
            signerWalletAccount: signerWalletAccount,
            houseAcc: houseHarcodedkey,
            pdaHouseAcc: new PublicKey ("3MRKR5tYQeUT8CXYkTjvzR6ivEpaqFLqK9CsNbMFvoHB"),
            systemProgram: SystemProgram.programId,
        };
        
        const initTransaction = new Transaction().add(withdrawFromLiquidityPool(args, accounts))
        const initSignature = await sendTransaction(initTransaction, connection);

        notify({ type: 'info', message: `Requesting withdrawal from the Vault`, txid: signature });
        await connection.confirmTransaction(initSignature, 'confirmed');
        const result = await checkLiquidiryProviderAcc(LProviderAcc, connection);
        setLProviderdata(result);
        notify({ type: 'success', message: `Successfully withdrawn rewards from the Vault` });
        } catch (error) {
        notify({ type: 'error', message: `Failed to withdraw rewards from the Vault`, description: error?.message });
        } } 




        }, [publicKey, withdrawValue, LPdata, LProviderdata]);

        
    const [timeUntilNextEpoch, setTimeUntilNextEpoch] = useState('');
    const [timeUntilNextlockEpoch, setTimeUntillockNextEpoch] = useState('');
    
    

    useEffect(() => {
        const calculateTimeUntilMonday = () => {
            const now = moment().tz('Europe/London');
            let startOfNextWeek = moment().tz('Europe/London').startOf('week').add(1, 'day'); // This is the next Monday            
                
            // If today is Sunday or any day after Monday, then find the next Monday.
            if (now.day() > 1) {
                startOfNextWeek = startOfNextWeek.add(1, 'week');
            }
            
            const diffInHours = startOfNextWeek.diff(now, 'hours');
            const diffInDays = startOfNextWeek.diff(now, 'days');
            
            if (diffInDays >= 1) {
                return `${diffInDays} ${diffInDays > 1 ? 'days' : 'day'}`;
            } else {
                return `${diffInHours} ${diffInHours > 1 ? 'hours' : 'hour'}`;
            }
        };
    
        setTimeUntillockNextEpoch(calculateTimeUntilMonday());

        // Optional: Update the countdown every minute.
        const interval = setInterval(() => {
            setTimeUntillockNextEpoch(calculateTimeUntilMonday());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const calculateTimeUntilSaturday = () => {
            const now = moment().tz('Europe/London');
            let endOfWorkWeek = moment().tz('Europe/London').endOf('week').subtract(1, 'days'); // This is the next Friday
            
            // If today is after Friday, it should reset for the next Friday, so add 7 days.
            if (now.day() > 6) {
              endOfWorkWeek = endOfWorkWeek.add(1, 'week');
            }
            
            const diffInHours = endOfWorkWeek.diff(now, 'hours');
            const diffInDays = endOfWorkWeek.diff(now, 'days');
            
            if (diffInDays >= 1) {
              return `${diffInDays} ${diffInDays > 1 ? 'days' : 'day'}`;
            } else {
              return `${diffInHours} ${diffInHours > 1 ? 'hours' : 'hour'}`;
            }
          };
          

        setTimeUntilNextEpoch(calculateTimeUntilSaturday());

        // Optional: Update the countdown every minute.
        const interval = setInterval(() => {
            setTimeUntilNextEpoch(calculateTimeUntilSaturday());
        }, 60000);

        return () => clearInterval(interval);
    }, []);





    useEffect(() => {
        const fetchLpstatus = async () => {

            const houseHarcodedkey = new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ");
            const signerWalletAccount = new PublicKey("Fb1ABWjtSJVtoZnqogFptAAgqhBCPFY1ZcbEskF8gD1C");
            const seedsLpAcc = [Buffer.from(houseHarcodedkey.toBytes()), Buffer.from(signerWalletAccount.toBytes())];
          const [lpAcc] = await PublicKey.findProgramAddress(seedsLpAcc, PROGRAM_ID);
  
          // Check if the user has an affiliate code when the component mounts
          if (lpAcc) {
              const results = await checkLPdata(lpAcc, connection);
              setLPdata(results);
          }
        };
  
        fetchLpstatus();
    }, [connection]);

    useEffect(() => {
        const fetchcheckLiquidiryProviderAcc = async () => {
            if (!publicKey) {
                setLProviderdata(null);  // Reset the userAffiliateData if publicKey is not defined
                return;
            }

            const houseHarcodedkey = new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ");

          const seedsUser = [Buffer.from(houseHarcodedkey.toBytes()), Buffer.from(publicKey.toBytes())];
          const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);
  
          // Check if the user has an affiliate code when the component mounts
          if (publicKey) {
              const result = await checkLiquidiryProviderAcc(userAcc, connection);
              setLProviderdata(result);
          }
        };
  
        fetchcheckLiquidiryProviderAcc();
    }, [publicKey, connection]);

    useEffect(() => {
        const LPcumulativeFeeRate = LPdata?.cumulativeFeeRate || 0;
        const LPcumulativePnlRate = LPdata?.cumulativePnlRate || 0;
        const LProviderLastKnownCumulativeFeeRate = LProviderdata?.lastKnownCumulativeFeeRate || 0;
        const LProviderLastKnownPnlRate = LProviderdata?.lastKnownPnlRate || 0;
        const LProviderProviderDepositedAmount = LProviderdata?.providerDepositedAmount || 0;
    
        const Reward = (
            (
                (
                    (LPcumulativeFeeRate + LPcumulativePnlRate) -
                    (LProviderLastKnownCumulativeFeeRate + LProviderLastKnownPnlRate)
                ) * LProviderProviderDepositedAmount
            ) / LAMPORTS_PER_SOL / 100000
        ).toFixed(2);
    
        setRewards(Reward);
    
    }, [LPdata, LProviderdata]);
    

    const [activeSection, setActiveSection] = useState('deposit');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const showDeposit = () => setActiveSection('deposit');
    const showWithdraw = () => setActiveSection('withdraw');


    return (
        <div>
        <Head>
          <title>PopFi | Vault</title>
          <meta name="description" content="PopFi" />
        </Head>

        <div className="bg-base flex justify-center items-center md:pt-2 min-h-[calc(100vh-94px)]">
            <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[770px] md:min-w-[770px] sm:min-w-[95%] h-full">
                <h1 className="bankGothic md:text-start text-center text-4xl lg:text-5xl text-transparent bg-clip-text bg-white">
                    Vault
                </h1>
                <img
                                        className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
                                                     alt=""
                                                 src="/sheesh/abstract06.svg"
                                                        />
                                                                        

                <div className="pt-4 bankGothic text-grey-text flex md:flex-row flex-col items-center justify-center gap-[16px] text-base  w-full px-2 md:px-0">
                <div className="z-10 md:w-[55%] w-full flex flex-col items-center justify-center relative gap-[8px] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">

                      <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-end justify-center">
                        <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-row items-center justify-center md:px-8 sm:gap-[16px]">
                        <img
            className="my-0 mx-[!important] top-[20px] left-[calc(50%_-_143px)] sm:w-1/2 sm:min-w-[100px] w-1/2 min-w-[75px] max-w-[150px] z-[1]"
            alt=""
            src="/sheesh/solana-3d3@2x.png"
          />
          <div className="flex flex-col w-2/3 text-left h-[62px] flex flex-col items-start justify-center gap-[8px] z-[0] text-[18px]">
            <div className="relative leading-[100%] font-medium">
              SOLANA VAULT
            </div>
            <div className="relative text-[36px] leading-[100%] font-semibold font-poppins bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] text-left">
              12% APY
            </div>
            
          </div>
          </div>
          </div>

        </div>
        <div className="z-10 bankGothic text-grey-text md:rounded-2xl rounded-lg bg-layer-1 box-border w-full flex sm:flex-row flex-col sm:items-center sm:justify-start items-start justify-center md:p-8 p-4 gap-[32px] text-sm border-[1px] border-solid border-layer-3">
          <div className="w-1/2 flex flex-col items-start justify-center gap-[32px]">
            <div className="flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className=" relative leading-[100%] font-medium">EPOCH</div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {LPdata?.epoch || 0}
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons1.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  REWARDS THIS EPOCH
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {(
    ((LPdata?.pnl > 0 ? LPdata?.pnl * 3 / 4 : LPdata?.pnl) + LPdata?.lpFees || 0) / LAMPORTS_PER_SOL
  ).toFixed(2)} SOL
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-[32px]">
            <div className="flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons2.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">TVL</div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {((LPdata?.totalDeposits || 0) / LAMPORTS_PER_SOL).toFixed(2) ?? '0'} SOL
                </div>
              </div>
            </div>
            {LPdata?.locked ? (
            <div className="flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons3.svg"
              />

              <div className="flex flex-col items-start justify-center gap-[4px]">
               
                <div className="relative leading-[100%] font-medium">
                  UNLOCKING IN
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {timeUntilNextEpoch}
                </div>
              </div> 
              </div>
                            ):(
                                <div className="flex flex-row items-center justify-start gap-[8px]">
                                <img
                                  className="relative rounded-lg w-[42px] h-[42px]"
                                  alt=""
                                  src="/sheesh/icons4.svg"
                                />
                                <div className="flex flex-col items-start justify-center gap-[4px]">
                                                <div className="relative leading-[100%] font-medium">
                                  LOCKING IN
                                </div>
                                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                                {timeUntilNextlockEpoch}
                                </div>
                                </div></div>
              )} 
          </div>
        </div>
      </div>


      <div className="w-full md:hidden flex justify-center items-center gap-4 my-4">
        <button onClick={showDeposit}             className={`text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              activeSection === 'deposit'? ' cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
            } ${activeSection === 'withdraw' ? '' : 'text-gray-text'} `}>Deposit</button>
        <button onClick={showWithdraw} className={`text-2xl leading-[20px] bankGothic transition-colors duration-300 ease-in-out ${
              activeSection === 'withdraw'? 'cursor-pointer border-b-2 border-gradient' : 'cursor-pointer text-grey-text '
            } ${activeSection === 'deposit' ? '' : 'text-gray-text'} `}>Withdraw</button>
      </div>
      <div className="z-10 mt-4 text-grey-text bankGothic w-full flex md:flex-row flex-col items-start justify-start gap-[16px] text-sm px-2 md:px-0">
      {(activeSection === 'deposit' || !isMobile) && (<div className="md:w-1/2 self-stretch flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-start md:p-6 p-4 gap-[24px] border-[1px] border-solid border-layer-3">
          <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl text-white">
            <div className="hidden md:flex relative leading-[100%] text-[30px] font-medium">DEPOSIT</div>
            <div className="self-stretch relative text-base leading-[140%] font-light font-poppins text-grey-text">
              <p className="m-0">
                Stake your SOL in the vault and earn fees from every trade
                carried out on our platform. As a staker, you stand as the
                counterparty for these trades, allowing the accumulated fees to
                boost your stake constantly.
              </p>
              <p className="m-0">&nbsp;</p>
              <p className="m-0">
                A heads up: You can&apos;t directly pull out your assets once they&apos;re
                in. Our withdrawal system is epoch-oriented, as elaborated on
                the Withdraw panel.
              </p>
            </div>
          </div>
          <div className="self-stretch flex flex-col gap-[12px] sm:gap-[0px] items-start justify-center sm:flex-row sm:items-center sm:justify-between">
            <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons7.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  DEPOSITED
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {((LProviderdata?.providerDepositedAmount || 0) / LAMPORTS_PER_SOL).toFixed(2)} SOL
                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons8.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  LAST DEPOSIT EPOCH
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {(LProviderdata?.lastDepositEpoch )}
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch h-[62px] flex flex-col items-start justify-start gap-[8px] font-poppins">
            <div className="self-stretch flex flex-col items-start justify-start">
              <div className="relative leading-[14px] inline-block max-w-[131px]">
                Enter Amount
              </div>
            </div>
            <div className="hover:bg-[#484c6d5b] self-stretch rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey border-[1px] border-solid border-layer-3">
            <input type="text"        
                                         className="w-full h-full input3-capsule__input relative leading-[14px] "
                                     id="affiliateCode"
                                    placeholder="0.00"
                                    value={depositValue}
                                    onChange={handleInputChange}
                                    min={0.05}
                                    step={0.05}
                                    max={balance}/>
<button 
  onClick={() => {
    // Assuming 'balance' is a numeric state or prop
    const maxValue = ((Number(balance) - 1 / 100).toFixed(2)).toString();
    setdepositValue(maxValue); // Update the state, which will update the input value reactively
  }}
  className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
  MAX
</button>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]  w-full h-10   box-border text-center text-lg">
          { LProviderdata?.isInitialized ? ( <button 
                            onClick={deposittoLP}
                            className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] hover:bg-opacity-60 bg-opacity-80 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
              DEPOSIT
            </button>):(

            <button 
                          onClick={initLPAccount}
                          className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
            
            
            DEPOSIT
          </button>
            )}
          </div>
        </div>)}
        {(activeSection === 'withdraw' || !isMobile) && (
        <div className="md:w-1/2 z-10 flex-1 rounded-lg bg-layer-1 flex flex-col items-start justify-center md:p-6 p-4 gap-[24px] border-[1px] border-solid border-layer-3">
          <div className="self-stretch flex flex-col items-start justify-center gap-[16px] text-5xl text-white">
            <div className="hidden md:flex  relative leading-[100%] font-medium  text-[30px]">WITHDRAW</div>
            <div className="self-stretch relative text-base leading-[140%] font-light font-poppins text-grey-text">
              Throughout the week, your staked SOL gathers trade fees. Direct,
              immediate withdrawals are not available. Instead, our epoch-based
              system permits withdrawals exclusively on weekends. Consider the
              benefits of ongoing staking before withdrawing.
            </div>
          </div>
          <div className="self-stretch flex flex-col gap-[12px] sm:gap-[0px] items-start justify-center sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons4.svg"
              />
              {LPdata?.locked ? (<div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  UNLOCKING IN
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {timeUntilNextEpoch}
                </div>
              </div>):(
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                    <div className="relative leading-[100%] font-medium">
                      LOCKING IN
                    </div>
                    <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                    {timeUntilNextlockEpoch}
                    </div>
                  </div>

              )}
            </div>
            <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px] h-[42px]"
                alt=""
                src="/sheesh/icons5.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  EARNINGS
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {LPdata?.locked ? (
                  
                  <span className="">{
                    (() => {
                        const result = Number(
                            ((((LPdata?.pnl > 0 ? LPdata?.pnl * 3 / 4 : LPdata?.pnl) + LPdata?.lpFees || 0) / LAMPORTS_PER_SOL)
                            * (LProviderdata?.providerDepositedAmount / (LPdata?.totalDeposits || 1)) + parseFloat(Rewards) || 0)
                        ).toFixed(2);
                
                        return isNaN(parseFloat(result)) ? '0.00' : result;
                    })()
                } SOL</span>) :
                  (<span>{Rewards} SOL</span>)
                }
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]  w-full h-10   box-border text-center text-lg">
          { !LProviderdata?.isInitialized ? (
                            <button 
                            onClick={initLPAccount}
                            className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
              CLAIM
            </button>): 
            (
                <button 
                onClick={withdrawFees}
                className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
                        CLAIM
                    </button>            ) }
                          
                          

          </div>
          <div className="self-stretch relative box-border h-px border-t-[1px] border-solid border-layer-3" />
          <div className="self-stretch flex flex-col gap-[12px] sm:gap-[0px] items-start justify-center sm:flex-row sm:items-center sm:justify-between">
            <div className=" flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px]"
                alt=""
                src="/sheesh/icons6.svg"
              />
              <div className="flex flex-col items-start justify-start gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  WITHDRAWABLE
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {((LProviderdata?.providerDepositedAmount || 0)/LAMPORTS_PER_SOL).toFixed(2)} SOL
                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-row items-center justify-start gap-[8px]">
              <img
                className="relative rounded-lg w-[42px]"
                alt=""
                src="/sheesh/icons1.svg"
              />
              <div className="flex flex-col items-start justify-center gap-[4px]">
                <div className="relative leading-[100%] font-medium">
                  EARNED
                </div>
                <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                {((LProviderdata?.solEarned || 0)/LAMPORTS_PER_SOL).toFixed(2)} 
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch h-[62px] flex flex-col items-start justify-start gap-[8px] font-poppins">
            <div className="self-stretch flex flex-col items-start justify-start">
              <div className="relative leading-[14px] inline-block max-w-[131px]">
                Enter Amount
              </div>
            </div>
            <div className=" hover:bg-[#484c6d5b] self-stretch rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 text-base text-grey border-[1px] border-solid border-layer-3">
            <input type="text"        
                                         className="w-full h-full input3-capsule__input relative leading-[14px] "
                                     id="affiliateCode"
                                    placeholder="0.00"
                                    value={withdrawValue}
                                    onChange={handleInputChange2}
                                    min={0.05}
                                    max={LProviderdata?.providerDepositedAmount}/>
<button 
  onClick={() => {
    if (LProviderdata?.providerDepositedAmount && LAMPORTS_PER_SOL) {
      const maxValue = (LProviderdata.providerDepositedAmount / LAMPORTS_PER_SOL).toString();
      setwithdrawValue(maxValue);
    }
  }}
  className="relative leading-[14px] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
>
  MAX
</button>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]  w-full h-10   box-border text-center text-lg">
          { LProviderdata?.isInitialized ? ( <button 
                            onClick={withdrawfromLP}
                            className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
              WITHDRAW
            </button>):(

            <button 
                          onClick={initLPAccount}
                          className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
            
            
            WITHDRAW
          </button>
            )}
          </div>
        </div>)}
      </div>

          



                    </div>
        </div>     
        </div>
        
    );
};

export default Earn;

