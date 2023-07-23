import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { notify } from "../utils/notifications";
import {
  CreateFuturesContractArgs,
  CreateFuturesContractAccounts,
  createFuturesContract,
} from "../outfutures/instructions/createFuturesContract";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import { BN } from '@project-serum/anchor';
import { PROGRAM_ID } from '../outfutures/programId';
import { FaAngleUp, FaAngleDown, FaHourglassHalf, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import socketIOClient from 'socket.io-client';

type TradeBarProps = {
  onSymbolChange: (symbol: string) => void;
  setParentDivHeight: (height: string) => void;
};

const ENDPOINT = 'https://fast-tundra-88970.herokuapp.com/'

const TradeBar: React.FC<TradeBarProps & { setParentDivHeight: (height: string) => void }> = ({ onSymbolChange, setParentDivHeight }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [toggleState, setToggleState] = useState('PUMP');
  const [isSoliditySelected, setIsSoliditySelected] = useState(true);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(false);
  const [tolerance, setTolerance] = useState("0.1");
  const [inputValue, setInputValue] = useState(2);
  const [inputValue2, setInputValue2] = useState(0);
  const [amountValue, setAmountValue] = useState("");
  const [ProfitValue, setProfitValue] = useState("");
  const [LossValue, setLossValue] = useState("");
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const wallet = useWallet();
  const [prices, setPrices] = useState({});
  const [leverage, setLeverage] = useState(500);
  const [showAdditionalDiv, setShowAdditionalDiv] = useState(false);
  const [initialPrice, setInitialPrice] = useState(0);
  const [Profit, setProfit] = useState("");
  const [Loss, setLoss] = useState("");
  const [lastInput, setLastInput] = useState(null);
  const [lastInputL, setLastInputL] = useState(null);

  useEffect(() => {
    
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('priceUpdate', (updatedPrices) => {
      const newPrices = { ...prices };
      updatedPrices.forEach((updatedPrice) => {
        newPrices[updatedPrice.symbol] = updatedPrice.price;
      });

      setPrices(newPrices);
    });

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    const initialPrice = isSoliditySelected
      ? prices['Crypto.SOL/USD'] / 100000000
      : prices['Crypto.BTC/USD'] / 100000000;
  
    setInitialPrice(initialPrice);
  }, [isSoliditySelected, prices]);

  const handleToggleChange = () => {
    if (toggleState === 'PUMP') {
      setToggleState('DUMP');
    } else {
      setToggleState('PUMP');
    }
  };

  const handleSolidityClick = () => {
    setIsSoliditySelected(true);
    setIsBitcoinSelected(false);
    onSymbolChange('Crypto.SOL/USD');
  };
  
  const handleBitcoinClick = () => {
     // replace with the correct symbol for bitcoin
    setIsSoliditySelected(false);
    setIsBitcoinSelected(true);
    onSymbolChange('Crypto.BTC/USD');
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
    if (toggleState === 'PUMP') {
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
    if (toggleState === 'PUMP') {
      profitValue = (initialPrice * (1 + (parseFloat(Profit) / (leverage * parseFloat(amountValue))))).toFixed(2);
    } else {
      profitValue = (initialPrice * (1 - (parseFloat(Profit) / (leverage * parseFloat(amountValue))))).toFixed(2);
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
      if (toggleState === 'PUMP') {
        loss = ((parseFloat(LossValue) - initialPrice) / initialPrice * (leverage) * parseFloat(amountValue)).toFixed(2);
      } else {
        loss = (-(parseFloat(LossValue) - initialPrice) / initialPrice * (leverage) * parseFloat(amountValue)).toFixed(2);
      }
      loss = isNaN(loss) ? "" : loss;
      setLoss(loss);    
    }
  }, [LossValue, initialPrice, leverage, amountValue, toggleState]);
  
  useEffect(() => {
    if (lastInputL === "Loss") {
      let lossValue;
      if (toggleState === 'PUMP') {
        lossValue = (initialPrice * (1 + (parseFloat(Loss) / (leverage * parseFloat(amountValue))))).toFixed(2);
      } else {
        lossValue = (initialPrice * (1 - (parseFloat(Loss) / (leverage * parseFloat(amountValue))))).toFixed(2);
      }
      lossValue = isNaN(lossValue) ? "" : lossValue;
      setLossValue(lossValue);
    }
  }, [Loss, initialPrice, leverage, amountValue, toggleState]);
  


  

  const toggleAdditionalDiv = () => {
    setShowAdditionalDiv(!showAdditionalDiv);
  };


  const snapPoints = [1, 10, 20, 50, 100, 200, 500, 750, 1000];
  const snapRange = 50;

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);

    if (value <= 10) {
      setLeverage(value);
    } else {
      const closestSnap = snapPoints.reduce((a, b) =>
        Math.abs(b - value) < Math.abs(a - value) ? b : a
      );

      if (Math.abs(closestSnap - value) <= snapRange) {
        setLeverage(closestSnap);
      } else {
        setLeverage(value);
      }
    }
};

  const onClick = useCallback(async () => {
    let symbolCode;
    let oracleAddy;
    if (isSoliditySelected) {
      symbolCode = 0,
      oracleAddy = "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix";  // set to 0 if 'BINANCE:SOLUSDT' is selected
    } else if (isBitcoinSelected) {
      symbolCode = 1,
      oracleAddy = "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J"  // set to 1 if 'BINANCE:BTCUSDT' is selected
    } else {
      throw new Error("Invalid symbol");  // Throw error if neither of them is selected
    }

    if (!publicKey) {
      notify({ type: 'error', message: `Wallet not connected`, description: "Connect the wallet in the top panel" });
      console.log('error', `Send Transaction: Wallet not connected!`);
      return;
    }

    if (!amountValue || parseFloat(amountValue) === 0) {
      notify({ type: 'error', message: "Amount feels empty", description: "Fill the Trade Amount"});
      return;
    }


    if (parseFloat(amountValue) > balance) {
      notify({ type: 'error', message: "Insufficient balance", description: "Trade Amount is greater than the available balance" });
      return;
    }

    if (parseFloat(amountValue) > 5 || parseFloat(amountValue) < 0.05) {
      notify({ type: 'error', message: "Invalid trade amount", description: "Trade Amount should be between 0.05 and 5 SOL" });
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


      const priceDirection = toggleState === 'PUMP' ? 0 : toggleState === 'DUMP' ? 1 : -1;
      if (priceDirection === -1) {
        throw new Error("Invalid toggle state");
      }


      const args: CreateFuturesContractArgs = {
        number: new BN(timeNumber),
        betAmount: new BN(betAmount),
        leverage: new BN(leverage),
        priceDirection: new BN(priceDirection),
        symbol: symbolCode,
        stopLossPrice: new BN(stopLoss),
        takeProfitPrice: new BN(takeProfit)
      };

      console.log('betAmount:', betAmount);
      console.log('priceDirection:', priceDirection);
      console.log('symbolarg:', symbolCode);
      console.log('leverage:', leverage);
      console.log("tp",takeProfit);
      console.log("sl",stopLoss);

      const seeds = [
        Buffer.from(publicKey.toBytes()),
        new BN(timeNumber).toArray('le', 8),
      ];

      console.log(new BN(timeNumber).toArray('le', 8));

      const [pda] = await PublicKey.findProgramAddress(
        seeds,
        PROGRAM_ID
      );
      // Log the PDA in the console
      console.log("PDA:", pda.toBase58());
      console.log("OracleAddy", oracleAddy);

      const accounts: CreateFuturesContractAccounts = {
        playerWalletAccount: publicKey,
        houseWalletAccount: new PublicKey("DhXJ4ZVR7YM45tBtYk7MkoFcZKpBx1wskYQDzEQWLGGR"),
        futuresContract: new PublicKey(pda.toString()),
        oracleAccount: new PublicKey(oracleAddy),
        pdaHouseWalletAccount: new PublicKey("CvFxKTkmesQTGXPRwqqgwoaYe6BxARE2qVHKGhce68Ej"),
        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        systemProgram: SystemProgram.programId,
      };

      const transaction = new Transaction().add(
        createFuturesContract(args, accounts)
      );

      signature = await sendTransaction(transaction, connection);

      // Wait for transaction confirmation before showing the 'success' notification
      await connection.confirmTransaction(signature, 'confirmed');
      notify({ type: 'success', message: 'Option created', description: 'Your position has been opened.', txid: signature });

    } catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({ type: 'error', message: `Position has not been succesfully opened`, description: error?.message, txid: signature });
      return;
    }
  }, [publicKey, notify, connection, sendTransaction, , inputValue, ProfitValue, LossValue, inputValue2, leverage, amountValue, toggleState, isSoliditySelected, isBitcoinSelected]);


const [divHeight, setDivHeight] = useState('60vh');
const contentRef = useRef(null);

useEffect(() => {
  const handleResize = () => {
    const contentHeight = contentRef.current.scrollHeight;
    const windowHeight = window.innerHeight * 0.6;
    const minHeight = Math.max(windowHeight, 580);
    const overflow = contentHeight > (windowHeight-50);

    if (overflow) {
      const newHeight = Math.max(contentHeight, minHeight);
      setDivHeight(`${newHeight}px`),
      setParentDivHeight(`${newHeight}px`,)
    } else {
      setDivHeight(`${windowHeight}px`)
      setParentDivHeight(`${windowHeight}px`,)
    }
  };

  handleResize(); // Initial height calculation

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  return (
    <div style={{height: divHeight, minHeight: 520 }}
      className="overflow-growth w-full lg:w-[20%] 2xl:min-h-[510px] xl:min-h-[510px] lg:min-h-[510px] min-w-[315px] md:w-[315px] bg-[#232332] order-1 p-6 rounded shadow-component border-t-2 border-gray-500 xl:mt-0 md:mt-0 mt-2 "
    >
      <div ref={contentRef}>    {/* header */}
      <div className="w-full flex justify-between">
  {/* solidity usd */}
  <div
  className={`w-full cursor-pointer flex items-center justify-center gap-1 pb-2 ${
    isSoliditySelected
      ? "border-b-2 border-gradient"
      : "border-b-2 border-b-transparent"
  }`}
  onClick={handleSolidityClick}
>
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    className="mr-1"
  >
    <image
      href="/sokl.svg" // Replace with the converted SVG image file
      width="32"
      height="32"
    />
  </svg>
  <h1 className={`font-bold text-lg md:text-xl transition-colors duration-300 ease-in-out ${isSoliditySelected ? "" : "text-gray-500"}`}>SOL/USD</h1>
</div>

        {/* bitcoin usd */}
        <div
  className={`w-full cursor-pointer flex items-center justify-center gap-1 pb-2 ${
    isBitcoinSelected
      ? "border-b-2 border-gradient"
      : "border-b-2 border-b-transparent"
  }`}
  onClick={handleBitcoinClick}
>
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    className="mr-1"
  >
    
    <image
    href="/btc.svg" // Replace with the actual path to your BTC SVG image file
    width="32"
    height="32"
    style={{ fill: isBitcoinSelected ? "#FFFFFF" : "#808080" }}
  />
  </svg>  <h1 className={`font-bold text-lg md:text-xl transition-colors duration-300 ease-in-out ${isBitcoinSelected ? "" : "text-gray-500"}`}>
    BTC/USD
  </h1>
</div>

      </div>

      {/* amount tab */}
      <div className="w-full mt-2">
        {/* amount heading */}
        <h2 className="text-white font-semibold text-[1.05rem]">
          Trade Amount
        </h2>
        {wallet.connected ? (
  <div className="w-full text-slate-300 font-semibold mt-2 relative text-[0.9rem]">
    Balance: {(balance || 0).toLocaleString().replace(/,/g, '.')} SOL
  </div>
) : (
  <div className="w-full text-slate-300 font-semibold mt-2 relative text-[0.9rem]">
    Balance:
  </div>
)}
        <div className="input-capsule mt-4">
          <input
            type="text"
            className="input-capsule__input"
            placeholder="3.00"
            value={amountValue}
            onChange={handleInputChange}
            min={0.05}
            step={0.05}
          />
          <span className="input-capsule__text font-semibold">SOL</span>
        </div>
       <div className="flex items-center justify-between mt-2"></div>
      </div>
      <div className="w-full text-slate-300 font-semibold mt-3 relative text-[0.9rem] flex items-center">
  <span>Current Price: </span>
  <span className="bg-[#484c6d] hover:bg-[#484c6d5b] text-white text-center rounded-full pt-1 pb-1 pl-2 pr-2 ml-auto ">
    {isSoliditySelected 
      ? (prices['Crypto.SOL/USD'] && !isNaN(prices['Crypto.SOL/USD']) 
        ? (prices['Crypto.SOL/USD'] / 100000000).toFixed(3)
        : '-')
      : (prices['Crypto.BTC/USD'] && !isNaN(prices['Crypto.BTC/USD'])
        ? (prices['Crypto.BTC/USD'] / 100000000).toFixed(1)
        : '-')
    } USD
  </span>
</div>
      {/* Expiration Tab */}
      <div className="w-full">
        {/* Expiration heading */}
        <h2 className="text-white font-semibold text-[1.05rem]">
        <span>Leverage</span> 
</h2>
<div className="w-full mt-1 text-slate-300 font-semibold relative text-[0.9rem] flex items-center">
<span> Current Leverage: </span>  <span className="bg-[#484c6d] hover:bg-[#484c6d5b] text-white text-center rounded-full pt-1 pb-1 pl-2 pr-2 ml-auto w-[80px]">
{leverage}x
</span>
        </div>

<div className="w-full flex flex-col items-center justify-between mt-2">
<input
        type="range"
        min="1"
        max="1000"
        step="10"
        className="w-full google-range-slider" 
        value={leverage}
        onChange={handleSliderChange}
        
      />
      

</div>
</div>


<div className="w-full text-slate-300 font-semibold mt-3 relative text-[0.9rem] flex items-center">
  <span>Liquidation Price: </span>
<span className="bg-[#484c6d] hover:bg-[#484c6d5b] text-white text-center rounded-full pt-1 pb-1 pl-2 pr-2 ml-auto ">
  {toggleState === 'PUMP' ? (
    isSoliditySelected ? (
      prices['Crypto.SOL/USD'] && !isNaN(prices['Crypto.SOL/USD']) ? (
        (prices['Crypto.SOL/USD'] / 100000000 - prices['Crypto.SOL/USD'] / 100000000 / leverage).toFixed(3)
      ) : (
        '-'
      )
    ) : (
      prices['Crypto.BTC/USD'] && !isNaN(prices['Crypto.BTC/USD']) ? (
        (prices['Crypto.BTC/USD'] / 100000000 - prices['Crypto.BTC/USD'] / 100000000 / leverage).toFixed(1)
      ) : (
        '-'
      )
    )
  ) : (
    isSoliditySelected ? (
      prices['Crypto.SOL/USD'] && !isNaN(prices['Crypto.SOL/USD']) ? (
        (prices['Crypto.SOL/USD'] / 100000000 + prices['Crypto.SOL/USD'] / 100000000 / leverage).toFixed(3)
      ) : (
        '-'
      )
    ) : (
      prices['Crypto.BTC/USD'] && !isNaN(prices['Crypto.BTC/USD']) ? (
        (prices['Crypto.BTC/USD'] / 100000000 + prices['Crypto.BTC/USD'] / 100000000 / leverage).toFixed(1)
      ) : (
        '-'
      )
    )
  )} USD
</span>
</div>
<div className="w-full text-slate-300 font-semibold mt-2 relative text-[0.9rem]">
  <button className="duration-300 flex items-center" onClick={toggleAdditionalDiv}>
    <span className="mr-1">Risk management</span> 
    <FaChevronUp className={`ml-2 text-slate-300 transition-transform duration-300 ${showAdditionalDiv ? 'rotate-180' : ''}`} />
  </button>

  <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${showAdditionalDiv ? 'max-h-96' : 'max-h-0'}`}>          
    <div className="ml-0.5 mr-0.5 mt-2 flex justify-between items-center">
      <input type="text" placeholder="Take Profit Price" className="text-[#34c796] bg-[#484c6d] hover:bg-[#484c6d5b] text-white text-center rounded-full w-[47%]"
                    value={ProfitValue ? ProfitValue + " USD" : ""}
                    onChange={handleInputChangeProfit} />
      <input type="text" placeholder="Stop Loss Price" className="bg-[#484c6d] hover:bg-[#484c6d5b] text-white text-center rounded-full w-[47%]" 
                            value={LossValue ? LossValue + " USD" : ""}
                            onChange={handleInputChangeLoss} />
    </div>
    <div className="ml-0.5 mr-0.5 mt-2 flex justify-between items-center">
      <input
        type="text"
        placeholder="Profit +SOL"
        className="mb-1 bg-[#484c6d] hover:bg-[#484c6d5b] text-[#34c796] text-center rounded-full w-[47%]"
        value={Profit ? Profit + " SOL" : ""}
        onChange={handleProfitChange}
      />
      <input
        type="text"
        placeholder="Loss -SOL"
        className="mb-1 bg-[#484c6d] hover:bg-[#484c6d5b] text-red-500 text-center rounded-full w-[47%]"
        value={Loss ? Loss + " SOL" : ""}
        onChange={handleLossChange}
      />
    </div>
  </div>
</div> 
        {/* button div */}
        <div className=" mt-3">
          {/* upper button */}
          <div className="mt-3 flex justify-between items-center gap-4 font-semibold text-sm md:text-base text-white">
            <div className="toggle-button" onClick={handleToggleChange}>
              <div className="text-state">
              <>
              <FaAngleUp className="text-green-500" />
                <span>PUMP</span>
                </>
              </div>
              <div
                className="text-state"
                style={{ left: "50%" }}
              >
      <>
        <FaAngleDown className="text-red-500" />
        <span className="ml-1">DUMP</span>
      </>
              </div>
              <div
                className={`toggle-state ${
                  toggleState === "PUMP"
                    ? "bg-green-500"
                    : "bg-red-500 right-0"
                }`}
              >
                {toggleState}
              </div>
            </div>
          </div>

  {/* bottom button */}
  <div>
  {wallet.connected ? (
    <button
      className="custom-futures mt-5 duration-300"
      onClick={onClick}
    >
      OPEN POSITION
    </button>
  ) : (
    <button
    className="custom-futures mt-5 duration-300"
    onClick={onClick}    >
    CONNECT WALLET
  </button>
  )}
</div>
        </div>
      </div>
      </div> 

  );
};

export default TradeBar;
