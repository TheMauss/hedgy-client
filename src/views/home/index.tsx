import Head from "next/head";
import { BN } from "@project-serum/anchor";
import { FC, useState, useEffect, useCallback, useRef } from "react";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { notify } from "utils/notifications";
import { deposit as depositInstruction } from "../../idl/instructions"; // Update with the correct path
import "react-tooltip/dist/react-tooltip.css";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import axios from "axios";
import dynamic from "next/dynamic";
import { usePriorityFee } from "../../contexts/PriorityFee";
import { VaultDepositor, VaultDepositorJSON } from "idl/accounts";
import { Vault, VaultJSON } from "idl/accounts";
import { initializeVaultDepositor as initVaultDepositor } from "../../idl/instructions"; // Update with the correct path
import { cancelRequestWithdraw } from "../../idl/instructions"; // Update with the correct path

import { requestWithdraw } from "../../idl/instructions"; // Update with the correct path
import { withdraw } from "../../idl/instructions"; // Update with the correct path
import { Token } from "../../idl/types/WithdrawUnit";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT5;

const DRIFT_VAULTS = new PublicKey(process.env.NEXT_PUBLIC_DRIFT_VAULTS);
const VAULT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_VAULT_ADDRESS);
const VAULT_USDC_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_USDC_ADDRESS
);
const VAULT_MANAGER = new PublicKey(process.env.NEXT_PUBLIC_VAULT_MANAGER);
const TOKEN_PROGRAM = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM);
const ASSOCIATED_TOKENPROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_ASSOCIATED_TOKENPROGRAM
);
const DRIFT_STATE = new PublicKey(process.env.NEXT_PUBLIC_DRIFT_STATE);
const DRIFT_SPOT = new PublicKey(process.env.NEXT_PUBLIC_DRIFT_SPOT);
const DRIFT_SPOT_USDC = new PublicKey(process.env.NEXT_PUBLIC_DRIFT_SPOT_USDC);
const DRIFT_PROGRAM = new PublicKey(process.env.NEXT_PUBLIC_DRIFT_PROGRAM);
const USDCMINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
const RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const SYSTEM_PROGRAM = new PublicKey("11111111111111111111111111111111");
const DRIFT_SPOT_MARKET_USDC = new PublicKey(
  process.env.NEXT_PUBLIC_DRIFT_SPOT_MARKET_USDC
);
const DRIFT_SPOT_ORACLE = new PublicKey(
  process.env.NEXT_PUBLIC_DRIFT_SPOT_ORACLE
);

async function usdcSplTokenAccountSync(walletAddress) {
  const [splTokenAccount] = PublicKey.findProgramAddressSync(
    [walletAddress.toBuffer(), TOKEN_PROGRAM.toBuffer(), USDCMINT.toBuffer()],
    ASSOCIATED_TOKENPROGRAM
  );
  return splTokenAccount;
}

function getVaultDepositorAddressSync(
  programId: PublicKey,
  vault: PublicKey,
  authority: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(new TextEncoder().encode("vault_depositor")),
      vault.toBuffer(),
      authority.toBuffer(),
    ],
    programId
  )[0];
}

function encodeName(name: string): number[] {
  if (name.length > 32) {
    throw Error(`Name (${name}) longer than 32 characters`);
  }

  const buffer = Buffer.alloc(32);
  buffer.fill(name);
  buffer.fill(" ", name.length);

  return Array(...buffer);
}

function getUserStatsAccountPublicKey(
  programId: PublicKey,
  authority: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(new TextEncoder().encode("user_stats")), authority.toBuffer()],
    programId
  )[0];
}

function getUserAccountPublicKeySync(
  programId: PublicKey,
  authority: PublicKey,
  subAccountId = 0
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(new TextEncoder().encode("user")),
      authority.toBuffer(),
      Buffer.from(new Uint8Array(new BN(subAccountId).toArray("le", 2))),
    ],
    programId
  )[0];
}

async function checkVaultDepositor(
  vaultDepositor: PublicKey,
  connection: Connection
): Promise<VaultDepositorJSON | null> {
  const vaultDepositorData = await VaultDepositor.fetch(
    connection,
    vaultDepositor
  );

  if (!vaultDepositorData) {
    console.log("Vault depositor account not found.");
    return null;
  }

  return vaultDepositorData.toJSON();
}

async function checkVaultData(
  vault: PublicKey,
  connection: Connection
): Promise<VaultJSON | null> {
  const vaultData = await Vault.fetch(connection, vault);

  if (!vaultData) {
    console.log("Vault depositor account not found.");
    return null;
  }

  return vaultData.toJSON();
}

require("dotenv").config();

export const HomeView: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const usdcbalance = useUserSOLBalanceStore((s) => s.usdcBalance);
  const { getUserSOLBalance, getUserUSDCBalance } = useUserSOLBalanceStore();
  const [amount, setAmount] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [displeyAmount, setDispleyAmount] = useState("");
  const [vaultDepositor, setVaultDepositor] = useState<PublicKey | null>(null);
  const [USDCAddress, setUSDCAddress] = useState<PublicKey | null>(null);
  const [depositorData, setDepositorData] = useState<VaultDepositorJSON | null>(
    null
  );
  const [vaultData, setVaultData] = useState<VaultJSON | null>(null);
  const wallet = useWallet();
  const [waves, setWaves] = useState([]);
  const { isPriorityFee, setPriorityFee } = usePriorityFee();
  const [selectedStake, setSelectedStake] = useState<"DEPOSIT" | "WITHDRAW">(
    "DEPOSIT"
  );

  const fetchDepositorData = async () => {
    const data = await checkVaultDepositor(vaultDepositor, connection);
    setDepositorData(data);
  };

  const fetchVaultData = async () => {
    const data = await checkVaultData(VAULT_ADDRESS, connection);
    setVaultData(data);
  };

  const handleAmountClick = (type) => {
    let tokenBalance;

    if (type === "HALF" && !isNaN(Number(amount)) && Number(amount) > 0) {
      tokenBalance = Number(amount) / 2;
    } else {
      if (selectedStake === "DEPOSIT") {
        tokenBalance = type === "HALF" ? usdcbalance / 2 : usdcbalance;
        tokenBalance = tokenBalance;
      } else {
        const participantDepositTotal =
          Number(depositorData?.vaultSharesBase) *
          Number(depositorData?.vaultShares);
        console.log(depositorData?.vaultSharesBase);
        console.log(depositorData?.vaultShares);

        tokenBalance = participantDepositTotal;
      }
    }
    const maxValue = Math.max(Number(tokenBalance), 0);
    const displayMax = Math.max(Number(tokenBalance), 0).toFixed(3);

    setAmount(maxValue.toString()); // Update the state, which will update the input value reactively
    setDispleyAmount(displayMax.toString()); // Update the state, which will update the input value reactively
  };

  const formatPublicKey = (pubKey) => {
    if (!pubKey) return "";
    return `${pubKey.slice(0, 3)}...${pubKey.slice(-3)}`;
  };

  const handleWithdrawDecision = async (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newWave = {
      x,
      y,
      size,
      key: Date.now(), // Use a unique key for each wave
    };

    setWaves((prevWaves) => [...prevWaves, newWave]);

    // Remove the wave after animation ends
    setTimeout(() => {
      setWaves((prevWaves) =>
        prevWaves.filter((wave) => wave.key !== newWave.key)
      );
    }, 600);
  };

  const handleWithdrawRequest = async () => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }
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

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });

    const RequestWithdrawArgs = {
      withdrawAmount: new BN(Number(amount) * 1e6),
      withdrawUnit: new Token(),
    };

    const RequestAccounts = {
      vault: VAULT_ADDRESS,
      vaultDepositor: vaultDepositor,
      authority: publicKey,
      driftUserStats: new PublicKey(
        "GV3F3CaTj1rQnCJbHuvAF4fMXYrEBaoaB7BFRJZuZFjF"
      ),
      driftUser: new PublicKey("GfixmLMU3eGVpf3Go7A51rvdyjBnJoryNotTiqpWpoFs"),
      driftState: DRIFT_STATE,
      oracleAddress: DRIFT_SPOT_ORACLE,
      acc11: new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"), // Replace with actual account 12 PublicKey
      acc12: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 16 PublicKey
      spotMarketAddress: DRIFT_SPOT, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      acc19: new PublicKey("8UJgxaiQx5nTrdDgph5FiahMmzduuLTLf5WmsPegYA6W"), // Replace with actual account 17 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"), // Replace with actual account 18 PublicKey
      acc21: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"), // Replace with actual account 18 PublicKey
    };

    try {
      let tx = new Transaction();

      // 3. Create deposit instruction and add to transaction
      const depositIx = requestWithdraw(RequestWithdrawArgs, RequestAccounts);
      tx.add(COMPUTE_BUDGET_IX).add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Deposit transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Deposit transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Deposit transaction failed!",
        description: error.message,
      });
    }
  };

  const handleCancelRequest = async () => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }
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

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });

    const RequestArgs = {
      marketIndex: 0,
    };

    const RequestAccounts = {
      vault: VAULT_ADDRESS,
      vaultDepositor: vaultDepositor,
      authority: publicKey,
      driftUserStats: new PublicKey(
        "GV3F3CaTj1rQnCJbHuvAF4fMXYrEBaoaB7BFRJZuZFjF"
      ),
      driftUser: new PublicKey("GfixmLMU3eGVpf3Go7A51rvdyjBnJoryNotTiqpWpoFs"),
      driftState: DRIFT_STATE,
      oracleAddress: DRIFT_SPOT_ORACLE,
      acc11: new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"), // Replace with actual account 12 PublicKey
      acc12: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 16 PublicKey
      spotMarketAddress: DRIFT_SPOT, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      acc19: new PublicKey("8UJgxaiQx5nTrdDgph5FiahMmzduuLTLf5WmsPegYA6W"), // Replace with actual account 17 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"), // Replace with actual account 18 PublicKey
      acc21: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"), // Replace with actual account 18 PublicKey
    };

    try {
      let tx = new Transaction();

      // 3. Create deposit instruction and add to transaction
      const depositIx = cancelRequestWithdraw(RequestAccounts);
      tx.add(COMPUTE_BUDGET_IX).add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Deposit transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Deposit transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Deposit transaction failed!",
        description: error.message,
      });
    }
  };

  const handleDeposit = async (e) => {
    if (!publicKey || !vaultDepositor || !USDCAddress) {
      console.error(
        "Required data missing (publicKey, vaultDepositor, USDCAddress)."
      );
      return;
    }

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newWave = {
      x,
      y,
      size,
      key: Date.now(), // Use a unique key for each wave
    };

    setWaves((prevWaves) => [...prevWaves, newWave]);

    // Remove the wave after animation ends
    setTimeout(() => {
      setWaves((prevWaves) =>
        prevWaves.filter((wave) => wave.key !== newWave.key)
      );
    }, 600);
    if (!publicKey) {
      notify({ type: "error", message: "Wallet not connected!" });
      return;
    }

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

    const COMPUTE_BUDGET_IX = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });

    const depositArgs = {
      marketIndex: 0,
      amount: new BN(Number(amount) * 1e6), // Adjust precision based on the token
      reduceOnly: false,
    };

    const depositAccounts = {
      vault: VAULT_ADDRESS, // Replace with actual vault public key
      vaultDepositor: vaultDepositor, // Replace with actual depositor public key
      authority: publicKey, // User's public key (from wallet adapter)
      vaultTokenAccount: VAULT_USDC_ADDRESS, // Replace with actual vault token account
      driftUserStats: new PublicKey(
        "GV3F3CaTj1rQnCJbHuvAF4fMXYrEBaoaB7BFRJZuZFjF"
      ), // Replace with drift user stats account
      driftUser: new PublicKey("GfixmLMU3eGVpf3Go7A51rvdyjBnJoryNotTiqpWpoFs"), // Replace with drift user account
      driftState: DRIFT_STATE, // Replace with drift state account
      driftSpotMarketVault: DRIFT_SPOT_MARKET_USDC, // Replace with spot market vault account
      userTokenAccount: USDCAddress, // User's token account for depositing tokens
      driftProgram: DRIFT_PROGRAM, // Replace with actual Drift program ID
      tokenProgram: TOKEN_PROGRAM, // Standard SPL token program ID
      oracleAddress: DRIFT_SPOT_ORACLE,
      acc12: new PublicKey("5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs"), // Replace with actual account 12 PublicKey
      acc13: new PublicKey("HpMoKp3TCd3QT4MWYUKk2zCBwmhr5Df45fB6wdxYqEeh"), // Replace with actual account 13 PublicKey
      acc14: new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF"), // Replace with actual account 14 PublicKey
      acc15: new PublicKey("486kr3pmFPfTsS4aZgcsQ7kS4i9rjMsYYZup6HQNSTT4"), // Replace with actual account 15 PublicKey
      acc16: new PublicKey("6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT"), // Replace with actual account 16 PublicKey
      spotMarketAddress: DRIFT_SPOT, // Replace with actual spot market address (e.g., USDC market)
      acc17: new PublicKey("DVYXHwLhwALZm94pChALZDJ2b6a7uZTKPXntAGMQtRoM"), // Replace with actual account 17 PublicKey
      acc18: new PublicKey("GyyHYVCrZGc2AQPuvNbcP1babmU3L42ptmxZthUfD9q"), // Replace with actual account 18 PublicKey
      acc19: new PublicKey("8UJgxaiQx5nTrdDgph5FiahMmzduuLTLf5WmsPegYA6W"), // Replace with actual account 19 PublicKey
      acc20: new PublicKey("2UZMvVTBQR9yWxrEdzEQzXWE61bUjqQ5VpJAGqVb3B19"),
      acc21: new PublicKey("25Eax9W8SA3wpCQFhJEGyHhQ2NDHEshZEDzyMNtthR8D"),
    };

    try {
      let tx = new Transaction();

      // 1. Check if the vaultDepositor account exists
      const depositorInfo = await connection.getAccountInfo(vaultDepositor);

      if (!depositorInfo) {
        // 2. Initialize vaultDepositor if it doesn't exist

        const vaultAccounts = {
          vault: VAULT_ADDRESS, // Replace with actual vault public key
          vaultDepositor: vaultDepositor, // Replace with actual depositor public key
          authority: publicKey, // User's public key (from wallet adapter)
          payer: publicKey, // Replace with actual vault token account
          rent: RENT, // Replace with drift user stats account
          systemProgram: SYSTEM_PROGRAM, // Replace with drift user account                        // Standard SPL token program ID
        };
        const initVaultDepositorIx = initVaultDepositor(vaultAccounts);
        tx.add(initVaultDepositorIx);
      }

      // 3. Create deposit instruction and add to transaction
      const depositIx = depositInstruction(depositArgs, depositAccounts);
      tx.add(COMPUTE_BUDGET_IX).add(depositIx).add(PRIORITY_FEE_IX);

      // 4. Send transaction
      const signature = await sendTransaction(tx, connection);
      notify({
        type: "info",
        message: "Deposit transaction sent!",
        txid: signature,
      });

      // 5. Confirm transaction
      await connection.confirmTransaction(signature, "processed");
      notify({
        type: "success",
        message: "Deposit transaction successful!",
        txid: signature,
      });

      // Refresh user data after deposit
      setTimeout(() => {
        fetchDepositorData();
        fetchVaultData();
      }, 1200);
    } catch (error) {
      console.error(error);
      notify({
        type: "error",
        message: "Deposit transaction failed!",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
      getUserUSDCBalance(publicKey, connection);
      const Depositor = getVaultDepositorAddressSync(
        DRIFT_VAULTS,
        VAULT_ADDRESS,
        publicKey
      );
      setVaultDepositor(Depositor);
      const fetchUSDCAddress = async () => {
        if (publicKey) {
          const USDCAddy = await usdcSplTokenAccountSync(publicKey);
          setUSDCAddress(USDCAddy); // Now USDCAddy is resolved to PublicKey
        }
      };
      fetchUSDCAddress();
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connection) {
      const fetchVaultData = async () => {
        const data = await checkVaultData(VAULT_ADDRESS, connection);
        setVaultData(data);
        console.log("vault", data);
      };
      fetchVaultData();
    }
    if (vaultDepositor) {
      const fetchDepositorData = async () => {
        const data = await checkVaultDepositor(vaultDepositor, connection);
        setDepositorData(data);
        console.log("rawdata", data);
      };
      fetchDepositorData();
    }
  }, [vaultDepositor, connection]);

  const defaultImage = "/cat4.png"; // Default image
  const [profileImage, setProfileImage] = useState(defaultImage);
  const fileInputRef = useRef(null); // Reference to the file input

  // Load the saved image from local storage when the component mounts
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // Handle the file input change and update profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      // Once the file is read, save it and update the state
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const imageUrl = reader.result;
          setProfileImage(imageUrl);
          localStorage.setItem("profileImage", imageUrl); // Save the image in local storage
        }
      };

      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  };

  // Function to trigger file input click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger click on hidden file input
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(defaultImage); // Revert back to the default image
    localStorage.removeItem("profileImage"); // Remove the image from local storage
  };

  const [randomImage, setRandomImage] = useState("");

  const getRandomImageName = () => {
    // const images = ["ellipse-1@2x.png", "cat1.png", "cat4.png", "cat6.png"];
    const images = ["cat4.png"];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  useEffect(() => {
    const randomImageName = getRandomImageName();
    setRandomImage(randomImageName);
  }, []);

  // const fetchParticipantData = async () => {
  //   try {
  //     const data = await checkLotteryAccount(connection);
  //     const participant = data.participants.find(
  //       (participant) => participant.pubkey === publicKey.toString()
  //     );
  //     const data2 = await checkLotteryAccount2(connection);
  //     const participant2 = data2.participants.find(
  //       (participant2) => participant2.pubkey === publicKey.toString()
  //     );
  //     setParticipantData(participant || null);
  //     setParticipantData2(participant2 || null);
  //   } catch (error) {
  //     console.error("Error fetching lottery account data:", error);
  //   }
  // };

  // myslet na to!
  // useEffect(() => {
  //   fetchLotteryAccountData();
  // }, [connection]);

  // // myslet na to!
  // useEffect(() => {
  //   if (publicKey) {
  //     setTimeout(() => {
  //       fetchParticipantData();
  //     }, 150);
  //   }
  // }, [publicKey, connection]);

  const getPriorityFeeEstimate = async () => {
    try {
      const rpcUrl = ENDPOINT5;

      const requestData = {
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            accountKeys: [
              "StkraNY8rELLLoDHmVg8Di8DKTLbE8yAWZqRR9w413n",
              "DxD41srN8Xk9QfYjdNXF9tTnP6qQxeF2bZF8s1eN62Pe",
            ],
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

      return responseData.result.priorityFeeLevels.veryHigh.toFixed(0);
    } catch (error) {
      console.error("Error fetching priority fee estimate:", error);
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
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.lastIndexOf(".")
      );
    }

    setAmount(sanitizedValue); // Use maxValue for POOL1
    setDispleyAmount(sanitizedValue);
  };

  return (
    <div className="overflow-hidden">
      <Head>
        <title>Neutra</title>
        <meta name="description" content="" />
        <meta name="keywords" content="" /> {/* SEO keywords */}
        <meta name="author" content="" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="/" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="" />
        <meta name="twitter:description" content="" />
        <meta name="twitter:image" content="/" />
        <link rel="icon" href="/hedgehog.svg" />
      </Head>

      <div className="flex justify-center items-top min-h-[calc(100vh-172px)] z-100 bg-layer-1 ">
        <div className="w-[95%] max-w-[1550px]">
          <div className="w-full overflow-hidden text-left text-base text-neutral-06 font-gilroy-bold">
            <div
              className="lg:flex rounded-2xl w-full flex lg:flex-row flex-col lg:gap-0 md:gap-4 items-center justify-between py-2 px-6 box-border text-13xl font-gilroy-semibold"
              style={{
                backgroundImage: "url('/frame-2085660298@3x.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top",
              }}
            >
              <div className="flex flex-row items-center justify-start py-6 px-2 gap-[16px] md:rounded-2xl  lg:[backdrop-filter:blur(0px)] md:[backdrop-filter:blur(20px)] rounded-2xl">
                <div className="relative group profile-picture-container w-16 h-16">
                  {/* Display the current profile image */}
                  <img
                    className={`w-16 h-16 rounded-full object-cover cursor-pointer ${
                      profileImage === defaultImage
                        ? "drop-shadow-[0_0_20px_rgba(111,255,144,0.6)]"
                        : ""
                    }`}
                    alt="Profile"
                    src={profileImage}
                    onClick={handleImageClick} // Trigger file input when image is clicked
                  />

                  {/* Hidden file input to select new image */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef} // Attach reference to file input
                    style={{ display: "none" }} // Hide the file input
                    onChange={handleImageChange} // Handle image selection
                  />
                  {profileImage !== defaultImage && (
                    <div
                      className="absolute text-sm top-0 right-0 p-0 bg-transparent text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveImage}
                    >
                      ✕
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start justify-start gap-[4px] ">
                  <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                    JLP Hedge Bot
                  </div>

                  <div className=" text-lg tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block">
                    Maximize your JLP Yield
                  </div>
                </div>
              </div>
              <div className="lg:w-[40%] md:w-4/5 py-2 px-8 [backdrop-filter:blur(20px)] rounded-2xl bg-darkslategray-200 h-[90px] flex flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                <div className="self-stretch flex md:flex-row flex-col items-start justify-center gap-[32px] ">
                  <div className="w-1/2 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                      Pool TVL
                    </div>
                    <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                      <span></span>
                      <span className="text-lg">USDC</span>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 flex flex-row">
                    <div className="md:w-full w-1/2 flex-1 flex flex-col items-start justify-start lg:gap-[9px] gap-[4px]">
                      <div className=" tracking-[-0.03em] leading-[120.41%] opacity-[0.5]">
                        Your Deposit
                      </div>
                      <div className="self-stretch  tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold text-5xl">
                        <span></span>
                        <span className="text-lg">
                          {isNaN(Number(depositorData?.netDeposits) / 10e5)
                            ? 0
                            : (
                                Number(depositorData?.netDeposits) / 10e5
                              ).toFixed(1)}{" "}
                          USDC
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" flex md:flex-row flex-col gap-6 mt-6">
            <div className="flex flex-col gap-6 lg:w-[34%] md:w-[44%]">
              <div className=" flex-1 rounded-2xl bg-bg flex flex-col items-between justify-start py-6 px-5 md:p-6 box-border gap-[16px] text-gray-200 font-gilroy-regular">
                <div className="self-stretch rounded-lg bg-gray-100 flex flex-row items-center justify-start p-1 text-neutral-06 font-gilroy-semibold">
                  <div
                    className={`cursor-pointer flex-1 rounded-lg overflow-hidden flex flex-row items-center justify-center p-2 transition-background ${
                      selectedStake === "DEPOSIT"
                        ? "bg-bg text-white"
                        : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                    }`}
                    onClick={() => setSelectedStake("DEPOSIT")}
                  >
                    Deposit
                  </div>
                  <div
                    className={`cursor-pointer flex-1 rounded-lg flex flex-row items-center justify-center p-2 transition-background ${
                      selectedStake === "WITHDRAW"
                        ? "bg-bg text-white"
                        : "bg-gray-100 text-gray-200 hover:text-white transition-all duration-200"
                    }`}
                    onClick={() => setSelectedStake("WITHDRAW")}
                  >
                    Withdraw
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-center justify-between">
                  <div className="w-[74px] tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                    Balance
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                      {usdcbalance.toFixed(1)} USDC
                    </div>
                    {/* <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldwallet2.svg"
                      /> */}
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-center justify-between">
                  <div className="tracking-[-0.03em] leading-[100%] flex items-end h-5 shrink-0">
                    Minimum Deposit
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[8px]">
                    <div className="tracking-[-0.03em] leading-[120.41%] inline-block h-[18px] shrink-0">
                      100 USDC
                    </div>
                    {/* <img
                        className="w-4 h-4"
                        alt=""
                        src="/vuesaxboldwallet2.svg"
                      /> */}
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start justify-start text-sm">
                  <div className="self-stretch rounded-2xl bg-gray-100 flex flex-row items-center justify-between gap-[2] p-4 box-border">
                    <div className="flex flex-col items-start justify-center gap-[8px]">
                      <div className="tracking-[-0.03em] leading-[120.41%]">
                        You are{" "}
                        {selectedStake === "DEPOSIT"
                          ? "depositing"
                          : "withdrawing"}
                      </div>
                      <div className="rounded-lg overflow-hidden flex flex-row items-center justify-center gap-[10.3px] text-lg text-neutral-06 font-gilroy-semibold">
                        <img
                          className="w-8 rounded-981xl h-8 overflow-hidden shrink-0 object-cover"
                          alt=""
                          src="/paypal.svg"
                        />
                        <div className="tracking-[-0.21px]">USDC</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end gap-1">
                      <div className="flex flew-row gap-2">
                        <div
                          className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-50 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary"
                          onClick={() => handleAmountClick("HALF")}
                        >
                          <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center">
                            HALF
                          </div>
                        </div>
                        <div
                          className="cursor-pointer rounded-lg bg-mediumspringgreen-50 hover:opacity-50 transition-all duration-200 ease-in-out flex flex-row items-center justify-center py-1 px-2 text-sm text-primary"
                          onClick={() => handleAmountClick("MAX")}
                        >
                          <div className="mt-0.5 leading-[120%] inline-block h-3.5 flex justify-center items-center">
                            MAX
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        className="w-full input-capsule__input text-13xl tracking-[-0.03em] leading-[120.41%] font-gilroy-semibold bg-black"
                        placeholder="0.00"
                        value={displeyAmount}
                        onChange={handleInputChange}
                        min={0.05}
                        step={0.05}
                      />
                    </div>
                  </div>{" "}
                </div>
                <>
                  {!publicKey ? (
                    <div className="flex justify-center items-center w-full h-[50px] rounded-lg bg-primary cursor-pointer font-semibold text-center text-lg text-black transition ease-in-out duration-300">
                      <WalletMultiButtonDynamic
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                        className="mt-0.5 w-[100%]"
                      >
                        CONNECT WALLET
                      </WalletMultiButtonDynamic>
                    </div>
                  ) : (
                    <>
                      {selectedStake === "DEPOSIT" ? (
                        <button
                          className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                          onClick={handleDeposit}
                        >
                          <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                            Deposit
                          </div>
                        </button>
                      ) : selectedStake === "WITHDRAW" ? (
                        depositorData &&
                        Number(depositorData?.lastWithdrawRequest.value) > 0 &&
                        Number(depositorData?.lastWithdrawRequest.ts) >
                          Date.now() / 1000000 ? (
                          <div className="self-stretch rounded-lg bg-gray-100 p-4 flex flex-col items-center justify-center gap-2">
                            <div className="text-lg text-primary">
                              You are withdrawing{" "}
                              {Number(
                                depositorData?.lastWithdrawRequest.value
                              ) / 10e5}{" "}
                              USDC
                            </div>
                            <button
                              className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-red-500 h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                              onClick={handleCancelRequest}
                            >
                              <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                                Cancel Request
                              </div>
                            </button>
                          </div>
                        ) : (
                          <button
                            className="button-wrapper hover:opacity-70 transition ease-in-out duration-300 cursor-pointer self-stretch rounded-lg bg-primary h-12 flex flex-row items-center justify-center p-2 box-border opacity-1 text-lg text-bg font-gilroy-semibold"
                            onClick={handleWithdrawRequest}
                          >
                            <div className="mt-0.5 tracking-[-0.03em] leading-[120.41%]">
                              Withdraw
                            </div>
                          </button>
                        )
                      ) : null}
                    </>
                  )}
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
