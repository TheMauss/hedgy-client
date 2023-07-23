import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { notify } from "../utils/notifications";
import {
  CreateBinaryOptionArgs,
  CreateBinaryOptionAccounts,
  createBinaryOption,
} from "../out/instructions/createBinaryOption";
import useUserSOLBalanceStore from '../../src/stores/useUserSOLBalanceStore';
import { BN } from '@project-serum/anchor';
import { PROGRAM_ID } from '../out/programId';
import TwoDigitInput from "./TwoInputDesign";
import { FaAngleUp, FaAngleDown, FaHourglassHalf } from 'react-icons/fa';
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
  const [activeButton, setActiveButton] = useState (1);
  const [inputValue, setInputValue] = useState(2);
  const [inputValue2, setInputValue2] = useState(0);
  const [amountValue, setAmountValue] = useState("");
  const [showTButton, setShowTButton] = useState(false);
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const wallet = useWallet();
  const [prices, setPrices] = useState({});

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



  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);
    if (activeButton === 5 && buttonIndex === 5) {
      // If the current activeButton is 5 and the user clicks 5 again
      setActiveButton(1); // Set activeButton to 1 to close the custom timer
    } else {
      setActiveButton(buttonIndex);
    }
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

    if (activeButton === 5 && inputValue === 0 && inputValue2 === 0) {
      notify({ type: 'error', message: "Expiration time is zero", description: "Change the Custom Time" });
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

      let expiration = 0;
      if (activeButton === 1) {
        expiration = 60; // 1 minute
      } else if (activeButton === 2) {
        expiration = 5 * 60; // 5 minutes
      } else if (activeButton === 3) {
        expiration = 60 * 60; // 1 hour
      } else if (activeButton === 4) {
        expiration = 60 * 60 * 4; // 4 hours
      } else if (activeButton === 5) {
        expiration = (inputValue * 60 * 60) + (inputValue2 * 60); // Custom time in seconds
      }

      const priceDirection = toggleState === 'PUMP' ? 0 : toggleState === 'DUMP' ? 1 : -1;
      if (priceDirection === -1) {
        throw new Error("Invalid toggle state");
      }


      const args: CreateBinaryOptionArgs = {
        number: new BN(timeNumber),
        betAmount: new BN(betAmount),
        expiration: new BN(expiration),
        priceDirection: new BN(priceDirection),
        symbol: symbolCode,
      };

      console.log('betAmount:', betAmount);
      console.log('expiration:', expiration);
      console.log('priceDirection:', priceDirection);
      console.log('symbolarg:', symbolCode);

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

      const accounts: CreateBinaryOptionAccounts = {
        playerWalletAccount: publicKey,
        houseWalletAccount: new PublicKey("DhXJ4ZVR7YM45tBtYk7MkoFcZKpBx1wskYQDzEQWLGGR"),
        binaryOption: new PublicKey(pda.toString()),
        oracleAccount: new PublicKey(oracleAddy),
        pdaHouseWalletAccount: new PublicKey("BwhuhhEdqratRFWGDSApHVgdYf11gTbNaaB6L95GTNL5"),
        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        systemProgram: SystemProgram.programId,
      };

      const transaction = new Transaction().add(
        createBinaryOption(args, accounts)
      );

      signature = await sendTransaction(transaction, connection);

      // Wait for transaction confirmation before showing the 'success' notification
      await connection.confirmTransaction(signature, 'confirmed');

    } catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({ type: 'error', message: `Option was not created`, description: error?.message, txid: signature });
      return;
    }
  }, [publicKey, notify, connection, sendTransaction, activeButton, inputValue, inputValue2, amountValue, toggleState, isSoliditySelected, isBitcoinSelected]);

const payoutValue = parseFloat((parseFloat(amountValue) * 1.8).toFixed(2));

const [divHeight, setDivHeight] = useState('60vh');
const contentRef = useRef(null);

useEffect(() => {
  const handleResize = () => {
    const contentHeight = contentRef.current.scrollHeight;
    const windowHeight = window.innerHeight * 0.6;
    const minHeight = Math.max(windowHeight, 580);
    const overflow = contentHeight > (windowHeight-50);

    if (overflow && activeButton === 5) {
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
}, [activeButton]);

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
        {!isNaN(payoutValue)} 
  <div className="w-full text-slate-300 font-semibold mt-2 relative text-[0.9rem]">
      {payoutValue ? (
    <p>Expected payout: {payoutValue.toFixed(2)} SOL</p>
  ) : (
    <p>Expected payout:</p>
  )}
  </div>

        <div className="flex items-center justify-between mt-2"></div>
      </div>
      {/* Expiration Tab */}
      <div className="w-full">
        {/* Expiration heading */}
        <h2 className="text-white font-semibold text-[1.05rem]">
          Expiration Time
        </h2>
        {/* button */}
        <div
          className=" w-full flex h-12 items-center justify-between rounded-md mt-4 overflow-hidden
              "
        >
<button
  className={`
    ${activeButton === 1 ? "bg-[#484c6d] border-b-2 border-gradient" : "bg-[#1a1a25]"} 
    w-full text-slate-300 font-semibold flex flex-col justify-center items-center border border-transparent h-full border-none outline-none
  `}
  onClick={() => handleButtonClick(1)}
>
            <span
              className="leading-none text-[0.9rem]"
              style={{ color: activeButton === 1 ? "#ffffff" : "" }}
            >
              1
            </span>
            <span
              className="leading-none text-[0.9rem] mt-0.5"
              style={{ color: activeButton === 1 ? "#ffffff" : "" }}
            >
              Min
            </span>
          </button>

          <button
            className={`${
              activeButton === 2
                ? "bg-[#484c6d] border-b-2 border-gradient" : "bg-[#1a1a25]"
            } w-full text-slate-300 font-semibold flex flex-col justify-center items-center border border-transparent h-full border-none outline-none`}
            onClick={() => handleButtonClick(2)}
          >
            <span
              className="leading-none text-[0.9rem]"
              style={{ color: activeButton === 2 ? "#ffffff" : "" }}
            >
              5
            </span>
            <span
              className="leading-none text-[0.9rem] mt-0.5"
              style={{ color: activeButton === 2 ? "#ffffff" : "" }}
            >
              Min
            </span>
          </button>

          <button
            className={`${
              activeButton === 3
                ? "bg-[#484c6d] border-b-2 border-gradient" : "bg-[#1a1a25]"
            } w-full text-slate-300 font-semibold flex flex-col justify-center items-center border border-transparent h-full border-none outline-none`}
            onClick={() => handleButtonClick(3)}
          >
            <span
              className="leading-none text-[0.9rem]"
              style={{ color: activeButton === 3 ? "#ffffff" : "" }}
            >
              1
            </span>
            <span
              className="leading-none text-[0.9rem] mt-0.5"
              style={{ color: activeButton === 3 ? "#ffffff" : "" }}
            >
              Hour
            </span>
          </button>

          <button
            className={`${
              activeButton === 4
                ? "bg-[#484c6d] border-b-2 border-gradient" : "bg-[#1a1a25]"
            } w-full text-slate-300 font-semibold flex flex-col justify-center items-center border border-transparent h-full border-none outline-none`}
            onClick={() => handleButtonClick(4)}
          >
            <span
              className="leading-none text-[0.9rem]"
              style={{ color: activeButton === 4 ? "#ffffff" : "" }}
            >
              4
            </span>
            <span
              className="leading-none text-[0.9rem] mt-0.5"
              style={{ color: activeButton === 4 ? "#ffffff" : "" }}
            >
              Hour
            </span>
          </button>

          <button
            className={`${
              activeButton === 5
                ? "bg-[#484c6d] border-b-2 border-gradient" : "bg-[#1a1a25]"
            }  w-full text-slate-300 font-semibold flex justify-center items-center border border-transparent border-none outline-none text-center h-full`}
            onClick={() => handleButtonClick(5)}
          >
            <FaHourglassHalf className=""
            style = {{ color: activeButton === 5 ? "#ffffff" : "" }}
            />
          </button>
        </div>

        {/* custom time */}
        {activeButton === 5 && (
          <div className="w-full text-slate-300 font-semibold mt-2 relative overflow-hidden text-[0.9rem]">
            <p>Custom Time</p>

            <div className="flex items-center justify-center py-1 mt-2 bg-[#1a1a25] rounded-full h-[38px]">
              <div
                className="bg-[#484c6d] text-white rounded-full w-8 h-8 flex justify-center items-center text-2xl md:pb-[6px] cursor-pointer absolute left-1 decrease-btn"
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
                className="bg-[#484c6d] text-white rounded-full w-8 h-8 flex justify-center items-center text-xl md:text-2xl md:pb-[6px] cursor-pointer absolute right-1 increase-btn"
                onClick={() =>
                  setInputValue2((prev) => (prev <= 59 ? prev + 5 : prev))
                }
              >
                +
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-full text-slate-300 font-semibold mt-3 relative text-[0.9rem] flex items-center">
  <span>Current Price: </span>
  <span className="bg-[#484c6d] text-white text-center rounded-full pt-1 pb-1 pl-2 pr-2 ml-auto ">
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
      className="custom-button mt-6 duration-300"
      onClick={onClick}
    >
      OPEN POSITION
    </button>
  ) : (
    <button
    className="custom-button mt-6 duration-300"
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
