import { BN } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BiTimeFive } from "react-icons/bi";
import { FaChevronUp } from "react-icons/fa";
import socketIOClient from "socket.io-client";
import useUserSOLBalanceStore from "../../src/stores/useUserSOLBalanceStore";
import { useBackupOracle } from "../contexts/BackupOracle";
import { LongShortRatio } from "../out/accounts/LongShortRatio"; // Update with the correct path
import { UserAccount } from "../out/accounts/UserAccount"; // Update with the correct path
import {
  CreateBinOptAccounts,
  CreateBinOptArgs,
  createBinOpt,
} from "../out/instructions/createBinOpt";
import {
  InitializeUserAccAccounts,
  InitializeUserAccArgs,
  initializeUserAcc,
} from "../out/instructions/initializeUserAcc"; // Update with the correct path
import { PROGRAM_ID } from "../out/programId";
import { notify } from "../utils/notifications";
import TwoDigitInput from "./TwoInputDesign";

import axios from "axios";
import dynamic from "next/dynamic";
import Modal from "react-modal";
import { useFastTrade } from "../contexts/FastTradeContext";
import { usePriorityFee } from "../contexts/PriorityFee";
import { LiquidityPoolAccount } from "../out/accounts/LiquidityPoolAccount";

const HOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_HOUSE_WALLET);
const SIGNERWALLET = new PublicKey(process.env.NEXT_PUBLIC_SIGNER_WALLET);
const PDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_PDA_HOUSEWALLET);
const USDCMINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
const ASSOCIATEDTOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM);
const TOKENPROGRAM = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM);
const PUSDCMINT = new PublicKey(process.env.NEXT_PUBLIC_PUSDC_MINT);
const PSOLMINT = new PublicKey(process.env.NEXT_PUBLIC_PSOL_MINT);
const USDCPDAHOUSEWALLET = new PublicKey(process.env.NEXT_PUBLIC_USDCPDA_HOUSEWALLET);
const LONGSHORTACC = new PublicKey(process.env.NEXT_PUBLIC_LONG_SHORT_ACC);
const RATIOACC = new PublicKey(process.env.NEXT_PUBLIC_RATIO_ACC);

type TradeBarProps = {
  setParentDivHeight: (height: string) => void;
  totalBetAmount: number; // Add this line
  isBitcoinSelected: boolean;
  EMAprice: number;
  setEMAPrice: (EMAprice: number) => void; // assuming it's a function that accepts a number
  isSoliditySelected: boolean;
  selectedCryptos: { [key: string]: boolean };

  prices: { [key: string]: { price: number; timestamp: string } };
  setPrices: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { price: number; timestamp: string };
    }>
  >;
  openingPrice: number; // Add openingPrice here
  setOpeningPrice: React.Dispatch<React.SetStateAction<number>>;
  selectedCurrency: 'SOL' | 'USDC';
  setSelectedCurrency: React.Dispatch<React.SetStateAction<'SOL' | 'USDC'>>;
};

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);


async function checkLPdata(
  lpAcc: PublicKey,
  connection: Connection
): Promise<{
  IsInitialized: boolean;
  locked: boolean;
  epoch: number;
  totalDeposits: number;
  usdcTotalDeposits: number;
  usdcPnl: number;
  lpFees: number;
  pnl: number;
  cumulativeFeeRate: number;
  cumulativePnlRate: number;
}> {
  const accountInfo = await connection.getAccountInfo(lpAcc);

  if (!accountInfo) {
    return {
      IsInitialized: false,
      locked: false,
      epoch: 0,
      totalDeposits: 0,
      usdcTotalDeposits: 0,
      lpFees: 0,
      pnl: 0,
      usdcPnl: 0,
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
    usdcTotalDeposits: LpAccount.usdcTotalDeposits.toNumber(),
    lpFees: LpAccount.lpFees.toNumber(),
    pnl: LpAccount.pnl.toNumber(),
    usdcPnl: LpAccount.usdcPnl.toNumber(),

    cumulativeFeeRate: LpAccount.cumulativeFeeRate.toNumber(),
    cumulativePnlRate: LpAccount.cumulativePnlRate.toNumber(),
  };
}

async function usdcSplTokenAccountSync(walletAddress) {
  let mintAddress = USDCMINT

  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      TOKENPROGRAM.toBuffer(),
      mintAddress.toBuffer(),
    ],
    ASSOCIATEDTOKENPROGRAM
  );

  return splTokenAccount;
}

async function isUserAccountInitialized(
  account: PublicKey,
  connection: Connection
): Promise<{
  isInitialized: boolean;
  usedAffiliate: Uint8Array;
  myAffiliate: Uint8Array;
}> {
  const accountInfo = await connection.getAccountInfo(account);

  if (!accountInfo) {
    console.error("Account not found or not fetched properly.");
    // You'll need to decide on an appropriate default return here.
    return {
      isInitialized: false,
      usedAffiliate: new Uint8Array(8).fill(0),
      myAffiliate: new Uint8Array(8).fill(0),
    };
  }

  const bufferData = Buffer.from(accountInfo.data);

  let userAcc;
  try {
    userAcc = UserAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode user account data:", error);
    return {
      isInitialized: false,
      usedAffiliate: new Uint8Array(8).fill(0),
      myAffiliate: new Uint8Array(8).fill(0),
    };
  }

  return {
    isInitialized: userAcc.isInitialized,
    usedAffiliate: userAcc.usedAffiliate,
    myAffiliate: userAcc.myAffiliate,
  };
}

async function listenLongShortRatioData(
  account: PublicKey,
  connection: Connection,
  onDataReceived: (data: any) => void
): Promise<() => void> {
  const subscriptionId = connection.onAccountChange(
    account,
    async (accountInfo) => {
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
    }
  );

  // Return a function to allow unsubscribing
  return () => {
    connection.removeAccountChangeListener(subscriptionId);
  };
}

const formatOptionLabel = ({ value, label, icon }) => (
  <div className="flex items-center">
    <img src={icon} alt="Logo" width="30" height="30" />
    <span className="p-2 ml-2 text-[1.2rem]">{label}</span>
  </div>
);

const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT1;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;
const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT5;

const TradeBar: React.FC<
  TradeBarProps & { setParentDivHeight: (height: string) => void }
> = ({
  selectedCryptos,
  setOpeningPrice,
  openingPrice,
  totalBetAmount,
  isBitcoinSelected,
  prices,
  setPrices,
  setEMAPrice,
  EMAprice,
  isSoliditySelected,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [toggleState, setToggleState] = useState("LONG");
  const [activeButton, setActiveButton] = useState(1);
  const [activeSlipButton, setSlipActiveButton] = useState(3);

  const [inputValue, setInputValue] = useState(2);
  const [inputValue2, setInputValue2] = useState(0);
  const [amountValue, setAmountValue] = useState("");
  const [showTButton, setShowTButton] = useState(false);
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const usdcbalance = useUserSOLBalanceStore((s) => s.usdcBalance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const wallet = useWallet();
  const [openPrices, setopenPrices] = useState({});
  const [initialPrice, setInitialPrice] = useState(0);
  const [spreadPrice, setSpreadPrice] = useState(0);
  const [slippageTolerance, setSlippageTolerance] = useState(500); // Default to 0.1%
  const [customSlippage, setCustomSlippage] = useState("");

  const [payout, setPayout] = useState(0);

  const [modalIsOpen2, setModalIsOpen2] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'SOL' | 'USDC'>('SOL');
  const [usedAffiliate, setUsedAffiliate] = useState<Uint8Array | null>(null);
  const [data, setData] = useState({
  });
  const [isInit, setisInit] = useState<{
    isInitialized: boolean;
    usedAffiliate: Uint8Array;
    myAffiliate: Uint8Array;
  }>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { fastTradeActivated, setFastTradeActivated } = useFastTrade();
  const { isPriorityFee, setPriorityFee } = usePriorityFee();
  const { isBackupOracle, setBackupOracle } = useBackupOracle();


  const fetchcheckuserdata = async () => {
    if (!publicKey) {
      setisInit(null); // Reset the userAffiliateData if publicKey is not defined
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
    setToggleState("LONG");
  };

  const setToggleChangeShort = () => {
    setToggleState("SHORT");
  };

  const [LPdata, setLPdata] = useState<{
    IsInitialized: boolean;
    locked: boolean;
    epoch: number;
    totalDeposits: number;
    lpFees: number;
    pnl: number;
    cumulativeFeeRate: number;
    cumulativePnlRate: number;
  } | null>(null);

  useEffect(() => {
    const fetchLpstatus = async () => {
      const houseHarcodedkey = HOUSEWALLET;
      const signerWalletAccount = SIGNERWALLET;
      const seedsLpAcc = [
        Buffer.from(houseHarcodedkey.toBytes()),
        Buffer.from(signerWalletAccount.toBytes()),
      ];
      const [lpAcc] = await PublicKey.findProgramAddress(
        seedsLpAcc,
        PROGRAM_ID
      );

      // Check if the user has an affiliate code when the component mounts
      if (lpAcc) {
        const results = await checkLPdata(lpAcc, connection);
        setLPdata(results);
      }
    };

    fetchLpstatus();
  }, [connection]);

  const handleToggle = () => {
    // Update the isPriorityFee state when the toggle button is clicked
    setPriorityFee(!isPriorityFee);
  };

  const handleToggleOracle = () => {
    // Update the isPriorityFee state when the toggle button is clicked
    setBackupOracle(!isBackupOracle);
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
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.indexOf(".") + sanitizedValue.split(".")[1].length + 1
      );
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
        const accountToWatch = LONGSHORTACC;
        const initialAccountInfo =
          await connection.getAccountInfo(accountToWatch);

        if (initialAccountInfo) {
          const initialDataBuffer = Buffer.from(initialAccountInfo.data);
          if (
            initialDataBuffer.slice(0, 8).equals(LongShortRatio.discriminator)
          ) {
            const initialLongShortRatio =
              LongShortRatio.decode(initialDataBuffer);
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
    const accountToWatch = LONGSHORTACC;
    let unsubscribe;

    const fetchData = async () => {
      try {
        await listenLongShortRatioData(
          accountToWatch,
          connection,
          onDataReceived
        ).then((fn) => {
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
      expiration = inputValue * 60 * 60 + inputValue2 * 60; // Custom time in seconds
    }

    const priceDirection =
      toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
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
  }, [data, toggleState, activeButton, inputValue, inputValue2]);

  const determinePayout = (ratio, priceDirection) => {
    const minimumPayout = 1.85;
    const maximumPayout = 1.85;

    if (priceDirection === 0) {
      // Increase (Long)
      if (ratio === 0.0) {
        return maximumPayout;
      } else if (ratio === 1.0) {
        return minimumPayout;
      } else {
        return maximumPayout - (maximumPayout - minimumPayout) * ratio;
      }
    } else if (priceDirection === 1) {
      // Decrease (Short)
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

    socket.on("priceUpdate", (updatedPrices) => {
      const newPrices = { ...prices };
      const selectedCryptosSafe = selectedCryptos || {};

      const selectedCrypto = Object.keys(selectedCryptosSafe).find(
        (key) => selectedCryptosSafe[key]
      );

      updatedPrices.forEach((updatedPrice) => {
        newPrices[updatedPrice.symbol] = {
          price: updatedPrice.price,
          timestamp: updatedPrice.timestamp,
        };

        if (updatedPrice && selectedCrypto) {
          const selectedCryptoSymbol = `Crypto.${selectedCrypto.toUpperCase()}/USD`;

          if (updatedPrice.symbol === selectedCryptoSymbol) {
            setEMAPrice(updatedPrice.EMA);
          }
        }
      });

      setPrices(newPrices);
    });

    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [selectedCryptos]);

  const calculateSpreadPrice = (currentPrice, EMAprice, toggleState) => {
    let spreadRatio = 0;
    if (EMAprice > currentPrice) {
      const priceDifference = EMAprice - currentPrice;
      spreadRatio = (priceDifference * 100000) / currentPrice / 5;
    } else {
      const priceDifference = currentPrice - EMAprice;
      spreadRatio = (priceDifference * 100000) / currentPrice / 5;
    }

    // Ensure the spread doesn't exceed 0.02
    const finalSpreadRatio = Math.max(100, Math.min(spreadRatio, 200));

    // Adjust the currentPrice with the spread to get the initial price.
    const calculatedInitialPrice =
      toggleState === "LONG"
        ? (currentPrice + (currentPrice * finalSpreadRatio) / 1000000) /
          100000000
        : (currentPrice - (currentPrice * finalSpreadRatio) / 1000000) /
          100000000;

    return calculatedInitialPrice;
  };

  useEffect(() => {
    if (prices && EMAprice) {
      const currentPrice = initialPrice * 100000000;
      const selectedCryptosSafe = selectedCryptos || {};
      const selectedCrypto = Object.keys(selectedCryptosSafe).find(
        (key) => selectedCryptosSafe[key]
      );
      const decimalPlacesMapping = {
        BTC: 1, // Example: Bitcoin to 2 decimal places
        SOL: 3,
        PYTH: 3,
        BONK: 8,
        // Add more mappings as needed
      };
      const decimalPlaces =
        decimalPlacesMapping[selectedCrypto?.toUpperCase()] || 2;

      const spread = calculateSpreadPrice(currentPrice, EMAprice, toggleState);
      setSpreadPrice(parseFloat(spread.toFixed(decimalPlaces)));
    }
  }, [toggleState, prices, EMAprice, initialPrice, selectedCryptos]);

  useEffect(() => {
    // Provide a default empty object if selectedCryptos is undefined or null
    const selectedCryptosSafe = selectedCryptos || {};

    const selectedCrypto = Object.keys(selectedCryptosSafe).find(
      (key) => selectedCryptosSafe[key]
    );
    const decimalPlacesMapping = {
      BTC: 1, // Example: Bitcoin to 2 decimal places
      SOL: 3,
      PYTH: 3,
      BONK: 8,
      // Add more mappings as needed
    };
    // Get the number of decimal places for the selected crypto, defaulting to a standard value if not found
    const decimalPlaces =
      decimalPlacesMapping[selectedCrypto?.toUpperCase()] || 2;

    const newInitialPrice =
      prices?.[`Crypto.${selectedCrypto?.toUpperCase()}/USD`]?.price /
        100000000 || 0;
    setInitialPrice(parseFloat(newInitialPrice.toFixed(decimalPlaces)));
  }, [selectedCryptos, prices]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT2);

    socket.on("openingprice", (openingPrices) => {
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
    const selectedCrypto = Object.keys(selectedCryptos).find(
      (key) => selectedCryptos[key]
    );

    // Get the price for the selected cryptocurrency
    const openingPrice =
      openPrices?.[`Crypto.${selectedCrypto}/USD`] / 100000000;

    setOpeningPrice(openingPrice);
  }, [selectedCryptos, openPrices]);

  const handleToggleChange = () => {
    if (toggleState === "LONG") {
      setToggleState("SHORT");
    } else {
      setToggleState("LONG");
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
    setCustomSlippage("");
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
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.lastIndexOf(".")
      );
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

  const getPriorityFeeEstimate = async () => {
    try {
      const rpcUrl = ENDPOINT5;

      const requestData = {
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            accountKeys: ["AfjPnJz75bJiMKYeManVmPVQEGNcSaj9KeF6c5tncQEa"],
            options: {
              includeAllPriorityFeeLevels: true,
            },
          },
        ],
      };

      const response = await axios.post(rpcUrl, requestData);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = response.data;
      if (responseData.error) {
        throw new Error(
          `RPC error! Code: ${responseData.error.code}, Message: ${responseData.error.message}`
        );
      }

      return (responseData.result.priorityFeeLevels.veryHigh + 300).toFixed(0);
    } catch (error) {
      console.error("Error fetching priority fee estimate:", error);
    }
  };

  const onClick = useCallback(
    async (direction = null) => {
      const countmaxBet =
        (((LPdata?.totalDeposits + LPdata?.pnl) / 200) * 3) /
        5 /
        LAMPORTS_PER_SOL; // 0,3% maximálni pozice
      const maxBet = Math.min(10, countmaxBet);
      // if (parseFloat(amountValue) > maxBet) {
      //   notify({
      //     type: "error",
      //     message: `Position Reverted`,
      //     description: `Maximum Collateral is ${maxBet.toFixed(2)} SOL`,
      //   });
      //   return;
      // }

      // if (
      //   totalBetAmount + parseFloat(amountValue) * LAMPORTS_PER_SOL >
      //   2 * maxBet * LAMPORTS_PER_SOL
      // ) {
      //   notify({
      //     type: "error",
      //     message: `Position Reverted`,
      //     description: `Collateral limit per user is ${(2 * maxBet).toFixed(2)}`,
      //   });
      //   return;
      // }

      const cryptoSettings = {
        SOL: {
          symbolCode: 0,
          oracleAddy: "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
        },
        BTC: {
          symbolCode: 1,
          oracleAddy: "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J",
        },
        // Add more cryptocurrencies here in the same pattern
      };

      let symbolCode;
      let oracleAddy;
      const selectedCrypto = Object.keys(selectedCryptos).find(
        (key) => selectedCryptos[key]
      );

      if (selectedCrypto && cryptoSettings[selectedCrypto]) {
        symbolCode = cryptoSettings[selectedCrypto].symbolCode;
        oracleAddy = cryptoSettings[selectedCrypto].oracleAddy;
      } else {
        throw new Error("Invalid or unsupported symbol");
      }

      if (!publicKey) {
        notify({
          type: "error",
          message: `Wallet not connected`,
          description: "Connect the wallet in the top panel",
        });
        return;
      }

      if (!amountValue || parseFloat(amountValue) === 0) {
        notify({
          type: "error",
          message: "Amount feels empty",
          description: "Fill the Trade Amount",
        });
        return;
      }

      if (activeButton === 5 && inputValue === 0 && inputValue2 === 0) {
        notify({
          type: "error",
          message: "Expiration time is zero",
          description: "Change the Custom Time",
        });
        return;
      }

      // if (parseFloat(amountValue) > balance) {
      //   notify({
      //     type: "error",
      //     message: "Insufficient balance",
      //     description: "Trade Amount is greater than the available balance",
      //   });
      //   return;
      // }

      // if (parseFloat(amountValue) > 1 || parseFloat(amountValue) < 0.05) {
      //   notify({
      //     type: "info",
      //     message: "Invalid trade amount",
      //     description: "Trade Amount should be between 0.05 and 1 SOL",
      //   });
      //   return;
      // }

      const seedsAffil = [isInit.usedAffiliate];

      const [AffilAcc] = await PublicKey.findProgramAddress(
        seedsAffil,
        PROGRAM_ID
      );

      let signature: TransactionSignature = "";
      try {
        // Get the current time and add 1 to the time number
        const now = Date.now();
        const timeNumber = (Math.floor(now / 1000) % 1000000) + 1;

        const betAmount = selectedCurrency === 'USDC' ? (parseFloat(amountValue) * LAMPORTS_PER_SOL / 1000) : (parseFloat(amountValue) * LAMPORTS_PER_SOL);


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
          expiration = inputValue * 60 * 60 + inputValue2 * 60; // Custom time in seconds
        }

        const priceDirection =
          toggleState === "LONG" ? 0 : toggleState === "SHORT" ? 1 : -1;
        if (priceDirection === -1) {
          throw new Error("Invalid toggle state");
        }

        const seeds = [
          Buffer.from(publicKey.toBytes()),
          new BN(timeNumber).toArray("le", 8),
        ];

        const [pda] = await PublicKey.findProgramAddress(seeds, PROGRAM_ID);

        const seedsUser = [Buffer.from(publicKey.toBytes())];

        const [userAcc] = await PublicKey.findProgramAddress(
          seedsUser,
          PROGRAM_ID
        );



        const usedAffiliate = isInit.usedAffiliate;
        const usdc = selectedCurrency === 'USDC' ? 1 : 0;
        const backOracle = isBackupOracle === true ? 0 : 1;


        const args: CreateBinOptArgs = {
          number: new BN(timeNumber),
          affiliateCode: Array.from(usedAffiliate),
          betAmount: new BN(betAmount),
          expiration: new BN(expiration),
          priceDirection: new BN(priceDirection),
          symbol: symbolCode,
          slippagePrice: new BN(initialPrice * 100000000),
          slippage: new BN(slippageTolerance),
          backOracle: (backOracle),
          usdc: usdc,
        };
        console.log(
          "Creating Binary Option",
          "Initial Price",
          initialPrice,
          "Position Size",
          betAmount / LAMPORTS_PER_SOL,
          "Expiration Time",
          expiration,
          "Direction",
          priceDirection,
          "Symbol",
          symbolCode,
          "Slippage",
          slippageTolerance
        );

        const usdcAcc = await usdcSplTokenAccountSync(publicKey);


        if (!isInit.isInitialized) {
          try {
            const accounts: InitializeUserAccAccounts = {
              userAcc: userAcc,
              playerAcc: publicKey,
              affilAcc: AffilAcc,
              systemProgram: SystemProgram.programId,
              clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
              usdcMint: USDCMINT,
              usdcPlayerAcc: usdcAcc,
              associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
              tokenProgram: TOKENPROGRAM,
            };

            const args: InitializeUserAccArgs = {
              usedAffiliate: Array.from(isInit.usedAffiliate),
            };

            // Create a new transaction to initialize the user account and send it
            const initTransaction = new Transaction().add(
              initializeUserAcc(args, accounts)
            );
            const initSignature = await sendTransaction(
              initTransaction,
              connection
            );

            // Wait for transaction confirmation
            notify({ type: "info", message: `Creating Trading Account` });
            await connection.confirmTransaction(initSignature, "confirmed");
            fetchcheckuserdata();
            setModalIsOpen(false);
            notify({
              type: "success",
              message: `Trading account created`,
            });
          } catch (error) {
            notify({
              type: "error",
              message: `Creation Failed`,
              description: error?.message,
            });
          }
        } else {


          const accounts: CreateBinOptAccounts = {
            binOpt: new PublicKey(pda.toString()),
            playerAcc: publicKey,
            userAcc: userAcc,
            ratioAcc: RATIOACC,
            houseAcc: HOUSEWALLET,
            oracleAccount: new PublicKey(oracleAddy),
            solOracleAccount: new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
            pdaHouseAcc: PDAHOUSEWALLET,
            affilAcc: AffilAcc,
            lpAcc: new PublicKey(
              "AUURRMKsMjBK1zaMUmWyy8nCABXZDVtoucwHZBUnh3bB"
            ),
            signerWalletAccount: SIGNERWALLET,
            systemProgram: SystemProgram.programId,
            usdcMint: USDCMINT,
            usdcPlayerAcc: usdcAcc,
            usdcPdaHouseAcc: USDCPDAHOUSEWALLET,
            tokenProgram: TOKENPROGRAM,
            associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
          };

          let PRIORITY_FEE_IX;

          if (isPriorityFee) {
            const priorityfees = await getPriorityFeeEstimate();
            PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
              microLamports: priorityfees,
            });
          } else {
            PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
              microLamports: 0,
            });
          }

          const transaction = new Transaction()
            .add(createBinOpt(args, accounts))
            .add(PRIORITY_FEE_IX);

          signature = await sendTransaction(transaction, connection);
          notify({
            type: "info",
            message: `Opening Position`,
            txid: signature,
          });
          // Wait for transaction confirmation before showing the 'success' notification
          await connection.confirmTransaction(signature, "confirmed");
        }
      } catch (error: any) {
        // In case of an error, show only the 'error' notification
        notify({
          type: "error",
          message: `Position Reverted`,
          description: error?.message,
          txid: signature,
        });
        return;
      }
    },
    [
      isBackupOracle,
      selectedCurrency,
      isPriorityFee,
      LPdata,
      slippageTolerance,
      isInit,
      balance,
      initialPrice,
      totalBetAmount,
      publicKey,
      notify,
      connection,
      sendTransaction,
      activeButton,
      inputValue,
      inputValue2,
      amountValue,
      toggleState,
      selectedCryptos,
    ]
  );

  const payoutValue = (Number(amountValue) * Number(payout)).toFixed(2);

  const onClick1 = useCallback(async () => {
    const seedsUser = [Buffer.from(publicKey.toBytes())];
    const usdcAcc = await usdcSplTokenAccountSync(publicKey);
    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);
    try {
      const seedsAffil = [isInit.usedAffiliate];

      const [AffilAcc] = await PublicKey.findProgramAddress(
        seedsAffil,
        PROGRAM_ID
      );

      const accounts: InitializeUserAccAccounts = {
        userAcc: userAcc,
        playerAcc: publicKey,
        affilAcc: AffilAcc,
        systemProgram: SystemProgram.programId,
        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        usdcMint: USDCMINT,
        usdcPlayerAcc: usdcAcc,
        associatedTokenProgram: ASSOCIATEDTOKENPROGRAM,
        tokenProgram: TOKENPROGRAM,
      };

      const args: InitializeUserAccArgs = {
        usedAffiliate: Array.from(isInit.usedAffiliate),
      };

      // Create a new transaction to initialize the user account and send it
      const initTransaction = new Transaction().add(
        initializeUserAcc(args, accounts)
      );
      const initSignature = await sendTransaction(initTransaction, connection);

      // Wait for transaction confirmation
      notify({ type: "info", message: `Trying to create Trading Account` });
      await connection.confirmTransaction(initSignature, "confirmed");
      fetchcheckuserdata();
      setModalIsOpen(false);
      notify({
        type: "success",
        message: `Trading account successfully created, you can now open your position.`,
      });
    } catch (error) {
      notify({
        type: "error",
        message: `Creating Trading account failed`,
        description: error?.message,
      });
    }
  }, [isInit, publicKey]);

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

  const selectCurrencyAndCloseModal = (currency) => {
    setSelectedCurrency(currency);
    setModalIsOpen2(false);
  };

  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleModal2 = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom, // Position modal below the button
        left: rect.left,  // Align modal with the left edge of the button
      });
    }
    setModalIsOpen2(!modalIsOpen2);
  };

  const ModalDetails2 = (
    <Modal
      className="custom-scrollbar bg-layer-2 rounded-md border-[1px] border-solid border-layer-3"
      isOpen={modalIsOpen2}
      onRequestClose={() => setModalIsOpen2(false)}
      style={{
        overlay: {
          backgroundColor: "transparent",
        },
        content: {
          backgroundSize: "cover",
          position: "absolute",
          top: `${modalPosition.top + 8}px`,
          left: `${modalPosition.left - 98}px`,
        },
      }}
    >
      <div className="w-32 rounded-md bg-layer-2 text-grey-text">
        <button 
                        onClick={() => selectCurrencyAndCloseModal('SOL')}

        className="w-full rounded-t-md flex flex-row gap-2 py-1 px-2 hover:bg-[#484c6d5b]">                       <img
                className="relative w-6 h-6 overflow-hidden shrink-0"
                alt=""
                src="/coins/60x60/Sol.png"
              /> SOL   </button>
                      <button 
                                      onClick={() => selectCurrencyAndCloseModal('USDC')}

                      className="w-full rounded-b-md flex flex-row gap-2 py-1 px-2 hover:bg-[#484c6d5b]">                       <img
                className="relative w-6 h-6 overflow-hidden shrink-0"
                alt=""
                src="/coins/60x60/Usdc.png"
              /> USDC   </button>
      </div>
    </Modal>
  );

  const ModalDetails1 = (
    <Modal
      className="custom-scrollbar bg-layer-2"
      isOpen={modalIsOpen}
      onRequestClose={closeModalHandler}
      style={{
        overlay: {
          zIndex: "100",
          backgroundColor: "transparent",
          backdropFilter: "blur(5px)",
        },
        content: {
          backgroundSize: "cover",
          position: "fixed",
          width: "320px",
          height: "290px",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div className="relative rounded tradingcard">
        <div className="">
          <div className="font-poppins w-[100%] h-[100%] bg-layer-2 text-white px-5 pt-3 pb rounded text-[1rem]">
            <div className="bankGothic text-center font-semibold text-[1.5rem] text-[#F7931A]">
              DISCLAIMER{" "}
            </div>
            By opening a trading account on PopFi, I agree to the following:
            <div className="font-poppins pt-2 text-slate-300 text-[0.9rem]">
              I am lawfully allowed to access this site and use the PopFi dApp
              under the laws of the jurisdiction where I reside and am currently
              located.
            </div>
            <div className="font-poppins pt-2 text-slate-300 text-[0.9rem]">
              I will not use the PopFi dApp while located within any prohibited
              jurisdictions.
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
    <div className="custom-scrollbar overflow-x-hidden md:h-[628px] lg:h-[calc(100vh-141px)] md:w-[330px] w-full   flex flex-col items-start justify-start p-4 gap-[20px] text-left text-sm text-grey-text font-poppins">
      {ModalDetails1}
      {ModalDetails2}
      <div className="self-stretch flex flex-row items-start justify-start text-lg text-primary font-bankgothic-md-bt border-b-[1px] border-solid border-layer-3">
        <button
          onClick={setToggleChangeLong}
          className={`flex-1   h-10 flex flex-row items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
            toggleState === "LONG"
              ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-b-[2px] border-solid border-primary"
              : "text-grey long-short-button"
          }`}
        >
          <div
            className={`flex justify-center items-center h-full w-full rounded-lg ${
              toggleState === "LONG" ? "" : ""
            }`}
          >
            <div
              className={`bankGothic uppercase  ${
                toggleState === "LONG" ? "" : ""
              }`}
            >
              LONG
            </div>
          </div>
        </button>
        <button
          onClick={setToggleChangeShort}
          className={`flex-1   h-10 flex flex-row items-center justify-center py-3 px-6 transition-all duration-200 ease-in-out  ${
            toggleState === "SHORT"
              ? "flex-1 [background:linear-gradient(180deg,_rgba(255,_76,_76,_0),_rgba(255,_76,_76,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 text-short border-b-[2px] border-solid border-short"
              : "text-grey long-short-button"
          }`}
        >
          <div
            className={`bankGothic  uppercase ${
              toggleState === "SHORT" ? "" : ""
            }`}
          >
            SHORT
          </div>
        </button>
      </div>
      <div className="self-stretch h-[60px] flex flex-col items-start justify-start gap-[8px]">
        <div className="self-stretch flex flex-col items-start justify-start">
          <div className="relative leading-[14px] inline-block max-w-[131px]">
            Position Size
          </div>
          <div className="mt-[12px] self-stretch rounded-lg bg-layer-2 box-border h-[38px] flex flex-row items-center justify-between py-0 px-2 text-base text-grey  hover:bg-[#484c6d5b]">
            <input
              type="text"
              className="input-capsule__input "
              placeholder="3.00"
              value={amountValue}
              onChange={handleInputChange}
              min={0.05}
              step={0.05}
            />
            <span className="rounded-12xs flex flex-row items-center justify-start py-[7px] px-0">
              {" "}
              <button
              ref={buttonRef}
              className=" relative leading-[20px] font-medium text-grey-text text-lg flex flex-row items-center"
              onClick={toggleModal2}
            >
                            <img
                className="relative w-6 h-6 overflow-hidden shrink-0"
                alt={selectedCurrency}
                src={selectedCurrency === "SOL" ? "/coins/60x60/Sol.png" : "/coins/60x60/Usdc.png"}
              />
                          <FaChevronUp
              className={`w-[12px] h-[12px] ml-1 text-slate-300  ${modalIsOpen2 ? "" : "rotate-180"}`}
            />
            </button>
            </span>
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
                activeButton === 1
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B] w-full h-full rounded relative leading-[14px] font-medium ${
                  activeButton === 1
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                3M
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(2)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                activeButton === 2
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                  activeButton === 2
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                5M
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(3)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                activeButton === 3
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                  activeButton === 3
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                1H
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(4)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                activeButton === 4
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                  activeButton === 4
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                4H
              </div>
            </button>
            <button
              onClick={() => handleButtonClick(5)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                activeButton === 5
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                  activeButton === 5
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                <BiTimeFive />
              </div>
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
                activeSlipButton === 1
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B] w-full h-full rounded relative leading-[14px] font-medium ${
                  activeSlipButton === 1
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                0.1%
              </div>
            </button>
            <button
              onClick={() => handleButtonClick1(2)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                activeSlipButton === 2
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                  activeSlipButton === 2
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                0.3%
              </div>
            </button>
            <button
              onClick={() => handleButtonClick1(3)}
              className={`w-1/4 rounded h-7 flex flex-col items-center justify-center  box-border ${
                activeSlipButton === 3
                  ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]"
                  : "bg-layer-2"
              }`}
            >
              <div
                className={`flex justify-center items-center bg-[#0B111B]  w-full h-full rounded relative leading-[14px] font-medium ${
                  activeSlipButton === 3
                    ? "bg-[#0B111B] bg-opacity-80"
                    : "bg-opacity-0 hover:bg-[#484c6d5b]"
                }`}
              >
                0.5%
              </div>
            </button>
            <div
              onClick={() => handleButtonClick1(4)}
              className={`flex hover:bg-[#484c6d5b] rounded  w-[115px] h-7 ${activeSlipButton === 4 ? "bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px]" : "bg-layer-2"}`}
            >
              <div
                className={`rounded flex flex-row w-full h-full px-2 ${activeSlipButton === 4 ? "bg-[#0B111B] bg-opacity-80" : "bg-opacity-0 hover:bg-[#484c6d5b]"}`}
              >
                <input
                  type="text"
                  placeholder="Custom"
                  className="flex justify-center items-center input3-capsule__input relative leading-[14px]"
                  value={customSlippage}
                  onChange={handleCustomSlippageChange}
                />
                <span className="flex justify-center items-center relative w-4 h-8 overflow-hidden shrink-0">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch rounded-md flex flex-col items-start justify-start gap-[8px]">
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Priority Fees</div>
          <div className="relative leading-[14px] font-medium text-white">
            <label className="toggle-switch-bigger">
              <input
                type="checkbox"
                checked={isPriorityFee}
                // onChange={handleToggle}
                className="hidden"
              />
              <div
                className={`slider-bigger ${isPriorityFee ? "active" : ""}`}
              ></div>
            </label>
          </div>
        </div>
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Backup Oracle</div>
          <div className="relative leading-[14px] font-medium text-white">
            <label className="toggle-switch-bigger">
              <input
                type="checkbox"
                checked={isBackupOracle}
                onChange={handleToggleOracle}
                className="hidden"
              />
              <div
                className={`slider-bigger ${isPriorityFee ? "active" : ""}`}
              ></div>
            </label>
          </div>
        </div>

        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[120%]">Position Size</div>
          <div className="relative leading-[14px] font-medium text-white">
          {isNaN(parseFloat(amountValue))
      ? `0 ${selectedCurrency}`
      : `${parseFloat(amountValue)} ${selectedCurrency}`}
          </div>
        </div>
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Payout</div>
          <div className="relative leading-[14px] font-medium text-white">
          {isNaN(parseFloat(amountValue) * 1.85)
      ? `0 ${selectedCurrency}`
      : `${(parseFloat(amountValue) * 1.85).toFixed(2)} ${selectedCurrency}`}
          </div>
        </div>
        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Fees</div>
          <div className="relative leading-[14px] font-medium text-white">
          {isNaN(parseFloat(amountValue) * 0.05)
      ? `0 ${selectedCurrency}`
      : `${(parseFloat(amountValue) * 0.05).toFixed(2)} ${selectedCurrency}`}
          </div>
        </div>

        <div className="self-stretch h-4 flex flex-row items-start justify-between">
          <div className="relative leading-[14px]">Strike Price</div>
          <div className="relative leading-[14px] font-medium text-white">
            {spreadPrice} USD
          </div>
        </div>
      </div>
      {wallet.connected ? (
        <button
          onClick={onClick}
          className={`w-full rounded-lg h-[50PX] flex flex-row items-center justify-center box-border  ${
            toggleState === "LONG"
              ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-[2px] border-solid border-primary"
              : "[flex-1 [background:linear-gradient(180deg,_rgba(255,_76,_76,_0),_rgba(255,_76,_76,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 text-short border-[2px] border-solid border-short"
          }`}
        >
          <div
            className={`bankGothic bg-clip-text text-transparent uppercase text-lg ${
              toggleState === "LONG" ? "bg-primary" : "bg-short"
            }`}
          >
            OPEN POSITION
          </div>
        </button>
      ) : (
        <WalletMultiButtonDynamic
          className={`w-full rounded-lg h-[50PX] flex flex-row items-center justify-center box-border  ${
            toggleState === "LONG"
              ? "[flex-1 [background:linear-gradient(180deg,_rgba(35,_167,_123,_0),_rgba(13,_125,_87,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 border-[2px] border-solid border-primary"
              : "[flex-1 [background:linear-gradient(180deg,_rgba(255,_76,_76,_0),_rgba(255,_76,_76,_0.13))] box-border h-10 flex flex-row items-center justify-center py-3 px-6 text-short border-[2px] border-solid border-short"
          }`}
        >
          <div
            className={`bankGothic bg-clip-text text-transparent uppercase text-lg ${
              toggleState === "LONG" ? "bg-primary" : "bg-short"
            }`}
          >
            CONNECT WALLET
          </div>
        </WalletMultiButtonDynamic>
      )}
    </div>
  );
};

export default TradeBar;
