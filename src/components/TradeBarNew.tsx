import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { notify } from "../utils/notifications";
import {
  CreateBinOptArgs,
  CreateBinOptAccounts,
  createBinOpt,
} from "../out/instructions/createBinOpt";
import { useRouter } from 'next/router';
import { UserAccount  } from "../out/accounts/UserAccount"; // Update with the correct path
import { LongShortRatio   } from "../out/accounts/LongShortRatio"; // Update with the correct path
import { initializeUserAcc } from "../out/instructions/initializeUserAcc"; // Update with the correct path
import useUserSOLBalanceStore from '../../src/stores/useUserSOLBalanceStore';
import { BN } from '@project-serum/anchor';
import { PROGRAM_ID } from '../out/programId';
import TwoDigitInput from "./TwoInputDesign";
import { BiTimeFive } from 'react-icons/bi';
import socketIOClient from 'socket.io-client';
import Select from 'react-select';
import { components } from 'react-select';
import Modal from 'react-modal';
import { useFastTrade  } from '../contexts/FastTradeContext';
import dynamic from 'next/dynamic';





type TradeBarProps = {
  setParentDivHeight: (height: string) => void;
  totalBetAmount: number; // Add this line
  isBitcoinSelected: boolean;
  EMAprice: number;
  setEMAPrice: (EMAprice: number) => void;  // assuming it's a function that accepts a number
  isSoliditySelected: boolean;

  prices: { [key: string]: { price: number, timestamp: string } };
  setPrices: React.Dispatch<React.SetStateAction<{ [key: string]: { price: number, timestamp: string } }>>;
  openingPrice: number; // Add openingPrice here
  setOpeningPrice: React.Dispatch<React.SetStateAction<number>>;
};

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);



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

async function listenLongShortRatioData(account: PublicKey, connection: Connection, onDataReceived: (data: any) => void): Promise<() => void> {
  const subscriptionId = connection.onAccountChange(account, async (accountInfo) => {
    try {
      const dataBuffer = Buffer.from(accountInfo.data);
      if (!dataBuffer.slice(0, 8).equals(LongShortRatio.discriminator)) {
        console.log("Account is not a LongShortRatio account.");
        return;
      }

      const longShortRatio = LongShortRatio.decode(dataBuffer);
      onDataReceived(longShortRatio.toJSON());
    } catch (error) {
      console.error("Failed to decode LongShortRatio data:", error);
    }
  });


  // Return a function to allow unsubscribing
  return () => {
    connection.removeAccountChangeListener(subscriptionId);
  };
}



const formatOptionLabel = ({value, label, icon}) => (
  <div className="flex items-center">
    <img src={icon} alt="Logo" width="30" height="30" />
    <span className="p-2 ml-2 text-[1.2rem]">{label}</span>
  </div>
);



const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;






const TradeBar: React.FC<TradeBarProps & { setParentDivHeight: (height: string) => void }> = ({setOpeningPrice, openingPrice, totalBetAmount, isBitcoinSelected, prices, setPrices, setEMAPrice, EMAprice,
  isSoliditySelected,
 }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [toggleState, setToggleState] = useState('LONG');
  const [activeButton, setActiveButton] = useState (1);
  const [activeSlipButton, setSlipActiveButton] = useState (1);

  const [inputValue, setInputValue] = useState(2);
  const [inputValue2, setInputValue2] = useState(0);
  const [amountValue, setAmountValue] = useState("");
  const [showTButton, setShowTButton] = useState(false);
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const wallet = useWallet();
  const [openPrices, setopenPrices] = useState({});
  const [initialPrice, setInitialPrice] = useState(0);
  const [spreadPrice, setSpreadPrice] = useState(0);
  const [slippageTolerance, setSlippageTolerance] = useState(100); // Default to 0.1%
  const [customSlippage, setCustomSlippage] = useState('');

  const [payout, setPayout] = useState(0);
  const [usedAffiliate, setUsedAffiliate] = useState<Uint8Array | null>(null);
  const [data, setData] = useState({
     solLong1: "0",
     solShort1: "0",
     solLong5: "0",
     solShort5: "0",
     solLong15: "0",
     solShort15: "0",
     solLong60: "0",
     solShort60: "0",
     solLong240: "0",
     solShort240: "0",
     btcLong1: "0",
     btcShort1: "0",
     btcLong5: "0",
     btcShort5: "0",
     btcLong15: "0",
     btcShort15: "0",
     btcLong60: "0",
     btcShort60: "0",
     btcLong240: "0",
     btcShort240: "0",
});
const [isInit, setisInit] = useState<{ isInitialized: boolean; usedAffiliate: Uint8Array, myAffiliate: Uint8Array }>(null);
const [modalIsOpen, setModalIsOpen] = useState(false);
const { fastTradeActivated, setFastTradeActivated } = useFastTrade();


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

const setToggleChangeLong = () => {
  setToggleState('LONG');
};

const setToggleChangeShort = () => {
  setToggleState('SHORT');
};


  const handleCustomSlippageChange = (event) => {
    const customValue = event.target.value;
  
    // Replace comma with dot, and remove non-numeric characters except dot (.) as decimal separator
    const preNumericValue = customValue.replace(/,/g, ".");
    const customValues = preNumericValue.replace(/[^0-9.]/g, "");
  
    // Count the occurrences of dot (.)
    const dotCount = (customValues.match(/\./g) || []).length;
    let sanitizedValue = customValues; 
    // If there is more customValues one dot, keep only the portion before the second dot
    if (dotCount > 1) {
      sanitizedValue = sanitizedValue.substring(0, sanitizedValue.indexOf('.') + sanitizedValue.split('.')[1].length + 1);
    }
  
    // Update custom slippage state
    setCustomSlippage(sanitizedValue);
  
    // Convert to a number for validation
    const customTolerance = Number(sanitizedValue);
  
    // If the custom value is valid, update the slippage tolerance
    if (!isNaN(customTolerance) && customTolerance > 0) {
      setSlippageTolerance(customTolerance * 1000); // Assuming the input is in percentage
      setSlipActiveButton(4); // Deselect any active button
    }
  };


  useEffect(() => {
    
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  


  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountToWatch = new PublicKey("AL5uNkGAgkNQxf9pKgQKejx9rTzW2VjbYfjPBXVTMuRf");
        const initialAccountInfo = await connection.getAccountInfo(accountToWatch);
        
        if (initialAccountInfo) {
          const initialDataBuffer = Buffer.from(initialAccountInfo.data);
          if (initialDataBuffer.slice(0, 8).equals(LongShortRatio.discriminator)) {
            const initialLongShortRatio = LongShortRatio.decode(initialDataBuffer);
            setData(initialLongShortRatio.toJSON()); // Directly set the data here
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
        // Here you can execute your notification logic, e.g., show a toast, alert, etc.
        // Notify('Failed to fetch account info.');
      }
    };
  
    fetchData();
  }, []);

useEffect(() => {
  const accountToWatch = new PublicKey("AL5uNkGAgkNQxf9pKgQKejx9rTzW2VjbYfjPBXVTMuRf");
  let unsubscribe;

  const fetchData = async () => {
    try {
      await listenLongShortRatioData(accountToWatch, connection, onDataReceived)
        .then(fn => {
          unsubscribe = fn;
        });
    } catch (error) {
      console.error("An error occurred:", error);
      // Again, place your notification logic here.
      // Notify('Failed to subscribe to account data.');
    }
  };

  fetchData();

  function onDataReceived(newData) {
    setData(newData);
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [connection]);

useEffect(() => {
  let longShortRatio;
  const THRESHOLD_BET_AMOUNT = 5000; // Replace with your threshold value
  
  const computeLongShortRatio = (long, short) => {
      const totalBetAmount = parseInt(long) + parseInt(short);
      return totalBetAmount !== 0 ? parseInt(long) / totalBetAmount : 0.5;
  };

  let expiration;
  if (activeButton === 1) {
      expiration = 3 * 60; // 1 minute
  } else if (activeButton === 2) {
      expiration = 5 * 60; // 5 minutes
  } else if (activeButton === 3) {
      expiration = 60 * 60; // 1 hour
  } else if (activeButton === 4) {
      expiration = 60 * 60 * 4; // 4 hours
  } else if (activeButton === 5) {
      expiration = (inputValue * 60 * 60) + (inputValue2 * 60); // Custom time in seconds
  }

  




  const selectDataBasedOnExpiration = (currency) => {
      let longKey = currency + 'Long';
      let shortKey = currency + 'Short';

      if (expiration <= 180) {
          longKey += '1';
          shortKey += '1';
      } else if (expiration <= 300) {
          longKey += '5';
          shortKey += '5';
      } else if (expiration <= 900) {
        longKey += '15';
        shortKey += '15';
      }
      else if (expiration <= 3600) {
          longKey += '60';
          shortKey += '60';
      } else if (expiration <= 14400) {
          longKey += '240';
          shortKey += '240';
      } 

      return {
          long: data[longKey],
          short: data[shortKey]
      };
  };

  if (isSoliditySelected) {
      const { long, short } = selectDataBasedOnExpiration('sol');
      longShortRatio = computeLongShortRatio(long, short);
  } else if (isBitcoinSelected) {
      const { long, short } = selectDataBasedOnExpiration('btc');
      longShortRatio = computeLongShortRatio(long, short);
  }

  const totalBetAmount = isSoliditySelected 
      ? (parseInt(selectDataBasedOnExpiration('sol').long) + parseInt(selectDataBasedOnExpiration('sol').short))
      : (parseInt(selectDataBasedOnExpiration('btc').long) + parseInt(selectDataBasedOnExpiration('btc').short));

      const priceDirection = toggleState === 'LONG' ? 0 : toggleState === 'SHORT' ? 1 : -1;
      if (priceDirection === -1) {
          throw new Error("Invalid toggle state");
      }
    
      // Adjust longShortRatio based on the conditions in your Rust logic
      if (totalBetAmount < THRESHOLD_BET_AMOUNT) {
          longShortRatio = 0.5;
      }
    
    
      // Determine the payout using the logic
      const calculatedPayout = determinePayout(longShortRatio, priceDirection);
    
      // Set the payout state
      setPayout(calculatedPayout);

    
    }, [data, isSoliditySelected, isBitcoinSelected, toggleState, activeButton, inputValue, inputValue2]);


const determinePayout = (ratio, priceDirection) => {
  const minimumPayout = 1.7;
  const maximumPayout = 1.7;

  if (priceDirection === 0) { // Increase (Long)
      if (ratio === 0.0) {
          return maximumPayout;
      } else if (ratio === 1.0) {
          return minimumPayout;
      } else {
          return maximumPayout - (maximumPayout - minimumPayout) * ratio;
      }
  } else if (priceDirection === 1) { // Decrease (Short)
      if (ratio === 0.0) {
          return minimumPayout;
      } else if (ratio === 1.0) {
          return maximumPayout;
      } else {
          return minimumPayout + (maximumPayout - minimumPayout) * ratio;
      }
  } else {
      return minimumPayout;
  }
};




useEffect(() => {
  const socket = socketIOClient(ENDPOINT);

  socket.on('priceUpdate', (updatedPrices) => {

    const newPrices = { ...prices };

    updatedPrices.forEach((updatedPrice) => {
      newPrices[updatedPrice.symbol] = {
        price: updatedPrice.price,
        timestamp: updatedPrice.timestamp};

        if (isSoliditySelected && updatedPrice.symbol === 'Crypto.SOL/USD') {
          setEMAPrice(updatedPrice.EMA);
      } else if (!isSoliditySelected && updatedPrice.symbol === 'Crypto.BTC/USD') {
          setEMAPrice(updatedPrice.EMA);

      }
    });

    setPrices(newPrices);
  });

  // Disconnect the socket when the component unmounts
  return () => {
    socket.disconnect();
  };
}, [isSoliditySelected]);

const calculateSpreadPrice = (currentPrice, EMAprice, toggleState) => {
  let spreadRatio = 0;
  if (EMAprice > currentPrice) {
    const priceDifference = EMAprice - currentPrice;
    spreadRatio = priceDifference * 100000 / currentPrice / 5;
  } else {
    const priceDifference = currentPrice - EMAprice;
    spreadRatio = priceDifference * 100000 / currentPrice / 5;
  }

  // Ensure the spread doesn't exceed 0.02
  const finalSpreadRatio = Math.max(100, Math.min(spreadRatio, 200));

  // Adjust the currentPrice with the spread to get the initial price.
  const calculatedInitialPrice = toggleState === 'LONG' 
  ? ((currentPrice + (currentPrice * finalSpreadRatio / 1000000)) / 100000000)
  : ((currentPrice - (currentPrice * finalSpreadRatio / 1000000)) / 100000000);  

  return calculatedInitialPrice;
}

useEffect(() => {
  if (prices && EMAprice) {
      const currentPrice = isSoliditySelected ? prices['Crypto.SOL/USD']?.price : prices['Crypto.BTC/USD']?.price;
      const spread = calculateSpreadPrice(currentPrice, EMAprice, toggleState);
      setSpreadPrice(spread);
  }
}, [toggleState, prices, EMAprice]);


    useEffect(() => {
    const initialPrice = isSoliditySelected
      ? prices['Crypto.SOL/USD']?.price / 100000000
      : prices['Crypto.BTC/USD']?.price / 100000000;
  
    setInitialPrice(initialPrice);
  }, [isSoliditySelected, prices]);

    useEffect(() => {
    const socket = socketIOClient(ENDPOINT2);

    socket.on('openingprice', (openingPrices) => {
      const openingPricess = { ...openPrices };
      openingPrices.forEach((openingPrices) => {
        openingPricess[openingPrices.symbol] = openingPrices.price;
      });

      setopenPrices(openingPricess);
    });

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    const openingPrice = isSoliditySelected
      ? openPrices['Crypto.SOL/USD'] / 100000000
      : openPrices['Crypto.BTC/USD'] / 100000000;
    setOpeningPrice(openingPrice);
  }, [isSoliditySelected, openPrices]);

  const handleToggleChange = () => {
    if (toggleState === 'LONG') {
      setToggleState('SHORT');
    } else {
      setToggleState('LONG');
    }
  };





  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);
    if (activeButton === 5 && buttonIndex === 5) {
      // If the current activeButton is 5 and the user clicks 5 again
      setActiveButton(1); // Set activeButton to 1 to close the custom timer
    } else {
      setActiveButton(buttonIndex);
    }
  };

  const handleButtonClick1 = (buttonIndex: number) => {
    setSlipActiveButton(buttonIndex);
    
    switch (buttonIndex) {
      case 1:
        setSlippageTolerance(100); // 0.1%
        break;
      case 2:
        setSlippageTolerance(300); // 0.3%
        break;
      case 3:
        setSlippageTolerance(500); // 0.5%
        break;
      default:
        // Handle default case if necessary
    }
    
    // Clear any custom slippage value
    setCustomSlippage('');
  };


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
    setAmountValue(sanitizedValue);
  };


  const handleHoursChange = (value) => {
    const newValue = parseInt(value);
    if (newValue <= 4) {
      setInputValue(newValue);
    }
  };

  const handleMinutesChange = (value) => {
    const newValue = parseInt(value);

    if (inputValue === 4 && newValue >= 0 && newValue <= 59) {
      // If the hours are already 4 and the new minutes value is valid
      setInputValue2(newValue); // Set the new minutes value
    } else if (inputValue < 4) {
      // If the hours are less than 4
      if (newValue >= 60) {
        // If the new minutes value is 60 or more
        setInputValue2(0); // Set the minutes to 0
        setInputValue((prevValue) => prevValue + 1); // Increment the hours by 1
      } else {
        setInputValue2(newValue); // Set the new minutes value
      }
    }
  };

  useEffect(() => {
    const totalDuration = inputValue * 60 + inputValue2;

    if (totalDuration > 240) {
      // Limit the total duration to 4 hours
      setInputValue(4);
      setInputValue2(0);
    }
  }, [inputValue, inputValue2]);

  useEffect(() => {
    if (inputValue2 === 60) {
      setInputValue2(0);
      setInputValue((prevValue) => {
        const incrementedValue = prevValue + 1;
        return incrementedValue > 4 ? 4 : incrementedValue;
      });
    } else if (inputValue2 < 0) {
      setInputValue2(55);
      setInputValue((prevValue) => (prevValue > 0 ? prevValue - 1 : 0));
    }
  }, [inputValue2]);

  const onClick = useCallback(async (direction = null) => {
    if((totalBetAmount + parseFloat(amountValue) * LAMPORTS_PER_SOL) > 2000000000) {
      notify({ type: 'error', message: "Position size limit per user", description: "Your position size has reached the limit of 2 SOL"});
      return;
    }

    let symbolCode;
    let oracleAddy;
    if (isSoliditySelected) {
      symbolCode = 0,
      oracleAddy = "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG";  // set to 0 if 'BINANCE:SOLUSDT' is selected
    } else if (isBitcoinSelected) {
      symbolCode = 1,
      oracleAddy = "GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU"  // set to 1 if 'BINANCE:BTCUSDT' is selected
    } else {
      throw new Error("Invalid symbol");  // Throw error if neither of them is selected
    }

    if (!publicKey) {
      notify({ type: 'error', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
      return;
    }

    if (!amountValue || parseFloat(amountValue) === 0) {
      notify({ type: 'error', message: "Amount feels empty", description: "Fill the Trade Amount"});
      return;
    }

    if (activeButton === 5 && inputValue === 0 && inputValue2 === 0) {
      notify({ type: 'error', message: "Expiration time is zero", description: "Change the Custom Time" });
      return;
    }

    if (parseFloat(amountValue) > balance) {
      notify({ type: 'error', message: "Insufficient balance", description: "Trade Amount is greater than the available balance" });
      return;
    }

    if (parseFloat(amountValue) > 1 || parseFloat(amountValue) < 0.05) {
      notify({ type: 'error', message: "Invalid trade amount", description: "Trade Amount should be between 0.05 and 1 SOL" });
      return;
    }

    let signature: TransactionSignature = '';
    try {
      // Get the current time and add 1 to the time number
      const now = Date.now();
      const timeNumber = Math.floor(now / 1000) % 1000000 + 1;

      const betAmount = parseFloat(amountValue) * LAMPORTS_PER_SOL;

      let expiration = 0;
      if (activeButton === 1) {
        expiration = 3 * 60; // 1 minute
      } else if (activeButton === 2) {
        expiration = 5 * 60; // 5 minutes
      } else if (activeButton === 3) {
        expiration = 60 * 60; // 1 hour
      } else if (activeButton === 4) {
        expiration = 60 * 60 * 4; // 4 hours
      } else if (activeButton === 5) {
        expiration = (inputValue * 60 * 60) + (inputValue2 * 60); // Custom time in seconds
      }

      const priceDirection = toggleState === 'LONG' ? 0 : toggleState === 'SHORT' ? 1 : -1;
      if (priceDirection === -1) {
        throw new Error("Invalid toggle state");
      }



      const seeds = [
        Buffer.from(publicKey.toBytes()),
        new BN(timeNumber).toArray('le', 8),
      ];


      const [pda] = await PublicKey.findProgramAddress(
        seeds,
        PROGRAM_ID
      );

      const seedsUser = [
        Buffer.from(publicKey.toBytes()),
      ];


      const [userAcc] = await PublicKey.findProgramAddress(
        seedsUser,
        PROGRAM_ID
      );


      const usedAffiliate = isInit.usedAffiliate;


      const args: CreateBinOptArgs = {
        number: new BN(timeNumber),
        affiliateCode: Array.from(usedAffiliate),
        betAmount: new BN(betAmount),
        expiration: new BN(expiration),
        priceDirection: new BN(priceDirection),
        symbol: symbolCode,
        slippagePrice: new BN (initialPrice*100000000),
        slippage: new  BN (slippageTolerance),
        
      }
      console.log ("Creating Binary Option", "Initial Price", initialPrice, "Position Size", betAmount/LAMPORTS_PER_SOL, "Expiration Time", expiration, "Direction", priceDirection, "Symbol", symbolCode, "Slippage", slippageTolerance);



      if (!isInit.isInitialized) {
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
          fetchcheckuserdata();
          setModalIsOpen(false);
          notify({ type: 'success', message: `Trading account successfully created, you can now open your position.` });
      } catch (error) {
          notify({ type: 'error', message: `Error Trading user account`, description: error?.message });
      } 
       } else {
      
        const seedsRatio = [
          Buffer.from(new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ").toBytes()),
        ];
  
        const [ratioAcc] = await PublicKey.findProgramAddress(
          seedsRatio,
          PROGRAM_ID
        );

        const seedsAffil = [usedAffiliate];
    
        const [AffilAcc] = await PublicKey.findProgramAddress(
        seedsAffil,
        PROGRAM_ID
        );

      const accounts: CreateBinOptAccounts = {
        playerAcc: publicKey,
        userAcc: userAcc,
        ratioAcc: ratioAcc,
        houseAcc: new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ"),
        binOpt: new PublicKey(pda.toString()),
        oracleAccount: new PublicKey(oracleAddy),
        pdaHouseAcc: new PublicKey("3MRKR5tYQeUT8CXYkTjvzR6ivEpaqFLqK9CsNbMFvoHB"),
        affilAcc: AffilAcc,
        lpAcc: new PublicKey("CBaAsnsHBpr5UaCbutL3yjxGxn1E7SNZsF8xo69y7BtD"),
        signerWalletAccount: new PublicKey("Fb1ABWjtSJVtoZnqogFptAAgqhBCPFY1ZcbEskF8gD1C"),
        lpRevAcc: new PublicKey ("Cr7jUVQTBEXWQKKeLBZrGa2Eqgkk7kmDvACrh35Rj5mV"),
        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        systemProgram: SystemProgram.programId,
      };

      const transaction = new Transaction().add(
        createBinOpt(args, accounts)
      );

      signature = await sendTransaction(transaction, connection);
    // Notify user that the transaction was sent
      notify({ type: 'info', message: `Option creation transaction was sent`, txid: signature });
      // Wait for transaction confirmation before showing the 'success' notification
      await connection.confirmTransaction(signature, 'confirmed');

    }} catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({ type: 'error', message: `Option was not created`, description: error?.message, txid: signature });
      return;
    }
  }, [slippageTolerance, isInit, balance, initialPrice, totalBetAmount, publicKey, notify, connection, sendTransaction, activeButton, inputValue, inputValue2, amountValue, toggleState, isSoliditySelected, isBitcoinSelected]);

const payoutValue = (Number(amountValue) * Number(payout)).toFixed(2);


const onClick1 = useCallback(async () => {
  const seedsUser = [
    Buffer.from(publicKey.toBytes()),
  ];


  const [userAcc] = await PublicKey.findProgramAddress(
    seedsUser,
    PROGRAM_ID
  );
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
    fetchcheckuserdata();
    setModalIsOpen(false);
    notify({ type: 'success', message: `Trading account successfully created, you can now open your position.` });
} catch (error) {
    notify({ type: 'error', message: `Creating Trading account failed`, description: error?.message });
}
}, [isInit, publicKey])


const [userClosedModal, setUserClosedModal] = useState(false);




useEffect(() => {
  if (publicKey && isInit && !isInit?.isInitialized && !userClosedModal) {
    setModalIsOpen(true);
  }
}, [publicKey, isInit, userClosedModal]);



const closeModalHandler = () => {
  setModalIsOpen(false);
  setUserClosedModal(true);
};

const ModalDetails1 = (
  <Modal
    className="custom-scrollbar bg-layer-2"

    isOpen={modalIsOpen}
    onRequestClose={closeModalHandler}
    style={{
      overlay: {
        zIndex: '100',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(5px)'

      },
      content: {
        backgroundSize: 'cover',
        position: 'fixed',
        width: '320px',
        height: '290px',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }}
  >

<div className="relative rounded tradingcard">
  <div className="">
    <div className='font-poppins w-[100%] h-[100%] bg-layer-2 text-white px-5 pt-3 pb rounded text-[1rem]'>
    <div className="bankGothic text-center font-semibold text-[1.5rem] text-[#F7931A]">DISCLAIMER </div>By opening a trading account on PopFi, I agree to the following:
    <div className="font-poppins pt-2 text-slate-300 text-[0.9rem]">I am lawfully allowed to access this site and use the PopFi dApp under the laws of the jurisdiction where I reside and am currently located.</div>
<div className="font-poppins pt-2 text-slate-300 text-[0.9rem]">
I will not use the PopFi dApp while located within any prohibited jurisdictions.
</div>
<button
    className="custom-futures mt-6 mb-8 duration-300"
    onClick={onClick1}
    >
      OPEN ACCOUNT
    </button>
</div>

</div>

    </div>
  </Modal>
);



return (
  <div 
  className="custom-scrollbar overflow-x-hidden md:h-[628px] lg:h-[calc(100vh-175px)] md:w-[330px] w-full   flex flex-col items-start justify-start p-4 gap-[24px] text-left text-sm text-grey-text font-poppins">
  {ModalDetails1}
  <div className="self-stretch flex flex-row items-start justify-start gap-[8px] text-center text-lg text-grey">
  <button 
  onClick={setToggleChangeLong}
  className={`w-1/2 rounded-lg h-[38px] flex flex-row items-center justify-center box-border ${
    toggleState === "LONG" ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-transparent border border-grey"
  }`}
>
  <div className={`flex justify-center items-center h-full w-full rounded-lg ${
    toggleState === "LONG" ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>

<div className={`bankGothic bg-clip-text text-transparent uppercase ${
  toggleState === "LONG" ? "bg-gradient-to-t from-[#34C796] to-[#0B7A55]" : "bg-grey"
}`}>
  LONG
</div>
    </div>
    </button>
    <button 
  onClick={setToggleChangeShort}
  className={`w-1/2 rounded-lg h-[38px] flex flex-row items-center justify-center box-border ${
    toggleState === "SHORT" ? "bg-gradient-to-t from-[#7A3636] to-[#C44141] p-[1px]" : "bg-transparent border border-grey"
  }`}
>
<div className={`flex justify-center items-center h-full w-full rounded-lg ${
    toggleState === "SHORT" ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>


<div className={`bankGothic bg-clip-text text-transparent uppercase ${
  toggleState === "SHORT" ? "bg-gradient-to-t from-[#7A3636] to-[#C44141]" : "bg-grey"
}`}>
        SHORT</div>
      </div>
    </button>
  </div>
  <div className="self-stretch h-[60px] flex flex-col items-start justify-start gap-[8px]">
    <div className="self-stretch flex flex-col items-start justify-start">
      
      <div className="relative leading-[14px] inline-block max-w-[131px]">
        Position Size
      </div>
      <div className="mt-[12px] self-stretch rounded-lg bg-layer-2 box-border h-[38px] flex flex-row items-center justify-between py-0 px-2 text-base text-grey border-[1px] border-solid border-layer-3 hover:bg-[#484c6d5b]">
          <input
            type="text"
            className="input-capsule__input "
            placeholder="3.00"
            value={amountValue}
            onChange={handleInputChange}
            min={0.05}
            step={0.05}
          />
          <span className="rounded-12xs flex flex-row items-center justify-start py-[7px] px-0">        <img
          className="relative w-6 h-6 overflow-hidden shrink-0"
          alt=""
          src="/new/component-9.svg"
        /></span>
        </div>

    </div>

  </div>
  <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
    <div className="self-stretch flex flex-row items-center justify-start">
      <div className="relative leading-[14px] inline-block max-w-[250px]">
        Expiration Time
      </div>
    </div>
    <div className="self-stretch flex flex-col items-start justify-start">
      <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
        
        <button 
        onClick={() => handleButtonClick(1)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 1 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
          <div className={`flex justify-center items-center bg-[#0B111B] w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 1 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>3M</div>
          
        </button>
        <button 
        onClick={() => handleButtonClick(2)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 2 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 2 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>5M</div>
        </button>
        <button 
        onClick={() => handleButtonClick(3)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 3 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 3 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>1H</div>
        </button>
        <button 
        onClick={() => handleButtonClick(4)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 4 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 4 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
          }`}>4H</div>
        </button>
        <button 
        onClick={() => handleButtonClick(5)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 5 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 5 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
          }`}><BiTimeFive/></div>
        </button>
      </div>
    </div>

  </div>
              {/* custom time */}
              {activeButton === 5 && (
          <div className="w-full relative overflow-hidden font-poppins">
            <p>Custom Time</p>

            <div className="flex items-center justify-center py-1 mt-1 bg-layer-2 rounded h-8">
              <div
                className="bg-layer-3 text-layer-2 pl-0.5 rounded-[1rem] w-6 h-6 flex justify-center items-center text-2xl cursor-pointer absolute left-3 decrease-btn"
                onClick={() =>
                  setInputValue2((prev) => (prev > -5 ? prev - 5 : 0))
                }
              >
                -
              </div>
              <div className="w-7 text-[0.9rem]">
                <TwoDigitInput
                  value={inputValue.toString().padStart(2, "0")}
                  onValueChange={handleHoursChange}
                  maxValue={4}
                />
              </div>
              <p>:</p>
              <div className="w-7 ml-[6px] text-[0.9rem]">
                <TwoDigitInput
                  value={inputValue2.toString().padStart(2, "0")}
                  onValueChange={handleMinutesChange}
                  maxValue={59}
                />
              </div>
              <div
                className="bg-layer-3 text-layer-2  pl-0 rounded-[1rem] w-6 h-6 flex justify-center items-center text-2xl cursor-pointer absolute right-3 increase-btn"
                onClick={() =>
                  setInputValue2((prev) => (prev <= 59 ? prev + 5 : prev))
                }
              >
                +
              </div>
            </div>
          </div>
        )}


  <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
    <div className="self-stretch flex flex-row items-center justify-start">
      <div className="relative leading-[14px] inline-block max-w-[250px]">
        Slippage Tolerance
      </div>
    </div>
    <div className="self-stretch flex flex-col items-start justify-start">
      <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
        
        <button 
        onClick={() => handleButtonClick1(1)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeSlipButton === 1 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
          <div className={`flex justify-center items-center bg-[#0B111B] w-full h-full rounded relative leading-[14px] font-medium ${activeSlipButton === 1 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>0.1%</div>
          
        </button>
        <button 
        onClick={() => handleButtonClick1(2)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeSlipButton === 2 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeSlipButton === 2 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>0.3%</div>
        </button>
        <button 
        onClick={() => handleButtonClick1(3)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeSlipButton === 3 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeSlipButton === 3 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>0.5%</div>
        </button>
        <div 
        onClick={() => handleButtonClick1(4)}
        className={`flex hover:bg-[#484c6d5b] rounded  w-[115px] h-7 ${activeSlipButton === 4 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"}`}>
        <div className={`rounded flex flex-row w-full h-full px-2 ${activeSlipButton === 4 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"}`}>
        <input type="text" placeholder="Custom"         
                  className="flex justify-center items-center input3-capsule__input relative leading-[14px]"
                  value={customSlippage}
                  onChange={handleCustomSlippageChange}
                  
                  
                  />
                 <span className="flex justify-center items-center relative w-4 h-8 overflow-hidden shrink-0">%</span>
        </div></div>
      </div>
    </div>
  </div>
  <div className="self-stretch rounded-md flex flex-col items-start justify-start gap-[8px]">
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[120%]">Position Size</div>
      <div className="relative leading-[14px] font-medium text-white">
        {     isNaN(parseFloat(amountValue))
       ? '0 SOL'
      : `${(parseFloat(amountValue))} SOL`
        }
      </div>
    </div>
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Payout</div>
      <div className="relative leading-[14px] font-medium text-white">
      {     isNaN(parseFloat((amountValue))*1.70)
       ? '0 SOL'
      : `${((parseFloat(amountValue)*1.70)).toFixed(2)} SOL`
        }
      </div>
    </div>
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Fees</div>
      <div className="relative leading-[14px] font-medium text-white">
      {     isNaN(parseFloat((amountValue))*0.05)
       ? '0 SOL'
      : `${((parseFloat(amountValue)*0.05)).toFixed(2)} SOL`
        }
      </div>
    </div>


    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Strike Price</div>
      <div className="relative leading-[14px] font-medium text-white">
      {isSoliditySelected 
      ? (spreadPrice && !isNaN(spreadPrice) 
        ? spreadPrice.toFixed(3)
        : '-')
      : (spreadPrice && !isNaN(spreadPrice)
        ? spreadPrice.toFixed(1)
        : '-')
    } USD
      </div>
    </div>
  </div>
  {wallet.connected ? (
  <button 
  onClick={onClick}
  className="h-[50px] font-semibold self-stretch rounded-lg gradient-bgg flex flex-row items-center justify-center py-3 px-6 text-center text-lg text-white">
      OPEN POSITION</button>
  
  ) : (
    <WalletMultiButtonDynamic     className="h-[50px] font-poppins font-semibold self-stretch rounded-lg gradient-bgg flex flex-row items-center justify-center py-3 px-6 text-center text-lg text-white">
CONNECT WALLET</WalletMultiButtonDynamic>



    )}
</div>
);
};

export default TradeBar;
