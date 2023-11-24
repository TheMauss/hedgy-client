import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { notify } from "../utils/notifications";
import {
  CreateFutContArgs,
  CreateFutContAccounts,
  createFutCont,
} from "../out/instructions/createFutCont";
import { useRouter } from 'next/router';
import { UserAccount  } from "../out/accounts/UserAccount"; // Update with the correct path
import { LongShortRatio   } from "../out/accounts/LongShortRatio"; // Update with the correct path
import { initializeUserAcc } from "../out/instructions/initializeUserAcc"; // Update with the correct path
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import { BN } from '@project-serum/anchor';
import { PROGRAM_ID } from '../out/programId';
import { FaAngleUp, FaAngleDown, FaChevronUp, FaAngleDoubleUp, FaAngleDoubleDown } from 'react-icons/fa';
import socketIOClient from 'socket.io-client';
import Select from 'react-select';
import { components } from 'react-select';
import Slider from 'rc-slider';
import Modal from 'react-modal';
import dynamic from 'next/dynamic';



function Tooltip({ content, children }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
      className="relative"
    >
      {show && (
        <div className="absolute z-10 bg-black text-white p-2 rounded">
          {content}
        </div>
      )}
      {children}
    </div>
  );
}

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);


interface TradeBarFuturesProps {
  setParentDivHeight: (height: string) => void;
  EMAprice: number;
  totalBetAmount: number;
  prices: { [key: string]: { price: number, timestamp: string } };
  setPrices: React.Dispatch<React.SetStateAction<{ [key: string]: { price: number, timestamp: string } }>>;
  setEMAPrice: (EMAprice: number) => void;  // assuming it's a function that accepts a number
  isBitcoinSelected: boolean;
  isSoliditySelected: boolean;
  openingPrice: number; // Add openingPrice here
  setOpeningPrice: React.Dispatch<React.SetStateAction<number>>;
}



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






const G_17 = 0.6; // Center for longs
const G_15 = 0.4; // Center for shorts

const MAX_LEVERAGE = 200.0;
const K = 4.3;

function getDynamicLeverage(longShortRatio, priceDirection) {
  if (longShortRatio < 0.0 || longShortRatio > 1.0) {
      throw new Error("Ratio must be between 0 and 1");
  }

  let leverage;
  switch(priceDirection) {
      case 0: // 0 for Increase (long)
          leverage = MAX_LEVERAGE * Math.exp(-K * Math.pow(longShortRatio - G_17, 2));
          break;
      case 1: // 1 for Decrease (short)
          leverage = MAX_LEVERAGE * Math.exp(-K * Math.pow(G_15 - longShortRatio, 2));
          break;
      default:
          throw new Error("Invalid price direction");
  }

  return Math.round(leverage);
}

const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;



const TradeBar: React.FC<TradeBarFuturesProps & {
  setParentDivHeight: (height: string) => void;
  data: {
    btcLong: string;
    btcShort: string;
    solLong: string;
    solShort: string;
  };
  setData: (data: {
    btcLong: string;
    btcShort: string;
    solLong: string;
    solShort: string;
  }
  ) => void;
}> = ({ setParentDivHeight, totalBetAmount, data,  setData, setPrices, setEMAPrice, prices,   isBitcoinSelected, setOpeningPrice, openingPrice,
  isSoliditySelected,
}) => {  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [toggleState, setToggleState] = useState('LONG');
  const [tolerance, setTolerance] = useState("0.1");
  const [inputValue, setInputValue] = useState(2);
  const [inputValue2, setInputValue2] = useState(0);
  const [amountValue, setAmountValue] = useState("");
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const wallet = useWallet();

  const [leverage, setLeverage] = useState(200);
  const [showAdditionalDiv, setShowAdditionalDiv] = useState(false);
  const [ProfitValue, setProfitValue] = useState("");
  const [LossValue, setLossValue] = useState("");
  const [Profit, setProfit] = useState("");
  const [Loss, setLoss] = useState("");
  const [lastInput, setLastInput] = useState(null);
  const [lastInputL, setLastInputL] = useState(null);
  const [liquidationPrice, setliquidationPrice] = useState('- USD');
  const [warning, setWarning] = useState(null);
  const [initialPrice, setInitialPrice] = useState(0);
  const [openPrices, setopenPrices] = useState({});
  const [isInit, setisInit] = useState<{ isInitialized: boolean; usedAffiliate: Uint8Array, myAffiliate: Uint8Array }>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
 
  const [activeLeverageButton, setActiveLeverageButton] = useState (0);


  const [activeButton, setActiveButton] = useState (1);
  const [slippageTolerance, setSlippageTolerance] = useState(100); // Default to 0.1%
  const [customSlippage, setCustomSlippage] = useState('');

const [snapPoints, setSnapPoints] = useState([1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200]);
const snapRange = 25;
const [maxleverage, setMaxLeverage] = useState(200); // Initially set to 1000

const handleButtonClick = (buttonIndex: number) => {
  setActiveButton(buttonIndex);
  
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
    setActiveButton(4); // Deselect any active button
  }
};

useEffect(() => {
  console.log(`Current slippage tolerance: ${slippageTolerance}`);
}, [slippageTolerance]); 


const handleLeverageClick = (buttonIndex: number) => {
  if (buttonIndex > maxleverage) {
    setLeverage(100);
    setActiveLeverageButton(100);
  }
  else {
  setActiveLeverageButton(buttonIndex);
  setLeverage(buttonIndex);}
};

useEffect(() => {
  // This code runs if maxleverage changes.
  // If the current leverage is greater than the max leverage, adjust it.
  if (leverage > maxleverage) {
    setLeverage(maxleverage);
    setActiveLeverageButton(maxleverage);
  }
}, [maxleverage, leverage]); // Only re-run the effect if maxleverage changes


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


const buttonValues = [50, 100, 150, 200]; // Define the button values

const handleSliderChange = (value) => {
  value = parseInt(value);
  if (value > maxleverage) { // Ensure user doesn't exceed the maxleverage
    setLeverage(maxleverage);
    setActiveLeverageButton(0); // Reset active button if leverage exceeds max
    return;
  }

  if (value <= 10) {
    setLeverage(value);
    setActiveLeverageButton(0); // Reset active button for values <= 10
  } else {
    const closestSnap = snapPoints.reduce((a, b) =>
      Math.abs(b - value) < Math.abs(a - value) ? b : a
    );

    if (Math.abs(closestSnap - value) <= snapRange) {
      setLeverage(closestSnap);
      // Set active button if closestSnap is one of the button values
      setActiveLeverageButton(buttonValues.includes(closestSnap) ? closestSnap : 0);
    } else {
      setLeverage(value);
      // Reset active button if value is not one of the button values
      setActiveLeverageButton(buttonValues.includes(value) ? value : 0);
    }
  }
};

useEffect(() => {
    let longShortRatio;
    const THRESHOLD_BET_AMOUNT = 5000 // Replace with your threshold value
    
    const computeLongShortRatio = (long, short) => {
        const totalBetAmount = parseInt(long) + parseInt(short);
        return totalBetAmount !== 0 ? parseInt(long) / totalBetAmount : 0.5;
    };

    if (isSoliditySelected) {
        longShortRatio = computeLongShortRatio(data.solLong, data.solShort);
    } else if (isBitcoinSelected) {
        longShortRatio = computeLongShortRatio(data.btcLong, data.btcShort);
    }

    const totalBetAmount = isSoliditySelected 
        ? (parseInt(data.solLong) + parseInt(data.solShort))
        : (parseInt(data.btcLong) + parseInt(data.btcShort));

    const priceDirection = toggleState === 'LONG' ? 0 : toggleState === 'SHORT' ? 1 : -1;
    if (priceDirection === -1) {
        throw new Error("Invalid toggle state");
    }

    // Adjust longShortRatio based on the conditions in your Rust logic
    if (totalBetAmount < THRESHOLD_BET_AMOUNT) {
        longShortRatio = priceDirection === 0 ? 0.6 : 0.4;
    } else if (priceDirection === 0 && longShortRatio < 0.6) {
        longShortRatio = 0.6;
    } else if (priceDirection === 1 && longShortRatio > 0.4) {
        longShortRatio = 0.4;
    }
    
    const newMaxLeverage = getDynamicLeverage(longShortRatio, priceDirection);
    setMaxLeverage(newMaxLeverage);

    if (leverage > newMaxLeverage && newMaxLeverage > 200)
    {
    setLeverage(newMaxLeverage)
    setActiveLeverageButton(200)
  }
    
    else if (leverage > newMaxLeverage && newMaxLeverage < 200) 
      {
        const newlvg = (newMaxLeverage)
        setMaxLeverage(newlvg);
        setLeverage(newlvg);
        setActiveLeverageButton(0)
    }
    

}, [data, isSoliditySelected, isBitcoinSelected, toggleState, leverage]);



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
  
  const [localPrices, setLocalPrices] = useState(prices);


  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('priceUpdate', (updatedPrices) => {
      const newPrices = { ...prices };
  
      updatedPrices.forEach((updatedPrice) => {
          newPrices[updatedPrice.symbol] = updatedPrice.price;
  
          if (isSoliditySelected && updatedPrice.symbol === 'Crypto.SOL/USD') {
              setEMAPrice(updatedPrice.EMA);
          } else if (!isSoliditySelected && updatedPrice.symbol === 'Crypto.BTC/USD') {
              setEMAPrice(updatedPrice.EMA);
          }
      });
  
  });
  

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [isSoliditySelected]);


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

  const setToggleChangeLong = () => {
      setToggleState('LONG');
  };

  const setToggleChangeShort = () => {
      setToggleState('SHORT');
  };


  const selectTolerance = (value) => {
    setTolerance(value);
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

  const handleInputChangeProfit = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Set the sanitized value as the ProfitValue
    setProfitValue(sanitizedValue);
    setLastInput("ProfitValue");
  };

const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  setProfit(sanitizedValue);
  setLastInput("Profit");
};

useEffect(() => {
  if (lastInput === "ProfitValue") {
    let profit;
    if (toggleState === 'LONG') {
      profit = ((parseFloat(ProfitValue) - initialPrice) / initialPrice * (leverage) * parseFloat(amountValue)).toFixed(2);
    } else {
      profit = (-(parseFloat(ProfitValue) - initialPrice) / initialPrice * (leverage) * parseFloat(amountValue)).toFixed(2);
    }
    profit = isNaN(profit) ? "" : profit;
    setProfit(profit);    
  }
}, [ProfitValue, initialPrice, leverage, amountValue, toggleState]);

useEffect(() => {
  if (lastInput === "Profit") {
    let profitValue;
    if (toggleState === 'LONG') {
      profitValue = (initialPrice * (1 + (parseFloat(Profit) / (leverage * parseFloat(amountValue))))).toFixed(3);
    } else {
      profitValue = (initialPrice * (1 - (parseFloat(Profit) / (leverage * parseFloat(amountValue))))).toFixed(3);
    }
    profitValue = isNaN(profitValue) ? "" : profitValue;
    setProfitValue(profitValue);
  }
}, [Profit, initialPrice, leverage, amountValue, toggleState]);
  

  const handleInputChangeLoss = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setLossValue(sanitizedValue);
    setLastInputL("LossValue");
  };

  const handleLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
    // Add minus sign ("-") in front of the numbers to make it negative
    if (sanitizedValue !== "" && sanitizedValue !== "0" && sanitizedValue !== "0.") {
      sanitizedValue = "-" + sanitizedValue;
    }
  
    setLoss(sanitizedValue);
    setLastInputL("Loss");
  };
  

  useEffect(() => {
    if (lastInputL === "LossValue") {
      let loss;
      if (toggleState === 'LONG') {
        loss = ((parseFloat(LossValue) - initialPrice) / initialPrice * (leverage) * parseFloat(amountValue)).toFixed(2);
      } else {
        loss = (-(parseFloat(LossValue) - initialPrice) / initialPrice * (leverage) * parseFloat(amountValue)).toFixed(2);
      }
  
      // Check and adjust if loss exceeds amountValue or is positive
      loss = Math.min(Math.max(parseFloat(loss), -parseFloat(amountValue)), 0).toFixed(2);
  
      loss = isNaN(loss) ? "" : loss;
      setLoss(loss);    
    }
  }, [LossValue, initialPrice, leverage, amountValue, toggleState]);

  useEffect(() => {
    if (lastInputL === "Loss") {
        let lossValue;
        if (toggleState === 'LONG') {
            lossValue = (initialPrice * (1 + (parseFloat(Loss) / (leverage * parseFloat(amountValue))))).toFixed(3);
        } else {
            lossValue = (initialPrice * (1 - (parseFloat(Loss) / (leverage * parseFloat(amountValue))))).toFixed(3);
        }
        
        if (toggleState === 'LONG') {
          // Check for LONG
          if(parseFloat(lossValue) < Number(liquidationPrice)) {
              lossValue = Number(liquidationPrice).toFixed(3); 
          }
      } else {
          if(parseFloat(lossValue) > Number(liquidationPrice)) {
              lossValue = Number(liquidationPrice).toFixed(3); 
          }
      }

        lossValue = isNaN(lossValue) ? "" : lossValue;
        setLossValue(lossValue);
    }
}, [Loss, initialPrice, leverage, amountValue, toggleState, liquidationPrice]);

  

useEffect(() => {
  const getDisplayedPrice = () => {
    const currency = isSoliditySelected ? 'SOL' : 'BTC';
    const decimalPlaces = isSoliditySelected ? 3 : 1;

    const priceKey = `Crypto.${currency}/USD`;
    const price = prices[priceKey];

    if (price && !isNaN(price.price)) {
      const priceInUsd = price.price / 100000000 ;
      const priceDisplay = toggleState === 'LONG'
        ? ((priceInUsd * 1.0002 - priceInUsd * 1.0002 / leverage) + priceInUsd * 1.0002 * 9 / 10000).toFixed(decimalPlaces)
        : ((priceInUsd * 0.9998 + priceInUsd * 0.9998 / leverage) - priceInUsd * 0.9998 * 9 / 10000).toFixed(decimalPlaces);
        
      return `${priceDisplay}`;
    } else {
      return '-';
    }
  };

  setliquidationPrice(getDisplayedPrice());
}, [isSoliditySelected, prices, leverage, toggleState]);

useEffect(() => {
  // Check if currentItem exists
const val = parseFloat(ProfitValue)
const priceDirection = toggleState === 'LONG' ? 0 : toggleState === 'SHORT' ? 1 : -1;
if (priceDirection === -1) {
  throw new Error("Invalid toggle state");
}
// Warning handler
if (priceDirection === 0 && Number(val) <= initialPrice) {
  setWarning('Take profit price should be higher than the current price.');
} else if (priceDirection === 1 && Number(val) >= initialPrice) {
  setWarning('Take profit should be lower than the current price.');
} else {
  setWarning(null);
}},
[ProfitValue, liquidationPrice, toggleState, initialPrice]);

useEffect(() => {
// Warning handler
const val = parseFloat(LossValue);


const priceDirection = toggleState === 'LONG' ? 0 : toggleState === 'SHORT' ? 1 : -1;
if (priceDirection === -1) {
  throw new Error("Invalid toggle state");
}

if (priceDirection === 0) {
  if (Number(val) >= initialPrice) {
    setWarning('Stop Loss Price should be lower than the current price.');
  } else if (Number(val) < Number(liquidationPrice)) {
    setWarning('Stop Loss Price should be higher than the liquidation price.');
  } else {
    setWarning(null);
  }
} else if (priceDirection === 1) {
  if (Number(val) <= initialPrice) {
    setWarning('Stop Loss Price should be higher than the current price.');
  } else if (Number(val) > Number(liquidationPrice)) {
    setWarning('Stop Loss Price should be lower than the liquidation price.');
  } else {
    setWarning(null);
  }
} else {
  setWarning(null);
}}, [LossValue, initialPrice, liquidationPrice, toggleState]);


  const toggleAdditionalDiv = () => {
    setShowAdditionalDiv(!showAdditionalDiv);
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip1, setShowTooltip1] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [delay, setDelay] = useState(null);

  const handleMouseEnter = () => {
  const timer = setTimeout(() => {
    setShowTooltip(true);
  }, 500); // 1 second delay
  setDelay(timer);
};

const handleMouseLeave = () => {
  clearTimeout(delay);
  setShowTooltip(false);
};

const handleMouseEnter1 = () => {
  const timer = setTimeout(() => {
    setShowTooltip1(true);
  }, 500); // 1 second delay
  setDelay(timer);
};

const handleMouseLeave1 = () => {
  clearTimeout(delay);
  setShowTooltip1(false);
};

const handleMouseEnter2 = () => {
  const timer = setTimeout(() => {
    setShowTooltip2(true);
  }, 500); // 1 second delay
  setDelay(timer);
};

const handleMouseLeave2 = () => {
  clearTimeout(delay);
  setShowTooltip2(false);
};

const onClick = useCallback(async () => {
  if (warning) {
    console.error('Cannot open position due to warning:', warning);
    // Optionally, show a warning notification
    notify({ type: 'info', message: `Position creation prevented`, description: warning });
    return; // Exit function early
  }

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
      notify({ type: 'info', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
      return;
    }

    if (!amountValue || parseFloat(amountValue) === 0) {
      notify({ type: 'info', message: "Amount feels empty", description: "Fill the Trade Amount"});
      return;
    }


    if (parseFloat(amountValue) > balance) {
      notify({ type: 'info', message: "Insufficient balance", description: "Trade Amount is greater than the available balance" });
      return;
    }

    if (parseFloat(amountValue) > 1 || parseFloat(amountValue) < 0.05) {
      notify({ type: 'info', message: "Invalid trade amount", description: "Trade Amount should be between 0.05 and 1 SOL" });
      return;
    }

    let signature: TransactionSignature = '';
    try {
      // Get the current time and add 1 to the time number
      const now = Date.now();
      const timeNumber = Math.floor(now / 1000) % 1000000 + 1;

      const betAmount = parseFloat(amountValue) * LAMPORTS_PER_SOL;
      const stopLoss = isNaN(parseFloat(LossValue)) ? 0 : parseFloat(LossValue) * 100000000;
      const takeProfit = isNaN(parseFloat(ProfitValue)) ? 0 : parseFloat(ProfitValue) * 100000000;


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
    notify({ type: 'error', message: `Creating Trading account failed`, description: error?.message });
} } else {
  const args: CreateFutContArgs = {
    number: new BN(timeNumber),
    affiliateCode: Array.from(isInit.usedAffiliate),
    betAmount: new BN(betAmount),
    leverage: new BN(leverage),
    priceDirection: new BN(priceDirection),
    symbol: symbolCode,
    stopLossPrice: new BN(stopLoss),
    takeProfitPrice: new BN(takeProfit),
    slippagePrice: new BN (initialPrice*100000000),
    slippage: new  BN (1000),
  };
  console.log ("Opening Futures Position", "Est. Initial Price",initialPrice, "Collateral", (betAmount/LAMPORTS_PER_SOL), "Leverage", leverage, "Direction", priceDirection, "Symbol", symbolCode, "SL",stopLoss/100000000, "TP", takeProfit/100000000);

      const seedsRatio = [
        Buffer.from(new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ").toBytes()),
      ];

      const [ratioAcc] = await PublicKey.findProgramAddress(
        seedsRatio,
        PROGRAM_ID
      );

      const seedsAffil = [isInit.usedAffiliate];
  
      const [AffilAcc] = await PublicKey.findProgramAddress(
      seedsAffil,
      PROGRAM_ID
      );
      
      
      const accounts: CreateFutContAccounts = {
        playerAcc: publicKey,
        userAcc: userAcc,
        ratioAcc: ratioAcc,
        houseAcc: new PublicKey("HME9CUNgcsVZti5x1MdoBeUuo1hkGnuKMwP4xuJHQFtQ"),
        futCont: pda,
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
        createFutCont(args, accounts)
      );

      signature = await sendTransaction(transaction, connection);
      notify({ type: 'info', message: `Opening the position on chain...`, txid: signature });
      // Wait for transaction confirmation before showing the 'success' notification
      await connection.confirmTransaction(signature, 'confirmed');

    }} catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({ type: 'error', message: `Position has not been succesfully opened`, description: error?.message, txid: signature });
      return;
    }
  }, [isInit, initialPrice, balance, warning, totalBetAmount, publicKey, notify, connection, sendTransaction, , inputValue, ProfitValue, LossValue, inputValue2, leverage, amountValue, toggleState, isSoliditySelected, isBitcoinSelected]);

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



const [divHeight, setDivHeight] = useState('60vh');
const contentRef = useRef(null);

const handleInputFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
  // Disables zooming
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%'; // Add this line
};

const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
  // Enables zooming again
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = ''; // Add this line
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
};


const percentage = (((initialPrice - openingPrice) / openingPrice) * 100).toFixed(2);
const color = Number(percentage) < 0 ? 'text-red-500' : 'text-[#34c796]';
const displayedPercentage = isNaN(Number(percentage)) ? '-' : Number(percentage) < 0 ? percentage : `+${percentage}`;

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
  className="custom-scrollbar overflow-x-hidden md:h-[628px] lg:h-[calc(100vh-175px)] md:w-[330px] w-full rounded-lg  flex flex-col items-start justify-start p-4 gap-[16px] text-left text-sm text-grey-text font-poppins">
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
        Collateral Size
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
    <div className="self-stretch flex flex-row items-center justify-between">
      <div className="relative leading-[14px] inline-block max-w-[131px]">
        Leverage
      </div>
      <div className="rounded bg-layer-2 box-border w-[60.3px] h-7 flex flex-col items-center justify-center py-0 px-2 text-base border-[1px] border-solid border-layer-3">
        <div className="relative leading-[14px] font-medium text-[#a9aab7]">{leverage}X</div>
      </div>
    </div>
    <div className="self-stretch flex flex-col items-start justify-start  gap-[16px]">
              <Slider
        min={1}
        max={200}
        step={1}
        value={leverage}
        onChange={handleSliderChange}
        className="w-full"
      />
      <div className="self-stretch flex flex-row items-start justify-start gap-[8px]">
        <button 
        onClick={() => handleLeverageClick(50)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeLeverageButton === 50 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
          <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeLeverageButton === 50 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>50X</div>        </button>
        <button 
        onClick={() => handleLeverageClick(100)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeLeverageButton === 100 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
          <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeLeverageButton === 100 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>100X</div>        </button>
        <button 
        onClick={() => handleLeverageClick(150)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeLeverageButton === 150 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
          <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeLeverageButton === 150 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>150X</div>        </button>
        <button 
        onClick={() => handleLeverageClick(200)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeLeverageButton === 200 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
          <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeLeverageButton === 200 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>200X</div>        </button>
      </div>
    </div>
  </div>
  <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
    <div className="self-stretch flex flex-row items-center justify-start">
      <div className="relative leading-[14px] inline-block max-w-[250px]">
        Slippage Tolerance
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
  }`}>0.1%</div>
          
        </button>
        <button 
        onClick={() => handleButtonClick(2)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 2 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 2 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>0.3%</div>
        </button>
        <button 
        onClick={() => handleButtonClick(3)}
        className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
          activeButton === 3 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"
        }`}>
                    <div className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${activeButton === 3 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"
  }`}>0.5%</div>
        </button>
        <div 
        onClick={() => handleButtonClick(4)}
        className={`flex hover:bg-[#484c6d5b] rounded  w-[115px] h-7 ${activeButton === 4 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"}`}>
        <div className={`rounded flex flex-row w-full h-full px-2 ${activeButton === 4 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"}`}>
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
  <div className="self-stretch flex flex-col items-start justify-start gap-[8px] text-grey">
    <div className="self-stretch flex flex-row items-start justify-between text-grey-text">
    <button className="duration-300 flex items-center" onClick={toggleAdditionalDiv}>
    <span className="mr-1">Risk management</span> 
    <FaChevronUp className={`ml-2 text-slate-300 transition-transform duration-300 ${showAdditionalDiv ? '' : 'rotate-180'}`} />
  </button>


    </div>
    <div className={`w-full flex flex-row items-start justify-start gap-[8px] ${showAdditionalDiv ? '' : 'hidden'}`}>

                  <div className="flex-1 rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 border-[1px] border-solid border-layer-3 hover:bg-[#484c6d5b]">

                  <input type="text" placeholder="Take Profit"         
                  className="input3-capsule__input relative leading-[14px]"
                 value={ProfitValue ? ProfitValue  : ""}
                 onChange={handleInputChangeProfit}
                 onFocus={handleInputFocus}
                 onBlur={handleInputBlur} />
                 <span className="relative w-6 h-6 overflow-hidden shrink-0">                  <img
                    className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                    alt=""
                    src="/new/vector.svg"
                  />
                  <div className="absolute text-[17px] top-[20.83%] left-[29.5%] bg-gradient-to-b from-[#34C796] to-[#0B7A55] leading-[14px] bg-white [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                    $
                  </div></span>
                </div>

            <div className="hover:bg-[#484c6d5b] flex-1 rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 border-[1px] border-solid border-layer-3">
            <input type="text" placeholder="Profit"         
                  className="input3-capsule__input relative leading-[14px]"
                  value={Profit ? Profit : ""}
                  onChange={handleProfitChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur} />
                 <span className="relative w-6 h-6 overflow-hidden shrink-0">                  <img
                    className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                    alt=""
                    src="/new/component-9.svg"
                  /></span>
            </div>
          </div>
          <div className={`w-full flex flex-row items-start justify-start gap-[8px] ${showAdditionalDiv ? '' : 'hidden'}`}>
          <div className="flex-1 rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 border-[1px] border-solid border-layer-3 hover:bg-[#484c6d5b]">

<input type="text" placeholder="Stop Loss"         
className="input3-capsule__input relative leading-[14px] "
value={LossValue ? LossValue  : ""}
onChange={handleInputChangeLoss}
onFocus={handleInputFocus}
onBlur={handleInputBlur} />
<span className="relative w-6 h-6 overflow-hidden shrink-0">                  <img
  className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
  alt=""
  src="/new/vector.svg"
/>
<div className="absolute text-[17px] top-[20.83%] left-[29.5%] leading-[14px] font-medium bg-gradient-to-b from-[#34C796] to-[#0B7A55] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
  $
</div></span>
</div>
            <div className="hover:bg-[#484c6d5b] flex-1 rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between py-0 px-2 border-[1px] border-solid border-layer-3">
            <input type="text" placeholder="Loss"         
                  className="input3-capsule__input relative leading-[14px]"
                  value={Loss ? Loss : ""}
                  onChange={handleLossChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}/>
                 <span className="relative w-6 h-6 overflow-hidden shrink-0">                  <img
                    className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
                    alt=""
                    src="/new/component-9.svg"
                  /></span>

            </div>
          </div>  </div>
  <div className="self-stretch rounded-md flex flex-col items-start justify-start gap-[8px]">
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[120%]">Collateral Size</div>
      <div className="relative leading-[14px] font-medium text-white">
        {     isNaN(parseFloat(amountValue))
       ? '0 SOL'
      : `${(parseFloat(amountValue))} SOL`
        }
      </div>
    </div>
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Position Size</div>
      <div className="relative leading-[14px] font-medium text-white">
                  {
     isNaN((parseFloat(amountValue) - (parseFloat(amountValue) * 0.0007 * leverage))* leverage)
       ? '0 SOL'
      : `${((parseFloat(amountValue) - (parseFloat(amountValue) * 0.0007 * leverage)) * leverage).toFixed(2)} SOL`
        }
      </div>
    </div>
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Fees</div>
      <div className="relative leading-[14px] font-medium text-white">
          {
     isNaN(parseFloat(amountValue) * 0.0007 * leverage)
       ? '0 SOL'
      : `${(parseFloat(amountValue) * 0.0007 * leverage).toFixed(2)} SOL`
        }
      </div>
    </div>
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Est. Entry Price</div>
      <div className="relative leading-[14px] font-medium text-white">
          {isSoliditySelected 
    ? (prices['Crypto.SOL/USD']?.price && !isNaN(prices['Crypto.SOL/USD']?.price) 
      ? ((prices['Crypto.SOL/USD']?.price * (toggleState === 'LONG' ? 1.0002 : 0.9998)) / 100000000).toFixed(3)
      : '-')
    : (prices['Crypto.BTC/USD']?.price && !isNaN(prices['Crypto.BTC/USD']?.price)
      ? ((prices['Crypto.BTC/USD']?.price * (toggleState === 'LONG' ? 1.0002 : 0.9998)) / 100000000).toFixed(1)
      : '-')
  } USD
      </div>
    </div>
    <div className="self-stretch h-4 flex flex-row items-start justify-between">
      <div className="relative leading-[14px]">Liquidation Price</div>
      <div className="relative leading-[14px] font-medium text-white">
        {liquidationPrice} USD
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
